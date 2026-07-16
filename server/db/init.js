import { pool } from '../db.js'
import { auth } from '../auth.js'
import { getMigrations } from 'better-auth/db/migration'

const AIRPORTS = [
  { city: 'New York', code: 'JFK', country: 'USA' },
  { city: 'Los Angeles', code: 'LAX', country: 'USA' },
  { city: 'Chicago', code: 'ORD', country: 'USA' },
  { city: 'Miami', code: 'MIA', country: 'USA' },
  { city: 'San Francisco', code: 'SFO', country: 'USA' },
  { city: 'Toronto', code: 'YYZ', country: 'Canada' },
  { city: 'London', code: 'LHR', country: 'UK' },
  { city: 'Paris', code: 'CDG', country: 'France' },
  { city: 'Amsterdam', code: 'AMS', country: 'Netherlands' },
  { city: 'Frankfurt', code: 'FRA', country: 'Germany' },
  { city: 'Rome', code: 'FCO', country: 'Italy' },
  { city: 'Madrid', code: 'MAD', country: 'Spain' },
  { city: 'Zurich', code: 'ZRH', country: 'Switzerland' },
  { city: 'Istanbul', code: 'IST', country: 'Turkey' },
  { city: 'Dubai', code: 'DXB', country: 'UAE' },
  { city: 'Doha', code: 'DOH', country: 'Qatar' },
  { city: 'Mumbai', code: 'BOM', country: 'India' },
  { city: 'Delhi', code: 'DEL', country: 'India' },
  { city: 'Singapore', code: 'SIN', country: 'Singapore' },
  { city: 'Bangkok', code: 'BKK', country: 'Thailand' },
  { city: 'Hong Kong', code: 'HKG', country: 'Hong Kong' },
  { city: 'Tokyo', code: 'HND', country: 'Japan' },
  { city: 'Seoul', code: 'ICN', country: 'South Korea' },
  { city: 'Sydney', code: 'SYD', country: 'Australia' },
]

// [originIdx, destIdx, cabinClass, price, dayOffset, departTime, arriveTime, duration]
const ROUTE_PLAN = [
  [0, 6, 'Economy', 620, 3, '19:30', '07:45+1', '7h 15m'],
  [0, 6, 'Business', 2400, 3, '19:30', '07:45+1', '7h 15m'],
  [0, 6, 'First Class', 5200, 5, '21:00', '09:15+1', '7h 15m'],
  [6, 0, 'Economy', 640, 4, '11:20', '14:10', '8h 50m'],
  [0, 7, 'Economy', 590, 2, '18:45', '07:55+1', '7h 10m'],
  [0, 7, 'First Class', 4900, 6, '20:10', '09:20+1', '7h 10m'],
  [1, 21, 'Economy', 980, 5, '01:10', '05:40+1', '11h 30m'],
  [1, 21, 'First Class', 6800, 5, '01:10', '05:40+1', '11h 30m'],
  [2, 14, 'Economy', 870, 4, '22:40', '20:15+1', '13h 35m'],
  [6, 14, 'Economy', 410, 2, '14:05', '00:35+1', '7h 30m'],
  [6, 14, 'Business', 1650, 2, '14:05', '00:35+1', '7h 30m'],
  [14, 18, 'Economy', 320, 3, '02:15', '13:40', '8h 25m'],
  [14, 21, 'First Class', 3900, 7, '03:30', '17:00', '8h 30m'],
  [7, 8, 'Economy', 130, 1, '08:15', '09:35', '1h 20m'],
  [7, 10, 'Economy', 210, 2, '10:05', '12:40', '2h 35m'],
  [7, 11, 'Economy', 195, 3, '13:20', '15:50', '2h 30m'],
  [8, 12, 'Economy', 175, 2, '09:40', '11:15', '1h 35m'],
  [9, 13, 'Economy', 260, 4, '16:00', '19:50', '3h 50m'],
  [13, 14, 'Economy', 240, 2, '06:30', '11:45', '4h 15m'],
  [15, 16, 'Economy', 355, 3, '23:10', '04:20+1', '4h 10m'],
  [16, 17, 'Economy', 95, 1, '07:00', '09:10', '1h 10m'],
  [18, 19, 'Economy', 140, 2, '11:30', '12:55', '1h 25m'],
  [19, 20, 'Economy', 165, 3, '15:45', '19:30', '2h 45m'],
  [20, 21, 'Economy', 310, 5, '08:20', '20:05', '4h 45m'],
  [21, 22, 'Economy', 285, 4, '10:10', '17:30', '2h 20m'],
  [22, 23, 'Economy', 520, 6, '00:45', '11:20', '9h 35m'],
  [23, 1, 'Economy', 890, 8, '18:00', '11:30+1', '13h 30m'],
  [4, 18, 'Economy', 940, 6, '20:30', '19:45+1', '17h 15m'],
  [5, 6, 'Economy', 480, 3, '20:00', '07:30+1', '6h 30m'],
  [3, 7, 'Economy', 610, 4, '21:15', '10:40+1', '8h 25m'],
]

function futureDate(daysFromNow) {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  return d.toISOString().slice(0, 10)
}

function buildFlights() {
  return ROUTE_PLAN.map(([oIdx, dIdx, cabin, price, dayOffset, depTime, arrTime, duration], i) => {
    const origin = AIRPORTS[oIdx]
    const destination = AIRPORTS[dIdx]
    return {
      flightNumber: `FC${100 + i}`,
      airline: 'FirstClass Airways',
      originCity: origin.city,
      originCode: origin.code,
      originCountry: origin.country,
      destinationCity: destination.city,
      destinationCode: destination.code,
      destinationCountry: destination.country,
      departureDate: futureDate(dayOffset),
      departureTime: depTime,
      arrivalTime: arrTime,
      duration,
      cabinClass: cabin,
      price,
      international: origin.country !== destination.country,
      seatsAvailable: cabin === 'First Class' ? 8 : cabin === 'Business' ? 20 : 140,
    }
  })
}

const HOTEL_CITIES = [
  ['New York', 'USA'], ['Los Angeles', 'USA'], ['Chicago', 'USA'], ['Miami', 'USA'], ['San Francisco', 'USA'],
  ['Las Vegas', 'USA'], ['Toronto', 'Canada'], ['Vancouver', 'Canada'], ['Mexico City', 'Mexico'],
  ['Rio de Janeiro', 'Brazil'], ['Buenos Aires', 'Argentina'], ['London', 'UK'], ['Edinburgh', 'UK'],
  ['Paris', 'France'], ['Nice', 'France'], ['Amsterdam', 'Netherlands'], ['Berlin', 'Germany'],
  ['Frankfurt', 'Germany'], ['Rome', 'Italy'], ['Venice', 'Italy'], ['Milan', 'Italy'], ['Barcelona', 'Spain'],
  ['Madrid', 'Spain'], ['Lisbon', 'Portugal'], ['Zurich', 'Switzerland'], ['Geneva', 'Switzerland'],
  ['Vienna', 'Austria'], ['Prague', 'Czech Republic'], ['Athens', 'Greece'], ['Istanbul', 'Turkey'],
  ['Dubai', 'UAE'], ['Abu Dhabi', 'UAE'], ['Doha', 'Qatar'], ['Cairo', 'Egypt'], ['Marrakech', 'Morocco'],
  ['Cape Town', 'South Africa'], ['Nairobi', 'Kenya'], ['Mumbai', 'India'], ['Delhi', 'India'],
  ['Singapore', 'Singapore'], ['Bangkok', 'Thailand'], ['Hong Kong', 'Hong Kong'], ['Tokyo', 'Japan'],
  ['Kyoto', 'Japan'], ['Seoul', 'South Korea'], ['Shanghai', 'China'], ['Beijing', 'China'],
  ['Kuala Lumpur', 'Malaysia'], ['Sydney', 'Australia'], ['Auckland', 'New Zealand'],
]

const HOTEL_NAME_PREFIXES = ['Grand', 'Royal', 'The Metropolitan', 'Skyline', 'Azure', 'The Regency', 'Nova', 'The Continental', 'Lumen', 'The Meridian']

function buildHotels() {
  return HOTEL_CITIES.map(([city, country], i) => {
    const star = 3 + (i % 3)
    return {
      name: `${HOTEL_NAME_PREFIXES[i % HOTEL_NAME_PREFIXES.length]} ${city}`,
      city,
      country,
      starRating: star,
      pricePerNight: 90 + star * 55 + (i % 7) * 20,
      roomsAvailable: 12 + (i % 5) * 4,
      image: `https://picsum.photos/seed/hotel-${encodeURIComponent(city.replace(/\s+/g, '-'))}/600/400`,
      description: `A ${star}-star stay in the heart of ${city}, ${country} — FirstClass-vetted comfort with skyline views and 24-hour concierge.`,
    }
  })
}

const TOURS = [
  ['Paris', 'France', 'Eiffel Tower & Louvre Highlights', 4],
  ['Rome', 'Italy', 'Colosseum & Ancient Rome Walk', 3.5],
  ['London', 'UK', 'Royal London Heritage Tour', 4],
  ['Tokyo', 'Japan', 'Shibuya, Shrines & Street Food', 5],
  ['New York', 'USA', 'Manhattan Skyline & Central Park', 3],
  ['Dubai', 'UAE', 'Desert Safari & Burj Khalifa', 6],
  ['Istanbul', 'Turkey', 'Grand Bazaar & Hagia Sophia', 4],
  ['Bangkok', 'Thailand', 'Temples & Floating Markets', 5],
  ['Cairo', 'Egypt', 'Pyramids of Giza & Sphinx', 4.5],
  ['Barcelona', 'Spain', 'Gaudi Architecture Trail', 3.5],
  ['Athens', 'Greece', 'Acropolis & Ancient Agora', 3.5],
  ['Kyoto', 'Japan', 'Bamboo Grove & Golden Pavilion', 4],
  ['Marrakech', 'Morocco', 'Medina Souks & Palace Tour', 4],
  ['Rio de Janeiro', 'Brazil', 'Christ the Redeemer & Sugarloaf', 5],
  ['Sydney', 'Australia', 'Opera House & Harbour Bridge Climb', 4],
  ['Amsterdam', 'Netherlands', 'Canal Cruise & Van Gogh Museum', 3],
  ['Prague', 'Czech Republic', 'Old Town & Prague Castle', 3.5],
  ['Venice', 'Italy', 'Gondola Ride & St. Mark’s Square', 3],
  ['Cusco', 'Peru', 'Machu Picchu Day Expedition', 8],
  ['Amman', 'Jordan', 'Petra: The Rose City', 7],
]

function buildTours() {
  return TOURS.map(([city, country, title, hours], i) => ({
    city,
    country,
    title,
    durationHours: hours,
    pricePerPerson: 45 + Math.round(hours * 18) + (i % 4) * 10,
    spotsAvailable: 15 + (i % 6) * 5,
    image: `https://picsum.photos/seed/tour-${encodeURIComponent(city.replace(/\s+/g, '-'))}/600/400`,
    description: `A guided small-group experience through ${title.toLowerCase()} in ${city}, ${country}, led by a local FirstClass tour expert.`,
  }))
}

async function createSchema(client) {
  await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto')

  await client.query(`
    CREATE TABLE IF NOT EXISTS flights (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      flight_number TEXT NOT NULL,
      airline TEXT NOT NULL,
      origin_city TEXT NOT NULL,
      origin_code TEXT NOT NULL,
      origin_country TEXT NOT NULL,
      destination_city TEXT NOT NULL,
      destination_code TEXT NOT NULL,
      destination_country TEXT NOT NULL,
      departure_date DATE NOT NULL,
      departure_time TEXT NOT NULL,
      arrival_time TEXT NOT NULL,
      duration TEXT NOT NULL,
      cabin_class TEXT NOT NULL DEFAULT 'Economy',
      price NUMERIC NOT NULL,
      international BOOLEAN NOT NULL DEFAULT false,
      seats_available INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (flight_number, departure_date)
    )
  `)

  await client.query(`
    CREATE TABLE IF NOT EXISTS hotels (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      city TEXT NOT NULL,
      country TEXT NOT NULL,
      star_rating INTEGER NOT NULL,
      price_per_night NUMERIC NOT NULL,
      rooms_available INTEGER NOT NULL,
      image TEXT,
      description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (name, city)
    )
  `)

  await client.query(`
    CREATE TABLE IF NOT EXISTS tours (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      city TEXT NOT NULL,
      country TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      duration_hours NUMERIC NOT NULL,
      price_per_person NUMERIC NOT NULL,
      spots_available INTEGER NOT NULL,
      image TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (title, city)
    )
  `)

  await client.query(`
    CREATE TABLE IF NOT EXISTS flight_bookings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      flight_id UUID NOT NULL REFERENCES flights(id),
      user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE,
      guest_name TEXT NOT NULL,
      guest_email TEXT NOT NULL,
      guest_phone TEXT,
      passengers INTEGER NOT NULL,
      total_price NUMERIC NOT NULL,
      status TEXT NOT NULL DEFAULT 'confirmed',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `)

  await client.query(`
    CREATE TABLE IF NOT EXISTS hotel_bookings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      hotel_id UUID NOT NULL REFERENCES hotels(id),
      user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE,
      guest_name TEXT NOT NULL,
      guest_email TEXT NOT NULL,
      guest_phone TEXT,
      check_in DATE NOT NULL,
      check_out DATE NOT NULL,
      rooms INTEGER NOT NULL,
      total_price NUMERIC NOT NULL,
      status TEXT NOT NULL DEFAULT 'confirmed',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `)

  await client.query(`
    CREATE TABLE IF NOT EXISTS tour_bookings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tour_id UUID NOT NULL REFERENCES tours(id),
      user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE,
      guest_name TEXT NOT NULL,
      guest_email TEXT NOT NULL,
      guest_phone TEXT,
      tour_date DATE NOT NULL,
      participants INTEGER NOT NULL,
      total_price NUMERIC NOT NULL,
      status TEXT NOT NULL DEFAULT 'confirmed',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `)
}

async function seedFlights(client) {
  for (const f of buildFlights()) {
    await client.query(
      `INSERT INTO flights (
         flight_number, airline, origin_city, origin_code, origin_country,
         destination_city, destination_code, destination_country,
         departure_date, departure_time, arrival_time, duration,
         cabin_class, price, international, seats_available
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       ON CONFLICT (flight_number, departure_date) DO UPDATE SET
         airline = EXCLUDED.airline,
         origin_city = EXCLUDED.origin_city,
         origin_code = EXCLUDED.origin_code,
         origin_country = EXCLUDED.origin_country,
         destination_city = EXCLUDED.destination_city,
         destination_code = EXCLUDED.destination_code,
         destination_country = EXCLUDED.destination_country,
         departure_time = EXCLUDED.departure_time,
         arrival_time = EXCLUDED.arrival_time,
         duration = EXCLUDED.duration,
         cabin_class = EXCLUDED.cabin_class,
         price = EXCLUDED.price,
         international = EXCLUDED.international`,
      [f.flightNumber, f.airline, f.originCity, f.originCode, f.originCountry,
       f.destinationCity, f.destinationCode, f.destinationCountry,
       f.departureDate, f.departureTime, f.arrivalTime, f.duration,
       f.cabinClass, f.price, f.international, f.seatsAvailable]
    )
  }
}

async function seedHotels(client) {
  for (const h of buildHotels()) {
    await client.query(
      `INSERT INTO hotels (name, city, country, star_rating, price_per_night, rooms_available, image, description)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (name, city) DO UPDATE SET
         country = EXCLUDED.country,
         star_rating = EXCLUDED.star_rating,
         price_per_night = EXCLUDED.price_per_night,
         image = EXCLUDED.image,
         description = EXCLUDED.description`,
      [h.name, h.city, h.country, h.starRating, h.pricePerNight, h.roomsAvailable, h.image, h.description]
    )
  }
}

async function seedTours(client) {
  for (const t of buildTours()) {
    await client.query(
      `INSERT INTO tours (city, country, title, description, duration_hours, price_per_person, spots_available, image)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (title, city) DO UPDATE SET
         country = EXCLUDED.country,
         description = EXCLUDED.description,
         duration_hours = EXCLUDED.duration_hours,
         price_per_person = EXCLUDED.price_per_person,
         image = EXCLUDED.image`,
      [t.city, t.country, t.title, t.description, t.durationHours, t.pricePerPerson, t.spotsAvailable, t.image]
    )
  }
}

export async function initDb() {
  const { runMigrations } = await getMigrations(auth.options)
  await runMigrations()

  const client = await pool.connect()
  try {
    await createSchema(client)
    await seedFlights(client)
    await seedHotels(client)
    await seedTours(client)
  } finally {
    client.release()
  }
}
