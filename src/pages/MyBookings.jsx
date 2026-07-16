import { useEffect, useState } from 'react'
import {
  fetchMyFlightBookings, cancelFlightBooking,
  fetchMyHotelBookings, cancelHotelBooking,
  fetchMyTourBookings, cancelTourBooking,
} from '../api/client'

const TABS = ['Flights', 'Hotels', 'Tours']

function statusColor(status) {
  return status === 'cancelled' ? 'text-rose-400' : 'text-emerald-400'
}

export default function MyBookings() {
  const [tab, setTab] = useState('Flights')
  const [flightBookings, setFlightBookings] = useState([])
  const [hotelBookings, setHotelBookings] = useState([])
  const [tourBookings, setTourBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  function reload() {
    setLoading(true)
    setError('')
    Promise.all([fetchMyFlightBookings(), fetchMyHotelBookings(), fetchMyTourBookings()])
      .then(([flights, hotels, tours]) => {
        setFlightBookings(flights)
        setHotelBookings(hotels)
        setTourBookings(tours)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(reload, [])

  async function handleCancel(kind, id) {
    try {
      if (kind === 'flight') await cancelFlightBooking(id)
      if (kind === 'hotel') await cancelHotelBooking(id)
      if (kind === 'tour') await cancelTourBooking(id)
      reload()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-white">My Bookings</h1>

      <div className="mt-6 flex gap-2 border-b border-white/10">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold transition-colors ${
              tab === t ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {error && <p className="mt-6 text-rose-400">{error}</p>}
      {loading && <p className="mt-10 text-center text-slate-500">Loading your bookings...</p>}

      {!loading && tab === 'Flights' && (
        <div className="mt-6 space-y-4">
          {flightBookings.length === 0 && <p className="text-slate-500">No flight bookings yet.</p>}
          {flightBookings.map((b) => (
            <div key={b.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div>
                <p className="font-semibold text-white">{b.airline} {b.flight_number} · {b.origin_city} → {b.destination_city}</p>
                <p className="text-sm text-slate-400">{b.departure_date} · {b.departure_time} · {b.cabin_class} · {b.passengers} passenger(s)</p>
                <p className={`text-sm font-medium ${statusColor(b.status)}`}>{b.status}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-white">${Number(b.total_price).toLocaleString()}</p>
                {b.status !== 'cancelled' && (
                  <button onClick={() => handleCancel('flight', b.id)} className="mt-1 text-sm text-rose-400 hover:underline">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && tab === 'Hotels' && (
        <div className="mt-6 space-y-4">
          {hotelBookings.length === 0 && <p className="text-slate-500">No hotel bookings yet.</p>}
          {hotelBookings.map((b) => (
            <div key={b.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div>
                <p className="font-semibold text-white">{b.hotel_name} · {b.city}, {b.country}</p>
                <p className="text-sm text-slate-400">{b.check_in} → {b.check_out} · {b.rooms} room(s)</p>
                <p className={`text-sm font-medium ${statusColor(b.status)}`}>{b.status}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-white">${Number(b.total_price).toLocaleString()}</p>
                {b.status !== 'cancelled' && (
                  <button onClick={() => handleCancel('hotel', b.id)} className="mt-1 text-sm text-rose-400 hover:underline">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && tab === 'Tours' && (
        <div className="mt-6 space-y-4">
          {tourBookings.length === 0 && <p className="text-slate-500">No tour bookings yet.</p>}
          {tourBookings.map((b) => (
            <div key={b.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div>
                <p className="font-semibold text-white">{b.title} · {b.city}, {b.country}</p>
                <p className="text-sm text-slate-400">{b.tour_date} · {b.participants} participant(s)</p>
                <p className={`text-sm font-medium ${statusColor(b.status)}`}>{b.status}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-white">${Number(b.total_price).toLocaleString()}</p>
                {b.status !== 'cancelled' && (
                  <button onClick={() => handleCancel('tour', b.id)} className="mt-1 text-sm text-rose-400 hover:underline">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
