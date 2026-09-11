const ALLOWED_CATEGORIES = [
  'ELECTRICAL',
  'WATER_SUPPLY_SEWERAGE',
  'ROADS_INFRASTRUCTURE',
  'MUNICIPAL',
  'FIRE',
  'INVALID',
  // Legacy aliases
  'Streetlight',
  'Water Leakage',
  'Road Damage',
  'Garbage',
  'Drainage',
  'Fire Hazard'
];

const ALLOWED_DEPARTMENTS = [
  'Electrical Department',
  'Water Supply & Sewerage Department',
  'Roads & Infrastructure Department',
  'Municipal Department',
  'Fire Department',
  'NOT ASSIGNED'
];

const ALLOWED_SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'N/A'];

export const validateIssueAnalysisSchema = (data) => {
  if (!data || typeof data !== 'object') {
    throw new Error('AI response is not a valid JSON object.');
  }

  const threshold = parseFloat(process.env.CIVIC_ISSUE_THRESHOLD || '0.50');
  const rawConfidence = typeof data.confidence === 'number' && !isNaN(data.confidence) ? data.confidence : 0.9;
  const confidence = Number(rawConfidence.toFixed(2));

  // Check if explicitly INVALID category or non-civic
  const isInvalidCategory = data.category === 'INVALID' || data.category === 'UNCONFIRMED' || data.isCivicIssue === false;

  if (isInvalidCategory) {
    return {
      isCivicIssue: false,
      valid: false,
      confidence: Math.min(confidence, 0.4),
      evidenceStatus: 'INVALID_EVIDENCE',
      consistency: 'UNKNOWN',
      visualIssueDetected: false,
      issueTitle: 'INVALID ISSUE',
      summary: 'INVALID ISSUE',
      description: data.reasoning || data.description || "This issue is currently outside JanAwaaz's supported civic services.",
      category: 'INVALID',
      department: 'NOT ASSIGNED',
      departmentId: null,
      severity: 'N/A',
      priority: 0,
      reasoning: data.reasoning || "This issue is currently outside JanAwaaz's supported civic services. JanAwaaz currently accepts: Broken streetlights, Water leakage, Potholes / damaged roads, Garbage overflow / blocked drains / sewage overflow, and Fire / fire hazards.",
      photoDescription: data.photoDescription || 'Photo evidence outside supported civic domains.',
      detectedLanguage: 'en'
    };
  }

  // Normalize category to standard code & department
  let cat = data.category;
  let dept = data.department;
  let deptId = data.departmentId || null;

  if (cat === 'Streetlight' || cat === 'Broken Streetlights' || cat === 'ELECTRICAL') {
    cat = 'ELECTRICAL';
    dept = 'Electrical Department';
    deptId = 'ELEC';
  } else if (cat === 'Water Leakage' || cat === 'WATER_SUPPLY_SEWERAGE') {
    cat = 'WATER_SUPPLY_SEWERAGE';
    dept = 'Water Supply & Sewerage Department';
    deptId = 'WATER';
  } else if (cat === 'Road Damage' || cat === 'Potholes / Damaged Roads' || cat === 'ROADS_INFRASTRUCTURE') {
    cat = 'ROADS_INFRASTRUCTURE';
    dept = 'Roads & Infrastructure Department';
    deptId = 'ROADS';
  } else if (cat === 'Garbage' || cat === 'Drainage' || cat === 'Garbage Overflow / Blocked Drains / Sewage Overflow' || cat === 'MUNICIPAL') {
    cat = 'MUNICIPAL';
    dept = 'Municipal Department';
    deptId = 'MUNICIPAL';
  } else if (cat === 'Fire Hazard' || cat === 'Fire / Fire Hazard' || cat === 'FIRE') {
    cat = 'FIRE';
    dept = 'Fire Department';
    deptId = 'FIRE';
  } else {
    // If unknown category, mark INVALID
    return {
      isCivicIssue: false,
      valid: false,
      confidence: 0.3,
      evidenceStatus: 'INVALID_EVIDENCE',
      consistency: 'UNKNOWN',
      visualIssueDetected: false,
      issueTitle: 'INVALID ISSUE',
      summary: 'INVALID ISSUE',
      description: "This issue is currently outside JanAwaaz's supported civic services.",
      category: 'INVALID',
      department: 'NOT ASSIGNED',
      departmentId: null,
      severity: 'N/A',
      priority: 0,
      reasoning: "The reported complaint falls outside the 5 supported JanAwaaz civic domains.",
      photoDescription: 'Outside supported civic domain.',
      detectedLanguage: 'en'
    };
  }

  const severity = ALLOWED_SEVERITIES.includes(data.severity) ? data.severity : 'HIGH';
  const priority = Number(data.priority);
  const validPriority = isNaN(priority) || priority < 0 || priority > 100 ? 85 : Math.round(priority);

  const summary = typeof data.issueTitle === 'string' && data.issueTitle.trim().length > 0 && data.issueTitle !== 'UNKNOWN'
    ? data.issueTitle.trim()
    : (typeof data.summary === 'string' && data.summary.trim().length > 0 ? data.summary.trim() : `${dept} Issue`);

  const reasoning = typeof data.reasoning === 'string' && data.reasoning.trim().length > 0
    ? data.reasoning.trim()
    : `Issue verified and assigned to ${dept}.`;

  return {
    isCivicIssue: true,
    valid: true,
    confidence,
    evidenceStatus: 'VERIFIED',
    consistency: data.consistency || 'MATCH',
    visualIssueDetected: true,
    issueTitle: summary,
    summary,
    description: typeof data.description === 'string' && data.description.trim().length > 0 ? data.description.trim() : summary,
    category: cat,
    department: dept,
    departmentId: deptId,
    severity,
    priority: validPriority,
    duplicateRisk: 0,
    reasoning,
    photoDescription: typeof data.photoDescription === 'string' && data.photoDescription.trim().length > 0
      ? data.photoDescription.trim()
      : reasoning,
    detectedLanguage: 'en'
  };
};

