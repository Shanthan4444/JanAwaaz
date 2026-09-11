import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDatabase, closeDatabase } from '../config/database.js';
import { Issue } from '../models/Issue.js';
import { User } from '../models/User.js';
import { Worker } from '../models/Worker.js';
import { seedInitialData } from './seedData.js';

dotenv.config();

export const seedDatabase = async () => {
  await connectDatabase();
  console.log('[SEED] Seeding database with 5 final authority users and field workers...');

  await seedInitialData();

  // Seed sample valid issues for each of the 5 departments
  const sampleIssues = [
    {
      issueId: 'JAN-2026-ELEC-01',
      title: 'Broken Streetlight on University Road',
      description: 'Streetlight pole #42 has stopped functioning creating dark hazardous stretch at night.',
      category: 'ELECTRICAL',
      department: 'Electrical Department',
      severity: 'HIGH',
      priority: 88,
      status: 'REPORTED',
      location: { latitude: 28.5355, longitude: 77.3910, area: 'University Road', landmark: 'Pole #42' },
      evidence: [{ type: 'image', url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80', caption: 'Broken streetlight' }],
      reporter: { userId: 'demo-citizen-001', name: 'Rahul Sharma', mobile: '9876543210' },
      supporters: 12,
      volunteers: 2,
      timeline: [
        { status: 'REPORTED', title: 'Reported by Citizen', time: 'Sep 11, 08:30 AM', description: 'Broken streetlight reported with photo evidence.' }
      ]
    },
    {
      issueId: 'JAN-2026-WATER-01',
      title: 'Water Leakage from Main Supply Line',
      description: 'Pipeline burst causing continuous water wastage on Green Park main road.',
      category: 'WATER_SUPPLY_SEWERAGE',
      department: 'Water Supply & Sewerage Department',
      severity: 'CRITICAL',
      priority: 95,
      status: 'REPORTED',
      location: { latitude: 28.5401, longitude: 77.3850, area: 'Green Park Main Rd', landmark: 'Block B Market' },
      evidence: [{ type: 'image', url: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80', caption: 'Water pipe leakage' }],
      reporter: { userId: 'demo-citizen-002', name: 'Sunita Rao', mobile: '9876543211' },
      supporters: 24,
      volunteers: 4,
      timeline: [
        { status: 'REPORTED', title: 'Reported by Citizen', time: 'Sep 11, 09:00 AM', description: 'Major water pipeline leak reported.' }
      ]
    },
    {
      issueId: 'JAN-2026-ROADS-01',
      title: 'Pothole and Damaged Road Surface',
      description: 'Severe pothole on main thoroughfare posing danger to two-wheelers.',
      category: 'ROADS_INFRASTRUCTURE',
      department: 'Roads & Infrastructure Department',
      severity: 'HIGH',
      priority: 91,
      status: 'ASSIGNED',
      location: { latitude: 28.5355, longitude: 77.3910, area: 'Sector 14 Main Road', landmark: 'Near Bus Stop' },
      evidence: [{ type: 'image', url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80', caption: 'Deep road pothole' }],
      reporter: { userId: 'demo-citizen-001', name: 'Rahul Sharma', mobile: '9876543210' },
      supporters: 18,
      volunteers: 3,
      assignedWorker: {
        id: 'EMP-ROA-101',
        name: 'Anil Kumar',
        role: 'Road Maintenance Technician',
        phone: '9876543205'
      },
      timeline: [
        { status: 'REPORTED', title: 'Reported by Citizen', time: 'Sep 11, 08:30 AM', description: 'Pothole reported with photo.' },
        { status: 'ASSIGNED', title: 'Assigned to Anil Kumar', time: 'Sep 11, 08:45 AM', description: 'Assigned to Roads Technician Anil Kumar.' }
      ]
    },
    {
      issueId: 'JAN-2026-MUNI-01',
      title: 'Garbage Overflow and Blocked Drain',
      description: 'Garbage bin overflowing and blocking nearby storm drain in Sector 5.',
      category: 'MUNICIPAL',
      department: 'Municipal Department',
      severity: 'HIGH',
      priority: 89,
      status: 'REPORTED',
      location: { latitude: 28.5200, longitude: 77.3700, area: 'Sector 5 Market', landmark: 'Community Center' },
      evidence: [{ type: 'image', url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80', caption: 'Garbage overflow' }],
      reporter: { userId: 'demo-citizen-003', name: 'Amit Solanki', mobile: '9876543212' },
      supporters: 15,
      volunteers: 2,
      timeline: [
        { status: 'REPORTED', title: 'Reported by Citizen', time: 'Sep 11, 09:15 AM', description: 'Garbage overflow reported.' }
      ]
    },
    {
      issueId: 'JAN-2026-FIRE-01',
      title: 'Active Electrical Fire Hazard in Commercial Transformer',
      description: 'Sparking and heavy smoke emitting from roadside transformer unit.',
      category: 'FIRE',
      department: 'Fire Department',
      severity: 'CRITICAL',
      priority: 99,
      status: 'REPORTED',
      location: { latitude: 28.5100, longitude: 77.3600, area: 'Industrial Area Phase 2', landmark: 'Block C Transformer' },
      evidence: [{ type: 'image', url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80', caption: 'Fire hazard' }],
      reporter: { userId: 'demo-citizen-004', name: 'Ketan Patel', mobile: '9876543213' },
      supporters: 30,
      volunteers: 6,
      timeline: [
        { status: 'REPORTED', title: 'Reported by Citizen', time: 'Sep 11, 09:30 AM', description: 'Critical fire hazard reported.' }
      ]
    }
  ];

  for (const issueData of sampleIssues) {
    await Issue.findOneAndUpdate(
      { issueId: issueData.issueId },
      issueData,
      { upsert: true, returnDocument: 'after' }
    );
  }

  console.log('[SEED] Successfully seeded issues for the 5 final departments.');
  await closeDatabase();
};

if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[SEED ERROR]', err);
      process.exit(1);
    });
}
