import React from 'react';
import { Avatar } from './Avatar';

export const AvatarGroup = ({ avatars = [], max = 4 }) => {
  const visible = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {visible.map((av, idx) => (
        <div key={idx} style={{ marginLeft: idx > 0 ? '-10px' : 0, zIndex: visible.length - idx }}>
          <Avatar src={av.src} name={av.name || 'User'} size="sm" />
        </div>
      ))}
      {remaining > 0 && (
        <div
          style={{
            marginLeft: '-10px',
            zIndex: 0,
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-bg-surface-elevated)',
            border: '2px solid var(--color-bg-surface)',
            color: 'var(--color-text-secondary)',
            fontSize: '10px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
};
