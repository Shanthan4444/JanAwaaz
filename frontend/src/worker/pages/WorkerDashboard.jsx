import React, { useState, useEffect } from 'react';
import { workerApi } from '../../services/api/workerApi';
import { WorkerHeader } from '../components/WorkerHeader';
import { WorkerMetrics } from '../components/WorkerMetrics';
import { WorkerTaskCard } from '../components/WorkerTaskCard';
import { RefreshCw, Filter, AlertCircle, Wrench, XCircle, CheckCircle } from 'lucide-react';
import { Button } from '../../shared/components/Button';
import { Textarea } from '../../shared/components/Textarea';
import { Modal } from '../../shared/components/Modal';

export const WorkerDashboard = ({ onNavigate }) => {
  const [profile, setProfile] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('Department Queue'); // Department Queue, Active, Resolved, Rejected, All

  // Rejection Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedTaskForReject, setSelectedTaskForReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [profData, tasksData] = await Promise.all([
        workerApi.getProfile().catch(() => null),
        workerApi.getTasks()
      ]);

      if (profData) setProfile(profData);
      setTasks(tasksData || []);
    } catch (err) {
      console.error('[WORKER DASHBOARD ERROR]', err);
      setError(err.message || 'Failed to load assigned tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Worker Direct Acceptance Handler
  const handleAcceptTask = async (issueId) => {
    try {
      await workerApi.acceptTask(issueId);
      await loadDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to accept task.');
    }
  };

  // Open Rejection Modal
  const handleOpenRejectModal = (task) => {
    setSelectedTaskForReject(task);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  // Confirm Rejection Submission
  const handleConfirmReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a detailed rejection explanation.');
      return;
    }

    setRejecting(true);
    try {
      await workerApi.rejectTask(selectedTaskForReject.issueId || selectedTaskForReject.id, rejectionReason.trim());
      setRejectModalOpen(false);
      await loadDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to reject task.');
    } finally {
      setRejecting(false);
    }
  };

  const getFilteredTasks = () => {
    if (activeFilter === 'Department Queue') {
      return tasks.filter((t) => t.status === 'REPORTED' || t.status === 'ASSIGNED');
    }
    if (activeFilter === 'Active') {
      return tasks.filter((t) => t.status === 'IN_PROGRESS');
    }
    if (activeFilter === 'Resolved') {
      return tasks.filter((t) => t.status === 'RESOLVED' || t.status === 'CITIZEN_VERIFICATION' || t.status === 'CLOSED');
    }
    if (activeFilter === 'Rejected') {
      return tasks.filter((t) => t.status === 'REJECTED_BY_WORKER');
    }
    return tasks;
  };

  const filteredTasks = getFilteredTasks();

  return (
    <div className="container" style={{ maxWidth: '840px', paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-12)' }}>
      {/* Worker Header */}
      <WorkerHeader profile={profile} onNavigate={onNavigate} />

      {/* Real Worker Metrics */}
      <WorkerMetrics tasks={tasks} />

      {/* Section Title & Filter Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <div>
          <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 900, color: 'var(--color-text-primary)', letterSpacing: '0.02em' }}>
            DIRECT WORKER TASK QUEUE ({filteredTasks.length})
          </h2>
          <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            Department: <strong>{profile?.department || 'Field Services'}</strong> • Accept genuine tasks or reject fake issues with explanation
          </p>
        </div>

        <Button variant="ghost" size="sm" icon={RefreshCw} onClick={loadDashboardData} disabled={loading}>
          REFRESH
        </Button>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-2)',
          marginBottom: 'var(--space-6)',
          overflowX: 'auto',
          paddingBottom: '4px'
        }}
      >
        {['Department Queue', 'Active', 'Resolved', 'Rejected', 'All'].map((tab) => {
          const isActive = activeFilter === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                backgroundColor: isActive ? 'var(--color-brand-primary)' : 'var(--color-bg-surface-elevated)',
                color: isActive ? '#FFF' : 'var(--color-text-secondary)',
                fontWeight: isActive ? 800 : 600,
                fontSize: 'var(--font-xs)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Error state */}
      {error && (
        <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--color-status-danger)', color: 'var(--color-status-danger)', fontSize: 'var(--font-xs)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-4)' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-text-tertiary)' }}>
          <RefreshCw size={28} className="spin" style={{ margin: '0 auto var(--space-2)' }} />
          <p style={{ fontSize: 'var(--font-xs)', fontWeight: 700 }}>Loading department task queue...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)', backgroundColor: 'var(--color-bg-surface-elevated)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-subtle)' }}>
          <Wrench size={36} style={{ color: 'var(--color-text-tertiary)', margin: '0 auto var(--space-2)' }} />
          <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            No tasks found in '{activeFilter}'
          </h3>
          <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Direct worker dispatch active. New citizen reports will automatically appear here for your department.
          </p>
        </div>
      ) : (
        /* Task Cards List */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {filteredTasks.map((task) => (
            <WorkerTaskCard
              key={task.issueId || task._id}
              task={task}
              onNavigate={onNavigate}
              onAcceptTask={handleAcceptTask}
              onRejectTask={handleOpenRejectModal}
            />
          ))}
        </div>
      )}

      {/* Rejection Modal */}
      <Modal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)} title="Reject Civic Issue Report">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', border: '1px solid var(--color-status-danger)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-xs)', color: 'var(--color-status-danger)' }}>
            🛑 You are marking issue <strong>{selectedTaskForReject?.issueId}</strong> as <strong>NOT GENUINE</strong>. This decision will be logged and audited by municipal authorities.
          </div>

          <Textarea
            label="Rejection Explanation (Required)"
            placeholder="Explain why this issue is not genuine, fake, or invalid (e.g. 'Site inspected: No pothole exists at specified coordinates')..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
          />

          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setRejectModalOpen(false)}>
              CANCEL
            </Button>
            <Button
              variant="danger"
              icon={XCircle}
              onClick={handleConfirmReject}
              disabled={rejecting || !rejectionReason.trim()}
            >
              {rejecting ? 'SUBMITTING REJECTION...' : 'SUBMIT REJECTION & EXPLANATION'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
