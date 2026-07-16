import { Link } from 'react-router-dom'

export default function TourCard({ tour }) {
  const soldOut = tour.spots_available <= 0

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-lg shadow-black/20 transition-colors hover:border-cyan-400/30">
      <img src={tour.image} alt={tour.title} className="h-40 w-full object-cover" loading="lazy" />
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <h3 className="text-lg font-bold text-white">{tour.title}</h3>
          <p className="mt-1 text-sm text-slate-400">{tour.city}, {tour.country} · {tour.duration_hours}h guided tour</p>
          <p className="mt-2 line-clamp-2 text-sm text-slate-500">{tour.description}</p>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div>
            <p className="text-xl font-extrabold text-white">${Number(tour.price_per_person).toLocaleString()}<span className="text-sm font-normal text-slate-400">/person</span></p>
            <p className={`text-xs ${soldOut ? 'text-rose-400' : 'text-slate-500'}`}>
              {soldOut ? 'Fully booked' : `${tour.spots_available} spots left`}
            </p>
          </div>
          <Link
            to={`/tours/${tour.id}`}
            className="rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-fuchsia-500/20 transition-transform hover:scale-105"
          >
            View & Book
          </Link>
        </div>
      </div>
    </div>
  )
}
