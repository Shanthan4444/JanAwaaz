import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Worker } from '../models/Worker.js';

export const seedInitialData = async () => {
  try {
    // Delete any old legacy authority accounts that do not belong to the 5 final departments
    const validDeptNames = [
      'Electrical Department',
      'Water Supply & Sewerage Department',
      'Roads & Infrastructure Department',
      'Municipal Department',
      'Fire Department'
    ];

    await User.deleteMany({
      role: 'AUTHORITY',
      department: { $nin: validDeptNames }
    });

    // Seed 5 Final Authority Accounts
    const authorities = [
      {
        name: 'Chief Electrical Engineer',
        email: 'authority.electrical@janawaaz.local',
        employeeId: 'AUTH-ELEC',
        passwordRaw: 'ElectricalAuth2026!',
        department: 'Electrical Department'
      },
      {
        name: 'Water & Sewerage Director',
        email: 'authority.water@janawaaz.local',
        employeeId: 'AUTH-WATER',
        passwordRaw: 'WaterAuth2026!',
        department: 'Water Supply & Sewerage Department'
      },
      {
        name: 'Chief Infrastructure Officer',
        email: 'authority.roads@janawaaz.local',
        employeeId: 'AUTH-ROADS',
        passwordRaw: 'RoadsAuth2026!',
        department: 'Roads & Infrastructure Department'
      },
      {
        name: 'Municipal Governance Director',
        email: 'authority.municipal@janawaaz.local',
        employeeId: 'AUTH-MUNICIPAL',
        passwordRaw: 'MunicipalAuth2026!',
        department: 'Municipal Department'
      },
      {
        name: 'Chief Fire & Safety Marshal',
        email: 'authority.fire@janawaaz.local',
        employeeId: 'AUTH-FIRE',
        passwordRaw: 'FireAuth2026!',
        department: 'Fire Department'
      }
    ];

    for (const auth of authorities) {
      const passwordHash = await bcrypt.hash(auth.passwordRaw, 10);
      await User.findOneAndUpdate(
        { employeeId: auth.employeeId },
        {
          name: auth.name,
          email: auth.email,
          employeeId: auth.employeeId,
          passwordHash,
          role: 'AUTHORITY',
          department: auth.department,
          isActive: true
        },
        { upsert: true, returnDocument: 'after' }
      );
    }

    // Clean up obsolete workers
    await Worker.deleteMany({
      department: { $nin: validDeptNames }
    });
    await User.deleteMany({
      role: 'WORKER',
      department: { $nin: validDeptNames }
    });

    // Seed Technicians/Field Workers for the 5 final departments
    const defaultWorkerPassHash = await bcrypt.hash('Worker@123', 10);
    const initialWorkers = [
      { name: 'Arjun Rao', employeeId: 'EMP-ELE-101', department: 'Electrical Department', role: 'Electrical Technician', skill: 'Transformers & Streetlights', phone: '9876543201' },
      { name: 'Vivek Kumar', employeeId: 'EMP-ELE-102', department: 'Electrical Department', role: 'Line Technician', skill: 'High Voltage & Street Lighting', phone: '9876543202' },

      { name: 'Suresh Verma', employeeId: 'EMP-WAT-101', department: 'Water Supply & Sewerage Department', role: 'Water Pipeline Technician', skill: 'Burst Pipe & Leak Repair', phone: '9876543203' },
      { name: 'Mahesh Babu', employeeId: 'EMP-WAT-102', department: 'Water Supply & Sewerage Department', role: 'Hydraulics Specialist', skill: 'Main Pipeline Valve Repair', phone: '9876543204' },

      { name: 'Anil Kumar', employeeId: 'EMP-ROA-101', department: 'Roads & Infrastructure Department', role: 'Road Maintenance Technician', skill: 'Pothole & Asphalt Repair', phone: '9876543205' },
      { name: 'Ramesh Verma', employeeId: 'EMP-ROA-102', department: 'Roads & Infrastructure Department', role: 'Civil Technician', skill: 'Road Damage & Pavement Repair', phone: '9876543206' },

      { name: 'Ramesh Singh', employeeId: 'EMP-MUN-101', department: 'Municipal Department', role: 'Sanitation Supervisor', skill: 'Garbage & Waste Disposal', phone: '9876543207' },
      { name: 'Sunil Dutt', employeeId: 'EMP-MUN-102', department: 'Municipal Department', role: 'Drainage & Sewage Technician', skill: 'Blocked Drains & Sewage Clearance', phone: '9876543208' },

      { name: 'Vikram Singh', employeeId: 'EMP-FIR-101', department: 'Fire Department', role: 'Firefighter Lead', skill: 'Fire Suppression & Emergency Response', phone: '9876543209' },
      { name: 'Rahul Sharma', employeeId: 'EMP-FIR-102', department: 'Fire Department', role: 'Emergency Response Officer', skill: 'Hazmat & Fire Evacuation', phone: '9876543210' }
    ];

    for (const w of initialWorkers) {
      await Worker.findOneAndUpdate(
        { employeeId: w.employeeId },
        { ...w, status: 'AVAILABLE', civicScore: 90, isActive: true },
        { upsert: true }
      );

      await User.findOneAndUpdate(
        { employeeId: w.employeeId },
        {
          name: w.name,
          email: `${w.employeeId.toLowerCase()}@janawaaz.local`,
          employeeId: w.employeeId,
          passwordHash: defaultWorkerPassHash,
          role: 'WORKER',
          department: w.department,
          isActive: true
        },
        { upsert: true }
      );
    }

    console.log('[SEED DATA] Successfully seeded 5 Authority accounts and assigned Field Workers.');
  } catch (err) {
    console.error('[SEED DATA ERROR]', err.message);
  }
};
