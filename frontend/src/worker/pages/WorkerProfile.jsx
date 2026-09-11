import React, { useState, useEffect } from 'react';
import { workerApi } from '../../services/api/workerApi';
import { useAuth } from '../../services/auth/AuthProvider';
import { Card } from '../../shared/components/Card';
import { Button } from '../../shared/components/Button';
import { Wrench, Shield, CheckCircle2, ArrowLeft, RefreshCw, LogOut } from 'lucide-react';

export const WorkerProfile = ({ onNavigate }) => {
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await workerApi.getProfile();
      setProfile(data);
    } catch (e) {
      console.error('[PROFILE FETCH ERROR]', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <div className="container" style={{ maxWidth: '600px', paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-12)' }}>
      <Button
        variant="ghost"
        size="sm"
        icon={ArrowLeft}
        onClick={() => onNavigate ? onNavigate('/worker') : (window.location.hash = '/worker')}
        style={{ marginBottom: 'var(--space-4)' }}
      >
        Back to Dashboard
      </Button>

      <Card style={{ textAlign: 'center', padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-brand-primary)',
            color: '#FFF',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            margin: '0 auto var(--space-3)'
          }}
        >
          <Wrench size={32} />
        </div>

        <h1 style={{ fontSize: 'var(--font-xl)', fontWeight: 900, color: 'var(--color-text-primary)' }}>
          {profile?.name || 'Ramesh Kumar'}
        </h1>
        <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
          {profile?.role || 'Field Technician'} • {profile?.department || 'Roads & Infrastructure'}
        </p>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: 'var(--space-3)', padding: '4px 12px', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#22C55E', fontWeight: 800, fontSize: 'var(--font-xs)' }}>
          <Shield size={14} /> Identity Verified • {profile?.employeeId || 'worker-004'}
        </div>
      </Card>

      {/* Metrics Card */}
      <Card style={{ marginBottom: 'var(--space-6)' }}>
        <h3 style={{ fontSize: 'var(--font-sm)', fontWeight: 800, color: 'var(--color-text-primary)', textTransform: 'uppercase', marginBottom: 'var(--space-4)' }}>
          FIELD PERFORMANCE METRICS
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-bg-surface-elevated)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <span style={{ fontSize: 'var(--font-2xl)', fontWeight: 900, color: 'var(--color-brand-primary)' }}>
              {profile?.metrics?.activeTasks || 0}
            </span>
            <div style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Active Tasks
            </div>
          </div>

          <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-bg-surface-elevated)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <span style={{ fontSize: 'var(--font-2xl)', fontWeight: 900, color: 'var(--color-status-success)' }}>
              {profile?.metrics?.completedTasks || 0}
            </span>
            <div style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Resolved Issues
            </div>
          </div>
        </div>
      </Card>

      <Button variant="danger" icon={LogOut} onClick={logout} style={{ width: '100%' }}>
        SIGN OUT
      </Button>
    </div>
  );
};
