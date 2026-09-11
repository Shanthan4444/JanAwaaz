import React from 'react';

export const Input = ({ label, error, icon: Icon, className = '', ...props }) => {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <div style={{ position: 'relative' }}>
        {Icon && (
          <div
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-tertiary)'
            }}
          >
            <Icon size={18} />
          </div>
        )}
        <input
          className={`form-input ${className}`}
          style={{ paddingLeft: Icon ? '40px' : '16px' }}
          {...props}
        />
      </div>
      {error && <span style={{ fontSize: 'var(--font-xs)', color: 'var(--status-reopened)' }}>{error}</span>}
    </div>
  );
};
