import { initialIssues, initialUsers, initialWorkers, initialMetrics } from '../../data/mock';
import { issuesApi } from './issuesApi';

// In-memory reactive state
let issuesStore = [...initialIssues];
let metricsStore = { ...initialMetrics };
let userStore = { ...initialUsers[0] };
let listeners = [];

const notifyListeners = () => {
  listeners.forEach((listener) => listener());
};

export const mockApi = {
  subscribe: (listener) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },

  getIssues: async (filter = 'All') => {
    try {
      const realIssues = await issuesApi.getIssues();
      if (Array.isArray(realIssues) && realIssues.length > 0) {
        return realIssues;
      }
    } catch (e) {
      console.warn('[mockApi] API getIssues fallback to memory store');
    }

    let result = [...issuesStore];
    if (filter === 'Nearby') {
      result = result.filter((i) => i.distanceText && i.distanceText.includes('m away'));
    } else if (filter === 'High Priority') {
      result = result.filter((i) => i.priority >= 80 || i.priorityLevel === 'HIGH' || i.priorityLevel === 'CRITICAL');
    } else if (filter === 'Needs Volunteers') {
      result = result.filter((i) => i.volunteers < 5);
    } else if (filter === 'Recently Reported') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return result;
  },

  getIssue: async (id) => {
    try {
      const realIssue = await issuesApi.getIssue(id);
      if (realIssue) return realIssue;
    } catch (e) {
      console.warn(`[mockApi] API getIssue for ${id} fallback to memory store`);
    }

    return issuesStore.find((i) => i.id === id || i.issueId === id) || issuesStore[0];
  },

  createIssue: async (data) => {
    try {
      const realIssue = await issuesApi.createIssue(data);
      issuesStore = [realIssue, ...issuesStore];
      metricsStore.issuesReported += 1;
      notifyListeners();
      return realIssue;
    } catch (e) {
      console.warn('[mockApi] API createIssue failed, creating memory issue fallback', e);
      const newId = `JAN-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const newIssue = {
        issueId: newId,
        id: newId,
        title: data.title,
        description: data.description,
        category: data.category,
        department: data.department || 'Roads & Infrastructure',
        severity: 'HIGH',
        priority: 88,
        status: 'REPORTED',
        location: data.location || { area: 'Sector 14', landmark: 'Main Gate', latitude: 28.5355, longitude: 77.3910 },
        evidence: data.evidence || ['https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'],
        reporter: { userId: 'user-001' },
        supporters: 1,
        volunteers: 0,
        createdAt: new Date().toISOString(),
        timeline: [
          { status: 'REPORTED', title: 'Reported by Citizen', time: 'Just now', description: 'Submitted via Jansetu report wizard.' }
        ]
      };
      issuesStore = [newIssue, ...issuesStore];
      metricsStore.issuesReported += 1;
      notifyListeners();
      return newIssue;
    }
  },

  supportIssue: async (id) => {
    issuesStore = issuesStore.map((issue) => {
      if (issue.id === id || issue.issueId === id) {
        return { ...issue, supporters: (issue.supporters || 1) + 1 };
      }
      return issue;
    });
    userStore.impactScore += 15;
    notifyListeners();
    return { success: true };
  },

  volunteerForIssue: async (id) => {
    issuesStore = issuesStore.map((issue) => {
      if (issue.id === id || issue.issueId === id) {
        return { ...issue, volunteers: (issue.volunteers || 0) + 1 };
      }
      return issue;
    });
    userStore.impactScore += 30;
    notifyListeners();
    return { success: true };
  },

  assignWorker: async (id, worker) => {
    issuesStore = issuesStore.map((issue) => {
      if (issue.id === id || issue.issueId === id) {
        return {
          ...issue,
          status: 'ASSIGNED',
          assignedWorker: worker,
          updatedAt: new Date().toISOString()
        };
      }
      return issue;
    });
    notifyListeners();
    return { success: true };
  },

  updateIssueStatus: async (id, newStatus, extraData = {}) => {
    issuesStore = issuesStore.map((issue) => {
      if (issue.id === id || issue.issueId === id) {
        return {
          ...issue,
          status: newStatus,
          updatedAt: new Date().toISOString()
        };
      }
      return issue;
    });
    notifyListeners();
    return { success: true };
  },

  verifyResolution: async (id, isFixed = true, reason = '') => {
    issuesStore = issuesStore.map((issue) => {
      if (issue.id === id || issue.issueId === id) {
        const nextStatus = isFixed ? 'CLOSED' : 'REOPENED';
        return {
          ...issue,
          status: nextStatus,
          updatedAt: new Date().toISOString()
        };
      }
      return issue;
    });
    notifyListeners();
    return { success: true, isFixed };
  },

  getMetrics: async () => metricsStore,
  getUserProfile: async () => userStore,
  getWorkers: async () => initialWorkers
};
