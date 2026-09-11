import React, { useState, useEffect } from 'react';
import { workerApi } from '../../services/api/workerApi';
import { PriorityBadge } from '../../shared/components/PriorityBadge';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { Button } from '../../shared/components/Button';
import { Card } from '../../shared/components/Card';
import { Modal } from '../../shared/components/Modal';
import { LocationCard } from '../components/LocationCard';
import { TaskTimeline } from '../components/TaskTimeline';
import { WorkerUpdateForm } from '../components/WorkerUpdateForm';
import { ResolutionForm } from '../components/ResolutionForm';
import { ArrowLeft, Play, CheckCircle2, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';

export const WorkerTaskDetail = ({ taskId = 'JAN-2026-1042', onNavigate }) => {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadTask = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await workerApi.getTask(taskId);
      setTask(data);
    } catch (err) {
      console.error('[WORKER TASK DETAIL ERROR]', err);
      setError(err.message || `Unable to load task '${taskId}'.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTask();
  }, [taskId]);

  const handleStartWork = async () => {
    setActionLoading(true);
    try {
      await workerApi.startTask(taskId);
      await loadTask();
    } catch (err) {
      alert(err.message || 'Failed to start work on task.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePostUpdate = async (message) => {
    await workerApi.postUpdate(taskId, message);
    await loadTask();
  };

  const handleSubmitResolution = async (resolutionData) => {
    await workerApi.resolveTask(taskId, resolutionData);
    setResolveModalOpen(false);
    await loadTask();
  };

  if (loading) {
    return (
      <div className="container" style={{ maxWidth: '760px', paddingTop: 'var(--space-12)', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
        <RefreshCw size={28} className="spin" style={{ margin: '0 auto var(--space-2)' }} />
        <p style={{ fontSize: 'var(--font-xs)', fontWeight: 700 }}>Loading field task details...</p>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="container" style={{ maxWidth: '760px', paddingTop: 'var(--space-8)' }}>
        <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => onNavigate ? onNavigate('/worker') : (window.location.hash = '/worker')} style={{ marginBottom: 'var(--space-4)' }}>
          Back to Tasks
        </Button>
        <Card style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <AlertCircle size={32} style={{ color: 'var(--color-status-danger)', margin: '0 auto var(--space-2)' }} />
          <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            Unable to view task
          </h3>
          <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            {error || `Task '${taskId}' not found or not assigned to you.`}
          </p>
        </Card>
      </div>
    );
  }

  const isAssigned = task.status === 'ASSIGNED';
  const isInProgress = task.status === 'IN_PROGRESS';
  const isResolved = task.status === 'RESOLVED' || task.status === 'CITIZEN_VERIFICATION' || task.status === 'CLOSED';

  return (
    <div className="container" style={{ maxWidth: '760px', paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-12)' }}>
      {/* Back CTA */}
      <Button
        variant="ghost"
        size="sm"
        icon={ArrowLeft}
        onClick={() => onNavigate ? onNavigate('/worker') : (window.location.hash = '/worker')}
        style={{ marginBottom: 'var(--space-4)' }}
      >
        Back to Worker Tasks
      </Button>

      {/* Task Title Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <PriorityBadge priority={task.severity || 'HIGH'} />
          <StatusBadge status={task.status} />
          <span style={{ fontSize: 'var(--font-xs)', fontWeight: 800, color: 'var(--color-brand-primary)' }}>
            Priority {task.priority}
          </span>
          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-tertiary)', marginLeft: 'auto', fontFamily: 'monospace', fontWeight: 800 }}>
            {task.issueId}
          </span>
        </div>

        <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 900, color: 'var(--color-text-primary)' }}>
          {task.title}
        </h1>
      </div>

      {/* Primary Action Banner */}
      <Card style={{ backgroundColor: 'var(--color-bg-surface-elevated)', marginBottom: 'var(--space-6)', borderLeft: `4px solid ${isInProgress ? 'var(--color-brand-primary)' : isResolved ? 'var(--color-status-success)' : 'var(--priority-high)'}` }}>
        <h4 style={{ fontSize: 'var(--font-xs)', fontWeight: 800, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 'var(--space-3)' }}>
          FIELD WORKER ACTIONS
        </h4>

        {isAssigned && (
          <Button
            variant="primary"
            size="lg"
            icon={Play}
            onClick={handleStartWork}
            disabled={actionLoading}
            style={{ width: '100%' }}
          >
            {actionLoading ? 'STARTING TASK...' : 'START WORK (Set Status to IN_PROGRESS)'}
          </Button>
        )}

        {isInProgress && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Button
              variant="success"
              size="lg"
              icon={CheckCircle2}
              onClick={() => setResolveModalOpen(true)}
              style={{ width: '100%' }}
            >
              MARK RESOLVED & UPLOAD EVIDENCE
            </Button>
            <WorkerUpdateForm onPostUpdate={handlePostUpdate} />
          </div>
        )}

        {isResolved && (
          <div>
            <div style={{ color: 'var(--color-status-success)', fontWeight: 800, fontSize: 'var(--font-sm)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 'var(--space-3)' }}>
              <CheckCircle2 size={20} /> Resolution Submitted — Awaiting Citizen Verification
            </div>
            {task.resolution && (
              <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-bg-surface)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-xs)' }}>
                <strong>Resolution Note:</strong> {task.resolution.note}
                {task.resolution.evidence && task.resolution.evidence.length > 0 && (
                  <div style={{ marginTop: 'var(--space-2)' }}>
                    <strong>Proof Photo:</strong>
                    <img
                      src={task.resolution.evidence[0].url}
                      alt="Resolution Proof"
                      style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginTop: '4px' }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Location Details Card */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <LocationCard location={task.location} />
      </div>

      {/* Citizen Report & Evidence */}
      <Card style={{ marginBottom: 'var(--space-6)' }}>
        <h3 style={{ fontSize: 'var(--font-sm)', fontWeight: 800, color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: 'var(--space-3)' }}>
          CITIZEN REPORT & EVIDENCE
        </h3>

        <p style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-4)' }}>
          {task.description}
        </p>

        {task.evidence && task.evidence.length > 0 && (
          <div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>
              Citizen Photo Evidence
            </span>
            <img
              src={task.evidence[0].url || task.evidence[0]}
              alt="Citizen Evidence"
              style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginTop: '4px' }}
            />
          </div>
        )}
      </Card>

      {/* AI Analysis Summary if available */}
      {task.aiAnalysis && (
        <Card style={{ marginBottom: 'var(--space-6)', backgroundColor: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-brand-primary)', marginBottom: 'var(--space-2)' }}>
            <Sparkles size={16} />
            <h4 style={{ fontSize: 'var(--font-xs)', fontWeight: 800, textTransform: 'uppercase' }}>
              AI Civic Intelligence Context
            </h4>
          </div>
          <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            {task.aiAnalysis.summary}
          </p>
        </Card>
      )}

      {/* Task Timeline History */}
      <Card>
        <h3 style={{ fontSize: 'var(--font-sm)', fontWeight: 800, color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: 'var(--space-4)' }}>
          LIFECYCLE TIMELINE
        </h3>
        <TaskTimeline timeline={task.timeline} currentStatus={task.status} />
      </Card>

      {/* Resolution Submission Modal */}
      <Modal isOpen={resolveModalOpen} onClose={() => setResolveModalOpen(false)} title="MARK ISSUE RESOLVED">
        <ResolutionForm
          onSubmitResolution={handleSubmitResolution}
          onCancel={() => setResolveModalOpen(false)}
        />
      </Modal>
    </div>
  );
};
