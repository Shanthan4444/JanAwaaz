import React, { useState } from 'react';
import { CitizenLogin } from '../auth/CitizenLogin';
import { WorkerLogin } from '../../worker/auth/WorkerLogin';
import { Card } from '../../shared/components/Card';
import { User, Wrench, Shield } from 'lucide-react';

export const CitizenLoginPage = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('citizen'); // 'citizen' | 'worker'

  return (
    <div className="container" style={{ maxWidth: '460px', paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-12)' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, var(--color-brand-primary), #4338CA)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-3)' }}>
          {activeTab === 'citizen' ? <User size={28} /> : <Wrench size={28} />}
        </div>
        <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 900, color: 'var(--color-text-primary)' }}>
          {activeTab === 'citizen' ? 'JANSETU CITIZEN ACCESS' : 'FIELD WORKER PORTAL'}
        </h1>
        <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
          {activeTab === 'citizen'
            ? 'Report civic issues, verify field resolutions, & support community projects.'
            : 'Access assigned municipal field tasks, post work progress, & upload resolution proof.'}
        </p>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          backgroundColor: 'var(--color-bg-surface-elevated)',
          padding: '4px',
          borderRadius: 'var(--radius-lg)',
          marginBottom: 'var(--space-4)',
          border: '1px solid var(--color-border-default)'
        }}
      >
        <button
          onClick={() => setActiveTab('citizen')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '10px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            backgroundColor: activeTab === 'citizen' ? 'var(--color-brand-primary)' : 'transparent',
            color: activeTab === 'citizen' ? '#FFFFFF' : 'var(--color-text-secondary)',
            fontSize: 'var(--font-xs)',
            fontWeight: activeTab === 'citizen' ? 800 : 600,
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
        >
          <User size={14} />
          <span>Citizen Login</span>
        </button>

        <button
          onClick={() => setActiveTab('worker')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '10px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            backgroundColor: activeTab === 'worker' ? 'var(--color-brand-primary)' : 'transparent',
            color: activeTab === 'worker' ? '#FFFFFF' : 'var(--color-text-secondary)',
            fontSize: 'var(--font-xs)',
            fontWeight: activeTab === 'worker' ? 800 : 600,
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
        >
          <Wrench size={14} />
          <span>Field Worker Portal</span>
        </button>
      </div>

      {/* Login Card */}
      <Card style={{ padding: 'var(--space-6)' }}>
        {activeTab === 'citizen' ? (
          <CitizenLogin onSuccess={() => onNavigate ? onNavigate('/citizen') : (window.location.hash = '/citizen')} />
        ) : (
          <WorkerLogin onSuccess={() => onNavigate ? onNavigate('/worker') : (window.location.hash = '/worker')} />
        )}
      </Card>

      {/* Footer Link to Authority Portal */}
      <div style={{ textAlign: 'center', marginTop: 'var(--space-6)', fontSize: 'var(--font-xs)', color: 'var(--color-text-tertiary)' }}>
        Municipal Officer?{' '}
        <button
          onClick={() => onNavigate ? onNavigate('/authority/login') : (window.location.hash = '/authority/login')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-brand-primary)',
            fontWeight: 700,
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          Official Authority Portal
        </button>
      </div>
    </div>
  );
};
