import mongoose from 'mongoose';

const issueUpdateSchema = new mongoose.Schema(
  {
    issueId: {
      type: String,
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: [
        'ISSUE_REPORTED',
        'AI_ANALYZED',
        'AUTHORITY_VERIFIED',
        'AUTHORITY_DECISION_UPDATED',
        'WORKER_ASSIGNED',
        'WORK_STARTED',
        'WORKER_UPDATE',
        'WORK_RESOLVED',
        'ISSUE_RESOLVED',
        'CITIZEN_VERIFICATION_REQUESTED',
        'CITIZEN_VERIFIED',
        'ISSUE_CLOSED',
        'ISSUE_REOPENED',
        'ISSUE_SUPPORTED',
        'VOLUNTEER_REGISTERED'
      ],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    actorId: {
      type: String,
      default: 'system'
    },
    actorRole: {
      type: String,
      default: 'SYSTEM'
    },
    actorName: {
      type: String,
      default: 'Jansetu System'
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  {
    timestamps: true
  }
);

export const IssueUpdate = mongoose.model('IssueUpdate', issueUpdateSchema);
