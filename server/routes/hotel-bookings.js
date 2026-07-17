import express from 'express'
import { pool } from '../db.js'
import { requireAuth } from '../middleware/require-auth.js'
import { optionalAuth } from '../middleware/optional-auth.js'
import { bookHotel } from '../services/bookings.js'

const router = express.Router()

router.post('/', optionalAuth, async (req, res, next) => {
  const { hotelId, checkIn, checkOut, rooms, guestName, guestEmail, guestPhone } = req.body

  if (!guestName || !guestEmail) {
    return res.status(400).json({ error: 'Name and email are required' })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { booking } = await bookHotel(client, {
      hotelId, checkIn, checkOut, rooms, userId: req.user?.id ?? null, guestName, guestEmail, guestPhone,
    })
    await client.query('COMMIT')
    res.status(201).json(booking)
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
