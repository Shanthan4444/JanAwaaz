import React from 'react';
import { ThumbsUp, Users, MapPin, ArrowRight } from 'lucide-react';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { Button } from './Button';
import { Card } from './Card';
import { communityApi } from '../../services/api/communityApi';

export const IssueCard = ({ issue, onNavigateTrack }) => {
  if (!issue) return null;

  const handleSupport = async (e) => {
    e.stopPropagation();
    try {
      await communityApi.supportIssue(issue.issueId || issue.id || issue._id);
      if (issue.supporters !== undefined) issue.supporters += 1;
    } catch (err) {
      console.warn('[SUPPORT ISSUE WARN]', err.message);
    }
  };

  const handleVolunteer = async (e) => {
    e.stopPropagation();
    try {
      await communityApi.volunteer(issue.issueId || issue.id || issue._id);
      if (issue.volunteers !== undefined) issue.volunteers += 1;
    } catch (err) {
      console.warn('[VOLUNTEER WARN]', err.message);
    }
  };

  return (
    <Card className="animate-slide-up">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
          {issue.evidence && issue.evidence.length > 0 && (
            <img
              src={issue.evidence[0]}
              alt={issue.title}
              style={{
                width: '96px',
                height: '96px',
                borderRadius: 'var(--radius-md)',
                objectFit: 'cover',
                border: '1px solid var(--color-border-subtle)',
                flexShrink: 0
              }}
            />
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-2)' }}>
              <PriorityBadge priority={issue.priorityLevel || 'HIGH'} />
              <StatusBadge status={issue.status} />
              <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-tertiary)', marginLeft: 'auto', fontFamily: 'monospace', fontWeight: 800 }}>
                {issue.id}
              </span>
            </div>

            <h3
              style={{
                fontSize: 'var(--font-md)',
                fontWeight: 800,
                color: 'var(--color-text-primary)',
                lineHeight: 1.3,
                marginBottom: 'var(--space-1)',
                cursor: 'pointer'
              }}
              onClick={() => onNavigateTrack && onNavigateTrack(issue.id)}
            >
              {issue.title}
            </h3>

            <p
              style={{
                fontSize: 'var(--font-xs)',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.4,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {issue.description}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', paddingTop: 'var(--space-2)', borderTop: '1px solid var(--color-border-subtle)', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
            <MapPin size={14} style={{ color: 'var(--color-brand-primary)' }} />
            <span>{typeof issue.location === 'string' ? issue.location : `${issue.location?.area || 'Sector 14'}, ${issue.location?.landmark || ''}`}</span>
            <span style={{ color: 'var(--color-text-tertiary)' }}>({issue.distanceText || '420m away'})</span>
          </div>

          <div>
            <span>Dept: <strong style={{ color: 'var(--color-text-primary)' }}>{issue.department}</strong></span>
          </div>
        </div>

        {/* Visual Community Support Area ("Affects Me Too" Signature feature) */}
        <div style={{
          backgroundColor: 'var(--color-bg-surface-hover)',
          border: '1px solid var(--color-border-default)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-3) var(--space-4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>❤️</span>
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Community Impact
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '2px 0' }}>
                <div style={{
                  width: '90px',
                  height: '6px',
                  backgroundColor: 'var(--color-border-default)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${Math.min(100, (issue.supporters / 40) * 100)}%`,
                    height: '100%',
                    backgroundColor: 'var(--color-text-primary)',
                    borderRadius: 'var(--radius-full)'
                  }} />
                </div>
                <strong style={{ fontSize: '11px', color: 'var(--color-text-primary)' }}>
                  {issue.supporters} Affected
                </strong>
              </div>
              <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>
                {issue.volunteers > 0 ? `✓ ${issue.volunteers} Volunteers active` : 'Join the civic movement'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button
              onClick={handleSupport}
              style={{
                backgroundColor: 'var(--color-bg-surface-elevated)',
                border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all var(--transition-fast)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-surface-hover)';
                e.currentTarget.style.borderColor = 'var(--color-border-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-surface-elevated)';
                e.currentTarget.style.borderColor = 'var(--color-border-default)';
              }}
            >
              Affects Me Too
            </button>
            <button
              onClick={handleVolunteer}
              style={{
                backgroundColor: 'var(--color-text-primary)',
                border: '1px solid var(--color-text-primary)',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: 700,
                color: '#FFFFFF',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all var(--transition-fast)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-brand-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-text-primary)';
              }}
            >
              Volunteer
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px' }}>
          <Button
            variant="outline"
            size="sm"
            icon={ArrowRight}
            iconPosition="right"
            onClick={() => {
              if (onNavigateTrack) onNavigateTrack(issue.id);
              else window.location.hash = `/track/${issue.id}`;
            }}
            style={{ width: '100%', borderColor: 'var(--color-border-default)', fontWeight: 700 }}
          >
            Track Resolution Progress
          </Button>
        </div>
      </div>
    </Card>
  );
};
