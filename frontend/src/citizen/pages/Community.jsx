import React, { useState, useEffect } from 'react';
import { IssueCard } from '../../shared/components/IssueCard';
import { MapContainer } from '../../shared/components/MapContainer';
import { Button } from '../../shared/components/Button';
import { EmptyState } from '../../shared/components/EmptyState';
import { Modal } from '../../shared/components/Modal';
import { mockApi } from '../../services/api/mockApi';
import { Filter, Map, List, Activity, Users, Award, CheckCircle2 } from 'lucide-react';

export const Community = ({ onNavigate }) => {
  const [issues, setIssues] = useState([]);
  const [activeFilter, setActiveFilter] = useState('Nearby');
  const [viewMode, setViewMode] = useState('list');
  const [volunteerSuccessModal, setVolunteerSuccessModal] = useState(false);

  const filters = [
    'Nearby',
    'High Priority',
    'Needs Volunteers',
    'Recently Reported',
    'My Contributions'
  ];

  const fetchIssues = async () => {
    try {
      const { communityApi } = await import('../../services/api/communityApi');
      const sortParam = activeFilter === 'High Priority' ? 'priority' : activeFilter === 'Recently Reported' ? 'recent' : 'priority';
      const realList = await communityApi.getIssues({ sort: sortParam });
      if (realList && Array.isArray(realList) && realList.length > 0) {
        setIssues(realList);
        return;
      }
    } catch (e) {
      console.warn('[COMMUNITY FEED] Real API fetch failed, falling back to mock...', e);
    }
    const res = await mockApi.getIssues(activeFilter);
    setIssues(res);
  };

  useEffect(() => {
    fetchIssues();
    const unsubscribe = mockApi.subscribe(fetchIssues);
    return unsubscribe;
  }, [activeFilter]);

  const handleVolunteerAction = async (issueId) => {
    await mockApi.volunteerForIssue(issueId);
    setVolunteerSuccessModal(true);
  };

  return (
    <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-8)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Activity size={24} style={{ color: 'var(--color-brand-primary)' }} />
            <h1 style={{ fontSize: 'var(--font-3xl)', fontWeight: 900, color: 'var(--color-text-primary)' }}>
              Civic Activity Network
            </h1>
          </div>
          <p style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)' }}>
            Real-time community activity feed. Discover nearby issues, support, and volunteer.
          </p>
        </div>

        {/* View Toggle */}
        <div style={{ display: 'flex', backgroundColor: 'var(--color-bg-surface-elevated)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-default)' }}>
          <button
            onClick={() => setViewMode('list')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: viewMode === 'list' ? 'var(--color-brand-primary)' : 'transparent',
              color: viewMode === 'list' ? '#FFFFFF' : 'var(--color-text-secondary)',
              border: 'none',
              fontSize: 'var(--font-xs)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <List size={14} />
            List Feed
          </button>
          <button
            onClick={() => setViewMode('map')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: viewMode === 'map' ? 'var(--color-brand-primary)' : 'transparent',
              color: viewMode === 'map' ? '#FFFFFF' : 'var(--color-text-secondary)',
              border: 'none',
              fontSize: 'var(--font-xs)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Map size={14} />
            Map Feed
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-8)', overflowX: 'auto', paddingBottom: 'var(--space-2)' }}>
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: activeFilter === filter ? 'var(--color-brand-subtle)' : 'var(--color-bg-surface)',
              border: `1px solid ${activeFilter === filter ? 'var(--color-brand-primary)' : 'var(--color-border-subtle)'}`,
              color: activeFilter === filter ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
              fontSize: 'var(--font-xs)',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all var(--transition-fast)'
            }}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="community-content-layout">
        <div className={`community-list-pane ${viewMode === 'map' ? 'mobile-hidden' : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {issues.length === 0 ? (
            <EmptyState
              title="No issues found"
              description={`There are currently no active civic issues matching "${activeFilter}".`}
            />
          ) : (
            issues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onNavigateTrack={(id) => onNavigate ? onNavigate(`/track/${id}`) : (window.location.hash = `/track/${id}`)}
              />
            ))
          )}
        </div>
        <div className={`community-map-pane ${viewMode === 'list' ? 'mobile-hidden' : ''}`}>
          <div style={{ position: 'sticky', top: '92px' }}>
            <MapContainer issues={issues} height="560px" />
          </div>
        </div>
      </div>

      {/* Volunteer Confirmation Modal */}
      <Modal isOpen={volunteerSuccessModal} onClose={() => setVolunteerSuccessModal(false)} title="Volunteer Confirmation">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 'var(--space-4)', padding: 'var(--space-2)' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--status-resolved)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: 900, color: 'var(--color-text-primary)' }}>
              YOU'RE IN!
            </h3>
            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              You’re now helping this issue move forward.
            </p>
            <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--status-resolved)', marginTop: 'var(--space-3)' }}>
              +10 Civic Impact Points Awarded
            </span>
          </div>
          <Button variant="primary" onClick={() => setVolunteerSuccessModal(false)}>
            Continue Exploring
          </Button>
        </div>
      </Modal>
    </div>
  );
};
