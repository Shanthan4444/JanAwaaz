import React from 'react';
import { ShieldCheck, Shield, Wrench } from 'lucide-react';

export const Footer = ({ onNavigate }) => {
  return (
    <footer style={{ backgroundColor: 'var(--color-bg-surface)', borderTop: '1px solid var(--color-border-subtle)', paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-8)', marginTop: 'var(--space-16)' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-8)', marginBottom: 'var(--space-8)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', background: 'var(--color-brand-primary)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>J</div>
              <span style={{ fontSize: 'var(--font-lg)', fontWeight: 800, color: 'var(--color-text-primary)' }}>Jansetu</span>
            </div>
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Turn civic problems into coordinated action and verified resolution. Jansetu connects citizens, volunteers, authorities, and field workers through AI civic intelligence.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 'var(--space-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Public Portals</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
              <li><a href="#/" onClick={() => onNavigate && onNavigate('/')}>Home</a></li>
              <li><a href="#/report" onClick={() => onNavigate && onNavigate('/report')}>Report an Issue</a></li>
              <li><a href="#/community" onClick={() => onNavigate && onNavigate('/community')}>Community Activity Stream</a></li>
              <li><a href="#/citizen/login" onClick={() => onNavigate && onNavigate('/citizen/login')}>Citizen & Worker Login</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 'var(--space-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Municipal Portals</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
              <li>
                <a href="#/authority/login" onClick={() => onNavigate && onNavigate('/authority/login')} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-brand-primary)', fontWeight: 700 }}>
                  <Shield size={14} /> Official Authority Portal
                </a>
              </li>
              <li>
                <a href="#/department/login" onClick={() => onNavigate && onNavigate('/department/login')} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-brand-primary)', fontWeight: 700 }}>
                  🏢 Department Admin Operations
                </a>
              </li>
              <li>
                <a href="#/worker/login" onClick={() => onNavigate && onNavigate('/worker/login')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Wrench size={14} /> Field Worker Access
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: 'var(--space-6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)', fontSize: 'var(--font-xs)', color: 'var(--color-text-tertiary)' }}>
          <div>
            © 2026 Jansetu Platform Architecture. All Rights Reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Verified Civic Resolution Infrastructure</span>
            <ShieldCheck size={14} style={{ color: 'var(--status-resolved)' }} />
          </div>
        </div>
      </div>
    </footer>
  );
};
