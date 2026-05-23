/**
 * CheckoutPage.jsx — /checkout?pack=starter|value|builder
 * Buy evaluation credits with a card.
 */

import { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { AppLayout } from '../styles'
import { C } from '../styles/components/DashNavbar'
import { inputStyle, focusHandlers, FieldWrapper, ErrorBanner } from '../pages/auth/formHelpers'
import { purchaseCredits } from '../services/creditsService'
import { useCredits } from '../context/CreditsContext'

// ── Pack definitions (mirrors backend) ───────────────────────────────────────

const PACKS = {
  starter: { name: 'Starter',     credits: 1, price: 3  },
  value:   { name: 'Value Pack',  credits: 3, price: 8  },
  builder: { name: 'Builder Pack', credits: 5, price: 12 },
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const IconCard = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
)

const IconLock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke={C.brand500} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)

const IconCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke={C.brand500} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const IconZap = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
)

// ── Main ──────────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const [searchParams] = useSearchParams()
  const navigate       = useNavigate()
  const { refresh }    = useCredits()

  const packKey    = searchParams.get('pack') ?? 'value'
  const pack       = PACKS[packKey] ?? PACKS.value

  const [card,    setCard]    = useState({ number: '', expiry: '', cvv: '' })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const [done,    setDone]    = useState(false)

  async function handleSubmit() {
    setError(null)
    if (!card.number || !card.expiry || !card.cvv) {
      setError('Please fill in all card fields.')
      return
    }
    setLoading(true)
    try {
      await purchaseCredits({ pack: packKey, cardNumber: card.number, expiry: card.expiry, cvv: card.cvv })
      await refresh()
      setDone(true)
    } catch (err) {
      setError(err.message ?? 'Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Success state ───────────────────────────────────────────────────────────
  if (done) {
    return (
      <AppLayout>
        <div style={{ maxWidth: '440px', margin: '4rem auto', textAlign: 'center', padding: '0 1rem' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: C.brand50, border: `2px solid ${C.brand200}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', color: C.brand500 }}>
            <IconCheck/>
          </div>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: C.n900, margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>
            Credits added!
          </h2>
          <p style={{ fontSize: '0.9375rem', color: C.n500, margin: '0 0 2rem', lineHeight: 1.6 }}>
            {pack.credits} evaluation credit{pack.credits > 1 ? 's' : ''} added to your account. Start evaluating now.
          </p>
          <button
            onClick={() => navigate('/submit-idea')}
            style={{ padding: '0.875rem 2rem', borderRadius: '0.625rem', border: 'none', background: `linear-gradient(180deg, ${C.brand500} 0%, ${C.brand600} 100%)`, color: '#fff', fontWeight: 700, fontSize: '1rem', fontFamily: 'inherit', cursor: 'pointer', boxShadow: `0 4px 14px ${C.brand500}35` }}
          >
            Evaluate an Idea →
          </button>
        </div>
      </AppLayout>
    )
  }

  // ── Checkout form ───────────────────────────────────────────────────────────
  return (
    <AppLayout>
      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '0 1rem' }}>

        {/* Back */}
        <Link to="/buy-credits" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', fontWeight: 600, color: C.n500, textDecoration: 'none', marginBottom: '1.5rem', transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = C.brand500}
          onMouseLeave={e => e.currentTarget.style.color = C.n500}
        >
          ← Back to buy credits
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>

          {/* Left — card form */}
          <div style={{ background: '#fff', border: `1px solid ${C.n200}`, borderRadius: '1rem', padding: '1.75rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: C.n900, margin: '0 0 0.25rem', letterSpacing: '-0.02em' }}>
              Payment details
            </h1>
            <p style={{ fontSize: '0.875rem', color: C.n500, margin: '0 0 1.75rem' }}>
              Your card is charged once. Credits never expire.
            </p>

            {error && <ErrorBanner message={error}/>}

            <FieldWrapper label="Card number" icon={<IconCard/>}>
              <input
                type="text" placeholder="1234 5678 9012 3456" maxLength={19}
                value={card.number}
                onChange={e => setCard(p => ({ ...p, number: e.target.value }))}
                style={inputStyle}
                {...focusHandlers}
              />
            </FieldWrapper>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <FieldWrapper label="Expiry">
                <input
                  type="text" placeholder="MM / YY" maxLength={7}
                  value={card.expiry}
                  onChange={e => setCard(p => ({ ...p, expiry: e.target.value }))}
                  style={inputStyle}
                  {...focusHandlers}
                />
              </FieldWrapper>
              <FieldWrapper label="CVV">
                <input
                  type="text" placeholder="123" maxLength={4}
                  value={card.cvv}
                  onChange={e => setCard(p => ({ ...p, cvv: e.target.value }))}
                  style={inputStyle}
                  {...focusHandlers}
                />
              </FieldWrapper>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: '100%', marginTop: '0.75rem',
                padding: '0.9rem', borderRadius: '0.625rem', border: 'none',
                background: loading ? C.n200 : `linear-gradient(180deg, ${C.brand500} 0%, ${C.brand600} 100%)`,
                color: loading ? C.n400 : '#fff',
                fontWeight: 700, fontSize: '1rem', fontFamily: 'inherit',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : `0 4px 14px ${C.brand500}35`,
                transition: 'all 0.15s',
              }}
            >
              {loading ? 'Processing…' : `Pay ${pack.price} JOD`}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '1rem', color: C.n400, fontSize: '0.8125rem' }}>
              <IconLock/> Secured payment
            </div>
          </div>

          {/* Right — order summary */}
          <div style={{ background: '#fff', border: `1px solid ${C.n200}`, borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: C.n400, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '1rem' }}>
              Order Summary
            </div>

            {/* Pack */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: `1px solid ${C.n100}` }}>
              <div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: C.n900 }}>{pack.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8125rem', color: C.n500, marginTop: '0.2rem' }}>
                  <IconZap/> {pack.credits} evaluation{pack.credits > 1 ? 's' : ''}
                </div>
              </div>
              <div style={{ fontSize: '1.125rem', fontWeight: 800, color: C.n900 }}>
                {pack.price} JOD
              </div>
            </div>

            {/* Total */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: C.n700 }}>Total</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: C.n900 }}>{pack.price} JOD</span>
            </div>

            {/* What you get */}
            <div style={{ padding: '1rem', background: C.n50, borderRadius: '0.625rem', border: `1px solid ${C.n100}` }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: C.n400, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '0.75rem' }}>
                What's included
              </div>
              {['AI scoring & verdict', 'SWOT & risk analysis', 'Market & competitors', 'Growth opportunities'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: C.n600, marginBottom: '0.4rem' }}>
                  <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: C.brand50, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={C.brand500} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </span>
                  {item}
                </div>
              ))}
            </div>

            {/* Pack switcher */}
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: C.n400, marginBottom: '0.25rem' }}>Switch pack</div>
              {Object.entries(PACKS).map(([key, p]) => (
                <Link key={key} to={`/checkout?pack=${key}`}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.5rem 0.75rem', borderRadius: '0.5rem', textDecoration: 'none',
                    border: `1px solid ${key === packKey ? C.brand300 : C.n200}`,
                    background: key === packKey ? C.brand50 : '#fff',
                    transition: 'all 0.12s',
                  }}
                >
                  <span style={{ fontSize: '0.8125rem', fontWeight: key === packKey ? 700 : 500, color: key === packKey ? C.brand700 : C.n600 }}>
                    {p.name}
                  </span>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: key === packKey ? C.brand600 : C.n500 }}>
                    {p.price} JOD
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}