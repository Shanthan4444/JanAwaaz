import React, { useState } from 'react';
import { Phone, User, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../../shared/components/Button';
import { Input } from '../../shared/components/Input';
import { authApi } from '../../services/api/authApi';
import { useAuth } from '../../services/auth/AuthProvider';

export const CitizenLogin = ({ onSuccess }) => {
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState(1); // 1: Enter mobile, 2: Enter name (first time user)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();

  const handleMobileSubmit = async (e) => {
    e.preventDefault();
    const cleanMobile = mobile.trim().replace(/\D/g, '').slice(-10);
    if (!cleanMobile || cleanMobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await authApi.identifyCitizen(cleanMobile);
      if (res.exists && res.token) {
        // Registered User: Directly log in without OTP
        login(res.user, res.token);
        if (onSuccess) onSuccess();
      } else if (res.needsName) {
        // First-Time User: Ask for full name
        setStep(2);
      } else if (res.token) {
        login(res.user, res.token);
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNameSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    setLoading(true);
    setError(null);
    const cleanMobile = mobile.trim().replace(/\D/g, '').slice(-10);

    try {
      const res = await authApi.identifyCitizen(cleanMobile, name.trim());
      if (res.token) {
        login(res.user, res.token);
        if (onSuccess) onSuccess();
      } else {
        setError('Failed to create account. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Failed to complete registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {step === 1 ? (
        <form onSubmit={handleMobileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: 900, color: 'var(--color-text-primary)' }}>
              CITIZEN LOGIN
            </h3>
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Sign in with your 10-digit mobile number to track, verify, and support civic issues.
            </p>
          </div>

          {error && (
            <div style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-status-danger)', fontSize: 'var(--font-xs)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <Input
            label="Mobile Number"
            type="tel"
            icon={Phone}
            placeholder="e.g. 9876543210"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            maxLength={10}
            required
            autoFocus
          />

          <Button type="submit" variant="primary" icon={ArrowRight} iconPosition="right" disabled={loading}>
            {loading ? 'SIGNING IN...' : 'CONTINUE'}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleNameSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-brand-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              WELCOME TO JANAWAAZ
            </span>
            <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: 900, color: 'var(--color-text-primary)', marginTop: '2px' }}>
              Looks like you're new here
            </h3>
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Please enter your full name to set up your account for mobile <strong>+91 {mobile}</strong>.
            </p>
          </div>

          {error && (
            <div style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-status-danger)', fontSize: 'var(--font-xs)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <Input
            label="Full Name"
            icon={User}
            placeholder="e.g. Rahul Sharma"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Button type="button" variant="secondary" icon={ArrowLeft} onClick={() => { setStep(1); setError(null); }} style={{ flex: 1 }}>
              Back
            </Button>
            <Button type="submit" variant="primary" icon={ArrowRight} iconPosition="right" disabled={loading} style={{ flex: 2 }}>
              {loading ? 'CREATING ACCOUNT...' : 'SIGN IN & CONTINUE'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

