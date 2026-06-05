/**
 * AppLayout — Shell for all authenticated pages.
 *
 * Replaces the old TopBar + Sidebar combo with DashNavbar, giving a clean
 * full-width layout that's consistent with the landing page's nav style.
 *
 *   ┌──────────────────────────────────────────────────────────┐
 *   │ DashNavbar: logo · Dashboard · New Idea ·  · avatar ▾  │  ← 68px sticky
 *   ├──────────────────────────────────────────────────────────┤
 *   │                                                          │
 *   │             <main>{children}</main>                      │
 *   │           (max-width 880px, centered)                    │
 *   │                                                          │
 *   └──────────────────────────────────────────────────────────┘
 */

import DashNavbar from '../components/DashNavbar'
import DashFooter from '../components/DashFooter'

const AppLayout = ({ children }) => {
  return (
    <div className="ds-root" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f9fafb' }}>
      <DashNavbar />

      <main style={{
        flex: 1,
        padding: '2rem 1.5rem',
        minWidth: 0,
      }}>
        <div style={{ maxWidth: '880px', margin: '0 auto' }}>
          {children}
        </div>
      </main>

      <DashFooter />
    </div>
  )
}

export default AppLayout