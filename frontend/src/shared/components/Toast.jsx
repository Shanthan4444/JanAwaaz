import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ toast, onClose }) => {
  if (!toast) return null;

  const { message, type = 'info' } = toast;

  const typeConfig = {
    success: { icon: CheckCircle2, color: 'var(--status-resolved)' },
    warning: { icon: AlertCircle, color: 'var(--status-in-progress)' },
    error: { icon: AlertCircle, color: 'var(--status-reopened)' },
    info: { icon: Info, color: 'var(--color-brand-primary)' }
  };

  const config = typeConfig[type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <div
      className="animate-slide-up"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        padding: '12px 20px',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--color-bg-surface-elevated)',
        border: `1px solid ${config.color}40`,
        boxShadow: 'var(--shadow-lg)',
        maxWidth: '420px'
      }}
    >
      <div style={{ color: config.color, display: 'flex', alignItems: 'center' }}>
        <Icon size={20} />
      </div>
      <span style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-primary)', flex: 1, fontWeight: 500 }}>
        {message}
      </span>
      {onClose && (
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'var(--color-text-tertiary)', cursor: 'pointer', padding: '2px' }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
