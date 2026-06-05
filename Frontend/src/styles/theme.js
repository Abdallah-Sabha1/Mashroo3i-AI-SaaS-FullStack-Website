/**
 * Mashroo3i Design System — Token Definitions
 * Brand primary: #1D9E75
 * Use these values for Recharts, inline styles, or anywhere Tailwind/CSS vars aren't available.
 * For CSS/HTML usage, prefer the CSS custom properties in GlobalStyles.css (--ds-* prefix).
 */

// ─────────────────────────────────────────────
// COLOR PALETTE
// ─────────────────────────────────────────────

export const colors = {
  /** Brand green — the primary identity color of Mashroo3i */
  brand: {
    50:  '#edfaf5',
    100: '#d2f4e8',
    200: '#a8e9d1',
    300: '#70d8b5',
    400: '#35bf93',
    500: '#1D9E75',  // ← primary brand
    600: '#168564',
    700: '#126d53',
    800: '#105742',
    900: '#0e4736',
    950: '#071f18',
  },

  /** Neutral gray — surfaces, text, borders */
  neutral: {
    0:   '#ffffff',
    50:  '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },

  /** Semantic: success */
  success: {
    light: '#dcfce7',
    base:  '#16a34a',
    dark:  '#14532d',
    text:  '#15803d',
  },

  /** Semantic: warning */
  warning: {
    light: '#fef9c3',
    base:  '#ca8a04',
    dark:  '#713f12',
    text:  '#a16207',
  },

  /** Semantic: danger / error */
  danger: {
    light: '#fee2e2',
    base:  '#dc2626',
    dark:  '#7f1d1d',
    text:  '#b91c1c',
  },

  /** Semantic: info */
  info: {
    light: '#dbeafe',
    base:  '#2563eb',
    dark:  '#1e3a8a',
    text:  '#1d4ed8',
  },
}

// ─────────────────────────────────────────────
// TYPOGRAPHY
// ─────────────────────────────────────────────

export const typography = {
  fontFamily: {
    /** English body — system-preferred geometric sans */
    sans:   "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
    /** Arabic body — Cairo with wide system fallback chain */
    arabic: "'Cairo', 'IBM Plex Sans Arabic', 'Noto Sans Arabic', 'Segoe UI', system-ui, sans-serif",
    /** Monospace — for code blocks, financial figures */
    mono:   "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
  },

  /** Font sizes in rem (base = 16px) */
  fontSize: {
    '2xs': '0.6875rem',  //  11px
    xs:    '0.75rem',    //  12px
    sm:    '0.8125rem',  //  13px
    base:  '0.9375rem',  //  15px — primary reading size
    md:    '1rem',       //  16px
    lg:    '1.125rem',   //  18px
    xl:    '1.25rem',    //  20px
    '2xl': '1.5rem',     //  24px
    '3xl': '1.875rem',   //  30px
    '4xl': '2.25rem',    //  36px
    '5xl': '3rem',       //  48px
  },

  fontWeight: {
    normal:    400,
    medium:    500,
    semibold:  600,
    bold:      700,
    extrabold: 800,
  },

  lineHeight: {
    none:     1,
    tight:    1.25,
    snug:     1.375,
    normal:   1.5,
    relaxed:  1.625,
    loose:    1.8,
    arabic:   1.9,     // wider for Arabic readability
  },

  letterSpacing: {
    tighter: '-0.05em',
    tight:   '-0.025em',
    normal:  '0',
    wide:    '0.025em',
    wider:   '0.05em',
    widest:  '0.1em',
  },
}

// ─────────────────────────────────────────────
// SPACING  (4px base unit)
// ─────────────────────────────────────────────

export const spacing = {
  0:   '0',
  px:  '1px',
  0.5: '0.125rem',   //  2px
  1:   '0.25rem',    //  4px
  1.5: '0.375rem',   //  6px
  2:   '0.5rem',     //  8px
  2.5: '0.625rem',   // 10px
  3:   '0.75rem',    // 12px
  3.5: '0.875rem',   // 14px
  4:   '1rem',       // 16px
  5:   '1.25rem',    // 20px
  6:   '1.5rem',     // 24px
  7:   '1.75rem',    // 28px
  8:   '2rem',       // 32px
  9:   '2.25rem',    // 36px
  10:  '2.5rem',     // 40px
  11:  '2.75rem',    // 44px
  12:  '3rem',       // 48px
  14:  '3.5rem',     // 56px
  16:  '4rem',       // 64px
  20:  '5rem',       // 80px
  24:  '6rem',       // 96px
  28:  '7rem',       // 112px
  32:  '8rem',       // 128px
  40:  '10rem',      // 160px
  48:  '12rem',      // 192px
  64:  '16rem',      // 256px
}

// ─────────────────────────────────────────────
// BORDER RADIUS
// ─────────────────────────────────────────────

export const borderRadius = {
  none:  '0',
  sm:    '0.25rem',   //  4px
  base:  '0.375rem',  //  6px
  md:    '0.5rem',    //  8px
  lg:    '0.75rem',   // 12px
  xl:    '1rem',      // 16px
  '2xl': '1.25rem',   // 20px
  '3xl': '1.5rem',    // 24px
  full:  '9999px',
}

// ─────────────────────────────────────────────
// SHADOWS
// ─────────────────────────────────────────────

export const shadows = {
  none:  'none',
  xs:    '0 1px 2px 0 rgba(0,0,0,0.05)',
  sm:    '0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.06)',
  md:    '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)',
  lg:    '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.05)',
  xl:    '0 20px 25px -5px rgba(0,0,0,0.09), 0 8px 10px -6px rgba(0,0,0,0.05)',
  '2xl': '0 25px 50px -12px rgba(0,0,0,0.18)',
  inner: 'inset 0 2px 4px 0 rgba(0,0,0,0.05)',
  /** Keyboard-focus ring */
  focus: '0 0 0 3px rgba(29,158,117,0.35)',
  /** Brand glow — hover states on primary CTAs */
  glow:  '0 0 0 3px rgba(29,158,117,0.25), 0 4px 16px rgba(29,158,117,0.20)',
  'glow-lg': '0 0 0 4px rgba(29,158,117,0.3), 0 8px 32px rgba(29,158,117,0.25)',
}

// ─────────────────────────────────────────────
// Z-INDEX
// ─────────────────────────────────────────────

export const zIndex = {
  base:     0,
  raised:   1,
  dropdown: 10,
  sticky:   20,
  overlay:  30,
  modal:    40,
  popover:  45,
  toast:    50,
  max:      9999,
}

// ─────────────────────────────────────────────
// BREAKPOINTS
// ─────────────────────────────────────────────

export const breakpoints = {
  sm:  '640px',
  md:  '768px',
  lg:  '1024px',
  xl:  '1280px',
  '2xl': '1536px',
}

// ─────────────────────────────────────────────
// TRANSITIONS
// ─────────────────────────────────────────────

export const transitions = {
  fast:    'all 0.15s ease',
  base:    'all 0.2s ease',
  slow:    'all 0.35s ease',
  spring:  'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  smooth:  'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
}

// ─────────────────────────────────────────────
// CHART COLORS (for Recharts / financial charts)
// ─────────────────────────────────────────────

export const chartColors = {
  primary:   colors.brand[500],
  secondary: colors.brand[300],
  accent:    '#f59e0b',
  neutral:   colors.neutral[400],
  danger:    colors.danger.base,
  success:   colors.success.base,
  // Categorical palette (up to 6 series)
  series: [
    colors.brand[500],
    '#f59e0b',
    '#8b5cf6',
    '#ef4444',
    '#3b82f6',
    '#ec4899',
  ],
}

// ─────────────────────────────────────────────
// DEFAULT EXPORT
// ─────────────────────────────────────────────

const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndex,
  breakpoints,
  transitions,
  chartColors,
}

export default theme
