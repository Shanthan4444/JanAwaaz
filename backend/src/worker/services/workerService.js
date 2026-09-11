import { Issue } from '../../models/Issue.js';
import { User } from '../../models/User.js';
import { Worker } from '../../models/Worker.js';
import { IssueUpdate } from '../../models/IssueUpdate.js';
import { validateTransition } from '../../issues/utils/statusMachine.js';
import { saveImageLocally } from '../../utils/localStorage.js';

export const workerService = {
  getWorkerProfile: async (user) => {
    const userDoc = await User.findById(user.id).select('-passwordHash');
    if (!userDoc) {
      throw new Error('Worker user not found.');
    }

    const workerIds = [userDoc._id.toString(), userDoc.employeeId, user.id, user.employeeId].filter(Boolean);

    const activeTasksCount = await Issue.countDocuments({
      $or: [
        { 'assignedWorker.id': { $in: workerIds } },
        { 'workerDecision.workerId': user.id, status: 'IN_PROGRESS' }
      ]
    });

    const completedTasksCount = await Issue.countDocuments({
      $or: [
        { 'assignedWorker.id': { $in: workerIds } },
        { 'workerDecision.workerId': user.id }
      ],
      status: { $in: ['RESOLVED', 'CITIZEN_VERIFICATION', 'CLOSED'] }
    });

    const rejectedTasksCount = await Issue.countDocuments({
      'workerDecision.workerId': user.id,
      status: 'REJECTED_BY_WORKER'
    });

    return {
      id: userDoc._id.toString(),
      name: userDoc.name,
      employeeId: userDoc.employeeId,
      email: userDoc.email,
      department: userDoc.department || 'Roads & Infrastructure',
      role: userDoc.role,
      availabilityStatus: userDoc.availabilityStatus || 'AVAILABLE',
      metrics: {
        activeTasks: activeTasksCount,
        completedTasks: completedTasksCount,
        rejectedTasks: rejectedTasksCount
      }
    };
  },

  getWorkerTasks: async (user, filters = {}) => {
    const workerIds = [user.id, user.employeeId].filter(Boolean);
    const userDoc = await User.findById(user.id);
    const workerDepartment = userDoc?.department || user.department || 'Roads & Infrastructure';

    // Query for tasks assigned directly OR open in worker's department
    const query = {
      $or: [
        { 'assignedWorker.id': { $in: workerIds } },
        { department: workerDepartment },
        { department: 'Municipal Services' }
      ]
    };

    if (filters.status) {
      if (filters.status === 'ACTIVE') {
        query.status = { $in: ['REPORTED', 'ASSIGNED', 'IN_PROGRESS'] };
      } else if (filters.status === 'COMPLETED') {
        query.status = { $in: ['RESOLVED', 'CITIZEN_VERIFICATION', 'CLOSED'] };
      } else if (filters.status === 'REJECTED') {
        query.status = 'REJECTED_BY_WORKER';
      } else if (filters.status !== 'ALL') {
        query.status = filters.status;
      }
    }

    if (filters.priority === 'HIGH') {
      query.priority = { $gte: 80 };
    }

    const tasks = await Issue.find(query).sort({ priority: -1, severity: -1, createdAt: -1 });
    return tasks.map((t) => t.toObject());
  },

  getWorkerTaskById: async (user, issueId) => {
    const doc = await Issue.findOne({ issueId });
    if (!doc) {
      const err = new Error(`Task '${issueId}' not found.`);
      err.status = 404;
      throw err;
    }

    return doc.toObject();
  },

  // Helper to verify worker authorization
  checkWorkerAuthorization: (doc, user) => {
    const assignedId = doc.assignedWorker?.id;
    if (!assignedId) {
      // Unassigned task in department queue -> worker can claim/accept
      return true;
    }

    const workerUserIds = [user.id, user.employeeId, user._id?.toString()].filter(Boolean);
    if (!workerUserIds.includes(assignedId)) {
      const err = new Error(`Access denied. Task '${doc.issueId}' is assigned to worker '${doc.assignedWorker?.name || assignedId}'.`);
      err.status = 403;
      throw err;
    }
  },

  // WORKER DIRECT ACCEPTANCE (Bypassing manual authority assignment)
  acceptTask: async (user, issueId) => {
    const doc = await Issue.findOne({ issueId });
    if (!doc) {
      const err = new Error(`Task '${issueId}' not found.`);
      err.status = 404;
      throw err;
    }

    workerService.checkWorkerAuthorization(doc, user);
    validateTransition(doc.status, 'IN_PROGRESS');

    doc.assignedWorker = {
      id: user.id,
      name: user.name,
      role: user.role || 'Field Technician',
      phone: user.mobile || ''
    };

    doc.workerDecision = {
      action: 'ACCEPTED',
      workerId: user.id,
      workerName: user.name,
      actionAt: new Date()
    };

    doc.status = 'IN_PROGRESS';

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    doc.timeline.push({
      status: 'IN_PROGRESS',
      title: 'Task Accepted & Work Started by Field Worker',
      time: nowStr,
      description: `Technician ${user.name} directly accepted and commenced work on site.`
    });

    await doc.save();

    await User.findByIdAndUpdate(user.id, { availabilityStatus: 'BUSY' });
    if (user.employeeId) {
      await Worker.findOneAndUpdate({ employeeId: user.employeeId }, { status: 'BUSY' });
    }

    await IssueUpdate.create({
      issueId,
      type: 'WORK_STARTED',
      message: `Task accepted and work started by ${user.name}`,
      actorId: user.id,
      actorRole: 'WORKER',
      actorName: user.name
    });

    const { eventService } = await import('../../events/eventService.js');
    eventService.emit('WORK_STARTED', {
      issueId: doc.issueId,
      title: doc.title,
      reporterUserId: doc.reporter?.userId,
      workerName: user.name
    });

    return doc.toObject();
  },

  // WORKER DIRECT REJECTION (Marking issue as not genuine with mandatory explanation)
  rejectTask: async (user, issueId, reason) => {
    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
      const err = new Error('A detailed rejection explanation is required.');
      err.status = 400;
      throw err;
    }

    const doc = await Issue.findOne({ issueId });
    if (!doc) {
      const err = new Error(`Task '${issueId}' not found.`);
      err.status = 404;
      throw err;
    }

    workerService.checkWorkerAuthorization(doc, user);
    validateTransition(doc.status, 'REJECTED_BY_WORKER');

    doc.status = 'REJECTED_BY_WORKER';

    doc.workerDecision = {
      action: 'REJECTED',
      workerId: user.id,
      workerName: user.name,
      rejectionReason: reason.trim(),
      actionAt: new Date()
    };

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    doc.timeline.push({
      status: 'REJECTED_BY_WORKER',
      title: 'Task Rejected / Marked Not Genuine by Field Worker',
      time: nowStr,
      description: `Technician ${user.name}: "${reason.trim()}"`
    });

    await doc.save();

    await User.findByIdAndUpdate(user.id, { availabilityStatus: 'AVAILABLE' });
    if (user.employeeId) {
      await Worker.findOneAndUpdate({ employeeId: user.employeeId }, { status: 'AVAILABLE' });
    }

    await IssueUpdate.create({
      issueId,
      type: 'WORKER_REJECTED',
      message: `Rejected by ${user.name}: ${reason.trim()}`,
      actorId: user.id,
      actorRole: 'WORKER',
      actorName: user.name,
      metadata: { reason: reason.trim() }
    });

    return doc.toObject();
  },

  startTask: async (user, issueId) => {
    return workerService.acceptTask(user, issueId);
  },

  postUpdate: async (user, issueId, message) => {
    if (!message || typeof message !== 'string' || message.trim() === '') {
      const err = new Error('Progress update message is required.');
      err.status = 400;
      throw err;
    }

    const doc = await Issue.findOne({ issueId });
    if (!doc) {
      const err = new Error(`Task '${issueId}' not found.`);
      err.status = 404;
      throw err;
    }

    workerService.checkWorkerAuthorization(doc, user);

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    doc.timeline.push({
      status: 'IN_PROGRESS',
      title: 'Worker Progress Update',
      time: nowStr,
      description: message.trim()
    });

    await doc.save();

    await IssueUpdate.create({
      issueId,
      type: 'WORKER_UPDATE',
      message: message.trim(),
      actorId: user.id,
      actorRole: 'WORKER',
      actorName: user.name
    });

    return doc.toObject();
  },

  resolveTask: async (user, issueId, resolutionData) => {
    const { resolutionNote, resolutionEvidence = [] } = resolutionData || {};

    if (!resolutionNote || typeof resolutionNote !== 'string' || resolutionNote.trim() === '') {
      const err = new Error('Resolution description note is required.');
      err.status = 400;
      throw err;
    }

    const doc = await Issue.findOne({ issueId });
    if (!doc) {
      const err = new Error(`Task '${issueId}' not found.`);
      err.status = 404;
      throw err;
    }

    workerService.checkWorkerAuthorization(doc, user);

    const evidenceItems = Array.isArray(resolutionEvidence) ? resolutionEvidence.map((ev, idx) => ({
      type: typeof ev === 'object' && ev.type ? ev.type : 'image',
      url: saveImageLocally(typeof ev === 'object' && ev.url ? ev.url : ev, `resolution-${issueId}-${idx}`),
      caption: typeof ev === 'object' && ev.caption ? ev.caption : 'Resolution proof photo',
      uploadedAt: new Date()
    })) : [];

    doc.resolution = {
      note: resolutionNote.trim(),
      evidence: evidenceItems,
      resolvedBy: user.id,
      resolvedByName: user.name,
      resolvedAt: new Date()
    };

    doc.status = 'CITIZEN_VERIFICATION';
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    doc.timeline.push({
      status: 'RESOLVED',
      title: 'Work Completed & Marked Resolved',
      time: nowStr,
      description: `Technician ${user.name}: "${resolutionNote.trim()}"`
    });

    doc.timeline.push({
      status: 'CITIZEN_VERIFICATION',
      title: 'Awaiting Citizen Verification',
      time: nowStr,
      description: 'Resolution evidence submitted for citizen sign-off and feedback.'
    });

    await doc.save();

    await User.findByIdAndUpdate(user.id, { availabilityStatus: 'AVAILABLE' });
    if (user.employeeId) {
      await Worker.findOneAndUpdate({ employeeId: user.employeeId }, { status: 'AVAILABLE' });
    }

    await IssueUpdate.create({
      issueId,
      type: 'ISSUE_RESOLVED',
      message: `Resolved by ${user.name}: ${resolutionNote.trim()}`,
      actorId: user.id,
      actorRole: 'WORKER',
      actorName: user.name,
      metadata: { note: resolutionNote.trim(), evidenceCount: evidenceItems.length }
    });

    return doc.toObject();
  }
};
