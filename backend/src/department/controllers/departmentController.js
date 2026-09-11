import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import { Issue } from '../../models/Issue.js';
import { Worker } from '../../models/Worker.js';
import { authorityService } from '../../authority/services/authorityService.js';
import { slaEngineService } from '../../issues/services/slaEngineService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

// Load department credentials
const credentialsPath = path.resolve(process.cwd(), 'src/data/departmentCredentials.json');
let departmentCredentials = [];
try {
  if (fs.existsSync(credentialsPath)) {
    departmentCredentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
  }
} catch (err) {
  console.warn('[DEPARTMENT CREDENTIALS WARN]', err.message);
}

export const departmentController = {
  // Department Admin Login
  login: async (req, res, next) => {
    try {
      const { username, password } = req.body || {};

      if (!username || !password) {
        return errorResponse(res, 'Username and password are required.', 'VALIDATION_ERROR', 400);
      }

      const found = departmentCredentials.find(
        (c) => c.username.toLowerCase() === username.toLowerCase() && c.password === password
      );

      if (!found) {
        return errorResponse(res, 'Invalid department admin credentials.', 'AUTH_FAILED', 401);
      }

      const secret = process.env.JWT_SECRET || 'jansetu_jwt_secret_dev_key';
      const token = jwt.sign(
        {
          id: `dept-${found.username}`,
          name: found.name,
          username: found.username,
          department: found.department,
          role: 'DEPARTMENT_ADMIN'
        },
        secret,
        { expiresIn: '7d' }
      );

      return successResponse(
        res,
        {
          token,
          user: {
            id: `dept-${found.username}`,
            name: found.name,
            username: found.username,
            department: found.department,
            role: 'DEPARTMENT_ADMIN'
          }
        },
        200
      );
    } catch (err) {
      next(err);
    }
  },

  // Get Issues Filtered STRICTLY by Department
  getDepartmentIssues: async (req, res, next) => {
    try {
      const department = req.user?.department;
      if (!department) {
        return errorResponse(res, 'Department authorization required.', 'AUTH_ERROR', 403);
      }

      // Run live SLA check
      await slaEngineService.evaluateAllActiveSlas();

      const query = {
        $or: [
          { department },
          { department: 'Municipal Services' }
        ]
      };

      if (req.query.status) query.status = req.query.status;
      if (req.query.severity) query.severity = req.query.severity;

      const issues = await Issue.find(query).sort({ priority: -1, createdAt: -1 });
      return successResponse(res, issues, 200);
    } catch (err) {
      next(err);
    }
  },

  // Get Department Workers (Strictly filtered by department)
  getDepartmentWorkers: async (req, res, next) => {
    try {
      const department = req.user?.department;
      let workers = await Worker.find({ department }).sort({ createdAt: -1 });

      if (workers.length === 0) {
        // Seed department-specific realistic technicians
        let defaultWorkersData = [];
        if (department.includes('Traffic')) {
          defaultWorkersData = [
            { name: 'Ravi Kumar', employeeId: 'TC-104', phone: '9876543220', department, role: 'Traffic Constable', skill: 'Traffic Signals & Controls', status: 'AVAILABLE', civicScore: 94 },
            { name: 'Suresh Rao', employeeId: 'TC-105', phone: '9876543221', department, role: 'Traffic Enforcement Officer', skill: 'Road Safety & Intersections', status: 'AVAILABLE', civicScore: 88 }
          ];
        } else if (department.includes('Electricity') || department.includes('Power')) {
          defaultWorkersData = [
            { name: 'Arjun Rao', employeeId: 'ET-207', phone: '9876543222', department, role: 'Electrical Technician', skill: 'Transformers & Substations', status: 'AVAILABLE', civicScore: 92 },
            { name: 'Vivek Kumar', employeeId: 'ET-208', phone: '9876543223', department, role: 'Line Technician', skill: 'High Voltage Lines', status: 'AVAILABLE', civicScore: 95 }
          ];
        } else if (department.includes('Roads')) {
          defaultWorkersData = [
            { name: 'Kiran Kumar', employeeId: 'RT-301', phone: '9876543224', department, role: 'Road Maintenance Technician', skill: 'Pothole & Asphalt Repair', status: 'AVAILABLE', civicScore: 90 },
            { name: 'Ramesh Verma', employeeId: 'RT-302', phone: '9876543225', department, role: 'Civil Technician', skill: 'Structural Inspections', status: 'AVAILABLE', civicScore: 87 }
          ];
        } else if (department.includes('Fire') || department.includes('Emergency')) {
          defaultWorkersData = [
            { name: 'Vikram Singh', employeeId: 'FF-102', phone: '9876543226', department, role: 'Firefighter', skill: 'Fire Suppression & Rescue', status: 'AVAILABLE', civicScore: 96 },
            { name: 'Rahul Sharma', employeeId: 'FF-103', phone: '9876543227', department, role: 'Emergency Response Officer', skill: 'Hazmat & Evacuation', status: 'AVAILABLE', civicScore: 91 }
          ];
        } else if (department.includes('Waste') || department.includes('Sanitation')) {
          defaultWorkersData = [
            { name: 'Sanjay Yadav', employeeId: 'SW-401', phone: '9876543228', department, role: 'Sanitation Supervisor', skill: 'Waste Disposal & Bins', status: 'AVAILABLE', civicScore: 93 },
            { name: 'Sunil Dutt', employeeId: 'SW-402', phone: '9876543229', department, role: 'Sanitation Worker', skill: 'Disinfection & Hygiene', status: 'AVAILABLE', civicScore: 89 }
          ];
        } else {
          defaultWorkersData = [
            { name: 'Ganesh Reddy', employeeId: 'WW-501', phone: '9876543230', department, role: 'Water Pipeline Technician', skill: 'Burst Pipe Repairs', status: 'AVAILABLE', civicScore: 94 },
            { name: 'Mahesh Babu', employeeId: 'WW-502', phone: '9876543231', department, role: 'Drainage Specialist', skill: 'Sewer Blockages', status: 'AVAILABLE', civicScore: 90 }
          ];
        }

        workers = await Worker.insertMany(defaultWorkersData);
      }

      return successResponse(res, workers, 200);
    } catch (err) {
      next(err);
    }
  },

  // Add Worker to Department
  addWorker: async (req, res, next) => {
    try {
      const newWorker = await authorityService.hireWorker(req.user || {}, req.body);
      return successResponse(res, newWorker, 201, 'Field worker created successfully.');
    } catch (error) {
      next(error);
    }
  },

  // Update Worker Status (Available, Busy, Offline, Inactive)
  updateWorkerStatus: async (req, res, next) => {
    try {
      const { workerId } = req.params;
      const { status } = req.body || {};

      if (!status || !['AVAILABLE', 'BUSY', 'OFFLINE', 'INACTIVE'].includes(status)) {
        return errorResponse(res, 'Valid status (AVAILABLE, BUSY, OFFLINE, INACTIVE) is required.', 'VALIDATION_ERROR', 400);
      }

      const updateData = { status };
      if (status === 'INACTIVE') {
        updateData.isActive = false;
      } else {
        updateData.isActive = true;
      }

      const updated = await Worker.findOneAndUpdate(
        { $or: [{ _id: workerId }, { employeeId: workerId }] },
        updateData,
        { new: true }
      );

      if (!updated) {
        return errorResponse(res, `Worker '${workerId}' not found.`, 'NOT_FOUND', 404);
      }

      return successResponse(res, updated, 200);
    } catch (err) {
      next(err);
    }
  }
};
