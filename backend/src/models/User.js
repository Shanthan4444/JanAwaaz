import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true
    },
    employeeId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    mobile: {
      type: String,
      sparse: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['CITIZEN', 'AUTHORITY', 'WORKER'],
      required: true
    },
    department: {
      type: String,
      default: 'Roads & Infrastructure'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    availabilityStatus: {
      type: String,
      enum: ['AVAILABLE', 'BUSY', 'INACTIVE'],
      default: 'AVAILABLE'
    }
  },
  {
    timestamps: true
  }
);

export const User = mongoose.model('User', userSchema);
