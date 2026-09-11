import React from 'react';
import { PriorityBadge } from '../../shared/components/PriorityBadge';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { Button } from '../../shared/components/Button';
import { useAuth } from '../../services/auth/AuthProvider';
import { Navigation, ArrowRight, CheckCircle2, XCircle, Play } from 'lucide-react';

export const WorkerTaskCard = ({ task, onNavigate, onAcceptTask, onRejectTask }) => {
  const { user } = useAuth();
  const currentWorkerIds = [user?.id, user?.employeeId].filter(Boolean);
  const isAssignedToOther = task.assignedWorker?.id && !currentWorkerIds.includes(task.assignedWorker.id);

  const isCritical = task.priority >= 90 || task.severity === 'CRITICAL';
  const isReportedOrAssigned = (task.status === 'REPORTED' || task.status === 'ASSIGNED') && !isAssignedToOther;
  const isInProgress = task.status === 'IN_PROGRESS' && !isAssignedToOther;
  const isResolved = task.status === 'RESOLVED' || task.status === 'CITIZEN_VERIFICATION' || task.status === 'CLOSED';
  const isRejected = task.status === 'REJECTED_BY_WORKER';

  return (
    <div
      className="card-container"
      style={{
        borderLeft: `4px solid ${isRejected ? 'var(--color-status-danger)' : isCritical ? 'var(--priority-critical)' : 'var(--priority-high)'}`,
        padding: 'var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease'
      }}
    >
      {/* Badges & ID */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          <PriorityBadge priority={task.severity || 'HIGH'} />
          <StatusBadge status={task.status} />
          <span style={{ fontSize: 'var(--font-xs)', fontWeight: 800, color: 'var(--color-brand-primary)' }}>
            Score {task.priority}/100
          </span>
        </div>
        <span style={{ fontSize: 'var(--font-xs)', fontFamily: 'monospace', color: 'var(--color-text-tertiary)', fontWeight: 800 }}>
          {task.issueId}
        </span>
      </div>

      {/* Title & Description */}
      <div>
        <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
          {task.title}
        </h3>
        <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
          {task.description}
        </p>
      </div>

      {/* Emergency Escalation Bonus Banner */}
      {task.escalation?.isEscalated && (
        <div style={{ backgroundColor: 'var(--color-brand-subtle)', border: '1px solid var(--color-brand-primary)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', boxShadow: 'var(--shadow-glow-indigo)' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-brand-primary)' }}>
            🔥 ESCALATED TASK (Backup Worker Assigned)
            <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Original worker failed 24s SLA. Complete now for bonus.</div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <span className="badge" style={{ backgroundColor: 'var(--color-brand-primary)', color: '#FFF', fontWeight: 900, fontSize: '11px' }}>
              💰 ₹{task.escalation?.incentiveAmount || 150} BONUS
            </span>
            <div style={{ fontSize: '9px', color: 'var(--status-resolved)', fontWeight: 800, marginTop: '2px' }}>+5 CIVIC SCORE</div>
          </div>
        </div>
      )}

      {/* Location & Department Info */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', borderTop: '1px solid var(--color-border-subtle)', paddingTop: 'var(--space-2)', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Navigation size={14} style={{ color: 'var(--color-brand-primary)', flexShrink: 0 }} />
          <span style={{ fontWeight: 600 }}>
            {task.location?.area || 'Sector Area'}
            {task.location?.landmark ? ` • ${task.location.landmark}` : ''}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span className="badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', color: 'var(--color-status-danger)', fontSize: '10px', fontWeight: 800 }}>
            ⏱️ 24s DEMO SLA
          </span>
          <span className="badge" style={{ backgroundColor: 'var(--color-brand-subtle)', color: 'var(--color-brand-primary)', fontSize: '10px' }}>
            {task.department}
          </span>
        </div>
      </div>

      {/* Worker Rejection Banner if Rejected */}
      {isRejected && (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', border: '1px solid var(--color-status-danger)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', fontSize: '11px', color: 'var(--color-status-danger)' }}>
          <strong>🛑 REJECTED BY WORKER (NOT GENUINE):</strong> "{task.workerDecision?.rejectionReason || 'Marked as invalid / duplicate report.'}"
        </div>
      )}

      {/* Assigned to Other Worker Banner */}
      {isAssignedToOther && (
        <div style={{ backgroundColor: 'var(--color-bg-surface-hover)', border: '1px solid var(--color-border-subtle)', padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
          🔒 Assigned to worker: <strong>{task.assignedWorker?.name}</strong>
        </div>
      )}

      {/* Direct Worker Action Buttons */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-1)', flexWrap: 'wrap' }}>
        <Button
          variant="outline"
          size="sm"
          icon={ArrowRight}
          iconPosition="right"
          onClick={() => onNavigate ? onNavigate(`/worker/tasks/${task.issueId}`) : (window.location.hash = `/worker/tasks/${task.issueId}`)}
          style={{ flex: 1 }}
        >
          VIEW DETAILS
        </Button>

        {isReportedOrAssigned && (
          <>
            <Button
              variant="primary"
              size="sm"
              icon={Play}
              onClick={() => onAcceptTask && onAcceptTask(task.issueId)}
              style={{ flex: 1 }}
            >
              ACCEPT TASK
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={XCircle}
              onClick={() => onRejectTask && onRejectTask(task)}
              style={{ flex: 1 }}
            >
              REJECT / NOT GENUINE
            </Button>
          </>
        )}

        {isInProgress && (
          <Button
            variant="success"
            size="sm"
            icon={CheckCircle2}
            onClick={() => onNavigate ? onNavigate(`/worker/tasks/${task.issueId}`) : (window.location.hash = `/worker/tasks/${task.issueId}`)}
            style={{ flex: 1 }}
          >
            SUBMIT PROOF
          </Button>
        )}

        {isResolved && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--font-xs)', color: 'var(--color-status-success)', fontWeight: 800, padding: '0 8px' }}>
            <CheckCircle2 size={16} /> WORK COMPLETED
          </div>
        )}
      </div>
    </div>
  );
};
