import React, { useState, useEffect } from 'react';
import { notificationsApi } from '../../../services/api/notificationsApi';
import { NotificationItem } from './NotificationItem';
import { Card } from '../Card';
import { Button } from '../Button';
import { useAuth, ROLES } from '../../../services/auth/AuthProvider';
import { Bell, CheckCheck, RefreshCw, BellOff } from 'lucide-react';

export const NotificationPage = ({ onNavigate }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All'); // 'All' | 'Unread'

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationsApi.getNotifications({
        unreadOnly: activeTab === 'Unread',
        limit: 50
      });
      setNotifications(res?.notifications || []);
    } catch (err) {
      console.error('[NOTIFICATION PAGE LOAD ERROR]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadNotifications();
  }, [user, activeTab]);

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error('[MARK ALL READ ERROR]', e);
    }
  };

  const handleSelect = async (notification) => {
    try {
      if (!notification.isRead) {
        await notificationsApi.markAsRead(notification._id || notification.id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notification._id ? { ...n, isRead: true } : n))
        );
      }
    } catch (e) {}

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

  return (
    <div className="container" style={{ maxWidth: '720px', paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Bell size={24} style={{ color: 'var(--color-brand-primary)' }} />
            <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 900, color: 'var(--color-text-primary)' }}>
              CIVIC NOTIFICATIONS
            </h1>
          </div>
          <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
            Real-time activity log for your reported, assigned, and managed civic issues.
          </p>
        </div>

        <Button variant="ghost" size="sm" icon={CheckCheck} onClick={handleMarkAllRead}>
          MARK ALL AS READ
        </Button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
        {['All', 'Unread'].map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '6px 16px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                backgroundColor: isActive ? 'var(--color-brand-primary)' : 'var(--color-bg-surface-elevated)',
                color: isActive ? '#FFF' : 'var(--color-text-secondary)',
                fontWeight: isActive ? 800 : 600,
                fontSize: 'var(--font-xs)',
                cursor: 'pointer'
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-text-tertiary)' }}>
          <RefreshCw size={28} className="spin" style={{ margin: '0 auto var(--space-2)' }} />
          <p style={{ fontSize: 'var(--font-xs)', fontWeight: 700 }}>Retrieving your notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <BellOff size={32} style={{ color: 'var(--color-text-tertiary)', margin: '0 auto var(--space-2)' }} />
          <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            You're all caught up!
          </h3>
          <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            No notifications found in '{activeTab}'.
          </p>
        </Card>
      ) : (
        <Card style={{ padding: 'var(--space-3)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification._id || notification.id}
                notification={notification}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
