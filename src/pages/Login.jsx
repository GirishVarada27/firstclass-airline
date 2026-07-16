import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { signIn } from '../lib/auth-client'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: signInError } = await signIn.email({ email, password })
    setLoading(false)
    if (signInError) {
      setError(signInError.message || 'Invalid email or password')
      return
    }
    navigate(location.state?.from || '/my-bookings')
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold text-white">Log in to FirstClass</h1>
      <p className="mt-1 text-sm text-slate-400">Access your bookings and member discounts.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-sm text-rose-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Don't have an account? <Link to="/signup" className="font-semibold text-cyan-300 hover:underline">Sign up</Link>
      </p>
      <p className="mt-2 text-center text-sm text-slate-500">
        Or continue as a <Link to="/flights" className="font-semibold text-slate-300 hover:underline">guest</Link>.
      </p>
    </div>
  )
}
