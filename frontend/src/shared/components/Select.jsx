import React from 'react';

export const Select = ({ label, options = [], value, onChange, className = '', ...props }) => {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <select className={`form-select ${className}`} value={value} onChange={onChange} {...props}>
        {options.map((opt, idx) => (
          <option key={idx} value={typeof opt === 'string' ? opt : opt.value}>
            {typeof opt === 'string' ? opt : opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};
