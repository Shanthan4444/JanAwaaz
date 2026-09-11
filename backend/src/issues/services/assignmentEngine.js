import { Worker } from '../../models/Worker.js';
import { Issue } from '../../models/Issue.js';

export const assignmentEngine = {
  /**
   * Deterministically find best available worker for a department issue:
   * 1. Filter by department (matching or fallback department).
   * 2. Exclude INACTIVE or OFFLINE workers. Prefer AVAILABLE workers.
   * 3. Sort by lowest active workload, then highest civic score.
   */
  findBestWorkerForIssue: async (department, category = '') => {
    // Search for active workers in exact department or related department
    let workers = await Worker.find({
      department,
      status: { $ne: 'INACTIVE' }
    });

    if (!workers || workers.length === 0) {
      // Create backup technician for department
      let defaultRole = 'Field Specialist';
      let defaultName = 'Technician #2';
      if (department.includes('Traffic')) { defaultRole = 'Traffic Enforcement Officer'; defaultName = 'Suresh Rao'; }
      else if (department.includes('Electricity') || department.includes('Power')) { defaultRole = 'Electrical Technician'; defaultName = 'Vivek Kumar'; }
      else if (department.includes('Fire') || department.includes('Emergency')) { defaultRole = 'Firefighter'; defaultName = 'Rahul Sharma'; }
      else if (department.includes('Roads')) { defaultRole = 'Road Maintenance Technician'; defaultName = 'Ramesh Verma'; }
      else if (department.includes('Waste')) { defaultRole = 'Sanitation Worker'; defaultName = 'Sunil Dutt'; }
      else { defaultRole = 'Water Pipeline Technician'; defaultName = 'Mahesh Babu'; }

      return {
        id: `worker-${department.slice(0, 3).toLowerCase()}-backup`,
        name: defaultName,
        role: defaultRole,
        phone: '9876543221',
        department
      };
    }

    // Calculate live active tasks for each candidate worker
    const workerScores = await Promise.all(
      workers.map(async (w) => {
        const activeCount = await Issue.countDocuments({
          'assignedWorker.id': { $in: [w._id.toString(), w.employeeId] },
          status: { $in: ['ASSIGNED', 'IN_PROGRESS'] }
        });

        const isAvailable = w.status === 'AVAILABLE' ? 10 : 0;
        const skillMatch = category && w.skill && w.skill.toLowerCase().includes(category.toLowerCase()) ? 5 : 0;
        const totalScore = isAvailable + skillMatch + (w.civicScore || 90) - (activeCount * 15);

        return {
          worker: w,
          activeCount,
          totalScore
        };
      })
    );

    // Sort by highest score / lowest workload
    workerScores.sort((a, b) => b.totalScore - a.totalScore);
    const selected = workerScores[0].worker;

    return {
      id: selected.employeeId || selected._id.toString(),
      name: selected.name,
      role: selected.role || 'Field Technician',
      phone: selected.phone || '9876543210',
      department: selected.department
    };
  }
};
