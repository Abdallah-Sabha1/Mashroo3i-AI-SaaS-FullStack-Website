/**
 * SubmitIdeaPage.jsx
 * ──────────────────────────────────────────────────────────────────────────
 * Three-field form matching the reference design:
 *   1. Business idea name  (title)
 *   2. Describe your idea  (description, ≥ 100 chars)
 *   3. What field is your idea in? (sector grid)
 *
 * Posts: { title, description, sector, businessType: null, estimatedBudget: null, ... }
 * On success → /evaluation/:ideaId (evaluation starts immediately)
 */

import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '../styles'
import { C } from '../styles/components/DashNavbar'
import { submitIdea } from '../services/ideaService'
import { useCredits } from '../context/CreditsContext'

/* ── Constants ────────────────────────────────────────────────────────── */
const TITLE_MAX       = 120
const DESCRIPTION_MIN = 100
const DESCRIPTION_MAX = 800

const SECTORS = [
  { id: 'retail',    label: 'Retail & E-commerce',   desc: 'Online or physical store, products, reselling' },
  { id: 'food',      label: 'Food & Beverage',        desc: 'Restaurants, cafés, catering, food delivery'   },
  { id: 'education', label: 'Education & Training',   desc: 'Tutoring, courses, coaching, training'         },
  { id: 'tech',      label: 'Tech & Software',        desc: 'Apps, websites, digital tools, software'       },
  { id: 'services',  label: 'Professional Services',  desc: 'Consulting, marketing, accounting, design, IT' },
  { id: 'health',    label: 'Health & Wellness',      desc: 'Gym, clinic, nutrition, beauty, personal care' },
]
const OTHER_SECTOR = { id: 'other', label: 'Other', desc: "Doesn't fit the above categories" }

/* ── Shared styles ────────────────────────────────────────────────────── */
const labelStyle = {
  display: 'block',
  fontSize: '0.9375rem', fontWeight: 700,
  color: '#111827',
  marginBottom: '0.375rem',
}

const subtitleStyle = {
  fontSize: '0.8125rem', color: '#6b7280',
  margin: '0 0 0.625rem',
  lineHeight: 1.5,
}

const requiredMark = <span style={{ color: '#ef4444', marginInlineStart: '0.2rem' }}>*</span>

const inputBase = {
  width: '100%',
  padding: '0.75rem 0.95rem',
  border: '1.5px solid #e5e7eb',
  borderRadius: '0.625rem',
  fontSize: '0.9375rem',
  fontFamily: 'inherit',
  color: '#111827',
  background: '#ffffff',
  outline: 'none',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  boxSizing: 'border-box',
}

const focusOn  = (e) => { e.target.style.borderColor = C.brand500; e.target.style.boxShadow = '0 0 0 3px rgba(29,158,117,0.15)' }
const focusOff = (e) => { e.target.style.borderColor = '#e5e7eb';  e.target.style.boxShadow = 'none' }

/* ── Sector card ──────────────────────────────────────────────────────── */
function SectorCard({ sector, selected, onSelect, fullWidth = false }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(sector.id)}
      style={{
        gridColumn: fullWidth ? '1 / -1' : 'auto',
        width: '100%',
        textAlign: 'start',
        background: selected ? C.brand50 : '#ffffff',
        border: `1.5px solid ${selected ? C.brand500 : '#e5e7eb'}`,
        borderRadius: '0.625rem',
        padding: '0.9rem 1.1rem',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        fontFamily: 'inherit',
        boxShadow: selected ? '0 0 0 3px rgba(29,158,117,0.12)' : 'none',
      }}
      onMouseEnter={e => {
        if (!selected) {
          e.currentTarget.style.borderColor = C.brand300
          e.currentTarget.style.background  = '#fafffc'
        }
      }}
      onMouseLeave={e => {
        if (!selected) {
          e.currentTarget.style.borderColor = '#e5e7eb'
          e.currentTarget.style.background  = '#ffffff'
        }
      }}
    >
      <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111827', marginBottom: '0.2rem' }}>
        {sector.label}
      </div>
      <div style={{ fontSize: '0.8125rem', color: '#6b7280', lineHeight: 1.45 }}>
        {sector.desc}
      </div>
    </button>
  )
}

/* ── Page ─────────────────────────────────────────────────────────────── */
export default function SubmitIdeaPage() {
  const navigate = useNavigate()
  const { credits } = useCredits()

  const [title,       setTitle]       = useState('')
  const [description, setDescription] = useState('')
  const [sector,      setSector]      = useState('')
  const [investment,  setInvestment]  = useState('')
  const [error,       setError]       = useState('')
  const [submitting,  setSubmitting]  = useState(false)

  const descTrimLen = description.trim().length
  const remaining   = Math.max(0, DESCRIPTION_MIN - descTrimLen)
  const descOk      = descTrimLen >= DESCRIPTION_MIN
  const titleOk     = title.trim().length > 0 && title.trim().length <= TITLE_MAX
  const sectorOk    = Boolean(sector)
  const investOk    = Number(investment) > 0
  const hasCredits  = credits > 0
  const canSubmit   = titleOk && descOk && sectorOk && investOk && !submitting && hasCredits

  const counterColor = useMemo(() => descOk ? C.brand600 : '#f97316', [descOk])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return

    setError('')
    setSubmitting(true)

    try {
      const result = await submitIdea({
        title:              title.trim(),
        description:        description.trim(),
        sector,
        businessType:       null,
        estimatedBudget:    Number(investment),
        problemStatement:   null,
        targetAudience:     null,
        usp:                null,
        businessTypeReason: null,
      })

      const ideaId = result?.ideaId ?? result?.id ?? null
      // Navigate directly to evaluation so the AI analysis starts immediately.
      // The evaluation page calls /start and polls for results.
      if (ideaId) {
        navigate(`/evaluation/${ideaId}`, { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <AppLayout>
      {/* Page header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{
          fontSize: 'clamp(1.5rem, 3vw, 1.875rem)', fontWeight: 800,
          color: '#111827', margin: '0 0 0.35rem', letterSpacing: '-0.02em',
        }}>
          Submit your business idea
        </h1>
        <p style={{ fontSize: '0.9375rem', color: '#6b7280', margin: 0, lineHeight: 1.55 }}>
          Tell us about your idea. The more detail you give, the better our analysis.
        </p>
      </div>

      {/* Form card */}
      <form onSubmit={handleSubmit} noValidate>
        <div style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.03)',
          display: 'flex', flexDirection: 'column', gap: '1.5rem',
        }}>

          {/* Error banner */}
          {error && (
            <div role="alert" style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.75rem 1rem',
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: '0.5rem', color: '#b91c1c', fontSize: '0.875rem',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {/* Field: Title */}
          <div>
            <label htmlFor="idea-title" style={labelStyle}>
              What is your business idea called?{requiredMark}
            </label>
            <input
              id="idea-title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={TITLE_MAX}
              placeholder="e.g. Specialty coffee shop in Abdoun"
              style={inputBase}
              onFocus={focusOn}
              onBlur={focusOff}
            />
          </div>

          {/* Field: Description */}
          <div>
            <label htmlFor="idea-desc" style={labelStyle}>
              Describe your idea{requiredMark}
            </label>
            <p style={subtitleStyle}>
              What does it do? What problem does it solve? The more detail you give, the better our analysis.
            </p>
            <textarea
              id="idea-desc"
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={DESCRIPTION_MAX}
              rows={5}
              placeholder="e.g. I want to open a café in Sweifieh that focuses on specialty coffee and remote work space..."
              style={{ ...inputBase, resize: 'vertical', minHeight: '130px', lineHeight: 1.55 }}
              onFocus={focusOn}
              onBlur={focusOff}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem' }}>
              <span style={{ fontSize: '0.8125rem', color: '#6b7280' }}>
                chars {descTrimLen}
              </span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: counterColor, transition: 'color 0.15s ease' }}>
                {descOk ? '✓ minimum reached' : `more characters needed ${remaining}`}
              </span>
            </div>
          </div>

          {/* Field: Sector */}
          <div>
            <label style={labelStyle}>
              What field is your idea in?{requiredMark}
            </label>
            <div
              role="radiogroup"
              aria-label="Sector"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '0.75rem',
                marginTop: '0.625rem',
              }}
            >
              {SECTORS.map(s => (
                <SectorCard key={s.id} sector={s} selected={sector === s.id} onSelect={setSector} />
              ))}
              <SectorCard sector={OTHER_SECTOR} selected={sector === OTHER_SECTOR.id} onSelect={setSector} fullWidth />
            </div>
          </div>

          {/* Field: Initial Investment */}
          <div>
            <label style={labelStyle}>
              Initial investment (JOD){requiredMark}
            </label>
            <p style={subtitleStyle}>
              How much are you planning to invest to get this idea off the ground?
            </p>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: '0.95rem', top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '0.9375rem', fontWeight: 600, color: C.n500,
                pointerEvents: 'none', userSelect: 'none',
              }}>JOD</span>
              <input
                type="number"
                min="1"
                placeholder="e.g. 5000"
                value={investment}
                onChange={e => setInvestment(e.target.value)}
                style={{ ...inputBase, paddingLeft: '3.25rem' }}
                onFocus={focusOn}
                onBlur={focusOff}
              />
            </div>
            {investment && !investOk && (
              <p style={{ fontSize: '0.8125rem', color: '#ef4444', margin: '0.35rem 0 0' }}>
                Please enter a valid amount greater than 0.
              </p>
            )}
          </div>


          {/* No credits banner */}
          {!hasCredits && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: '1rem', flexWrap: 'wrap',
              padding: '0.875rem 1rem',
              background: '#fffbeb', border: '1px solid #fcd34d',
              borderRadius: '0.5rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#92400e' }}>
                  You have no evaluation credits. Purchase credits to submit your idea.
                </span>
              </div>
              <button
                type="button"
                onClick={() => navigate('/buy-credits')}
                style={{
                  padding: '0.45rem 1rem', borderRadius: '0.5rem', border: 'none',
                  background: '#d97706', color: '#fff',
                  fontWeight: 700, fontSize: '0.8125rem', fontFamily: 'inherit',
                  cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                }}
              >
                Buy Credits →
              </button>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!canSubmit}
            style={{
              width: '100%',
              padding: '0.95rem 1.5rem',
              borderRadius: '0.625rem',
              border: 'none',
              background: canSubmit
                ? `linear-gradient(180deg, ${C.brand500} 0%, ${C.brand600} 100%)`
                : '#e5e7eb',
              color: canSubmit ? '#ffffff' : '#9ca3af',
              fontSize: '0.9375rem', fontWeight: 700,
              fontFamily: 'inherit',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              transition: 'all 0.15s ease',
              boxShadow: canSubmit ? '0 4px 14px rgba(29,158,117,0.35)' : 'none',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            }}
            onMouseEnter={e => { if (canSubmit) e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { if (canSubmit) e.currentTarget.style.transform = 'translateY(0)' }}
          >
            {submitting ? (
              <>
                <svg style={{ width: '1em', height: '1em', animation: 'spin 1s linear infinite' }}
                  viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25"/>
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                </svg>
                Analyzing…
              </>
            ) : (
              <>→ Analyze My Idea</>
            )}
          </button>
        </div>
      </form>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AppLayout>
  )
}