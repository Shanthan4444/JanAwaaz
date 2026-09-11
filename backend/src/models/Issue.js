import mongoose from 'mongoose';

const evidenceSchema = new mongoose.Schema({
  type: { type: String, default: 'image' },
  url: { type: String, required: true },
  caption: { type: String, default: '' },
  uploadedAt: { type: Date, default: Date.now }
}, { _id: false });

const timelineItemSchema = new mongoose.Schema({
  status: { type: String, required: true },
  title: { type: String, required: true },
  time: { type: String, required: true },
  description: { type: String, required: true }
}, { _id: false });

const locationSchema = new mongoose.Schema({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  address: { type: String, default: '' },
  area: { type: String, default: 'Sector 14' },
  landmark: { type: String, default: '' }
}, { _id: false });

const possibleDuplicateSchema = new mongoose.Schema({
  issueId: { type: String, required: true },
  title: { type: String, required: true },
  similarity: { type: Number, required: true }
}, { _id: false });

const aiAnalysisSchema = new mongoose.Schema({
  category: { type: String, required: true },
  department: { type: String, required: true },
  severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'UNKNOWN'], required: true },
  priority: { type: Number, min: 0, max: 100, required: true },
  duplicateRisk: { type: Number, min: 0, max: 1, required: true },
  possibleDuplicates: [possibleDuplicateSchema],
  summary: { type: String, required: true },
  reasoning: { type: String, required: true },
  detectedLanguage: { type: String, default: 'en' },
  summaryNative: { type: String, default: '' },
  reasoningNative: { type: String, default: '' },
  confidence: { type: Number, min: 0, max: 1, default: 0.9 },
  provider: { type: String, default: 'none' },
  model: { type: String, default: '' },
  promptVersion: { type: String, default: 'issue-analysis-v1' },
  status: { type: String, enum: ['NOT_ANALYZED', 'ANALYZING', 'ANALYZED', 'AI_UNAVAILABLE'], default: 'NOT_ANALYZED' },
  analyzedAt: { type: Date, default: Date.now }
}, { _id: false });

const authorityDecisionSchema = new mongoose.Schema({
  category: String,
  department: String,
  severity: String,
  priority: Number,
  decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  decidedByName: String,
  decidedAt: { type: Date, default: Date.now },
  reason: String
}, { _id: false });

const resolutionRecordSchema = new mongoose.Schema({
  note: { type: String, required: true },
  evidence: [evidenceSchema],
  resolvedBy: String,
  resolvedByName: String,
  resolvedAt: { type: Date, default: Date.now }
}, { _id: false });

const citizenVerificationRecordSchema = new mongoose.Schema({
  result: { type: String, enum: ['FIXED', 'NOT_FIXED'], required: true },
  reason: { type: String, default: '' },
  evidence: [evidenceSchema],
  verifiedBy: String,
  verifiedByName: String,
  verifiedAt: { type: Date, default: Date.now }
}, { _id: false });

const issueSchema = new mongoose.Schema(
  {
    issueId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Fire Hazard',
        'Electrical Hazard',
        'Road Damage',
        'Garbage',
        'Streetlight',
        'Water Leakage',
        'Drainage',
        'Traffic Signal',
        'Public Infrastructure',
        'Other',
        'UNKNOWN',
        'OUT OF CONTEXT',
        'OUT_OF_CONTEXT'
      ]
    },
    voiceTranscript: {
      type: String,
      default: ''
    },
    photoDescription: {
      type: String,
      default: ''
    },
    department: {
      type: String,
      default: 'Municipal Services'
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'UNKNOWN', 'OUT OF CONTEXT', 'OUT_OF_CONTEXT'],
      default: 'HIGH'
    },
    priority: {
      type: Number,
      min: 0,
      max: 100,
      default: 85
    },
    status: {
      type: String,
      enum: [
        'REPORTED',
        'VERIFIED',
        'ASSIGNED',
        'IN_PROGRESS',
        'RESOLVED',
        'REJECTED_BY_WORKER',
        'CITIZEN_VERIFICATION',
        'CLOSED',
        'REOPENED'
      ],
      default: 'REPORTED',
      index: true
    },
    location: {
      type: locationSchema,
      required: true
    },
    evidence: [evidenceSchema],
    reporter: {
      userId: {
        type: String,
        default: 'demo-citizen-001'
      },
      name: String,
      mobile: String
    },
    supporters: {
      type: Number,
      default: 1
    },
    volunteers: {
      type: Number,
      default: 0
    },
    assignedWorker: {
      id: String,
      name: String,
      role: String,
      phone: String,
      avatar: String
    },
    timeline: [timelineItemSchema],
    resolutionProof: {
      beforeUrl: String,
      afterUrl: String,
      timestamp: Date,
      note: String
    },
    resolution: {
      type: resolutionRecordSchema,
      required: false
    },
    citizenVerification: {
      type: citizenVerificationRecordSchema,
      required: false
    },
    reopenCount: {
      type: Number,
      default: 0
    },
    aiAnalysis: {
      type: aiAnalysisSchema,
      required: false
    },
    authorityDecision: {
      type: authorityDecisionSchema,
      required: false
    },
    workerDecision: {
      action: { type: String, enum: ['ACCEPTED', 'REJECTED'] },
      workerId: String,
      workerName: String,
      rejectionReason: String,
      actionAt: { type: Date, default: Date.now }
    },
    sla: {
      initialSeconds: { type: Number, default: 24 },
      startedAt: { type: Date, default: Date.now },
      expiresAt: { type: Date },
      status: { type: String, enum: ['SLA_NORMAL', 'SLA_WARNING', 'SLA_BREACHED', 'RESOLVED'], default: 'SLA_NORMAL' },
      breachedAt: Date
    },
    escalation: {
      isEscalated: { type: Boolean, default: false },
      escalationCount: { type: Number, default: 0 },
      originalWorkerId: String,
      originalWorkerName: String,
      escalatedToWorkerId: String,
      escalatedToWorkerName: String,
      incentiveAmount: { type: Number, default: 150 },
      bonusPoints: { type: Number, default: 5 },
      escalatedAt: Date
    }
  },
  {
    timestamps: true
  }
);

issueSchema.index({ 'assignedWorker.id': 1 });
issueSchema.index({ 'reporter.userId': 1 });
issueSchema.index({ status: 1, priority: -1 });

export const Issue = mongoose.model('Issue', issueSchema);
