import React from 'react';
import { useAuth } from '../../services/auth/AuthProvider';
import { LoadingState } from './LoadingState';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-12)' }}>
        <LoadingState message="Verifying authentication session..." />
      </div>
    );
  }

  if (!user) {
    window.location.hash = '/authority/login';
    return null;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    window.location.hash = '/authority/login';
    return null;
  }

  return children;
};
