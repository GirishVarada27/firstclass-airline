import express from 'express'
import { pool } from '../db.js'
import { requireAuth } from '../middleware/require-auth.js'
import { optionalAuth } from '../middleware/optional-auth.js'

const router = express.Router()

router.post('/', optionalAuth, async (req, res, next) => {
  const { flightId, passengers, guestName, guestEmail, guestPhone } = req.body

  if (!flightId || !passengers || passengers < 1) {
    return res.status(400).json({ error: 'flightId and passengers are required' })
  }
  if (!guestName || !guestEmail) {
    return res.status(400).json({ error: 'Name and email are required' })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const { rows } = await client.query('SELECT * FROM flights WHERE id = $1 FOR UPDATE', [flightId])
    const flight = rows[0]
    if (!flight) {
      await client.query('ROLLBACK')
      return res.status(404).json({ error: 'Flight not found' })
    }
    if (flight.seats_available < passengers) {
      await client.query('ROLLBACK')
      return res.status(409).json({ error: `Only ${flight.seats_available} seats left on this flight` })
    }

    const totalPrice = Number(flight.price) * passengers

    await client.query('UPDATE flights SET seats_available = seats_available - $1 WHERE id = $2', [passengers, flightId])
    const { rows: bookingRows } = await client.query(
      `INSERT INTO flight_bookings (flight_id, user_id, guest_name, guest_email, guest_phone, passengers, total_price)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [flightId, req.user?.id ?? null, guestName, guestEmail, guestPhone ?? null, passengers, totalPrice]
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
      `SELECT fb.*, f.flight_number, f.airline, f.origin_city, f.destination_city,
              f.departure_date, f.departure_time, f.cabin_class
       FROM flight_bookings fb
       JOIN flights f ON f.id = fb.flight_id
       WHERE fb.user_id = $1
       ORDER BY fb.created_at DESC`,
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
      'SELECT * FROM flight_bookings WHERE id = $1 AND user_id = $2 FOR UPDATE',
      [req.params.id, req.user.id]
    )
    const booking = rows[0]
    if (!booking) {
      await client.query('ROLLBACK')
      return res.status(404).json({ error: 'Booking not found' })
    }
    if (booking.status !== 'cancelled') {
      await client.query(
        'UPDATE flight_bookings SET status = $1 WHERE id = $2',
        ['cancelled', booking.id]
      )
      await client.query(
        'UPDATE flights SET seats_available = seats_available + $1 WHERE id = $2',
        [booking.passengers, booking.flight_id]
      )
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
