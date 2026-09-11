import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { PriorityBadge } from '../../shared/components/PriorityBadge';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { Timeline } from '../../shared/components/Timeline';
import { Button } from '../../shared/components/Button';
import { Card } from '../../shared/components/Card';
import { Avatar } from '../../shared/components/Avatar';
import { MapContainer } from '../../shared/components/MapContainer';
import { Modal } from '../../shared/components/Modal';
import { Textarea } from '../../shared/components/Textarea';
import { LoadingState } from '../../shared/components/LoadingState';
import { EmptyState } from '../../shared/components/EmptyState';
import { issuesApi } from '../../services/api/issuesApi';
import { mockApi } from '../../services/api/mockApi';
import { MapPin, Calendar, CheckCircle2, RotateCcw, Award, AlertTriangle, Cpu, AlertCircle } from 'lucide-react';
import { resolveImageUrl } from '../../shared/utils/imageUtils';

const getStageIndex = (status) => {
  switch (status) {
    case 'REPORTED': return 0;
    case 'VERIFIED': return 1;
    case 'ASSIGNED': return 2;
    case 'IN_PROGRESS': return 3;
    case 'CITIZEN_VERIFICATION':
    case 'RESOLVED': return 4;
    case 'CLOSED': return 5;
    default: return 0;
  }
};

export const TrackIssue = ({ issueId = 'JAN-2026-1042' }) => {
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState('');

  const fetchIssueData = async () => {
    setLoading(true);
    setError(null);
    try {
      const realData = await issuesApi.getIssue(issueId);
      setIssue(realData);
    } catch (apiErr) {
      console.warn(`[TRACK ISSUE] Real API lookup for ${issueId} failed, checking mock fallback...`, apiErr);
      try {
        const mockData = await mockApi.getIssue(issueId);
        setIssue(mockData);
      } catch (mockErr) {
        setError(`Issue '${issueId}' could not be found in MongoDB.`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssueData();
    const unsubscribe = mockApi.subscribe(fetchIssueData);
    return unsubscribe;
  }, [issueId]);

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-12)' }}>
        <LoadingState message={`Retrieving real MongoDB document for ${issueId}...`} />
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="container" style={{ maxWidth: '640px', paddingTop: 'var(--space-12)' }}>
        <EmptyState
          title="Issue Not Found"
          description={`No record found in MongoDB database for issue ID '${issueId}'.`}
          actionText="Back to Home"
          onAction={() => (window.location.hash = '/')}
        />
      </div>
    );
  }

  const handleVerifyYes = async () => {
    try {
      const { citizenApi } = await import('../../services/api/citizenApi');
      const updated = await citizenApi.verifyIssue(issue.issueId || issue.id, { reason: 'Confirmed fixed on site by citizen.' });
      setIssue(updated);
      try {
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      } catch (e) {}
    } catch (err) {
      console.error('[VERIFY YES ERROR]', err);
      alert(err.message || 'Verification failed. Only the citizen who reported this issue can submit final verification.');
    }
  };

  const handleVerifyNoSubmit = async () => {
    if (!reopenReason.trim()) {
      alert('Please provide a reason why the issue is not fixed.');
      return;
    }

    try {
      const { citizenApi } = await import('../../services/api/citizenApi');
      const updated = await citizenApi.reopenIssue(issue.issueId || issue.id, { reason: reopenReason.trim() });
      setIssue(updated);
      setReopenModalOpen(false);
    } catch (err) {
      console.error('[REOPEN SUBMIT ERROR]', err);
      alert(err.message || 'Reopening failed. Only the citizen who reported this issue can reopen it.');
    }
  };

  const isAwaitingVerification = issue.status === 'RESOLVED' || issue.status === 'CITIZEN_VERIFICATION';
  const ai = issue.aiAnalysis || {};

  return (
    <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>
      {/* Header Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <PriorityBadge priority={issue.severity || issue.priorityLevel || 'HIGH'} />
          <StatusBadge status={issue.status} />
          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-tertiary)', marginLeft: 'auto', fontFamily: 'monospace', fontWeight: 800 }}>
            {issue.issueId || issue.id}
          </span>
        </div>

        <h1 style={{ fontSize: 'var(--font-3xl)', fontWeight: 900, color: 'var(--color-text-primary)' }}>
          {issue.title}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={14} style={{ color: 'var(--color-brand-primary)' }} />
            {issue.location?.area || 'Sector 14'}, {issue.location?.landmark || ''}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={14} />
            Reported on {new Date(issue.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Feature 8: Package-Tracking Resolution Timeline */}
      <Card style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-5) var(--space-6)', overflowX: 'auto' }}>
        <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 'var(--space-4)', textAlign: 'left' }}>
          RESOLUTION TRACKING PIPELINE
        </span>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minWidth: '600px', position: 'relative' }}>
          
          {/* Stepper horizontal line indicator */}
          <div style={{
            position: 'absolute',
            top: '15px',
            left: '20px',
            right: '20px',
            height: '3px',
            backgroundColor: 'var(--color-border-default)',
            zIndex: 1
          }}>
            <div style={{
              width: `${(getStageIndex(issue.status) / 5) * 100}%`,
              height: '100%',
              backgroundColor: 'var(--status-verified)',
              transition: 'width var(--transition-normal)'
            }} />
          </div>

          {/* Steps */}
          {['Reported', 'Verified', 'Assigned', 'In Progress', 'Verification', 'Closed'].map((label, idx) => {
            const currentIdx = getStageIndex(issue.status);
            const isCompleted = idx <= currentIdx;
            const isActive = idx === currentIdx;

            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 2, position: 'relative', width: '80px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: isCompleted ? 'var(--status-verified)' : '#FFFFFF',
                  color: isCompleted ? '#FFFFFF' : 'var(--color-text-secondary)',
                  border: `2px solid ${isCompleted ? 'var(--status-verified)' : 'var(--color-border-default)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'var(--font-xs)',
                  fontWeight: 800,
                  boxShadow: isActive ? '0 0 12px rgba(46, 125, 50, 0.4)' : 'var(--shadow-sm)',
                  transition: 'all var(--transition-fast)'
                }}>
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span style={{
                  fontSize: '10px',
                  fontWeight: isCompleted ? 800 : 500,
                  color: isCompleted ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  textAlign: 'center',
                  whiteSpace: 'nowrap'
                }}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Main Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 'var(--space-8)' }} className="track-grid">
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {issue.status === 'CLOSED' && (
            <Card style={{ backgroundColor: 'var(--status-verified-bg)', borderColor: 'rgba(46, 125, 50, 0.25)', padding: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--status-verified)' }}>
                <CheckCircle2 size={24} style={{ flexShrink: 0 }} />
                <div style={{ textAlign: 'left' }}>
                  <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 800 }}>Great news! This issue has been marked as fixed.</h3>
                  <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>
                    Citizens have verified the resolution work and the case is officially closed. Thank you for helping improve the community!
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Real AI Civic Intelligence Summary Box */}
          <Card style={{ backgroundColor: 'var(--color-bg-surface-elevated)', borderColor: 'var(--color-brand-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-brand-primary)' }}>
                <Cpu size={20} />
                <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                  JANAWAAZ AI CIVIC INTELLIGENCE DIAGNOSTIC
                </h3>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-4)', fontSize: 'var(--font-xs)' }}>
              <div style={{ backgroundColor: 'var(--color-bg-surface)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ color: 'var(--color-text-tertiary)', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700 }}>CATEGORY</span>
                <p style={{ fontWeight: 800, color: 'var(--color-text-primary)', marginTop: '2px' }}>{ai.category || issue.category}</p>
              </div>

              <div style={{ backgroundColor: 'var(--color-bg-surface)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ color: 'var(--color-text-tertiary)', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700 }}>RECOMMENDED DEPT</span>
                <p style={{ fontWeight: 800, color: 'var(--color-brand-primary)', marginTop: '2px' }}>{ai.department || issue.department}</p>
              </div>

              <div style={{ backgroundColor: 'var(--color-bg-surface)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ color: 'var(--color-text-tertiary)', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700 }}>SEVERITY</span>
                <p style={{ fontWeight: 800, color: (ai.severity || issue.severity) === 'CRITICAL' ? 'var(--priority-critical)' : 'var(--priority-high)', marginTop: '2px' }}>{ai.severity || issue.severity || 'HIGH'}</p>
              </div>

              <div style={{ backgroundColor: 'var(--color-bg-surface)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ color: 'var(--color-text-tertiary)', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700 }}>PRIORITY SCORE</span>
                <p style={{ fontWeight: 900, fontSize: 'var(--font-md)', color: 'var(--status-resolved)', marginTop: '2px' }}>{ai.priority || issue.priority || 85}/100</p>
              </div>
            </div>

            {ai.summary && (
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <strong style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>SUMMARY</strong>
                <p style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '2px' }}>
                  {ai.summaryNative || ai.summary}
                </p>
                {ai.summaryNative && ai.summaryNative !== ai.summary && (
                  <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-tertiary)', marginTop: '2px', fontStyle: 'italic' }}>
                    (English translation: {ai.summary})
                  </p>
                )}
              </div>
            )}

            {ai.reasoning && (
              <div style={{ backgroundColor: 'var(--color-bg-surface)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--color-brand-primary)' }}>
                <strong style={{ fontSize: '11px', color: 'var(--color-brand-primary)', textTransform: 'uppercase' }}>
                  WHY {ai.severity || 'HIGH'} PRIORITY? (AI CIVIC REASONING {ai.detectedLanguage ? `• ${ai.detectedLanguage.toUpperCase()}` : ''})
                </strong>
                <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginTop: '4px' }}>
                  {(ai.reasoningNative || ai.reasoning || '').replace(/featherless\s*ai/gi, 'JanAwaaz Civic Intelligence').replace(/featherless\s*vlm/gi, 'JanAwaaz AI').replace(/featherless/gi, 'JanAwaaz')}
                </p>
              </div>
            )}

            {ai.duplicateRisk > 0.3 && (
              <div style={{ marginTop: 'var(--space-3)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} style={{ color: 'var(--status-in-progress)' }} />
                <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-primary)', fontWeight: 600 }}>
                  Potential duplicate risk estimated at {(ai.duplicateRisk * 100).toFixed(0)}%. {ai.possibleDuplicates?.length || 0} nearby matching issue(s) detected.
                </span>
              </div>
            )}
          </Card>

          {/* Resolution Evidence Card (BEFORE / AFTER) */}
          {isAwaitingVerification && (
            <Card style={{ backgroundColor: 'var(--status-verification-bg)', borderColor: 'var(--status-verification)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-primary)', fontWeight: 800, fontSize: 'var(--font-md)', marginBottom: 'var(--space-3)' }}>
                <Award size={20} style={{ color: 'var(--color-brand-primary)' }} />
                <span>CITIZEN RESOLUTION VERIFICATION</span>
              </div>
              <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
                Field worker marked this task complete. Inspect proof below and confirm whether it was actually fixed.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>BEFORE (CITIZEN REPORT)</span>
                  <img
                    src={resolveImageUrl(issue.evidence)}
                    alt="Before"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'; }}
                    style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--status-resolved)', textTransform: 'uppercase' }}>AFTER (WORKER RESOLUTION PROOF)</span>
                  <img
                    src={resolveImageUrl(issue.resolution?.evidence?.[0] || issue.resolutionProof?.afterUrl, 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80')}
                    alt="After"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80'; }}
                    style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginTop: '4px' }}
                  />
                </div>
              </div>

              {issue.resolution?.note && (
                <div style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-surface)', fontSize: 'var(--font-xs)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>
                  <strong>Field Resolution Note:</strong> "{issue.resolution.note}"
                </div>
              )}

              <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                <Button variant="success" icon={CheckCircle2} onClick={handleVerifyYes}>
                  YES, IT'S FIXED (+50 Impact)
                </Button>
                <Button variant="danger" icon={RotateCcw} onClick={() => setReopenModalOpen(true)}>
                  NO, IT'S STILL THERE
                </Button>
              </div>
            </Card>
          )}

          {/* Details & Photos */}
          <Card>
            <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 'var(--space-3)' }}>
              Issue Description & Evidence
            </h3>
            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-4)' }}>
              {issue.description}
            </p>

            {issue.evidence && issue.evidence.length > 0 && (
              <div>
                <span style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: 'var(--space-2)' }}>
                  Photo Evidence
                </span>
                <img
                  src={resolveImageUrl(issue.evidence)}
                  alt="Evidence"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'; }}
                  style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: 'var(--radius-lg)' }}
                />
              </div>
            )}
          </Card>

          {/* Progress Timeline */}
          <Card>
            <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 'var(--space-6)' }}>
              Progress Timeline & Lifecycle Movement
            </h3>
            <Timeline timeline={issue.timeline || []} currentStatus={issue.status} />
          </Card>
        </div>

        {/* Right Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Assigned Worker Contact Card */}
          {issue.assignedWorker && (
            <Card style={{ backgroundColor: 'var(--color-bg-surface-elevated)', border: '1px solid var(--color-brand-border)', boxShadow: 'var(--shadow-glow-indigo)' }}>
              <span style={{ fontSize: '10px', color: 'var(--color-brand-primary)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>
                👷 ASSIGNED FIELD TECHNICIAN
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                <Avatar src={issue.assignedWorker.avatar} name={issue.assignedWorker.name} size="lg" />
                <div>
                  <h4 style={{ fontSize: 'var(--font-sm)', fontWeight: 900, color: 'var(--color-text-primary)' }}>
                    {issue.assignedWorker.name}
                  </h4>
                  <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-brand-primary)', fontWeight: 700, display: 'block' }}>
                    {issue.assignedWorker.role || 'Field Technician'} ({issue.department})
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--status-resolved)', fontWeight: 800, marginTop: '2px', display: 'inline-block' }}>
                    📞 {issue.assignedWorker.phone || '9876543201'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <a
                  href={`tel:${issue.assignedWorker.phone || '9876543201'}`}
                  style={{ flex: 1, textDecoration: 'none' }}
                >
                  <Button variant="primary" size="sm" style={{ width: '100%' }}>
                    📞 CALL WORKER
                  </Button>
                </a>
                <a
                  href={`https://wa.me/91${issue.assignedWorker.phone || '9876543201'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ flex: 1, textDecoration: 'none' }}
                >
                  <Button variant="secondary" size="sm" style={{ width: '100%', borderColor: '#25D366', color: '#25D366' }}>
                    💬 WHATSAPP
                  </Button>
                </a>
              </div>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 'var(--font-xs)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-tertiary)' }}>Category</span>
                <strong style={{ color: 'var(--color-text-primary)' }}>{issue.category}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-tertiary)' }}>Department</span>
                <strong style={{ color: 'var(--color-brand-primary)' }}>{issue.department}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-tertiary)' }}>AI Priority Score</span>
                <strong style={{ color: 'var(--status-resolved)' }}>{issue.priority || 85} / 100</strong>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Reopen Modal */}
      <Modal isOpen={reopenModalOpen} onClose={() => setReopenModalOpen(false)} title="Reopen Issue Request">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
            Tell us why the issue is still incomplete. This will re-escalate the case directly to the Municipal Authority.
          </p>
          <Textarea
            label="Reason for reopening"
            placeholder="e.g. Asphalt patch was laid unevenly and water leak still persists..."
            value={reopenReason}
            onChange={(e) => setReopenReason(e.target.value)}
          />
          <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setReopenModalOpen(false)}>Cancel</Button>
            <Button variant="danger" icon={RotateCcw} onClick={handleVerifyNoSubmit}>REOPEN ISSUE</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
