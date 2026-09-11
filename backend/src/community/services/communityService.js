import { Issue } from '../../models/Issue.js';
import { IssueSupport } from '../../models/IssueSupport.js';
import { IssueVolunteer } from '../../models/IssueVolunteer.js';
import { IssueUpdate } from '../../models/IssueUpdate.js';

export const communityService = {
  getCommunityIssues: async (filters = {}) => {
    const query = {};
    if (filters.status && filters.status !== 'ALL') query.status = filters.status;
    if (filters.category && filters.category !== 'ALL') query.category = filters.category;
    if (filters.area) query['location.area'] = new RegExp(filters.area, 'i');

    let sort = { priority: -1, createdAt: -1 };
    if (filters.sort === 'supporters') sort = { supporters: -1, createdAt: -1 };
    if (filters.sort === 'recent') sort = { createdAt: -1 };

    const limit = parseInt(filters.limit, 10) || 50;

    const docs = await Issue.find(query).sort(sort).limit(limit);

    // Return safe public fields
    return docs.map((doc) => {
      const item = doc.toObject();
      delete item.reporter?.mobile;
      return item;
    });
  },

  getPublicIssueById: async (issueId) => {
    const doc = await Issue.findOne({ issueId });
    if (!doc) return null;
    const item = doc.toObject();
    delete item.reporter?.mobile;
    return item;
  },

  supportIssue: async (user, issueId) => {
    const doc = await Issue.findOne({ issueId });
    if (!doc) {
      const err = new Error(`Issue '${issueId}' not found.`);
      err.status = 404;
      throw err;
    }

    const userId = user.id;

    // Check existing support
    const existing = await IssueSupport.findOne({ issueId, userId });
    if (!existing) {
      await IssueSupport.create({ issueId, userId });
      doc.supporters = (doc.supporters || 0) + 1;
      await doc.save();

      await IssueUpdate.create({
        issueId,
        type: 'ISSUE_SUPPORTED',
        message: `Supported by citizen ${user.name || 'User'}`,
        actorId: userId,
        actorRole: user.role || 'CITIZEN',
        actorName: user.name || 'Citizen'
      });

      const { eventService } = await import('../../events/eventService.js');
      eventService.emit('ISSUE_SUPPORTED', {
        issueId: doc.issueId,
        title: doc.title,
        supportersCount: doc.supporters,
        area: doc.location?.area,
        department: doc.department
      });
    }

    return {
      success: true,
      supportersCount: doc.supporters,
      supportedByCurrentUser: true
    };
  },

  removeSupport: async (user, issueId) => {
    const doc = await Issue.findOne({ issueId });
    if (!doc) {
      const err = new Error(`Issue '${issueId}' not found.`);
      err.status = 404;
      throw err;
    }

    const userId = user.id;
    const deleted = await IssueSupport.findOneAndDelete({ issueId, userId });

    if (deleted) {
      doc.supporters = Math.max(0, (doc.supporters || 1) - 1);
      await doc.save();
    }

    return {
      success: true,
      supportersCount: doc.supporters,
      supportedByCurrentUser: false
    };
  },

  getSupportStatus: async (user, issueId) => {
    const doc = await Issue.findOne({ issueId });
    if (!doc) return { supportersCount: 0, supportedByCurrentUser: false };

    const supported = user?.id ? await IssueSupport.exists({ issueId, userId: user.id }) : false;
    return {
      supportersCount: doc.supporters || 0,
      supportedByCurrentUser: !!supported
    };
  },

  volunteerForIssue: async (user, issueId) => {
    const doc = await Issue.findOne({ issueId });
    if (!doc) {
      const err = new Error(`Issue '${issueId}' not found.`);
      err.status = 404;
      throw err;
    }

    const userId = user.id;
    const existing = await IssueVolunteer.findOne({ issueId, userId });

    if (!existing) {
      await IssueVolunteer.create({ issueId, userId, status: 'INTERESTED' });
      doc.volunteers = (doc.volunteers || 0) + 1;
      await doc.save();

      await IssueUpdate.create({
        issueId,
        type: 'VOLUNTEER_REGISTERED',
        message: `Citizen ${user.name || 'User'} registered interest in volunteering`,
        actorId: userId,
        actorRole: user.role || 'CITIZEN',
        actorName: user.name || 'Citizen'
      });

      const { eventService } = await import('../../events/eventService.js');
      eventService.emit('VOLUNTEER_REGISTERED', {
        issueId: doc.issueId,
        title: doc.title,
        volunteerName: user.name || 'A citizen',
        volunteerCount: doc.volunteers,
        department: doc.department
      });
    }

    return {
      success: true,
      volunteersCount: doc.volunteers,
      volunteeredByCurrentUser: true
    };
  },

  cancelVolunteer: async (user, issueId) => {
    const doc = await Issue.findOne({ issueId });
    if (!doc) {
      const err = new Error(`Issue '${issueId}' not found.`);
      err.status = 404;
      throw err;
    }

    const userId = user.id;
    const deleted = await IssueVolunteer.findOneAndDelete({ issueId, userId });

    if (deleted) {
      doc.volunteers = Math.max(0, (doc.volunteers || 1) - 1);
      await doc.save();
    }

    return {
      success: true,
      volunteersCount: doc.volunteers,
      volunteeredByCurrentUser: false
    };
  },

  getVolunteerStatus: async (user, issueId) => {
    const doc = await Issue.findOne({ issueId });
    if (!doc) return { volunteersCount: 0, volunteeredByCurrentUser: false };

    const volunteered = user?.id ? await IssueVolunteer.exists({ issueId, userId: user.id }) : false;
    return {
      volunteersCount: doc.volunteers || 0,
      volunteeredByCurrentUser: !!volunteered
    };
  },

  getVolunteersList: async (issueId) => {
    const records = await IssueVolunteer.find({ issueId }).sort({ createdAt: -1 });
    const { User } = await import('../../models/User.js');

    const volunteers = await Promise.all(
      records.map(async (rec) => {
        const u = await User.findById(rec.userId).select('name createdAt');
        return {
          id: rec._id.toString(),
          name: u?.name || 'Citizen Volunteer',
          status: rec.status,
          registeredAt: rec.createdAt
        };
      })
    );

    return volunteers;
  }
};
