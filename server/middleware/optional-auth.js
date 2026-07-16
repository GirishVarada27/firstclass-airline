import { fromNodeHeaders } from 'better-auth/node'
import { auth } from '../auth.js'

export async function optionalAuth(req, res, next) {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) })
  req.user = session?.user ?? null
  next()
}
