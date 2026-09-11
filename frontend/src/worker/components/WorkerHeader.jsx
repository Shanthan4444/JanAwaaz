import React from 'react';
import { Wrench, LogOut, UserCheck } from 'lucide-react';
import { useAuth } from '../../services/auth/AuthProvider';

export const WorkerHeader = ({ profile, onNavigate }) => {
  const { user, logout } = useAuth();
  const name = profile?.name || user?.name || 'FIELD TECHNICIAN';
  const employeeId = profile?.employeeId || user?.employeeId || 'WORKER';
  const department = profile?.department || user?.department || 'Roads & Infrastructure';
  const roleTitle = profile?.role || user?.roleTitle || 'Department Technician';
  const status = profile?.availabilityStatus || 'AVAILABLE';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        marginBottom: 'var(--space-6)',
        paddingBottom: 'var(--space-4)',
        borderBottom: '1px solid var(--color-border-subtle)',
        flexWrap: 'wrap',
        gap: 'var(--space-3)'
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-brand-primary)',
              color: '#FFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Wrench size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: 'var(--font-xl)', fontWeight: 900, color: 'var(--color-text-primary)', textTransform: 'uppercase' }}>
              GOOD DAY, {name.split(' ')[0]}
            </h1>
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>ID: {employeeId}</span> • <strong>{roleTitle}</strong> • <span>{department}</span>
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.04em',
            backgroundColor: status === 'BUSY' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(34, 197, 94, 0.15)',
            color: status === 'BUSY' ? '#EAB308' : '#22C55E',
            border: `1px solid ${status === 'BUSY' ? '#EAB308' : '#22C55E'}`
          }}
        >
          <UserCheck size={12} />
          {status}
        </span>

        <button
          onClick={logout}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--color-text-tertiary)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: 'var(--font-xs)'
          }}
          title="Sign Out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
};
