import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchFlight, createFlightBooking, createOrder } from '../api/client'
import { useSession } from '../lib/auth-client'
import PaymentForm from '../components/PaymentForm'
import Receipt from '../components/Receipt'

export default function FlightBooking() {
  const { id } = useParams()
  const { data: session } = useSession()

  const [flight, setFlight] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [confirmation, setConfirmation] = useState(null)

  const [passengers, setPassengers] = useState(1)
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestPhone, setGuestPhone] = useState('')

  const [step, setStep] = useState('select') // select -> review -> payment -> receipt
  const [paymentError, setPaymentError] = useState('')
  const [order, setOrder] = useState(null)

  useEffect(() => {
    fetchFlight(id)
      .then(setFlight)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (session) {
      setGuestName(session.user.name || '')
      setGuestEmail(session.user.email || '')
    }
  }, [session])

  const total = flight ? flight.price * passengers : 0

  async function handleSelectSubmit(e) {
    e.preventDefault()
    setError('')

    if (session) {
      setStep('review')
      return
    }

    setSubmitting(true)
    try {
      const booking = await createFlightBooking({
        flightId: id,
        passengers: Number(passengers),
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

  async function handlePayment(paymentDetails) {
    setPaymentError('')
    setSubmitting(true)
    try {
      const newOrder = await createOrder({
        category: 'flight',
        flightId: id,
        passengers: Number(passengers),
        customerName: guestName,
        customerEmail: guestEmail,
        customerPhone: guestPhone,
        payment: paymentDetails,
      })
      setOrder(newOrder)
      setStep('receipt')
    } catch (err) {
      setPaymentError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <p className="py-20 text-center text-slate-500">Loading flight...</p>
  if (!flight) return <p className="py-20 text-center text-rose-400">{error || 'Flight not found'}</p>

  if (order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <Receipt order={order} />
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/flights" className="rounded-full border border-white/15 px-5 py-2 text-sm font-medium text-slate-200 hover:bg-white/5">
            Book another flight
          </Link>
          <Link to="/my-orders" className="rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-5 py-2 text-sm font-semibold text-white">
            View my orders
          </Link>
        </div>
      </div>
    )
  }

  if (confirmation) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-8">
          <p className="text-3xl">✅</p>
          <h1 className="mt-3 text-2xl font-bold text-white">Booking confirmed!</h1>
          <p className="mt-2 text-slate-300">
            {confirmation.passengers} passenger(s) on {flight.airline} {flight.flight_number}, {flight.origin_code} → {flight.destination_code} on {flight.departure_date}.
          </p>
          <p className="mt-2 text-lg font-bold text-white">Total paid: ${Number(confirmation.total_price).toLocaleString()}</p>
          <p className="mt-4 text-sm text-slate-400">A confirmation has been sent to {confirmation.guest_email}.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/flights" className="rounded-full border border-white/15 px-5 py-2 text-sm font-medium text-slate-200 hover:bg-white/5">
              Book another flight
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const soldOut = flight.seats_available <= 0

  const flightSummary = (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{flight.airline} · {flight.flight_number} · {flight.cabin_class}</p>
      <div className="mt-3 flex items-center justify-between">
        <div>
          <p className="text-3xl font-bold text-white">{flight.origin_code}</p>
          <p className="text-sm text-slate-400">{flight.origin_city}</p>
        </div>
        <span className="text-slate-500">→</span>
        <div className="text-right">
          <p className="text-3xl font-bold text-white">{flight.destination_code}</p>
          <p className="text-sm text-slate-400">{flight.destination_city}</p>
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-400">
        {flight.departure_date} · Departs {flight.departure_time} · Arrives {flight.arrival_time} · {flight.duration}
        {flight.international && <span className="ml-2 font-semibold text-fuchsia-400">International</span>}
      </p>
      <p className="mt-3 text-2xl font-extrabold text-white">${Number(flight.price).toLocaleString()} <span className="text-sm font-normal text-slate-400">per passenger</span></p>
    </div>
  )

  if (step === 'review') {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {flightSummary}
        <div className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-lg font-bold text-white">Review your order</h2>
          <div className="grid gap-4 sm:grid-cols-2">
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
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Passengers</label>
              <p className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white">{passengers}</p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <button onClick={() => setStep('select')} className="text-sm font-medium text-slate-400 hover:text-white">
              ← Back
            </button>
            <div className="flex items-center gap-4">
              <p className="text-lg font-bold text-white">Total: ${total.toLocaleString()}</p>
              <button
                onClick={() => setStep('payment')}
                disabled={!guestName || !guestEmail}
                className="rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition-transform hover:scale-105 disabled:opacity-50"
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'payment') {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {flightSummary}
        <div className="mt-8">
          <PaymentForm amount={total} onSubmit={handlePayment} submitting={submitting} error={paymentError} />
          <button onClick={() => setStep('review')} className="mt-4 text-sm font-medium text-slate-400 hover:text-white">
            ← Back to review
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {flightSummary}

      <form onSubmit={handleSelectSubmit} className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-lg font-bold text-white">{session ? 'Trip details' : 'Passenger details'}</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {!session && (
            <>
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
            </>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Passengers</label>
            <input
              type="number"
              min={1}
              max={Math.max(flight.seats_available, 1)}
              required
              value={passengers}
              onChange={(e) => setPassengers(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>
        </div>

        {error && <p className="text-sm text-rose-400">{error}</p>}

        <div className="flex items-center justify-between pt-2">
          <p className="text-lg font-bold text-white">Total: ${total.toLocaleString()}</p>
          <button
            type="submit"
            disabled={submitting || soldOut}
            className="rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {soldOut ? 'Sold out' : submitting ? 'Booking...' : session ? 'Review Order' : 'Confirm Booking'}
          </button>
        </div>
      </form>
    </div>
  )
}
