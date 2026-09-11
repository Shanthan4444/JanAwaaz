import { Issue } from '../../models/Issue.js';
import { aiService } from '../../ai/aiService.js';
import { eventService } from '../../events/eventService.js';
import { saveImageLocally } from '../../utils/localStorage.js';

const generateIssueId = async () => {
  const now = new Date();
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const month = monthNames[now.getMonth()];
  const currentYear = now.getFullYear();
  let unique = false;
  let candidateId = '';

  while (!unique) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    candidateId = `JAN-${month}-${currentYear}-${randomNum}`;
    const existing = await Issue.findOne({ issueId: candidateId });
    if (!existing) unique = true;
  }

  return candidateId;
};

export const issueService = {
  createIssue: async (payload, user = null) => {
    const issueId = await generateIssueId();

    const evidenceList = Array.isArray(payload.evidence) && payload.evidence.length > 0
      ? payload.evidence.map((item, idx) => {
          if (typeof item === 'string') {
            const localUrl = saveImageLocally(item, `issue-${issueId}-${idx}`);
            return { type: 'image', url: localUrl, caption: payload.title };
          }
          const localUrl = saveImageLocally(item.url, `issue-${issueId}-${idx}`);
          return { type: item.type || 'image', url: localUrl, caption: item.caption || '' };
        })
      : [{ type: 'image', url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80', caption: 'Default issue evidence' }];

    // Execute AI Analysis
    console.log(`[ISSUE SERVICE] Executing Phase 3 AI Civic Intelligence analysis for issue candidate...`);
    const aiAnalysisResult = await aiService.analyzeIssue(payload);

    // Merge AI recommendations if AI succeeded
    const category = aiAnalysisResult.category || payload.category;
    const department = aiAnalysisResult.department || payload.department || getDepartmentForCategory(category);
    const severity = aiAnalysisResult.severity || payload.severity || 'HIGH';
    const priority = typeof aiAnalysisResult.priority === 'number' ? aiAnalysisResult.priority : (payload.priority || 85);

    const initialTimeline = [
      {
        status: 'REPORTED',
        title: 'Reported by Citizen',
        time: 'Just now',
        description: 'Issue reported and registered in Jansetu database.'
      },
      {
        status: 'VERIFIED',
        title: 'AI Civic Intelligence Verified',
        time: 'Just now',
        description: `Categorized under ${category}. Priority score ${priority}/100 assigned (${aiAnalysisResult.provider || 'AI engine'}).`
      }
    ];

    // AUTOMATIC INTELIGENT WORKER ASSIGNMENT
    let assignedWorkerData = null;
    let initialStatus = 'REPORTED';

    try {
      const { Worker } = await import('../../models/Worker.js');

      // 1. Try finding an AVAILABLE worker in the target department
      let selectedWorker = await Worker.findOne({
        department,
        status: 'AVAILABLE',
        isActive: true
      }).sort({ createdAt: 1 });

      // 2. If all workers in department are busy, pick worker in department with minimum workload
      if (!selectedWorker) {
        const deptWorkers = await Worker.find({ department, isActive: true });
        if (deptWorkers.length > 0) {
          deptWorkers.sort((a, b) => (a.activeTasksCount || 0) - (b.activeTasksCount || 0));
          selectedWorker = deptWorkers[0];
        }
      }

      // 3. Fallback: pick any active worker across the system
      if (!selectedWorker) {
        const anyWorkers = await Worker.find({ isActive: true });
        if (anyWorkers.length > 0) {
          selectedWorker = anyWorkers[Math.floor(Math.random() * anyWorkers.length)];
        }
      }

      if (selectedWorker) {
        initialStatus = 'ASSIGNED';
        assignedWorkerData = {
          id: selectedWorker.employeeId || selectedWorker._id.toString(),
          name: selectedWorker.name,
          role: selectedWorker.role || 'Field Technician',
          phone: selectedWorker.phone || '9876543201',
          assignedAt: new Date()
        };

        // Update worker status and task count
        selectedWorker.status = 'BUSY';
        selectedWorker.activeTasksCount = (selectedWorker.activeTasksCount || 0) + 1;
        await selectedWorker.save();

        initialTimeline.push({
          status: 'ASSIGNED',
          title: `Auto-Assigned to ${selectedWorker.name}`,
          time: 'Just now',
          description: `Dispatched to field technician ${selectedWorker.name} (${selectedWorker.role}). Phone: ${selectedWorker.phone || '9876543201'}.`
        });

        console.log(`[AUTO ASSIGNMENT] Issue '${issueId}' auto-assigned to Worker '${selectedWorker.name}' (Dept: ${department}, Phone: ${selectedWorker.phone})`);
      }
    } catch (workerErr) {
      console.warn('[WORKER AUTO ASSIGNMENT WARN]', workerErr);
    }

    const newIssueData = {
      issueId,
      title: payload.title.trim(),
      description: payload.description.trim(),
      voiceTranscript: payload.voiceTranscript || payload.description.trim(),
      photoDescription: aiAnalysisResult.photoDescription || payload.photoDescription || 'Visual evidence confirmed from citizen photo capture.',
      category,
      department,
      severity,
      priority,
      status: initialStatus,
      location: {
        latitude: payload.location.latitude,
        longitude: payload.location.longitude,
        address: payload.location.address || '',
        area: payload.location.area || 'Sector 14',
        landmark: payload.location.landmark || ''
      },
      evidence: evidenceList,
      reporter: {
        userId: payload.reporter?.userId || user?.id || user?._id || 'demo-citizen-001',
        name: payload.reporter?.name || user?.name || 'Citizen',
        mobile: payload.reporter?.mobile || user?.mobile || ''
      },
      assignedWorker: assignedWorkerData,
      supporters: 1,
      volunteers: 0,
      timeline: initialTimeline,
      aiAnalysis: aiAnalysisResult
    };

    const doc = await Issue.create(newIssueData);

    // Emit event asynchronously
    eventService.emit('ISSUE_REPORTED', {
      issueId: doc.issueId,
      title: doc.title,
      reporterUserId: doc.reporter.userId,
      area: doc.location.area,
      department: doc.department
    });

    return doc.toObject();
  },

  reanalyzeIssue: async (issueId) => {
    const doc = await Issue.findOne({ issueId });
    if (!doc) return null;

    console.log(`[ISSUE SERVICE] Re-analyzing existing issue ${issueId}...`);
    const aiAnalysisResult = await aiService.analyzeIssue(doc.toObject());

    doc.aiAnalysis = aiAnalysisResult;
    doc.category = aiAnalysisResult.category || doc.category;
    doc.department = aiAnalysisResult.department || doc.department;
    doc.severity = aiAnalysisResult.severity || doc.severity;
    doc.priority = typeof aiAnalysisResult.priority === 'number' ? aiAnalysisResult.priority : doc.priority;
    doc.updatedAt = new Date();

    await doc.save();
    return doc.toObject();
  },

  getIssueById: async (issueId) => {
    const doc = await Issue.findOne({ issueId });
    if (!doc) return null;
    return doc.toObject();
  },

  getIssues: async (filters = {}) => {
    const query = {};
    if (filters.status) query.status = filters.status;
    if (filters.category) query.category = filters.category;

    const limit = parseInt(filters.limit, 10) || 50;
    const docs = await Issue.find(query).sort({ createdAt: -1 }).limit(limit);
    return docs.map((d) => d.toObject());
  }
};

function getDepartmentForCategory(category) {
  switch (category) {
    case 'Road Damage': return 'Roads & Infrastructure';
    case 'Garbage': return 'Solid Waste Management';
    case 'Streetlight': return 'Electricity & Public Lighting';
    case 'Water Leakage': return 'Jal Board / Water Works';
    case 'Drainage': return 'Drainage & Sewerage Board';
    case 'Traffic Signal': return 'Public Safety & Municipal Traffic';
    case 'Public Infrastructure': return 'Urban Development';
    default: return 'Municipal Services';
  }
}
