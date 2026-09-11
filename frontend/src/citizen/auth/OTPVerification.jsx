import React, { useState } from 'react';
import { KeyRound, CheckCircle2 } from 'lucide-react';
import { Button } from '../../shared/components/Button';
import { Input } from '../../shared/components/Input';
import { useAuth } from '../../services/auth/AuthProvider';

export const OTPVerification = ({ mobileNumber, onSuccess }) => {
  const [otp, setOtp] = useState('');
  const { loginCitizenMobile } = useAuth();

  const handleVerify = async (e) => {
    e.preventDefault();
    await loginCitizenMobile(mobileNumber, otp);
    if (onSuccess) onSuccess();
  };

  return (
    <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div>
        <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
          Enter OTP Verification Code
        </h3>
        <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
          OTP sent to {mobileNumber || 'your phone'}
        </p>
      </div>

      <Input
        label="6-Digit OTP Code"
        icon={KeyRound}
        placeholder="123456"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        required
      />

      <Button type="submit" variant="success" icon={CheckCircle2}>
        Verify & Authenticate
      </Button>
    </form>
  );
};
