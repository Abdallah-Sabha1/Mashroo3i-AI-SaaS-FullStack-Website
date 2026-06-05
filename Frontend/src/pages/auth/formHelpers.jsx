/**
 * formHelpers.jsx
 * ─────────────────────────────────────────────────────────────────────────
 * Shared primitives for LoginPage and RegisterPage. Light mode only.
 *
 * Exports:
 *   inputStyle    → style object for <input>
 *   selectStyle   → style object for <select>
 *   focusHandlers → { onFocus, onBlur } — green border on focus
 *   FieldWrapper  → label + field container
 *   ErrorBanner   → red alert bar with warning icon
 *   FormCard      → white card wrapping the form
 *
 * Password rules live entirely in the backend (RegisterDto.cs).
 * Frontend only checks fields are non-empty before submitting.
 */

/* ── Style objects ────────────────────────────────────────────────────────
   Plain objects (not functions) — dark mode removed.
───────────────────────────────────────────────────────────────────────── */

export const inputStyle = {
  width: '100%',
  padding: '0.65rem 0.875rem',
  border: '1.5px solid #e5e7eb',
  borderRadius: '0.5rem',
  fontSize: '0.9375rem',
  color: '#111827',
  backgroundColor: '#ffffff',
  outline: 'none',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  boxSizing: 'border-box',
}

export const selectStyle = {
  ...inputStyle,
  // Brand green left accent — visually connects selects to the inputs
  borderLeft: '3px solid #1D9E75',
  // Barely-tinted background so selects feel distinct from plain text inputs
  backgroundColor: '#f5fdf9',
  appearance: 'none',
  WebkitAppearance: 'none',
  // Chevron in brand green (%231D9E75 is #1D9E75 URL-encoded)
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%231D9E75' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 0.875rem center',
  paddingRight: '2.25rem',
  cursor: 'pointer',
}

// Spread onto any input/select to get a green focus ring
export const focusHandlers = {
  onFocus: (e) => { e.target.style.borderColor = '#1D9E75'; e.target.style.boxShadow = '0 0 0 3px rgba(29,158,117,0.15)' },
  onBlur:  (e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' },
}

/* ── FieldWrapper ─────────────────────────────────────────────────────────
   Renders a label row above the field (input or select).
   Props:
     label      → label text
     id         → links <label> to the field via htmlFor
     required   → shows a green * after the label
     rightLabel → optional node on the right (e.g. "Forgot password?" link)
     style      → merged into the outer div
───────────────────────────────────────────────────────────────────────── */
export const FieldWrapper = ({ label, id, required, rightLabel, children, style = {} }) => (
  <div style={{ marginBottom: '1.125rem', ...style }}>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.4rem' }}>
      <label htmlFor={id} style={{ fontSize:'0.75rem', fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', color:'#374151' }}>
        {label}
        {required && <span style={{ color:'#1D9E75', marginLeft:'0.2rem' }}>*</span>}
      </label>
      {rightLabel}
    </div>
    {children}
  </div>
)

/* ── ErrorBanner ──────────────────────────────────────────────────────────
   Red alert bar shown when a form submit fails.
───────────────────────────────────────────────────────────────────────── */
const WarnIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8"  x2="12"    y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)

export const ErrorBanner = ({ message }) => (
  <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.75rem 1rem', marginBottom:'1.25rem', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'0.5rem', color:'#b91c1c', fontSize:'0.875rem' }}>
    <WarnIcon />
    {message}
  </div>
)

/* ── FormCard ─────────────────────────────────────────────────────────────
   White card that wraps the form content.
───────────────────────────────────────────────────────────────────────── */
export const FormCard = ({ children }) => (
  <div style={{ background:'#ffffff', border:'1px solid #e5e7eb', borderRadius:'1rem', padding:'2rem', boxShadow:'0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)' }}>
    {children}
  </div>
)