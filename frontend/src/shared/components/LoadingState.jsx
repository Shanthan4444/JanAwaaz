import React from 'react';
import { Cpu } from 'lucide-react';

export const LoadingState = ({ message = 'AI Civic Intelligence Analyzing...' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-12) var(--space-4)',
        textAlign: 'center'
      }}
    >
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-brand-subtle)',
          color: 'var(--color-brand-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 'var(--space-4)',
          animation: 'pulseGlow 1.8s infinite ease-in-out'
        }}
      >
        <Cpu size={28} />
      </div>
      <p style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
        {message}
      </p>
    </div>
  );
};
