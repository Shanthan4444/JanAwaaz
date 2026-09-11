import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, XCircle, CheckCircle2, UserPlus, RefreshCw, Trophy, Medal, Phone } from 'lucide-react';
import { Card } from '../../shared/components/Card';
import { Button } from '../../shared/components/Button';
import { Input } from '../../shared/components/Input';
import { Modal } from '../../shared/components/Modal';
import { authorityApi } from '../../services/api/authorityApi';
import { useAuth } from '../../services/auth/AuthProvider';

export const WorkerAuditScoreboard = ({ onNavigate, externalModalOpen = false, onExternalModalClose }) => {
  const { user } = useAuth();
  const [workers, setWorkers] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hire Staff Modal State
  const [hireModalOpen, setHireModalOpen] = useState(false);
  const [workerName, setWorkerName] = useState('');
  const [workerPassword, setWorkerPassword] = useState('');
  const [department, setDepartment] = useState(user?.department || 'Roads & Infrastructure');

  useEffect(() => {
    if (externalModalOpen) {
      setHireModalOpen(true);
    }
  }, [externalModalOpen]);

  useEffect(() => {
    if (user?.department && user.department !== 'General' && user.department !== 'Global') {
      setDepartment(user.department);
    }
  }, [user]);
  const [skill, setSkill] = useState('');
  const [role, setRole] = useState('Field Technician');
  const [hireLoading, setHireLoading] = useState(false);
  const [hireError, setHireError] = useState(null);

  const fetchAuditData = async () => {
    setLoading(true);
    try {
      const [workersRes, issuesRes] = await Promise.all([
        authorityApi.getWorkers().catch(() => []),
        authorityApi.getIssues().catch(() => [])
      ]);
      setWorkers(workersRes || []);
      setIssues(issuesRes || []);
    } catch (err) {
      console.warn('[WORKER AUDIT SCOREBOARD FETCH WARN]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
  }, []);

  const handleHireSubmit = async (e) => {
    e.preventDefault();
    if (!workerName.trim() || !workerPassword.trim()) {
      setHireError('Worker Name and Password are required.');
      return;
    }

    setHireLoading(true);
    setHireError(null);

    try {
      await authorityApi.hireWorker({
        name: workerName.trim(),
        password: workerPassword.trim(),
        department: department || user?.department || 'Roads & Infrastructure',
        skill: skill.trim() || 'General Field Operations',
        role: role.trim() || 'Field Technician'
      });

      setWorkerName('');
      setWorkerPassword('');
      setSkill('');
      setHireModalOpen(false);
      await fetchAuditData();
    } catch (err) {
      console.error('[HIRE WORKER ERROR]', err);
      setHireError(err.message || 'Failed to hire field worker.');
    } finally {
      setHireLoading(false);
    }
  };

  // Build worker stats map dynamically based on actual database workers
  const workerStatsMap = {};

  workers.forEach((w) => {
    const key = w.employeeId || w.name;
    workerStatsMap[key] = {
      id: w.employeeId || w._id,
      name: w.name,
      phone: w.phone || '9876543210',
      department: w.department,
      role: w.role || 'Field Technician',
      completed: w.completedTasksCount || 0,
      inProgress: w.activeTasksCount || 0,
      rejected: 0,
      civicScore: w.civicScore || 90,
      rejectedIssues: []
    };
  });

  // Calculate live task progress and rejections from issue records
  issues.forEach((issue) => {
    const workerKey = issue.assignedWorker?.id || issue.assignedWorker?.name;
    if (workerKey && workerStatsMap[workerKey]) {
      if (issue.status === 'RESOLVED' || issue.status === 'CITIZEN_VERIFICATION' || issue.status === 'CLOSED') {
        workerStatsMap[workerKey].completed += 1;
      } else if (issue.status === 'IN_PROGRESS' || issue.status === 'ASSIGNED') {
        workerStatsMap[workerKey].inProgress += 1;
      } else if (issue.status === 'REJECTED_BY_WORKER' || issue.workerDecision?.action === 'REJECTED') {
        workerStatsMap[workerKey].rejected += 1;
        workerStatsMap[workerKey].rejectedIssues.push(issue);
      }
    }
  });

  const workerStats = Object.values(workerStatsMap);
  // Sort for Performance Leaderboard (Completed desc, then Score desc)
  const leaderboard = [...workerStats].sort((a, b) => (b.completed - a.completed) || (b.civicScore - a.civicScore));
  const allRejectedIssues = issues.filter((i) => i.status === 'REJECTED_BY_WORKER' || i.workerDecision?.action === 'REJECTED');

  return (
    <div id="worker-scoreboard" style={{ marginTop: 'var(--space-8)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={24} style={{ color: 'var(--color-brand-primary)' }} />
            <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 900, color: 'var(--color-text-primary)' }}>
              FIELD WORKER ACCOUNTABILITY & AUDIT SCOREBOARD
            </h2>
          </div>
          <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            Direct worker dispatch monitoring: Hire field staff, track accepts/completions, and view real-time performance leaderboard.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Button variant="ghost" size="sm" icon={RefreshCw} onClick={fetchAuditData} disabled={loading}>
            Refresh
          </Button>
          <Button variant="primary" size="sm" icon={UserPlus} onClick={() => setHireModalOpen(true)}>
            + HIRE FIELD STAFF
          </Button>
        </div>
      </div>

      {/* 1. WORKER PERFORMANCE LEADERBOARD */}
      {leaderboard.length > 0 && (
        <Card style={{ backgroundColor: 'var(--color-bg-surface-elevated)', border: '1px solid var(--color-brand-border)', padding: 'var(--space-5)', borderRadius: 'var(--radius-xl)', marginBottom: 'var(--space-6)', boxShadow: 'var(--shadow-glow-indigo)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-3)' }}>
            <Trophy size={20} color="#F59E0B" />
            <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 900, color: 'var(--color-text-primary)' }}>
              🏆 WORKER PERFORMANCE LEADERBOARD
            </h3>
            <span className="badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', fontWeight: 800 }}>
              Ranked by Task Completions
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-3)' }}>
            {leaderboard.slice(0, 3).map((topWorker, rankIdx) => {
              const medalEmoji = rankIdx === 0 ? '🥇 1st Rank' : rankIdx === 1 ? '🥈 2nd Rank' : '🥉 3rd Rank';
              const borderCol = rankIdx === 0 ? '#F59E0B' : rankIdx === 1 ? '#94A3B8' : '#D97706';

              return (
                <div key={rankIdx} style={{ backgroundColor: 'var(--color-bg-surface)', border: `2px solid ${borderCol}`, padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 900, color: borderCol }}>
                      {medalEmoji}
                    </span>
                    <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-status-success)', fontWeight: 800 }}>
                      Score {topWorker.civicScore} Pts
                    </span>
                  </div>

                  <h4 style={{ fontSize: 'var(--font-sm)', fontWeight: 900, color: 'var(--color-text-primary)' }}>
                    {topWorker.name}
                  </h4>
                  <div style={{ fontSize: '11px', color: 'var(--color-brand-primary)', fontWeight: 700 }}>
                    {topWorker.department} ({topWorker.role})
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '10px', fontSize: 'var(--font-xs)' }}>
                    <div>
                      <span style={{ color: 'var(--color-text-tertiary)', fontSize: '10px' }}>COMPLETED</span>
                      <div style={{ fontWeight: 900, color: 'var(--color-status-success)', fontSize: '14px' }}>
                        {topWorker.completed} Tasks
                      </div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--color-text-tertiary)', fontSize: '10px' }}>ACTIVE</span>
                      <div style={{ fontWeight: 800, color: 'var(--color-text-primary)' }}>
                        {topWorker.inProgress}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--color-text-tertiary)', fontSize: '10px' }}>CONTACT</span>
                      <div style={{ fontWeight: 800, color: 'var(--color-brand-primary)' }}>
                        {topWorker.phone}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* 2. Worker Accountability Metrics Table */}
      <Card style={{ padding: 0, overflow: 'hidden', marginBottom: 'var(--space-6)' }}>
        {workerStats.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-tertiary)' }}>
            <h4 style={{ fontSize: 'var(--font-sm)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              No Field Workers Hired Yet
            </h4>
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: '4px', marginBottom: 'var(--space-4)' }}>
              As a Municipal Officer, click "+ HIRE STAFF" above to enter a worker's Name and Password to create field technicians.
            </p>
            <Button variant="primary" size="sm" icon={UserPlus} onClick={() => setHireModalOpen(true)}>
              + HIRE STAFF NOW
            </Button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--font-xs)' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-bg-surface-elevated)', borderBottom: '1px solid var(--color-border-subtle)', color: 'var(--color-text-secondary)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Field Worker Name</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Department</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Role & Phone</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Tasks Completed</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Tasks In-Progress</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Rejected (Not Genuine)</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Audit Rating</th>
                </tr>
              </thead>
              <tbody>
                {workerStats.map((w, idx) => {
                  const isHighReject = w.rejected > 2;
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                        <div>{w.name}</div>
                        <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--color-text-tertiary)' }}>ID: {w.id}</span>
                      </td>

                      <td style={{ padding: '14px 16px', color: 'var(--color-brand-primary)', fontWeight: 600 }}>
                        {w.department}
                      </td>

                      <td style={{ padding: '14px 16px', color: 'var(--color-text-secondary)' }}>
                        <div>{w.role}</div>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>📞 {w.phone}</span>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-status-success)', fontWeight: 800 }}>
                          ✓ {w.completed} Tasks Done
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <span className="badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6', fontWeight: 800 }}>
                          ⚙️ {w.inProgress} Active
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <span className="badge" style={{ backgroundColor: isHighReject ? 'rgba(239, 68, 68, 0.15)' : 'var(--color-bg-surface-elevated)', color: isHighReject ? 'var(--color-status-danger)' : 'var(--color-text-secondary)', fontWeight: 800 }}>
                          🛑 {w.rejected} Rejected
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        {isHighReject ? (
                          <span style={{ color: 'var(--color-status-danger)', fontWeight: 900, fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <AlertTriangle size={14} /> HIGH REJECTION
                          </span>
                        ) : (
                          <span style={{ color: 'var(--color-status-success)', fontWeight: 900, fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={14} /> ACTIVE WORKER ({w.civicScore} Pts)
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 3. Worker Rejections Audit Log */}
      <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <XCircle size={18} color="var(--color-status-danger)" /> LOG OF WORKER-REJECTED COMPLAINTS ({allRejectedIssues.length})
      </h3>

      {allRejectedIssues.length === 0 ? (
        <Card style={{ backgroundColor: 'var(--color-bg-surface-elevated)', textAlign: 'center', padding: 'var(--space-6)', fontSize: 'var(--font-xs)', color: 'var(--color-text-tertiary)' }}>
          No citizen complaints have been rejected by field workers yet.
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {allRejectedIssues.map((issue) => (
            <Card key={issue.issueId || issue._id} style={{ backgroundColor: 'var(--color-bg-surface-elevated)', borderLeft: '4px solid var(--color-status-danger)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '10px', fontFamily: 'monospace', fontWeight: 800, color: 'var(--color-brand-primary)' }}>
                  {issue.issueId} • {issue.department}
                </span>
                <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-status-danger)', fontWeight: 800 }}>
                  Rejected by Worker: <strong>{issue.workerDecision?.workerName || 'Field Worker'}</strong>
                </span>
              </div>

              <h4 style={{ fontSize: 'var(--font-sm)', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                {issue.title}
              </h4>

              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', border: '1px solid var(--color-status-danger)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-xs)', color: 'var(--color-status-danger)', margin: 'var(--space-2) 0' }}>
                <strong>Worker Rejection Explanation:</strong> "{issue.workerDecision?.rejectionReason || 'No detailed reason entered.'}"
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* HIRE STAFF MODAL */}
      <Modal
        isOpen={hireModalOpen}
        onClose={() => {
          setHireModalOpen(false);
          if (onExternalModalClose) onExternalModalClose();
        }}
        title={`Create Field Worker for ${user?.department || 'Department'}`}
      >
        <form onSubmit={handleHireSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {hireError && (
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--color-status-danger)', padding: '10px', borderRadius: 'var(--radius-md)', color: 'var(--color-status-danger)', fontSize: 'var(--font-xs)', fontWeight: 700 }}>
              ⚠️ {hireError}
            </div>
          )}

          <Input
            label="Field Worker Full Name"
            placeholder="e.g. Ramesh Kumar"
            value={workerName}
            onChange={(e) => setWorkerName(e.target.value)}
            required
          />

          <Input
            label="Login Password"
            type="password"
            placeholder="Set a password for the worker to log in..."
            value={workerPassword}
            onChange={(e) => setWorkerPassword(e.target.value)}
            required
          />

          {user?.department && user.department !== 'General' && user.department !== 'Global' ? (
            <Input
              label="Assigned Department (Locked to your Officer Authority)"
              value={`🏢 ${user.department}`}
              readOnly
            />
          ) : (
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>
                Assigned Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border-default)', color: 'var(--color-text-primary)', fontSize: 'var(--font-sm)' }}
              >
                <option value="Electrical Department">⚡ Electrical Department</option>
                <option value="Water Supply & Sewerage Department">💧 Water Supply & Sewerage Department</option>
                <option value="Roads & Infrastructure Department">🛣️ Roads & Infrastructure Department</option>
                <option value="Municipal Department">🏛️ Municipal Department</option>
                <option value="Fire Department">🔥 Fire Department</option>
              </select>
            </div>
          )}

          <Input
            label="Role Title / Specialization (Optional)"
            placeholder="e.g. Electrical Technician, Line Repair Lead, Sanitation Staff"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
          />

          <Button type="submit" variant="primary" size="lg" disabled={hireLoading} style={{ width: '100%', marginTop: 'var(--space-2)' }}>
            {hireLoading ? 'HIRING FIELD WORKER...' : 'CREATE & ASSIGN WORKER ACCOUNT ➔'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};
