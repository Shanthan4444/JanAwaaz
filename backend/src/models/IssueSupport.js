import mongoose from 'mongoose';

const issueSupportSchema = new mongoose.Schema(
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
    }
  },
  {
    timestamps: true
  }
);

issueSupportSchema.index({ issueId: 1, userId: 1 }, { unique: true });

export const IssueSupport = mongoose.model('IssueSupport', issueSupportSchema);
