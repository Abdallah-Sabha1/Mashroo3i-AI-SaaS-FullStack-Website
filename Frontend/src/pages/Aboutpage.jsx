/**
 * AboutPage.jsx — Professional About Us page
 * No team section. Product-first. Startup-grade copy.
 * Sections: Hero → Problem → Product → Values → Numbers → CTA
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

/* ── HERO ──────────────────────────────────────────────────────────────────
   Intentionally the visual opposite of the landing hero:
   - Landing: dark-green gradient, centered, white text. 
   - About:   pale-mint flat bg, asymmetric split, dark-green text, editorial card. 
   Same brand palette, inverted weight. */
function Hero() {
  return (
    <section style={{
      backgroundColor: C.brand50,
      padding: 'clamp(4.5rem, 9vw, 7.5rem) 2rem clamp(5rem, 9vw, 7rem)',
      position: 'relative',
      overflow: 'hidden',
      borderBottom: `1px solid ${C.brand100}`,
    }}>
      {/* Scoped styles — responsive stack + subtle animations */}
      <style>{`
        .about-hero-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
          gap: clamp(2.5rem, 5vw, 5rem);
          align-items: center;
        }
        @media (max-width: 860px) {
          .about-hero-grid { grid-template-columns: 1fr; gap: 3rem; }
          .about-hero-visual { max-width: 480px; margin: 0 auto; }
        }
        .about-hero-card { transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.5s ease; }
        .about-hero-card:hover { transform: translateY(-4px); box-shadow: 0 28px 70px ${C.brand900}22; }
      `}</style>

      {/* Subtle grid pattern — reads like blueprint/graph paper, not the dotted overlay used on landing */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(${C.brand200}33 1px, transparent 1px),
          linear-gradient(90deg, ${C.brand200}33 1px, transparent 1px)
        `,
        backgroundSize: '56px 56px',
        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Soft green blob — reinforces palette without competing with landing's radial highlight */}
      <div aria-hidden style={{
        position: 'absolute',
        top: '-180px', right: '-120px',
        width: '520px', height: '520px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${C.brand200}88 0%, transparent 65%)`,
        pointerEvents: 'none',
      }} />

      <div className="about-hero-grid" style={{ maxWidth: '1180px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* ─────────── LEFT: Content ─────────── */}
        <div>
          {/* Sharp tag with left accent bar — replaces the pill badge from landing */}
          <div style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '0.5rem 1rem 0.5rem 0.875rem',
            borderLeft: `3px solid ${C.brand500}`,
            backgroundColor: 'rgba(255,255,255,0.75)',
            backdropFilter: 'blur(4px)',
            marginBottom: '1.75rem',
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: C.brand700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Our story
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: '-0.035em',
            margin: '0 0 1.5rem',
            color: C.brand900,
          }}>
            Business planning,<br/>
            built for{' '}
            <span style={{
              color: C.brand600,
              backgroundImage: `linear-gradient(transparent 62%, ${C.brand200} 62%)`,
              paddingInline: '0.12em',
            }}>
              every Jordanian
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 1.4vw, 1.125rem)',
            color: C.n600,
            lineHeight: 1.75,
            margin: '0 0 2.5rem',
            maxWidth: '520px',
          }}>
            Mashroo3i combines AI intelligence with local market data to give any entrepreneur — regardless of background or budget — a genuine shot at building something that lasts.
          </p>

          <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}>
            {/* Primary: solid dark-green on light bg (opposite of landing's white-on-green) */}
            <Link to="/register"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.8125rem 1.75rem',
                borderRadius: '0.625rem',
                backgroundColor: C.brand600,
                color: '#fff',
                fontWeight: 700, fontSize: '0.9375rem',
                textDecoration: 'none', border: 'none', cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: `0 6px 18px ${C.brand500}55`,
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.brand700; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 10px 24px ${C.brand500}66` }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = C.brand600; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 6px 18px ${C.brand500}55` }}>
              Start free
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>

            {/* Secondary: outlined, not ghost */}
            <Link to="/contact"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.75rem 1.75rem',
                borderRadius: '0.625rem',
                backgroundColor: 'transparent',
                border: `1.5px solid ${C.brand600}`,
                color: C.brand700,
                fontWeight: 600, fontSize: '0.9375rem',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.brand100; e.currentTarget.style.borderColor = C.brand700 }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = C.brand600 }}>
              Contact us
            </Link>
          </div>
        </div>

        {/* ─────────── RIGHT: Editorial card with offset accent block ─────────── */}
        <div className="about-hero-visual" style={{ position: 'relative' }}>
          {/* Offset accent block — magazine layout feel */}
          <div aria-hidden style={{
            position: 'absolute',
            inset: 0,
            transform: 'translate(14px, 14px)',
            backgroundColor: C.brand300,
            borderRadius: '1rem',
            opacity: 0.55,
          }} />
          <div aria-hidden style={{
            position: 'absolute',
            inset: 0,
            transform: 'translate(28px, 28px)',
            backgroundColor: C.brand200,
            borderRadius: '1rem',
            opacity: 0.4,
          }} />

          {/* Foreground card */}
          <div className="about-hero-card" style={{
            position: 'relative',
            backgroundColor: '#fff',
            borderRadius: '1rem',
            padding: 'clamp(1.75rem, 3vw, 2.25rem)',
            boxShadow: `0 20px 60px ${C.brand900}18`,
            border: `1px solid ${C.brand100}`,
          }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              fontSize: '0.6875rem', fontWeight: 700,
              color: C.brand600,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              marginBottom: '1.25rem',
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: C.brand500 }} />
              Why we exist
            </div>

            {/* Oversized opening quotation mark — editorial device */}
            <div style={{
              fontSize: '3rem', lineHeight: 0.6, color: C.brand300,
              fontFamily: 'Georgia, serif', marginBottom: '0.25rem',
            }}>
              &ldquo;
            </div>

            <div style={{
              fontSize: 'clamp(1.35rem, 2.2vw, 1.625rem)',
              fontWeight: 700, lineHeight: 1.35,
              color: C.brand900, margin: '0 0 1.75rem',
              letterSpacing: '-0.015em',
            }}>
              Every Jordanian idea deserves a fair shot — not just the well-connected ones.
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.875rem',
              paddingTop: '1.25rem',
              borderTop: `1px solid ${C.n200}`,
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: `linear-gradient(135deg, ${C.brand500}, ${C.brand700})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: '0.9375rem',
                flexShrink: 0,
              }}>M T</div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: C.n900 }}>The Mashroo3i Team</div>
                <div style={{ fontSize: '0.75rem', color: C.n500 }}>Amman, Jordan</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── PROBLEM ─────────────────────────────────────────────────────────────── */
function Problem() {
  const points = [
    { label: 'Fragmented information', desc: 'Market data for Jordan is scattered, outdated, or simply doesn\'t exist in one place.' },
    { label: 'Expensive consultation', desc: 'Professional business planning can cost thousands of dinars — before you\'ve made a single sale.' },
    { label: 'Generic tools', desc: 'Most planning platforms are built for Western markets. They don\'t understand Jordan\'s economy, culture, or consumer behavior.' },
  ]

  return (
    <section style={{ backgroundColor:C.brand50, padding:'6rem 2rem' }}>
      <div style={{ maxWidth:'960px', margin:'0 auto' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(360px, 1fr))', gap:'4rem', alignItems:'center' }}>
          <div>
            <p style={{ fontSize:'0.72rem', fontWeight:700, color:C.brand500, textTransform:'uppercase', letterSpacing:'0.12em', margin:'0 0 1rem' }}>The problem we solve</p>
            <h2 style={{ fontSize:'clamp(1.875rem,3vw,2.5rem)', fontWeight:800, color:C.n900, letterSpacing:'-0.03em', margin:'0 0 1.5rem', lineHeight:1.15 }}>
              Starting a business in Jordan is harder than it should be
            </h2>
            <p style={{ fontSize:'1rem', color:C.n500, lineHeight:1.85, margin:0 }}>
              The ambition is there. The ideas are there. What's missing is the infrastructure to turn them into plans that can actually attract funding, customers, and confidence.
            </p>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            {points.map(p => (
              <div key={p.label} style={{ padding:'1.5rem', borderRadius:'1rem', border:`1px solid ${C.brand200}`, backgroundColor:'rgba(255,255,255,0.8)', backdropFilter:'blur(4px)' }}>
                <p style={{ fontSize:'0.9375rem', fontWeight:700, color:C.n900, margin:'0 0 0.375rem' }}>{p.label}</p>
                <p style={{ fontSize:'0.875rem', color:C.n500, lineHeight:1.65, margin:0 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ position:'relative', marginTop:'4rem', height:'60px' }}>
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'60px', background:`linear-gradient(to bottom right, ${C.brand50} 49%, #fff 50%)` }} />
      </div>
    </section>
  )
}

/* ── HOW IT WORKS ────────────────────────────────────────────────────────── */
const STEPS = [
  {
  
    title: 'Describe your idea',
    desc: "Tell us what you want to build. A restaurant in Amman, a logistics startup, a tech product — anything. No business degree required.",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
  },
  {
    
    title: 'AI analyzes your market',
    desc: 'Our platform cross-references your idea against live Jordanian market data, industry benchmarks, competitor landscape, and risk indicators.',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>,
  },
  {
  
    title: 'Get your full plan',
    desc: 'Receive a complete business plan: SWOT analysis, financial projections, break-even timeline, and an investor-ready PDF — in under 5 minutes.',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  },
]

function HowItWorks() {
  return (
    <section style={{ backgroundColor:'#fff', padding:'6rem 2rem' }}>
      <div style={{ maxWidth:'960px', margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:'4rem' }}>
          <p style={{ fontSize:'0.72rem', fontWeight:700, color:C.brand500, textTransform:'uppercase', letterSpacing:'0.12em', margin:'0 0 0.75rem' }}>How it works</p>
          <h2 style={{ fontSize:'clamp(1.875rem,3vw,2.5rem)', fontWeight:800, color:C.n900, letterSpacing:'-0.03em', margin:0, lineHeight:1.15 }}>
          Turn your idea into a real business plan         
           </h2>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))', gap:'1.5rem' }}>
          {STEPS.map((s, i) => <StepCard key={s.num} {...s} last={i === STEPS.length - 1} />)}
        </div>
      </div>
    </section>
  )
}

function StepCard({ num, title, desc, icon }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={()=>setHov(true)}
      onMouseLeave={()=>setHov(false)}
      style={{
        padding:'2rem 1.875rem', borderRadius:'1.125rem',
        border:`1.5px solid ${hov ? C.brand300 : C.n200}`,
        backgroundColor: hov ? C.brand50 : '#fff',
        boxShadow: hov ? '0 8px 28px rgba(29,158,117,0.12)' : '0 1px 4px rgba(0,0,0,0.05)',
        transform: hov ? 'translateY(-4px)' : 'translateY(0)',
        transition:'all 0.22s ease',
        position:'relative', overflow:'hidden',
      }}
    >
      <span style={{ position:'absolute', top:'1.25rem', right:'1.5rem', fontSize:'3rem', fontWeight:900, color: hov ? C.brand100 : C.n100, lineHeight:1, letterSpacing:'-0.05em', transition:'color 0.22s ease', fontFamily:'monospace' }}>{num}</span>
      <div style={{ width:'48px', height:'48px', borderRadius:'12px', marginBottom:'1.25rem', backgroundColor: hov ? C.brand100 : C.brand50, border:`1px solid ${hov ? C.brand300 : C.brand200}`, display:'flex', alignItems:'center', justifyContent:'center', color:C.brand500, transition:'all 0.22s ease' }}>
        {icon}
      </div>
      <h3 style={{ fontSize:'1.0625rem', fontWeight:700, color:C.n900, margin:'0 0 0.625rem' }}>{title}</h3>
      <p style={{ fontSize:'0.875rem', color:C.n500, lineHeight:1.7, margin:0 }}>{desc}</p>
    </div>
  )
}

/* ── VALUES ──────────────────────────────────────────────────────────────── */
const VALUES = [
  {
    title: 'Local intelligence, not guesswork',
    desc: "Every benchmark, risk score, and market insight we surface is grounded in Jordan's real economy — not generic global data that doesn't apply here.",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
  },
  {
    title: 'Honest over optimistic',
    desc: "We don't tell you what you want to hear. Real risk assessment, real market challenges, real numbers — because sugar-coating leads to failed businesses.",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  },
  {
    title: 'Speed without sacrificing depth',
    desc: 'Five minutes to a complete business plan — without cutting corners. Every output is structured, sourced, and ready to act on.',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>,
  },
  {
    title: 'Accessible to everyone',
    desc: "Professional-grade business analysis shouldn't be a luxury. We built Mashroo3i so any entrepreneur with an idea can access the same tools as the best-funded ones.",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></svg>,
  },
]

function Values() {
  return (
    <section style={{ backgroundColor:C.n100, padding:'6rem 2rem' }}>
      <div style={{ maxWidth:'1000px', margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:'3.5rem' }}>
          <p style={{ fontSize:'0.72rem', fontWeight:700, color:C.brand500, textTransform:'uppercase', letterSpacing:'0.12em', margin:'0 0 0.75rem' }}>Our principles</p>
          <h2 style={{ fontSize:'clamp(1.875rem,3vw,2.5rem)', fontWeight:800, color:C.n900, letterSpacing:'-0.03em', margin:0, lineHeight:1.15 }}>
            What we stand for
          </h2>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:'1.25rem' }}>
          {VALUES.map(v => <ValueCard key={v.title} {...v} />)}
        </div>
      </div>
    </section>
  )
}

function ValueCard({ icon, title, desc }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={()=>setHov(true)}
      onMouseLeave={()=>setHov(false)}
      style={{
        padding:'2rem 1.75rem', borderRadius:'1.125rem',
        border:`1.5px solid ${hov ? C.brand300 : C.n200}`,
        backgroundColor: hov ? '#fff' : 'rgba(255,255,255,0.7)',
        boxShadow: hov ? '0 8px 28px rgba(29,158,117,0.12)' : '0 1px 4px rgba(0,0,0,0.04)',
        transform: hov ? 'translateY(-4px)' : 'translateY(0)',
        transition:'all 0.22s ease',
        backdropFilter:'blur(4px)',
      }}
    >
      <div style={{ width:'44px', height:'44px', borderRadius:'10px', marginBottom:'1.25rem', backgroundColor: hov ? C.brand100 : C.brand50, border:`1px solid ${hov ? C.brand300 : C.brand200}`, display:'flex', alignItems:'center', justifyContent:'center', color:C.brand500, transition:'all 0.22s ease' }}>
        {icon}
      </div>
      <h3 style={{ fontSize:'1.0625rem', fontWeight:700, color:C.n900, margin:'0 0 0.625rem' }}>{title}</h3>
      <p style={{ fontSize:'0.875rem', color:C.n500, lineHeight:1.7, margin:0 }}>{desc}</p>
    </div>
  )
}

/* ── NUMBERS ─────────────────────────────────────────────────────────────── */
const NUMBERS = [
  { value: '< 5 min', label: 'From idea to full business plan' },
  { value: '5+',      label: 'Jordanian industry sectors covered' },
  { value: '100%',    label: 'Jordan-specific market data' },
]

function Numbers() {
  return (
    <section style={{ background:`linear-gradient(135deg, ${C.brand700} 0%, ${C.brand500} 100%)`, padding:'5rem 2rem', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize:'28px 28px', pointerEvents:'none' }} />
      <div style={{ maxWidth:'900px', margin:'0 auto', position:'relative', zIndex:1 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:'2rem' }}>
          {NUMBERS.map(n => (
            <div key={n.label} style={{ textAlign:'center' }}>
              <p style={{ fontSize:'clamp(2rem,4vw,3rem)', fontWeight:900, color:'#fff', margin:'0 0 0.5rem', letterSpacing:'-0.04em', lineHeight:1 }}>{n.value}</p>
              <p style={{ fontSize:'0.875rem', color:'rgba(255,255,255,0.65)', margin:0, lineHeight:1.55 }}>{n.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── CTA ─────────────────────────────────────────────────────────────────── */
function CTA() {
  return (
    <section style={{ backgroundColor:'#fff', padding:'6rem 2rem' }}>
      <div style={{ maxWidth:'1100px', margin:'0 auto' }}>
        <div style={{
          borderRadius:'1.5rem',
          background:`linear-gradient(135deg, ${C.brand700} 0%, ${C.brand500} 100%)`,
          padding:'4.5rem 3rem', textAlign:'center',
          boxShadow:'0 8px 40px rgba(29,158,117,0.25)',
          position:'relative', overflow:'hidden',
        }}>
          <div style={{ position:'absolute', top:'-80px', left:'50%', transform:'translateX(-50%)', width:'500px', height:'300px', borderRadius:'50%', background:'radial-gradient(ellipse, rgba(255,255,255,0.08) 0%, transparent 65%)', pointerEvents:'none' }} />
          <h2 style={{ fontSize:'clamp(1.875rem,3vw,2.75rem)', fontWeight:800, color:'#fff', letterSpacing:'-0.03em', margin:'0 0 1rem', lineHeight:1.15, position:'relative', zIndex:1 }}>
            Start validating your idea today
          </h2>
          <p style={{ fontSize:'1.0625rem', color:'rgba(255,255,255,0.75)', lineHeight:1.75, margin:'0 auto 2.5rem', maxWidth:'400px', position:'relative', zIndex:1 }}>
            Join entrepreneurs across Jordan who are building smarter, faster, and with more confidence.
          </p>
          <div style={{ display:'flex', gap:'0.875rem', justifyContent:'center', flexWrap:'wrap', position:'relative', zIndex:1 }}>
            <Link to="/register"
              style={{ ...btnPrimary, backgroundColor:'#fff', color:C.brand600, boxShadow:'0 4px 16px rgba(0,0,0,0.12)' }}
              onMouseEnter={e=>{ e.currentTarget.style.backgroundColor=C.brand50; e.currentTarget.style.transform='translateY(-2px)' }}
              onMouseLeave={e=>{ e.currentTarget.style.backgroundColor='#fff'; e.currentTarget.style.transform='translateY(0)' }}>
              Get started free
            </Link>
            <Link to="/contact"
              style={{ display:'inline-flex', alignItems:'center', padding:'0.8125rem 1.75rem', borderRadius:'0.625rem', backgroundColor:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.35)', color:'#fff', fontWeight:600, fontSize:'0.9375rem', textDecoration:'none', transition:'all 0.15s ease' }}
              onMouseEnter={e=>e.currentTarget.style.backgroundColor='rgba(255,255,255,0.22)'}
              onMouseLeave={e=>e.currentTarget.style.backgroundColor='rgba(255,255,255,0.15)'}>
              Talk to us
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── PAGE ─────────────────────────────────────────────────────────────────── */
export default function AboutPage() {
  return (
    <div style={{ fontFamily:"'Inter','Segoe UI',system-ui,sans-serif" }}>
      <Navbar />
      <Hero />
      <Problem />
      <HowItWorks />
      <Values />
      <Numbers />
      <CTA />
      <Footer />
    </div>
  )
}