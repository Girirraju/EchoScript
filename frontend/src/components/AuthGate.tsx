import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { bearerToken, beginLogin, completeLogin, mockAuth } from '../auth/session'

export function AuthGate({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [state, setState] = useState<'ready' | 'loading' | 'error'>(mockAuth ? 'ready' : 'loading')
  useEffect(() => {
    if (mockAuth) return
    let cancelled = false
    const fail = () => { if (!cancelled) setState('error') }
    if (location.pathname === '/auth/callback') {
      setState('loading')
      completeLogin().then(() => {
        if (!cancelled) navigate('/dashboard', { replace: true })
      }).catch(fail)
    } else if (location.pathname === '/') {
      setState('ready')
    } else if (!bearerToken()) {
      setState('loading')
      beginLogin().catch(fail)
    } else {
      setState('ready')
    }
    return () => { cancelled = true }
  }, [location.pathname, navigate])
  if (state === 'loading') return <div className="center-page"><h1>Securely signing you in…</h1><p>Completing the Cognito authorization flow.</p></div>
  if (state === 'error') return <div className="center-page"><h1>Session could not be started</h1><p>Return to the welcome page and try again.</p><a className="button primary" href="/">Return home</a></div>
  return children
}
