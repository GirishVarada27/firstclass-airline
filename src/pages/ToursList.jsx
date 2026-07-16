import { useEffect, useState } from 'react'
import { fetchTours } from '../api/client'
import TourCard from '../components/TourCard'

export default function ToursList() {
  const [tours, setTours] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [city, setCity] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    fetchTours({ city })
      .then(setTours)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [city])

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-white">Guided City Tours</h1>
      <p className="mt-1 text-slate-400">Small-group guided experiences in 20 iconic cities worldwide.</p>

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
        <p className="mt-10 text-center text-slate-500">Loading tours...</p>
      ) : tours.length === 0 ? (
        <p className="mt-10 text-center text-slate-500">No tours match your search.</p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tours.map((t) => (
            <TourCard key={t.id} tour={t} />
          ))}
        </div>
      )}
    </div>
  )
}
