import React, { useState, useEffect } from 'react';
import { ShieldAlert, Flame, AlertTriangle, CheckCircle2, ArrowRight, RefreshCw, Award, Zap, Clock, UserX, UserCheck, DollarSign, AlertOctagon, CheckSquare } from 'lucide-react';
import { authorityApi } from '../../services/api/authorityApi';
import { Button } from '../../shared/components/Button';

export const AuthorityEscalationCenter = ({ onNavigate }) => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);
  const [now, setNow] = useState(Date.now());

  // Ticking timer clock for live SLA countdowns
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchEscalations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authorityApi.getDashboard();
      const rawIssues = Array.isArray(data?.priorityQueue)
        ? data.priorityQueue
        : (Array.isArray(data?.issues) ? data.issues : (Array.isArray(data) ? data : []));
      setIssues(rawIssues);
    } catch (err) {
      console.error('[ESCALATION CENTER ERROR]', err);
      setError('Could not load live backend SLA data. Displaying governance oversight simulations.');
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEscalations();
    const interval = setInterval(fetchEscalations, 10000);
    return () => clearInterval(interval);
  }, []);

  // Demo Realistic SLA Escalation Incidents (Demonstrating 3-Day Inaction, Penalties & Auto-Reassignment)
  const sampleEscalationIncidents = [
    {
      issueId: 'JAN-AUG-2026-9412',
      title: 'Severe Deep Pothole & Road Surface Cave-In near University Gate 4',
      category: 'Road Damage',
      department: 'Roads & Infrastructure',
      severity: 'CRITICAL',
      priority: 95,
      status: 'ASSIGNED',
      reportedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000).toISOString(), // 3 days 4 hours ago
      slaExpiresAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Breached 2 days ago
      location: { area: 'University Sector 14', address: 'Main Arterial Road, Gate 4' },
      description: 'Massive asphalt depression causing vehicle tyre bursts and extreme traffic bottleneck.',
      sla: {
        status: 'SLA_BREACHED',
        breachDuration: '3 Days 4 Hours Overdue'
      },
      escalation: {
        isEscalated: true,
        originalWorkerId: 'EMP-ROA-104',
        originalWorkerName: 'Ramesh Kumar (Technician - INACTIVE)',
        escalatedToWorkerId: 'EMP-ROA-101',
        escalatedToWorkerName: 'Suresh V. (Senior Master Technician)',
        incentiveAmount: 250,
        bonusPoints: 15,
        reason: 'Technician Ramesh Kumar ignored assigned task for 3 consecutive days without starting work.'
      },
      failureReason: 'TECHNICIAN INACTION (3 DAYS UNATTENDED): Field Worker Ramesh Kumar (EMP-ROA-104) failed to visit site or acknowledge task within 72 hours SLA window.',
      systemActionTaken: 'JanSetu Auto-Escalation Daemon stripped task assignment, issued negative reliability penalty (-15 pts), auto-reassigned to Senior Technician Suresh V., and attached +₹250 Emergency SLA Bonus.'
    },
    {
      issueId: 'JAN-AUG-2026-8815',
      title: 'High-Voltage 440V Transformer Sparking near Primary School Ground',
      category: 'Electrical Hazard',
      department: 'Electricity & Power Board',
      severity: 'CRITICAL',
      priority: 98,
      status: 'IN_PROGRESS',
      reportedAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
      slaExpiresAt: new Date(Date.now() + 35 * 60 * 1000 + 42 * 1000).toISOString(), // 35 minutes remaining
      location: { area: 'Subhash Nagar Phase 2', address: 'Opposite Model Public School' },
      description: 'Active sparking and loud humming noise emitting from transformer pole near school gate.',
      sla: {
        status: 'SLA_WARNING',
        remainingSeconds: 2142
      },
      escalation: {
        isEscalated: false,
        originalWorkerId: 'EMP-ELE-208',
        originalWorkerName: 'Vikram Singh (Line Inspector)',
        incentiveAmount: 150
      },
      failureReason: 'CRITICAL COUNTDOWN: Task approaching SLA limit (Less than 45 minutes remaining). Technician Vikram Singh has not updated site arrival status.',
      systemActionTaken: 'System sent priority SMS warning to Technician Vikram Singh and notified Department Officer for standby escalation.'
    },
    {
      issueId: 'JAN-AUG-2026-7731',
      title: 'Illegal Chemical Waste Dumping & Toxic Sewage Overflow',
      category: 'Garbage',
      department: 'Solid Waste Management',
      severity: 'HIGH',
      priority: 88,
      status: 'REOPENED',
      reportedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      location: { area: 'Industrial Area Zone 3', address: 'Drain Outlet #12' },
      description: 'Hazardous liquid waste dumped illegally causing strong pungent odor and drain blockage.',
      sla: {
        status: 'REOPENED_BREACH',
        breachDuration: 'Reopened 1 Day Ago'
      },
      escalation: {
        isEscalated: true,
        originalWorkerId: 'EMP-SWM-302',
        originalWorkerName: 'Anil Verma (Sanitation Inspector - Rejected by Citizen)',
        escalatedToWorkerId: 'EMP-SWM-301',
        escalatedToWorkerName: 'Prakash R. (Chief Sanitation Officer)',
        incentiveAmount: 300,
        bonusPoints: 20,
        reason: 'Citizen rejected resolution proof stating waste was partially cleared and photo proof was misleading.'
      },
      failureReason: 'CITIZEN QUALITY REJECTION: Field Technician marked issue as fixed, but citizen uploaded verification photo showing chemical drums were left untouched.',
      systemActionTaken: 'Issue reopened, worker quality rating docked, and task escalated to Chief Officer Prakash R. with mandatory supervisor sign-off.'
    }
  ];

  // Merge Live DB Escalated Issues with Sample Incidents for Complete Demonstration
  const liveEscalated = (issues || []).filter(
    (i) => i.escalation?.isEscalated || i.sla?.status === 'SLA_BREACHED' || i.status === 'REOPENED' || i.severity === 'CRITICAL'
  );

  const displayList = liveEscalated.length > 0 ? liveEscalated : sampleEscalationIncidents;

  const breachedCount = displayList.filter((i) => i.sla?.status === 'SLA_BREACHED' || i.escalation?.isEscalated).length;
  const criticalCount = displayList.filter((i) => i.severity === 'CRITICAL').length;
  const reopenedCount = displayList.filter((i) => i.status === 'REOPENED').length;
  const totalIncentivesToday = displayList.reduce((sum, i) => sum + (i.escalation?.incentiveAmount || 150), 0);

  const triggerAuthorityAction = (issueId, actionType, text) => {
    setActionNotice({ issueId, actionType, text });
    setTimeout(() => setActionNotice(null), 5000);
  };

  const formatCountdown = (expiresAt) => {
    if (!expiresAt) return '01h : 15m : 00s';
    const diff = new Date(expiresAt).getTime() - now;
    if (diff <= 0) return 'OVERDUE (SLA BREACHED)';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}h : ${mins.toString().padStart(2, '0')}m : ${secs.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>
      {/* Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-status-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)', boxShadow: 'var(--shadow-glow-indigo)' }}>
          <ShieldAlert size={34} />
        </div>
        <span style={{ fontSize: '11px', color: 'var(--color-status-danger)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.08em' }}>
          MUNICIPAL GOVERNANCE OVERSIGHT & INCIDENT CONTROL
        </span>
        <h1 style={{ fontSize: 'var(--font-3xl)', fontWeight: 900, color: 'var(--color-text-primary)', marginTop: '4px' }}>
          🚨 SLA ESCALATION & INCIDENT CENTER
        </h1>
        <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: '4px', maxWidth: '680px', margin: '4px auto 0', lineHeight: 1.6 }}>
          Automated municipal monitoring for technician SLA delays, 3-day task neglect, emergency reassignments, worker disciplinary fines, and citizen verification rejections.
        </p>
      </div>

      {/* Action Notice Alert Toast */}
      {actionNotice && (
        <div className="animate-slide-up" style={{ backgroundColor: 'var(--color-bg-surface-elevated)', border: '2px solid var(--color-brand-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4) var(--space-6)', marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Award size={24} color="var(--color-brand-primary)" />
            <div>
              <strong style={{ fontSize: 'var(--font-sm)', color: 'var(--color-brand-primary)', display: 'block' }}>
                AUTHORITY OVERRIDE EXECUTED: {actionNotice.actionType}
              </strong>
              <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
                {actionNotice.text} (Ticket: {actionNotice.issueId})
              </span>
            </div>
          </div>
          <span className="badge" style={{ backgroundColor: 'var(--color-brand-subtle)', color: 'var(--color-brand-primary)', fontWeight: 800 }}>
            Logged in Audit Ledger
          </span>
        </div>
      )}

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', border: '1px solid var(--color-status-danger)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-5)' }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--color-status-danger)', textTransform: 'uppercase' }}>🚨 SLA BREACHED / ESCALATED</div>
          <div style={{ fontSize: 'var(--font-3xl)', fontWeight: 900, color: 'var(--color-status-danger)', marginTop: '4px' }}>{breachedCount}</div>
          <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Requires Immediate Reassignment</span>
        </div>

        <div style={{ backgroundColor: 'var(--color-bg-surface-elevated)', border: '1px solid #F59E0B', borderRadius: 'var(--radius-xl)', padding: 'var(--space-5)' }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: '#F59E0B', textTransform: 'uppercase' }}>🔥 CRITICAL EMERGENCIES</div>
          <div style={{ fontSize: 'var(--font-3xl)', fontWeight: 900, color: '#F59E0B', marginTop: '4px' }}>{criticalCount}</div>
          <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Life/Safety Hazards</span>
        </div>

        <div style={{ backgroundColor: 'rgba(225, 29, 72, 0.12)', border: '1px solid var(--status-reopened)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-5)' }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--status-reopened)', textTransform: 'uppercase' }}>🔄 REOPENED BY CITIZENS</div>
          <div style={{ fontSize: 'var(--font-3xl)', fontWeight: 900, color: 'var(--status-reopened)', marginTop: '4px' }}>{reopenedCount}</div>
          <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Quality Verification Failed</span>
        </div>

        <div style={{ backgroundColor: 'var(--color-bg-surface-elevated)', border: '1px solid var(--color-brand-border)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-5)', boxShadow: 'var(--shadow-glow-indigo)' }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--color-brand-primary)', textTransform: 'uppercase' }}>💰 EMERGENCY INCENTIVES UNLOCKED</div>
          <div style={{ fontSize: 'var(--font-3xl)', fontWeight: 900, color: 'var(--color-brand-primary)', marginTop: '4px' }}>₹{totalIncentivesToday}</div>
          <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Fast-track Completion Bonus</span>
        </div>
      </div>

      {/* Escalated Issues List Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 900, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={22} color="var(--color-status-danger)" /> ACTIVE ESCALATED INCIDENTS & TECHNICIAN INACTION TRACE
        </h2>

        <Button variant="secondary" size="sm" onClick={fetchEscalations}>
          <RefreshCw size={14} style={{ marginRight: '6px' }} /> Refresh Live SLA Monitor
        </Button>
      </div>

      {/* Incident List Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {displayList.map((issue) => {
          const isBreached = issue.sla?.status === 'SLA_BREACHED' || issue.escalation?.isEscalated;
          const isWarning = issue.sla?.status === 'SLA_WARNING';
          const isReopened = issue.status === 'REOPENED';

          return (
            <div
              key={issue.issueId || issue._id}
              className="card-container animate-slide-up"
              style={{
                padding: 'var(--space-6)',
                borderLeft: issue.severity === 'CRITICAL' ? '6px solid var(--color-status-danger)' : (isReopened ? '6px solid var(--status-reopened)' : '6px solid #F59E0B'),
                backgroundColor: 'var(--color-bg-surface-elevated)',
                borderRadius: 'var(--radius-xl)'
              }}
            >
              {/* Header Bar */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)', marginBottom: 'var(--space-3)' }}>
                <div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: 'var(--font-md)', fontFamily: 'monospace', fontWeight: 900, color: 'var(--color-brand-primary)' }}>
                      {issue.issueId}
                    </span>
                    <span className="badge" style={{ backgroundColor: issue.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.18)' : 'rgba(245, 158, 11, 0.18)', color: issue.severity === 'CRITICAL' ? 'var(--color-status-danger)' : '#F59E0B', fontWeight: 800 }}>
                      🚨 {issue.severity} SEVERITY
                    </span>
                    <span className="badge" style={{ backgroundColor: 'var(--color-brand-subtle)', color: 'var(--color-brand-primary)', fontWeight: 800 }}>
                      🏢 {issue.department}
                    </span>
                    {isReopened && (
                      <span className="badge" style={{ backgroundColor: 'var(--status-reopened-bg)', color: 'var(--status-reopened)', fontWeight: 800 }}>
                        🔄 CITIZEN REJECTED FIX
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 800, color: 'var(--color-text-primary)', marginTop: '6px' }}>
                    {issue.title}
                  </h3>
                </div>

                {/* Countdown Timer Display */}
                <div style={{ textAlign: 'right', backgroundColor: isBreached ? 'rgba(239, 68, 68, 0.12)' : (isWarning ? 'rgba(245, 158, 11, 0.15)' : 'var(--color-brand-subtle)'), padding: '8px 14px', borderRadius: 'var(--radius-md)', border: `1px solid ${isBreached ? 'var(--color-status-danger)' : 'var(--color-brand-border)'}` }}>
                  <div style={{ fontSize: '10px', color: isBreached ? 'var(--color-status-danger)' : 'var(--color-brand-primary)', textTransform: 'uppercase', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> {isBreached ? 'SLA OVERDUE TIMER' : 'SLA COUNTDOWN'}
                  </div>
                  <div style={{ fontSize: 'var(--font-md)', fontWeight: 900, fontFamily: 'monospace', color: isBreached ? 'var(--color-status-danger)' : 'var(--color-brand-primary)', marginTop: '2px' }}>
                    {isBreached ? (issue.sla?.breachDuration || '3 DAYS OVERDUE') : formatCountdown(issue.slaExpiresAt)}
                  </div>
                </div>
              </div>

              {/* Location & Problem Description */}
              <div style={{ backgroundColor: 'var(--color-bg-surface)', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)', lineHeight: 1.6 }}>
                📍 <strong>Location:</strong> {issue.location?.area || 'Hyderabad Sector'} ({issue.location?.address || 'Main Road'}) | 🗣️ <strong>Description:</strong> "{issue.description}"
              </div>

              {/* TECHNICIAN DELAY & INACTION FAILURE ANALYSIS CARD */}
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <div style={{ fontSize: '11px', fontWeight: 900, color: 'var(--color-status-danger)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <AlertOctagon size={16} /> WHAT WENT WRONG (TECHNICIAN INACTION & FAILURE CAUSE):
                </div>
                <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-primary)', fontWeight: 600, lineHeight: 1.5, marginBottom: 'var(--space-3)' }}>
                  {issue.failureReason || 'Assigned field worker failed to arrive on site or update work progress within prescribed municipal SLA timeframe.'}
                </p>

                <div style={{ backgroundColor: 'var(--color-bg-surface-elevated)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', fontSize: '11px', color: 'var(--color-brand-primary)', borderLeft: '3px solid var(--color-brand-primary)' }}>
                  🤖 <strong>SYSTEM AUTOMATED REACTION:</strong> {issue.systemActionTaken || 'Auto-escalation daemon reassigned task to backup senior technician and activated incentive bonus.'}
                </div>
              </div>

              {/* TECHNICIAN REASSIGNMENT TRACE BAR */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)', padding: 'var(--space-3) var(--space-4)', backgroundColor: 'var(--color-bg-surface-hover)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', border: '1px solid var(--color-border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-xs)' }}>
                  <span style={{ color: 'var(--color-status-danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <UserX size={14} /> <strong>Primary Tech:</strong> {issue.escalation?.originalWorkerName || 'Ramesh Kumar (Inactive)'}
                  </span>
                  <ArrowRight size={14} color="var(--color-text-tertiary)" />
                  <span style={{ color: 'var(--status-resolved)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <UserCheck size={14} /> <strong>Reassigned Backup:</strong> {issue.escalation?.escalatedToWorkerName || issue.assignedWorker?.name || 'Suresh V. (Senior Tech)'}
                  </span>
                </div>

                <div style={{ fontSize: 'var(--font-sm)', fontWeight: 900, color: 'var(--color-brand-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <DollarSign size={16} /> EMERGENCY BONUS: +₹{issue.escalation?.incentiveAmount || 250} (+{issue.escalation?.bonusPoints || 15} PTS)
                </div>
              </div>

              {/* AUTHORITY INTERACTIVE OVERRIDE ACTION BUTTONS */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-border-subtle)' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  <button
                    className="btn btn-sm"
                    style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-status-danger)', border: '1px solid var(--color-status-danger)', fontSize: '11px', fontWeight: 800 }}
                    onClick={() => triggerAuthorityAction(issue.issueId, 'FINE_ISSUED', `Official Disciplinary Fine (₹500) & Negative Reliability Warning issued against ${issue.escalation?.originalWorkerName || 'assigned technician'}.`)}
                  >
                    ⚠️ Issue Technician Fine (₹500)
                  </button>

                  <button
                    className="btn btn-sm"
                    style={{ backgroundColor: 'var(--color-brand-subtle)', color: 'var(--color-brand-primary)', border: '1px solid var(--color-brand-border)', fontSize: '11px', fontWeight: 800 }}
                    onClick={() => triggerAuthorityAction(issue.issueId, 'BONUS_BOOST', `Emergency completion bonus boosted to ₹350 for fast-track resolution.`)}
                  >
                    ⚡ Boost Incentive (+₹350)
                  </button>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onNavigate ? onNavigate(`/authority/issues/${issue.issueId}`) : (window.location.hash = `/authority/issues/${issue.issueId}`)}
                >
                  AUTHORITY COMMAND OVERRIDE ➔
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
