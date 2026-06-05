/**
 * Design System SectionHeader
 *
 * Page and section titles with optional subtitle, breadcrumb, and actions slot.
 * Supports RTL automatically via CSS logical properties.
 *
 * Usage:
 *   import { SectionHeader } from '../design-system'
 *
 *   // Page header
 *   <SectionHeader
 *     title="Financial Projections"
 *     subtitle="3-year revenue and cost forecast based on your inputs"
 *     breadcrumbs={[
 *       { label: 'Dashboard', href: '/dashboard' },
 *       { label: 'Coffee Lab', href: '/evaluation/123' },
 *       { label: 'Financials' },
 *     ]}
 *     actions={<Button size="sm">Export PDF</Button>}
 *   />
 *
 *   // Section header (inside a page)
 *   <SectionHeader level={2} title="Revenue Breakdown" divider />
 *
 *   // With badge
 *   <SectionHeader title="Market Analysis" badge={<Badge color="brand">AI-Generated</Badge>} />
 */

import { Link } from 'react-router-dom'

const ChevronIcon = () => (
  <svg
    style={{ width: '0.75rem', height: '0.75rem', flexShrink: 0 }}
    viewBox="0 0 16 16"
    fill="currentColor"
    aria-hidden="true"
    className="ds-icon-chevron-right"
  >
    <path
      fillRule="evenodd"
      d="M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 010-1.06z"
    />
  </svg>
)

const Breadcrumbs = ({ items }) => {
  if (!items?.length) return null
  return (
    <nav aria-label="Breadcrumb" className="ds-breadcrumb">
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
            {i > 0 && <ChevronIcon />}
            {item.href && !isLast ? (
              <Link to={item.href}>{item.label}</Link>
            ) : (
              <span
                style={{
                  color: isLast ? 'var(--ds-text-secondary)' : undefined,
                  fontWeight: isLast ? 500 : undefined,
                }}
              >
                {item.label}
              </span>
            )}
          </span>
        )
      })}
    </nav>
  )
}

const LEVEL_STYLES = {
  1: {
    fontSize: 'var(--ds-text-3xl)',
    fontWeight: 700,
    letterSpacing: '-0.025em',
    lineHeight: 1.2,
  },
  2: {
    fontSize: 'var(--ds-text-2xl)',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    lineHeight: 1.25,
  },
  3: {
    fontSize: 'var(--ds-text-xl)',
    fontWeight: 600,
    letterSpacing: '-0.01em',
    lineHeight: 1.3,
  },
}

const SectionHeader = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
  badge,
  level = 1,
  divider = false,
  className = '',
}) => {
  const Tag = `h${level}`
  const titleStyle = LEVEL_STYLES[level] ?? LEVEL_STYLES[1]

  return (
    <header
      className={className}
      style={{
        marginBottom: 'var(--ds-space-6)',
        paddingBottom: divider ? 'var(--ds-space-5)' : undefined,
        borderBottom: divider ? '1px solid var(--ds-border)' : undefined,
      }}
    >
      <Breadcrumbs items={breadcrumbs} />

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 'var(--ds-space-4)',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
            <Tag
              className="ds-section-title"
              style={{ ...titleStyle, color: 'var(--ds-text)', margin: 0 }}
            >
              {title}
            </Tag>
            {badge}
          </div>

          {subtitle && (
            <p className="ds-section-subtitle">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            {actions}
          </div>
        )}
      </div>
    </header>
  )
}

export default SectionHeader
