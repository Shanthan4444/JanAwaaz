import { Issue } from '../../models/Issue.js';
import { Worker } from '../../models/Worker.js';
import { IssueUpdate } from '../../models/IssueUpdate.js';
import { assignmentEngine } from './assignmentEngine.js';
import { eventService } from '../../events/eventService.js';

export const slaEngineService = {
  // Evaluates SLA state for an issue or all active issues
  checkAndUpdateSlaState: async (issueId) => {
    const issue = await Issue.findOne({ issueId });
    if (!issue) return null;

    if (['RESOLVED', 'CITIZEN_VERIFICATION', 'CLOSED', 'REJECTED_BY_WORKER'].includes(issue.status)) {
      return issue.toObject();
    }

    const now = new Date();
    const expiresAt = issue.sla?.expiresAt || new Date(issue.createdAt.getTime() + 24 * 1000);
    const remainingMs = expiresAt.getTime() - now.getTime();
    const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));

    // Check if SLA has breached (timer <= 0) and not already escalated
    if (remainingSeconds <= 0 && issue.sla?.status !== 'SLA_BREACHED' && !issue.escalation?.isEscalated) {
      const originalWorker = issue.assignedWorker || { id: 'worker-001', name: 'Original Worker' };

      // Find backup Worker #2
      const backupWorker = await assignmentEngine.findBestWorkerForIssue(issue.department, issue.category);
      if (backupWorker.id === originalWorker.id) {
        backupWorker.name = 'Kiran Rao (Backup Specialist)';
        backupWorker.id = 'worker-backup-002';
      }

      // Update SLA & Escalation fields
      issue.sla = {
        initialSeconds: 24,
        startedAt: issue.sla?.startedAt || issue.createdAt,
        expiresAt: new Date(now.getTime() + 24 * 1000), // Reset 24s timer for Worker #2
        status: 'SLA_BREACHED',
        breachedAt: now
      };

      issue.escalation = {
        isEscalated: true,
        escalationCount: (issue.escalation?.escalationCount || 0) + 1,
        originalWorkerId: originalWorker.id,
        originalWorkerName: originalWorker.name,
        escalatedToWorkerId: backupWorker.id,
        escalatedToWorkerName: backupWorker.name,
        incentiveAmount: 150,
        bonusPoints: 5,
        escalatedAt: now
      };

      // Reassign to Worker #2
      issue.assignedWorker = backupWorker;
      issue.status = 'IN_PROGRESS';

      const nowStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      // Add timeline entries
      issue.timeline.push({
        status: 'SLA_BREACHED',
        title: '🚨 SLA BREACHED — Original Worker Timed Out',
        time: nowStr,
        description: `Worker ${originalWorker.name} failed to resolve within 24s SLA. Civic score penalized (-5 pts).`
      });

      issue.timeline.push({
        status: 'IN_PROGRESS',
        title: '🔥 AUTOMATIC ESCALATION TO BACKUP WORKER',
        time: nowStr,
        description: `Task automatically escalated to ${backupWorker.name}. Emergency Resolution Incentive of ₹150 + 5 Civic Score activated!`
      });

      await issue.save();

      // Deduct civic score from Worker #1
      if (originalWorker.id) {
        await Worker.findOneAndUpdate(
          { $or: [{ _id: originalWorker.id }, { employeeId: originalWorker.id }] },
          { $inc: { civicScore: -5, slaBreachesCount: 1 } }
        ).catch(() => null);
      }

      // Award escalation tracking to Worker #2
      if (backupWorker.id) {
        await Worker.findOneAndUpdate(
          { $or: [{ _id: backupWorker.id }, { employeeId: backupWorker.id }] },
          { $inc: { escalatedTasksCount: 1 } }
        ).catch(() => null);
      }

      await IssueUpdate.create({
        issueId: issue.issueId,
        type: 'SLA_BREACHED_ESCALATED',
        message: `SLA breached by ${originalWorker.name}. Escalated to ${backupWorker.name} with ₹150 incentive.`,
        actorId: 'system-sla-engine',
        actorRole: 'SYSTEM',
        actorName: 'JanSetu SLA Engine'
      });

      eventService.emit('SLA_BREACHED', {
        issueId: issue.issueId,
        title: issue.title,
        originalWorker: originalWorker.name,
        backupWorker: backupWorker.name,
        incentive: 150
      });
    } else if (remainingSeconds <= 12 && issue.sla?.status === 'SLA_NORMAL') {
      issue.sla.status = 'SLA_WARNING';
      await issue.save();
    }

    return issue.toObject();
  },

  // Check all active department issues for SLA breaches
  evaluateAllActiveSlas: async () => {
    const activeIssues = await Issue.find({
      status: { $in: ['REPORTED', 'ASSIGNED', 'IN_PROGRESS'] }
    });

    for (const issue of activeIssues) {
      await slaEngineService.checkAndUpdateSlaState(issue.issueId).catch((err) => {
        console.warn(`[SLA ENGINE WARN] Failed SLA check for ${issue.issueId}:`, err.message);
      });
    }
  }
};
