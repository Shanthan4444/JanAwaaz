import mongoose from 'mongoose';

const issueVolunteerSchema = new mongoose.Schema(
  {
    issueId: {
      type: String,
      required: true,
      index: true
    },
    userId: {
      type: String,
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ['INTERESTED', 'ACCEPTED', 'COMPLETED', 'CANCELLED'],
      default: 'INTERESTED'
    }
  },
  {
    timestamps: true
  }
);

issueVolunteerSchema.index({ issueId: 1, userId: 1 }, { unique: true });

export const IssueVolunteer = mongoose.model('IssueVolunteer', issueVolunteerSchema);
