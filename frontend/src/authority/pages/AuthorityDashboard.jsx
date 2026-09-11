import React, { useState, useEffect } from 'react';
import { PriorityBadge } from '../../shared/components/PriorityBadge';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { Button } from '../../shared/components/Button';
import { LoadingState } from '../../shared/components/LoadingState';
import { EmptyState } from '../../shared/components/EmptyState';
import { authorityApi } from '../../services/api/authorityApi';
import { useAuth } from '../../services/auth/AuthProvider';
import { WorkerAuditScoreboard } from '../components/WorkerAuditScoreboard';
import { ShieldAlert, UserCheck, Eye, Map, List, Clock, Filter, AlertTriangle, RefreshCw, Activity, UserPlus } from 'lucide-react';

export const AuthorityDashboard = ({ onNavigate }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateWorkerModalOpen, setIsCreateWorkerModalOpen] = useState(false);
  const { user } = useAuth();

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authorityApi.getDashboard();
      setData(res);
    } catch (err) {
      console.error('[AUTHORITY DASHBOARD FETCH ERROR]', err);
      setError(err.message || 'Failed to load authority command center data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-12)' }}>
        <LoadingState message="Loading Municipal Authority Priority Queue..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ maxWidth: '640px', paddingTop: 'var(--space-12)' }}>
        <EmptyState
          title="Command Center Unavailable"
          description={error}
          actionText="Retry Loading"
          onAction={fetchDashboardData}
        />
      </div>
    );
  }

  const metrics = data?.metrics || { critical: 0, high: 0, pending: 0, inProgress: 0, totalNeedAttention: 0 };
  const issues = data?.priorityQueue || [];

  return (
    <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>
      {/* Top Banner */}
      <div
        style={{
          backgroundColor: 'var(--color-bg-surface-elevated)',
          border: '1px solid var(--color-brand-border)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-6)',
          marginBottom: 'var(--space-8)',
          boxShadow: 'var(--shadow-glow-indigo)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-4)'
        }}
      >
        <div>
          <span style={{ fontSize: '10px', color: 'var(--color-brand-primary)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.08em' }}>
            {user?.department || 'Municipal Authority'} Action Center • Officer {user?.name || 'Authorized'}
          </span>
          <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 900, color: 'var(--color-text-primary)', marginTop: '2px' }}>
            What needs attention right now?
          </h1>
          <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-3)', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 'var(--font-sm)', color: 'var(--priority-critical)', fontWeight: 800 }}>
              {metrics.critical} Critical
            </span>
            <span style={{ fontSize: 'var(--font-sm)', color: 'var(--priority-high)', fontWeight: 800 }}>
              {metrics.high} High
            </span>
            <span style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-primary)', fontWeight: 800 }}>
              {metrics.pending} Pending Review
            </span>
            {issues.filter((i) => i.status === 'REOPENED').length > 0 && (
              <span style={{ fontSize: 'var(--font-sm)', color: 'var(--color-status-danger)', fontWeight: 900, backgroundColor: 'rgba(239, 68, 68, 0.15)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
                ↻ {issues.filter((i) => i.status === 'REOPENED').length} REOPENED BY CITIZEN
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <Button variant="ghost" size="sm" icon={RefreshCw} onClick={fetchDashboardData}>
            Refresh
          </Button>
          <Button
            variant="primary"
            icon={UserPlus}
            onClick={() => setIsCreateWorkerModalOpen(true)}
          >
            + Create Field Worker
          </Button>
          <Button
            variant="danger"
            icon={ShieldAlert}
            onClick={() => onNavigate ? onNavigate('/authority/escalations') : (window.location.hash = '/authority/escalations')}
          >
            🚨 SLA Escalation Center
          </Button>
          <Button
            variant="outline"
            icon={Map}
            onClick={() => onNavigate ? onNavigate('/authority/map') : (window.location.hash = '/authority/map')}
          >
            Sector Map View
          </Button>
        </div>
      </div>



      {/* Priority Queue Header */}
      <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>
        PRIORITY QUEUE ({issues.length} Issues)
      </h3>

      {issues.length === 0 ? (
        <EmptyState
          title="All Clear!"
          description="No civic issues currently require your department's attention."
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
          {issues.map((issue) => {
            const isCritical = issue.severity === 'CRITICAL' || issue.priorityLevel === 'CRITICAL' || issue.priority >= 90;
            return (
              <div
                key={issue.issueId || issue.id}
                className="card-container"
                style={{
                  borderLeft: `5px solid ${isCritical ? 'var(--priority-critical)' : 'var(--color-border-default)'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-4)'
                }}
              >
                {/* Header: Priority & ID */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <PriorityBadge priority={issue.severity || issue.priorityLevel || 'HIGH'} />
                  <span style={{ fontFamily: 'monospace', color: 'var(--color-text-tertiary)', fontWeight: 800, fontSize: 'var(--font-xs)' }}>
                    {issue.issueId || issue.id}
                  </span>
                </div>

                {/* Title & Status */}
                <div>
                  <h4 style={{ fontSize: 'var(--font-md)', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '4px', lineHeight: 1.3 }}>
                    {issue.title}
                  </h4>
                  <StatusBadge status={issue.status} />
                </div>

                {/* Location & Department */}
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '2px', borderTop: '1px solid var(--color-border-subtle)', paddingTop: 'var(--space-2)' }}>
                  <div>📍 {issue.location?.area || 'Sector 14'}</div>
                  <div style={{ color: 'var(--color-brand-primary)', fontWeight: 600 }}>{issue.department}</div>
                </div>

                {/* Community Context & Worker */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 'var(--font-xs)', backgroundColor: 'var(--color-bg-surface-hover)', padding: '6px 10px', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Supporters: <strong>{issue.supporters || 1}</strong></span>
                    <span style={{ color: 'var(--status-verified)' }}>Volunteers: <strong>{issue.volunteers || 0}</strong></span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ display: 'block', fontSize: '9px', color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>ASSIGNED WORKER</span>
                    {issue.assignedWorker ? (
                      <strong style={{ color: 'var(--color-text-primary)' }}>{issue.assignedWorker.name}</strong>
                    ) : (
                      <span style={{ color: 'var(--priority-critical)', fontWeight: 700 }}>Unassigned</span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Eye}
                    onClick={() => onNavigate ? onNavigate(`/authority/issues/${issue.issueId || issue.id}`) : (window.location.hash = `/authority/issues/${issue.issueId || issue.id}`)}
                    style={{ flex: 1 }}
                  >
                    REVIEW
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={UserCheck}
                    onClick={() => onNavigate ? onNavigate(`/authority/issues/${issue.issueId || issue.id}`) : (window.location.hash = `/authority/issues/${issue.issueId || issue.id}`)}
                    style={{ flex: 1 }}
                  >
                    ASSIGN
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Field Worker Accountability & Audit Scoreboard */}
      <WorkerAuditScoreboard
        onNavigate={onNavigate}
        externalModalOpen={isCreateWorkerModalOpen}
        onExternalModalClose={() => setIsCreateWorkerModalOpen(false)}
      />
    </div>
  );
};
