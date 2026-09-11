import React, { useState } from 'react';
import { Wrench, Lock, LogIn, AlertCircle } from 'lucide-react';
import { Button } from '../../shared/components/Button';
import { Input } from '../../shared/components/Input';
import { useAuth } from '../../services/auth/AuthProvider';
import { authApi } from '../../services/api/authApi';

export const WorkerLogin = ({ onSuccess }) => {
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await authApi.loginWorker(credential, password);
      login(result.user, result.token);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('[WORKER LOGIN ERROR]', err);
      setError(err.message || 'Worker login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div>
        <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: 900, color: 'var(--color-text-primary)', letterSpacing: '0.02em' }}>
          JANSETU FIELD OPERATIONS
        </h3>
        <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
          View and resolve the civic issues assigned to you.
        </p>
      </div>

      {error && (
        <div
          style={{
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--color-status-danger)',
            color: 'var(--color-status-danger)',
            fontSize: 'var(--font-xs)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)'
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <Input
        label="Worker Name"
        icon={Wrench}
        placeholder="Enter worker name (e.g. Ramesh Kumar)"
        value={credential}
        onChange={(e) => setCredential(e.target.value)}
        required
      />

      <Input
        label="Password"
        type="password"
        icon={Lock}
        placeholder="Enter worker password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <Button type="submit" variant="primary" icon={LogIn} disabled={loading}>
        {loading ? 'SIGNING IN...' : 'SIGN IN'}
      </Button>

      <div style={{ marginTop: 'var(--space-2)', padding: 'var(--space-3)', backgroundColor: 'var(--color-bg-surface-elevated)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-xs)', color: 'var(--color-text-tertiary)' }}>
        💡 <strong>Field Worker Access:</strong> Enter the Worker Name and Password assigned to you by your Municipal Officer during hiring.
      </div>
    </form>
  );
};
