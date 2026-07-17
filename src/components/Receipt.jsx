const CATEGORY_META = {
  flight: { referenceLabel: 'Airline Reference Number', detailsLabel: 'Flight Details' },
  hotel: { referenceLabel: 'Hotel Confirmation Number', detailsLabel: 'Hotel Details' },
  tour: { referenceLabel: 'Tour Confirmation Number', detailsLabel: 'Tour Details' },
}

function lineDescription(category, d) {
  if (category === 'flight') {
    return `${d.airline} ${d.flightNumber} · ${d.originCode} → ${d.destinationCode} (${d.cabinClass})`
  }
  if (category === 'hotel') {
    return `${d.hotelName} · ${d.city}, ${d.country}`
  }
  return `${d.title} · ${d.city}, ${d.country}`
}

function detailLines(category, d) {
  if (category === 'flight') {
    return [
      `${d.originCity} (${d.originCode}) → ${d.destinationCity} (${d.destinationCode})`,
      `${d.departureDate} · Departs ${d.departureTime} · Arrives ${d.arrivalTime}`,
      d.international ? 'International flight' : 'Domestic flight',
    ]
  }
  if (category === 'hotel') {
    return [
      `${'★'.repeat(d.starRating)} hotel in ${d.city}, ${d.country}`,
      `Check-in ${d.checkIn?.slice(0, 10)} → Check-out ${d.checkOut?.slice(0, 10)} (${d.nights} night${d.nights === 1 ? '' : 's'})`,
    ]
  }
  return [
    `${d.city}, ${d.country} · ${d.durationHours}h guided tour`,
    `Tour date: ${d.tourDate?.slice(0, 10)}`,
  ]
}

export default function Receipt({ order }) {
  const { details: d, category } = order
  const meta = CATEGORY_META[category]

  return (
    <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-emerald-400/20 bg-white/[0.03] shadow-xl shadow-black/30">
      <div className="bg-gradient-to-r from-emerald-500/15 via-cyan-500/10 to-fuchsia-500/15 p-6 text-center">
        <p className="text-3xl">✅</p>
        <h1 className="mt-2 text-2xl font-bold text-white">Payment Successful</h1>
        <p className="mt-1 text-sm text-slate-400">Thank you for booking with FirstClass</p>
      </div>

      <div className="space-y-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Order Number</p>
            <p className="font-mono text-lg font-bold text-white">{order.order_number}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-slate-500">{meta.referenceLabel}</p>
            <p className="font-mono text-lg font-bold text-cyan-300">{order.reference_number}</p>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Customer</p>
          <p className="mt-1 font-medium text-white">{order.customer_name}</p>
          <p className="text-sm text-slate-400">{order.customer_email}{order.customer_phone ? ` · ${order.customer_phone}` : ''}</p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">{meta.detailsLabel}</p>
          <p className="mt-1 font-medium text-white">{lineDescription(category, d)}</p>
          <ul className="mt-1 space-y-0.5 text-sm text-slate-400">
            {detailLines(category, d).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Purchased Items</p>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-slate-300">
              {d.quantity} {d.quantityLabel}{d.quantity === 1 ? '' : 's'} × ${d.unitPrice.toLocaleString()}
            </span>
            <span className="font-semibold text-white">${Number(order.total_amount).toLocaleString()}</span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
            <span className="font-bold text-white">Total Amount</span>
            <span className="text-xl font-extrabold text-white">${Number(order.total_amount).toLocaleString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Payment Status</p>
            <p className="mt-1 font-semibold capitalize text-emerald-400">{order.payment_status}</p>
            <p className="text-slate-500">Card ending in {order.card_last4}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-slate-500">Order Date</p>
            <p className="mt-1 font-medium text-white">{new Date(order.order_date).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
