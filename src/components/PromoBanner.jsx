import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function PromoBanner() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setOpen(true), 400)
    return () => clearTimeout(timer)
  }, [])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-fuchsia-600 via-purple-600 to-cyan-500 p-1 shadow-2xl shadow-fuchsia-900/40"
      >
        <div className="rounded-[14px] bg-slate-950/90 p-6 text-center">
          <button
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="absolute right-3 top-3 rounded-full p-1 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">Limited-time offer</p>
          <h2 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">
            <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-300 bg-clip-text text-transparent">
              25% off hotels
            </span>
            <br />for the first 100 sign-ups
          </h2>
          <p className="mt-3 text-sm text-slate-300">
            Create your free FirstClass account now and lock in a 25% discount on your next hotel booking anywhere in the world.
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link
              to="/signup"
              onClick={() => setOpen(false)}
              className="rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/30 transition-transform hover:scale-105"
            >
              Claim My Discount
            </Link>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full border border-white/15 px-5 py-2 text-sm font-medium text-slate-300 hover:bg-white/5"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
