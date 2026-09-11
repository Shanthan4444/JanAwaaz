import React from 'react';
import { AlertCircle, Clock, CheckCircle2, XCircle } from 'lucide-react';

export const WorkerMetrics = ({ tasks = [] }) => {
  const queueCount = tasks.filter((t) => t.status === 'REPORTED' || t.status === 'ASSIGNED').length;
  const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const resolvedCount = tasks.filter((t) => t.status === 'RESOLVED' || t.status === 'CITIZEN_VERIFICATION' || t.status === 'CLOSED').length;
  const rejectedCount = tasks.filter((t) => t.status === 'REJECTED_BY_WORKER').length;

  const metrics = [
    { label: 'DEPT QUEUE', count: queueCount, icon: AlertCircle, color: '#F59E0B' },
    { label: 'IN PROGRESS', count: inProgressCount, icon: Clock, color: '#3B82F6' },
    { label: 'RESOLVED WORK', count: resolvedCount, icon: CheckCircle2, color: '#10B981' },
    { label: 'REJECTED FAKE', count: rejectedCount, icon: XCircle, color: '#EF4444' }
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: 'var(--space-3)',
        marginBottom: 'var(--space-6)'
      }}
    >
      {metrics.map((m, idx) => {
        const IconComponent = m.icon;
        return (
          <div
            key={idx}
            style={{
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg-surface-elevated)',
              border: '1px solid var(--color-border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--color-text-tertiary)', letterSpacing: '0.04em' }}>
                {m.label}
              </span>
              <IconComponent size={14} style={{ color: m.color }} />
            </div>
            <span style={{ fontSize: 'var(--font-xl)', fontWeight: 900, color: 'var(--color-text-primary)' }}>
              {m.count}
            </span>
          </div>
        );
      })}
    </div>
  );
};
