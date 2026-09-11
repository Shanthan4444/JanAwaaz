import React, { useState, useEffect } from 'react';
import {
  Building2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  UserPlus,
  Filter,
  Flame,
  Search,
  Zap,
  Users,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../services/auth/AuthProvider';
import { departmentApi } from '../../services/api/departmentApi';
import { LeafletMapPicker } from '../../shared/components/LeafletMapPicker';
import { Button } from '../../shared/components/Button';
import { Input } from '../../shared/components/Input';
import { Modal } from '../../shared/components/Modal';

export const DepartmentDashboard = ({ onNavigate }) => {
  const { user } = useAuth();
  const departmentName = user?.department || 'Roads & Infrastructure';

  const [issues, setIssues] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('QUEUE'); // QUEUE | MAP | WORKERS

  // Add Worker Modal
  const [addWorkerModal, setAddWorkerModal] = useState(false);
  const [newWorker, setNewWorker] = useState({
    name: '',
    employeeId: '',
    phone: '',
    skill: 'General Maintenance',
    role: 'Field Technician'
  });
  const [workerSubmitLoading, setWorkerSubmitLoading] = useState(false);

  // Live Timer tick for Demo SLA
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [issuesRes, workersRes] = await Promise.all([
        departmentApi.getIssues(),
        departmentApi.getWorkers()
      ]);
      setIssues(issuesRes || []);
      setWorkers(workersRes || []);
    } catch (err) {
      console.error('[DEPT DASHBOARD ERROR]', err);
      setError('Could not load department dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 6000);
    return () => clearInterval(interval);
  }, [departmentName]);

  // Handle Add Worker
  const handleAddWorker = async (e) => {
    e.preventDefault();
    if (!newWorker.name || !newWorker.employeeId || !newWorker.phone) {
      alert('Please fill in Name, Employee ID, and Phone.');
      return;
    }
    setWorkerSubmitLoading(true);
    try {
      const created = await departmentApi.addWorker({
        ...newWorker,
        department: departmentName
      });
      setWorkers([created, ...workers]);
      setAddWorkerModal(false);
      setNewWorker({ name: '', employeeId: '', phone: '', skill: 'General Maintenance', role: 'Field Technician' });
    } catch (err) {
      alert(err.message || 'Failed to add worker.');
    } finally {
      setWorkerSubmitLoading(false);
    }
  };

  // Toggle Worker Status
  const handleToggleWorkerStatus = async (workerId, currentStatus) => {
    const newStatus = currentStatus === 'INACTIVE' ? 'AVAILABLE' : 'INACTIVE';
    try {
      const updated = await departmentApi.updateWorkerStatus(workerId, newStatus);
      setWorkers(workers.map((w) => (w._id === updated._id || w.employeeId === updated.employeeId ? updated : w)));
    } catch (err) {
      alert('Failed to update worker status.');
    }
  };

  // Filtered Issues Logic
  const filteredIssues = issues.filter((iss) => {
    if (severityFilter !== 'ALL' && iss.severity !== severityFilter) return false;
    if (statusFilter !== 'ALL' && iss.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchId = iss.issueId?.toLowerCase().includes(q);
      const matchTitle = iss.title?.toLowerCase().includes(q);
      const matchArea = iss.location?.area?.toLowerCase().includes(q);
      if (!matchId && !matchTitle && !matchArea) return false;
    }
    return true;
  });

  // Calculate KPI Counts
  const totalActive = issues.filter((i) => ['REPORTED', 'ASSIGNED', 'IN_PROGRESS'].includes(i.status)).length;
  const unassignedCount = issues.filter((i) => i.status === 'REPORTED').length;
  const inProgressCount = issues.filter((i) => i.status === 'IN_PROGRESS').length;
  const slaWarningCount = issues.filter((i) => i.sla?.status === 'SLA_WARNING').length;
  const slaBreachedCount = issues.filter((i) => i.sla?.status === 'SLA_BREACHED' || i.escalation?.isEscalated).length;
  const resolvedCount = issues.filter((i) => ['RESOLVED', 'CLOSED', 'CITIZEN_VERIFICATION'].includes(i.status)).length;
  const reopenedCount = issues.filter((i) => i.status === 'REOPENED').length;

  // Format SLA Countdown helper (24-second Demo SLA)
  const renderSlaBadge = (issue) => {
    if (['RESOLVED', 'CLOSED', 'CITIZEN_VERIFICATION'].includes(issue.status)) {
      return <span className="badge" style={{ backgroundColor: 'var(--color-status-resolved)', color: '#FFF' }}>RESOLVED</span>;
    }

    const expiresAt = issue.sla?.expiresAt ? new Date(issue.sla.expiresAt) : new Date(new Date(issue.createdAt).getTime() + 24 * 1000);
    const diffMs = expiresAt.getTime() - now.getTime();
    const secondsLeft = Math.max(0, Math.floor(diffMs / 1000));

    if (secondsLeft === 0 || issue.sla?.status === 'SLA_BREACHED' || issue.escalation?.isEscalated) {
      return (
        <span className="badge animate-pulse" style={{ backgroundColor: 'var(--color-status-danger)', color: '#FFF', fontWeight: 800 }}>
          🚨 SLA BREACHED (ESCALATED ₹150)
        </span>
      );
    }

    if (secondsLeft <= 12) {
      return (
        <span className="badge" style={{ backgroundColor: '#F59E0B', color: '#FFF', fontWeight: 800 }}>
          ⚠️ SLA WARNING ({secondsLeft}s left)
        </span>
      );
    }

    return (
      <span className="badge" style={{ backgroundColor: 'var(--color-brand-subtle)', color: 'var(--color-brand-primary)', fontWeight: 800 }}>
        ⏱️ {secondsLeft}s remaining
      </span>
    );
  };

  return (
    <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--color-brand-primary)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.08em' }}>
              OPERATIONAL COMMAND QUEUE
            </span>
            <span className="badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-status-danger)', fontWeight: 800 }}>
              ⏱️ DEMO MODE (24 SECONDS SLA)
            </span>
          </div>
          <h1 style={{ fontSize: 'var(--font-3xl)', fontWeight: 900, color: 'var(--color-text-primary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Building2 size={32} color="var(--color-brand-primary)" /> {departmentName.toUpperCase()}
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Button
            variant={activeTab === 'QUEUE' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('QUEUE')}
          >
            📋 ISSUE QUEUE ({issues.length})
          </Button>
          <Button
            variant={activeTab === 'MAP' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('MAP')}
          >
            🗺️ DEPARTMENT MAP
          </Button>
          <Button
            variant={activeTab === 'WORKERS' ? 'primary' : 'secondary'}
            icon={Users}
            onClick={() => setActiveTab('WORKERS')}
          >
            👷 WORKERS ({workers.length})
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
        <div style={{ backgroundColor: 'var(--color-bg-surface-elevated)', border: '1px solid var(--color-border-default)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>TOTAL ACTIVE</div>
          <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 900, color: 'var(--color-text-primary)', marginTop: '2px' }}>{totalActive}</div>
        </div>

        <div style={{ backgroundColor: 'var(--color-bg-surface-elevated)', border: '1px solid var(--color-brand-border)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--color-brand-primary)', textTransform: 'uppercase' }}>UNASSIGNED</div>
          <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 900, color: 'var(--color-brand-primary)', marginTop: '2px' }}>{unassignedCount}</div>
        </div>

        <div style={{ backgroundColor: 'var(--color-bg-surface-elevated)', border: '1px solid var(--color-border-default)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>IN PROGRESS</div>
          <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 900, color: 'var(--color-text-primary)', marginTop: '2px' }}>{inProgressCount}</div>
        </div>

        <div style={{ backgroundColor: 'var(--color-bg-surface-elevated)', border: '1px solid #F59E0B', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: '#F59E0B', textTransform: 'uppercase' }}>SLA WARNING</div>
          <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 900, color: '#F59E0B', marginTop: '2px' }}>{slaWarningCount}</div>
        </div>

        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', border: '1px solid var(--color-status-danger)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--color-status-danger)', textTransform: 'uppercase' }}>SLA BREACHED</div>
          <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 900, color: 'var(--color-status-danger)', marginTop: '2px' }}>{slaBreachedCount}</div>
        </div>

        <div style={{ backgroundColor: 'var(--color-bg-surface-elevated)', border: '1px solid var(--status-resolved)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--status-resolved)', textTransform: 'uppercase' }}>RESOLVED TODAY</div>
          <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 900, color: 'var(--status-resolved)', marginTop: '2px' }}>{resolvedCount}</div>
        </div>

        <div style={{ backgroundColor: 'rgba(225, 29, 72, 0.12)', border: '1px solid var(--status-reopened)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--status-reopened)', textTransform: 'uppercase' }}>REOPENED</div>
          <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 900, color: 'var(--status-reopened)', marginTop: '2px' }}>{reopenedCount}</div>
        </div>
      </div>

      {/* TAB 1: ISSUE QUEUE */}
      {activeTab === 'QUEUE' && (
        <div>
          {/* Filters Bar */}
          <div style={{ backgroundColor: 'var(--color-bg-surface-elevated)', border: '1px solid var(--color-border-default)', padding: 'var(--space-4)', borderRadius: 'var(--radius-xl)', marginBottom: 'var(--space-6)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: 1, minWidth: '240px' }}>
              <Search size={18} color="var(--color-text-tertiary)" />
              <Input
                placeholder="Search by Issue ID, Title, or Location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', margin: 0 }}
              />
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
                <Filter size={14} /> Severity:
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  style={{ backgroundColor: 'var(--color-bg-surface)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-default)', padding: '6px 10px', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-xs)' }}
                >
                  <option value="ALL">All Severities</option>
                  <option value="CRITICAL">🚨 CRITICAL</option>
                  <option value="HIGH">⚡ HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
                Status:
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ backgroundColor: 'var(--color-bg-surface)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-default)', padding: '6px 10px', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-xs)' }}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="REPORTED">REPORTED (Unassigned)</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="SLA_BREACHED">🚨 SLA_BREACHED</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="REOPENED">REOPENED</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="card-container" style={{ overflowX: 'auto', padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-xs)', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-bg-surface)', borderBottom: '1px solid var(--color-border-default)', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', fontSize: '10px', fontWeight: 800 }}>
                  <th style={{ padding: '14px 16px' }}>Issue ID</th>
                  <th style={{ padding: '14px 16px' }}>Category & Title</th>
                  <th style={{ padding: '14px 16px' }}>Location</th>
                  <th style={{ padding: '14px 16px' }}>Severity</th>
                  <th style={{ padding: '14px 16px' }}>Assigned Worker</th>
                  <th style={{ padding: '14px 16px' }}>SLA Status (24s Demo)</th>
                  <th style={{ padding: '14px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredIssues.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-tertiary)' }}>
                      No active operational issues found matching filters in {departmentName}.
                    </td>
                  </tr>
                ) : (
                  filteredIssues.map((issue) => (
                    <tr key={issue.issueId || issue._id} style={{ borderBottom: '1px solid var(--color-border-subtle)', backgroundColor: issue.escalation?.isEscalated ? 'rgba(239, 68, 68, 0.04)' : 'transparent' }}>
                      <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontWeight: 800, color: 'var(--color-brand-primary)' }}>
                        {issue.issueId}
                        {issue.escalation?.isEscalated && (
                          <div style={{ fontSize: '9px', color: 'var(--color-status-danger)', fontWeight: 800, marginTop: '2px' }}>🔥 ESCALATED</div>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 800, color: 'var(--color-text-primary)' }}>{issue.title}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>🏷️ {issue.category}</div>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--color-text-secondary)' }}>
                        📍 {issue.location?.area || 'Hyderabad Sector'}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span className="badge" style={{ backgroundColor: issue.severity === 'CRITICAL' || issue.severity === 'HIGH' ? 'rgba(239, 68, 68, 0.15)' : 'var(--color-brand-subtle)', color: issue.severity === 'CRITICAL' || issue.severity === 'HIGH' ? 'var(--color-status-danger)' : 'var(--color-brand-primary)', fontWeight: 800 }}>
                          {issue.severity} ({issue.priority}/100)
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                          👷 {issue.assignedWorker?.name || 'Unassigned'}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>{issue.assignedWorker?.phone || ''}</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {renderSlaBadge(issue)}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onNavigate ? onNavigate(`/authority/issues/${issue.issueId}`) : (window.location.hash = `/authority/issues/${issue.issueId}`)}
                        >
                          INSPECT ➔
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DEPARTMENT MAP */}
      {activeTab === 'MAP' && (
        <div className="card-container" style={{ padding: 'var(--space-6)' }}>
          <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🗺️ {departmentName.toUpperCase()} ACTIVE ISSUE GIS LOCATIONS
          </h2>
          <LeafletMapPicker
            initialLocation={{
              latitude: 17.4483,
              longitude: 78.3915,
              area: `${departmentName} Operational Sector`
            }}
          />
        </div>
      )}

      {/* TAB 3: WORKER MANAGEMENT */}
      {activeTab === 'WORKERS' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
            <div>
              <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 900, color: 'var(--color-text-primary)' }}>
                {departmentName.toUpperCase()} PERSONNEL & TECHNICIANS
              </h2>
              <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                Manage department-specific field technicians, roles, specializations, availability, and civic performance scores.
              </p>
            </div>
            <Button
              variant="primary"
              icon={UserPlus}
              onClick={() => setAddWorkerModal(true)}
            >
              + ADD TECHNICIAN
            </Button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
            {workers.map((w) => (
              <div key={w._id || w.employeeId} className="card-container" style={{ padding: 'var(--space-5)', borderLeft: `4px solid ${w.status === 'AVAILABLE' ? 'var(--status-resolved)' : w.status === 'BUSY' ? 'var(--color-brand-primary)' : 'var(--color-status-danger)'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                  <div>
                    <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                      {w.name}
                    </h3>
                    <div style={{ fontSize: '11px', color: 'var(--color-brand-primary)', fontWeight: 700 }}>
                      ID: {w.employeeId} • {w.role || 'Technician'}
                    </div>
                  </div>
                  <span className="badge" style={{ backgroundColor: w.status === 'AVAILABLE' ? 'rgba(16, 185, 129, 0.15)' : w.status === 'BUSY' ? 'var(--color-brand-subtle)' : 'rgba(239, 68, 68, 0.15)', color: w.status === 'AVAILABLE' ? 'var(--status-resolved)' : w.status === 'BUSY' ? 'var(--color-brand-primary)' : 'var(--color-status-danger)', fontWeight: 800 }}>
                    {w.status || 'AVAILABLE'}
                  </span>
                </div>

                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: 'var(--space-4)' }}>
                  <div>📞 Mobile: <strong>+91 {w.phone}</strong></div>
                  <div>🎯 Specialization: <strong>{w.skill || 'General Maintenance'}</strong></div>
                  <div>🏆 Civic Score: <strong style={{ color: 'var(--color-brand-primary)' }}>{w.civicScore || 92}/100</strong></div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <Button
                    variant={w.status === 'INACTIVE' ? 'primary' : 'danger'}
                    size="sm"
                    onClick={() => handleToggleWorkerStatus(w._id || w.employeeId, w.status)}
                    style={{ width: '100%' }}
                  >
                    {w.status === 'INACTIVE' ? 'REACTIVATE WORKER' : 'DEACTIVATE (MAKE INACTIVE)'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Worker Modal */}
      <Modal isOpen={addWorkerModal} onClose={() => setAddWorkerModal(false)} title={`Add Field Worker to ${departmentName}`}>
        <form onSubmit={handleAddWorker} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input
            label="Full Name"
            placeholder="e.g. Arjun Rao"
            value={newWorker.name}
            onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
            required
          />

          <Input
            label="Employee ID"
            placeholder="e.g. EMP-ROA-104"
            value={newWorker.employeeId}
            onChange={(e) => setNewWorker({ ...newWorker, employeeId: e.target.value })}
            required
          />

          <Input
            label="Mobile Number"
            placeholder="9876543210"
            value={newWorker.phone}
            onChange={(e) => setNewWorker({ ...newWorker, phone: e.target.value })}
            required
          />

          <Input
            label="Skill / Specialization"
            placeholder="e.g. Pothole Patching, Heavy Equipment, Pipe Welding"
            value={newWorker.skill}
            onChange={(e) => setNewWorker({ ...newWorker, skill: e.target.value })}
          />

          <Button type="submit" variant="primary" disabled={workerSubmitLoading} style={{ width: '100%', marginTop: 'var(--space-2)' }}>
            {workerSubmitLoading ? 'ADDING WORKER...' : 'CREATE & ASSIGN WORKER'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};
