/**
 * ContactPage.jsx — Contact Us page
 * Clean, professional contact form + info channels.
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar, { C } from '../styles/components/Navbar'
import Footer from '../styles/components/Footer'

/* ── HERO ────────────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section style={{
      background:`linear-gradient(150deg, ${C.brand700} 0%, ${C.brand500} 55%, ${C.brand400} 100%)`,
      padding:'clamp(4rem,8vw,7rem) 2rem',
      textAlign:'center', position:'relative', overflow:'hidden',
    }}>
      <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize:'32px 32px', pointerEvents:'none' }} />
      <div style={{ maxWidth:'620px', margin:'0 auto', position:'relative', zIndex:1 }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', padding:'0.375rem 1rem', borderRadius:'9999px', border:'1px solid rgba(255,255,255,0.3)', backgroundColor:'rgba(255,255,255,0.12)', marginBottom:'2rem' }}>
          <span style={{ width:'7px', height:'7px', borderRadius:'50%', backgroundColor:'#fff', display:'inline-block', opacity:0.9 }} />
          <span style={{ fontSize:'0.75rem', fontWeight:600, color:'rgba(255,255,255,0.9)', letterSpacing:'0.06em', textTransform:'uppercase' }}>We're here to help</span>
        </div>
        <h1 style={{ fontSize:'clamp(2.25rem,5vw,3.75rem)', fontWeight:800, lineHeight:1.1, letterSpacing:'-0.035em', margin:'0 0 1.25rem', color:'#fff' }}>
          Get in touch
        </h1>
        <p style={{ fontSize:'clamp(1rem,1.8vw,1.125rem)', color:'rgba(255,255,255,0.75)', lineHeight:1.8, margin:0 }}>
          Have a question, a partnership idea, or just want to say hello? We read every message and respond within one business day.
        </p>
      </div>
      <div style={{ position:'absolute', bottom:-1, left:0, right:0, lineHeight:0 }}>
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ width:'100%', height:'60px', display:'block' }}>
          <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill='#fff' />
        </svg>
      </div>
    </section>
  )
}

/* ── CONTACT BODY ─────────────────────────────────────────────────────────── */
const CHANNELS = [
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    label: 'Email us',
    value: 'hello@mashroo3i.jo',
    href: 'mailto:hello@mashroo3i.jo',
    note: 'We reply within 24 hours',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
    label: 'Based in',
    value: 'Amman, Jordan',
    href: null,
    note: 'Serving entrepreneurs across Jordan',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>,
    label: 'LinkedIn',
    value: 'Mashroo3i',
    href: 'https://linkedin.com',
    note: 'Follow us for updates',
  },
]

const SUBJECTS = [
  'General inquiry',
  'Product feedback',
  'Partnership opportunity',
  'Press & media',
  'Report a bug',
  'Other',
]

function ContactBody() {
  const [form, setForm] = useState({ name:'', email:'', subject:'General inquiry', message:'' })
  const [sent, setSent] = useState(false)
  const [focused, setFocused] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
  }

  const inputStyle = (field) => ({
    width:'100%', boxSizing:'border-box',
    padding:'0.75rem 1rem',
    borderRadius:'0.625rem',
    border:`1.5px solid ${focused === field ? C.brand400 : C.n200}`,
    backgroundColor:'#fff',
    fontSize:'0.9375rem',
    color:C.n900,
    outline:'none',
    transition:'border-color 0.15s ease',
    fontFamily:"'Inter','Segoe UI',system-ui,sans-serif",
  })

  const labelStyle = {
    fontSize:'0.875rem', fontWeight:600, color:C.n700,
    display:'block', marginBottom:'0.5rem',
  }

  return (
    <section style={{ backgroundColor:'#fff', padding:'5rem 2rem 6rem' }}>
      <div style={{ maxWidth:'1040px', margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))', gap:'4rem', alignItems:'start' }}>

        {/* Left — channels */}
        <div>
          <h2 style={{ fontSize:'1.75rem', fontWeight:800, color:C.n900, letterSpacing:'-0.03em', margin:'0 0 0.75rem' }}>Let's talk</h2>
          <p style={{ fontSize:'1rem', color:C.n500, lineHeight:1.75, margin:'0 0 2.5rem' }}>
            Whether you have a question about our features, need help with your business plan, or want to explore a partnership — our team is happy to help.
          </p>

          <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
            {CHANNELS.map(ch => (
              <div key={ch.label} style={{ display:'flex', alignItems:'flex-start', gap:'1rem', padding:'1.25rem 1.5rem', borderRadius:'1rem', border:`1px solid ${C.n200}`, backgroundColor:C.n50 }}>
                <div style={{ width:'40px', height:'40px', borderRadius:'10px', backgroundColor:C.brand50, border:`1px solid ${C.brand200}`, display:'flex', alignItems:'center', justifyContent:'center', color:C.brand500, flexShrink:0 }}>
                  {ch.icon}
                </div>
                <div>
                  <p style={{ fontSize:'0.75rem', fontWeight:600, color:C.n400, textTransform:'uppercase', letterSpacing:'0.08em', margin:'0 0 0.25rem' }}>{ch.label}</p>
                  {ch.href
                    ? <a href={ch.href} style={{ fontSize:'0.9375rem', fontWeight:700, color:C.brand600, textDecoration:'none', display:'block', marginBottom:'0.25rem' }}>{ch.value}</a>
                    : <p style={{ fontSize:'0.9375rem', fontWeight:700, color:C.n900, margin:'0 0 0.25rem' }}>{ch.value}</p>
                  }
                  <p style={{ fontSize:'0.8125rem', color:C.n400, margin:0 }}>{ch.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — form */}
        <div style={{ backgroundColor:C.n50, borderRadius:'1.5rem', border:`1px solid ${C.n200}`, padding:'2.5rem' }}>
          {sent ? (
            <div style={{ textAlign:'center', padding:'2rem 0' }}>
              <div style={{ width:'64px', height:'64px', borderRadius:'50%', backgroundColor:C.brand100, border:`2px solid ${C.brand300}`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.5rem', color:C.brand600 }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h3 style={{ fontSize:'1.375rem', fontWeight:800, color:C.n900, margin:'0 0 0.75rem' }}>Message received!</h3>
              <p style={{ fontSize:'1rem', color:C.n500, lineHeight:1.7, margin:'0 0 2rem' }}>
                Thanks for reaching out. We'll get back to you within one business day.
              </p>
              <button onClick={()=>setSent(false)} style={{ padding:'0.625rem 1.5rem', borderRadius:'0.625rem', border:`1.5px solid ${C.brand300}`, backgroundColor:'transparent', color:C.brand600, fontWeight:600, fontSize:'0.9375rem', cursor:'pointer' }}>
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
              <h3 style={{ fontSize:'1.25rem', fontWeight:800, color:C.n900, margin:'0 0 0.25rem', letterSpacing:'-0.02em' }}>Send us a message</h3>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                <div>
                  <label style={labelStyle}>Name</label>
                  <input type="text" required placeholder="Your name" value={form.name} onChange={e=>set('name', e.target.value)}
                    style={inputStyle('name')} onFocus={()=>setFocused('name')} onBlur={()=>setFocused(null)} />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input type="email" required placeholder="your@email.com" value={form.email} onChange={e=>set('email', e.target.value)}
                    style={inputStyle('email')} onFocus={()=>setFocused('email')} onBlur={()=>setFocused(null)} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Subject</label>
                <select value={form.subject} onChange={e=>set('subject', e.target.value)}
                  style={{ ...inputStyle('subject'), cursor:'pointer' }}
                  onFocus={()=>setFocused('subject')} onBlur={()=>setFocused(null)}>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Message</label>
                <textarea required rows={5} placeholder="Tell us how we can help..." value={form.message} onChange={e=>set('message', e.target.value)}
                  style={{ ...inputStyle('message'), resize:'vertical', minHeight:'130px' }}
                  onFocus={()=>setFocused('message')} onBlur={()=>setFocused(null)} />
              </div>

              <button type="submit" style={{
                padding:'0.875rem', borderRadius:'0.625rem',
                backgroundColor:C.brand500, color:'#fff',
                fontWeight:700, fontSize:'0.9375rem',
                border:'none', cursor:'pointer',
                transition:'all 0.15s ease',
                boxShadow:'0 4px 14px rgba(29,158,117,0.3)',
              }}
                onMouseEnter={e=>{ e.currentTarget.style.backgroundColor=C.brand600; e.currentTarget.style.transform='translateY(-1px)' }}
                onMouseLeave={e=>{ e.currentTarget.style.backgroundColor=C.brand500; e.currentTarget.style.transform='translateY(0)' }}>
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

/* ── PAGE ─────────────────────────────────────────────────────────────────── */
export default function ContactPage() {
  return (
    <div style={{ fontFamily:"'Inter','Segoe UI',system-ui,sans-serif" }}>
      <Navbar />
      <Hero />
      <ContactBody />
      <Footer />
    </div>
  )
}