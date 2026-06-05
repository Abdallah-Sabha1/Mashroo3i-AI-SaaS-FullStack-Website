/**
 * PricingPage.jsx — /pricing
 * Pay-per-evaluation model. Three credit packs.
 */

import { useNavigate } from 'react-router-dom'
import { useAuth }    from '../context/AuthContext'
import Navbar  from '../styles/components/Navbar'
import Footer  from '../styles/components/Footer'
import { C }   from '../styles/components/DashNavbar'

// ── Icons ─────────────────────────────────────────────────────────────────────

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke={C.brand500} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)

const IconZap = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
)

// ── Pack data ─────────────────────────────────────────────────────────────────

const PACKS = [
  {
    key:         'starter',
    name:        'Starter',
    credits:     1,
    price:       3,
    perCredit:   '3 JOD / evaluation',
    badge:       null,
    description: 'Try it once. Perfect for validating a single idea.',
    features: [
      'Full AI evaluation & scoring',
      'SWOT & risk assessment',
      'Market & competitor analysis',
      'Growth opportunities report',
    ],
    isPrimary: false,
  },
  {
    key:         'value',
    name:        'Value Pack',
    credits:     3,
    price:       8,
    perCredit:   '2.67 JOD / evaluation',
    badge:       'Most Popular',
    description: 'Evaluate multiple ideas or iterate on one.',
    features: [
      'Everything in Starter × 3',
      'Save 1 JOD vs buying separately',
      'Credits never expire',
      'Use across any of your ideas',
    ],
    isPrimary: true,
  },
  {
    key:         'builder',
    name:        'Builder Pack',
    credits:     5,
    price:       12,
    perCredit:   '2.40 JOD / evaluation',
    badge:       'Best Value',
    description: 'For serious founders who want to explore options.',
    features: [
      'Everything in Starter × 5',
      'Save 3 JOD vs buying separately',
      'Credits never expire',
      'Use across any of your ideas',
    ],
    isPrimary: false,
  },
]

// ── Pack card ─────────────────────────────────────────────────────────────────

function PackCard({ pack, onBuy }) {
  const { name, credits, price, perCredit, badge, description, features, isPrimary } = pack

  return (
    <div style={{
      background: '#fff',
      border: `${isPrimary ? '2px' : '1px'} solid ${isPrimary ? C.brand400 : C.n200}`,
      borderRadius: '1.25rem',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      boxShadow: isPrimary
        ? `0 8px 32px ${C.brand500}22, 0 2px 8px rgba(0,0,0,0.05)`
        : '0 1px 4px rgba(0,0,0,0.05)',
    }}>
      {/* Badge */}
      {badge && (
        <div style={{
          position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)',
          padding: '0.25rem 0.875rem', borderRadius: '99px',
          background: `linear-gradient(90deg, ${C.brand500}, ${C.brand400})`,
          fontSize: '0.6875rem', fontWeight: 800, color: '#fff',
          letterSpacing: '0.06em', textTransform: 'uppercase',
          boxShadow: `0 2px 10px ${C.brand500}40`, whiteSpace: 'nowrap',
        }}>
          {badge}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <span style={{
          fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: isPrimary ? C.brand500 : C.n500,
        }}>
          {name}
        </span>
        <p style={{ fontSize: '0.875rem', color: C.n500, margin: '0.25rem 0 0', lineHeight: 1.4 }}>
          {description}
        </p>
      </div>

      {/* Price */}
      <div style={{ marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.35rem' }}>
          <span style={{ fontSize: '2.5rem', fontWeight: 800, color: C.n900, letterSpacing: '-0.03em', lineHeight: 1 }}>
            {price} JOD
          </span>
        </div>
        <div style={{ fontSize: '0.8125rem', color: C.n400, marginTop: '0.25rem', fontWeight: 500 }}>
          {perCredit}
        </div>
      </div>

      {/* Credits badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
        padding: '0.3rem 0.75rem', borderRadius: '99px',
        background: isPrimary ? C.brand50 : C.n50,
        border: `1px solid ${isPrimary ? C.brand200 : C.n200}`,
        fontSize: '0.8125rem', fontWeight: 700,
        color: isPrimary ? C.brand700 : C.n600,
        marginBottom: '1.5rem', alignSelf: 'flex-start',
      }}>
        <IconZap/>
        {credits} evaluation{credits > 1 ? 's' : ''}
      </div>

      <div style={{ height: '1px', background: C.n100, marginBottom: '1.25rem' }}/>

      {/* Features */}
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {features.map(f => (
          <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.875rem', color: C.n700 }}>
            <span style={{
              width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
              background: C.brand50, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <IconCheck/>
            </span>
            {f}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        onClick={() => onBuy(pack.key)}
        style={{
          width: '100%', padding: '0.8125rem',
          borderRadius: '0.625rem',
          border: isPrimary ? 'none' : `1.5px solid ${C.n200}`,
          background: isPrimary
            ? `linear-gradient(180deg, ${C.brand500} 0%, ${C.brand600} 100%)`
            : '#fff',
          color: isPrimary ? '#fff' : C.n700,
          fontWeight: 700, fontSize: '0.9375rem', fontFamily: 'inherit',
          cursor: 'pointer',
          boxShadow: isPrimary ? `0 4px 14px ${C.brand500}35` : 'none',
          transition: 'all 0.15s ease',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
        }}
        onMouseEnter={e => { if (isPrimary) e.currentTarget.style.transform = 'translateY(-1px)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
      >
        Get {credits} Credit{credits > 1 ? 's' : ''} — {price} JOD
        {isPrimary && <IconArrow/>}
      </button>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const navigate            = useNavigate()
  const { isAuthenticated } = useAuth()

  function handleBuy(packKey) {
    if (!isAuthenticated) { navigate('/login'); return }
    navigate(`/checkout?pack=${packKey}`)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Navbar/>

      {/* Hero */}
      <section style={{
        background: `linear-gradient(150deg, ${C.brand700} 0%, ${C.brand500} 60%, ${C.brand400} 100%)`,
        padding: 'clamp(3.5rem, 8vw, 6rem) 2rem 5rem',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }}/>
        <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.35rem 1rem', borderRadius: '99px',
            border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.12)',
            marginBottom: '1.5rem',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff', opacity: 0.85 }}/>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
              Pay per evaluation
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, color: '#fff', margin: '0 0 1rem', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Only pay for what you use
          </h1>
          <p style={{ fontSize: '1.0625rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, margin: 0 }}>
            Buy evaluation credits. Each credit gives you the full AI report — scoring, SWOT, market analysis, and growth opportunities.
          </p>
        </div>
        <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0, lineHeight: 0 }}>
          <svg viewBox="0 0 1440 56" preserveAspectRatio="none" style={{ width: '100%', height: '56px', display: 'block' }}>
            <path d="M0,28 C360,56 1080,0 1440,28 L1440,56 L0,56 Z" fill="#f9fafb"/>
          </svg>
        </div>
      </section>

      {/* Packs */}
      <section style={{ padding: '4rem 2rem 5rem', maxWidth: '960px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
          {PACKS.map(pack => (
            <PackCard key={pack.key} pack={pack} onBuy={handleBuy}/>
          ))}
        </div>

        {/* FAQ strip */}
        <div style={{
          marginTop: '3rem', padding: '1.5rem 2rem',
          background: '#fff', border: `1px solid ${C.n200}`, borderRadius: '1rem',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem',
        }}>
          {[
            { q: 'Do credits expire?',          a: 'No. Credits stay on your account until you use them.' },
            { q: 'Can I re-evaluate an idea?',   a: 'Yes. Each evaluation run costs one credit, including re-runs.' },
            { q: 'What does one credit cover?',  a: 'The full report — AI score, SWOT, market analysis, growth opportunities.' },
          ].map(({ q, a }) => (
            <div key={q}>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: C.n900, marginBottom: '0.3rem' }}>{q}</div>
              <div style={{ fontSize: '0.8125rem', color: C.n500, lineHeight: 1.55 }}>{a}</div>
            </div>
          ))}
        </div>
      </section>

      <Footer/>
    </div>
  )
}