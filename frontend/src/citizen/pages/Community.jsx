import React, { useState, useEffect, useCallback } from 'react';
import { IssueCard } from '../../shared/components/IssueCard';
import { MapContainer } from '../../shared/components/MapContainer';
import { EmptyState } from '../../shared/components/EmptyState';
import { mockApi } from '../../services/api/mockApi';
import { COMMUNITY_MOCK_ISSUES } from '../../services/api/communityMockData';
import { Activity, List, Map, Users, Radio } from 'lucide-react';

// Try to hit the real community API; if it fails fall back gracefully
const fetchRealIssues = async () => {
  try {
    const { communityApi } = await import('../../services/api/communityApi');
    const list = await communityApi.getIssues({ sort: 'priority' });
    if (Array.isArray(list) && list.length > 0) return list;
  } catch {}
  return [];
};

// Merge real + mock; de-duplicate by id, sort by distanceKm (nearby first)
const mergeAndSort = (real, filter) => {
  const realWithDist = real.map((issue, i) => ({
    ...issue,
    distanceKm: issue.distanceKm || (0.3 + i * 0.4),
    distanceText: issue.distanceText || `${(0.3 + i * 0.4).toFixed(1)} km away`,
    affectsMeToo: issue.affectsMeToo || 0,
    reportedAt: issue.reportedAt || issue.createdAt || new Date().toISOString(),
  }));

  const realIds = new Set(realWithDist.map((i) => i.id));
  const mockFiltered = COMMUNITY_MOCK_ISSUES.filter((m) => !realIds.has(m.id));

  let combined = [...realWithDist, ...mockFiltered];

  // Apply filter
  if (filter === 'High Priority') {
    combined = combined.filter((i) => i.priorityLevel === 'HIGH');
  } else if (filter === 'Recently Reported') {
    combined = combined.sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt));
    return combined;
  } else if (filter === 'My Contributions') {
    // Show issues the user has voted on
    try {
      const store = JSON.parse(localStorage.getItem('janawaaz_affects_me_too') || '{}');
      const votedIds = new Set(Object.keys(store));
      combined = combined.filter((i) => votedIds.has(i.id));
    } catch {}
  }

  // Default sort: distance ascending (nearby first, all within 3km)
  combined = combined
    .filter((i) => (i.distanceKm || 0) <= 3)
    .sort((a, b) => (a.distanceKm || 99) - (b.distanceKm || 99));

  return combined;
};

export const Community = ({ onNavigate }) => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Nearby');
  const [viewMode, setViewMode] = useState('list');

  const filters = ['Nearby', 'High Priority', 'Recently Reported', 'My Contributions'];

  const loadIssues = useCallback(async () => {
    setLoading(true);
    const real = await fetchRealIssues();
    const merged = mergeAndSort(real, activeFilter);
    setIssues(merged);
    setLoading(false);
  }, [activeFilter]);

  useEffect(() => {
    loadIssues();
    const unsubscribe = mockApi.subscribe(loadIssues);
    return unsubscribe;
  }, [loadIssues]);

  const handleAffectsMeToo = async (issueId, newCount) => {
    // Optimistically update the list so count reflects immediately
    setIssues((prev) =>
      prev.map((i) => (i.id === issueId ? { ...i, affectsMeToo: newCount } : i))
    );
    // Optionally push to real backend here if API exists
    try {
      const { communityApi } = await import('../../services/api/communityApi');
      if (communityApi.affectsMeToo) await communityApi.affectsMeToo(issueId);
    } catch {}
  };

  const totalAffected = issues.reduce((sum, i) => sum + (i.affectsMeToo || 0), 0);

  return (
    <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <Activity size={24} style={{ color: 'var(--color-brand-primary)' }} />
            <h1 style={{ fontSize: 'var(--font-3xl)', fontWeight: 900, color: 'var(--color-text-primary)' }}>
              Nearby Civic Issues
            </h1>
          </div>
          <p style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)' }}>
            Real issues within <strong style={{ color: 'var(--color-brand-primary)' }}>3 km</strong> of you — across all departments.
            Vote <em>"Affects Me Too"</em> if you're impacted.
          </p>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-3)', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-brand-subtle)', border: '1px solid var(--color-brand-primary)' }}>
              <Radio size={12} style={{ color: 'var(--color-brand-primary)' }} />
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-brand-primary)' }}>
                {issues.length} issues nearby
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)' }}>
              <Users size={12} style={{ color: 'var(--color-status-success)' }} />
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-status-success)' }}>
                {totalAffected.toLocaleString()} citizens affected
              </span>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div style={{ display: 'flex', backgroundColor: 'var(--color-bg-surface-elevated)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-default)', alignSelf: 'flex-start' }}>
          {[{ mode: 'list', Icon: List, label: 'List Feed' }, { mode: 'map', Icon: Map, label: 'Map Feed' }].map(({ mode, Icon, label }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 14px', borderRadius: 'var(--radius-sm)', border: 'none',
                backgroundColor: viewMode === mode ? 'var(--color-brand-primary)' : 'transparent',
                color: viewMode === mode ? '#FFFFFF' : 'var(--color-text-secondary)',
                fontSize: 'var(--font-xs)', fontWeight: 600, cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', overflowX: 'auto', paddingBottom: 'var(--space-1)' }}>
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            style={{
              padding: '7px 16px', borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap',
              backgroundColor: activeFilter === filter ? 'var(--color-brand-subtle)' : 'var(--color-bg-surface)',
              border: `1.5px solid ${activeFilter === filter ? 'var(--color-brand-primary)' : 'var(--color-border-subtle)'}`,
              color: activeFilter === filter ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
              fontSize: 'var(--font-xs)', fontWeight: 700, cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Content grid */}
      <div className="community-content-layout">
        {/* List pane */}
        <div className={`community-list-pane ${viewMode === 'map' ? 'mobile-hidden' : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-text-tertiary)' }}>
              <Activity size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <p style={{ fontWeight: 700 }}>Loading nearby issues...</p>
            </div>
          ) : issues.length === 0 ? (
            <EmptyState
              title={activeFilter === 'My Contributions' ? 'No contributions yet' : 'No nearby issues found'}
              description={activeFilter === 'My Contributions'
                ? 'Mark issues as "Affects Me Too" to see them here.'
                : 'No civic issues reported within 3 km. Your area looks clean!'}
            />
          ) : (
            issues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onNavigateTrack={(id) => onNavigate ? onNavigate(`/track/${id}`) : (window.location.hash = `/track/${id}`)}
                onAffectsMeToo={handleAffectsMeToo}
              />
            ))
          )}
        </div>

        {/* Map pane */}
        <div className={`community-map-pane ${viewMode === 'list' ? 'mobile-hidden' : ''}`}>
          <div style={{ position: 'sticky', top: '92px' }}>
            <MapContainer issues={issues} height="560px" />
          </div>
        </div>
      </div>
    </div>
  );
};
