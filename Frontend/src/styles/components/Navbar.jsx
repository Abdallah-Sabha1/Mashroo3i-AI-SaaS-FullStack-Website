/**
 * Navbar.jsx — Shared navigation bar used across public pages.
 * Import this in LandingPage, AboutPage, and any future public page.
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'

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

export default function Navbar() {
  const [open, setOpen] = useState(false)

  const navLinks = [
    ['/#features', 'Features'],
    ['/about',     'About us'],
    ['/pricing',   'Pricing'],
  ]

  return (
    <nav style={{
      position:'sticky', top:0, zIndex:50,
      backgroundColor:'rgba(255,255,255,0.97)',
      backdropFilter:'blur(12px)',
      borderBottom:`1px solid ${C.n200}`,
    }}>
      <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'0 2rem', height:'68px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <Link to="/" style={{ display:'flex', alignItems:'center', textDecoration:'none' }}>
          <img
            src="/public/logo1 green & black.svg"
            alt="Mashroo3i"
            style={{ height:'90px', width:'auto', objectFit:'contain' }}
          />
        </Link>

        {/* Desktop nav */}
        <div style={{ display:'flex', gap:'0.125rem' }} className="ld-desk">
          {navLinks.map(([href, label]) => {
            const isHashLink = href.startsWith('/#')
            const sharedStyle = {
              padding:'0.5rem 0.875rem', borderRadius:'0.5rem',
              fontSize:'0.875rem', fontWeight:500,
              color: C.n600, textDecoration:'none',
              transition:'all 0.15s ease',
            }
            return isHashLink ? (
              <a
                key={href}
                href={href}
                style={sharedStyle}
                onMouseEnter={e=>{ e.currentTarget.style.color=C.n900; e.currentTarget.style.background=C.n100 }}
                onMouseLeave={e=>{ e.currentTarget.style.color=C.n600; e.currentTarget.style.background='transparent' }}
              >
                {label}
              </a>
            ) : (
              <Link
                key={href}
                to={href}
                style={sharedStyle}
                onMouseEnter={e=>{ e.currentTarget.style.color=C.n900; e.currentTarget.style.background=C.n100 }}
                onMouseLeave={e=>{ e.currentTarget.style.color=C.n600; e.currentTarget.style.background='transparent' }}
              >
                {label}
              </Link>
            )
          })}
        </div>

        <div style={{ display:'flex', gap:'0.625rem', alignItems:'center' }} className="ld-desk">
          <Link to="/login"
            style={{ padding:'0.5rem 1.125rem', borderRadius:'0.5rem', fontSize:'0.875rem', fontWeight:600, color:C.n700, textDecoration:'none', border:`1.5px solid ${C.n200}`, transition:'all 0.15s ease' }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.brand300; e.currentTarget.style.color=C.brand600 }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.n200; e.currentTarget.style.color=C.n700 }}>
            Sign in
          </Link>
          <Link to="/register"
            style={{ padding:'0.5rem 1.25rem', borderRadius:'0.5rem', fontSize:'0.875rem', fontWeight:700, color:'#fff', textDecoration:'none', backgroundColor:C.brand500, transition:'background 0.15s ease' }}
            onMouseEnter={e=>{ e.currentTarget.style.backgroundColor=C.brand600 }}
            onMouseLeave={e=>{ e.currentTarget.style.backgroundColor=C.brand500 }}>
            Get started free
          </Link>
        </div>

        {/* Mobile burger */}
        <button onClick={()=>setOpen(o=>!o)} className="ld-mob" style={{ background:'none', border:'none', cursor:'pointer', color:C.n700, padding:'0.375rem' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open
              ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
              : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
          </svg>
        </button>
      </div>

      {open && (
        <div style={{ borderTop:`1px solid ${C.n100}`, padding:'1rem 2rem 1.5rem', display:'flex', flexDirection:'column', gap:'0.375rem', background:'#fff' }}>
          {navLinks.map(([href, label]) => {
            const isHashLink = href.startsWith('/#')
            const style = { padding:'0.625rem 0.75rem', borderRadius:'0.5rem', fontSize:'0.9375rem', fontWeight:500, color:C.n700, textDecoration:'none' }
            return isHashLink
              ? <a key={href} href={href} onClick={()=>setOpen(false)} style={style}>{label}</a>
              : <Link key={href} to={href} onClick={()=>setOpen(false)} style={style}>{label}</Link>
          })}
          <Link to="/login" onClick={()=>setOpen(false)} style={{ padding:'0.625rem 0.75rem', borderRadius:'0.5rem', fontSize:'0.9375rem', fontWeight:500, color:C.n700, textDecoration:'none' }}>Sign in</Link>
          <Link to="/register" onClick={()=>setOpen(false)} style={{ marginTop:'0.25rem', padding:'0.75rem', textAlign:'center', borderRadius:'0.5rem', backgroundColor:C.brand500, color:'#fff', fontWeight:700, textDecoration:'none', fontSize:'0.9375rem' }}>Get started free</Link>
        </div>
      )}

      <style>{`
        html { scroll-behavior: smooth; }
        .ld-desk { display: flex !important; }
        .ld-mob  { display: none  !important; }
        @media (max-width: 640px) {
          .ld-desk { display: none  !important; }
          .ld-mob  { display: block !important; }
        }
      `}</style>
    </nav>
  )
}