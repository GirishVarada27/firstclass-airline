import { useEffect, useState } from 'react'
import { fetchHotels } from '../api/client'
import HotelCard from '../components/HotelCard'

export default function HotelsList() {
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [city, setCity] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    fetchHotels({ city })
      .then(setHotels)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [city])

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-white">Hotels</h1>
      <p className="mt-1 text-slate-400">Curated stays in 50 major cities worldwide.</p>

      <div className="mt-6 max-w-sm">
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Search by city..."
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
        />
      </div>

      {error && <p className="mt-6 text-rose-400">{error}</p>}
      {loading ? (
        <p className="mt-10 text-center text-slate-500">Loading hotels...</p>
      ) : hotels.length === 0 ? (
        <p className="mt-10 text-center text-slate-500">No hotels match your search.</p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {hotels.map((h) => (
            <HotelCard key={h.id} hotel={h} />
          ))}
        </div>
      )}
    </div>
  )
}
