import { useEffect, useState } from 'react'
import { fetchFlights } from '../api/client'
import FlightCard from '../components/FlightCard'

export default function FlightsList() {
  const [flights, setFlights] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [date, setDate] = useState('')
  const [international, setInternational] = useState('all')

  useEffect(() => {
    setLoading(true)
    setError('')
    fetchFlights({
      origin,
      destination,
      date,
      international: international === 'all' ? undefined : international,
    })
      .then(setFlights)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [origin, destination, date, international])

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-white">Flights</h1>
      <p className="mt-1 text-slate-400">Domestic and international routes on FirstClass Airways — book as a guest, no account needed.</p>

      <div className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-4">
        <input
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          placeholder="From (city)"
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
        />
        <input
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="To (city)"
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none"
        />
        <select
          value={international}
          onChange={(e) => setInternational(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none"
        >
          <option value="all">All routes</option>
          <option value="true">International only</option>
          <option value="false">Domestic only</option>
        </select>
      </div>

      {error && <p className="mt-6 text-rose-400">{error}</p>}
      {loading ? (
        <p className="mt-10 text-center text-slate-500">Loading flights...</p>
      ) : flights.length === 0 ? (
        <p className="mt-10 text-center text-slate-500">No flights match your search.</p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {flights.map((f) => (
            <FlightCard key={f.id} flight={f} />
          ))}
        </div>
      )}
    </div>
  )
}
