import React from 'react';
import { MapPin, ArrowRight } from 'lucide-react';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { Button } from './Button';
import { Card } from './Card';
import { resolveImageUrl } from '../utils/imageUtils';

export const IssueCard = ({ issue, onNavigateTrack }) => {
  if (!issue) return null;

  return (
    <Card className="animate-slide-up">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
          {issue.evidence && issue.evidence.length > 0 && (
            <img
              src={resolveImageUrl(issue.evidence[0])}
              alt={issue.title}
              style={{
                width: '96px',
                height: '96px',
                borderRadius: 'var(--radius-md)',
                objectFit: 'cover',
                border: '1px solid var(--color-border-subtle)',
                flexShrink: 0
              }}
              onError={(e) => { e.target.style.display = 'none'; }}
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

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
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
