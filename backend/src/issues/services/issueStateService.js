import { validateTransition } from '../utils/statusMachine.js';
import { IssueUpdate } from '../../models/IssueUpdate.js';

export const issueStateService = {
  transition: async (issueDoc, nextStatus, user, options = {}) => {
    const currentStatus = issueDoc.status;

    // Validate transition against canonical issue status machine
    validateTransition(currentStatus, nextStatus);

    // Update status
    issueDoc.status = nextStatus;

    // Append Timeline Record
    const timelineTitle = options.title || getDefaultTitleForStatus(nextStatus, user);
    const timelineDesc = options.description || getDefaultDescriptionForStatus(nextStatus, user);

    issueDoc.timeline.push({
      status: nextStatus,
      title: timelineTitle,
      time: 'Just now',
      description: timelineDesc
    });

    await issueDoc.save();

    // Log IssueUpdate Audit History Record
    await IssueUpdate.create({
      issueId: issueDoc.issueId,
      type: getUpdateTypeForStatus(nextStatus),
      message: options.updateMessage || `${timelineTitle}: ${timelineDesc}`,
      actorId: user?.id || user?._id?.toString() || 'system',
      actorRole: user?.role || 'SYSTEM',
      actorName: user?.name || 'System',
      metadata: options.metadata || {}
    });

    // Asynchronously emit domain event
    try {
      const { eventService } = await import('../../events/eventService.js');
      const eventName = getEventNameForStatus(nextStatus, options.eventOverride);
      if (eventName) {
        eventService.emit(eventName, {
          issueId: issueDoc.issueId,
          title: issueDoc.title,
          reporterUserId: issueDoc.reporter?.userId,
          assignedWorkerUserId: issueDoc.assignedWorker?.id,
          workerName: issueDoc.assignedWorker?.name,
          department: issueDoc.department,
          area: issueDoc.location?.area,
          actorName: user?.name,
          ...options.eventPayload
        });
      }
    } catch (e) {
      console.warn('[ISSUE STATE SERVICE] Event emission warning (non-blocking):', e.message);
    }

    return issueDoc;
  }
};

function getDefaultTitleForStatus(status, user) {
  switch (status) {
    case 'VERIFIED': return 'Verified by Municipal Authority';
    case 'ASSIGNED': return 'Assigned to Field Worker';
    case 'IN_PROGRESS': return 'Field Work Started';
    case 'RESOLVED': return 'Field Work Completed';
    case 'CITIZEN_VERIFICATION': return 'Awaiting Citizen Verification';
    case 'CLOSED': return 'Fix Confirmed & Closed by Citizen';
    case 'REOPENED': return 'Reopened by Citizen';
    default: return `Status updated to ${status}`;
  }
}

function getDefaultDescriptionForStatus(status, user) {
  const actorName = user?.name || 'Authority';
  switch (status) {
    case 'VERIFIED': return `Report inspected and approved by Officer ${actorName}.`;
    case 'ASSIGNED': return `Dispatched to technician by Officer ${actorName}.`;
    case 'IN_PROGRESS': return `Technician ${actorName} arrived on site and initiated repairs.`;
    case 'RESOLVED': return `Resolution evidence uploaded by technician ${actorName}.`;
    case 'CITIZEN_VERIFICATION': return 'Resolution submitted for citizen inspection.';
    case 'CLOSED': return `Citizen ${actorName} inspected the site and confirmed fix quality.`;
    case 'REOPENED': return `Citizen ${actorName} reported that issue is still present.`;
    default: return `Status transitioned to ${status}.`;
  }
}

function getUpdateTypeForStatus(status) {
  switch (status) {
    case 'VERIFIED': return 'AUTHORITY_VERIFIED';
    case 'ASSIGNED': return 'WORKER_ASSIGNED';
    case 'IN_PROGRESS': return 'WORK_STARTED';
    case 'RESOLVED': return 'WORKER_RESOLVED';
    case 'CLOSED': return 'CITIZEN_VERIFIED';
    case 'REOPENED': return 'ISSUE_REOPENED';
    default: return 'STATUS_CHANGED';
  }
}

function getEventNameForStatus(status, override) {
  if (override) return override;
  switch (status) {
    case 'VERIFIED': return 'ISSUE_VERIFIED';
    case 'ASSIGNED': return 'WORKER_ASSIGNED';
    case 'IN_PROGRESS': return 'WORK_STARTED';
    case 'RESOLVED': return 'ISSUE_RESOLVED';
    case 'CLOSED': return 'CITIZEN_VERIFIED';
    case 'REOPENED': return 'ISSUE_REOPENED';
    default: return null;
  }
}
