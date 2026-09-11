import React from 'react';

export const MetricCard = ({ label, value, unit = '', trend, icon: Icon, color = 'var(--color-brand-primary)' }) => {
  return (
    <div className="metric-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
        <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
          {label}
        </span>
        {Icon && (
          <div
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: color.includes('--status-reported')
                ? 'var(--status-reported-bg)'
                : color.includes('--status-resolved')
                ? 'var(--status-resolved-bg)'
                : color.includes('--status-verified')
                ? 'var(--status-verified-bg)'
                : color.includes('--color-brand-primary')
                ? 'var(--color-brand-subtle)'
                : 'var(--color-bg-surface-hover)',
              color: color
            }}
          >
            <Icon size={18} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)' }}>
        <span style={{ fontSize: 'var(--font-3xl)', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {unit && <span style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>{unit}</span>}
      </div>

      {trend && (
        <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-xs)', color: 'var(--status-resolved)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>↑ {trend}</span>
          <span style={{ color: 'var(--color-text-tertiary)' }}>vs last week</span>
        </div>
      )}
    </div>
  );
};
