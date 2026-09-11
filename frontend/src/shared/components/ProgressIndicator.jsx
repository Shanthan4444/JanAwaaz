import React from 'react';
import { Check } from 'lucide-react';

export const ProgressIndicator = ({ steps = [], currentStep = 1 }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', position: 'relative' }}>
      {steps.map((step, idx) => {
        const stepNum = idx + 1;
        const isCompleted = stepNum < currentStep;
        const isCurrent = stepNum === currentStep;

        return (
          <React.Fragment key={idx}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-1)', zIndex: 2 }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 'var(--font-xs)',
                  backgroundColor: isCompleted
                    ? 'var(--status-resolved)'
                    : isCurrent
                    ? 'var(--color-brand-primary)'
                    : 'var(--color-bg-surface-elevated)',
                  color: isCompleted || isCurrent ? '#FFFFFF' : 'var(--color-text-tertiary)',
                  border: isCurrent
                    ? '2px solid var(--color-brand-primary)'
                    : '1px solid var(--color-border-default)',
                  boxShadow: isCurrent ? '0 0 12px rgba(99, 102, 241, 0.4)' : 'none',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {isCompleted ? <Check size={16} /> : stepNum}
              </div>
              <span
                style={{
                  fontSize: 'var(--font-xs)',
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                  textAlign: 'center',
                  maxWidth: '80px'
                }}
              >
                {step.label || step}
              </span>
            </div>

            {idx < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: '2px',
                  backgroundColor: isCompleted ? 'var(--status-resolved)' : 'var(--color-border-subtle)',
                  marginTop: '-18px',
                  zIndex: 1,
                  transition: 'background-color var(--transition-normal)'
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
