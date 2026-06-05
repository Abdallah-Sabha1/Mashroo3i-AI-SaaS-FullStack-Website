/**
 * Design System Card
 *
 * Composable card with optional Header, Body, and Footer sub-components.
 * Supports interactive hover state and glass variant.
 *
 * Usage:
 *   import { Card } from '../design-system'
 *
 *   // Simple
 *   <Card>content</Card>
 *
 *   // Composed
 *   <Card interactive>
 *     <Card.Header>
 *       <h3>Title</h3>
 *     </Card.Header>
 *     <Card.Body>…</Card.Body>
 *     <Card.Footer>
 *       <Button>Action</Button>
 *     </Card.Footer>
 *   </Card>
 *
 *   // Glass
 *   <Card variant="glass" padding={false}>…</Card>
 */

// ── Sub-components ────────────────────────────────────────────────────────

const Header = ({ children, className = '', ...props }) => (
  <div className={`ds-card-header ${className}`} {...props}>
    {children}
  </div>
)
Header.displayName = 'Card.Header'

const Body = ({ children, className = '', noPadding = false, ...props }) => (
  <div className={`${noPadding ? '' : 'ds-card-body'} ${className}`} {...props}>
    {children}
  </div>
)
Body.displayName = 'Card.Body'

const Footer = ({ children, className = '', ...props }) => (
  <div className={`ds-card-footer ${className}`} {...props}>
    {children}
  </div>
)
Footer.displayName = 'Card.Footer'

// ── Main Card ─────────────────────────────────────────────────────────────

const Card = ({
  children,
  className = '',
  interactive = false,
  /** Pad the card body directly when not using sub-components */
  padding = true,
  variant = 'default',  // 'default' | 'glass' | 'flat'
  as: Tag = 'div',
  ...props
}) => {
  const variantClass = {
    default: 'ds-card',
    glass:   'ds-card card-glass',
    flat:    'rounded-2xl bg-transparent border border-[var(--ds-border)]',
  }[variant] ?? 'ds-card'

  return (
    <Tag
      className={[
        variantClass,
        interactive ? 'ds-card-interactive' : '',
        padding ? 'ds-card-body' : '',
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </Tag>
  )
}

Card.Header  = Header
Card.Body    = Body
Card.Footer  = Footer
Card.displayName = 'Card'

export default Card
