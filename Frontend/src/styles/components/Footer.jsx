/**
 * Footer.jsx — Shared footer component for all public pages.
 * Import this in LandingPage, AboutPage, ContactPage, and any future public page.
 * Dark background, multi-column links, social icons, newsletter signup.
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { C } from './Navbar'

const COLUMNS = [
  {
    heading: 'Product',
    links: [
      { label: 'Features',      href: '/#features' },
      { label: 'How it works',  href: '/#stats'    },
      { label: 'Pricing',       href: '/pricing'   },
      { label: 'FAQ',           href: '/faq'        },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About Us',    href: '/about'   },
      { label: 'Contact Us',  href: '/contact' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Business Plan Guide',   href: '/resources/business-plan'   },
      { label: 'Market Research Tips',  href: '/resources/market-research' },
      { label: 'Financial Planning 101',href: '/resources/finance'         },
      { label: 'Startup Checklist',     href: '/resources/checklist'       },
    ],
  },
]

const SOCIAL = [
  {
    label: 'Instagram',
    href: '#',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: '#',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/>
        <rect x="2" y="9" width="4" height="12"/>
        <circle cx="4" cy="4" r="2"/>
      </svg>
    ),
  },
  {
    label: 'X / Twitter',
    href: '#',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    label: 'Facebook',
    href: '#',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
      </svg>
    ),
  },
]

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setEmail('')
    }
  }

  const dark = '#0f1923'
  const darker = '#0b1219'
  const muted = 'rgba(255,255,255,0.45)'
  const mutedHover = 'rgba(255,255,255,0.8)'
  const border = 'rgba(255,255,255,0.08)'

  return (
    <footer style={{ backgroundColor: dark, color: '#fff', fontFamily:"'Inter','Segoe UI',system-ui,sans-serif" }}>

      {/* ── Main grid ─────────────────────────────────────────────────────── */}
      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'4rem 2rem 3rem', display:'grid', gridTemplateColumns:'280px repeat(3, 1fr)', gap:'3rem', flexWrap:'wrap' }}
        className="footer-grid">
        
        {/* Brand column */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
          <Link to="/" style={{ textDecoration:'none', display:'inline-block' }}>
            <img
              src="/public/logo1 green & black.svg"
              alt="Mashroo3i"
              style={{ height:'80px', width:'auto', objectFit:'contain', filter:'brightness(0) invert(1)' }}
            />
          </Link>
          <p style={{ fontSize:'0.9375rem', color:muted, lineHeight:1.75, margin:0, maxWidth:'220px' }}>
            AI-powered business planning built for entrepreneurs across Jordan.
          </p>

          {/* Newsletter */}
          <div style={{ marginTop:'0.5rem' }}>
            <p style={{ fontSize:'0.875rem', fontWeight:600, color:'rgba(255,255,255,0.85)', margin:'0 0 0.625rem' }}>
              Get startup insights
            </p>
            {subscribed ? (
              <p style={{ fontSize:'0.875rem', color:C.brand400, fontWeight:600 }}>✓ You're in — check your inbox.</p>
            ) : (
              <form onSubmit={handleSubscribe} style={{ display:'flex', gap:'0.5rem' }}>
                <input
                  type="email"
                  value={email}
                  onChange={e=>setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  style={{
                    flex:1, minWidth:0,
                    padding:'0.6rem 0.875rem',
                    borderRadius:'0.5rem',
                    border:`1px solid ${border}`,
                    backgroundColor:'rgba(255,255,255,0.07)',
                    color:'#fff',
                    fontSize:'0.8125rem',
                    outline:'none',
                  }}
                />
                <button type="submit" style={{
                  padding:'0.6rem 1rem',
                  borderRadius:'0.5rem',
                  backgroundColor:C.brand500,
                  color:'#fff',
                  fontWeight:700,
                  fontSize:'0.8125rem',
                  border:'none',
                  cursor:'pointer',
                  whiteSpace:'nowrap',
                  transition:'background 0.15s ease',
                }}
                  onMouseEnter={e=>e.currentTarget.style.backgroundColor=C.brand600}
                  onMouseLeave={e=>e.currentTarget.style.backgroundColor=C.brand500}
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Link columns */}
        {COLUMNS.map(col => (
          <div key={col.heading}>
            <p style={{ fontSize:'0.75rem', fontWeight:700, color:'rgba(255,255,255,0.9)', textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 0 1.25rem' }}>
              {col.heading}
            </p>
            <ul style={{ listStyle:'none', margin:0, padding:0, display:'flex', flexDirection:'column', gap:'0.75rem' }}>
              {col.links.map(link => (
                <li key={link.label}>
                  <FooterLink href={link.href} label={link.label} muted={muted} mutedHover={mutedHover} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ── Bottom bar ────────────────────────────────────────────────────── */}
      <div style={{ borderTop:`1px solid ${border}`, backgroundColor: darker }}>
        <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'1.25rem 2rem', display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:'1rem' }}>
          
          {/* Copyright */}
          <p style={{ fontSize:'0.8125rem', color:muted, margin:0 }}>
            &copy; {new Date().getFullYear()} Mashroo3i. All rights reserved.
            <span style={{ margin:'0 0.5rem', opacity:0.4 }}>·</span>
            <a href="/privacy" style={{ color:muted, textDecoration:'none' }}
              onMouseEnter={e=>e.currentTarget.style.color=mutedHover}
              onMouseLeave={e=>e.currentTarget.style.color=muted}>
              Privacy Policy
            </a>
            <span style={{ margin:'0 0.5rem', opacity:0.4 }}>·</span>
            <a href="/terms" style={{ color:muted, textDecoration:'none' }}
              onMouseEnter={e=>e.currentTarget.style.color=mutedHover}
              onMouseLeave={e=>e.currentTarget.style.color=muted}>
              Terms of Use
            </a>
          </p>

          {/* Built in Jordan badge */}
          <p style={{ fontSize:'0.8125rem', color:muted, margin:0, display:'flex', alignItems:'center', gap:'0.375rem' }}>
            <span>🇯🇴</span> Built for entrepreneurs across Jordan
          </p>

          {/* Social icons */}
          <div style={{ display:'flex', gap:'0.75rem' }}>
            {SOCIAL.map(s => (
              <a key={s.label} href={s.href} aria-label={s.label}
                style={{ width:'36px', height:'36px', borderRadius:'0.5rem', backgroundColor:'rgba(255,255,255,0.07)', border:`1px solid ${border}`, display:'flex', alignItems:'center', justifyContent:'center', color:muted, textDecoration:'none', transition:'all 0.15s ease' }}
                onMouseEnter={e=>{ e.currentTarget.style.backgroundColor='rgba(255,255,255,0.14)'; e.currentTarget.style.color='#fff' }}
                onMouseLeave={e=>{ e.currentTarget.style.backgroundColor='rgba(255,255,255,0.07)'; e.currentTarget.style.color=muted }}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 560px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  )
}

/* ── Helper ──────────────────────────────────────────────────────────────── */
function FooterLink({ href, label, muted, mutedHover }) {
  const [hov, setHov] = useState(false)
  const isHash = href.startsWith('/#') || href.startsWith('#')
  const style = { fontSize:'0.875rem', color: hov ? mutedHover : muted, textDecoration:'none', transition:'color 0.15s ease' }
  return isHash
    ? <a href={href} style={style} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>{label}</a>
    : <Link to={href} style={style} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>{label}</Link>
}