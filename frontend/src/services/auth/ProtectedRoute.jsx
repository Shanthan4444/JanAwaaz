import React from 'react';
import { useAuth } from './AuthProvider';

export const ProtectedRoute = ({ children, fallback }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return fallback || (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
        Authentication Required. Please log in.
      </div>
    );
  }

  return children;
};
