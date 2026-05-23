/**
 * RegisterPage.jsx
 * ─────────────────────────────────────────────────────────────────────────
 * 2-step registration form.
 *   Step 1 → Name, Email, Password, Confirm Password
 *   Step 2 → Education, Experience, Business Interest (dropdowns)
 *
 * Password rules enforced entirely by the backend (RegisterDto.cs).
 * Frontend only checks that fields are non-empty before submitting.
 * On success → auto-logs in and goes to /dashboard.
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../../styles'
import { useAuth } from '../../context/AuthContext'
import * as authService from '../../services/authService'
import { inputStyle, selectStyle, focusHandlers, FieldWrapper, ErrorBanner, FormCard } from './formHelpers'
import { BoltIcon, ChartIcon, ShieldIcon } from '../../styles/layouts/AuthLayout'

/* ── Dropdown options ─────────────────────────────────────────────────────
   Business interest values match backend /Data/sectors/ filenames exactly.
───────────────────────────────────────────────────────────────────────── */
const EDUCATION_OPTIONS = [
  { value: '',                         label: 'Select your education level' },
  { value: 'High School',              label: 'High School / Tawjihi' },
  { value: 'Diploma',                  label: 'Diploma (2-year)' },
  { value: "Bachelor's Degree",        label: "Bachelor's Degree" },
  { value: "Master's Degree",          label: "Master's Degree" },
  { value: 'PhD',                      label: 'PhD / Doctorate' },
  { value: 'Professional Certificate', label: 'Professional Certificate' },
  { value: 'Self-taught',              label: 'Self-taught / Informal' },
]
const EXPERIENCE_OPTIONS = [
  { value: '',                   label: 'Select your experience level' },
  { value: 'No experience',      label: 'No professional experience' },
  { value: 'Less than 1 year',   label: 'Less than 1 year' },
  { value: '1-3 years',          label: '1 - 3 years' },
  { value: '3-5 years',          label: '3 - 5 years' },
  { value: '5-10 years',         label: '5 - 10 years' },
  { value: 'More than 10 years', label: 'More than 10 years' },
]
const BUSINESS_INTEREST_OPTIONS = [
  { value: '',                      label: 'Select your field of interest' },
  { value: 'tech_software',         label: 'Tech & Software' },
  { value: 'food_and_beverage',     label: 'Food & Beverage' },
  { value: 'retail_ecommerce',      label: 'Retail & E-commerce' },
  { value: 'health_wellness',       label: 'Health & Wellness' },
  { value: 'education_training',    label: 'Education & Training' },
  { value: 'professional_services', label: 'Professional Services' },
  { value: 'other',                 label: 'Other' },
]

const REGISTER_FEATURES = [
  { Icon: BoltIcon,   label: 'Objective, transparent evaluation' },
  { Icon: ChartIcon,  label: 'Realistic financial projections' },
  { Icon: ShieldIcon, label: 'Trusted, verified local sources' },
]

/* ── Icons ────────────────────────────────────────────────────────────────*/
const UserIcon      = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const MailIcon      = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>
const LockIcon      = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
const GradCapIcon   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
const BriefcaseIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
const TrendIcon     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>

/* ── IconInput / IconSelect ───────────────────────────────────────────────
   Place an SVG icon inside the field on the left side.
───────────────────────────────────────────────────────────────────────── */
const IconInput = ({ id, type='text', placeholder, value, onChange, disabled, icon: Icon, autoComplete }) => (
  <div style={{ position:'relative' }}>
    <span style={{ position:'absolute', left:'0.75rem', top:'50%', transform:'translateY(-50%)', color:'#1D9E75', display:'flex', pointerEvents:'none' }}>
      <Icon />
    </span>
    <input id={id} type={type} placeholder={placeholder} value={value} onChange={onChange}
      disabled={disabled} autoComplete={autoComplete}
      style={{ ...inputStyle, paddingLeft:'2.5rem' }} {...focusHandlers} />
  </div>
)

const IconSelect = ({ id, icon: Icon, options, value, onChange, disabled }) => (
  <div style={{ position:'relative' }}>
    <span style={{ position:'absolute', left:'0.75rem', top:'50%', transform:'translateY(-50%)', color:'#1D9E75', display:'flex', pointerEvents:'none', zIndex:1 }}>
      <Icon />
    </span>
    <select id={id} value={value} onChange={onChange} disabled={disabled}
      style={{ ...selectStyle, paddingLeft:'2.5rem', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }} {...focusHandlers}>
      {options.map(o => (
        <option key={o.value} value={o.value} disabled={o.value === ''}>{o.label}</option>
      ))}
    </select>
  </div>
)

// Step progress bar — two segments, active step is wider and brand green
const StepBar = ({ step }) => (
  <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'1.25rem' }}>
    {[1,2].map(i => (
      <div key={i} style={{
        height:'4px', flex: i === step ? 2 : 1, borderRadius:'2px',
        backgroundColor: i === step ? '#1D9E75' : i < step ? 'rgba(29,158,117,0.4)' : '#e5e7eb',
        transition:'all 0.3s ease',
      }} />
    ))}
    <span style={{ fontSize:'0.75rem', color:'#9ca3af', whiteSpace:'nowrap' }}>Step {step} of 2</span>
  </div>
)

/* ── Main component ───────────────────────────────────────────────────────*/
export default function RegisterPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()

  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    fullName:'', email:'', password:'', confirmPassword:'',
    education:'', experience:'', businessInterest:'',
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  // Generic field updater — works for any field name
  const set = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    setError('')
  }

  // Step 1: empty-field checks + email format + password strength + match
  // The regex mirrors RegisterDto.cs exactly so the user can't reach step 2
  // with a password the backend will reject anyway.
  const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d\s]).{8,}$/

  const validateStep1 = () => {
    if (!form.fullName.trim())      return 'Full name is required.'
    if (form.fullName.length > 100) return 'Full name must be under 100 characters.'
    if (!form.email.trim())         return 'Email address is required.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Enter a valid email address.'
    if (!form.password)             return 'Password is required.'
    if (!PASSWORD_REGEX.test(form.password))
      return 'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character.'
    if (!form.confirmPassword)      return 'Please confirm your password.'
    if (form.password !== form.confirmPassword) return 'Passwords do not match.'
    return null
  }

  // Step 2: all three dropdowns must have a selection
  const validateStep2 = () => {
    if (!form.education)        return 'Please select your education level.'
    if (!form.experience)       return 'Please select your experience level.'
    if (!form.businessInterest) return 'Please select your field of interest.'
    return null
  }

  const handleNext = () => {
    const err = validateStep1()
    if (err) { setError(err); return }
    setError(''); setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validateStep2()
    if (err) { setError(err); return }
    setLoading(true); setError('')
    try {
      await authService.register(form)
      // Auto-login right after register — no "go sign in" friction
      await login(form.email, form.password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      // Backend password rule rejections surface here via err.message
      setError(err.message ?? 'Registration failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle={step === 1 ? 'Account details' : 'Complete your profile'}
      brandHeading="Start your entrepreneurial journey"
      brandSubtitle="The smartest way to validate and plan your business idea."
      features={REGISTER_FEATURES}
    >
      <StepBar step={step} />
      <FormCard>

        {step === 1 ? (
          /* ── STEP 1 ─────────────────────────────────────────────────── */
          <div>
            {error && <ErrorBanner message={error} />}

            <FieldWrapper label="Full name" id="fullName" required>
              <IconInput id="fullName" icon={UserIcon} placeholder="Enter your full name" value={form.fullName} onChange={set('fullName')} autoComplete="name" />
            </FieldWrapper>

            <FieldWrapper label="Email address" id="email" required>
              <IconInput id="email" type="email" icon={MailIcon} placeholder="you@example.com" value={form.email} onChange={set('email')} autoComplete="email" />
            </FieldWrapper>

            <FieldWrapper label="Password" id="password" required>
              <IconInput id="password" type="password" icon={LockIcon} placeholder="Min 8 characters" value={form.password} onChange={set('password')} autoComplete="new-password" />
            </FieldWrapper>

            <FieldWrapper label="Confirm password" id="confirmPassword" required style={{ marginBottom:'1.75rem' }}>
              <IconInput id="confirmPassword" type="password" icon={LockIcon} placeholder="Re-enter password" value={form.confirmPassword} onChange={set('confirmPassword')} autoComplete="new-password" />
              {/* Inline mismatch hint — only shown when both fields have content */}
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p style={{ fontSize:'0.75rem', color:'#b91c1c', margin:'0.3rem 0 0 0' }}>Passwords do not match</p>
              )}
            </FieldWrapper>

            <button type="button" onClick={handleNext}
              style={{ width:'100%', padding:'0.75rem', background:'#1D9E75', color:'#fff', border:'none', borderRadius:'0.5rem', fontSize:'0.9375rem', fontWeight:600, cursor:'pointer', transition:'background 0.15s ease' }}
              onMouseEnter={e => { e.target.style.background = '#168564' }}
              onMouseLeave={e => { e.target.style.background = '#1D9E75' }}
            >
              Continue to profile
            </button>
          </div>

        ) : (
          /* ── STEP 2 ─────────────────────────────────────────────────── */
          <form onSubmit={handleSubmit} noValidate>
            {error && <ErrorBanner message={error} />}

            <FieldWrapper label="Education" id="education" required>
              <IconSelect id="education" icon={GradCapIcon} options={EDUCATION_OPTIONS} value={form.education} onChange={set('education')} />
            </FieldWrapper>

            <FieldWrapper label="Experience" id="experience" required>
              <IconSelect id="experience" icon={BriefcaseIcon} options={EXPERIENCE_OPTIONS} value={form.experience} onChange={set('experience')} />
            </FieldWrapper>

            <FieldWrapper label="Business interest" id="businessInterest" required style={{ marginBottom:'1.75rem' }}>
              <IconSelect id="businessInterest" icon={TrendIcon} options={BUSINESS_INTEREST_OPTIONS} value={form.businessInterest} onChange={set('businessInterest')} />
            </FieldWrapper>

            <div style={{ display:'flex', gap:'0.75rem' }}>
              <button type="button" onClick={() => { setStep(1); setError('') }}
                style={{ flex:'0 0 auto', padding:'0.75rem 1.25rem', background:'transparent', border:'1px solid #e5e7eb', borderRadius:'0.5rem', color:'#6b7280', fontSize:'0.9375rem', fontWeight:500, cursor:'pointer', transition:'all 0.15s ease' }}>
                Back
              </button>
              <button type="submit" disabled={loading}
                style={{ flex:1, padding:'0.75rem', background: loading ? '#168564' : '#1D9E75', color:'#fff', border:'none', borderRadius:'0.5rem', fontSize:'0.9375rem', fontWeight:600, cursor: loading ? 'not-allowed' : 'pointer', transition:'background 0.15s ease' }}
                onMouseEnter={e => { if (!loading) e.target.style.background = '#168564' }}
                onMouseLeave={e => { if (!loading) e.target.style.background = '#1D9E75' }}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </div>
          </form>
        )}

        <p style={{ textAlign:'center', fontSize:'0.875rem', color:'#9ca3af', marginTop:'1.5rem', marginBottom:0 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color:'#1D9E75', fontWeight:600, textDecoration:'none' }}>Sign in</Link>
        </p>
      </FormCard>
    </AuthLayout>
  )
}