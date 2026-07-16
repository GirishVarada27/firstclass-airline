import express from 'express'
import { pool } from '../db.js'

const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const { origin, destination, date, international } = req.query
    const conditions = []
    const values = []

    if (origin) {
      values.push(`%${origin}%`)
      conditions.push(`origin_city ILIKE $${values.length}`)
    }
    if (destination) {
      values.push(`%${destination}%`)
      conditions.push(`destination_city ILIKE $${values.length}`)
    }
    if (date) {
      values.push(date)
      conditions.push(`departure_date = $${values.length}`)
    }
    if (international === 'true') {
      conditions.push('international = true')
    } else if (international === 'false') {
      conditions.push('international = false')
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    const { rows } = await pool.query(
      `SELECT * FROM flights ${where} ORDER BY departure_date, price`,
      values
    )
    res.json(rows)
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM flights WHERE id = $1', [req.params.id])
    if (!rows[0]) return res.status(404).json({ error: 'Flight not found' })
    res.json(rows[0])
  } catch (err) {
    next(err)
  }
})

export default router
