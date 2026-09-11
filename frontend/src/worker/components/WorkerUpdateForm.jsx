import React, { useState } from 'react';
import { Button } from '../../shared/components/Button';
import { Textarea } from '../../shared/components/Textarea';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';

export const WorkerUpdateForm = ({ onPostUpdate }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await onPostUpdate(message.trim());
      setMessage('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err.message || 'Failed to post update.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <h4 style={{ fontSize: 'var(--font-sm)', fontWeight: 800, color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
        UPDATE PROGRESS
      </h4>

      {success && (
        <div style={{ padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(34, 197, 94, 0.15)', color: 'var(--color-status-success)', fontSize: 'var(--font-xs)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
          <CheckCircle2 size={16} /> Update added successfully.
        </div>
      )}

      {error && (
        <div style={{ padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-status-danger)', fontSize: 'var(--font-xs)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <Textarea
        placeholder="Enter progress update (e.g. 'Road crew reached location and barricading has started.')..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        required
      />

      <Button
        type="submit"
        variant="secondary"
        size="sm"
        icon={Send}
        disabled={loading || !message.trim()}
        style={{ alignSelf: 'flex-start' }}
      >
        {loading ? 'POSTING...' : 'POST UPDATE'}
      </Button>
    </form>
  );
};
