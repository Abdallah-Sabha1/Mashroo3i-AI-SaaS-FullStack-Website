import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ProgressSteps from './ProgressSteps'

/**
 * Design System Sidebar
 *
 * Fixed left navigation sidebar with:
 * - Logo area
 * - Primary nav links (with active state)
 * - Optional progress steps section (LivePlan-style journey tracker)
 * - Bottom utility links (settings, help)
 * - Full RTL support
 *
 * Usage:
 *   import { Sidebar } from '../design-system'
 *
 *   // Simple nav
 *   <Sidebar navItems={[
 *     { to: '/dashboard', labelKey: 'nav.dashboard', icon: <DashIcon /> },
 *     { to: '/submit-idea', labelKey: 'nav.newIdea', icon: <PlusIcon /> },
 *   ]} />
 *
 *   // With journey progress
 *   <Sidebar
 *     navItems={items}
 *     journeySteps={steps}
 *     currentJourneyStep="financials"
 *     onJourneyStepClick={(id) => navigate(`/${id}`)}
 *   />
 */

// ── Default SVG icons ─────────────────────────────────────────────────────

const icons = {
  dashboard: (
    <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: '1.1rem', height: '1.1rem' }}>
      <path d="M2 4a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2H4a2 2 0 01-2-2V4zm0 9a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2H4a2 2 0 01-2-2v-3zm9-9a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2h-3a2 2 0 01-2-2V4zm0 9a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2h-3a2 2 0 01-2-2v-3z" />
    </svg>
  ),
  newIdea: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} style={{ width: '1.1rem', height: '1.1rem' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 3v14M3 10h14" />
    </svg>
  ),
  profile: (
    <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: '1.1rem', height: '1.1rem' }}>
      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
  ),
  evaluation: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} style={{ width: '1.1rem', height: '1.1rem' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  financials: (
    <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: '1.1rem', height: '1.1rem' }}>
      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
    </svg>
  ),
}

// ── Default nav items (can be overridden via props) ────────────────────────

const DEFAULT_NAV = [
  { to: '/dashboard',   labelKey: 'nav.dashboard', icon: icons.dashboard },
  { to: '/submit-idea', labelKey: 'nav.newIdea',   icon: icons.newIdea   },
  { to: '/profile',     labelKey: 'nav.profile',   icon: icons.profile   },
]

// ── Component ─────────────────────────────────────────────────────────────

const Sidebar = ({
  navItems = DEFAULT_NAV,
  journeySteps,          // if provided, renders a progress section
  currentJourneyStep,
  onJourneyStepClick,
  logo,
  bottomItems = [],
  collapsed = false,
  className = '',
}) => {
  const location = useLocation()
  const { t } = useTranslation()

  return (
    <aside
      className={className}
      style={{
        width: collapsed ? '3.5rem' : 'var(--ds-sidebar-width)',
        minHeight: 'calc(100vh - 4rem)',
        background: 'var(--ds-sidebar-bg)',
        borderInlineEnd: '1px solid var(--ds-sidebar-border)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
      }}
      aria-label="Main navigation"
    >
      {/* Logo / branding */}
      {logo && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--ds-sidebar-border)',
          }}
        >
          {logo}
        </div>
      )}

      {/* Primary nav */}
      <nav
        style={{ flex: 1, padding: '0.75rem', overflowY: 'auto' }}
        aria-label="Primary"
      >
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
          {navItems.map(item => {
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to)

            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={`ds-nav-item${isActive ? ' active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                  title={collapsed ? (item.label ?? t(item.labelKey, item.to)) : undefined}
                >
                  {item.icon && (
                    <span aria-hidden="true" style={{ flexShrink: 0 }}>{item.icon}</span>
                  )}
                  {!collapsed && (
                    <span>{item.label ?? t(item.labelKey, item.to)}</span>
                  )}
                  {!collapsed && item.badge && (
                    <span
                      style={{
                        marginInlineStart: 'auto',
                        background: 'var(--ds-brand-500)',
                        color: '#fff',
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        padding: '0.1rem 0.45rem',
                        borderRadius: '9999px',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Journey progress steps */}
        {!collapsed && journeySteps?.length > 0 && (
          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--ds-sidebar-border)',
            }}
          >
            <p
              style={{
                fontSize: 'var(--ds-text-2xs)',
                fontWeight: 600,
                color: 'var(--ds-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '0.875rem',
                paddingInlineStart: '0.875rem',
              }}
            >
              {t('nav.yourJourney', 'Your Journey')}
            </p>
            <ProgressSteps
              steps={journeySteps}
              currentStep={currentJourneyStep ?? 0}
              orientation="vertical"
              onStepClick={onJourneyStepClick}
            />
          </div>
        )}
      </nav>

      {/* Bottom utility links */}
      {bottomItems.length > 0 && (
        <div
          style={{
            padding: '0.75rem',
            borderTop: '1px solid var(--ds-sidebar-border)',
          }}
        >
          {bottomItems.map((item, i) => (
            <Link
              key={i}
              to={item.to}
              className="ds-nav-item"
              title={collapsed ? item.label : undefined}
            >
              {item.icon && <span aria-hidden="true" style={{ flexShrink: 0 }}>{item.icon}</span>}
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </div>
      )}
    </aside>
  )
}

export default Sidebar
