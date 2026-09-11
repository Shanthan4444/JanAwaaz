import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: String,
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: [
        'ISSUE_RECEIVED',
        'ISSUE_REPORTED',
        'ISSUE_VERIFIED',
        'WORKER_ASSIGNED',
        'WORK_STARTED',
        'WORKER_UPDATE',
        'ISSUE_RESOLVED',
        'VERIFICATION_REQUIRED',
        'CITIZEN_VERIFIED',
        'ISSUE_CLOSED',
        'ISSUE_REOPENED',
        'VOLUNTEER_REGISTERED',
        'COMMUNITY_ACTIVITY'
      ],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    issueId: {
      type: String,
      required: false,
      index: true
    },
    actorId: {
      type: String,
      default: 'system'
    },
    priority: {
      type: String,
      enum: ['LOW', 'NORMAL', 'HIGH', 'CRITICAL'],
      default: 'NORMAL'
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    readAt: {
      type: Date,
      default: null
    },
    deduplicationKey: {
      type: String,
      default: null,
      index: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, isRead: 1 });

export const Notification = mongoose.model('Notification', notificationSchema);
