import { Navigate, useLocation } from 'react-router-dom'
import { useSession } from '../lib/auth-client'

export default function RequireAuth({ children }) {
  const { data: session, isPending } = useSession()
  const location = useLocation()

  if (isPending) {
    return <p className="text-slate-400 text-center py-16">Loading...</p>
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return children
}
