import React from 'react';
import { CheckCircle2, Clock, Circle } from 'lucide-react';

export const TaskTimeline = ({ timeline = [], currentStatus = 'REPORTED' }) => {
  const steps = [
    { key: 'REPORTED', label: 'Reported' },
    { key: 'VERIFIED', label: 'Verified' },
    { key: 'ASSIGNED', label: 'Assigned' },
    { key: 'IN_PROGRESS', label: 'In Progress' },
    { key: 'RESOLVED', label: 'Resolved' },
    { key: 'CITIZEN_VERIFICATION', label: 'Citizen Verification' }
  ];

  const getStepState = (stepKey) => {
    const statusOrder = ['REPORTED', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CITIZEN_VERIFICATION', 'CLOSED'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepKey);

    if (stepIndex < currentIndex || (stepIndex === currentIndex && currentStatus === 'CITIZEN_VERIFICATION')) {
      return 'completed';
    } else if (stepIndex === currentIndex) {
      return 'current';
    }
    return 'upcoming';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Horizontal step progress bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          padding: 'var(--space-3) 0',
          borderBottom: '1px solid var(--color-border-subtle)',
          overflowX: 'auto'
        }}
      >
        {steps.map((s, idx) => {
          const state = getStepState(s.key);
          const isCompleted = state === 'completed';
          const isCurrent = state === 'current';

          return (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                {isCompleted ? (
                  <CheckCircle2 size={20} style={{ color: 'var(--color-status-success)' }} />
                ) : isCurrent ? (
                  <Clock size={20} style={{ color: 'var(--color-brand-primary)' }} />
                ) : (
                  <Circle size={18} style={{ color: 'var(--color-text-tertiary)' }} />
                )}
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: isCurrent || isCompleted ? 800 : 500,
                    color: isCurrent
                      ? 'var(--color-brand-primary)'
                      : isCompleted
                      ? 'var(--color-status-success)'
                      : 'var(--color-text-tertiary)'
                  }}
                >
                  {s.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div
                  style={{
                    width: '30px',
                    height: '2px',
                    backgroundColor: isCompleted ? 'var(--color-status-success)' : 'var(--color-border-subtle)',
                    margin: '0 8px',
                    marginBottom: '16px'
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* History Log entries */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <h4 style={{ fontSize: 'var(--font-xs)', fontWeight: 800, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Activity Log
        </h4>

        {timeline && timeline.length > 0 ? (
          timeline.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: 'var(--space-3)',
                fontSize: 'var(--font-xs)',
                paddingLeft: 'var(--space-2)',
                borderLeft: '2px solid var(--color-brand-primary)'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, color: 'var(--color-text-primary)' }}>{item.title}</span>
                  <span style={{ color: 'var(--color-text-tertiary)', fontSize: '10px' }}>{item.time}</span>
                </div>
                <p style={{ color: 'var(--color-text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>
                  {item.description}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-tertiary)' }}>No timeline entries yet.</p>
        )}
      </div>
    </div>
  );
};
