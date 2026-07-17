import 'dotenv/config'
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { toNodeHandler } from 'better-auth/node'
import { auth } from './auth.js'
import { initDb } from './db/init.js'
import flightsRouter from './routes/flights.js'
import flightBookingsRouter from './routes/flight-bookings.js'
import hotelsRouter from './routes/hotels.js'
import hotelBookingsRouter from './routes/hotel-bookings.js'
import toursRouter from './routes/tours.js'
import tourBookingsRouter from './routes/tour-bookings.js'
import ordersRouter from './routes/orders.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distPath = path.join(__dirname, '..', 'dist')

const app = express()

// Better Auth parses its own request body, so it must be mounted before express.json().
app.all('/api/auth/*splat', toNodeHandler(auth))

app.use(express.json())

app.use('/api/flights', flightsRouter)
app.use('/api/flight-bookings', flightBookingsRouter)
app.use('/api/hotels', hotelsRouter)
app.use('/api/hotel-bookings', hotelBookingsRouter)
app.use('/api/tours', toursRouter)
app.use('/api/tour-bookings', tourBookingsRouter)
app.use('/api/orders', ordersRouter)

app.use((err, req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

app.use(express.static(distPath))
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

const PORT = process.env.PORT || 3000

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err)
    process.exit(1)
  })
