import React, { useState } from 'react';
import { PlusCircle, Shield, User, Wrench, LogIn, LogOut, ChevronDown, Menu, X } from 'lucide-react';
import { useAuth, ROLES } from '../../services/auth/AuthProvider';
import { Button } from './Button';
import { NotificationBell } from './notifications/NotificationBell';
import { LanguageSelector } from './LanguageSelector';
import { ThemeToggle } from '../theme/ThemeToggle';
import { useTranslation } from '../i18n/LanguageContext';

import { MyIssuesAuthModal } from './MyIssuesAuthModal';

export const Navbar = ({ currentPath, onNavigate }) => {
  const { user, isAuthenticated, role, logout } = useAuth();
  const { t } = useTranslation();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMyIssuesModalOpen, setIsMyIssuesModalOpen] = useState(false);

  const navLinks = [];

  if (role === ROLES.AUTHORITY) {
    navLinks.push(
      { label: 'Command Center', path: '/authority' },
      { label: 'SLA Escalations', path: '/authority/escalations' },
      { label: 'GIS Map', path: '/authority/map' },
      { label: 'Analytics', path: '/authority/analytics' }
    );
  } else if (role === ROLES.DEPARTMENT_ADMIN) {
    navLinks.push(
      { label: 'Department Dashboard', path: '/department' },
      { label: 'Department Map', path: '/authority/map' }
    );
  } else if (role === ROLES.WORKER) {
    navLinks.push({ label: t('workerPortal'), path: '/worker' });
  } else {
    navLinks.push(
      { label: t('home'), path: '/' },
      { label: 'My Issues', path: '/citizen/issues' },
      { label: t('reportIssue'), path: '/report' },
      { label: t('communityFeed'), path: '/community' }
    );
  }

  const getLogoPath = () => {
    if (role === ROLES.AUTHORITY) return '/authority';
    if (role === ROLES.DEPARTMENT_ADMIN) return '/department';
    if (role === ROLES.WORKER) return '/worker';
    return '/';
  };

  const handleLinkClick = (path) => {
    if (path === '/citizen/issues' && !isAuthenticated) {
      setIsMyIssuesModalOpen(true);
      return;
    }
    if (onNavigate) onNavigate(path);
    else window.location.hash = path;
  };

  return (
    <header className="glass-panel" style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--color-border-subtle)' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '78px', paddingLeft: 'var(--space-6)', paddingRight: 'var(--space-6)', maxWidth: '1440px' }}>
        {/* Brand Logo */}
        <div
          onClick={() => handleLinkClick(getLogoPath())}
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer', flexShrink: 0 }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-inverse)',
              fontWeight: 800,
              fontSize: 'var(--font-xl)',
              boxShadow: 'var(--shadow-sm)'
             }}
          >
            JA
          </div>
          <div>
            <span style={{ fontSize: 'var(--font-lg)', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
              {t('appTitle')}
            </span>
            {role === ROLES.CITIZEN || !isAuthenticated ? (
              <span className="mobile-hide-tagline" style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                {t('tagline')}
              </span>
            ) : (
              <span style={{ display: 'block', fontSize: '10px', color: 'var(--color-brand-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                {role === ROLES.AUTHORITY ? 'Authority Portal' : role === ROLES.DEPARTMENT_ADMIN ? 'Department Admin' : 'Worker Portal'}
              </span>
            )}
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'none', alignItems: 'center', gap: 'var(--space-6)' }} className="desktop-nav">
          {navLinks.map((link) => {
            const isActive = currentPath === link.path;
            return (
              <button
                key={link.path}
                onClick={() => handleLinkClick(link.path)}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Hamburger Menu Icon (Mobile Only) */}
        <button
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-primary)',
            cursor: 'pointer',
            padding: '6px',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          className="mobile-nav-toggle"
        >
          {isDrawerOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <LanguageSelector />
          <NotificationBell onNavigate={onNavigate} />


          {/* User Account / Sign In State */}
          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  backgroundColor: 'var(--color-bg-surface-elevated)',
                  border: '1px solid var(--color-border-default)',
                  padding: '8px 16px',
                  height: '38px',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--font-xs)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {role === ROLES.WORKER ? (
                  <Wrench size={15} style={{ color: 'var(--color-brand-primary)' }} />
                ) : role === ROLES.AUTHORITY ? (
                  <Shield size={15} style={{ color: 'var(--color-brand-primary)' }} />
                ) : (
                  <User size={15} style={{ color: 'var(--color-brand-primary)' }} />
                )}
                <span className="mobile-hide-tagline">{user?.name || 'My Account'}</span>
                <ChevronDown size={14} style={{ color: 'var(--color-text-tertiary)' }} />
              </button>

              {userDropdownOpen && (
                <div
                  className="animate-slide-up"
                  style={{
                    position: 'absolute',
                    top: '110%',
                    right: 0,
                    width: '180px',
                    backgroundColor: 'var(--color-bg-surface-elevated)',
                    border: '1px solid var(--color-border-default)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 200,
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ padding: '8px 12px', fontSize: '10px', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', borderBottom: '1px solid var(--color-border-subtle)', fontWeight: 700 }}>
                    {role} PROFILE
                  </div>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      handleLinkClick(role === ROLES.WORKER ? '/worker' : role === ROLES.AUTHORITY ? '/authority' : '/profile');
                    }}
                    className="dropdown-item"
                  >
                    <User size={14} />
                    <span>Dashboard / Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="dropdown-item"
                    style={{
                      color: 'var(--color-status-reopened)',
                      borderTop: '1px solid var(--color-border-subtle)'
                    }}
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              icon={LogIn}
              onClick={() => handleLinkClick('/citizen/login')}
            >
              Sign In
            </Button>
          )}

          {!currentPath.startsWith('/authority') &&
           !currentPath.startsWith('/department') &&
           !currentPath.startsWith('/worker') &&
           role !== ROLES.AUTHORITY &&
           role !== ROLES.DEPARTMENT_ADMIN &&
           role !== ROLES.WORKER && (
            <div className="mobile-hide-btn">
              <Button
                variant="primary"
                size="sm"
                icon={PlusCircle}
                onClick={() => handleLinkClick('/report')}
              >
                {t('reportIssue')}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Slide-out Drawer */}
      {isDrawerOpen && (
        <>
          {/* Backdrop overlay */}
          <div
            onClick={() => setIsDrawerOpen(false)}
            style={{
              position: 'fixed',
              top: '72px',
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(42, 42, 42, 0.4)',
              backdropFilter: 'blur(4px)',
              zIndex: 90
            }}
          />

          {/* Drawer container */}
          <div
            className="animate-slide-up"
            style={{
              position: 'fixed',
              top: '72px',
              left: 0,
              right: 0,
              backgroundColor: 'var(--color-bg-surface-elevated)',
              borderBottom: '1px solid var(--color-border-default)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 95,
              padding: 'var(--space-4) var(--space-6)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)'
            }}
          >
            {navLinks.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => {
                    setIsDrawerOpen(false);
                    handleLinkClick(link.path);
                  }}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: 'var(--space-3) var(--space-4)',
                    fontSize: 'var(--font-sm)',
                    fontWeight: 700
                  }}
                >
                  {link.label}
                </button>
              );
            })}

            {!currentPath.startsWith('/authority') &&
             !currentPath.startsWith('/department') &&
             !currentPath.startsWith('/worker') &&
             role !== ROLES.AUTHORITY &&
             role !== ROLES.DEPARTMENT_ADMIN &&
             role !== ROLES.WORKER && (
              <div style={{ marginTop: 'var(--space-2)', paddingTop: 'var(--space-2)', borderTop: '1px solid var(--color-border-subtle)' }}>
                <Button
                  variant="primary"
                  size="md"
                  icon={PlusCircle}
                  onClick={() => {
                    setIsDrawerOpen(false);
                    handleLinkClick('/report');
                  }}
                  style={{ width: '100%' }}
                >
                  {t('reportIssue')}
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      <MyIssuesAuthModal
        isOpen={isMyIssuesModalOpen}
        onClose={() => setIsMyIssuesModalOpen(false)}
        onSuccessNavigate={onNavigate}
      />
    </header>
  );
};
