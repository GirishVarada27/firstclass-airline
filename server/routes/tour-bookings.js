import express from 'express'
import { pool } from '../db.js'
import { requireAuth } from '../middleware/require-auth.js'
import { optionalAuth } from '../middleware/optional-auth.js'

const router = express.Router()

router.post('/', optionalAuth, async (req, res, next) => {
  const { tourId, tourDate, participants, guestName, guestEmail, guestPhone } = req.body

  if (!tourId || !tourDate || !participants || participants < 1) {
    return res.status(400).json({ error: 'tourId, tourDate and participants are required' })
  }
  if (!guestName || !guestEmail) {
    return res.status(400).json({ error: 'Name and email are required' })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const { rows } = await client.query('SELECT * FROM tours WHERE id = $1 FOR UPDATE', [tourId])
    const tour = rows[0]
    if (!tour) {
      await client.query('ROLLBACK')
      return res.status(404).json({ error: 'Tour not found' })
    }
    if (tour.spots_available < participants) {
      await client.query('ROLLBACK')
      return res.status(409).json({ error: `Only ${tour.spots_available} spots left on this tour` })
    }

    const totalPrice = Number(tour.price_per_person) * participants

    await client.query('UPDATE tours SET spots_available = spots_available - $1 WHERE id = $2', [participants, tourId])
    const { rows: bookingRows } = await client.query(
      `INSERT INTO tour_bookings (tour_id, user_id, guest_name, guest_email, guest_phone, tour_date, participants, total_price)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [tourId, req.user?.id ?? null, guestName, guestEmail, guestPhone ?? null, tourDate, participants, totalPrice]
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
      `SELECT tb.*, t.title, t.city, t.country
       FROM tour_bookings tb
       JOIN tours t ON t.id = tb.tour_id
       WHERE tb.user_id = $1
       ORDER BY tb.created_at DESC`,
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
      'SELECT * FROM tour_bookings WHERE id = $1 AND user_id = $2 FOR UPDATE',
      [req.params.id, req.user.id]
    )
    const booking = rows[0]
    if (!booking) {
      await client.query('ROLLBACK')
      return res.status(404).json({ error: 'Booking not found' })
    }
    if (booking.status !== 'cancelled') {
      await client.query('UPDATE tour_bookings SET status = $1 WHERE id = $2', ['cancelled', booking.id])
      await client.query('UPDATE tours SET spots_available = spots_available + $1 WHERE id = $2', [booking.participants, booking.tour_id])
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
