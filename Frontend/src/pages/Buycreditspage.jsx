/**
 * BuyCreditsPage.jsx — /buy-credits  (protected)
 * In-app credits purchase for logged-in users.
 * Uses AppLayout (DashNavbar) — not the public Pricing page.
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppLayout } from '../styles'
import { C } from '../styles/components/DashNavbar'
import { inputStyle, focusHandlers, FieldWrapper, ErrorBanner } from './auth/formHelpers'
import { purchaseCredits } from '../services/creditsService'
import { useCredits } from '../context/CreditsContext'

// ── Pack definitions ──────────────────────────────────────────────────────────

const PACKS = [
  {
    key:       'starter',
    name:      'Starter',
    credits:   1,
    price:     3,
    note:      '3 JOD / evaluation',
    popular:   false,
  },
  {
    key:       'value',
    name:      'Value Pack',
    credits:   3,
    price:     8,
    note:      '2.67 JOD / evaluation · save 1 JOD',
    popular:   true,
  },
  {
    key:       'builder',
    name:      'Builder Pack',
    credits:   5,
    price:     12,
    note:      '2.40 JOD / evaluation · save 3 JOD',
    popular:   false,
  },
]

// ── Icons ─────────────────────────────────────────────────────────────────────

const IconZap = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
)

const IconCard = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
)

const IconLock = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke={C.brand500} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)

const IconCheck = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke={C.brand500} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

// ── Main ──────────────────────────────────────────────────────────────────────

export default function BuyCreditsPage() {
  const navigate            = useNavigate()
  const { credits, refresh } = useCredits()

  const [selectedPack, setSelectedPack] = useState('value')
  const [card,         setCard]         = useState({ number: '', expiry: '', cvv: '' })
  const [loading,      setLoading]      = useState(false)

  // ── Card formatting helpers ────────────────────────────────────────────
  function formatCardNumber(raw) {
    const digits = raw.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(.{4})/g, '$1 ').trim()
  }

  function formatExpiry(raw) {
    const digits = raw.replace(/\D/g, '').slice(0, 4)
    if (digits.length <= 2) return digits
    return digits.slice(0, 2) + ' / ' + digits.slice(2)
  }

  function handleCardNumber(e) {
    const formatted = formatCardNumber(e.target.value)
    setCard(p => ({ ...p, number: formatted }))
  }

  function handleExpiry(e) {
    const formatted = formatExpiry(e.target.value)
    setCard(p => ({ ...p, expiry: formatted }))
  }
  const [error,        setError]        = useState(null)
  const [done,         setDone]         = useState(false)
  const [addedCredits, setAddedCredits] = useState(0)

  const pack = PACKS.find(p => p.key === selectedPack) ?? PACKS[1]

  async function handlePurchase() {
    setError(null)
    if (!card.number || !card.expiry || !card.cvv) {
      setError('Please fill in all card fields.')
      return
    }
    setLoading(true)
    try {
      const result = await purchaseCredits({
        pack:       selectedPack,
        cardNumber: card.number,
        expiry:     card.expiry,
        cvv:        card.cvv,
      })
      setAddedCredits(result.creditsAdded ?? pack.credits)
      await refresh()
      setDone(true)
    } catch (err) {
      setError(err.message ?? 'Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Success state ─────────────────────────────────────────────────────────
  if (done) {
    return (
      <AppLayout>
        <div style={{ maxWidth: '440px', margin: '4rem auto', textAlign: 'center', padding: '0 1rem' }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '50%',
            background: C.brand50, border: `2px solid ${C.brand200}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.25rem', color: C.brand500,
          }}>
            <IconCheck/>
          </div>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: C.n900, margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>
            Credits added!
          </h2>
          <p style={{ fontSize: '0.9375rem', color: C.n500, margin: '0 0 0.375rem', lineHeight: 1.6 }}>
            {addedCredits} evaluation credit{addedCredits > 1 ? 's' : ''} added to your account.
          </p>
          <p style={{ fontSize: '0.875rem', color: C.brand600, fontWeight: 700, margin: '0 0 2rem' }}>
            You now have {credits} credit{credits !== 1 ? 's' : ''} remaining.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/submit-idea')}
              style={{
                padding: '0.75rem 1.375rem', borderRadius: '0.625rem', border: 'none',
                background: `linear-gradient(180deg, ${C.brand500} 0%, ${C.brand600} 100%)`,
                color: '#fff', fontWeight: 700, fontSize: '0.9375rem', fontFamily: 'inherit',
                cursor: 'pointer', boxShadow: `0 4px 14px ${C.brand500}35`,
              }}
            >
              Evaluate an Idea →
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '0.75rem 1.375rem', borderRadius: '0.625rem',
                border: `1.5px solid ${C.n200}`, background: '#fff',
                color: C.n700, fontWeight: 600, fontSize: '0.9375rem',
                fontFamily: 'inherit', cursor: 'pointer',
              }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </AppLayout>
    )
  }

  // ── Main layout ───────────────────────────────────────────────────────────
  return (
    <AppLayout>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <Link
            to="/dashboard"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', fontWeight: 600, color: C.n500, textDecoration: 'none', marginBottom: '0.625rem', transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = C.brand500}
            onMouseLeave={e => e.currentTarget.style.color = C.n500}
          >
            ← Back to Dashboard
          </Link>
          <h1 style={{ fontSize: 'clamp(1.375rem, 3vw, 1.75rem)', fontWeight: 800, color: C.n900, margin: '0 0 0.25rem', letterSpacing: '-0.02em' }}>
            Buy Evaluation Credits
          </h1>
          <p style={{ fontSize: '0.875rem', color: C.n500, margin: 0 }}>
            Each credit runs the full AI report — scoring, SWOT, market analysis.
          </p>
        </div>

        {/* Current credits */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.5rem 0.875rem', borderRadius: '0.625rem',
          background: credits > 0 ? C.brand50 : C.n100,
          border: `1px solid ${credits > 0 ? C.brand200 : C.n200}`,
        }}>
          <IconZap/>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: credits > 0 ? C.brand700 : C.n500 }}>
            {credits} credit{credits !== 1 ? 's' : ''} remaining
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem', alignItems: 'start' }}>

        {/* Left — pack selector */}
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: C.n400, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '0.875rem' }}>
            Select a pack
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {PACKS.map(p => {
              const isSelected = p.key === selectedPack
              return (
                <button
                  key={p.key}
                  onClick={() => setSelectedPack(p.key)}
                  style={{
                    width: '100%', textAlign: 'left',
                    padding: '1rem 1.25rem', borderRadius: '0.75rem',
                    border: `${isSelected ? '2px' : '1px'} solid ${isSelected ? C.brand400 : C.n200}`,
                    background: isSelected ? C.brand50 : '#fff',
                    cursor: 'pointer', fontFamily: 'inherit',
                    boxShadow: isSelected ? `0 0 0 3px ${C.brand500}15` : '0 1px 3px rgba(0,0,0,0.04)',
                    transition: 'all 0.15s ease',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    {/* Radio dot */}
                    <div style={{
                      flexShrink: 0, width: '18px', height: '18px', borderRadius: '50%',
                      border: `2px solid ${isSelected ? C.brand500 : C.n300}`,
                      background: isSelected ? C.brand500 : '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {isSelected && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }}/>}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.15rem' }}>
                        <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: isSelected ? C.brand700 : C.n900 }}>
                          {p.name}
                        </span>
                        {p.popular && (
                          <span style={{
                            fontSize: '0.6rem', fontWeight: 800, padding: '0.1rem 0.45rem',
                            borderRadius: '99px', background: C.brand500, color: '#fff',
                            letterSpacing: '0.06em', textTransform: 'uppercase',
                          }}>
                            Popular
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: C.n400 }}>{p.note}</div>
                    </div>
                  </div>
                  {/* Credits + price */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '1.125rem', fontWeight: 800, color: isSelected ? C.brand600 : C.n900, letterSpacing: '-0.02em' }}>
                      {p.price} JOD
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: isSelected ? C.brand600 : C.n500, fontWeight: 600 }}>
                      <IconZap/> {p.credits} eval{p.credits > 1 ? 's' : ''}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* What's included */}
          <div style={{ marginTop: '1.25rem', padding: '1rem 1.25rem', background: C.n50, border: `1px solid ${C.n200}`, borderRadius: '0.75rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: C.n400, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '0.75rem' }}>
              Every evaluation includes
            </div>
            {['AI scoring & verdict', 'SWOT & risk analysis', 'Market & competitor analysis', 'Growth opportunities'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8375rem', color: C.n600, marginBottom: '0.4rem' }}>
                <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: C.brand50, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={C.brand500} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
                {item}
              </div>
            ))}
            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: `1px solid ${C.n200}`, fontSize: '0.8125rem', color: C.n400 }}>
              Credits never expire · Use on any idea
            </div>
          </div>
        </div>

        {/* Right — payment form */}
        <div style={{ background: '#fff', border: `1px solid ${C.n200}`, borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', position: 'sticky', top: '88px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: C.n400, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '1rem' }}>
            Payment
          </div>

          {/* Order summary */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0.875rem', background: C.n50, borderRadius: '0.625rem', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: C.n900 }}>{pack.name}</div>
              <div style={{ fontSize: '0.775rem', color: C.n500, marginTop: '0.1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <IconZap/> {pack.credits} credit{pack.credits > 1 ? 's' : ''}
              </div>
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: C.n900 }}>{pack.price} JOD</span>
          </div>

          {error && <ErrorBanner message={error}/>}

          <FieldWrapper label="Card number" icon={<IconCard/>}>
            <input
              type="text" placeholder="1234 5678 9012 3456" maxLength={19}
              value={card.number}
              inputMode="numeric"
              onChange={handleCardNumber}
              style={inputStyle}
              {...focusHandlers}
            />
          </FieldWrapper>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <FieldWrapper label="Expiry">
              <input
                type="text" placeholder="MM / YY" maxLength={7}
                value={card.expiry}
                inputMode="numeric"
                onChange={handleExpiry}
                style={inputStyle}
                {...focusHandlers}
              />
            </FieldWrapper>
            <FieldWrapper label="CVV">
              <input
                type="text" placeholder="123" maxLength={4}
                value={card.cvv}
                inputMode="numeric"
                onChange={e => setCard(p => ({ ...p, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                style={inputStyle}
                {...focusHandlers}
              />
            </FieldWrapper>
          </div>

          <button
            onClick={handlePurchase}
            disabled={loading}
            style={{
              width: '100%', marginTop: '0.75rem',
              padding: '0.875rem', borderRadius: '0.625rem', border: 'none',
              background: loading
                ? C.n200
                : `linear-gradient(180deg, ${C.brand500} 0%, ${C.brand600} 100%)`,
              color: loading ? C.n400 : '#fff',
              fontWeight: 700, fontSize: '1rem', fontFamily: 'inherit',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : `0 4px 14px ${C.brand500}35`,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
          >
            {loading ? 'Processing…' : `Pay ${pack.price} JOD`}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', marginTop: '0.875rem', color: C.n400, fontSize: '0.8125rem' }}>
            <IconLock/> Secured 
          </div>
        </div>
      </div>
    </AppLayout>
  )
}