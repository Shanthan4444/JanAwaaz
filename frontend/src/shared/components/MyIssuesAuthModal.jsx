import React, { useState } from 'react';
import { Phone, User, ArrowRight, X } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { authApi } from '../../services/api/authApi';
import { useAuth } from '../../services/auth/AuthProvider';

export const MyIssuesAuthModal = ({ isOpen, onClose, onSuccessNavigate }) => {
  const { loginWithToken } = useAuth();
  const [step, setStep] = useState(1); // 1: Mobile Input, 2: Name Input (for new users)
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleMobileSubmit = async (e) => {
    e.preventDefault();
    const cleanMobile = mobile.trim().replace(/\D/g, '').slice(-10);
    if (cleanMobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await authApi.identifyCitizen(cleanMobile);
      if (res.exists && res.token) {
        // CASE A — Existing Citizen found! Log in directly & open My Issues
        loginWithToken(res.token, res.user);
        onClose();
        if (onSuccessNavigate) onSuccessNavigate('/citizen/issues');
        else window.location.hash = '/citizen/issues';
      } else if (res.needsName) {
        // CASE B — First-time citizen! Prompt for name without sending OTP
        setStep(2);
      }
    } catch (err) {
      console.error('[MY ISSUES AUTH ERROR]', err);
      setError(err.message || 'Unable to check mobile number. Please try again.');
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
        loginWithToken(res.token, res.user);
        onClose();
        if (onSuccessNavigate) onSuccessNavigate('/citizen/issues');
        else window.location.hash = '/citizen/issues';
      }
    } catch (err) {
      console.error('[MY ISSUES NAME SUBMIT ERROR]', err);
      setError(err.message || 'Unable to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setStep(1);
    setMobile('');
    setName('');
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCloseModal} title="MY ISSUES">
      <div style={{ padding: 'var(--space-2)' }}>
        {step === 1 ? (
          <form onSubmit={handleMobileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                View Your Reported Issues
              </h3>
              <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                Enter your mobile number to view your civic reports.
              </p>
            </div>

            {error && (
              <div style={{
                padding: 'var(--space-3)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid var(--color-status-reopened)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-status-reopened)',
                fontSize: 'var(--font-xs)',
                fontWeight: 600
              }}>
                {error}
              </div>
            )}

            <Input
              label="Mobile Number"
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="e.g. 9876543210"
              icon={Phone}
              maxLength={10}
              autoFocus
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
              <Button variant="ghost" type="button" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" loading={loading} icon={ArrowRight} iconPosition="right">
                Continue
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleNameSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--color-brand-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                WELCOME TO JANAWAAZ
              </span>
              <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 800, color: 'var(--color-text-primary)', marginTop: '2px', marginBottom: '4px' }}>
                Looks like you're new to JanAwaaz.
              </h3>
              <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                What's your name?
              </p>
            </div>

            {error && (
              <div style={{
                padding: 'var(--space-3)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid var(--color-status-reopened)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-status-reopened)',
                fontSize: 'var(--font-xs)',
                fontWeight: 600
              }}>
                {error}
              </div>
            )}

            <Input
              label="Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              icon={User}
              autoFocus
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
              <Button variant="ghost" type="button" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button variant="primary" type="submit" loading={loading} icon={ArrowRight} iconPosition="right">
                Continue to My Issues
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
