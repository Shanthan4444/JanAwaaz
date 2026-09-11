import React from 'react';

export const STATUS_MAP = {
  REPORTED: { label: 'Reported', color: 'var(--status-reported)', bg: 'var(--status-reported-bg)', border: 'var(--color-brand-border)' },
  VERIFIED: { label: 'AI Verified', color: 'var(--status-verified)', bg: 'var(--status-verified-bg)', border: 'rgba(13, 148, 136, 0.25)' },
  ASSIGNED: { label: 'Assigned', color: 'var(--status-assigned)', bg: 'var(--status-assigned-bg)', border: 'rgba(79, 70, 229, 0.25)' },
  IN_PROGRESS: { label: 'In Progress', color: 'var(--status-in-progress)', bg: 'var(--status-in-progress-bg)', border: 'rgba(217, 119, 6, 0.25)', pulse: true },
  RESOLVED: { label: 'Resolved', color: 'var(--status-resolved)', bg: 'var(--status-resolved-bg)', border: 'rgba(22, 163, 74, 0.25)' },
  CITIZEN_VERIFICATION: { label: 'Citizen Verification', color: 'var(--status-verification)', bg: 'var(--status-verification-bg)', border: 'rgba(124, 58, 237, 0.25)', pulse: true },
  CLOSED: { label: 'Verified & Closed', color: 'var(--status-closed)', bg: 'var(--status-closed-bg)', border: 'rgba(71, 85, 105, 0.25)' },
  REOPENED: { label: 'Reopened', color: 'var(--status-reopened)', bg: 'var(--status-reopened-bg)', border: 'rgba(220, 38, 38, 0.25)' }
};

export const StatusBadge = ({ status = 'REPORTED', className = '' }) => {
  const config = STATUS_MAP[status] || STATUS_MAP.REPORTED;

  return (
    <span
      className={`badge ${className}`}
      style={{
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: config.color,
          display: 'inline-block',
          boxShadow: config.pulse ? `0 0 8px ${config.color}` : 'none',
          animation: config.pulse ? 'statusDotPulse 2s infinite ease-in-out' : 'none'
        }}
      />
      {config.label}
    </span>
  );
};
