/**
 * Design System ProgressSteps
 *
 * Horizontal or vertical step indicator. Shows where the user is in a
 * multi-step journey (e.g. idea submission wizard or onboarding).
 *
 * Usage:
 *   import { ProgressSteps } from '../design-system'
 *
 *   const steps = [
 *     { id: 'basics',   label: 'Basics',      description: 'Name & sector' },
 *     { id: 'market',   label: 'Market',       description: 'Region & size' },
 *     { id: 'finance',  label: 'Financials',   description: 'Budget & model' },
 *     { id: 'review',   label: 'Review',       description: 'Confirm & submit' },
 *   ]
 *
 *   <ProgressSteps steps={steps} currentStep="market" orientation="horizontal" />
 *   <ProgressSteps steps={steps} currentStep={1} orientation="vertical" />
 *
 * Step status is derived from currentStep (index or id string).
 * Steps before current → 'completed'. Current → 'current'. After → 'upcoming'.
 */

const CheckIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" style={{ width: '0.875rem', height: '0.875rem' }}>
    <path fillRule="evenodd" d="M12.78 4.22a.75.75 0 010 1.06l-5.5 5.5a.75.75 0 01-1.06 0l-2.5-2.5a.75.75 0 011.06-1.06L6.75 9.19l4.97-4.97a.75.75 0 011.06 0z" />
  </svg>
)

const StepCircle = ({ status, number }) => {
  const base = {
    width: '2rem',
    height: '2rem',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontWeight: 600,
    fontSize: 'var(--ds-text-xs)',
    transition: 'var(--ds-transition-smooth)',
    zIndex: 1,
  }

  if (status === 'completed') {
    return (
      <div style={{ ...base, background: 'var(--ds-brand-500)', color: '#fff', boxShadow: '0 0 0 3px var(--ds-brand-100)' }}>
        <CheckIcon />
      </div>
    )
  }
  if (status === 'current') {
    return (
      <div style={{ ...base, background: 'var(--ds-brand-500)', color: '#fff', boxShadow: '0 0 0 3px var(--ds-brand-100)', outline: '2px solid var(--ds-brand-500)', outlineOffset: '2px' }}>
        {number}
      </div>
    )
  }
  // upcoming
  return (
    <div style={{ ...base, background: 'var(--ds-surface)', color: 'var(--ds-text-muted)', border: '2px solid var(--ds-border)' }}>
      {number}
    </div>
  )
}

const resolveStatus = (steps, currentStep) => {
  let currentIdx
  if (typeof currentStep === 'number') {
    currentIdx = currentStep
  } else {
    currentIdx = steps.findIndex(s => s.id === currentStep)
    if (currentIdx === -1) currentIdx = 0
  }

  return steps.map((step, i) => ({
    ...step,
    status: i < currentIdx ? 'completed' : i === currentIdx ? 'current' : 'upcoming',
    number: i + 1,
  }))
}

// ── Horizontal ────────────────────────────────────────────────────────────

const HorizontalSteps = ({ steps }) => (
  <nav aria-label="Progress">
    <ol
      style={{
        display: 'flex',
        alignItems: 'center',
        listStyle: 'none',
        margin: 0,
        padding: 0,
        gap: 0,
      }}
    >
      {steps.map((step, i) => (
        <li key={step.id ?? i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? '1 1 0' : undefined }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <StepCircle status={step.status} number={step.number} />
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: 'var(--ds-text-xs)',
                  fontWeight: step.status === 'current' ? 600 : 500,
                  color: step.status === 'upcoming' ? 'var(--ds-text-muted)' : 'var(--ds-text)',
                  whiteSpace: 'nowrap',
                }}
              >
                {step.label}
              </div>
              {step.description && (
                <div style={{ fontSize: 'var(--ds-text-2xs)', color: 'var(--ds-text-muted)', whiteSpace: 'nowrap' }}>
                  {step.description}
                </div>
              )}
            </div>
          </div>

          {i < steps.length - 1 && (
            <div
              className={`ds-step-connector ${step.status === 'completed' ? 'completed' : ''}`}
              style={{ margin: '0 0.5rem', marginBottom: '1.5rem' }}
              aria-hidden="true"
            />
          )}
        </li>
      ))}
    </ol>
  </nav>
)

// ── Vertical ──────────────────────────────────────────────────────────────

const VerticalSteps = ({ steps, onStepClick }) => (
  <nav aria-label="Progress">
    <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1
        const clickable = step.status === 'completed' && onStepClick

        return (
          <li key={step.id ?? i} style={{ display: 'flex', gap: '0.875rem' }}>
            {/* Left column: circle + connector */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <StepCircle status={step.status} number={step.number} />
              {!isLast && (
                <div
                  aria-hidden="true"
                  style={{
                    width: '2px',
                    flex: 1,
                    minHeight: '1.5rem',
                    background: step.status === 'completed' ? 'var(--ds-brand-400)' : 'var(--ds-border)',
                    transition: 'background 0.3s ease',
                    margin: '0.25rem 0',
                  }}
                />
              )}
            </div>

            {/* Right column: label + description */}
            <div
              style={{
                paddingBottom: isLast ? 0 : '1.25rem',
                flex: 1,
                cursor: clickable ? 'pointer' : undefined,
              }}
              onClick={clickable ? () => onStepClick(step.id ?? i) : undefined}
            >
              <div
                style={{
                  fontSize: 'var(--ds-text-sm)',
                  fontWeight: step.status === 'current' ? 600 : 500,
                  color: step.status === 'upcoming' ? 'var(--ds-text-muted)' : 'var(--ds-text)',
                  lineHeight: '2rem',  // align with circle height
                }}
              >
                {step.label}
              </div>
              {step.description && (
                <div style={{ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-text-muted)', marginTop: '0.125rem', lineHeight: 1.5 }}>
                  {step.description}
                </div>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  </nav>
)

// ── Main Component ────────────────────────────────────────────────────────

const ProgressSteps = ({
  steps = [],
  currentStep = 0,
  orientation = 'horizontal',
  onStepClick,
  className = '',
}) => {
  const resolved = resolveStatus(steps, currentStep)

  return (
    <div className={className}>
      {orientation === 'vertical' ? (
        <VerticalSteps steps={resolved} onStepClick={onStepClick} />
      ) : (
        <HorizontalSteps steps={resolved} />
      )}
    </div>
  )
}

export default ProgressSteps
