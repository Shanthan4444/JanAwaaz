import React from 'react';
import { CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import { STATUS_MAP } from './StatusBadge';

export const Timeline = ({ timeline = [], currentStatus = 'REPORTED' }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', position: 'relative', paddingLeft: 'var(--space-6)' }}>
      <div
        style={{
          position: 'absolute',
          top: '12px',
          bottom: '12px',
          left: '11px',
          width: '2px',
          backgroundColor: 'var(--color-border-subtle)',
          zIndex: 1
        }}
      />

      {timeline.map((item, index) => {
        const isLatest = index === timeline.length - 1;
        const config = STATUS_MAP[item.status] || { color: 'var(--color-brand-primary)' };

        return (
          <div key={index} style={{ position: 'relative', zIndex: 2 }}>
            <div
              style={{
                position: 'absolute',
                left: '-24px',
                top: '2px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-bg-surface)',
                border: `2px solid ${config.color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: config.color,
                boxShadow: isLatest ? `0 0 10px ${config.color}50` : 'none'
              }}
            >
              {item.status === 'CLOSED' ? (
                <ShieldCheck size={14} />
              ) : (
                <CheckCircle2 size={14} />
              )}
            </div>

            <div style={{ paddingLeft: 'var(--space-3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
                <h4 style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: isLatest ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>
                  {item.title}
                </h4>
                <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-tertiary)' }}>{item.time}</span>
              </div>
              <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
                {item.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
