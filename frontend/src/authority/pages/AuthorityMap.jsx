import React, { useState, useEffect } from 'react';
import { MapContainer } from '../../shared/components/MapContainer';
import { Button } from '../../shared/components/Button';
import { LoadingState } from '../../shared/components/LoadingState';
import { authorityApi } from '../../services/api/authorityApi';
import { Map, ArrowLeft, Shield } from 'lucide-react';

export const AuthorityMap = ({ onNavigate }) => {
  const [issues, setIssues] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMapData = async () => {
      setLoading(true);
      try {
        const data = await authorityApi.getMapIssues();
        setIssues(data);
      } catch (err) {
        console.error('[AUTHORITY MAP ERROR]', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMapData();
  }, []);

  const filteredIssues = issues.filter((i) => {
    if (filter === 'Critical') return i.severity === 'CRITICAL' || i.priority >= 90;
    if (filter === 'High') return i.severity === 'HIGH' || (i.priority >= 80 && i.priority < 90);
    if (filter === 'In Progress') return i.status === 'IN_PROGRESS' || i.status === 'ASSIGNED';
    if (filter === 'Resolved') return i.status === 'RESOLVED' || i.status === 'CLOSED';
    return true;
  });

  return (
    <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Map size={24} style={{ color: 'var(--color-brand-primary)' }} />
            <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 900, color: 'var(--color-text-primary)' }}>
              AUTHORITY SECTOR HEATMAP
            </h1>
          </div>
          <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
            Spatial visualization of open civic issues in MongoDB color-coded by priority score and status
          </p>
        </div>

        <Button variant="secondary" icon={ArrowLeft} onClick={() => onNavigate ? onNavigate('/authority') : (window.location.hash = '/authority')}>
          Back to Dashboard
        </Button>
      </div>

      {/* Map Filter Controls */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', overflowX: 'auto' }}>
        {['All', 'Critical', 'High', 'In Progress', 'Resolved'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: filter === f ? 'var(--color-brand-primary)' : 'var(--color-bg-surface-elevated)',
              color: filter === f ? '#FFFFFF' : 'var(--color-text-secondary)',
              border: '1px solid var(--color-border-default)',
              fontSize: 'var(--font-xs)',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState message="Loading sector heatmap coordinates..." />
      ) : (
        <MapContainer
          issues={filteredIssues}
          height="560px"
          onSelectIssue={(issue) => {
            if (onNavigate) onNavigate(`/authority/issues/${issue.issueId || issue.id}`);
            else window.location.hash = `/authority/issues/${issue.issueId || issue.id}`;
          }}
        />
      )}
    </div>
  );
};
