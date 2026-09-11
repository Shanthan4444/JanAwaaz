import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { notificationsApi } from '../../../services/api/notificationsApi';
import { NotificationPanel } from './NotificationPanel';
import { useAuth, ROLES } from '../../../services/auth/AuthProvider';

export const NotificationBell = ({ onNavigate }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const panelRef = useRef(null);

  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      const res = await notificationsApi.getUnreadCount();
      if (res && typeof res.count === 'number') {
        setUnreadCount(res.count);
      }
    } catch (e) {
      // Quiet fail if not authenticated
    }
  };

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await notificationsApi.getNotifications({ limit: 15 });
      if (res && Array.isArray(res.notifications)) {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (e) {
      console.warn('[NOTIFICATION BELL FETCH ERROR]', e);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // 30s poll
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error('[MARK ALL READ ERROR]', e);
    }
  };

  const handleSelectNotification = async (notification) => {
    try {
      if (!notification.isRead) {
        await notificationsApi.markAsRead(notification._id || notification.id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notification._id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (e) {}

    // Navigate to role-specific issue detail
    if (notification.issueId) {
      const role = user?.role;
      let targetPath = `/track/${notification.issueId}`;

      if (role === ROLES.AUTHORITY) {
        targetPath = `/authority/issues/${notification.issueId}`;
      } else if (role === ROLES.WORKER) {
        targetPath = `/worker/tasks/${notification.issueId}`;
      }

      if (onNavigate) onNavigate(targetPath);
      else window.location.hash = targetPath;
    }
  };

  if (!user) return null;

  return (
    <div style={{ position: 'relative' }} ref={panelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          background: 'none',
          border: '1px solid var(--color-border-default)',
          borderRadius: 'var(--radius-md)',
          width: '38px',
          height: '38px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-primary)',
          backgroundColor: isOpen ? 'var(--color-brand-subtle)' : 'var(--color-bg-surface-elevated)',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)'
        }}
        title="Notifications"
      >
        <Bell size={18} style={{ color: isOpen ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)' }} />

        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              backgroundColor: 'var(--color-status-danger)',
              color: '#FFFFFF',
              fontSize: '10px',
              fontWeight: 900,
              minWidth: '16px',
              height: '16px',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              border: '2px solid var(--color-bg-surface-elevated)'
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationPanel
          notifications={notifications}
          onSelect={handleSelectNotification}
          onMarkAllRead={handleMarkAllRead}
          onViewAll={() => onNavigate ? onNavigate('/notifications') : (window.location.hash = '/notifications')}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
