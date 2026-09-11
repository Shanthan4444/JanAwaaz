import React from 'react';
import { Bell, CheckCircle2, AlertTriangle, Wrench, Shield, Award, Users, AlertCircle } from 'lucide-react';

export const NotificationItem = ({ notification, onSelect, onMarkRead }) => {
  const { _id, id, type, title, message, isRead, createdAt, issueId, priority } = notification;

  const getIcon = () => {
    switch (type) {
      case 'ISSUE_RECEIVED':
      case 'ISSUE_REPORTED':
        return <Bell size={16} style={{ color: 'var(--color-brand-primary)' }} />;
      case 'ISSUE_VERIFIED':
        return <Shield size={16} style={{ color: 'var(--status-verified)' }} />;
      case 'WORKER_ASSIGNED':
      case 'WORK_STARTED':
        return <Wrench size={16} style={{ color: 'var(--status-in-progress)' }} />;
      case 'VERIFICATION_REQUIRED':
      case 'ISSUE_RESOLVED':
        return <Award size={16} style={{ color: 'var(--color-brand-primary)' }} />;
      case 'ISSUE_CLOSED':
      case 'CITIZEN_VERIFIED':
        return <CheckCircle2 size={16} style={{ color: 'var(--status-resolved)' }} />;
      case 'ISSUE_REOPENED':
        return <AlertTriangle size={16} style={{ color: 'var(--color-status-danger)' }} />;
      case 'VOLUNTEER_REGISTERED':
      case 'COMMUNITY_ACTIVITY':
        return <Users size={16} style={{ color: 'var(--color-brand-primary)' }} />;
      default:
        return <AlertCircle size={16} style={{ color: 'var(--color-text-secondary)' }} />;
    }
  };

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return 'Just now';
    const diffMs = new Date() - new Date(dateStr);
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div
      onClick={() => onSelect ? onSelect(notification) : null}
      style={{
        padding: 'var(--space-3)',
        borderRadius: 'var(--radius-md)',
        backgroundColor: isRead ? 'transparent' : 'rgba(99, 102, 241, 0.08)',
        borderLeft: isRead ? '3px solid transparent' : `3px solid ${priority === 'CRITICAL' ? 'var(--color-status-danger)' : 'var(--color-brand-primary)'}`,
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
        display: 'flex',
        gap: 'var(--space-3)',
        alignItems: 'flex-start'
      }}
      className="notification-item-hover"
    >
      <div style={{ marginTop: '2px', padding: '6px', borderRadius: '50%', backgroundColor: 'var(--color-bg-surface-elevated)' }}>
        {getIcon()}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
          <h4 style={{ fontSize: 'var(--font-xs)', fontWeight: isRead ? 600 : 800, color: 'var(--color-text-primary)' }}>
            {title}
          </h4>
          <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>{getTimeAgo(createdAt)}</span>
        </div>

        <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.4, margin: 0 }}>
          {message}
        </p>

        {issueId && (
          <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--color-brand-primary)', fontWeight: 700, marginTop: '4px', display: 'inline-block' }}>
            ID: {issueId}
          </span>
        )}
      </div>
    </div>
  );
};
