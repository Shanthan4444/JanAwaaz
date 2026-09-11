import React from 'react';
import { NotificationItem } from './NotificationItem';
import { CheckCheck, BellOff, ArrowRight } from 'lucide-react';

export const NotificationPanel = ({ notifications = [], onSelect, onMarkAllRead, onViewAll, onClose }) => {
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div
      className="animate-slide-up"
      style={{
        position: 'absolute',
        top: '110%',
        right: 0,
        width: '360px',
        maxWidth: '92vw',
        backgroundColor: 'var(--color-bg-surface-elevated)',
        border: '1px solid var(--color-border-default)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-xl)',
        zIndex: 300,
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--color-bg-surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h3 style={{ fontSize: 'var(--font-xs)', fontWeight: 900, color: 'var(--color-text-primary)', letterSpacing: '0.05em' }}>
            NOTIFICATIONS
          </h3>
          {unreadCount > 0 && (
            <span className="badge" style={{ backgroundColor: 'var(--color-brand-primary)', color: '#FFF', fontSize: '10px' }}>
              {unreadCount} UNREAD
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            style={{ background: 'none', border: 'none', color: 'var(--color-brand-primary)', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div style={{ maxHeight: '360px', overflowY: 'auto', padding: 'var(--space-2)' }}>
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-tertiary)' }}>
            <BellOff size={28} style={{ margin: '0 auto var(--space-2)', opacity: 0.6 }} />
            <p style={{ fontSize: 'var(--font-xs)', fontWeight: 700 }}>You're all caught up!</p>
            <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>No new civic notifications.</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification._id || notification.id}
                notification={notification}
                onSelect={(item) => {
                  if (onSelect) onSelect(item);
                  if (onClose) onClose();
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: 'var(--space-2) var(--space-3)', borderTop: '1px solid var(--color-border-subtle)', textAlign: 'center', backgroundColor: 'var(--color-bg-surface)' }}>
        <button
          onClick={() => {
            if (onViewAll) onViewAll();
            if (onClose) onClose();
          }}
          style={{ background: 'none', border: 'none', color: 'var(--color-brand-primary)', fontSize: 'var(--font-xs)', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
        >
          VIEW ALL NOTIFICATIONS <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
};
