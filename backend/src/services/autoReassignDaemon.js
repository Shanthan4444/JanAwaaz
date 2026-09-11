import { Issue } from '../models/Issue.js';
import { Worker } from '../models/Worker.js';

/**
 * 24-Hour Auto-Reassignment Daemon
 * Periodically checks assigned issues where worker has not accepted/rejected within 24 hours.
 * Reassigns to the next free available worker in the department.
 */
export const startAutoReassignDaemon = () => {
  console.log('[AUTO REASSIGN DAEMON] Initializing 24-hour ignored task escalation monitor...');

  // Run check every 60 seconds
  setInterval(async () => {
    try {
      await checkAndReassignIgnoredIssues();
    } catch (err) {
      console.error('[AUTO REASSIGN DAEMON ERROR]', err.message);
    }
  }, 60000);
};

export const checkAndReassignIgnoredIssues = async () => {
  const timeoutHours = parseFloat(process.env.ASSIGNMENT_TIMEOUT_HOURS || '24');
  const cutoffDate = new Date(Date.now() - timeoutHours * 60 * 60 * 1000);

  // Find issues in ASSIGNED status where assignedAt is older than cutoffDate and worker has not accepted
  const staleIssues = await Issue.find({
    status: 'ASSIGNED',
    'workerDecision.action': { $ne: 'ACCEPTED' },
    $or: [
      { 'assignedWorker.assignedAt': { $lt: cutoffDate } },
      { createdAt: { $lt: cutoffDate } }
    ]
  });

  if (staleIssues.length === 0) return;

  console.log(`[AUTO REASSIGN DAEMON] Found ${staleIssues.length} stale issue(s) ignored past ${timeoutHours} hours.`);

  for (const issue of staleIssues) {
    const previousWorkerName = issue.assignedWorker?.name || 'Previous Worker';
    const previousWorkerId = issue.assignedWorker?.id;

    // Find next available worker in the department excluding previous worker
    let nextWorker = await Worker.findOne({
      department: issue.department,
      status: 'AVAILABLE',
      isActive: true,
      employeeId: { $ne: previousWorkerId }
    }).sort({ createdAt: 1 });

    // Fallback: if no purely AVAILABLE worker, pick worker with minimum workload
    if (!nextWorker) {
      const deptWorkers = await Worker.find({
        department: issue.department,
        isActive: true,
        employeeId: { $ne: previousWorkerId }
      });

      if (deptWorkers.length > 0) {
        deptWorkers.sort((a, b) => (a.activeTasksCount || 0) - (b.activeTasksCount || 0));
        nextWorker = deptWorkers[0];
      }
    }

    if (nextWorker) {
      // Re-assign issue
      issue.assignedWorker = {
        id: nextWorker.employeeId || nextWorker._id.toString(),
        name: nextWorker.name,
        role: nextWorker.role || 'Field Technician',
        phone: nextWorker.phone || '9876543201',
        assignedAt: new Date()
      };

      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      issue.timeline.push({
        status: 'ASSIGNED',
        title: `Auto-Reassigned to ${nextWorker.name}`,
        time: nowStr,
        description: `Ignored past ${timeoutHours}h by ${previousWorkerName}. Reassigned to ${nextWorker.name} (${nextWorker.role}). Phone: ${nextWorker.phone || '9876543201'}.`
      });

      await issue.save();

      // Free previous worker
      if (previousWorkerId) {
        await Worker.findOneAndUpdate({ employeeId: previousWorkerId }, { status: 'AVAILABLE' });
      }

      // Mark new worker as BUSY
      nextWorker.status = 'BUSY';
      nextWorker.activeTasksCount = (nextWorker.activeTasksCount || 0) + 1;
      await nextWorker.save();

      console.log(`[AUTO REASSIGN SUCCESS] Issue '${issue.issueId}' auto-reassigned from '${previousWorkerName}' to '${nextWorker.name}' (Phone: ${nextWorker.phone})`);
    }
  }
};
