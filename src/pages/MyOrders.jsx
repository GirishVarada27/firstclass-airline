import { useEffect, useState } from 'react'
import { fetchMyOrders } from '../api/client'
import Receipt from '../components/Receipt'

const CATEGORY_LABEL = { flight: 'Flight', hotel: 'Hotel', tour: 'Tour' }

function lineDescription(order) {
  const d = order.details
  if (order.category === 'flight') return `${d.airline} ${d.flightNumber} · ${d.originCode} → ${d.destinationCode}`
  if (order.category === 'hotel') return `${d.hotelName} · ${d.city}`
  return `${d.title} · ${d.city}`
}

export default function MyOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    fetchMyOrders()
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (selected) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <button onClick={() => setSelected(null)} className="mb-6 text-sm font-medium text-slate-400 hover:text-white">
          ← Back to my orders
        </button>
        <Receipt order={selected} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-white">My Orders</h1>
      <p className="mt-1 text-slate-400">Paid orders with a stored receipt.</p>

      {error && <p className="mt-6 text-rose-400">{error}</p>}
      {loading && <p className="mt-10 text-center text-slate-500">Loading your orders...</p>}

      {!loading && orders.length === 0 && (
        <p className="mt-10 text-center text-slate-500">No orders yet — book a flight, hotel, or tour to see a receipt here.</p>
      )}

      <div className="mt-6 space-y-4">
        {orders.map((o) => (
          <button
            key={o.id}
            onClick={() => setSelected(o)}
            className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left transition-colors hover:border-cyan-400/30"
          >
            <div>
              <p className="font-mono text-sm text-cyan-300">{o.order_number}</p>
              <p className="font-semibold text-white">{CATEGORY_LABEL[o.category]} · {lineDescription(o)}</p>
              <p className="text-sm text-slate-400">{new Date(o.order_date).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-white">${Number(o.total_amount).toLocaleString()}</p>
              <p className="text-sm capitalize text-emerald-400">{o.payment_status}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
