import mongoose from 'mongoose';
import { Issue } from '../../models/Issue.js';
import { Worker } from '../../models/Worker.js';
import { IssueUpdate } from '../../models/IssueUpdate.js';
import { validateTransition } from '../../issues/utils/statusMachine.js';

export const authorityService = {
  getDashboard: async (user) => {
    const query = {};
    if (user.department && user.department !== 'General' && user.department !== 'Global') {
      query.department = user.department;
    }

    const allIssues = await Issue.find(query).sort({ priority: -1, createdAt: -1 });

    const criticalCount = allIssues.filter((i) => i.severity === 'CRITICAL' || i.priority >= 90).length;
    const highCount = allIssues.filter((i) => i.severity === 'HIGH' || (i.priority >= 80 && i.priority < 90)).length;
    const pendingCount = allIssues.filter((i) => i.status === 'REPORTED' || i.status === 'VERIFIED').length;
    const inProgressCount = allIssues.filter((i) => i.status === 'IN_PROGRESS' || i.status === 'ASSIGNED').length;

    return {
      metrics: {
        critical: criticalCount,
        high: highCount,
        pending: pendingCount,
        inProgress: inProgressCount,
        totalNeedAttention: criticalCount + highCount
      },
      priorityQueue: allIssues.map((doc) => doc.toObject())
    };
  },

  getIssues: async (user, filters = {}) => {
    const query = {};
    if (user.department && user.department !== 'General' && user.department !== 'Global') {
      query.department = user.department;
    }
    if (filters.status) query.status = filters.status;

    const docs = await Issue.find(query).sort({ priority: -1, createdAt: -1 }).limit(100);
    return docs.map((d) => d.toObject());
  },

  getIssueById: async (user, issueId) => {
    const doc = await Issue.findOne({ issueId });
    if (!doc) return null;
    return doc.toObject();
  },

  verifyIssue: async (user, issueId) => {
    const doc = await Issue.findOne({ issueId });
    if (!doc) throw new Error(`Issue '${issueId}' not found.`);

    validateTransition(doc.status, 'VERIFIED');

    doc.status = 'VERIFIED';
    doc.timeline.push({
      status: 'VERIFIED',
      title: 'Verified by Municipal Authority',
      time: 'Just now',
      description: `Verified and approved by Officer ${user.name} (${user.department || 'Authority'}).`
    });

    await doc.save();

    await IssueUpdate.create({
      issueId,
      type: 'AUTHORITY_VERIFIED',
      message: `Issue verified by Officer ${user.name}`,
      actorId: user.id,
      actorRole: 'AUTHORITY',
      actorName: user.name,
      metadata: { department: user.department }
    });

    const { eventService } = await import('../../events/eventService.js');
    eventService.emit('ISSUE_VERIFIED', {
      issueId: doc.issueId,
      title: doc.title,
      reporterUserId: doc.reporter?.userId,
      department: doc.department
    });

    return doc.toObject();
  },

  updateDecision: async (user, issueId, decisionData) => {
    const doc = await Issue.findOne({ issueId });
    if (!doc) throw new Error(`Issue '${issueId}' not found.`);

    const { category, department, severity, priority, reason } = decisionData;

    doc.authorityDecision = {
      category: category || doc.category,
      department: department || doc.department,
      severity: severity || doc.severity,
      priority: typeof priority === 'number' ? priority : doc.priority,
      decidedBy: user.id,
      decidedByName: user.name,
      decidedAt: new Date(),
      reason: reason || 'Manual review by Municipal Officer'
    };

    if (category) doc.category = category;
    if (department) doc.department = department;
    if (severity) doc.severity = severity;
    if (typeof priority === 'number') doc.priority = priority;

    await doc.save();

    await IssueUpdate.create({
      issueId,
      type: 'AUTHORITY_DECISION_UPDATED',
      message: `Priority/Department override by Officer ${user.name}: Priority=${doc.priority}, Dept=${doc.department}`,
      actorId: user.id,
      actorRole: 'AUTHORITY',
      actorName: user.name,
      metadata: { authorityDecision: doc.authorityDecision }
    });

    return doc.toObject();
  },

  assignWorker: async (user, issueId, workerId) => {
    const doc = await Issue.findOne({ issueId });
    if (!doc) throw new Error(`Issue '${issueId}' not found.`);

    validateTransition(doc.status, 'ASSIGNED');

    let worker = null;
    if (mongoose.Types.ObjectId.isValid(workerId)) {
      worker = await Worker.findById(workerId);
    }
    if (!worker) {
      worker = await Worker.findOne({ employeeId: workerId });
    }

    if (!worker || !worker.isActive) {
      throw new Error(`Worker with ID '${workerId}' is not available for assignment.`);
    }

    doc.assignedWorker = {
      id: worker.employeeId || worker._id.toString(),
      name: worker.name,
      role: worker.role,
      phone: worker.phone,
      avatar: worker.avatar
    };

    doc.status = 'ASSIGNED';
    doc.timeline.push({
      status: 'ASSIGNED',
      title: `Assigned to ${worker.name}`,
      time: 'Just now',
      description: `Dispatched to ${worker.role} (${worker.department}) by Officer ${user.name}.`
    });

    await doc.save();

    worker.status = 'BUSY';
    await worker.save();

    await IssueUpdate.create({
      issueId,
      type: 'WORKER_ASSIGNED',
      message: `Worker ${worker.name} (${worker.role}) assigned by Officer ${user.name}`,
      actorId: user.id,
      actorRole: 'AUTHORITY',
      actorName: user.name,
      metadata: { workerId: worker.employeeId, workerName: worker.name }
    });

    const { eventService } = await import('../../events/eventService.js');
    eventService.emit('WORKER_ASSIGNED', {
      issueId: doc.issueId,
      title: doc.title,
      reporterUserId: doc.reporter?.userId,
      workerUserId: worker._id.toString(),
      workerEmployeeId: worker.employeeId,
      workerName: worker.name,
      area: doc.location?.area,
      department: doc.department
    });

    return doc.toObject();
  },

  getWorkers: async (user) => {
    const query = { isActive: true };
    if (user.department && user.department !== 'Chief Municipal Governance HQ' && user.department !== 'Global' && user.department !== 'General') {
      query.department = user.department;
    }
    const workers = await Worker.find(query).sort({ createdAt: -1 });
    return workers.map((w) => w.toObject());
  },

  hireWorker: async (user, workerData) => {
    const { name, password, department, skill, role } = workerData || {};

    if (!name || !name.trim()) {
      throw new Error('Worker Name is required.');
    }

    if (!password || !password.trim()) {
      throw new Error('Worker Password is required.');
    }

    const targetDept = department || user.department || 'Roads & Infrastructure';
    const deptPrefix = targetDept.slice(0, 3).toUpperCase();
    const randomCode = Math.floor(100 + Math.random() * 900);
    const employeeId = `EMP-${deptPrefix}-${randomCode}`;
    const email = `${employeeId.toLowerCase()}@jansetu.local`;

    const bcryptModule = await import('bcryptjs');
    const bcrypt = bcryptModule.default || bcryptModule;
    const passwordHash = await bcrypt.hash(password.trim(), 10);

    // Create record in Worker collection
    const newWorker = await Worker.create({
      name: name.trim(),
      employeeId,
      phone: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
      department: targetDept,
      role: role || 'Field Technician',
      skill: skill || 'General Maintenance',
      status: 'AVAILABLE',
      civicScore: 90,
      isActive: true
    });

    // Create record in User collection so worker can log in
    const { User } = await import('../../models/User.js');
    await User.create({
      name: name.trim(),
      email,
      employeeId,
      passwordHash,
      role: 'WORKER',
      department: targetDept,
      isActive: true
    });

    return newWorker.toObject();
  },

  getMapIssues: async (user) => {
    const query = {};
    if (user && user.department && user.department !== 'General' && user.department !== 'Global' && user.department !== 'Chief Municipal Governance HQ') {
      query.department = user.department;
    }

    let docs = await Issue.find(query)
      .select('issueId title description category department priority severity status location evidence reporter assignedWorker createdAt updatedAt')
      .sort({ priority: -1, createdAt: -1 })
      .limit(150);

    // Fallback: If department query returned 0 issues, fetch all open issues across departments
    if (docs.length === 0) {
      docs = await Issue.find({})
        .select('issueId title description category department priority severity status location evidence reporter assignedWorker createdAt updatedAt')
        .sort({ priority: -1, createdAt: -1 })
        .limit(150);
    }

    return docs.map((d) => d.toObject());
  }
};
