import React from 'react';

export const Avatar = ({ src, name = 'User', size = 'md', status, className = '' }) => {
  const sizeMap = {
    sm: { px: 28, font: '10px' },
    md: { px: 36, font: '12px' },
    lg: { px: 48, font: '14px' }
  };
  const dim = sizeMap[size] || sizeMap.md;

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} className={className}>
      {src ? (
        <img
          src={src}
          alt={name}
          style={{
            width: `${dim.px}px`,
            height: `${dim.px}px`,
            borderRadius: '50%',
            objectFit: 'cover',
            border: '1px solid var(--color-border-default)'
          }}
        />
      ) : (
        <div
          style={{
            width: `${dim.px}px`,
            height: `${dim.px}px`,
            borderRadius: '50%',
            backgroundColor: 'var(--color-brand-primary)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: dim.font
          }}
        >
          {initials}
        </div>
      )}
      {status && (
        <span
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: status === 'Active' ? 'var(--status-resolved)' : 'var(--color-text-tertiary)',
            border: '2px solid var(--color-bg-surface)'
          }}
        />
      )}
    </div>
  );
};
