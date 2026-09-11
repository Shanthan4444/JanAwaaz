import { Issue } from '../../models/Issue.js';
import { User } from '../../models/User.js';
import { IssueSupport } from '../../models/IssueSupport.js';
import { IssueVolunteer } from '../../models/IssueVolunteer.js';
import { IssueUpdate } from '../../models/IssueUpdate.js';
import { validateTransition } from '../../issues/utils/statusMachine.js';

export const citizenService = {
  getCitizenProfile: async (user) => {
    const userDoc = await User.findById(user.id).select('-passwordHash');
    const userId = user.id;

    const reportedCount = await Issue.countDocuments({ 'reporter.userId': userId });
    const closedCount = await Issue.countDocuments({ 'reporter.userId': userId, status: 'CLOSED' });
    const supportedCount = await IssueSupport.countDocuments({ userId });
    const volunteerCount = await IssueVolunteer.countDocuments({ userId });
    const verificationNeededCount = await Issue.countDocuments({
      'reporter.userId': userId,
      status: { $in: ['RESOLVED', 'CITIZEN_VERIFICATION'] }
    });

    return {
      id: userDoc?._id.toString() || userId,
      name: userDoc?.name || user.name || 'Citizen User',
      mobile: userDoc?.mobile || user.mobile,
      email: userDoc?.email || user.email,
      role: 'CITIZEN',
      metrics: {
        reportedIssues: reportedCount,
        closedIssues: closedCount,
        supportedIssues: supportedCount,
        volunteerInterests: volunteerCount,
        verificationNeeded: verificationNeededCount
      }
    };
  },

  getCitizenIssues: async (user, filters = {}) => {
    const query = {
      'reporter.userId': user.id
    };

    if (filters.status) {
      if (filters.status === 'ACTIVE') {
        query.status = { $in: ['REPORTED', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS'] };
      } else if (filters.status === 'VERIFICATION') {
        query.status = { $in: ['RESOLVED', 'CITIZEN_VERIFICATION'] };
      } else if (filters.status === 'CLOSED') {
        query.status = 'CLOSED';
      } else if (filters.status === 'REOPENED') {
        query.status = 'REOPENED';
      } else if (filters.status !== 'ALL') {
        query.status = filters.status;
      }
    }

    const issues = await Issue.find(query).sort({ createdAt: -1 });
    return issues.map((i) => i.toObject());
  },

  getCitizenIssueById: async (user, issueId) => {
    const doc = await Issue.findOne({ issueId });
    if (!doc) {
      const err = new Error(`Issue '${issueId}' not found.`);
      err.status = 404;
      throw err;
    }
    return doc.toObject();
  },

  verifyIssue: async (user, issueId, payload = {}) => {
    const doc = await Issue.findOne({ issueId });
    if (!doc) {
      const err = new Error(`Issue '${issueId}' not found.`);
      err.status = 404;
      throw err;
    }

    // Security check: Only reporter can verify (or demo citizen)
    if (doc.reporter && doc.reporter.userId && doc.reporter.userId !== 'demo-citizen-001' && doc.reporter.userId !== user.id) {
      const err = new Error('Access denied. Only the citizen who reported this issue can submit final verification.');
      err.status = 403;
      throw err;
    }

    if (doc.status !== 'CITIZEN_VERIFICATION' && doc.status !== 'RESOLVED') {
      const err = new Error(`Cannot verify issue in status '${doc.status}'. Issue must be RESOLVED or AWAITING VERIFICATION.`);
      err.status = 400;
      throw err;
    }

    validateTransition(doc.status, 'CLOSED');

    doc.citizenVerification = {
      result: 'FIXED',
      reason: payload.reason || 'Citizen verified resolution proof and confirmed issue is fixed.',
      verifiedBy: user.id,
      verifiedByName: user.name || 'Citizen',
      verifiedAt: new Date()
    };

    doc.status = 'CLOSED';

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    doc.timeline.push({
      status: 'CLOSED',
      title: 'Confirmed Fixed & Closed by Citizen',
      time: nowStr,
      description: 'Citizen confirmed resolution quality and approved issue closure.'
    });

    await doc.save();

    await IssueUpdate.create({
      issueId,
      type: 'CITIZEN_VERIFIED',
      message: 'Citizen confirmed resolution quality.',
      actorId: user.id,
      actorRole: 'CITIZEN',
      actorName: user.name
    });

    await IssueUpdate.create({
      issueId,
      type: 'ISSUE_CLOSED',
      message: 'Issue closed with citizen verification.',
      actorId: user.id,
      actorRole: 'CITIZEN',
      actorName: user.name
    });

    const { eventService } = await import('../../events/eventService.js');
    eventService.emit('CITIZEN_VERIFIED', {
      issueId: doc.issueId,
      title: doc.title,
      reporterUserId: doc.reporter?.userId,
      department: doc.department
    });

    return doc.toObject();
  },

  reopenIssue: async (user, issueId, payload = {}) => {
    const { reason, evidence } = payload || {};

    if (!reason || typeof reason !== 'string' || reason.trim() === '') {
      const err = new Error('Reason for reopening is required when marking issue not fixed.');
      err.status = 400;
      throw err;
    }

    const doc = await Issue.findOne({ issueId });
    if (!doc) {
      const err = new Error(`Issue '${issueId}' not found.`);
      err.status = 404;
      throw err;
    }

    if (doc.reporter && doc.reporter.userId && doc.reporter.userId !== 'demo-citizen-001' && doc.reporter.userId !== user.id) {
      const err = new Error('Access denied. Only the citizen who reported this issue can reopen it.');
      err.status = 403;
      throw err;
    }

    if (doc.status !== 'CITIZEN_VERIFICATION' && doc.status !== 'RESOLVED') {
      const err = new Error(`Cannot reopen issue in status '${doc.status}'. Issue must be RESOLVED or AWAITING VERIFICATION.`);
      err.status = 400;
      throw err;
    }

    validateTransition(doc.status, 'REOPENED');

    doc.reopenCount = (doc.reopenCount || 0) + 1;

    doc.citizenVerification = {
      result: 'NOT_FIXED',
      reason: reason.trim(),
      verifiedBy: user.id,
      verifiedByName: user.name || 'Citizen',
      verifiedAt: new Date()
    };

    doc.status = 'REOPENED';

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    doc.timeline.push({
      status: 'REOPENED',
      title: 'Reopened by Citizen',
      time: nowStr,
      description: `Citizen reported issue is not fixed: "${reason.trim()}"`
    });

    await doc.save();

    await IssueUpdate.create({
      issueId,
      type: 'ISSUE_REOPENED',
      message: `Reopened by citizen: ${reason.trim()}`,
      actorId: user.id,
      actorRole: 'CITIZEN',
      actorName: user.name,
      metadata: { reason: reason.trim(), reopenCount: doc.reopenCount }
    });

    const { eventService } = await import('../../events/eventService.js');
    eventService.emit('ISSUE_REOPENED', {
      issueId: doc.issueId,
      title: doc.title,
      reporterUserId: doc.reporter?.userId,
      reason: reason.trim(),
      department: doc.department
    });

    return doc.toObject();
  }
};
