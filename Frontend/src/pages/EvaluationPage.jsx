/**
 * EvaluationPage.jsx  — updated
 * Changes:
 *   - Page 1: compact scoring, max 5 concerns, max 4 actions, no inline SourceRow
 *   - Page 2: compact SWOT/Risk, shorter sentences, no inline SourceRow
 *   - Page 3: fixed Growth Opportunities (full titles, no "…"), removed SourceRow from sections
 *   - All pages: unified MethodologyFooter at bottom with "How we calculate this?" popup
 *   - Modal component with per-tab popup content
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { AppLayout } from '../styles'
import { C } from '../styles/components/DashNavbar'
import { startEvaluation, getEvaluationResults } from '../services/evaluationService'
import { FinancialProjectionsWizard } from './FinancialProjectionsPage'
import { useCredits } from '../context/CreditsContext'

const POLL_MS = 3000

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const scoreColor = s =>
  s >= 75 ? C.brand500 : s >= 60 ? '#0ea5e9' : s >= 45 ? '#f59e0b' : s >= 30 ? '#f97316' : '#ef4444'

const riskColor = l =>
  ({ Low: C.brand500, Medium: '#f59e0b', High: '#f97316', Critical: '#ef4444' }[l] ?? C.n400)

const verdictColor = v => {
  if (!v) return C.n400
  const lv = v.toLowerCase()
  if (lv.includes('highly'))     return C.brand500
  if (lv.includes('promising'))  return '#0ea5e9'
  if (lv.includes('refinement')) return '#f59e0b'
  if (lv.includes('high risk'))  return '#f97316'
  return '#ef4444'
}

function parsePoints(text) {
  if (!text) return []
  const byLine = text.split(/\n+/).map(s => s.trim()).filter(Boolean)
  if (byLine.length > 1) return byLine
  const bySentence = text.split(/\.\s+/).map(s => s.trim()).filter(s => s.length > 8)
  return bySentence.length > 1 ? bySentence.map(s => s.endsWith('.') ? s : s + '.') : [text]
}

function parseRisks(text) {
  if (!text) return []
  try {
    const parsed = JSON.parse(text)
    if (Array.isArray(parsed)) return parsed.slice(0, 2)
  } catch (_) { /* fall through */ }
  const lines = text.split(/\n+/).map(s => s.trim()).filter(Boolean)
  if (lines.length > 1) {
    const cards = []; let i = 0
    while (i < lines.length) {
      const cur = lines[i], nxt = lines[i + 1]
      if (nxt && /^(to mitigate|to address|consider|negotiate|offer|implement|ensure)/i.test(nxt)) {
        cards.push({ title: null, description: cur, mitigation: nxt }); i += 2
      } else {
        const m = cur.match(/^(.+?[.!?])\s+(.+)$/s)
        cards.push(m && m[2].trim().length > 15
          ? { title: null, description: m[1].trim(), mitigation: m[2].trim() }
          : { title: null, description: cur, mitigation: null })
        i += 1
      }
    }
    return cards.slice(0, 2)
  }
  const m = text.match(/^(.+?[.!?])\s+(.+)$/s)
  return m && m[2].trim().length > 15
    ? [{ title: null, description: m[1].trim(), mitigation: m[2].trim() }]
    : [{ title: null, description: text, mitigation: null }]
}

function fmtDate(iso) {
  if (!iso) return null
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch { return null }
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG Icons
// ─────────────────────────────────────────────────────────────────────────────

const IconScore   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
const IconChart   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
const IconMarket  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
const IconShield  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
const IconCheck   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
const IconArrow   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
const IconBulb    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>
const IconWrench  = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
const IconWarn    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
const IconUsers   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
const IconBuild   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
const IconAct     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
const IconTrendUp = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
const IconTrendDn = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>
const IconChevDn  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
const IconChevR   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
const IconChevL   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
const IconStrUp   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
const IconStrDn   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>
const IconOpp     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
const IconThreat  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
const IconClose   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IconDB      = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>

// ─────────────────────────────────────────────────────────────────────────────
// Shared primitives
// ─────────────────────────────────────────────────────────────────────────────

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem',
      padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.03)',
      ...style,
    }}>
      {children}
    </div>
  )
}

function SectionTitle({ icon, children }) {
  return (
    <h2 style={{
      fontSize: '1rem', fontWeight: 800, color: C.n900, margin: '0 0 1rem',
      display: 'flex', alignItems: 'center', gap: '0.5rem', letterSpacing: '-0.01em',
    }}>
      <span style={{ color: C.brand500, display: 'flex', alignItems: 'center' }}>{icon}</span>
      {children}
    </h2>
  )
}

function Skeleton({ width = '100%', height = '1rem', radius = '0.375rem', style = {} }) {
  return (
    <div style={{
      width, height, borderRadius: radius,
      background: 'linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)',
      backgroundSize: '200% 100%', animation: 'shimmer 1.4s ease-in-out infinite',
      ...style,
    }}/>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Modal — "How we calculate this?" popup
// ─────────────────────────────────────────────────────────────────────────────

const POPUP_CONTENT = {
  scoring: {
    title: 'How scoring works',
    lines: [
      'Scored across 4 dimensions: Market, Financial, Execution, Innovation — each 0–100.',
      'Weighted average: Market 30% · Financial 25% · Execution 25% · Innovation 20%.',
      'Verdict: ≥75 Highly Viable · ≥60 Promising · ≥45 Needs Refinement · below = High Risk.',
    ],
  },
  swot: {
    title: 'How SWOT is generated',
    lines: [
      'Strengths & Weaknesses — drawn from the idea structure, budget, and feasibility.',
      'Opportunities & Threats — from Jordan market data, sector trends, and competitor signals.',
      'Risks — separate from SWOT, focused on operational and financial execution.',
    ],
  },
  market: {
    title: 'How market data is sourced',
    lines: [
      'Market size & saturation from DOS sector reports and JCC industry data.',
      'Competitors are real businesses operating in Jordan in the same category.',
      'Growth opportunities cross-referenced against current market gaps and sector trends.',
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// Methodology Footer — sources strip + anchored popover, no overlay
// ─────────────────────────────────────────────────────────────────────────────

const TAB_SOURCES = {
  scoring: 'Mashroo3i AI · Idea submission data',
  swot:    'Mashroo3i AI · Jordan market signals · Sector benchmarks',
  market:  'DOS · JCC · Mashroo3i AI · WAMDA',
}

function MethodologyFooter({ tab, analyzedAt }) {
  const [open, setOpen]       = useState(false)
  const btnRef                = useRef(null)
  const popoverRef            = useRef(null)
  const content               = POPUP_CONTENT[tab]

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handleClick(e) {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target) &&
        btnRef.current     && !btnRef.current.contains(e.target)
      ) setOpen(false)
    }
    function handleKey(e) { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown',   handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown',   handleKey)
    }
  }, [open])

  return (
    <div style={{
      marginTop: '1.25rem',
      padding: '0.5rem 0.875rem',
      borderTop: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '0.75rem',
      flexWrap: 'wrap',
      position: 'relative',   // anchor for the popover
    }}>
      <span style={{ fontSize: '0.75rem', color: C.n400 }}>
        <strong style={{ color: C.n500, fontWeight: 600 }}>Sources:</strong>{' '}
        {TAB_SOURCES[tab]}
        {analyzedAt && <span> · {analyzedAt}</span>}
      </span>

      {/* Trigger button */}
      <button
        ref={btnRef}
        onClick={() => setOpen(o => !o)}
        style={{
          background: 'none', border: 'none', padding: 0,
          fontSize: '0.75rem', fontWeight: 600,
          color: open ? C.brand600 : C.brand500,
          cursor: 'pointer', fontFamily: 'inherit',
          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
          transition: 'color 0.15s', whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => e.currentTarget.style.color = C.brand600}
        onMouseLeave={e => e.currentTarget.style.color = open ? C.brand600 : C.brand500}
      >
        <IconDB/> How we calculate this?
      </button>

      {/* Popover — floats above the button, no overlay */}
      {open && (
        <div
          ref={popoverRef}
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 10px)',   // 10px gap above the strip
            right: 0,
            width: '300px',
            background: '#fff',
            border: `1px solid ${C.n200}`,
            borderRadius: '0.75rem',
            boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
            zIndex: 200,
            animation: 'popoverIn 0.15s cubic-bezier(0.34,1.4,0.64,1) both',
            transformOrigin: 'bottom right',
          }}
        >
          {/* Caret pointing down */}
          <div style={{
            position: 'absolute', bottom: '-6px', right: '52px',
            width: '11px', height: '11px',
            background: '#fff',
            border: `1px solid ${C.n200}`,
            borderTop: 'none', borderLeft: 'none',
            transform: 'rotate(45deg)',
          }}/>

          {/* Title */}
          <div style={{
            padding: '0.75rem 1rem 0.5rem',
            fontSize: '0.8125rem', fontWeight: 700, color: C.n900,
            borderBottom: `1px solid ${C.n100}`,
          }}>
            {content.title}
          </div>

          {/* Lines */}
          <div style={{ padding: '0.625rem 1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {content.lines.map((line, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <div style={{
                  flexShrink: 0, marginTop: '0.35rem',
                  width: '5px', height: '5px', borderRadius: '50%',
                  background: C.brand500,
                }}/>
                <span style={{ fontSize: '0.8125rem', color: C.n600, lineHeight: 1.55 }}>{line}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 1 — Scoring components
// ─────────────────────────────────────────────────────────────────────────────

function ScoreRing({ score, size = 140 }) {
  const r = 52, cx = size / 2, cy = size / 2
  const circ = 2 * Math.PI * r
  const filled = (score / 100) * circ
  const color = scoreColor(score)
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth="10"/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={`${filled} ${circ - filled}`}
        strokeDashoffset={circ * 0.25} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)' }}/>
      <text x={cx} y={cy - 8} textAnchor="middle" fontSize="28" fontWeight="800"
        fill={color} fontFamily="inherit">{score}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="11" fontWeight="500"
        fill={C.n400} fontFamily="inherit" letterSpacing="0.08em">/ 100</text>
    </svg>
  )
}

function ScoreBar({ label, score }) {
  const color = scoreColor(score)
  return (
    <div style={{ marginBottom: '0.875rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: C.n700 }}>{label}</span>
        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color }}>{score}</span>
      </div>
      <div style={{ height: '6px', background: '#f3f4f6', borderRadius: '99px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${score}%`, background: color, borderRadius: '99px',
          transition: 'width 0.9s cubic-bezier(0.4,0,0.2,1)',
        }}/>
      </div>
    </div>
  )
}

function VerdictBadge({ verdict }) {
  const color = verdictColor(verdict)
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
      padding: '0.3rem 0.75rem', borderRadius: '99px',
      background: color + '18', border: `1px solid ${color}40`,
      color, fontSize: '0.8125rem', fontWeight: 700,
    }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, flexShrink: 0 }}/>
      {verdict}
    </span>
  )
}

function ConcernItem({ text }) {
  // Split "Label: body" into bold label + normal body
  const colonIdx = text.indexOf(': ')
  const label = colonIdx > 0 ? text.slice(0, colonIdx) : null
  const body  = colonIdx > 0 ? text.slice(colonIdx + 2) : text
  return (
    <div style={{
      display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
      padding: '0.875rem 1rem', borderRadius: '0.5rem',
      background: '#fff7ed', border: '1px solid #fed7aa',
      marginBottom: '0.5rem',
    }}>
      <span style={{
        flexShrink: 0, width: '20px', height: '20px', borderRadius: '50%',
        background: '#f97316', color: '#fff',
        fontSize: '0.68rem', fontWeight: 800,
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '0.15rem',
      }}>!</span>
      <span style={{ fontSize: '0.875rem', color: C.n700, lineHeight: 1.6 }}>
        {label && <strong style={{ fontWeight: 700, color: C.n900 }}>{label}: </strong>}
        {body}
      </span>
    </div>
  )
}

function ActionItem({ text, index }) {
  // Split "Label: body" into bold label + normal body
  const colonIdx = text.indexOf(': ')
  const label = colonIdx > 0 ? text.slice(0, colonIdx) : null
  const body  = colonIdx > 0 ? text.slice(colonIdx + 2) : text
  return (
    <div style={{
      display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
      padding: '0.875rem 1rem', borderRadius: '0.5rem',
      background: '#f0fdf9', border: `1px solid ${C.brand200}`,
      marginBottom: '0.5rem',
    }}>
      <span style={{
        flexShrink: 0, width: '22px', height: '22px', borderRadius: '50%',
        background: C.brand500, color: '#fff',
        fontSize: '0.7rem', fontWeight: 800,
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '0.15rem',
      }}>{index + 1}</span>
      <span style={{ fontSize: '0.875rem', color: C.n700, lineHeight: 1.6 }}>
        {label && <strong style={{ fontWeight: 700, color: C.n900 }}>{label}: </strong>}
        {body}
      </span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 2 — SWOT components
// ─────────────────────────────────────────────────────────────────────────────

const SWOT_CFG = {
  strengths:     { label: 'Strengths',     color: C.brand500, lightBg: C.brand50,  border: C.brand200, Icon: IconStrUp,  axis: 'Internal · Positive' },
  weaknesses:    { label: 'Weaknesses',    color: '#ef4444',  lightBg: '#fef2f2',  border: '#fecaca',  Icon: IconStrDn,  axis: 'Internal · Negative' },
  opportunities: { label: 'Opportunities', color: '#0ea5e9',  lightBg: '#f0f9ff',  border: '#bae6fd',  Icon: IconOpp,    axis: 'External · Positive' },
  threats:       { label: 'Threats',       color: '#f59e0b',  lightBg: '#fffbeb',  border: '#fde68a',  Icon: IconThreat, axis: 'External · Negative' },
}

function SwotQuadrant({ type, text }) {
  const cfg    = SWOT_CFG[type]
  const points = parsePoints(text).slice(0, 2)
  return (
    <div style={{ background: '#fff', border: `1px solid ${C.n200}`, borderRadius: '0.875rem', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '0.75rem 0.875rem', borderBottom: `1px solid ${C.n100}`, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ width: '26px', height: '26px', borderRadius: '0.4rem', background: cfg.lightBg, border: `1px solid ${cfg.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cfg.color, flexShrink: 0 }}>
          <cfg.Icon/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: C.n900 }}>{cfg.label}</div>
          <div style={{ fontSize: '0.6625rem', color: C.n400, fontWeight: 500 }}>{cfg.axis}</div>
        </div>
        <span style={{ flexShrink: 0, minWidth: '18px', height: '18px', borderRadius: '99px', background: cfg.color + '15', border: `1px solid ${cfg.color}30`, fontSize: '0.68rem', fontWeight: 700, color: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 0.3rem' }}>{points.length}</span>
      </div>
      <div style={{ padding: '0.75rem 0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        {points.map((p, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <div style={{ flexShrink: 0, marginTop: '0.4rem', width: '5px', height: '5px', borderRadius: '50%', background: cfg.color }}/>
            <span style={{ fontSize: '0.8375rem', color: C.n700, lineHeight: 1.55 }}>{p}</span>
          </div>
        ))}
        {points.length === 0 && <span style={{ fontSize: '0.8125rem', color: C.n400, fontStyle: 'italic' }}>—</span>}
      </div>
    </div>
  )
}

function RiskLevelBadge({ level }) {
  const color = riskColor(level)
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.2rem 0.55rem', borderRadius: '0.3rem', background: color, color: '#fff', fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{level}</span>
  )
}

function RiskBadge({ level }) {
  const color = riskColor(level)
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.875rem', borderRadius: '0.625rem', background: color + '12', border: `1.5px solid ${color}35` }}>
      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, flexShrink: 0 }}/>
      <div>
        <div style={{ fontSize: '0.6625rem', fontWeight: 600, color: C.n500, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Overall Risk</div>
        <div style={{ fontSize: '0.9375rem', fontWeight: 800, color }}>{level}</div>
      </div>
    </div>
  )
}

function RiskCard({ title, description, mitigation, level, index }) {
  const color = riskColor(level)
  const displayTitle = title || (() => {
    const words = (description ?? '').replace(/^(the|a|an)\s+/i, '').split(/\s+/).slice(0, 5).join(' ')
    return words.charAt(0).toUpperCase() + words.slice(1).replace(/[.,;]$/, '') + '…'
  })()
  return (
    <div style={{ borderRadius: '0.875rem', overflow: 'hidden', marginBottom: '0.75rem', border: `1px solid ${C.n200}`, borderLeft: `4px solid ${color}`, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.125rem 0.4rem' }}>
        <RiskLevelBadge level={level}/>
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: C.n400 }}>Risk #{index + 1}</span>
      </div>
      <div style={{ padding: '0 1.125rem 0.75rem' }}>
        <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: C.n900, lineHeight: 1.4, margin: '0 0 0.375rem' }}>{displayTitle}</p>
        <p style={{ fontSize: '0.8375rem', color: C.n600, lineHeight: 1.6, margin: 0 }}>{description}</p>
      </div>
      {mitigation && (
        <div style={{ margin: '0 1.125rem 1rem', padding: '0.75rem 0.875rem', borderRadius: '0.5rem', background: C.brand50, border: `1px solid ${C.brand200}`, display: 'flex', gap: '0.625rem', alignItems: 'flex-start' }}>
          <div style={{ flexShrink: 0, width: '26px', height: '26px', borderRadius: '0.375rem', background: C.brand500, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <IconWrench/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.6625rem', fontWeight: 800, color: C.brand600, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '0.25rem' }}>How to handle it</div>
            <p style={{ fontSize: '0.8375rem', color: C.brand700, lineHeight: 1.6, margin: 0 }}>{mitigation}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 3 — Market components
// ─────────────────────────────────────────────────────────────────────────────

const THREAT_CFG = {
  HIGH:   { color: '#dc2626' },
  MEDIUM: { color: '#d97706' },
  LOW:    { color: C.brand500 },
}
const SAT_CFG = {
  HIGH:   { color: '#dc2626' },
  MEDIUM: { color: '#d97706' },
  LOW:    { color: C.brand500 },
}

function MarketMetricCard({ icon, label, value, note, valueColor }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${C.n200}`, borderRadius: '0.875rem', padding: '1.125rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: C.n400, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em' }}>
        <span style={{ display: 'flex', alignItems: 'center', color: C.brand500 }}>{icon}</span>
        {label}
      </div>
      <div style={{ fontSize: 'clamp(1.375rem, 3vw, 1.875rem)', fontWeight: 800, color: valueColor || C.n900, lineHeight: 1.1, letterSpacing: '-0.025em' }}>{value}</div>
      {note && <div style={{ fontSize: '0.775rem', color: C.n500, lineHeight: 1.4 }}>{note}</div>}
    </div>
  )
}

function TrendBadge({ trend }) {
  const isGrowing = trend === 'GROWING', isDeclining = trend === 'DECLINING'
  const color  = isGrowing ? C.brand500 : isDeclining ? '#dc2626' : '#d97706'
  const bg     = isGrowing ? C.brand50  : isDeclining ? '#fee2e2' : '#fef3c7'
  const border = isGrowing ? C.brand200 : isDeclining ? '#fca5a5' : '#fcd34d'
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.75rem', borderRadius: '99px', background: bg, border: `1px solid ${border}`, fontSize: '0.75rem', fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      {isGrowing ? <IconTrendUp/> : <IconTrendDn/>}
      {trend}
    </span>
  )
}

function ThreatBadge({ level }) {
  const color = (THREAT_CFG[level?.toUpperCase()] || THREAT_CFG.MEDIUM).color
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.2rem 0.6rem', borderRadius: '0.3rem', background: color, color: '#fff', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase', flexShrink: 0 }}>
      {level?.toUpperCase()}
    </span>
  )
}

function CompetitorRow({ comp, isLast }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: isLast ? 'none' : `1px solid ${C.n100}` }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '0.875rem 1.25rem', background: open ? C.n50 : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s ease', fontFamily: 'inherit' }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = C.n50 }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = 'transparent' }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: C.n900, marginBottom: '0.15rem' }}>{comp.name}</div>
          <div style={{ fontSize: '0.8125rem', color: C.n500, lineHeight: 1.35 }}>{comp.description}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}>
          <ThreatBadge level={comp.threat}/>
          <span style={{ color: C.n400, display: 'flex', alignItems: 'center', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
            <IconChevDn/>
          </span>
        </div>
      </button>
      {open && (
        <div style={{ padding: '0 1.25rem 1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.625rem', animation: 'fadeIn 0.2s ease both' }}>
          {[
            { label: 'Price Range',    value: comp.priceRange     },
            { label: 'Who They Serve', value: comp.targetSegment  },
            { label: 'Their Strength', value: comp.mainStrength   },
          ].filter(i => i.value).map(item => (
            <div key={item.label} style={{ padding: '0.625rem 0.75rem', background: C.n50, border: `1px solid ${C.n100}`, borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '0.6625rem', fontWeight: 700, color: C.n400, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>{item.label}</div>
              <div style={{ fontSize: '0.8375rem', color: C.n700, lineHeight: 1.4, fontWeight: 500 }}>{item.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Growth Opportunities — full titles, separate descriptions, optional benefit line
 */
function OpportunityCarousel({ opportunities }) {
  const [index, setIndex] = useState(0)
  const total   = opportunities.length
  // Backend now returns structured objects: { title, description, benefit }
  const current = opportunities[index] ?? {}
  return (
    <div>
      {/* Nav row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
        <span style={{ fontSize: '0.8rem', color: C.n500, fontWeight: 600 }}>{total} identified</span>
        <div style={{ display: 'flex', gap: '0.25rem', marginLeft: 'auto' }}>
          {[
            { fn: () => setIndex(i => (i - 1 + total) % total), Icon: IconChevL },
            { fn: () => setIndex(i => (i + 1) % total),         Icon: IconChevR },
          ].map(({ fn, Icon }, i) => (
            <button key={i} onClick={fn}
              style={{ width: '30px', height: '30px', borderRadius: '0.5rem', border: `1px solid ${C.n200}`, background: '#fff', color: C.n600, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s ease' }}
              onMouseEnter={e => { e.currentTarget.style.background = C.brand50; e.currentTarget.style.borderColor = C.brand300; e.currentTarget.style.color = C.brand600 }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = C.n200; e.currentTarget.style.color = C.n600 }}
            ><Icon/></button>
          ))}
        </div>
      </div>

      {/* Card */}
      <div key={index} style={{ padding: '1rem 1.125rem', background: '#f9fafb', border: `1px solid ${C.n200}`, borderLeft: `3px solid ${C.brand500}`, borderRadius: '0.75rem', animation: 'fadeIn 0.2s ease both' }}>
        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '50%', background: C.brand500, color: '#fff', fontSize: '0.68rem', fontWeight: 800, flexShrink: 0 }}>{index + 1}</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: C.n900, lineHeight: 1.3 }}>{current.title}</span>
        </div>
        {/* Description — must differ from title */}
        {current.description && current.description !== current.title && (
          <p style={{ fontSize: '0.8375rem', color: C.n600, lineHeight: 1.6, margin: '0 0 0.5rem 1.75rem' }}>{current.description}</p>
        )}
        {/* Benefit pill */}
        {current.benefit && (
          <div style={{ marginLeft: '1.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.25rem 0.625rem', borderRadius: '99px', background: C.brand50, border: `1px solid ${C.brand200}` }}>
            <IconTrendUp/>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: C.brand700 }}>{current.benefit}</span>
          </div>
        )}
      </div>

      {/* Dot indicators */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.375rem', marginTop: '0.75rem' }}>
        {opportunities.map((_, i) => (
          <button key={i} onClick={() => setIndex(i)} style={{ width: i === index ? '18px' : '6px', height: '6px', borderRadius: '99px', background: i === index ? C.brand500 : C.n300, border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.2s ease' }}/>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab Bar
// ─────────────────────────────────────────────────────────────────────────────

function TabBar({ active, onChange, scoringDone, swotDone, marketDone }) {
  const tabs = [
    { id: 'scoring',   label: 'AI Evaluation',         icon: <IconScore/>  },
    { id: 'swot',      label: 'SWOT & Risk',            icon: <IconChart/>  },
    { id: 'market',    label: 'Market',                 icon: <IconMarket/> },
    { id: 'financial', label: 'Financial Projections',  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
  ]
  return (
    <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '1.25rem', background: '#f3f4f6', borderRadius: '0.75rem', padding: '0.25rem' }}>
      {tabs.map(t => {
        const isActive = active === t.id
        const isLocked = (t.id === 'swot' && !swotDone) || (t.id === 'market' && !marketDone) || (t.id === 'financial' && !marketDone)
        return (
          <button
            key={t.id}
            onClick={() => !isLocked && onChange(t.id)}
            disabled={isLocked}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '0.5rem', padding: '0.625rem 1rem', borderRadius: '0.5rem', border: 'none',
              background: isActive ? '#fff' : 'transparent',
              color: isActive ? C.n900 : isLocked ? C.n300 : C.n500,
              fontWeight: isActive ? 700 : 500, fontSize: '0.875rem',
              cursor: isLocked ? 'not-allowed' : 'pointer',
              boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease', fontFamily: 'inherit', whiteSpace: 'nowrap',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', color: isActive ? C.brand500 : 'inherit' }}>{t.icon}</span>
            <span>{t.label}</span>
            {((t.id === 'swot' && swotDone) || (t.id === 'market' && marketDone)) && (
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: C.brand500, flexShrink: 0 }}/>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Analyzing state
// ─────────────────────────────────────────────────────────────────────────────

function AnalyzingState() {
  const steps = [
    { label: 'Scoring market opportunity',   done: true  },
    { label: 'Evaluating financial viability', done: true  },
    { label: 'Assessing execution feasibility', done: false },
    { label: 'Running SWOT analysis',          done: false },
    { label: 'Researching market & competitors', done: false },
  ]
  return (
    <Card>
      <div style={{ textAlign: 'center', padding: '1rem 0 0.5rem' }}>
        <div style={{ display: 'inline-block', width: '3rem', height: '3rem', borderRadius: '50%', border: `3px solid ${C.brand500}20`, borderTopColor: C.brand500, animation: 'spin 0.9s linear infinite', marginBottom: '1.25rem' }}/>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: C.n900, margin: '0 0 0.35rem' }}>AI is analyzing your idea</h3>
        <p style={{ fontSize: '0.875rem', color: C.n500, margin: '0 0 1.75rem', lineHeight: 1.5 }}>15–30 seconds · Running real market data for Jordan.</p>
        <div style={{ maxWidth: '340px', margin: '0 auto', textAlign: 'left' }}>
          {steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', borderBottom: i < steps.length - 1 ? `1px solid #f3f4f6` : 'none' }}>
              <div style={{ width: '1.25rem', height: '1.25rem', borderRadius: '50%', flexShrink: 0, background: step.done ? C.brand500 : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {step.done
                  ? <span style={{ color: '#fff', fontSize: '0.65rem', display: 'flex' }}><IconCheck/></span>
                  : <div style={{ width: '8px', height: '8px', borderRadius: '50%', border: `2px solid ${C.n300}`, borderTopColor: C.brand500, animation: 'spin 0.9s linear infinite' }}/>
                }
              </div>
              <span style={{ fontSize: '0.8125rem', color: step.done ? C.n700 : C.n400, fontWeight: step.done ? 500 : 400 }}>{step.label}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ padding: '0.875rem', background: '#f9fafb', borderRadius: '0.75rem' }}>
              <Skeleton height="0.6rem" width="60%" style={{ marginBottom: '0.75rem' }}/>
              <Skeleton height="1.5rem" width="40%" style={{ marginBottom: '0.5rem' }}/>
              <Skeleton height="0.5rem"/>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 1 — ScoringTab  (compact)
// ─────────────────────────────────────────────────────────────────────────────

function ScoringTab({ scoring, onViewSwot, swotReady }) {
  const {
    overallScore, marketScore, financialScore, executionScore, innovationScore,
    verdict, summary,
    concerns: rawConcerns,
    recommendations: rawRecs,
  } = scoring

  // Cap at 5 concerns, 4 actions
  const concerns = (rawConcerns ?? []).slice(0, 5)
  const recs      = (rawRecs     ?? []).slice(0, 4)

  return (
    <>
      {/* Score card */}
      <Card style={{ marginBottom: '1rem' }}>
        <SectionTitle icon={<IconScore/>}>AI Evaluation Score</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <ScoreRing score={overallScore}/>
            <VerdictBadge verdict={verdict}/>
          </div>
          <div>
            <ScoreBar label="Market Opportunity"    score={marketScore}/>
            <ScoreBar label="Financial Viability"   score={financialScore}/>
            <ScoreBar label="Execution Feasibility" score={executionScore}/>
            <ScoreBar label="Innovation / USP"      score={innovationScore}/>
          </div>
        </div>
        {summary && (
          <div style={{ marginTop: '1rem', padding: '0.875rem 1rem', background: '#f9fafb', borderRadius: '0.625rem', borderLeft: `3px solid ${C.brand500}` }}>
            <p style={{ fontSize: '0.875rem', color: C.n700, lineHeight: 1.6, margin: 0 }}>{summary}</p>
          </div>
        )}
      </Card>

      {/* Concerns + Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        {/* Concerns */}
        <Card style={{ padding: '1.125rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 800, color: C.n900, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ color: '#f97316', fontSize: '0.8rem', fontWeight: 800 }}>!</span> Concerns
            </h2>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: C.n400, background: C.n100, padding: '0.15rem 0.5rem', borderRadius: '99px' }}>
              {concerns.length} flagged
            </span>
          </div>
          {concerns.map((c, i) => <ConcernItem key={i} text={c}/>)}
        </Card>

        {/* Recommended Actions */}
        <Card style={{ padding: '1.125rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 800, color: C.n900, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ color: C.brand500, display: 'flex', alignItems: 'center' }}><IconBulb/></span> Actions
            </h2>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: C.brand700, background: C.brand50, padding: '0.15rem 0.5rem', borderRadius: '99px', border: `1px solid ${C.brand200}` }}>
              {recs.length} steps
            </span>
          </div>
          {recs.map((r, i) => <ActionItem key={i} text={r} index={i}/>)}
        </Card>
      </div>

      {/* CTA */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
        <button
          onClick={onViewSwot}
          disabled={!swotReady}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.375rem', borderRadius: '0.625rem', border: 'none', background: swotReady ? `linear-gradient(180deg, ${C.brand500} 0%, ${C.brand600} 100%)` : '#e5e7eb', color: swotReady ? '#fff' : C.n400, fontWeight: 700, fontSize: '0.9375rem', fontFamily: 'inherit', cursor: swotReady ? 'pointer' : 'not-allowed', boxShadow: swotReady ? `0 4px 14px ${C.brand500}35` : 'none', transition: 'all 0.15s ease' }}
          onMouseEnter={e => { if (swotReady) e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
        >
          View SWOT &amp; Risk<IconArrow/>
        </button>
      </div>

      <MethodologyFooter tab="scoring"/>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 2 — SwotTab  (compact)
// ─────────────────────────────────────────────────────────────────────────────

function SwotTab({ swot, onViewMarket, marketReady }) {
  const { strengths, weaknesses, opportunities, threats, risks, overallRiskLevel } = swot
  const riskCards  = parseRisks(risks)
  const riskColor_ = riskColor(overallRiskLevel)

  return (
    <>
      {/* SWOT grid */}
      <Card style={{ marginBottom: '1rem', padding: '1.125rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
          <span style={{ color: C.brand500, display: 'flex' }}><IconChart/></span>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 800, color: C.n900, margin: 0 }}>SWOT Analysis</h2>
        </div>
        {/* Column labels */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem', marginBottom: '0.5rem' }}>
          {['Internal', 'External'].map(l => (
            <div key={l} style={{ fontSize: '0.68rem', fontWeight: 700, color: C.n400, textTransform: 'uppercase', letterSpacing: '0.08em', paddingLeft: '0.25rem' }}>{l}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
          <SwotQuadrant type="strengths"     text={strengths}/>
          <SwotQuadrant type="weaknesses"    text={weaknesses}/>
          <SwotQuadrant type="opportunities" text={opportunities}/>
          <SwotQuadrant type="threats"       text={threats}/>
        </div>
      </Card>

      {/* Key Risks */}
      <Card style={{ padding: '0', marginBottom: '0.75rem' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${C.n100}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <h2 style={{ fontSize: '0.9375rem', fontWeight: 800, color: C.n900, margin: 0 }}>Key Risks</h2>
              {riskCards.length > 0 && (
                <span style={{ padding: '0.15rem 0.55rem', borderRadius: '99px', background: riskColor_ + '15', border: `1px solid ${riskColor_}30`, fontSize: '0.7rem', fontWeight: 800, color: riskColor_ }}>
                  {riskCards.length} · {overallRiskLevel}
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.8rem', color: C.n400, margin: 0 }}>Operational &amp; financial risks — separate from SWOT threats.</p>
          </div>
          <RiskBadge level={overallRiskLevel}/>
        </div>
        <div style={{ padding: '1rem 1.125rem' }}>
          {riskCards.length > 0
            ? riskCards.map((r, i) => <RiskCard key={i} title={r.title} description={r.description} mitigation={r.mitigation} level={overallRiskLevel} index={i}/>)
            : <RiskCard title={null} description={risks} mitigation={null} level={overallRiskLevel} index={0}/>
          }
        </div>
      </Card>

      {/* CTA */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
        <button
          onClick={onViewMarket}
          disabled={!marketReady}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.375rem', borderRadius: '0.625rem', border: 'none', background: marketReady ? `linear-gradient(180deg, ${C.brand500} 0%, ${C.brand600} 100%)` : '#e5e7eb', color: marketReady ? '#fff' : C.n400, fontWeight: 700, fontSize: '0.9375rem', fontFamily: 'inherit', cursor: marketReady ? 'pointer' : 'not-allowed', boxShadow: marketReady ? `0 4px 14px ${C.brand500}35` : 'none', transition: 'all 0.15s ease' }}
          onMouseEnter={e => { if (marketReady) e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
        >
          View Market &amp; Competition<IconMarket/>
        </button>
      </div>

      <MethodologyFooter tab="swot"/>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 3 — MarketTab  (clean, no inline SourceRow)
// ─────────────────────────────────────────────────────────────────────────────

function MarketTab({ market: m }) {
  const analyzedAt    = fmtDate(m.analyzedAt)
  const satColor      = (SAT_CFG[m.saturation] || SAT_CFG.MEDIUM).color
  const competitors   = Array.isArray(m.competitors) ? m.competitors : []
  const opportunities = Array.isArray(m.marketOpportunities) ? m.marketOpportunities : []

  return (
    <>
      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
        <MarketMetricCard icon={<IconBuild/>} label="Market Size"  value={m.marketSize || '—'}  note="Total addressable market in Jordan"/>
        <MarketMetricCard icon={<IconUsers/>} label="Competitors"  value={competitors.length > 0 ? `${competitors.length}+` : '—'} note="Key players identified"/>
        <MarketMetricCard icon={<IconAct/>}   label="Saturation"   value={m.saturation || '—'}  valueColor={satColor}
          note={m.saturation === 'HIGH' ? '5+ established players in target area' : m.saturation === 'LOW' ? 'Underserved — first-mover opportunity' : 'Competition exists but room remains'}/>
      </div>

      {/* Market Trend */}
      {m.marketTrendReason && (
        <div style={{ background: '#fff', border: `1px solid ${C.n200}`, borderRadius: '0.875rem', marginBottom: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: '1rem 1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ marginTop: '0.1rem' }}><TrendBadge trend={m.marketTrend || 'STABLE'}/></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: C.n400, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>Market Trend</div>
              <p style={{ fontSize: '0.875rem', color: C.n700, lineHeight: 1.65, margin: 0 }}>{m.marketTrendReason}</p>
            </div>
          </div>
        </div>
      )}

      {/* Competitive Landscape */}
      {competitors.length > 0 && (
        <div style={{ background: '#fff', border: `1px solid ${C.n200}`, borderRadius: '0.875rem', marginBottom: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${C.n100}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 800, color: C.n900, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: C.brand500, display: 'flex' }}><IconUsers/></span>
              Competitive Landscape
            </h2>
            <span style={{ fontSize: '0.75rem', color: C.n400, fontStyle: 'italic' }}>Tap a row to expand</span>
          </div>
          <div style={{ padding: '0.375rem 0 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 1.25rem 0.5rem' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: C.n400, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Competitor</span>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: C.n400, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Threat</span>
            </div>
            <div style={{ borderTop: `1px solid ${C.n100}` }}>
              {competitors.map((comp, i) => (
                <CompetitorRow key={comp.name ?? i} comp={comp} isLast={i === competitors.length - 1}/>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* What Makes You Different */}
      {m.differentiationAnalysis && (
        <div style={{ background: '#fff', border: `1px solid ${C.n200}`, borderRadius: '0.875rem', marginBottom: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${C.n100}` }}>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 800, color: C.n900, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: C.brand500, display: 'flex' }}><IconShield/></span>
              What Makes You Different
            </h2>
          </div>
          <div style={{ padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.875rem 1rem', background: C.n50, border: `1px solid ${C.n200}`, borderRadius: '0.625rem' }}>
              <div style={{ flexShrink: 0, marginTop: '0.1rem', width: '26px', height: '26px', borderRadius: '0.4rem', background: C.brand50, border: `1px solid ${C.brand200}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.brand500 }}>
                <IconBulb/>
              </div>
              <p style={{ fontSize: '0.875rem', color: C.n700, lineHeight: 1.65, margin: 0 }}>{m.differentiationAnalysis}</p>
            </div>
          </div>
        </div>
      )}

      {/* Watch Out */}
      {m.fatalFlaws && (
        <div style={{ marginBottom: '1rem', padding: '1rem 1.25rem', background: '#fffbeb', border: `1px solid #fcd34d`, borderLeft: `4px solid #f59e0b`, borderRadius: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <div style={{ flexShrink: 0, marginTop: '0.05rem', width: '28px', height: '28px', borderRadius: '0.5rem', background: '#fef3c7', border: '1px solid #fcd34d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
              <IconWarn/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '0.375rem' }}>
                Watch Out — Common Failure Mode
              </div>
              <p style={{ fontSize: '0.875rem', color: '#92400e', lineHeight: 1.6, margin: 0 }}>{m.fatalFlaws}</p>
              {m.likelyFailureMode && (
                <p style={{ fontSize: '0.8125rem', color: '#a16207', lineHeight: 1.5, margin: '0.5rem 0 0', fontStyle: 'italic' }}>
                  If this closes in 18 months: {m.likelyFailureMode}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Growth Opportunities */}
      {opportunities.length > 0 && (
        <div style={{ background: '#fff', border: `1px solid ${C.n200}`, borderRadius: '0.875rem', marginBottom: '0.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${C.n100}` }}>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 800, color: C.n900, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: C.brand500, display: 'flex' }}><IconTrendUp/></span>
              Growth Opportunities
            </h2>
          </div>
          <div style={{ padding: '1rem 1.25rem' }}>
            <OpportunityCarousel opportunities={opportunities}/>
          </div>
        </div>
      )}

      <MethodologyFooter tab="market" analyzedAt={analyzedAt}/>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function EvaluationPage() {
  const { ideaId } = useParams()
  const navigate   = useNavigate()
  const { credits, refresh: refreshCredits, decrementOptimistic } = useCredits()

  const [phase,     setPhase]     = useState('loading')
  const [scoring,   setScoring]   = useState(null)
  const [swot,      setSwot]      = useState(null)
  const [market,    setMarket]    = useState(null)
  const [error,     setError]     = useState(null)
  const [noCredits, setNoCredits] = useState(false)
  const [activeTab, setActiveTab] = useState('scoring')

  // Switch tab AND scroll to top so user always lands at page start
  const switchTab = useCallback((tab) => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setActiveTab(tab)
  }, [])

  const pollRef    = useRef(null)
  const mountedRef = useRef(true)

  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
  }, [])

  const applyResults = useCallback((data) => {
    if (!mountedRef.current) return
    if (data.scoring) setScoring(data.scoring)
    if (data.swot)    setSwot(data.swot)
    if (data.market)  setMarket(data.market)
  }, [])

  const checkAndProgress = useCallback(async () => {
    try {
      const data = await getEvaluationResults(ideaId)
      applyResults(data)
      if (data.status === 'completed')   { stopPolling(); setPhase('completed') }
      else if (data.status === 'failed') { stopPolling(); setPhase('failed'); setError('The AI evaluation failed. Please try again.') }
    } catch (err) { stopPolling(); setPhase('failed'); setError(err.message) }
  }, [ideaId, applyResults, stopPolling])

  const startPolling = useCallback(() => {
    stopPolling()
    pollRef.current = setInterval(checkAndProgress, POLL_MS)
  }, [checkAndProgress, stopPolling])

  const triggerEvaluation = useCallback(async () => {
    try {
      // Optimistically update the UI instantly — no waiting for the server round-trip
      decrementOptimistic()
      await startEvaluation(ideaId)
      // Then confirm the real value from the server
      refreshCredits()
      setPhase('analyzing')
      startPolling()
    } catch (err) {
      // Always re-sync credits — optimistic decrement may have been wrong
      refreshCredits()
      if (err.data?.code === 'NO_CREDITS') {
        setNoCredits(true); setPhase('failed'); return
      }
      setPhase('failed'); setError(err.message)
    }
  }, [ideaId, startPolling, decrementOptimistic, refreshCredits])

  useEffect(() => {
    mountedRef.current = true
    async function bootstrap() {
      try {
        const data = await getEvaluationResults(ideaId)
        applyResults(data)
        if (data.status === 'completed')   setPhase('completed')
        else if (data.status === 'failed') { setPhase('failed'); setError('Evaluation failed. Retry below.') }
        else {
          // Gate: check credits before hitting the backend
          if (credits === 0) { setNoCredits(true); setPhase('failed'); return }
          await triggerEvaluation()
        }
      } catch (err) {
        if (err.status === 404) navigate('/dashboard', { replace: true })
        else { setPhase('failed'); setError(err.message) }
      }
    }
    bootstrap()
    return () => { mountedRef.current = false; stopPolling() }
  }, [ideaId]) // eslint-disable-line

  const handleRetry = () => { setPhase('loading'); setError(null); triggerEvaluation() }

  return (
    <AppLayout>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes fadeUp    { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn    { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes popoverIn { from{opacity:0;transform:scale(0.94)} to{opacity:1;transform:scale(1)} }
      `}</style>

      {/* Page Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <Link to="/dashboard"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', fontWeight: 600, color: C.n500, textDecoration: 'none', marginBottom: '0.625rem', transition: 'color 0.15s ease' }}
            onMouseEnter={e => e.currentTarget.style.color = C.brand500}
            onMouseLeave={e => e.currentTarget.style.color = C.n500}
          >← Back to Dashboard</Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.625rem' }}>
            <Link to="/dashboard"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', fontWeight: 600, color: C.n500, textDecoration: 'none', transition: 'color 0.15s ease' }}
              onMouseEnter={e => e.currentTarget.style.color = C.brand500}
              onMouseLeave={e => e.currentTarget.style.color = C.n500}
            >← Back to Dashboard</Link>
            {phase === 'completed' && (
              <Link to={`/financial-projections/${ideaId}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', fontWeight: 700, color: C.brand600, textDecoration: 'none', padding: '0.3rem 0.75rem', background: C.brand50, border: `1px solid ${C.brand200}`, borderRadius: 99, transition: 'all 0.15s ease' }}
                onMouseEnter={e => { e.currentTarget.style.background = C.brand100; e.currentTarget.style.borderColor = C.brand300 }}
                onMouseLeave={e => { e.currentTarget.style.background = C.brand50;  e.currentTarget.style.borderColor = C.brand200 }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                Financial Projections
              </Link>
            )}
          </div>
          <h1 style={{ fontSize: 'clamp(1.375rem, 3vw, 1.75rem)', fontWeight: 800, color: C.n900, margin: '0 0 0.25rem', letterSpacing: '-0.02em' }}>Idea Evaluation</h1>
          <p style={{ fontSize: '0.875rem', color: C.n500, margin: 0 }}>AI-powered scoring, SWOT, and market analysis</p>
        </div>
        {phase === 'analyzing' && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.875rem', borderRadius: '99px', background: C.brand500 + '12', border: `1px solid ${C.brand500}30`, fontSize: '0.8125rem', fontWeight: 600, color: C.brand500 }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: C.brand500, animation: 'spin 1s linear infinite', border: `2px solid ${C.brand500}50`, borderTopColor: C.brand500, boxSizing: 'border-box', flexShrink: 0 }}/>
            Analyzing…
          </span>
        )}
        {phase === 'completed' && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.875rem', borderRadius: '99px', background: '#dcfce7', border: '1px solid #86efac', fontSize: '0.8125rem', fontWeight: 600, color: '#15803d' }}>
            <IconCheck/> Complete
          </span>
        )}
        {phase === 'failed' && !noCredits && (
          <span style={{ padding: '0.35rem 0.875rem', borderRadius: '99px', background: '#fee2e2', border: '1px solid #fca5a5', fontSize: '0.8125rem', fontWeight: 600, color: '#dc2626' }}>Failed</span>
        )}
        {phase === 'failed' && noCredits && (
          <span style={{ padding: '0.35rem 0.875rem', borderRadius: '99px', background: C.brand50, border: `1px solid ${C.brand200}`, fontSize: '0.8125rem', fontWeight: 600, color: C.brand600 }}>No Credits</span>
        )}
      </div>

      {/* Loading skeleton */}
      {phase === 'loading' && (
        <Card>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <Skeleton height="1.75rem" width="50%"/>
            <Skeleton height="1rem"   width="30%"/>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
              {[1,2,3,4].map(i => <Skeleton key={i} height="5rem" radius="0.75rem"/>)}
            </div>
          </div>
        </Card>
      )}

      {phase === 'analyzing' && <AnalyzingState/>}

      {/* Failed state — no credits */}
      {phase === 'failed' && noCredits && (
        <Card>
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: C.brand50, border: `2px solid ${C.brand200}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: C.brand500 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: C.n900, margin: '0 0 0.5rem' }}>No evaluation credits</h3>
            <p style={{ fontSize: '0.875rem', color: C.n500, margin: '0 0 1.5rem', maxWidth: '340px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
              You've used all your credits. Purchase more to continue evaluating ideas.
            </p>
            <Link to="/buy-credits" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '0.625rem', background: `linear-gradient(180deg, ${C.brand500} 0%, ${C.brand600} 100%)`, color: '#fff', fontWeight: 700, fontSize: '0.9375rem', textDecoration: 'none', boxShadow: `0 4px 14px ${C.brand500}35` }}>
              Buy Credits →
            </Link>
          </div>
        </Card>
      )}

      {/* Failed state — generic error */}
      {phase === 'failed' && !noCredits && (
        <Card>
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#dc2626' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: C.n900, margin: '0 0 0.5rem' }}>Evaluation failed</h3>
            <p style={{ fontSize: '0.875rem', color: C.n500, margin: '0 0 1.5rem', maxWidth: '360px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.55 }}>
              {error ?? 'Something went wrong during the AI analysis.'}
            </p>
            <button onClick={handleRetry} style={{ padding: '0.75rem 1.5rem', borderRadius: '0.625rem', background: `linear-gradient(180deg, ${C.brand500} 0%, ${C.brand600} 100%)`, color: '#fff', fontWeight: 700, fontSize: '0.9375rem', border: 'none', cursor: 'pointer', boxShadow: `0 4px 14px ${C.brand500}35`, fontFamily: 'inherit' }}>
              Retry Evaluation
            </button>
          </div>
        </Card>
      )}

      {/* Completed */}
      {phase === 'completed' && scoring && (
        <div style={{ animation: 'fadeUp 0.4s ease both' }}>
          <TabBar
            active={activeTab}
            onChange={switchTab}
            scoringDone={!!scoring}
            swotDone={!!swot}
            marketDone={!!market}
          />
          {activeTab === 'scoring' && <ScoringTab scoring={scoring} swotReady={!!swot} onViewSwot={() => switchTab('swot')}/>}
          {activeTab === 'swot'    && swot   && <SwotTab   swot={swot} marketReady={!!market} onViewMarket={() => switchTab('market')}/>}
          {activeTab === 'market'  && market && <MarketTab market={market}/>}
          {activeTab === 'financial' && <FinancialProjectionsWizard ideaId={ideaId} />}
        </div>
      )}
    </AppLayout>
  )
}