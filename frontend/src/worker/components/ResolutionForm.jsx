import React, { useState } from 'react';
import { Button } from '../../shared/components/Button';
import { Textarea } from '../../shared/components/Textarea';
import { EvidenceUploader } from './EvidenceUploader';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export const ResolutionForm = ({ onSubmitResolution, onCancel }) => {
  const [resolutionNote, setResolutionNote] = useState('');
  const [evidenceList, setEvidenceList] = useState([
    {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80',
      caption: 'Pothole filled and road surface leveled'
    }
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!resolutionNote.trim()) {
      setError('Please describe what was fixed on site.');
      return;
    }

    if (!evidenceList || evidenceList.length === 0) {
      setError('Resolution evidence photo is required.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSubmitResolution({
        resolutionNote: resolutionNote.trim(),
        resolutionEvidence: evidenceList
      });
    } catch (err) {
      setError(err.message || 'Failed to submit resolution. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div style={{ paddingBottom: 'var(--space-2)', borderBottom: '1px solid var(--color-border-subtle)' }}>
        <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 900, color: 'var(--color-text-primary)' }}>
          RESOLUTION PROOF & SUBMISSION
        </h3>
        <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
          Provide clear evidence and a work description for citizen verification.
        </p>
      </div>

      {error && (
        <div style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--color-status-danger)', color: 'var(--color-status-danger)', fontSize: 'var(--font-xs)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <Textarea
        label="What did you fix? (Work Description)"
        placeholder="Filled and leveled the pothole. Asphalt compacted and road surface restored for safe traffic flow..."
        value={resolutionNote}
        onChange={(e) => setResolutionNote(e.target.value)}
        rows={4}
        required
      />

      <EvidenceUploader onEvidenceChange={(ev) => setEvidenceList(ev)} />

      <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
        <Button variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="success" type="submit" icon={CheckCircle2} disabled={submitting}>
          {submitting ? 'Submitting resolution...' : 'SUBMIT RESOLUTION'}
        </Button>
      </div>
    </form>
  );
};
