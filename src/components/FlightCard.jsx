import { Link } from 'react-router-dom'

const cabinStyles = {
  Economy: 'bg-slate-700/60 text-slate-200',
  Business: 'bg-cyan-500/20 text-cyan-300',
  'First Class': 'bg-gradient-to-r from-amber-400/20 to-fuchsia-400/20 text-amber-300',
}

export default function FlightCard({ flight }) {
  const soldOut = flight.seats_available <= 0

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-lg shadow-black/20 transition-colors hover:border-cyan-400/30">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {flight.airline} · {flight.flight_number}
          </span>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${cabinStyles[flight.cabin_class] ?? cabinStyles.Economy}`}>
            {flight.cabin_class}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <div>
            <p className="text-2xl font-bold text-white">{flight.origin_code}</p>
            <p className="text-xs text-slate-400">{flight.origin_city}</p>
          </div>
          <div className="flex flex-1 flex-col items-center px-2">
            <span className="text-xs text-slate-500">{flight.duration}</span>
            <div className="my-1 h-px w-full bg-gradient-to-r from-transparent via-slate-500 to-transparent" />
            {flight.international && (
              <span className="text-[10px] font-semibold uppercase tracking-wide text-fuchsia-400">International</span>
            )}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{flight.destination_code}</p>
            <p className="text-xs text-slate-400">{flight.destination_city}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
          <span>{flight.departure_date} · {flight.departure_time} → {flight.arrival_time}</span>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div>
          <p className="text-xl font-extrabold text-white">${Number(flight.price).toLocaleString()}</p>
          <p className={`text-xs ${soldOut ? 'text-rose-400' : 'text-slate-500'}`}>
            {soldOut ? 'Sold out' : `${flight.seats_available} seats left`}
          </p>
        </div>
        <Link
          to={`/flights/${flight.id}`}
          className="rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-fuchsia-500/20 transition-transform hover:scale-105"
        >
          Book Now
        </Link>
      </div>
    </div>
  )
}
