import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useSession, signOut } from '../lib/auth-client'

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors ${
    isActive ? 'text-cyan-300' : 'text-slate-300 hover:text-cyan-300'
  }`

export default function Navbar() {
  const { data: session } = useSession()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <svg width="28" height="28" viewBox="0 0 64 64">
            <defs>
              <linearGradient id="navlogo" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
            <path d="M32 6 L38 26 L58 32 L38 38 L32 58 L26 38 L6 32 L26 26 Z" fill="url(#navlogo)" />
          </svg>
          <span className="text-lg font-bold tracking-tight text-white">
            First<span className="bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">Class</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/flights" className={navLinkClass}>Flights</NavLink>
          <NavLink to="/hotels" className={navLinkClass}>Hotels</NavLink>
          <NavLink to="/tours" className={navLinkClass}>City Tours</NavLink>
          <NavLink to="/visa-services" className={navLinkClass}>Visa Services</NavLink>
          {session && <NavLink to="/my-bookings" className={navLinkClass}>My Bookings</NavLink>}
        </nav>

        <div className="flex items-center gap-3">
          {session ? (
            <>
              <span className="hidden text-sm text-slate-400 sm:inline">{session.user.name}</span>
              <button
                onClick={handleSignOut}
                className="rounded-full border border-white/15 px-4 py-1.5 text-sm font-medium text-slate-200 transition-colors hover:border-white/30 hover:bg-white/5"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full px-4 py-1.5 text-sm font-medium text-slate-200 hover:text-white"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-4 py-1.5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition-transform hover:scale-105"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
      <nav className="flex items-center gap-4 overflow-x-auto border-t border-white/5 px-4 py-2 md:hidden">
        <NavLink to="/flights" className={navLinkClass}>Flights</NavLink>
        <NavLink to="/hotels" className={navLinkClass}>Hotels</NavLink>
        <NavLink to="/tours" className={navLinkClass}>Tours</NavLink>
        <NavLink to="/visa-services" className={navLinkClass}>Visa</NavLink>
        {session && <NavLink to="/my-bookings" className={navLinkClass}>Bookings</NavLink>}
      </nav>
    </header>
  )
}
