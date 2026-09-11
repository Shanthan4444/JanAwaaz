import React from 'react';
import './styles/tokens.css';
import './styles/index.css';

export default function App() {
  return (
    <div style={{ padding: '3rem 2rem', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-text-primary, #1e293b)' }}>
        JanAwaaz — Civic Issue Reporting Platform
      </h1>
      <p style={{ fontSize: '1.1rem', color: 'var(--color-text-secondary, #64748b)', marginTop: '1rem' }}>
        Base project foundation initialized.
      </p>
    </div>
  );
}
