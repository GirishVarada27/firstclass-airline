function httpError(status, message) {
  return Object.assign(new Error(message), { status })
}

function nightsBetween(checkIn, checkOut) {
  const ms = new Date(checkOut) - new Date(checkIn)
  return ms > 0 ? Math.round(ms / (1000 * 60 * 60 * 24)) : 0
}

// Each function must run inside an already-open transaction (client has issued BEGIN).
// They lock the resource row, check capacity, decrement it, and insert the booking.

export async function bookFlight(client, { flightId, passengers, userId, guestName, guestEmail, guestPhone }) {
  if (!flightId || !passengers || passengers < 1) {
    throw httpError(400, 'flightId and passengers are required')
  }

  const { rows } = await client.query('SELECT * FROM flights WHERE id = $1 FOR UPDATE', [flightId])
  const flight = rows[0]
  if (!flight) throw httpError(404, 'Flight not found')
  if (flight.seats_available < passengers) {
    throw httpError(409, `Only ${flight.seats_available} seats left on this flight`)
  }

  const totalPrice = Number(flight.price) * passengers

  await client.query('UPDATE flights SET seats_available = seats_available - $1 WHERE id = $2', [passengers, flightId])
  const { rows: bookingRows } = await client.query(
    `INSERT INTO flight_bookings (flight_id, user_id, guest_name, guest_email, guest_phone, passengers, total_price)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [flightId, userId ?? null, guestName, guestEmail, guestPhone ?? null, passengers, totalPrice]
  )

  return { booking: bookingRows[0], resource: flight, totalPrice }
}

export async function bookHotel(client, { hotelId, checkIn, checkOut, rooms, userId, guestName, guestEmail, guestPhone }) {
  if (!hotelId || !checkIn || !checkOut || !rooms || rooms < 1) {
    throw httpError(400, 'hotelId, checkIn, checkOut and rooms are required')
  }
  if (new Date(checkOut) <= new Date(checkIn)) {
    throw httpError(400, 'checkOut must be after checkIn')
  }

  const { rows } = await client.query('SELECT * FROM hotels WHERE id = $1 FOR UPDATE', [hotelId])
  const hotel = rows[0]
  if (!hotel) throw httpError(404, 'Hotel not found')
  if (hotel.rooms_available < rooms) {
    throw httpError(409, `Only ${hotel.rooms_available} rooms left at this hotel`)
  }

  const nights = nightsBetween(checkIn, checkOut)
  const totalPrice = Number(hotel.price_per_night) * rooms * nights

  await client.query('UPDATE hotels SET rooms_available = rooms_available - $1 WHERE id = $2', [rooms, hotelId])
  const { rows: bookingRows } = await client.query(
    `INSERT INTO hotel_bookings (hotel_id, user_id, guest_name, guest_email, guest_phone, check_in, check_out, rooms, total_price)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [hotelId, userId ?? null, guestName, guestEmail, guestPhone ?? null, checkIn, checkOut, rooms, totalPrice]
  )

  return { booking: bookingRows[0], resource: hotel, totalPrice, nights }
}

export async function bookTour(client, { tourId, tourDate, participants, userId, guestName, guestEmail, guestPhone }) {
  if (!tourId || !tourDate || !participants || participants < 1) {
    throw httpError(400, 'tourId, tourDate and participants are required')
  }

  const { rows } = await client.query('SELECT * FROM tours WHERE id = $1 FOR UPDATE', [tourId])
  const tour = rows[0]
  if (!tour) throw httpError(404, 'Tour not found')
  if (tour.spots_available < participants) {
    throw httpError(409, `Only ${tour.spots_available} spots left on this tour`)
  }

  const totalPrice = Number(tour.price_per_person) * participants

  await client.query('UPDATE tours SET spots_available = spots_available - $1 WHERE id = $2', [participants, tourId])
  const { rows: bookingRows } = await client.query(
    `INSERT INTO tour_bookings (tour_id, user_id, guest_name, guest_email, guest_phone, tour_date, participants, total_price)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [tourId, userId ?? null, guestName, guestEmail, guestPhone ?? null, tourDate, participants, totalPrice]
  )

  return { booking: bookingRows[0], resource: tour, totalPrice }
}
