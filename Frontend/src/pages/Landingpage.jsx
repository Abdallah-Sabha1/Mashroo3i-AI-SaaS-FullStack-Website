/**
 * LandingPage.jsx — Light theme, improved transitions.
 * Navbar → Hero → Stats → [Bridge] → Features → CTA → Footer
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar, { C } from '../styles/components/Navbar'
import Footer from '../styles/components/Footer'


const btnPrimary = {
  display:'inline-flex', alignItems:'center', gap:'0.5rem',
  padding:'0.8125rem 1.75rem', borderRadius:'0.625rem',
  backgroundColor: C.brand500, color:'#fff',
  fontWeight:700, fontSize:'0.9375rem',
  textDecoration:'none', border:'none', cursor:'pointer',
  transition:'all 0.15s ease',
  boxShadow:'0 4px 14px rgba(29,158,117,0.35)',
}
const btnGhost = {
  display:'inline-flex', alignItems:'center', gap:'0.5rem',
  padding:'0.8125rem 1.75rem', borderRadius:'0.625rem',
  backgroundColor:'rgba(255,255,255,0.15)',
  border:'1px solid rgba(255,255,255,0.35)',
  color:'#fff', fontWeight:600, fontSize:'0.9375rem',
  textDecoration:'none', cursor:'pointer',
  transition:'all 0.15s ease',
}

/* ── HERO ────────────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section style={{
      background:`linear-gradient(150deg, ${C.brand700} 0%, ${C.brand500} 55%, ${C.brand400} 100%)`,
      padding:'clamp(5rem,10vw,8rem) 2rem',
      textAlign:'center', position:'relative', overflow:'hidden',
    }}>
      <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize:'32px 32px', pointerEvents:'none' }} />
      <div style={{ position:'absolute', top:'30%', left:'50%', transform:'translate(-50%,-50%)', width:'700px', height:'400px', borderRadius:'50%', background:'radial-gradient(ellipse, rgba(255,255,255,0.08) 0%, transparent 65%)', pointerEvents:'none' }} />

      <div style={{ maxWidth:'780px', margin:'0 auto', position:'relative', zIndex:1 }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', padding:'0.375rem 1rem', borderRadius:'9999px', border:'1px solid rgba(255,255,255,0.3)', backgroundColor:'rgba(255,255,255,0.12)', marginBottom:'2rem' }}>
          <span style={{ width:'7px', height:'7px', borderRadius:'50%', backgroundColor:'#fff', display:'inline-block', opacity:0.9 }} />
          <span style={{ fontSize:'0.75rem', fontWeight:600, color:'rgba(255,255,255,0.9)', letterSpacing:'0.06em', textTransform:'uppercase' }}>Now available for Jordanian entrepreneurs</span>
        </div>

        <h1 style={{ fontSize:'clamp(2.5rem,6vw,4.25rem)', fontWeight:800, lineHeight:1.08, letterSpacing:'-0.035em', margin:'0 0 1.5rem 0', color:'#fff' }}>
          Validate your ideas{' '}
          <span style={{ color:C.brand100 }}>with AI</span>
        </h1>

        <p style={{ fontSize:'clamp(1rem,2vw,1.25rem)', color:'rgba(255,255,255,0.75)', lineHeight:1.75, margin:'0 auto 2.75rem', maxWidth:'560px' }}>
          Mashroo3i evaluates your business ideas, creates financial plans, and generates professional business plans tailored for the Jordanian market.
        </p>

        <div style={{ display:'flex', gap:'0.875rem', justifyContent:'center', flexWrap:'wrap' }}>
          <Link to="/register"
            style={{ ...btnPrimary, backgroundColor:'#fff', color:C.brand600, boxShadow:'0 4px 16px rgba(0,0,0,0.12)' }}
            onMouseEnter={e=>{ e.currentTarget.style.backgroundColor=C.brand50; e.currentTarget.style.transform='translateY(-2px)' }}
            onMouseLeave={e=>{ e.currentTarget.style.backgroundColor='#fff'; e.currentTarget.style.transform='translateY(0)' }}>
            Start Free
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
          <a href="#features"
            style={btnGhost}
            onMouseEnter={e=>{ e.currentTarget.style.backgroundColor='rgba(255,255,255,0.22)' }}
            onMouseLeave={e=>{ e.currentTarget.style.backgroundColor='rgba(255,255,255,0.15)' }}>
            See how it works
          </a>
        </div>

        <p style={{ marginTop:'2.75rem', fontSize:'0.875rem', color:'rgba(255,255,255,0.55)' }}>
          Built for entrepreneurs in <strong style={{ color:'#fff', fontWeight:600 }}>Jordan</strong>
        </p>
      </div>

      {/* Wave SVG at the bottom to flow into Stats */}
      <div style={{ position:'absolute', bottom:-1, left:0, right:0, lineHeight:0 }}>
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ width:'100%', height:'60px', display:'block' }}>
          <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill={C.brand50} />
        </svg>
      </div>
    </section>
  )
}

/* ── STATS ────────────────────────────────────────────────────────────────── */
const STATS = [
  {
    value: 'Instant Analysis',
    label: 'From idea to full business analysis',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
  {
    value: 'Local Data',
    label: "Powered by Jordan latest market trends and industry sectors.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    value: 'Risk Assessment',
    label: 'Identify potential pitfalls before you spend a single Dinar.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
]

function Stats() {
  return (
    <section id="stats" style={{
      backgroundColor: C.brand50,
      padding:'4rem 2rem 5rem',
      position:'relative',
    }}>
      <div style={{ maxWidth:'900px', margin:'0 auto' }}>
        {/* Section label */}
        <p style={{ textAlign:'center', fontSize:'0.72rem', fontWeight:700, color:C.brand500, textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'2.5rem' }}>
          Why entrepreneurs choose us
        </p>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:'1.25rem' }}>
          {STATS.map((s, i) => (
            <StatCard key={s.label} {...s} index={i} />
          ))}
        </div>
      </div>

      {/* Transition: fade brand50 → white with a subtle diagonal strip */}
      <div style={{
        position:'absolute', bottom:0, left:0, right:0,
        height:'80px',
        background:`linear-gradient(to bottom right, ${C.brand50} 49%, #fff 50%)`,
      }} />
    </section>
  )
}

function StatCard({ value, label, icon }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={()=>setHov(true)}
      onMouseLeave={()=>setHov(false)}
      style={{
        padding:'2rem 1.75rem',
        borderRadius:'1.125rem',
        border:`1.5px solid ${hov ? C.brand300 : C.brand200}`,
        backgroundColor: hov ? '#fff' : 'rgba(255,255,255,0.7)',
        boxShadow: hov ? '0 8px 28px rgba(29,158,117,0.13)' : '0 1px 4px rgba(29,158,117,0.06)',
        transform: hov ? 'translateY(-4px)' : 'translateY(0)',
        transition:'all 0.22s ease',
        display:'flex', flexDirection:'column', alignItems:'flex-start', gap:'1rem',
        position:'relative', overflow:'hidden',
        backdropFilter:'blur(4px)',
      }}
    >
      {/* Subtle decorative circle */}
      <div style={{
        position:'absolute', top:'-20px', right:'-20px',
        width:'90px', height:'90px', borderRadius:'50%',
        background:`radial-gradient(circle, ${C.brand100} 0%, transparent 70%)`,
        opacity: hov ? 1 : 0.5,
        transition:'opacity 0.22s ease',
        pointerEvents:'none',
      }} />

      <div style={{
        width:'44px', height:'44px', borderRadius:'10px',
        backgroundColor: hov ? C.brand100 : C.brand50,
        border:`1px solid ${hov ? C.brand300 : C.brand200}`,
        display:'flex', alignItems:'center', justifyContent:'center',
        color: C.brand500,
        transition:'all 0.22s ease',
        flexShrink:0,
      }}>
        {icon}
      </div>

      <div>
        <p style={{ fontSize:'2.25rem', fontWeight:800, color:C.brand600, margin:'0 0 0.25rem 0', letterSpacing:'-0.03em', lineHeight:1 }}>{value}</p>
        <p style={{ fontSize:'0.875rem', color:C.n500, margin:0, lineHeight:1.55 }}>{label}</p>
      </div>
    </div>
  )
}

/* ── BRIDGE — the glue between Stats and Features ───────────────────────── */
function Bridge() {
  return (
    <section style={{
      backgroundColor:'#fff',
      padding:'3rem 2rem 0',
      textAlign:'center',
    }}>
      <div style={{ maxWidth:'560px', margin:'0 auto', display:'flex', flexDirection:'column', alignItems:'center', gap:'1.25rem' }}>
        {/* Divider line with dot */}
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', width:'100%', maxWidth:'320px' }}>
          <div style={{ flex:1, height:'1px', backgroundColor:C.n200 }} />
          <div style={{ width:'8px', height:'8px', borderRadius:'50%', backgroundColor:C.brand300 }} />
          <div style={{ flex:1, height:'1px', backgroundColor:C.n200 }} />
        </div>

        
      </div>
    </section>
  )
}

/* ── FEATURES ────────────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>,
    title: 'AI-Powered Evaluation',
    desc: 'Know in 2 minutes whether your idea has market potential — before spending a single dinar.',
    outcome: 'Market score, risk level, and SWOT in seconds',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    title: '12-Month Financial Forecast',
    desc: 'Enter your investment and pricing. Get startup costs, break-even analysis, and 12-month revenue projections.',
    outcome: 'See your break-even month before you launch',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>,
    title: 'Investor-Ready Business Plan',
    desc: 'Download a professionally structured PDF business plan tailored to your idea and the jordan market.',
    outcome: 'Walk into any meeting with a full plan in hand',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
    title: 'Jordan Market Intelligence',
    desc: "Benchmark your idea against real data from Jordan's key industries — F&B, retail, tech, healthcare, and more.",
    outcome: "Know exactly who your customers are and what they'll pay",
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/></svg>,
    title: 'Strategic SWOT Analysis',
    desc: 'Surface hidden risks and overlooked opportunities with a structured analysis specific to your sector and region.',
    outcome: 'Spot threats early — while you can still pivot',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
    title: 'Scenario Planning',
    desc: 'Compare pessimistic, realistic, and optimistic financial scenarios side by side to make confident decisions.',
    outcome: 'Plan for the worst, build for the best',
  },
]

const TickIcon = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style={{ flexShrink:0 }}>
    <path d="M2 7.5L5 10.5L12 3.5" stroke={C.brand500} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

function FeatureCard({ icon, title, desc, outcome }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={()=>setHov(true)}
      onMouseLeave={()=>setHov(false)}
      style={{
        borderRadius:'1rem',
        border:`1px solid ${hov ? C.brand200 : C.n200}`,
        backgroundColor: hov ? C.brand50 : '#fff',
        padding:'1.875rem', display:'flex', flexDirection:'column',
        transition:'all 0.2s ease',
        transform: hov ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hov ? '0 8px 24px rgba(29,158,117,0.12)' : '0 1px 4px rgba(0,0,0,0.05)',
        cursor:'default',
      }}
    >
      <div style={{
        width:'44px', height:'44px', borderRadius:'0.625rem', marginBottom:'1.25rem',
        backgroundColor: hov ? C.brand100 : C.brand50,
        border:`1px solid ${hov ? C.brand300 : C.brand200}`,
        display:'flex', alignItems:'center', justifyContent:'center',
        color: C.brand500, transition:'all 0.2s ease', flexShrink:0,
      }}>
        {icon}
      </div>
      <h3 style={{ fontSize:'1.0625rem', fontWeight:700, color:C.n900, margin:'0 0 0.625rem 0' }}>{title}</h3>
      <p style={{ fontSize:'0.875rem', color:C.n500, lineHeight:1.7, margin:0, flex:1 }}>{desc}</p>
      {outcome && (
        <div style={{ marginTop:'1.25rem', paddingTop:'1.25rem', borderTop:`1px solid ${hov ? C.brand100 : C.n100}` }}>
          <p style={{ display:'flex', alignItems:'center', gap:'0.375rem', fontSize:'0.8125rem', fontWeight:600, color:C.brand600, margin:0 }}>
            <TickIcon />{outcome}
          </p>
        </div>
      )}
    </div>
  )
}

function Features() {
  return (
    <section id="features" style={{ backgroundColor:'#fff', padding:'4rem 2rem 6rem' }}>
      <div style={{ maxWidth:'1200px', margin:'0 auto' }}>
        <div style={{ textAlign:'center', maxWidth:'600px', margin:'0 auto 4rem' }}>
          <p style={{ fontSize:'0.75rem', fontWeight:700, color:C.brand500, textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 0 0.75rem 0' }}>Features</p>
          <h2 style={{ fontSize:'clamp(1.875rem,3vw,2.75rem)', fontWeight:800, color:C.n900, letterSpacing:'-0.03em', margin:'0 0 1rem 0', lineHeight:1.15 }}>
            Everything you need to launch
          </h2>
          <p style={{ fontSize:'1.0625rem', color:C.n500, lineHeight:1.7, margin:0 }}>
            From idea validation to investor-ready business plans.
          </p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))', gap:'1.125rem' }}>
          {FEATURES.map(f => <FeatureCard key={f.title} {...f} />)}
        </div>
      </div>
    </section>
  )
}

/* ── CTA ─────────────────────────────────────────────────────────────────── */
function CTA() {
  return (
    <section style={{ backgroundColor:C.n100, padding:'5rem 2rem' }}>
      <div style={{ maxWidth:'1100px', margin:'0 auto' }}>
        <div style={{
          borderRadius:'1.5rem',
          background:`linear-gradient(135deg, ${C.brand700} 0%, ${C.brand500} 100%)`,
          padding:'4rem 3rem', textAlign:'center',
          boxShadow:'0 8px 40px rgba(29,158,117,0.25)',
          position:'relative', overflow:'hidden',
        }}>
          <div style={{ position:'absolute', top:'-80px', left:'50%', transform:'translateX(-50%)', width:'500px', height:'300px', borderRadius:'50%', background:'radial-gradient(ellipse, rgba(255,255,255,0.08) 0%, transparent 65%)', pointerEvents:'none' }} />
          <h2 style={{ fontSize:'clamp(1.875rem,3vw,2.75rem)', fontWeight:800, color:'#fff', letterSpacing:'-0.03em', margin:'0 0 1rem 0', lineHeight:1.15, position:'relative', zIndex:1 }}>
            Ready to bring your idea to life?
          </h2>
          <p style={{ fontSize:'1.0625rem', color:'rgba(255,255,255,0.75)', lineHeight:1.7, margin:'0 auto 2.5rem', maxWidth:'420px', position:'relative', zIndex:1 }}>
            Join entrepreneurs building the future with Mashroo3i.
          </p>
          <Link to="/register"
            style={{ ...btnPrimary, backgroundColor:'#fff', color:C.brand600, boxShadow:'0 4px 16px rgba(0,0,0,0.12)', position:'relative', zIndex:1 }}
            onMouseEnter={e=>{ e.currentTarget.style.backgroundColor=C.brand50; e.currentTarget.style.transform='translateY(-2px)' }}
            onMouseLeave={e=>{ e.currentTarget.style.backgroundColor='#fff'; e.currentTarget.style.transform='translateY(0)' }}>
            Start for Free
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ── FOOTER ──────────────────────────────────────────────────────────────── */
      <Footer />


export default function LandingPage() {
  return (
    <div style={{ fontFamily:"'Inter','Segoe UI',system-ui,sans-serif" }}>
      <Navbar />
      <Hero />
      <Stats />
      <Bridge />
      <Features />
      <CTA />
      <Footer />
    </div>
  )
}