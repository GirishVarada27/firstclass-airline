import express from 'express'
import { pool } from '../db.js'
import { requireAuth } from '../middleware/require-auth.js'
import { optionalAuth } from '../middleware/optional-auth.js'

const router = express.Router()

function nightsBetween(checkIn, checkOut) {
  const ms = new Date(checkOut) - new Date(checkIn)
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)))
}

router.post('/', optionalAuth, async (req, res, next) => {
  const { hotelId, checkIn, checkOut, rooms, guestName, guestEmail, guestPhone } = req.body

  if (!hotelId || !checkIn || !checkOut || !rooms || rooms < 1) {
    return res.status(400).json({ error: 'hotelId, checkIn, checkOut and rooms are required' })
  }
  if (!guestName || !guestEmail) {
    return res.status(400).json({ error: 'Name and email are required' })
  }
  if (new Date(checkOut) <= new Date(checkIn)) {
    return res.status(400).json({ error: 'checkOut must be after checkIn' })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const { rows } = await client.query('SELECT * FROM hotels WHERE id = $1 FOR UPDATE', [hotelId])
    const hotel = rows[0]
    if (!hotel) {
      await client.query('ROLLBACK')
      return res.status(404).json({ error: 'Hotel not found' })
    }
    if (hotel.rooms_available < rooms) {
      await client.query('ROLLBACK')
      return res.status(409).json({ error: `Only ${hotel.rooms_available} rooms left at this hotel` })
    }

    const nights = nightsBetween(checkIn, checkOut)
    const totalPrice = Number(hotel.price_per_night) * rooms * nights

    await client.query('UPDATE hotels SET rooms_available = rooms_available - $1 WHERE id = $2', [rooms, hotelId])
    const { rows: bookingRows } = await client.query(
      `INSERT INTO hotel_bookings (hotel_id, user_id, guest_name, guest_email, guest_phone, check_in, check_out, rooms, total_price)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [hotelId, req.user?.id ?? null, guestName, guestEmail, guestPhone ?? null, checkIn, checkOut, rooms, totalPrice]
    )

    await client.query('COMMIT')
    res.status(201).json(bookingRows[0])
  } catch (err) {
    await client.query('ROLLBACK')
    next(err)
  } finally {
    client.release()
  }
})

router.get('/mine', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT hb.*, h.name AS hotel_name, h.city, h.country, h.star_rating
       FROM hotel_bookings hb
       JOIN hotels h ON h.id = hb.hotel_id
       WHERE hb.user_id = $1
       ORDER BY hb.created_at DESC`,
      [req.user.id]
    )
    res.json(rows)
  } catch (err) {
    next(err)
  }
})

router.post('/:id/cancel', requireAuth, async (req, res, next) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { rows } = await client.query(
      'SELECT * FROM hotel_bookings WHERE id = $1 AND user_id = $2 FOR UPDATE',
      [req.params.id, req.user.id]
    )
    const booking = rows[0]
    if (!booking) {
      await client.query('ROLLBACK')
      return res.status(404).json({ error: 'Booking not found' })
    }
    if (booking.status !== 'cancelled') {
      await client.query('UPDATE hotel_bookings SET status = $1 WHERE id = $2', ['cancelled', booking.id])
      await client.query('UPDATE hotels SET rooms_available = rooms_available + $1 WHERE id = $2', [booking.rooms, booking.hotel_id])
    }
    await client.query('COMMIT')
    res.json({ success: true })
  } catch (err) {
    await client.query('ROLLBACK')
    next(err)
  } finally {
    client.release()
  }
})

export default router
