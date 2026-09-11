import React from 'react';
import { WorkerLogin } from '../auth/WorkerLogin';
import { Card } from '../../shared/components/Card';
import { Wrench } from 'lucide-react';

export const WorkerLoginPage = ({ onNavigate }) => {
  return (
    <div className="container" style={{ maxWidth: '440px', paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-12)' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--color-brand-primary)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-3)' }}>
          <Wrench size={28} />
        </div>
        <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 900, color: 'var(--color-text-primary)' }}>
          WORKER PORTAL LOGIN
        </h1>
        <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
          Field Technician & Work Dispatch Access
        </p>
      </div>

      <Card style={{ padding: 'var(--space-6)' }}>
        <WorkerLogin onSuccess={() => onNavigate ? onNavigate('/worker') : (window.location.hash = '/worker')} />
      </Card>
    </div>
  );
};
