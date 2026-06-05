import { forwardRef } from 'react'

/**
 * Design System Button
 *
 * Variants: primary | secondary | ghost | danger
 * Sizes:    sm | md | lg
 *
 * Usage:
 *   import { Button } from '../design-system'
 *   <Button variant="primary" size="md" onClick={fn}>Save</Button>
 *   <Button variant="danger" loading>Deleting…</Button>
 *   <Button as="a" href="/dashboard">Go to Dashboard</Button>
 */

const VARIANT = {
  primary:   'ds-btn-primary',
  secondary: 'ds-btn-secondary',
  ghost:     'ds-btn-ghost',
  danger:    'ds-btn-danger',
}

const SIZE = {
  sm: 'ds-btn-sm',
  md: 'ds-btn-md',
  lg: 'ds-btn-lg',
}

const Spinner = () => (
  <svg
    className="animate-spin"
    style={{ width: '1em', height: '1em', flexShrink: 0 }}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
)

const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    as: Tag = 'button',
    type = 'button',
    className = '',
    leftIcon,
    rightIcon,
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading
  const variantClass = VARIANT[variant] ?? VARIANT.primary
  const sizeClass    = SIZE[size] ?? SIZE.md

  return (
    <Tag
      ref={ref}
      type={Tag === 'button' ? type : undefined}
      disabled={Tag === 'button' ? isDisabled : undefined}
      aria-disabled={isDisabled || undefined}
      aria-busy={loading || undefined}
      className={[
        'ds-btn',
        variantClass,
        sizeClass,
        fullWidth ? 'w-full' : '',
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {loading ? (
        <Spinner />
      ) : leftIcon ? (
        <span className="ds-btn-icon" aria-hidden="true">{leftIcon}</span>
      ) : null}

      {children && <span>{children}</span>}

      {!loading && rightIcon && (
        <span className="ds-btn-icon ds-icon-arrow-right" aria-hidden="true">{rightIcon}</span>
      )}
    </Tag>
  )
})

export default Button
