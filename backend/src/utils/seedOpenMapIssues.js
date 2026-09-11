import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Issue } from '../models/Issue.js';

dotenv.config();

const sampleBase64Photo = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

const openIssuesToSeed = [
  {
    issueId: 'JAN-SEP-2026-8801',
    title: 'Active Transformer Fire Hazard & Cable Sparking',
    description: 'Electrical transformer sparking intensely with thick black smoke near residential apartments. Urgent fire response needed.',
    category: 'Fire Hazard',
    department: 'Fire & Emergency Services',
    severity: 'CRITICAL',
    priority: 98,
    status: 'REPORTED',
    location: {
      latitude: 17.4375,
      longitude: 78.4482,
      area: 'University Sector',
      landmark: 'Near Gate 2 Entrance',
      address: '📍 University Sector, Near Gate 2 Entrance'
    },
    evidence: [{ type: 'image', url: sampleBase64Photo, caption: 'Transformer fire hazard' }],
    reporter: {
      userId: 'citizen-9876543210',
      name: 'JanAwaaz Citizen',
      mobile: '9876543210'
    },
    supporters: 14,
    volunteers: 3,
    createdAt: new Date(Date.now() - 25 * 60 * 1000) // 25 minutes ago
  },
  {
    issueId: 'JAN-SEP-2026-8802',
    title: 'Chemical Dump Gas Leak & Industrial Fire Threat',
    description: 'Pungent chemical fumes and localized flame outbreak reported behind commercial warehouse complex.',
    category: 'Fire Hazard',
    department: 'Fire & Emergency Services',
    severity: 'CRITICAL',
    priority: 95,
    status: 'ASSIGNED',
    location: {
      latitude: 17.4225,
      longitude: 78.4550,
      area: 'Banjara Hills Sector 2',
      landmark: 'Behind Industrial Warehouse 4',
      address: '📍 Banjara Hills Sector 2, Main Market'
    },
    evidence: [{ type: 'image', url: sampleBase64Photo, caption: 'Industrial chemical fume leak' }],
    reporter: {
      userId: 'citizen-9812345678',
      name: 'Priya Verma',
      mobile: '9812345678'
    },
    assignedWorker: {
      id: 'EMP-FIR-101',
      name: 'Ketan Patel',
      role: 'Senior Fire Captain',
      phone: '9876543201'
    },
    supporters: 8,
    volunteers: 2,
    createdAt: new Date(Date.now() - 75 * 60 * 1000) // 1.25 hours ago
  },
  {
    issueId: 'JAN-SEP-2026-8803',
    title: 'Severe Asphalt Pothole on Main Boulevard',
    description: 'Dangerous 4-foot wide pothole blocking traffic lane near flyover descent.',
    category: 'Road Damage',
    department: 'Roads & Infrastructure',
    severity: 'HIGH',
    priority: 88,
    status: 'ASSIGNED',
    location: {
      latitude: 17.4080,
      longitude: 78.4735,
      area: 'Khairatabad Circle',
      landmark: 'Flyover Pillar 14',
      address: '📍 Khairatabad Circle, Pillar 14'
    },
    evidence: [{ type: 'image', url: sampleBase64Photo, caption: 'Road pothole evidence' }],
    reporter: {
      userId: 'citizen-9823456789',
      name: 'Vikram Singh',
      mobile: '9823456789'
    },
    assignedWorker: {
      id: 'EMP-ROA-202',
      name: 'Ramesh Kumar',
      role: 'Senior Road Technician',
      phone: '9876543202'
    },
    supporters: 19,
    volunteers: 5,
    createdAt: new Date(Date.now() - 180 * 60 * 1000) // 3 hours ago
  },
  {
    issueId: 'JAN-SEP-2026-8804',
    title: 'Hanging High Voltage Wire Near Primary School',
    description: 'Live electrical cable snapped and dangling 5 feet above pedestrian sidewalk.',
    category: 'Electrical Hazard',
    department: 'Electricity & Power Board',
    severity: 'CRITICAL',
    priority: 92,
    status: 'REPORTED',
    location: {
      latitude: 17.3950,
      longitude: 78.4890,
      area: 'Abids Sector 5',
      landmark: 'St. Marks Primary School Gate',
      address: '📍 Abids Sector 5, St. Marks Gate'
    },
    evidence: [{ type: 'image', url: sampleBase64Photo, caption: 'Dangling high voltage cable' }],
    reporter: {
      userId: 'citizen-9834567890',
      name: 'Amitabh Sen',
      mobile: '9834567890'
    },
    supporters: 11,
    volunteers: 1,
    createdAt: new Date(Date.now() - 45 * 60 * 1000) // 45 minutes ago
  },
  {
    issueId: 'JAN-SEP-2026-8805',
    title: 'Overflowing Municipal Waste Dump',
    description: 'Solid waste accumulation spreading across road junction causing health concerns.',
    category: 'Garbage',
    department: 'Solid Waste Management',
    severity: 'MEDIUM',
    priority: 76,
    status: 'IN_PROGRESS',
    location: {
      latitude: 17.4510,
      longitude: 78.3810,
      area: 'HITEC City Sector',
      landmark: 'Cyber Towers Lane',
      address: '📍 HITEC City Sector, Cyber Towers'
    },
    evidence: [{ type: 'image', url: sampleBase64Photo, caption: 'Waste dump overflow' }],
    reporter: {
      userId: 'citizen-9845678901',
      name: 'Sunita Reddy',
      mobile: '9845678901'
    },
    assignedWorker: {
      id: 'EMP-WAS-303',
      name: 'Mahesh Babu',
      role: 'Sanitation Inspector',
      phone: '9876543203'
    },
    supporters: 6,
    volunteers: 2,
    createdAt: new Date(Date.now() - 240 * 60 * 1000) // 4 hours ago
  }
];

async function seedMapIssues() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/janawaaz';
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB.');

    for (const item of openIssuesToSeed) {
      await Issue.findOneAndUpdate(
        { issueId: item.issueId },
        { $set: item },
        { upsert: true, new: true }
      );
      console.log(`[SEED] Upserted map open issue: ${item.issueId} (${item.department} - ${item.severity})`);
    }

    console.log('\n✅ Open map issues successfully seeded into MongoDB!');
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
  }
}

seedMapIssues();
