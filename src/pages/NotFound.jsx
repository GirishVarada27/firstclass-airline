import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-6xl font-extrabold text-transparent">404</p>
      <h1 className="mt-4 text-2xl font-bold text-white">This destination doesn't exist.</h1>
      <p className="mt-2 text-slate-400">Let's get you back on course.</p>
      <Link
        to="/"
        className="mt-6 rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20"
      >
        Back to Home
      </Link>
    </div>
  )
}
