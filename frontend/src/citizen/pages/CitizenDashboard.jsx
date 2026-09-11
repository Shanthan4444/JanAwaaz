import React, { useState, useEffect } from 'react';
import { citizenApi } from '../../services/api/citizenApi';
import { PriorityBadge } from '../../shared/components/PriorityBadge';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { Button } from '../../shared/components/Button';
import { Card } from '../../shared/components/Card';
import { useAuth } from '../../services/auth/AuthProvider';
import { Award, ArrowRight, CheckCircle2, AlertCircle, RefreshCw, PlusCircle, ShieldAlert } from 'lucide-react';

export const CitizenDashboard = ({ onNavigate }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  const loadData = async () => {
    setLoading(true);
    try {
      const [profData, issueList] = await Promise.all([
        citizenApi.getProfile().catch(() => null),
        citizenApi.getIssues()
      ]);
      if (profData) setProfile(profData);
      setIssues(issueList || []);
    } catch (err) {
      console.error('[CITIZEN DASHBOARD ERROR]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const verificationNeededIssues = issues.filter(
    (i) => i.status === 'RESOLVED' || i.status === 'CITIZEN_VERIFICATION'
  );

  const getFilteredIssues = () => {
    if (activeTab === 'Needs Verification') {
      return verificationNeededIssues;
    }
    if (activeTab === 'Active') {
      return issues.filter((i) => ['REPORTED', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS'].includes(i.status));
    }
    if (activeTab === 'Closed') {
      return issues.filter((i) => i.status === 'CLOSED');
    }
    if (activeTab === 'Reopened') {
      return issues.filter((i) => i.status === 'REOPENED');
    }
    return issues;
  };

  const filteredIssues = getFilteredIssues();

  return (
    <div className="container" style={{ maxWidth: '800px', paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-12)' }}>
      {/* Citizen Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 900, color: 'var(--color-text-primary)' }}>
            MY CIVIC REPORTS
          </h1>
          <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            Signed in as <strong>{user?.name || 'Citizen'}</strong> ({user?.mobile || 'Verified Mobile'})
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={PlusCircle}
          onClick={() => onNavigate ? onNavigate('/report') : (window.location.hash = '/report')}
        >
          REPORT NEW ISSUE
        </Button>
      </div>

      {/* Dynamic Active Emergency Civic Alerts (Only rendered when real critical issues exist) */}
      {issues.filter(i => i.severity === 'CRITICAL' || i.priorityLevel === 'CRITICAL' || i.severity === 'EMERGENCY').length > 0 && (
        <div style={{
          backgroundColor: 'var(--status-reopened-bg)',
          border: '1.5px solid var(--status-reopened)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-4)',
          marginBottom: 'var(--space-6)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-reopened)', fontWeight: 800, fontSize: 'var(--font-xs)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-3)' }}>
            <ShieldAlert size={16} />
            <span>Active Emergency Civic Alerts</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {issues.filter(i => i.severity === 'CRITICAL' || i.priorityLevel === 'CRITICAL' || i.severity === 'EMERGENCY').map(i => (
              <div key={i.issueId || i._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 'var(--font-xs)', borderBottom: '1px solid rgba(217, 83, 79, 0.1)', paddingBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ color: 'var(--color-text-primary)' }}>🚨 <strong>{i.category}:</strong> {i.title}</span>
                <StatusBadge status={i.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prominent Verification Required Banner */}
      {verificationNeededIssues.length > 0 && (
        <Card
          style={{
            backgroundColor: 'var(--status-verification-bg)',
            border: '1.5px solid var(--status-verification)',
            marginBottom: 'var(--space-6)',
            padding: 'var(--space-4)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div style={{ padding: '8px', borderRadius: '50%', backgroundColor: 'var(--status-verification)', color: '#FFF' }}>
                <Award size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                  ACTION REQUIRED: VERIFY RESOLUTION ({verificationNeededIssues.length})
                </h3>
                <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  Field work was completed. Inspect proof photos and confirm if the issue is actually fixed.
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => {
                const firstId = verificationNeededIssues[0].issueId || verificationNeededIssues[0]._id;
                onNavigate ? onNavigate(`/track/${firstId}`) : (window.location.hash = `/track/${firstId}`);
              }}
            >
              REVIEW FIX & CONFIRM
            </Button>
          </div>
        </Card>
      )}

      {/* Stats Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
        <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--color-text-tertiary)' }}>TOTAL REPORTED</span>
          <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 900, color: 'var(--color-text-primary)', marginTop: '2px' }}>{issues.length}</h2>
        </div>
        <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--color-text-tertiary)' }}>NEEDS VERIFICATION</span>
          <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 900, color: 'var(--color-brand-primary)', marginTop: '2px' }}>{verificationNeededIssues.length}</h2>
        </div>
        <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--color-text-tertiary)' }}>CLOSED & FIXED</span>
          <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 900, color: 'var(--color-status-success)', marginTop: '2px' }}>{issues.filter(i => i.status === 'CLOSED').length}</h2>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', overflowX: 'auto' }}>
        {['All', 'Needs Verification', 'Active', 'Closed', 'Reopened'].map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                backgroundColor: isActive ? 'var(--color-brand-primary)' : 'var(--color-bg-surface-elevated)',
                color: isActive ? '#FFF' : 'var(--color-text-secondary)',
                fontWeight: isActive ? 800 : 600,
                fontSize: 'var(--font-xs)',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Issues List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-text-tertiary)' }}>
          <RefreshCw size={28} className="spin" style={{ margin: '0 auto var(--space-2)' }} />
          <p style={{ fontSize: 'var(--font-xs)', fontWeight: 700 }}>Loading your reported issues...</p>
        </div>
      ) : filteredIssues.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <AlertCircle size={32} style={{ color: 'var(--color-text-tertiary)', margin: '0 auto var(--space-2)' }} />
          <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            No issues found in '{activeTab}'
          </h3>
          <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Report a new civic issue to track repair progress and provide final verification.
          </p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {filteredIssues.map((issue) => {
            const isNeedVerify = issue.status === 'RESOLVED' || issue.status === 'CITIZEN_VERIFICATION';
            return (
              <div
                key={issue.issueId || issue._id}
                className="card-container"
                style={{
                  padding: 'var(--space-4)',
                  borderLeft: `4px solid ${isNeedVerify ? 'var(--color-brand-primary)' : 'var(--color-border-default)'}`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                    <PriorityBadge priority={issue.severity || 'HIGH'} />
                    <StatusBadge status={issue.status} />
                  </div>
                  <span style={{ fontSize: 'var(--font-xs)', fontFamily: 'monospace', color: 'var(--color-text-tertiary)', fontWeight: 800 }}>
                    {issue.issueId}
                  </span>
                </div>

                <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  {issue.title}
                </h3>
                <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: 'var(--space-3)' }}>
                  {issue.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--color-border-subtle)', paddingTop: 'var(--space-3)', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
                    📍 {issue.location?.area} {issue.location?.landmark ? `(${issue.location.landmark})` : ''}
                  </span>

                  <Button
                    variant={isNeedVerify ? 'success' : 'outline'}
                    size="sm"
                    icon={ArrowRight}
                    iconPosition="right"
                    onClick={() => onNavigate ? onNavigate(`/track/${issue.issueId}`) : (window.location.hash = `/track/${issue.issueId}`)}
                  >
                    {isNeedVerify ? 'VERIFY FIX NOW' : 'TRACK PROGRESS'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
