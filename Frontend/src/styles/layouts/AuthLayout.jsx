import React from 'react';

/**
 * Mashroo3i AuthLayout
 * ─────────────────────────────────────────────────────────────────────────
 * A split-screen layout designed for high-conversion auth flows.
 * Uses the custom brand palette: #1D9E75 (500)
 */

export const colors = {
  brand: {
    50: '#edfaf5',
    100: '#d2f4e8',
    200: '#a8e9d1',
    300: '#70d8b5',
    400: '#35bf93',
    500: '#1D9E75', // Primary
    600: '#168564',
    700: '#126d53',
    800: '#105742',
    900: '#0e4736',
    950: '#071f18',
  },
  neutral: {
    0: '#ffffff',
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  }
};

// --- Icons ---
const IconWrapper = ({ children }) => (
  <div style={{
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: colors.neutral[0],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
    border: `1px solid ${colors.brand[100]}`,
    flexShrink: 0
  }}>
    {children}
  </div>
);

export const BoltIcon   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.brand[500]} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
export const ChartIcon  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.brand[500]} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
export const ShieldIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.brand[500]} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>

const DEFAULT_FEATURES = [
  { Icon: BoltIcon,   label: 'Instant AI evaluation in seconds' },
  { Icon: ChartIcon,  label: 'Detailed financial projections' },
  { Icon: ShieldIcon, label: 'SWOT analysis & risk assessment' },
];

const AuthLayout = ({ children, title, subtitle, brandHeading, brandSubtitle, features }) => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      backgroundColor: colors.neutral[50],
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
    }}>
      
      {/* ── LEFT: BRAND PANEL (Hidden on Mobile) ── */}
      <aside className="auth-brand-panel" style={{
        display: 'none',
        flex: '0 0 45%',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '4rem 5rem',
        backgroundColor: colors.brand[50],
        borderRight: `1px solid ${colors.brand[100]}`,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative Gradients */}
        <div style={{ 
          position: 'absolute', top: '-10%', right: '-10%', 
          width: '500px', height: '500px', borderRadius: '50%', 
          background: `radial-gradient(circle, ${colors.brand[200]}44 0%, transparent 70%)`,
          pointerEvents: 'none'
        }} />

        {/* Content Top */}
        <div style={{ position: 'relative', zIndex: 10 }}>
          <img 
              src="/public/logo1 green & black.svg"
              alt="Mashroo3i Logo"
              style={{
                width: '100%',
                maxWidth: '420px',
                height: 'auto',
                marginBottom: '3rem',
                display: 'block',
                objectFit: 'contain',
                filter: 'drop-shadow(0px 10px 20px rgba(0,0,0,0.08))'
              }}
            />
          
          <h2 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 800,  
            color: colors.brand[900], 
            lineHeight: 1.1, 
            marginBottom: '1.5rem', 
            letterSpacing: '-0.03em' 
          }}>
            {brandHeading ?? 'Turn your idea into a business plan'}
          </h2>
          
          <p style={{ 
            fontSize: '1.125rem', 
            color: colors.brand[700], 
            lineHeight: 1.6, 
            marginBottom: '3rem', 
            maxWidth: '420px' 
          }}>
            {brandSubtitle ?? 'AI-powered evaluation, financial projections, and strategic insights—all in one place.'}
          </p>

          {/* Feature List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {(features ?? DEFAULT_FEATURES).map(({ Icon, label }, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <IconWrapper><Icon /></IconWrapper>
                <span style={{ fontSize: '1rem', color: colors.brand[800], fontWeight: 600 }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p style={{ position: 'relative', zIndex: 10, fontSize: '0.875rem', color: colors.brand[400], fontWeight: 500 }}>
          &copy; {new Date().getFullYear()} Mashroo3i. All rights reserved.
        </p>
      </aside>

      {/* ── RIGHT: FORM PANEL ── */}
      <main style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '2rem' 
      }}>
        <div style={{ 
          width: '100%', 
          maxWidth: '440px', 
          padding: '3rem', 
          backgroundColor: colors.neutral[0], 
          borderRadius: '28px', 
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
          border: `1px solid ${colors.neutral[100]}`
        }}>
          
          {/* Mobile-only Logo */}
          <div className="auth-mobile-logo" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
             <img 
              src="/public/logo1 green & black.svg"
              alt="Mashroo3i"
              style={{
                width: '100%',
                maxWidth: '240px',
                height: 'auto',
                objectFit: 'contain',
                filter: 'drop-shadow(0px 8px 16px rgba(0,0,0,0.08))'
              }}
            />
          </div>

          {/* Header */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h1 style={{ 
              fontSize: '1.875rem', 
              fontWeight: 800, 
              color: colors.neutral[900], 
              marginBottom: '0.5rem',
              letterSpacing: '-0.02em'
            }}>
              {title}
            </h1>
            <p style={{ color: colors.neutral[500], fontSize: '1rem', lineHeight: 1.5 }}>
              {subtitle}
            </p>
          </div>

          {/* Content Slot */}
          {children}
        </div>
      </main>

      <style>{`
        @media (min-width: 768px) {
          .auth-brand-panel { display: flex !important; }
          .auth-mobile-logo { display: none !important; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        main > div {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AuthLayout;