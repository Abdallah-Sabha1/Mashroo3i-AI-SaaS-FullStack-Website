/**
 * LoginPage.jsx
 * ─────────────────────────────────────────────────────────────────────────
 * Email + password form. Calls POST /api/auth/login via useAuth().login().
 * On success → /dashboard. On failure → ErrorBanner with backend message.
 */

import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { AuthLayout } from '../../styles'
import { useAuth } from '../../context/AuthContext'
import { inputStyle, focusHandlers, FieldWrapper, ErrorBanner, FormCard } from './formHelpers'

const MailIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>
const LockIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>

export default function LoginPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  // Show message when api.js redirects here after a 401
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('expired') === '1') setError('Your session expired. Please sign in again.')
  }, [location.search])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) { setError('Both fields are required.'); return }
    setLoading(true); setError('')
    try {
      await login(email, password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message ?? 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your account">
      <FormCard>
        <form onSubmit={handleSubmit} noValidate>
          {error && <ErrorBanner message={error} />}

          <FieldWrapper label="Email address" id="email" required>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:'0.75rem', top:'50%', transform:'translateY(-50%)', color:'#1D9E75', display:'flex', pointerEvents:'none' }}><MailIcon /></span>
              <input id="email" type="email" autoComplete="email" placeholder="you@example.com"
                value={email} onChange={e => { setEmail(e.target.value); setError('') }}
                disabled={loading} style={{ ...inputStyle, paddingLeft:'2.5rem' }} {...focusHandlers} />
            </div>
          </FieldWrapper>

          <FieldWrapper label="Password" id="password" required style={{ marginBottom:'1.75rem' }}
            rightLabel={<a href="#" onClick={e => e.preventDefault()} style={{ fontSize:'0.75rem', color:'#1D9E75', textDecoration:'none', fontWeight:500 }}>Forgot password?</a>}
          >
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:'0.75rem', top:'50%', transform:'translateY(-50%)', color:'#1D9E75', display:'flex', pointerEvents:'none' }}><LockIcon /></span>
              <input id="password" type="password" autoComplete="current-password" placeholder="Enter your password"
                value={password} onChange={e => { setPassword(e.target.value); setError('') }}
                disabled={loading} style={{ ...inputStyle, paddingLeft:'2.5rem' }} {...focusHandlers} />
            </div>
          </FieldWrapper>

          <button type="submit" disabled={loading}
            style={{ width:'100%', padding:'0.75rem', background: loading ? '#168564' : '#1D9E75', color:'#fff', border:'none', borderRadius:'0.5rem', fontSize:'0.9375rem', fontWeight:600, cursor: loading ? 'not-allowed' : 'pointer', transition:'background 0.15s ease' }}
            onMouseEnter={e => { if (!loading) e.target.style.background = '#168564' }}
            onMouseLeave={e => { if (!loading) e.target.style.background = '#1D9E75' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign:'center', fontSize:'0.875rem', color:'#9ca3af', marginTop:'1.5rem', marginBottom:0 }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color:'#1D9E75', fontWeight:600, textDecoration:'none' }}>Sign up</Link>
        </p>
      </FormCard>
    </AuthLayout>
  )
}