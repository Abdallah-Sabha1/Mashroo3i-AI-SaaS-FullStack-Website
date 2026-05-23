/**
 * DashFooter.jsx — Minimal footer for all authenticated pages.
 */

const YEAR = new Date().getFullYear()

export default function DashFooter() {
  return (
    <footer style={{
      borderTop: '1px solid #e5e7eb',
      padding: '1rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <span style={{ fontSize: '0.8125rem', color: '#9ca3af' }}>
        © {YEAR} Mashroo3i. All rights reserved.
      </span>
    </footer>
  )
}