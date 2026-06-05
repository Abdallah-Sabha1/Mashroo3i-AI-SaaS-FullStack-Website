/**
 * DashboardPage.jsx — stats, clean idea cards, delete lives in the evaluation page.
 */

import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AppLayout } from '../styles'
import { C } from '../styles/components/DashNavbar'
import { listMyIdeas, deleteIdea } from '../services/ideaService'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function scoreColor(score) {
  if (score >= 75) return C.brand500
  if (score >= 60) return '#0ea5e9'
  if (score >= 45) return '#f59e0b'
  if (score >= 30) return '#f97316'
  return '#ef4444'
}

function fmtDate(iso) {
  try { return new Date(iso).toLocaleDateString('en-JO', { day: 'numeric', month: 'short', year: 'numeric' }) }
  catch { return '—' }
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

const SECTOR_LABELS = {
  retail: 'Retail', food: 'Food & Bev', education: 'Education',
  tech: 'Tech', services: 'Services', health: 'Health', other: 'Other',
}

// ─────────────────────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────────────────────

const IconArrow    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
const IconPlus     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
const IconBulb     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>
const IconChart    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
const IconStar     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
const IconTrash    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>

// ─────────────────────────────────────────────────────────────────────────────
// Status Badge
// ─────────────────────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = {
    submitted: { label: 'Pending',    bg: C.n100,             color: C.n500,    pulse: false },
    analyzing: { label: 'Analyzing…', bg: C.brand500 + '15',  color: C.brand600, pulse: true  },
    completed: { label: 'Evaluated',  bg: '#dcfce7',           color: '#15803d', pulse: false },
    failed:    { label: 'Failed',     bg: '#fee2e2',           color: '#dc2626', pulse: false },
  }[status] ?? { label: status, bg: C.n100, color: C.n500, pulse: false }

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
      padding: '0.2rem 0.625rem', borderRadius: '99px',
      background: cfg.bg, fontSize: '0.7rem', fontWeight: 700, color: cfg.color,
    }}>
      {cfg.pulse && <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: C.brand500, animation: 'pulseDot 1.4s ease-in-out infinite', flexShrink: 0 }}/>}
      {cfg.label}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div style={{
      background: '#fff', border: `1px solid ${C.n200}`, borderRadius: '0.875rem',
      padding: '1.125rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <div style={{
        width: '40px', height: '40px', borderRadius: '0.625rem', flexShrink: 0,
        background: (color || C.brand500) + '15',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: color || C.brand500,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: C.n900, lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</div>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: C.n500, marginTop: '0.25rem' }}>{label}</div>
        {sub && <div style={{ fontSize: '0.6875rem', color: C.n400, marginTop: '0.1rem' }}>{sub}</div>}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Delete Modal
// ─────────────────────────────────────────────────────────────────────────────

function DeleteModal({ idea, onConfirm, onCancel, isDeleting, error }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={e => { if (!isDeleting && e.target === e.currentTarget) onCancel() }}
    >
      <div style={{ background: '#fff', borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: '400px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', animation: 'fadeUp 0.2s ease both' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', margin: '0 0 1.25rem' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: C.n900, margin: '0 0 0.5rem' }}>Delete this idea?</h3>
        <p style={{ fontSize: '0.875rem', color: C.n600, lineHeight: 1.6, margin: '0 0 0.625rem' }}>
          You're about to permanently delete <strong>"{idea.title}"</strong> and all its evaluation results.
        </p>
        <p style={{ fontSize: '0.8125rem', color: '#dc2626', margin: '0 0 1.75rem', background: '#fff5f5', border: '1px solid #fecaca', borderRadius: '0.5rem', padding: '0.625rem 0.75rem' }}>
          This cannot be undone.
        </p>
        {error && <p style={{ fontSize: '0.8125rem', color: '#dc2626', margin: '0 0 0.75rem' }}>{error}</p>}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={onCancel} disabled={isDeleting} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: `1px solid ${C.n200}`, background: '#fff', color: C.n700, fontWeight: 600, fontSize: '0.875rem', fontFamily: 'inherit', cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={isDeleting} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: 'none', background: isDeleting ? '#fca5a5' : '#dc2626', color: '#fff', fontWeight: 700, fontSize: '0.875rem', fontFamily: 'inherit', cursor: isDeleting ? 'not-allowed' : 'pointer' }}>
            {isDeleting ? 'Deleting…' : 'Yes, delete it'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Idea Card — always-visible trash icon on the right, separate from the link
// ─────────────────────────────────────────────────────────────────────────────

function IdeaCard({ idea, onDeleteClick }) {
  const { ideaId, title, sector, status, overallScore, verdict, createdAt } = idea
  const hasScore = overallScore != null
  const color    = hasScore ? scoreColor(overallScore) : C.n300
  const [hovered,        setHovered]        = useState(false)
  const [trashHovered,   setTrashHovered]   = useState(false)
  const canDelete = status !== 'analyzing'

  return (
    <div
      style={{
        background: '#fff',
        border: `1px solid ${hovered ? C.brand500 + '50' : C.n200}`,
        borderRadius: '0.875rem',
        boxShadow: hovered ? '0 4px 16px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'all 0.15s ease',
        display: 'flex', alignItems: 'stretch', overflow: 'hidden',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Left score accent bar */}
      <div style={{
        width: '3px', flexShrink: 0,
        background: hasScore ? color : status === 'analyzing' ? C.brand500 : C.n200,
      }}/>

      {/* Clickable link area */}
      <Link
        to={`/evaluation/${ideaId}`}
        style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, padding: '1rem 1rem 1rem 1.125rem', minWidth: 0 }}
      >
        {/* Score circle */}
        <div style={{
          width: '2.875rem', height: '2.875rem', borderRadius: '50%', flexShrink: 0,
          background: hasScore ? color + '12' : C.n100,
          border: `2px solid ${hasScore ? color : C.n200}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {hasScore
            ? <span style={{ fontSize: '0.8125rem', fontWeight: 800, color }}>{overallScore}</span>
            : <span style={{ fontSize: '0.875rem', color: C.n400 }}>–</span>
          }
        </div>

        {/* Title + sector */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: C.n900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '0.25rem' }}>
            {title}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: C.n500, background: C.n100, padding: '0.1rem 0.5rem', borderRadius: '99px' }}>
              {SECTOR_LABELS[sector] ?? sector}
            </span>
            {verdict && <span style={{ fontSize: '0.7rem', color: scoreColor(overallScore), fontWeight: 600 }}>{verdict}</span>}
          </div>
        </div>

        {/* Status + date */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.375rem', flexShrink: 0 }}>
          <StatusBadge status={status}/>
          <span style={{ fontSize: '0.7rem', color: C.n400 }}>{fmtDate(createdAt)}</span>
        </div>

        <span style={{ color: C.n300, flexShrink: 0, display: 'flex', alignItems: 'center', marginLeft: '0.5rem' }}>
          <IconArrow/>
        </span>
      </Link>

      {/* Divider */}
      <div style={{ width: '1px', background: C.n100, flexShrink: 0, margin: '0.625rem 0' }}/>

      {/* Trash button — always visible, outside the Link */}
      <button
        onClick={e => { e.stopPropagation(); if (canDelete) onDeleteClick(idea) }}
        title={canDelete ? 'Delete idea' : 'Cannot delete while analyzing'}
        disabled={!canDelete}
        onMouseEnter={() => setTrashHovered(true)}
        onMouseLeave={() => setTrashHovered(false)}
        style={{
          width: '44px', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: trashHovered && canDelete ? '#fff5f5' : 'transparent',
          border: 'none', cursor: canDelete ? 'pointer' : 'not-allowed',
          color: trashHovered && canDelete ? '#dc2626' : C.n300,
          transition: 'all 0.15s ease', fontFamily: 'inherit',
        }}
      >
        <IconTrash/>
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Empty State
// ─────────────────────────────────────────────────────────────────────────────

function EmptyIdeas() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
      padding: '3rem 1.5rem', border: `1.5px dashed ${C.n200}`, borderRadius: '0.875rem', background: C.n50,
    }}>
      <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: C.brand500 + '12', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.brand500, marginBottom: '1rem' }}>
        <IconBulb/>
      </div>
      <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: C.n700, margin: '0 0 0.375rem' }}>No ideas yet</p>
      <p style={{ fontSize: '0.8125rem', color: C.n500, margin: '0 0 1.5rem', maxWidth: '320px', lineHeight: 1.6 }}>
        Submit your first business idea and get an AI-powered evaluation tailored for Jordan.
      </p>
      <Link to="/submit-idea" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.125rem', borderRadius: '0.5rem', background: `linear-gradient(180deg, ${C.brand500} 0%, ${C.brand600} 100%)`, color: '#fff', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none', boxShadow: `0 4px 14px ${C.brand500}35` }}>
        <IconPlus/> Submit your first idea
      </Link>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth()
  const firstName = (user?.fullName ?? '').trim().split(/\s+/)[0] || 'there'

  const [ideas,        setIdeas]        = useState([])
  const [loadState,    setLoadState]    = useState('loading')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting,   setIsDeleting]   = useState(false)
  const [deleteError,  setDeleteError]  = useState(null)

  useEffect(() => {
    let cancelled = false
    listMyIdeas()
      .then(data => { if (!cancelled) { setIdeas(Array.isArray(data) ? data : []); setLoadState('done') } })
      .catch(() => { if (!cancelled) setLoadState('error') })
    return () => { cancelled = true }
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    setDeleteError(null)
    try {
      await deleteIdea(deleteTarget.ideaId)
      setIdeas(prev => prev.filter(i => i.ideaId !== deleteTarget.ideaId))
      setDeleteTarget(null)
    } catch (err) {
      setDeleteError(err.message ?? 'Failed to delete. Try again.')
    } finally {
      setIsDeleting(false)
    }
  }, [deleteTarget])

  const evaluated = ideas.filter(i => i.status === 'completed')
  const scores    = evaluated.map(i => i.overallScore).filter(s => s != null)
  const avgScore  = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null
  const topIdea   = evaluated.length > 0
    ? evaluated.reduce((best, i) => (i.overallScore ?? 0) > (best.overallScore ?? 0) ? i : best, evaluated[0])
    : null

  return (
    <AppLayout>
      <style>{`
        @keyframes pulseDot { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes shimmer  { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* ── Header ── */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: C.n400, marginBottom: '0.2rem' }}>{getGreeting()}</div>
        <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 1.875rem)', fontWeight: 800, color: C.n900, margin: '0 0 0.25rem', letterSpacing: '-0.02em' }}>{firstName}</h1>
        <p style={{ fontSize: '0.875rem', color: C.n500, margin: 0 }}>Here's a summary of your business ideas and evaluations.</p>
      </div>

      {/* ── Stats — shown once data is loaded and there's something to show ── */}
      {loadState === 'done' && ideas.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.875rem', marginBottom: '1.5rem', animation: 'fadeUp 0.3s ease both' }}>
          <StatCard icon={<IconBulb/>}  label="Total Ideas"  value={ideas.length}      color={C.brand500}/>
          <StatCard icon={<IconChart/>} label="Evaluated"    value={evaluated.length}  color="#0ea5e9"/>
          {avgScore != null && <StatCard icon={<IconChart/>} label="Avg Score" value={avgScore} color={scoreColor(avgScore)}/>}
          {topIdea  != null && <StatCard icon={<IconStar/>}  label="Best Score" value={topIdea.overallScore} sub={topIdea.title.length > 18 ? topIdea.title.slice(0,18)+'…' : topIdea.title} color={scoreColor(topIdea.overallScore)}/>}
        </div>
      )}

      {/* ── CTA ── */}
      <div style={{
        background: `linear-gradient(135deg, ${C.brand600} 0%, ${C.brand800} 100%)`,
        borderRadius: '1rem', padding: '1.5rem 1.75rem', marginBottom: '1.25rem',
        position: 'relative', overflow: 'hidden', boxShadow: `0 8px 24px ${C.brand500}30`,
      }}>
        <div style={{ position: 'absolute', right: '-2rem', top: '-2rem', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }}/>
        <div style={{ position: 'absolute', right: '3rem', bottom: '-3rem', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }}/>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', position: 'relative' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: '0 0 0.375rem', letterSpacing: '-0.01em' }}>Got a new idea?</h2>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.75)', margin: 0, lineHeight: 1.5, maxWidth: '380px' }}>
              AI-powered scoring, SWOT, and market research tailored for Jordan — in under a minute.
            </p>
          </div>
          <Link
            to="/submit-idea"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', borderRadius: '0.625rem', background: '#fff', color: C.brand700, fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none', boxShadow: '0 4px 14px rgba(0,0,0,0.15)', flexShrink: 0, transition: 'transform 0.15s ease' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <IconPlus/> Submit new idea
          </Link>
        </div>
      </div>

      {/* ── Ideas list ── */}
      <div style={{ background: '#fff', border: `1px solid ${C.n200}`, borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.125rem' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: C.n900, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Your Ideas
            {ideas.length > 0 && (
              <span style={{ fontSize: '0.7rem', fontWeight: 700, background: C.brand500 + '15', color: C.brand600, padding: '0.15rem 0.5rem', borderRadius: '99px' }}>
                {ideas.length}
              </span>
            )}
          </h3>
          {loadState === 'done' && ideas.length > 0 && (
            <span style={{ fontSize: '0.75rem', color: C.n400 }}>Tip: click a card to open, trash to delete</span>
          )}
        </div>

        {loadState === 'loading' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: '4.75rem', borderRadius: '0.875rem', background: 'linear-gradient(90deg,#f3f4f6 0%,#e5e7eb 50%,#f3f4f6 100%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s ease-in-out infinite' }}/>
            ))}
          </div>
        )}

        {loadState === 'error' && (
          <p style={{ fontSize: '0.875rem', color: '#ef4444', margin: 0 }}>Failed to load ideas. Please refresh.</p>
        )}

        {loadState === 'done' && ideas.length === 0 && <EmptyIdeas/>}

        {loadState === 'done' && ideas.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {ideas.map(idea => <IdeaCard key={idea.ideaId} idea={idea} onDeleteClick={setDeleteTarget}/>)}
          </div>
        )}
      </div>

      {deleteTarget && (
        <DeleteModal
          idea={deleteTarget}
          isDeleting={isDeleting}
          error={deleteError}
          onConfirm={handleDeleteConfirm}
          onCancel={() => { if (!isDeleting) { setDeleteTarget(null); setDeleteError(null) } }}
        />
      )}
    </AppLayout>
  )
}