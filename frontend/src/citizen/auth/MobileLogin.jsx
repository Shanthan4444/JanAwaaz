import React, { useState } from 'react';
import { Smartphone, ArrowRight } from 'lucide-react';
import { Button } from '../../shared/components/Button';
import { Input } from '../../shared/components/Input';
import { authApi } from '../../services/auth/authApi';

export const MobileLogin = ({ onOtpSent }) => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    await authApi.requestMobileOTP(mobileNumber);
    setLoading(false);
    if (onOtpSent) onOtpSent(mobileNumber);
  };

  return (
    <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div>
        <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
          Citizen Mobile Login
        </h3>
        <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
          Enter your 10-digit mobile number to receive a verification OTP
        </p>
      </div>

      <Input
        label="Mobile Number"
        icon={Smartphone}
        placeholder="+91 98765 43210"
        value={mobileNumber}
        onChange={(e) => setMobileNumber(e.target.value)}
        required
      />

      <Button type="submit" variant="primary" loading={loading} icon={ArrowRight} iconPosition="right">
        Send OTP Code
      </Button>
    </form>
  );
};
