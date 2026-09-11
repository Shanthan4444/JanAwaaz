import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth, ROLES } from './services/auth/AuthProvider';
import { LanguageProvider } from './shared/i18n/LanguageContext';
import { ThemeProvider } from './shared/theme/ThemeContext';
import { Navbar } from './shared/components/Navbar';
import { Footer } from './shared/components/Footer';

// Citizen Pages
import { Home } from './citizen/pages/Home';
import { ReportIssue } from './citizen/pages/ReportIssue';
import { TrackIssue } from './citizen/pages/TrackIssue';
import { Community } from './citizen/pages/Community';
import { Profile } from './citizen/pages/Profile';
import { CitizenLoginPage } from './citizen/pages/CitizenLoginPage';
import { CitizenDashboard } from './citizen/pages/CitizenDashboard';
import { NotificationPage } from './shared/components/notifications/NotificationPage';

// Authority Pages
import { AuthorityLoginPage } from './authority/pages/AuthorityLoginPage';
import { AuthorityDashboard } from './authority/pages/AuthorityDashboard';
import { AuthorityIssueDetail } from './authority/pages/AuthorityIssueDetail';
import { AuthorityMap } from './authority/pages/AuthorityMap';
import { AuthorityAnalytics } from './authority/pages/AuthorityAnalytics';
import { AuthorityEscalationCenter } from './authority/pages/AuthorityEscalationCenter';

// Department Pages
import { DepartmentLoginPage } from './department/pages/DepartmentLoginPage';
import { DepartmentDashboard } from './department/pages/DepartmentDashboard';

// Worker Pages
import { WorkerLoginPage } from './worker/pages/WorkerLoginPage';
import { WorkerDashboard } from './worker/pages/WorkerDashboard';
import { WorkerTaskDetail } from './worker/pages/WorkerTaskDetail';
import { WorkerProfile } from './worker/pages/WorkerProfile';

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('[GLOBAL APP ERROR CAUGHT]', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg-base, #F8FAFC)', padding: '24px', fontFamily: 'sans-serif' }}>
          <div style={{ maxWidth: '480px', width: '100%', backgroundColor: 'var(--color-bg-surface, #FFFFFF)', borderRadius: '16px', padding: '32px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', border: '1px solid var(--color-border-default, #E2E8F0)' }}>
            <div style={{ width: '54px', height: '54px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.12)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '24px' }}>
              ⚠️
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-primary, #0F172A)', marginBottom: '8px' }}>
              Interface Notice
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary, #64748B)', marginBottom: '24px', lineHeight: 1.5 }}>
              {this.state.error?.message || 'A temporary display issue occurred.'}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.hash = '/report';
                  window.location.reload();
                }}
                style={{ padding: '10px 20px', backgroundColor: 'var(--color-brand-primary, #2563EB)', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}
              >
                Reload & Continue
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const [currentPath, setCurrentPath] = useState(window.location.hash.replace('#', '') || '/');
  const { isAuthenticated, role } = useAuth();

  const navigateTo = (path) => {
    window.location.hash = path;
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || '/';
      setCurrentPath(hash);
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Automatically redirect Authority, Department Admin, and Worker roles away from Citizen Home
  useEffect(() => {
    if (isAuthenticated && role) {
      const isHome = currentPath === '/' || currentPath === '';
      if (isHome) {
        if (role === ROLES.AUTHORITY) {
          navigateTo('/authority');
        } else if (role === ROLES.DEPARTMENT_ADMIN) {
          navigateTo('/department');
        } else if (role === ROLES.WORKER) {
          navigateTo('/worker');
        }
      }
    }
  }, [currentPath, role, isAuthenticated]);

  const renderCurrentPage = () => {
    // Shared Notifications Page
    if (currentPath === '/notifications') return <NotificationPage onNavigate={navigateTo} />;

    // Citizen Routes
    if (currentPath === '/' || currentPath === '') {
      if (isAuthenticated) {
        if (role === ROLES.AUTHORITY) return <AuthorityDashboard onNavigate={navigateTo} />;
        if (role === ROLES.DEPARTMENT_ADMIN) return <DepartmentDashboard onNavigate={navigateTo} />;
        if (role === ROLES.WORKER) return <WorkerDashboard onNavigate={navigateTo} />;
      }
      return <Home onNavigate={navigateTo} />;
    }
    if (currentPath === '/citizen/login') return <CitizenLoginPage onNavigate={navigateTo} />;
    if (currentPath === '/citizen' || currentPath === '/citizen/issues') return <CitizenDashboard onNavigate={navigateTo} />;
    if (currentPath === '/report') return <ReportIssue onNavigate={navigateTo} />;
    if (currentPath.startsWith('/track/')) {
      const id = currentPath.split('/track/')[1];
      return <TrackIssue issueId={id} />;
    }
    if (currentPath === '/community') return <Community onNavigate={navigateTo} />;
    if (currentPath === '/profile') return <Profile onNavigate={navigateTo} />;

    // Department Routes
    if (currentPath === '/department/login') return <DepartmentLoginPage onNavigate={navigateTo} />;
    if (currentPath === '/department') return <DepartmentDashboard onNavigate={navigateTo} />;

    // Authority Routes
    if (currentPath === '/authority/login') return <AuthorityLoginPage onNavigate={navigateTo} />;
    if (currentPath === '/authority') return <AuthorityDashboard onNavigate={navigateTo} />;
    if (currentPath === '/authority/analytics') return <AuthorityAnalytics onNavigate={navigateTo} />;
    if (currentPath === '/authority/escalations') return <AuthorityEscalationCenter onNavigate={navigateTo} />;
    if (currentPath.startsWith('/authority/issues/')) {
      const id = currentPath.split('/authority/issues/')[1];
      return <AuthorityIssueDetail issueId={id} onNavigate={navigateTo} />;
    }
    if (currentPath === '/authority/map') return <AuthorityMap onNavigate={navigateTo} />;

    // Worker Routes
    if (currentPath === '/worker/login') return <WorkerLoginPage onNavigate={navigateTo} />;
    if (currentPath === '/worker') return <WorkerDashboard onNavigate={navigateTo} />;
    if (currentPath === '/worker/profile') return <WorkerProfile onNavigate={navigateTo} />;
    if (currentPath.startsWith('/worker/tasks/')) {
      const id = currentPath.split('/worker/tasks/')[1];
      return <WorkerTaskDetail taskId={id} onNavigate={navigateTo} />;
    }

    if (isAuthenticated) {
      if (role === ROLES.AUTHORITY) return <AuthorityDashboard onNavigate={navigateTo} />;
      if (role === ROLES.DEPARTMENT_ADMIN) return <DepartmentDashboard onNavigate={navigateTo} />;
      if (role === ROLES.WORKER) return <WorkerDashboard onNavigate={navigateTo} />;
    }
    return <Home onNavigate={navigateTo} />;
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar currentPath={currentPath} onNavigate={navigateTo} />
      <main style={{ flex: 1 }}>
        <GlobalErrorBoundary>
          {renderCurrentPage()}
        </GlobalErrorBoundary>
      </main>
      <Footer onNavigate={navigateTo} />
    </div>
  );
}

export default function App() {
  return (
    <GlobalErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </GlobalErrorBoundary>
  );
}
