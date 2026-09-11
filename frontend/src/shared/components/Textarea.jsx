import React from 'react';

export const Textarea = ({ label, error, rows = 4, className = '', ...props }) => {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <textarea className={`form-textarea ${className}`} rows={rows} {...props} />
      {error && <span style={{ fontSize: 'var(--font-xs)', color: 'var(--status-reopened)' }}>{error}</span>}
    </div>
  );
};
