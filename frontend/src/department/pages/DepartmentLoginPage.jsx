import React, { useState } from 'react';
import { Building2, KeyRound, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../services/auth/AuthProvider';
import { departmentApi } from '../../services/api/departmentApi';
import { Button } from '../../shared/components/Button';
import { Input } from '../../shared/components/Input';
import departmentCredentials from '../../data/departmentCredentials.json';

export const DepartmentLoginPage = ({ onNavigate }) => {
  const { login } = useAuth();
  const [selectedDept, setSelectedDept] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSelectDepartment = (deptObj) => {
    setSelectedDept(deptObj);
    setUsername(deptObj.username);
    setPassword(deptObj.password);
    setError(null);
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await departmentApi.login(username, password);
      login(res.user, res.token);
      if (onNavigate) onNavigate('/department');
      else window.location.hash = '/department';
    } catch (err) {
      console.error('[DEPT LOGIN ERROR]', err);
      setError(err.message || 'Invalid department admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 1: DEPARTMENT SELECTION CARD GRID
  if (!selectedDept) {
    return (
      <div className="container" style={{ maxWidth: '1000px', paddingTop: 'var(--space-10)', paddingBottom: 'var(--space-12)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--color-brand-subtle)', color: 'var(--color-brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)', boxShadow: 'var(--shadow-glow-indigo)' }}>
            <Building2 size={32} />
          </div>
          <span style={{ fontSize: '11px', color: 'var(--color-brand-primary)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.08em' }}>
            MUNICIPAL DEPARTMENT OPERATIONS
          </span>
          <h1 style={{ fontSize: 'var(--font-3xl)', fontWeight: 900, color: 'var(--color-text-primary)', marginTop: '4px' }}>
            SELECT YOUR MUNICIPAL DEPARTMENT
          </h1>
          <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: '4px', maxWidth: '560px', margin: '4px auto 0' }}>
            Choose your assigned operational domain to access isolated task queues, technician management, and SLA tracking.
          </p>
        </div>

        {/* 2x4 Department Selection Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
          {departmentCredentials.map((dept) => (
            <div
              key={dept.username}
              onClick={() => handleSelectDepartment(dept)}
              className="card-container"
              style={{
                padding: 'var(--space-6)',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease',
                border: '1px solid var(--color-border-default)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-brand-primary)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border-default)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ fontSize: '40px', marginBottom: 'var(--space-2)' }}>{dept.icon}</div>
              <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                {dept.department}
              </h3>
              <div style={{ fontSize: '11px', color: 'var(--color-brand-primary)', fontWeight: 700, marginTop: '4px' }}>
                Username: {dept.username}
              </div>
              <div style={{ marginTop: 'var(--space-4)' }}>
                <span className="badge" style={{ backgroundColor: 'var(--color-brand-subtle)', color: 'var(--color-brand-primary)', fontWeight: 800 }}>
                  SIGN IN ➔
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // STEP 2: DEPARTMENT-SPECIFIC BRANDED LOGIN PAGE
  return (
    <div className="container" style={{ maxWidth: '480px', paddingTop: 'var(--space-10)', paddingBottom: 'var(--space-12)' }}>
      {/* Back Button */}
      <button
        onClick={() => setSelectedDept(null)}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--color-brand-primary)',
          fontSize: 'var(--font-xs)',
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: 'var(--space-6)'
        }}
      >
        <ArrowLeft size={16} /> Back to Department Selection
      </button>

      <div className="card-container" style={{ padding: 'var(--space-8)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <div style={{ fontSize: '48px', marginBottom: 'var(--space-2)' }}>{selectedDept.icon}</div>
          <span style={{ fontSize: '10px', color: 'var(--color-brand-primary)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.08em' }}>
            JANSETU • {selectedDept.department.toUpperCase()} OPERATIONS
          </span>
          <h2 style={{ fontSize: 'var(--font-2xl)', fontWeight: 900, color: 'var(--color-text-primary)', marginTop: '4px' }}>
            {selectedDept.department} Login
          </h2>
          <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            Authorized Operational Portal for {selectedDept.name}
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', border: '1px solid var(--color-status-danger)', padding: '10px', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', fontSize: 'var(--font-xs)', color: 'var(--color-status-danger)', fontWeight: 700 }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input
            label={`${selectedDept.department} Username`}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading}
            style={{ width: '100%', marginTop: 'var(--space-2)' }}
          >
            {loading ? 'AUTHENTICATING...' : `SIGN IN TO ${selectedDept.department.toUpperCase()} ➔`}
          </Button>
        </form>

        <div style={{ marginTop: 'var(--space-6)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-surface)', border: '1px border var(--color-border-subtle)', fontSize: '11px', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
          💡 <strong>Staging Credentials:</strong> Username: <code>{selectedDept.username}</code> • Password: <code>{selectedDept.password}</code>
        </div>
      </div>
    </div>
  );
};
