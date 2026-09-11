import React from 'react';
import { useAuth } from './AuthProvider';

export const RoleGuard = ({ allowedRoles = [], children, fallback }) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return fallback || (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--priority-critical)' }}>
        Access Denied. Required Role: {allowedRoles.join(', ')}
      </div>
    );
  }

  return children;
};
