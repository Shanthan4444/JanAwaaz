import React, { useState, useEffect } from 'react';
import { MapPin, ArrowRight, Users } from 'lucide-react';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { Button } from './Button';
import { Card } from './Card';
import { resolveImageUrl } from '../utils/imageUtils';

// Persistent affects-me-too votes stored in localStorage
const STORAGE_KEY = 'janawaaz_affects_me_too';

const getVoteStore = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
};
const setVoteStore = (store) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); } catch {}
};

export const IssueCard = ({ issue, onNavigateTrack, onAffectsMeToo }) => {
  if (!issue) return null;

  const [affectsCount, setAffectsCount] = useState(issue.affectsMeToo || 0);
  const [hasVoted, setHasVoted] = useState(false);
  const [voting, setVoting] = useState(false);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    const store = getVoteStore();
    if (store[issue.id]) {
      setHasVoted(true);
      setAffectsCount(store[issue.id]);
    } else {
      setAffectsCount(issue.affectsMeToo || 0);
      setHasVoted(false);
    }
  }, [issue.id]); // intentionally omit issue.affectsMeToo — IssueCard owns count after mount

  const handleAffectsMeToo = async (e) => {
    e.stopPropagation();
    if (voting) return;

    // Micro-animation: press feedback
    setPressed(true);
    setTimeout(() => setPressed(false), 200);

    setVoting(true);
    const store = getVoteStore();

    if (hasVoted) {
      // --- UN-VOTE: toggle off ---
      const newCount = Math.max(0, affectsCount - 1);
      delete store[issue.id];
      setVoteStore(store);
      setAffectsCount(newCount);
      setHasVoted(false);
      if (onAffectsMeToo) {
        try { await onAffectsMeToo(issue.id, newCount, false); } catch {}
      }
    } else {
      // --- VOTE: toggle on ---
      const newCount = affectsCount + 1;
      store[issue.id] = newCount;
      setVoteStore(store);
      setAffectsCount(newCount);
      setHasVoted(true);
      if (onAffectsMeToo) {
        try { await onAffectsMeToo(issue.id, newCount, true); } catch {}
      }
    }

    setVoting(false);
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const h = Math.floor(diff / 3600000);
    const m = Math.floor(diff / 60000);
    if (h >= 24) return `${Math.floor(h / 24)}d ago`;
    if (h >= 1) return `${h}h ago`;
    return `${m}m ago`;
  };

  return (
    <Card className="animate-slide-up" style={{ transition: 'box-shadow 0.2s', cursor: 'default' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>

        {/* Top row: image + content */}
        <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
          {issue.evidence && issue.evidence.length > 0 && (
            <img
              src={resolveImageUrl(issue.evidence[0])}
              alt={issue.title}
              style={{
                width: '88px',
                height: '88px',
                borderRadius: 'var(--radius-md)',
                objectFit: 'cover',
                border: '1px solid var(--color-border-subtle)',
                flexShrink: 0
              }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-1)' }}>
              <PriorityBadge priority={issue.priorityLevel || 'HIGH'} />
              <StatusBadge status={issue.status} />
              {issue.reportedAt && (
                <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginLeft: 'auto' }}>
                  {timeAgo(issue.reportedAt)}
                </span>
              )}
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

        {/* Location + Dept row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', paddingTop: 'var(--space-2)', borderTop: '1px solid var(--color-border-subtle)', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
            <MapPin size={13} style={{ color: 'var(--color-brand-primary)', flexShrink: 0 }} />
            <span>{typeof issue.location === 'string' ? issue.location : `${issue.location?.area || ''}, ${issue.location?.landmark || ''}`}</span>
            {issue.distanceText && (
              <span style={{ color: 'var(--color-brand-primary)', fontWeight: 700, marginLeft: '2px' }}>· {issue.distanceText}</span>
            )}
          </div>
          <span style={{ fontWeight: 600, color: 'var(--color-text-tertiary)' }}>{issue.department}</span>
        </div>

        {/* Action row: Affects Me Too + Track */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          {/* Affects Me Too */}
          <button
            id={`affects-me-too-${issue.id}`}
            onClick={handleAffectsMeToo}
            disabled={voting}
            title={hasVoted ? 'Click to remove your vote' : 'This affects me too! Click to vote'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: 'var(--radius-full)',
              border: `1.5px solid ${hasVoted ? 'var(--color-brand-primary)' : 'var(--color-border-default)'}`,
              backgroundColor: hasVoted ? 'var(--color-brand-subtle)' : 'transparent',
              color: hasVoted ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
              fontSize: 'var(--font-xs)',
              fontWeight: 800,
              cursor: voting ? 'wait' : 'pointer',
              transition: 'all 0.18s ease',
              flexShrink: 0,
              whiteSpace: 'nowrap',
              transform: pressed ? 'scale(0.93)' : 'scale(1)',
              userSelect: 'none'
            }}
          >
            <Users size={13} />
            {hasVoted ? '✓ Affects Me Too' : 'Affects Me Too'}
            <span
              style={{
                backgroundColor: hasVoted ? 'var(--color-brand-primary)' : 'var(--color-bg-surface-elevated)',
                color: hasVoted ? '#fff' : 'var(--color-text-primary)',
                borderRadius: 'var(--radius-full)',
                padding: '1px 7px',
                fontSize: '11px',
                fontWeight: 900,
                minWidth: '24px',
                textAlign: 'center',
                transition: 'all 0.18s ease'
              }}
            >
              {affectsCount}
            </span>
          </button>

          {/* Track button */}
          <Button
            variant="outline"
            size="sm"
            icon={ArrowRight}
            iconPosition="right"
            onClick={() => {
              if (onNavigateTrack) onNavigateTrack(issue.id);
              else window.location.hash = `/track/${issue.id}`;
            }}
            style={{ flex: 1, borderColor: 'var(--color-border-default)', fontWeight: 700 }}
          >
            Track Progress
          </Button>
        </div>
      </div>
    </Card>
  );
};
