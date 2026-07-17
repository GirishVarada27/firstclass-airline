import express from 'express'
import { pool } from '../db.js'
import { requireAuth } from '../middleware/require-auth.js'
import { bookFlight, bookHotel, bookTour } from '../services/bookings.js'

const router = express.Router()

const REF_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0/O or 1/I to avoid ambiguity

function generateReferenceCode(length = 6) {
  let code = ''
  for (let i = 0; i < length; i++) {
    code += REF_CHARS[Math.floor(Math.random() * REF_CHARS.length)]
  }
  return code
}

function validatePayment(payment) {
  if (!payment) return 'Payment details are required'

  const digits = (payment.cardNumber || '').replace(/\s+/g, '')
  if (!/^\d{13,19}$/.test(digits)) return 'Enter a valid card number'

  const expiryMatch = /^(\d{2})\s*\/\s*(\d{2})$/.exec(payment.expiry || '')
  if (!expiryMatch) return 'Enter expiry as MM/YY'
  const month = Number(expiryMatch[1])
  const year = 2000 + Number(expiryMatch[2])
  if (month < 1 || month > 12) return 'Enter a valid expiry month'
  const expiryDate = new Date(year, month) // first day of the month after expiry
  if (expiryDate <= new Date()) return 'This card has expired'

  if (!/^\d{3,4}$/.test(payment.cvv || '')) return 'Enter a valid CVV'
  if (!payment.cardHolder || !payment.cardHolder.trim()) return 'Cardholder name is required'

  return null
}

router.post('/', requireAuth, async (req, res, next) => {
  const { category, customerName, customerEmail, customerPhone, payment } = req.body

  if (!['flight', 'hotel', 'tour'].includes(category)) {
    return res.status(400).json({ error: 'category must be flight, hotel, or tour' })
  }
  if (!customerName || !customerEmail) {
    return res.status(400).json({ error: 'Customer name and email are required' })
  }

  const paymentError = validatePayment(payment)
  if (paymentError) {
    return res.status(402).json({ error: paymentError })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    let bookingColumn
    let details
    let totalPrice

    if (category === 'flight') {
      const { flightId, passengers } = req.body
      const { booking, resource } = await bookFlight(client, {
        flightId, passengers, userId: req.user.id,
        guestName: customerName, guestEmail: customerEmail, guestPhone: customerPhone,
      })
      bookingColumn = { flight_booking_id: booking.id }
      totalPrice = Number(booking.total_price)
      details = {
        flightNumber: resource.flight_number,
        airline: resource.airline,
        originCity: resource.origin_city,
        originCode: resource.origin_code,
        destinationCity: resource.destination_city,
        destinationCode: resource.destination_code,
        departureDate: resource.departure_date,
        departureTime: resource.departure_time,
        arrivalTime: resource.arrival_time,
        cabinClass: resource.cabin_class,
        international: resource.international,
        unitPrice: Number(resource.price),
        quantity: booking.passengers,
        quantityLabel: 'passenger',
      }
    } else if (category === 'hotel') {
      const { hotelId, checkIn, checkOut, rooms } = req.body
      const { booking, resource, nights } = await bookHotel(client, {
        hotelId, checkIn, checkOut, rooms, userId: req.user.id,
        guestName: customerName, guestEmail: customerEmail, guestPhone: customerPhone,
      })
      bookingColumn = { hotel_booking_id: booking.id }
      totalPrice = Number(booking.total_price)
      details = {
        hotelName: resource.name,
        city: resource.city,
        country: resource.country,
        starRating: resource.star_rating,
        checkIn: booking.check_in,
        checkOut: booking.check_out,
        nights,
        unitPrice: Number(resource.price_per_night),
        quantity: booking.rooms,
        quantityLabel: 'room',
      }
    } else {
      const { tourId, tourDate, participants } = req.body
      const { booking, resource } = await bookTour(client, {
        tourId, tourDate, participants, userId: req.user.id,
        guestName: customerName, guestEmail: customerEmail, guestPhone: customerPhone,
      })
      bookingColumn = { tour_booking_id: booking.id }
      totalPrice = Number(booking.total_price)
      details = {
        title: resource.title,
        city: resource.city,
        country: resource.country,
        tourDate: booking.tour_date,
        durationHours: Number(resource.duration_hours),
        unitPrice: Number(resource.price_per_person),
        quantity: booking.participants,
        quantityLabel: 'participant',
      }
    }

    const { rows: seqRows } = await client.query("SELECT nextval('order_number_seq') AS n")
    const orderNumber = `FC-${seqRows[0].n}`
    const referenceNumber = generateReferenceCode()
    const cardDigits = payment.cardNumber.replace(/\s+/g, '')
    const cardLast4 = cardDigits.slice(-4)

    const columnNames = ['flight_booking_id', 'hotel_booking_id', 'tour_booking_id']
    const columnValues = columnNames.map((c) => bookingColumn[c] ?? null)

    const { rows: orderRows } = await client.query(
      `INSERT INTO orders (
         order_number, reference_number, user_id, category,
         flight_booking_id, hotel_booking_id, tour_booking_id,
         customer_name, customer_email, customer_phone,
         details, total_amount, payment_status, payment_method, card_last4, card_holder
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'paid','card',$13,$14)
       RETURNING *`,
      [
        orderNumber, referenceNumber, req.user.id, category,
        ...columnValues,
        customerName, customerEmail, customerPhone ?? null,
        details, totalPrice, cardLast4, payment.cardHolder,
      ]
    )

    await client.query('COMMIT')
    res.status(201).json(orderRows[0])
  } catch (err) {
    await client.query('ROLLBACK')
    if (err.status) return res.status(err.status).json({ error: err.message })
    next(err)
  } finally {
    client.release()
  }
})

router.get('/mine', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY order_date DESC',
      [req.user.id]
    )
    res.json(rows)
  } catch (err) {
    next(err)
  }
})

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Order not found' })
    res.json(rows[0])
  } catch (err) {
    next(err)
  }
})

export default router
