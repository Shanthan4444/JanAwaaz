import React from 'react';

export const Skeleton = ({ width = '100%', height = '20px', borderRadius = 'var(--radius-md)', className = '' }) => {
  return (
    <div
      className={className}
      style={{
        width: width,
        height: height,
        borderRadius: borderRadius,
        backgroundColor: 'var(--color-bg-surface-elevated)',
        animation: 'pulseGlow 1.5s infinite ease-in-out'
      }}
    />
  );
};
