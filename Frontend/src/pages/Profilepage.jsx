/**
 * ProfilePage.jsx — clean profile with real user data from /me endpoint.
 * Subscription section removed (coming later).
 */

import { useEffect, useState } from 'react'
import { useAuth }    from '../context/AuthContext'
import { AppLayout }  from '../styles'
import { C }          from '../styles/components/DashNavbar'
import { listMyIdeas } from '../services/ideaService'
import api from '../services/api'

// ─────────────────────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────────────────────

const IconUser       = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const IconMail       = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
const IconBook       = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
const IconBriefcase  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
const IconTarget     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
const IconCalendar   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
const IconBulb       = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>
const IconChart      = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
const IconStar       = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>

// ─────────────────────────────────────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────────────────────────────────────

function InfoRow({ icon, label, value, last }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '0.875rem',
      padding: '0.875rem 0',
      borderBottom: last ? 'none' : `1px solid ${C.n100}`,
    }}>
      <div style={{
        width: '32px', height: '32px', borderRadius: '0.5rem', flexShrink: 0,
        background: C.brand50, border: `1px solid ${C.brand100}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.brand600,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: C.n400, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.2rem' }}>
          {label}
        </div>
        <div style={{ fontSize: '0.9rem', fontWeight: 500, color: value ? C.n800 : C.n400, fontStyle: value ? 'normal' : 'italic', lineHeight: 1.5 }}>
          {value || 'Not provided'}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, loading, color }) {
  return (
    <div style={{
      background: '#fff', border: `1px solid ${C.n200}`, borderRadius: '0.875rem',
      padding: '1.125rem 1.25rem', flex: 1, minWidth: '110px',
      display: 'flex', alignItems: 'center', gap: '0.875rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <div style={{
        width: '36px', height: '36px', borderRadius: '0.625rem', flexShrink: 0,
        background: (color || C.brand500) + '15',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: color || C.brand500,
      }}>
        {icon}
      </div>
      <div>
        {loading ? (
          <div style={{ width: '2.5rem', height: '1.25rem', borderRadius: '0.25rem', background: 'linear-gradient(90deg,#f3f4f6 0%,#e5e7eb 50%,#f3f4f6 100%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s ease-in-out infinite', marginBottom: '0.2rem' }}/>
        ) : (
          <div style={{ fontSize: '1.375rem', fontWeight: 800, color: C.n900, lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</div>
        )}
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: C.n500, marginTop: '0.2rem' }}>{label}</div>
      </div>
    </div>
  )
}

function scoreColor(s) {
  if (s >= 75) return C.brand500
  if (s >= 60) return '#0ea5e9'
  if (s >= 45) return '#f59e0b'
  return '#ef4444'
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user } = useAuth()

  const [profile,  setProfile]  = useState(null)
  const [ideas,    setIdeas]    = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    let cancelled = false

    Promise.all([
      api.get('/api/auth/me', { auth: true }),
      listMyIdeas(),
    ])
      .then(([prof, ideasData]) => {
        if (!cancelled) {
          setProfile(prof)
          setIdeas(Array.isArray(ideasData) ? ideasData : [])
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  // ── Derived stats ─────────────────────────────────────────────────────────
  const evaluated = ideas.filter(i => i.status === 'completed')
  const scores    = evaluated.map(i => i.overallScore).filter(s => s != null)
  const avgScore  = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : null

  const initials = (user?.fullName ?? '?')
    .trim().split(/\s+/).slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '').join('')

  const joinedDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-JO', { month: 'long', year: 'numeric' })
    : null

  return (
    <AppLayout>
      <style>{`
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* ── Page title ── */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 1.875rem)', fontWeight: 800, color: C.n900, margin: '0 0 0.25rem', letterSpacing: '-0.02em' }}>
          My Profile
        </h1>
        <p style={{ fontSize: '0.875rem', color: C.n500, margin: 0 }}>Your account details and activity.</p>
      </div>

      {/* ── Profile hero card ── */}
      <div style={{
        background: '#fff', border: `1px solid ${C.n200}`, borderRadius: '1rem',
        overflow: 'hidden', marginBottom: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)',
        animation: 'fadeUp 0.3s ease both',
      }}>
        {/* Banner */}
        <div style={{
          height: '90px',
          background: `linear-gradient(135deg, ${C.brand500} 0%, ${C.brand800} 100%)`,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', right: '-20px', top: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }}/>
          <div style={{ position: 'absolute', right: '80px', bottom: '-40px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }}/>
        </div>

        {/* Content */}
        <div style={{ padding: '0 1.75rem 1.5rem', position: 'relative' }}>
          {/* Avatar */}
          <div style={{ position: 'absolute', top: '-40px' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: `linear-gradient(135deg, ${C.brand400}, ${C.brand700})`,
              border: '3px solid #fff', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#fff', fontWeight: 800,
              fontSize: '1.625rem', letterSpacing: '-0.02em',
              boxShadow: `0 4px 16px ${C.brand500}40`, userSelect: 'none',
            }}>
              {initials}
            </div>
          </div>

          {/* Name row */}
          <div style={{ height: '48px' }}/>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: C.n900, margin: '0 0 0.375rem', letterSpacing: '-0.01em' }}>
                {profile?.fullName ?? user?.fullName ?? '—'}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                  padding: '0.2rem 0.625rem', borderRadius: '99px',
                  background: C.brand50, border: `1px solid ${C.brand200}`,
                  fontSize: '0.8rem', fontWeight: 600, color: C.brand700,
                }}>
                  <IconUser/> {profile?.role ?? user?.role ?? 'Entrepreneur'}
                </span>
                {joinedDate && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: C.n400, fontWeight: 500 }}>
                    <IconCalendar/> Joined {joinedDate}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap', marginBottom: '1rem', animation: 'fadeUp 0.35s ease both 0.05s' }}>
        <StatCard icon={<IconBulb/>}  label="Ideas submitted"  value={ideas.length}       loading={loading} color={C.brand500}/>
        <StatCard icon={<IconChart/>} label="Evaluations done" value={evaluated.length}    loading={loading} color="#0ea5e9"/>
        <StatCard icon={<IconStar/>}  label="Avg. score"       value={avgScore != null ? avgScore : '—'} loading={loading} color={avgScore ? scoreColor(avgScore) : C.n400}/>
      </div>

      {/* ── Account details + background in a grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', animation: 'fadeUp 0.4s ease both 0.1s' }}>

        {/* Account info */}
        <div style={{
          background: '#fff', border: `1px solid ${C.n200}`, borderRadius: '1rem',
          padding: '1.375rem 1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: C.n900, margin: '0 0 0.25rem' }}>Account</h3>
          <p style={{ fontSize: '0.8rem', color: C.n400, margin: '0 0 0.375rem' }}>Your login information.</p>
          <InfoRow icon={<IconUser/>} label="Full name" value={profile?.fullName ?? user?.fullName}/>
          <InfoRow icon={<IconMail/>} label="Email"     value={profile?.email}/>
          <InfoRow icon={<IconUser/>} label="Role"      value={profile?.role ?? user?.role} last/>
        </div>

        {/* Background info */}
        <div style={{
          background: '#fff', border: `1px solid ${C.n200}`, borderRadius: '1rem',
          padding: '1.375rem 1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: C.n900, margin: '0 0 0.25rem' }}>Background</h3>
          <p style={{ fontSize: '0.8rem', color: C.n400, margin: '0 0 0.375rem' }}>Info you provided when registering.</p>
          <InfoRow icon={<IconBook/>}      label="Education"          value={profile?.education}/>
          <InfoRow icon={<IconBriefcase/>} label="Experience"         value={profile?.experience}/>
          <InfoRow icon={<IconTarget/>}    label="Business interest"  value={profile?.businessInterest} last/>
        </div>
      </div>
    </AppLayout>
  )
}