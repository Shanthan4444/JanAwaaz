import React from 'react';

export const IconButton = ({ icon: Icon, label, variant = 'ghost', size = 'md', className = '', onClick, ...props }) => {
  const sizeMap = { sm: 14, md: 18, lg: 22 };
  const iconSize = sizeMap[size] || 18;

  return (
    <button
      type="button"
      className={`btn btn-${variant} ${className}`}
      onClick={onClick}
      title={label}
      aria-label={label}
      style={{ padding: size === 'sm' ? '6px' : '10px', borderRadius: 'var(--radius-md)' }}
      {...props}
    >
      <Icon size={iconSize} />
    </button>
  );
};
