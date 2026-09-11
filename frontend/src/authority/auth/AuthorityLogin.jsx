import React, { useState } from 'react';
import { Button } from '../../shared/components/Button';
import { Input } from '../../shared/components/Input';
import { authApi } from '../../services/api/authApi';
import { useAuth } from '../../services/auth/AuthProvider';
import { Lock, AlertTriangle } from 'lucide-react';

export const AuthorityLogin = ({ onSuccess }) => {
  const [department, setDepartment] = useState('Electrical Department');
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!department || !credential || !password) {
      setError('Please select department, enter email/employee ID, and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await authApi.loginAuthority(credential, password, department);
      login(res.user, res.token);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('[AUTHORITY LOGIN ERROR]', err);
      setError(err.message || 'Invalid credentials or department mismatch.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {error && (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--color-status-danger)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: 'var(--font-xs)', color: 'var(--color-status-danger)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>
          Select Department
        </label>
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border-default)', color: 'var(--color-text-primary)', fontSize: 'var(--font-sm)' }}
        >
          <option value="Electrical Department">⚡ Electrical Department</option>
          <option value="Water Supply & Sewerage Department">💧 Water Supply & Sewerage Department</option>
          <option value="Roads & Infrastructure Department">🛣️ Roads & Infrastructure Department</option>
          <option value="Municipal Department">🏛️ Municipal Department</option>
          <option value="Fire Department">🔥 Fire Department</option>
        </select>
      </div>

      <Input
        label="Officer Email or Employee ID"
        placeholder="e.g. fire.officer@jansetu.gov.in"
        value={credential}
        onChange={(e) => setCredential(e.target.value)}
        required
      />

      <Input
        label="Password"
        type="password"
        placeholder="••••••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <Button variant="primary" size="lg" icon={Lock} type="submit" disabled={loading} style={{ width: '100%', marginTop: 'var(--space-2)' }}>
        {loading ? 'VERIFYING CREDENTIALS...' : 'SIGN IN & VERIFY ➔'}
      </Button>
    </form>
  );
};
