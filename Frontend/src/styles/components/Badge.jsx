/**
 * Design System Badge
 *
 * Semantic status indicators. Supports optional leading dot and icon.
 * All CSS comes from GlobalStyles.css (.ds-badge-* classes).
 *
 * Usage:
 *   import { Badge } from '../design-system'
 *
 *   <Badge color="success">Active</Badge>
 *   <Badge color="danger" dot>High Risk</Badge>
 *   <Badge color="brand" size="lg">Technology</Badge>
 *
 * Colors: brand | success | warning | danger | info | neutral
 * Sizes:  sm | md | lg
 */

const COLOR_MAP = {
  brand:    'ds-badge-brand',
  primary:  'ds-badge-brand',   // alias
  success:  'ds-badge-success',
  green:    'ds-badge-success', // alias
  warning:  'ds-badge-warning',
  amber:    'ds-badge-warning', // alias
  yellow:   'ds-badge-warning', // alias
  danger:   'ds-badge-danger',
  error:    'ds-badge-danger',  // alias
  red:      'ds-badge-danger',  // alias
  info:     'ds-badge-info',
  blue:     'ds-badge-info',    // alias
  neutral:  'ds-badge-neutral',
  gray:     'ds-badge-neutral', // alias
  secondary:'ds-badge-neutral', // alias
}

const SIZE_MAP = {
  sm: 'ds-badge-sm',
  md: 'ds-badge-md',
  lg: 'ds-badge-lg',
}

/** Pulsing dot for "live" / active status */
const StatusDot = ({ color }) => {
  const dotColor = {
    brand:    '#1D9E75',
    success:  '#16a34a',
    green:    '#16a34a',
    warning:  '#ca8a04',
    amber:    '#ca8a04',
    danger:   '#dc2626',
    error:    '#dc2626',
    info:     '#2563eb',
    neutral:  '#6b7280',
  }[color] ?? '#6b7280'

  return (
    <span
      style={{
        display: 'inline-block',
        width: '0.45rem',
        height: '0.45rem',
        borderRadius: '50%',
        backgroundColor: dotColor,
        flexShrink: 0,
      }}
      aria-hidden="true"
    />
  )
}

const Badge = ({
  children,
  color = 'neutral',
  size = 'md',
  dot = false,
  icon,
  className = '',
  ...props
}) => {
  const colorClass = COLOR_MAP[color] ?? COLOR_MAP.neutral
  const sizeClass  = SIZE_MAP[size]  ?? SIZE_MAP.md

  return (
    <span
      className={['ds-badge', colorClass, sizeClass, className].filter(Boolean).join(' ')}
      {...props}
    >
      {dot && <StatusDot color={color} />}
      {icon && <span aria-hidden="true" style={{ display: 'inline-flex', flexShrink: 0 }}>{icon}</span>}
      {children}
    </span>
  )
}

export default Badge
