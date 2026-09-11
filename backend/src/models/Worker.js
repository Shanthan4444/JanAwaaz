import mongoose from 'mongoose';

const workerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    role: {
      type: String,
      required: true,
      default: 'Field Technician'
    },
    department: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    skill: {
      type: String,
      default: 'General Maintenance'
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=200&q=80'
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'BUSY', 'OFFLINE', 'INACTIVE'],
      default: 'AVAILABLE'
    },
    civicScore: {
      type: Number,
      default: 92,
      min: 0,
      max: 100
    },
    activeTasksCount: {
      type: Number,
      default: 0
    },
    completedTasksCount: {
      type: Number,
      default: 0
    },
    escalatedTasksCount: {
      type: Number,
      default: 0
    },
    slaBreachesCount: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export const Worker = mongoose.model('Worker', workerSchema);
