import Tooltip, { TOOLTIPS } from './Tooltip'

/**
 * Design System MetricCard
 *
 * Displays a KPI with label, value, optional trend indicator, and optional
 * source citation tooltip (for the Mashroo3i credibility system).
 *
 * Usage:
 *   import { MetricCard } from '../design-system'
 *
 *   <MetricCard
 *     label="Gross Margin"
 *     value="68%"
 *     tooltip={TOOLTIPS.grossMargin}
 *     trend={+12}
 *     trendLabel="vs last month"
 *     source="Jordan SME Report 2023"
 *     sourceType="government"
 *     highlight
 *   />
 *
 *   <MetricCard label="CAC" value="JD 22" tooltip={TOOLTIPS.cac} trend={-5} />
 */

const TrendArrow = ({ value }) => {
  if (value === 0 || value == null) {
    return (
      <span className="ds-metric-trend-flat" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem', fontWeight: 500 }}>
        <svg style={{ width: '0.9rem', height: '0.9rem' }} viewBox="0 0 16 16" fill="currentColor">
          <path d="M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
        </svg>
        <span>—</span>
      </span>
    )
  }
  const up = value > 0
  return (
    <span
      className={up ? 'ds-metric-trend-up' : 'ds-metric-trend-down'}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem', fontWeight: 600 }}
    >
      <svg style={{ width: '0.85rem', height: '0.85rem' }} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        {up ? (
          <path d="M8 3l5 6H3l5-6z" />
        ) : (
          <path d="M8 13L3 7h10L8 13z" />
        )}
      </svg>
      {Math.abs(value)}%
    </span>
  )
}

const MetricCard = ({
  label,
  value,
  tooltip,
  tooltipKey,           // key into TOOLTIPS dict — alternative to passing full text
  trend,                // number (% change), positive = up, negative = down
  trendLabel,           // e.g. "vs last month"
  source,               // citation string
  sourceType = 'ai',
  subtitle,
  highlight = false,    // adds a brand left-border accent
  size = 'md',          // 'sm' | 'md' | 'lg'
  className = '',
}) => {
  const resolvedTooltip = tooltip || (tooltipKey ? TOOLTIPS[tooltipKey] : undefined)

  const valueSize = { sm: 'var(--ds-text-xl)', md: 'var(--ds-text-3xl)', lg: 'var(--ds-text-4xl)' }[size] ?? 'var(--ds-text-3xl)'
  const padding   = { sm: '1rem', md: '1.25rem', lg: '1.5rem' }[size] ?? '1.25rem'

  return (
    <div
      className={`ds-card ${className}`}
      style={{
        padding,
        borderInlineStart: highlight ? '3px solid var(--ds-brand-500)' : undefined,
      }}
    >
      {/* Label row */}
      <div style={{ marginBottom: '0.5rem' }}>
        {resolvedTooltip ? (
          <Tooltip text={resolvedTooltip} source={source} sourceType={sourceType} showIcon>
            <span
              style={{
                fontSize: 'var(--ds-text-xs)',
                fontWeight: 500,
                color: 'var(--ds-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {label}
            </span>
          </Tooltip>
        ) : (
          <span
            style={{
              fontSize: 'var(--ds-text-xs)',
              fontWeight: 500,
              color: 'var(--ds-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {label}
          </span>
        )}
      </div>

      {/* Value */}
      <div
        className="ds-metric-value"
        style={{ fontSize: valueSize, marginBottom: trend != null || subtitle ? '0.5rem' : 0 }}
      >
        {value}
      </div>

      {/* Trend + optional label */}
      {(trend != null || subtitle) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          {trend != null && <TrendArrow value={trend} />}
          {(trendLabel || subtitle) && (
            <span style={{ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-text-muted)' }}>
              {trendLabel || subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default MetricCard
