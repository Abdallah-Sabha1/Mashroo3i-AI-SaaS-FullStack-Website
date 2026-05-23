import { useState, useRef, useEffect, useCallback } from 'react'

/**
 * Design System Tooltip
 *
 * Two modes:
 *  1. text="..." — simple explanatory tooltip
 *  2. source="..." — shows a credibility/citation chip (for AI-generated data sources)
 *
 * Usage:
 *   import { Tooltip } from '../design-system'
 *
 *   // Explanatory
 *   <Tooltip text="Gross margin = revenue minus direct costs">
 *     Gross Margin
 *   </Tooltip>
 *
 *   // Source citation (credibility system)
 *   <Tooltip
 *     text="Estimated based on Jordan Department of Statistics 2023 SME report"
 *     source="DOS Jordan 2023"
 *     sourceType="government"
 *   >
 *     JOD 45,000
 *   </Tooltip>
 *
 * sourceType: 'government' | 'research' | 'industry' | 'ai' | 'internal'
 */

const SOURCE_BADGE = {
  government: { label: 'Gov. Data',   color: '#2563eb' },
  research:   { label: 'Research',    color: '#7c3aed' },
  industry:   { label: 'Industry',    color: '#d97706' },
  ai:         { label: 'AI Estimate', color: '#6b7280' },
  internal:   { label: 'Internal',    color: '#1D9E75' },
}

/** Info circle SVG icon */
const InfoIcon = () => (
  <svg
    style={{ width: '0.8em', height: '0.8em', flexShrink: 0, opacity: 0.6 }}
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
      clipRule="evenodd"
    />
  </svg>
)

const Tooltip = ({
  children,
  text,
  source,
  sourceType = 'ai',
  /** Placement relative to anchor: 'top' | 'bottom' */
  placement = 'top',
  /** If true, shows a small info icon beside the children */
  showIcon = false,
  className = '',
}) => {
  const [visible, setVisible] = useState(false)
  const anchorRef = useRef(null)
  const timeoutRef = useRef(null)

  const show = useCallback(() => {
    clearTimeout(timeoutRef.current)
    setVisible(true)
  }, [])

  const hide = useCallback(() => {
    timeoutRef.current = setTimeout(() => setVisible(false), 120)
  }, [])

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  const srcMeta = source ? (SOURCE_BADGE[sourceType] ?? SOURCE_BADGE.ai) : null

  if (!text) return <>{children}</>

  return (
    <span
      ref={anchorRef}
      className={`ds-tooltip-anchor ${className}`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onClick={() => setVisible(v => !v)}
      tabIndex={0}
      role="button"
      aria-describedby={visible ? 'ds-tooltip' : undefined}
    >
      {children}
      {showIcon && <InfoIcon />}

      {visible && (
        <span
          id="ds-tooltip"
          role="tooltip"
          className={`ds-tooltip-bubble ${placement === 'bottom' ? 'ds-tooltip-bottom' : ''}`}
        >
          {text}

          {source && (
            <span
              style={{
                display: 'block',
                marginTop: '0.4rem',
                paddingTop: '0.4rem',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                fontSize: '0.65rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '9999px',
                  background: srcMeta.color,
                  color: '#fff',
                  fontSize: '0.6rem',
                  fontWeight: 600,
                  letterSpacing: '0.03em',
                  lineHeight: 1.4,
                }}
              >
                {srcMeta.label}
              </span>
              <span style={{ opacity: 0.75 }}>{source}</span>
            </span>
          )}
        </span>
      )}
    </span>
  )
}

/** Pre-built tooltip texts for common financial/business terms */
export const TOOLTIPS = {
  grossMargin:     'From every 10 JD you earn, this is how much stays after paying the direct cost of your product or service.',
  breakEven:       'The point where your income equals your total costs. After this point, you start making real profit.',
  ltv:             'Lifetime Value — the total amount a customer will spend before they stop buying.',
  cac:             'Customer Acquisition Cost — how much you spend to acquire one new customer.',
  ltvCac:          'How much a customer is worth compared to what it costs to get them. A healthy ratio is 3:1 or higher.',
  grossProfit:     'Revenue minus the direct cost of delivering your product or service — before fixed costs.',
  monthlyChurn:    'The percentage of customers who stop buying each month.',
  arr:             'Annual Recurring Revenue — total yearly contract value from all active clients.',
  noveltyScore:    'How original is this idea compared to existing businesses in the target market?',
  marketPotential: 'How large and accessible is the addressable market for this idea?',
  overallScore:    'Our overall AI assessment of this idea\'s viability in the target market.',
  roiPayback:      'Payback period — how many months until cumulative revenue recovers your initial investment.',
}

export default Tooltip
