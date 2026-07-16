import { Link } from 'react-router-dom'

const categories = [
  {
    to: '/flights',
    title: 'Flights',
    tagline: 'Domestic & international routes, booked in seconds — no account required.',
    icon: '✈️',
  },
  {
    to: '/hotels',
    title: 'Hotels',
    tagline: 'Curated stays in 50 major cities worldwide.',
    icon: '🏨',
  },
  {
    to: '/tours',
    title: 'City Tours',
    tagline: 'Guided small-group experiences in 20 iconic cities.',
    icon: '🗺️',
  },
]

export default function Home() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-[-10%] h-96 w-96 rounded-full bg-fuchsia-600/20 blur-[120px]" />
          <div className="absolute right-1/4 top-[10%] h-96 w-96 rounded-full bg-cyan-500/20 blur-[120px]" />
        </div>

        <div className="mx-auto max-w-5xl px-4 py-24 text-center sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Welcome to the future of travel</p>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight text-white sm:text-6xl">
            Fly <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-300 bg-clip-text text-transparent">First</span>
            <span className="bg-gradient-to-r from-fuchsia-400 to-amber-300 bg-clip-text text-transparent">Class</span>, everywhere.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
            Book international flights, five-star hotels, and guided city tours across the globe —
            as a guest in under a minute, or sign up for member-only discounts.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/flights"
              className="rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-7 py-3 text-base font-semibold text-white shadow-lg shadow-fuchsia-500/30 transition-transform hover:scale-105"
            >
              Search Flights
            </Link>
            <Link
              to="/signup"
              className="rounded-full border border-white/20 px-7 py-3 text-base font-semibold text-slate-100 hover:bg-white/5"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-3">
          {categories.map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-lg shadow-black/20 transition-all hover:-translate-y-1 hover:border-cyan-400/40"
            >
              <span className="text-4xl">{c.icon}</span>
              <h3 className="mt-4 text-xl font-bold text-white">{c.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{c.tagline}</p>
              <span className="mt-4 inline-block text-sm font-semibold text-cyan-300 group-hover:underline">
                Explore {c.title.toLowerCase()} →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 rounded-3xl border border-amber-400/20 bg-gradient-to-r from-amber-500/10 via-fuchsia-500/10 to-cyan-500/10 p-8 text-center sm:flex-row sm:text-left">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-300">FirstClass Visa Services</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Traveling internationally? We'll handle your visa paperwork.</h2>
            <p className="mt-2 max-w-xl text-sm text-slate-400">
              Fast-tracked visa assistance for over 100 destinations — document checklists, application review, and embassy scheduling support.
            </p>
          </div>
          <Link
            to="/visa-services"
            className="shrink-0 rounded-full bg-gradient-to-r from-amber-400 to-fuchsia-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition-transform hover:scale-105"
          >
            Explore Visa Services
          </Link>
        </div>
      </section>
    </div>
  )
}
