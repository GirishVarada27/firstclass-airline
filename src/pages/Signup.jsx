import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signUp } from '../lib/auth-client'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: signUpError } = await signUp.email({ name, email, password })
    setLoading(false)
    if (signUpError) {
      setError(signUpError.message || 'Could not create your account')
      return
    }
    navigate('/my-bookings')
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-amber-300">25% off hotels for the first 100 sign-ups</p>
      <h1 className="mt-2 text-2xl font-bold text-white">Create your FirstClass account</h1>
      <p className="mt-1 text-sm text-slate-400">Track bookings and unlock member-only pricing.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">Full name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
            placeholder="Jane Traveler"
          />
        </div>
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
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
            placeholder="At least 8 characters"
          />
        </div>

        {error && <p className="text-sm text-rose-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account? <Link to="/login" className="font-semibold text-cyan-300 hover:underline">Log in</Link>
      </p>
      <p className="mt-2 text-center text-sm text-slate-500">
        Or continue as a <Link to="/flights" className="font-semibold text-slate-300 hover:underline">guest</Link>.
      </p>
    </div>
  )
}
