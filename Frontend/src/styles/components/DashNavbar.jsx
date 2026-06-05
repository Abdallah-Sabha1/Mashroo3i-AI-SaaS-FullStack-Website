/**
 * DashNavbar.jsx — Top navigation bar for all authenticated pages.
 * Same visual DNA as the public Navbar (sticky, blur, border-bottom)
 * but with dashboard-specific links and a profile dropdown.
 *
 * Links: Dashboard · New Idea · (profile icon)
 * Right: Avatar dropdown → My Profile / Subscription / Sign out
 */

import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCredits } from '../../context/CreditsContext'

export const C = {
  brand50:  '#edfaf5',
  brand100: '#d2f4e8',
  brand200: '#a8e9d1',
  brand300: '#70d8b5',
  brand400: '#35bf93',
  brand500: '#1D9E75',
  brand600: '#168564',
  brand700: '#126d53',
  brand800: '#105742',
  brand900: '#0e4736',
  n50:      '#f9fafb',
  n100:     '#f3f4f6',
  n200:     '#e5e7eb',
  n300:     '#d1d5db',
  n400:     '#9ca3af',
  n500:     '#6b7280',
  n600:     '#4b5563',
  n700:     '#374151',
  n900:     '#111827',
}

const NAV_LINKS = [
  { to: '/dashboard',   label: 'Dashboard'  },
  { to: '/submit-idea', label: 'Submit Idea' },
]

/* ── Avatar ─────────────────────────────────────────────────────────── */
export function Avatar({ name = '', size = 36 }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('') || '?'

  return (
    <div style={{
      width: `${size}px`, height: `${size}px`,
      borderRadius: '50%',
      background: `linear-gradient(135deg, ${C.brand400}, ${C.brand600})`,
      color: '#fff',
      fontWeight: 700,
      fontSize: size < 36 ? '0.6875rem' : '0.8125rem',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      letterSpacing: '0.02em',
      boxShadow: '0 2px 6px rgba(29,158,117,0.3)',
      userSelect: 'none',
    }}>
      {initials}
    </div>
  )
}

const menuItemBase = {
  display: 'flex', alignItems: 'center', gap: '0.625rem',
  padding: '0.55rem 0.75rem',
  borderRadius: '0.5rem',
  fontSize: '0.875rem', fontWeight: 500,
  color: C.n700,
  textDecoration: 'none',
  background: 'transparent',
  fontFamily: 'inherit',
  transition: 'background 0.12s ease',
  width: '100%',
  textAlign: 'left',
  border: 'none',
  cursor: 'pointer',
}

/* ── Credits Badge ───────────────────────────────────────────────────── */
function CreditsBadge({ credits }) {
  return (
    <span style={{
      fontSize: '0.6rem', fontWeight: 800,
      padding: '0.15rem 0.45rem',
      borderRadius: '99px',
      background: credits > 0 ? C.brand500 : C.n300,
      color: '#fff',
      letterSpacing: '0.05em',
      lineHeight: 1,
      flexShrink: 0,
    }}>
      {credits} {credits === 1 ? 'credit' : 'credits'}
    </span>
  )
}

/* ── Profile dropdown ───────────────────────────────────────────────── */
function ProfileDropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()
  const { credits } = useCredits()

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    setOpen(false)
    onLogout()
    navigate('/login', { replace: true })
  }

  const firstName = (user?.fullName ?? '').trim().split(/\s+/)[0] || 'Account'

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Open profile menu"
        aria-expanded={open}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: 'transparent',
          border: `1.5px solid ${open ? C.brand300 : C.n200}`,
          borderRadius: '2rem',
          padding: '0.25rem 0.75rem 0.25rem 0.25rem',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          fontFamily: 'inherit',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = C.brand300 }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.borderColor = C.n200 }}
      >
        <Avatar name={user?.fullName} />
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: C.n700 }}>{firstName}</span>
        <CreditsBadge credits={credits}/>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.n400} strokeWidth="2.5" strokeLinecap="round"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.15s ease', flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 0.5rem)', right: 0,
          minWidth: '220px',
          background: '#ffffff',
          border: `1px solid ${C.n200}`,
          borderRadius: '0.75rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
          overflow: 'hidden',
          zIndex: 100,
        }}>
          {/* User info header */}
          <div style={{ padding: '0.875rem 1rem', borderBottom: `1px solid ${C.n100}`, display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Avatar name={user?.fullName} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: C.n900, lineHeight: 1.3 }}>{user?.fullName}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.1rem' }}>
                <span style={{ fontSize: '0.75rem', color: C.n500 }}>{user?.role ?? 'User'}</span>
                {/* Plan badge inside dropdown header */}
<CreditsBadge credits={credits}/>
              </div>
            </div>
          </div>

          <div style={{ padding: '0.375rem' }}>
            {/* My Profile */}
            <Link to="/profile" onClick={() => setOpen(false)} style={menuItemBase}
              onMouseEnter={e => { e.currentTarget.style.background = C.n50 }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
              <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor" style={{ flexShrink: 0 }}>
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
              </svg>
              My Profile
            </Link>

            {/* Subscription */}
            <Link to="/buy-credits" onClick={() => setOpen(false)} style={menuItemBase}
              onMouseEnter={e => { e.currentTarget.style.background = C.n50 }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
              <span style={{ flex: 1 }}>Buy Credits</span>
            </Link>

            <div style={{ height: '1px', background: C.n100, margin: '0.375rem 0' }} />

            {/* Sign out */}
            <button onClick={handleLogout} style={{ ...menuItemBase, color: '#dc2626' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
              <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ flexShrink: 0 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7V4a1 1 0 00-1-1H4a1 1 0 00-1 1v12a1 1 0 001 1h8a1 1 0 001-1v-3M9 10h10m0 0l-3-3m3 3l-3 3"/>
              </svg>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── DashNavbar ─────────────────────────────────────────────────────── */
export default function DashNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navigate  = useNavigate()
  const { user, logout } = useAuth()
  const { credits }      = useCredits()

  const isActive = (to) => location.pathname === to

  const handleMobileLogout = () => {
    setMobileOpen(false)
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      backgroundColor: 'rgba(255,255,255,0.97)',
      backdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${C.n200}`,
    }}>
      <div style={{
        maxWidth: '1100px', margin: '0 auto',
        padding: '0 2rem', height: '68px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img src="/public/logo1 green & black.svg" alt="Mashroo3i"
            style={{ height: '90px', width: 'auto', objectFit: 'contain' }} />
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', gap: '0.125rem', alignItems: 'center' }} className="dn-desk">
          {NAV_LINKS.map(({ to, label }) => (
            <Link key={to} to={to} style={{
                padding: '0.5rem 0.875rem',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: isActive(to) ? 700 : 500,
                color: isActive(to) ? C.brand600 : C.n600,
                background: isActive(to) ? C.brand50 : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { if (!isActive(to)) { e.currentTarget.style.color = C.n900; e.currentTarget.style.background = C.n100 } }}
              onMouseLeave={e => { if (!isActive(to)) { e.currentTarget.style.color = C.n600; e.currentTarget.style.background = 'transparent' } }}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Desktop right: avatar dropdown */}
        <div style={{ display: 'flex', alignItems: 'center' }} className="dn-desk">
          <ProfileDropdown user={user} onLogout={logout} />
        </div>

        {/* Mobile burger */}
        <button onClick={() => setMobileOpen(o => !o)} className="dn-mob" aria-label="Toggle menu"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.n700, padding: '0.375rem' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {mobileOpen
              ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
              : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ borderTop: `1px solid ${C.n100}`, padding: '1rem 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.375rem', background: '#fff' }}>
          {/* User info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: C.n50, borderRadius: '0.75rem', marginBottom: '0.375rem' }}>
            <Avatar name={user?.fullName} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: C.n900 }}>{user?.fullName}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.1rem' }}>
                <span style={{ fontSize: '0.75rem', color: C.n500 }}>{user?.role ?? 'User'}</span>
                <CreditsBadge credits={credits}/>
              </div>
            </div>
          </div>

          {NAV_LINKS.map(({ to, label }) => (
            <Link key={to} to={to} onClick={() => setMobileOpen(false)} style={{
              padding: '0.625rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.9375rem',
              fontWeight: isActive(to) ? 700 : 500, color: isActive(to) ? C.brand600 : C.n700,
              background: isActive(to) ? C.brand50 : 'transparent', textDecoration: 'none',
            }}>{label}</Link>
          ))}

          <Link to="/profile" onClick={() => setMobileOpen(false)} style={{
            padding: '0.625rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.9375rem',
            fontWeight: isActive('/profile') ? 700 : 500, color: isActive('/profile') ? C.brand600 : C.n700,
            background: isActive('/profile') ? C.brand50 : 'transparent', textDecoration: 'none',
          }}>My Profile</Link>


          <button onClick={handleMobileLogout} style={{
            marginTop: '0.25rem', padding: '0.75rem', textAlign: 'center',
            borderRadius: '0.5rem', background: '#fef2f2', color: '#dc2626',
            fontWeight: 700, fontSize: '0.9375rem', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          }}>Sign out</button>
        </div>
      )}

      <style>{`
        html { scroll-behavior: smooth; }
        .dn-desk { display: flex !important; }
        .dn-mob  { display: none  !important; }
        @media (max-width: 640px) {
          .dn-desk { display: none  !important; }
          .dn-mob  { display: block !important; }
        }
      `}</style>
    </nav>
  )
}