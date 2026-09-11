import React from 'react';
import { AuthorityLogin } from '../auth/AuthorityLogin';
import { Card } from '../../shared/components/Card';
import { Shield } from 'lucide-react';

export const AuthorityLoginPage = ({ onNavigate }) => {
  return (
    <div className="container" style={{ maxWidth: '440px', paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-12)' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--color-brand-primary)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-3)' }}>
          <Shield size={28} />
        </div>
        <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 900, color: 'var(--color-text-primary)' }}>
          JANSETU AUTHORITY
        </h1>
        <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
          Manage the issues that need action.
        </p>
      </div>

      <Card style={{ padding: 'var(--space-6)' }}>
        <AuthorityLogin onSuccess={() => onNavigate ? onNavigate('/authority') : (window.location.hash = '/authority')} />
      </Card>
    </div>
  );
};
