import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchHotel, createHotelBooking } from '../api/client'
import { useSession } from '../lib/auth-client'

function nightsBetween(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0
  const ms = new Date(checkOut) - new Date(checkIn)
  return ms > 0 ? Math.round(ms / (1000 * 60 * 60 * 24)) : 0
}

export default function HotelBooking() {
  const { id } = useParams()
  const { data: session } = useSession()

  const [hotel, setHotel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [confirmation, setConfirmation] = useState(null)

  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [rooms, setRooms] = useState(1)
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestPhone, setGuestPhone] = useState('')

  useEffect(() => {
    fetchHotel(id)
      .then(setHotel)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (session) {
      setGuestName(session.user.name || '')
      setGuestEmail(session.user.email || '')
    }
  }, [session])

  const nights = useMemo(() => nightsBetween(checkIn, checkOut), [checkIn, checkOut])
  const total = hotel ? hotel.price_per_night * rooms * nights : 0

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (nights <= 0) {
      setError('Check-out date must be after check-in date')
      return
    }
    setSubmitting(true)
    try {
      const booking = await createHotelBooking({
        hotelId: id,
        checkIn,
        checkOut,
        rooms: Number(rooms),
        guestName,
        guestEmail,
        guestPhone,
      })
      setConfirmation(booking)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <p className="py-20 text-center text-slate-500">Loading hotel...</p>
  if (!hotel) return <p className="py-20 text-center text-rose-400">{error || 'Hotel not found'}</p>

  if (confirmation) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-8">
          <p className="text-3xl">✅</p>
          <h1 className="mt-3 text-2xl font-bold text-white">Booking confirmed!</h1>
          <p className="mt-2 text-slate-300">
            {confirmation.rooms} room(s) at {hotel.name} from {confirmation.check_in} to {confirmation.check_out}.
          </p>
          <p className="mt-2 text-lg font-bold text-white">Total paid: ${Number(confirmation.total_price).toLocaleString()}</p>
          <p className="mt-4 text-sm text-slate-400">A confirmation has been sent to {confirmation.guest_email}.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/hotels" className="rounded-full border border-white/15 px-5 py-2 text-sm font-medium text-slate-200 hover:bg-white/5">
              Book another hotel
            </Link>
            {session && (
              <Link to="/my-bookings" className="rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-5 py-2 text-sm font-semibold text-white">
                View my bookings
              </Link>
            )}
          </div>
        </div>
      </div>
    )
  }

  const soldOut = hotel.rooms_available <= 0

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        <img src={hotel.image} alt={hotel.name} className="h-56 w-full object-cover" />
        <div className="p-6">
          <div className="flex items-start justify-between">
            <h1 className="text-2xl font-bold text-white">{hotel.name}</h1>
            <span className="text-amber-300">{'★'.repeat(hotel.star_rating)}</span>
          </div>
          <p className="mt-1 text-slate-400">{hotel.city}, {hotel.country}</p>
          <p className="mt-3 text-slate-300">{hotel.description}</p>
          <p className="mt-3 text-2xl font-extrabold text-white">${Number(hotel.price_per_night).toLocaleString()} <span className="text-sm font-normal text-slate-400">per night</span></p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-lg font-bold text-white">Reservation details</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Check-in</label>
            <input
              type="date"
              required
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Check-out</label>
            <input
              type="date"
              required
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Rooms</label>
            <input
              type="number"
              min={1}
              max={Math.max(hotel.rooms_available, 1)}
              required
              value={rooms}
              onChange={(e) => setRooms(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Full name</label>
            <input
              required
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Email</label>
            <input
              type="email"
              required
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Phone (optional)</label>
            <input
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>
        </div>

        {error && <p className="text-sm text-rose-400">{error}</p>}

        <div className="flex items-center justify-between pt-2">
          <p className="text-lg font-bold text-white">
            {nights > 0 ? `${nights} night(s) · Total: $${total.toLocaleString()}` : 'Select dates'}
          </p>
          <button
            type="submit"
            disabled={submitting || soldOut}
            className="rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {soldOut ? 'Fully booked' : submitting ? 'Booking...' : 'Confirm Booking'}
          </button>
        </div>
      </form>
    </div>
  )
}
