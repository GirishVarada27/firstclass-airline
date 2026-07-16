import express from 'express'
import { pool } from '../db.js'

const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const { city } = req.query
    if (city) {
      const { rows } = await pool.query(
        'SELECT * FROM tours WHERE city ILIKE $1 ORDER BY price_per_person',
        [`%${city}%`]
      )
      return res.json(rows)
    }
    const { rows } = await pool.query('SELECT * FROM tours ORDER BY city')
    res.json(rows)
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM tours WHERE id = $1', [req.params.id])
    if (!rows[0]) return res.status(404).json({ error: 'Tour not found' })
    res.json(rows[0])
  } catch (err) {
    next(err)
  }
})

export default router
