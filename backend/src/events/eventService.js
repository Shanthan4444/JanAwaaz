import { notificationService } from '../notifications/services/notificationService.js';
import { User } from '../models/User.js';

export const eventService = {
  emit: async (eventType, payload = {}) => {
    try {
      console.log(`[EVENT SERVICE] Processing event: ${eventType} for issue '${payload.issueId || 'N/A'}'`);

      switch (eventType) {
        case 'ISSUE_REPORTED':
          await handleIssueReported(payload);
          break;
        case 'ISSUE_VERIFIED':
          await handleIssueVerified(payload);
          break;
        case 'WORKER_ASSIGNED':
          await handleWorkerAssigned(payload);
          break;
        case 'WORK_STARTED':
          await handleWorkStarted(payload);
          break;
        case 'ISSUE_RESOLVED':
          await handleIssueResolved(payload);
          break;
        case 'CITIZEN_VERIFIED':
          await handleCitizenVerified(payload);
          break;
        case 'ISSUE_REOPENED':
          await handleIssueReopened(payload);
          break;
        case 'VOLUNTEER_REGISTERED':
          await handleVolunteerRegistered(payload);
          break;
        case 'ISSUE_SUPPORTED':
          await handleIssueSupported(payload);
          break;
        default:
          console.log(`[EVENT SERVICE] No specific notification handler for event: ${eventType}`);
      }
    } catch (err) {
      // Event emission must be failure-isolated so civic workflow operations never break
      console.error(`[EVENT SERVICE ERROR] Failed to process event ${eventType}:`, err);
    }
  }
};

async function getAuthorityUserIds(department) {
  const query = { role: 'AUTHORITY', isActive: true };
  if (department) {
    const matched = await User.find({ ...query, department }).select('_id');
    if (matched.length > 0) return matched.map((u) => u._id.toString());
  }
  const allAuth = await User.find(query).select('_id');
  return allAuth.map((u) => u._id.toString());
}

async function handleIssueReported(payload) {
  const { issueId, title, reporterUserId, area, department } = payload;

  if (reporterUserId) {
    await notificationService.createNotification({
      recipientId: reporterUserId,
      type: 'ISSUE_RECEIVED',
      title: 'Issue Report Received',
      message: `Your issue "${title}" has been registered under ID ${issueId}.`,
      issueId,
      actorId: 'system',
      priority: 'NORMAL',
      deduplicationKey: `ISSUE_RECEIVED_${issueId}`
    });
  }

  const authUserIds = await getAuthorityUserIds(department);
  for (const authId of authUserIds) {
    await notificationService.createNotification({
      recipientId: authId,
      type: 'ISSUE_REPORTED',
      title: 'New Civic Issue Reported',
      message: `New issue "${title}" reported in ${area || 'Sector 14'}.`,
      issueId,
      actorId: reporterUserId || 'citizen',
      priority: 'NORMAL',
      deduplicationKey: `ISSUE_REPORTED_AUTH_${issueId}_${authId}`
    });
  }
}

async function handleIssueVerified(payload) {
  const { issueId, title, reporterUserId } = payload;
  if (!reporterUserId) return;

  await notificationService.createNotification({
    recipientId: reporterUserId,
    type: 'ISSUE_VERIFIED',
    title: 'Issue Verified by Authority',
    message: `Your report "${title}" has been verified and prioritized for field action.`,
    issueId,
    actorId: 'authority',
    priority: 'NORMAL',
    deduplicationKey: `ISSUE_VERIFIED_${issueId}`
  });
}

async function handleWorkerAssigned(payload) {
  const { issueId, title, reporterUserId, workerUserId, workerEmployeeId, workerName, area } = payload;

  // Notify assigned worker
  const workerRecipient = workerUserId || workerEmployeeId;
  if (workerRecipient) {
    await notificationService.createNotification({
      recipientId: workerRecipient,
      type: 'WORKER_ASSIGNED',
      title: 'New Field Task Assigned',
      message: `You have been assigned to task "${title}" in ${area || 'Sector 14'}.`,
      issueId,
      actorId: 'authority',
      priority: 'HIGH',
      deduplicationKey: `WORKER_ASSIGNED_${issueId}_${workerRecipient}`
    });
  }

  // Notify reporter citizen
  if (reporterUserId) {
    await notificationService.createNotification({
      recipientId: reporterUserId,
      type: 'WORKER_ASSIGNED',
      title: 'Field Worker Assigned',
      message: `Worker ${workerName || 'technician'} has been assigned to work on your issue "${title}".`,
      issueId,
      actorId: 'authority',
      priority: 'NORMAL',
      deduplicationKey: `WORKER_ASSIGNED_CITIZEN_${issueId}`
    });
  }
}

async function handleWorkStarted(payload) {
  const { issueId, title, reporterUserId, workerName } = payload;
  if (!reporterUserId) return;

  await notificationService.createNotification({
    recipientId: reporterUserId,
    type: 'WORK_STARTED',
    title: 'Work Started on Site',
    message: `Field technician ${workerName || ''} started active work on "${title}".`,
    issueId,
    actorId: 'worker',
    priority: 'NORMAL',
    deduplicationKey: `WORK_STARTED_${issueId}`
  });
}

async function handleIssueResolved(payload) {
  const { issueId, title, reporterUserId, workerName } = payload;
  if (!reporterUserId) return;

  await notificationService.createNotification({
    recipientId: reporterUserId,
    type: 'VERIFICATION_REQUIRED',
    title: 'Resolution Completed - Action Required',
    message: `Field work completed for "${title}". Please inspect proof photos and confirm if fixed.`,
    issueId,
    actorId: 'worker',
    priority: 'HIGH',
    deduplicationKey: `ISSUE_RESOLVED_${issueId}`
  });
}

async function handleCitizenVerified(payload) {
  const { issueId, title, reporterUserId, department } = payload;

  if (reporterUserId) {
    await notificationService.createNotification({
      recipientId: reporterUserId,
      type: 'ISSUE_CLOSED',
      title: 'Issue Closed & Confirmed',
      message: `Thank you for confirming! Your issue "${title}" is now officially closed.`,
      issueId,
      actorId: 'citizen',
      priority: 'NORMAL',
      deduplicationKey: `CITIZEN_VERIFIED_CITIZEN_${issueId}`
    });
  }

  const authUserIds = await getAuthorityUserIds(department);
  for (const authId of authUserIds) {
    await notificationService.createNotification({
      recipientId: authId,
      type: 'CITIZEN_VERIFIED',
      title: 'Resolution Confirmed by Citizen',
      message: `Citizen verified resolution quality for issue ${issueId} ("${title}").`,
      issueId,
      actorId: reporterUserId || 'citizen',
      priority: 'NORMAL',
      deduplicationKey: `CITIZEN_VERIFIED_AUTH_${issueId}_${authId}`
    });
  }
}

async function handleIssueReopened(payload) {
  const { issueId, title, reporterUserId, reason, department } = payload;

  const authUserIds = await getAuthorityUserIds(department);
  for (const authId of authUserIds) {
    await notificationService.createNotification({
      recipientId: authId,
      type: 'ISSUE_REOPENED',
      title: 'ALERT: Issue Reopened by Citizen',
      message: `Citizen reported issue ${issueId} is not fixed: "${reason || 'Work incomplete'}"`,
      issueId,
      actorId: reporterUserId || 'citizen',
      priority: 'CRITICAL',
      deduplicationKey: `ISSUE_REOPENED_${issueId}_${Date.now()}`
    });
  }
}

async function handleVolunteerRegistered(payload) {
  const { issueId, title, volunteerName, volunteerCount, department } = payload;

  const authUserIds = await getAuthorityUserIds(department);
  for (const authId of authUserIds) {
    await notificationService.createNotification({
      recipientId: authId,
      type: 'VOLUNTEER_REGISTERED',
      title: 'Community Volunteer Interest',
      message: `${volunteerName || 'A citizen'} volunteered to help with "${title}" (${volunteerCount} total volunteers).`,
      issueId,
      actorId: 'citizen',
      priority: 'NORMAL',
      deduplicationKey: `VOLUNTEER_${issueId}_${volunteerCount}`
    });
  }
}

async function handleIssueSupported(payload) {
  const { issueId, title, supportersCount, area, department } = payload;
  const thresholds = [5, 10, 25, 50, 100];

  if (thresholds.includes(supportersCount)) {
    const authUserIds = await getAuthorityUserIds(department);
    for (const authId of authUserIds) {
      await notificationService.createNotification({
        recipientId: authId,
        type: 'COMMUNITY_ACTIVITY',
        title: 'High Community Support Signal',
        message: `${supportersCount} citizens now support issue "${title}" in ${area || 'Sector 14'}.`,
        issueId,
        actorId: 'community',
        priority: 'HIGH',
        deduplicationKey: `SUPPORT_THRESHOLD_${issueId}_${supportersCount}`
      });
    }
  }
}
