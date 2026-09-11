import { errorResponse } from '../../utils/response.js';

const ALLOWED_CATEGORIES = [
  'ELECTRICAL',
  'WATER_SUPPLY_SEWERAGE',
  'ROADS_INFRASTRUCTURE',
  'MUNICIPAL',
  'FIRE',
  'Streetlight',
  'Water Leakage',
  'Road Damage',
  'Garbage',
  'Drainage',
  'Fire Hazard'
];

const ALLOWED_SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'N/A'];

export const validateCreateIssue = (req, res, next) => {
  const body = req.body || {};

  // Reject INVALID issues explicitly
  if (body.category === 'INVALID' || body.valid === false || body.isCivicIssue === false) {
    return errorResponse(
      res,
      "This issue is currently outside JanAwaaz's supported civic services.",
      'INVALID_ISSUE',
      400
    );
  }

  // Auto-sanitize title & description
  if (!body.title || typeof body.title !== 'string' || body.title.trim().length === 0) {
    body.title = body.description ? body.description.slice(0, 50) : 'Civic Issue Complaint';
  }

  if (!body.description || typeof body.description !== 'string' || body.description.trim().length === 0) {
    body.description = body.title || 'Civic issue report registered by citizen.';
  }

  // Auto-sanitize category
  if (!body.category || !ALLOWED_CATEGORIES.includes(body.category)) {
    body.category = 'ROADS_INFRASTRUCTURE';
  }

  // Auto-sanitize severity
  if (!body.severity || !ALLOWED_SEVERITIES.includes(body.severity)) {
    body.severity = 'HIGH';
  }

  // Auto-sanitize location
  if (!body.location || typeof body.location !== 'object') {
    body.location = { latitude: 17.4576, longitude: 78.3684, area: 'University Sector' };
  } else {
    let lat = Number(body.location.latitude);
    let lng = Number(body.location.longitude);
    if (isNaN(lat) || lat < -90 || lat > 90) lat = 17.4576;
    if (isNaN(lng) || lng < -180 || lng > 180) lng = 78.3684;
    body.location.latitude = lat;
    body.location.longitude = lng;
    if (!body.location.area) body.location.area = 'Sector 14';
  }

  next();
};

