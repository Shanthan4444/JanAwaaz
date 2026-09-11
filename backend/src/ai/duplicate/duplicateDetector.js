import { Issue } from '../../models/Issue.js';
import mongoose from 'mongoose';

const STOPWORDS = new Set(['near', 'opposite', 'front', 'the', 'this', 'that', 'with', 'from', 'have', 'been', 'there', 'area', 'zone', 'sector']);

export const duplicateDetector = {
  findDuplicates: async (location, category, title = '', description = '') => {
    try {
      if (mongoose.connection.readyState !== 1) {
        return { duplicateRisk: 0.05, possibleDuplicates: [] };
      }

      if (!location || typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
        return { duplicateRisk: 0.0, possibleDuplicates: [] };
      }

      const radiusMeters = parseInt(process.env.DUPLICATE_SEARCH_RADIUS_METERS, 10) || 300;
      // Convert radius to approx lat/lng degree delta (1 deg lat ~ 111km)
      const latDelta = radiusMeters / 111000;
      const lngDelta = radiusMeters / (111000 * Math.cos((location.latitude * Math.PI) / 180));

      const candidateIssues = await Issue.find({
        category: category,
        status: { $in: ['REPORTED', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS'] },
        'location.latitude': {
          $gte: location.latitude - latDelta,
          $lte: location.latitude + latDelta
        },
        'location.longitude': {
          $gte: location.longitude - lngDelta,
          $lte: location.longitude + lngDelta
        }
      }).limit(10);

      if (candidateIssues.length === 0) {
        return { duplicateRisk: 0.02, possibleDuplicates: [] };
      }

      const possibleDuplicates = [];
      let maxSimilarity = 0;

      const currentText = `${title} ${description}`.toLowerCase();
      const currentLandmark = `${location.landmark || ''} ${location.area || ''}`.toLowerCase();

      for (const candidate of candidateIssues) {
        const candidateLat = candidate.location?.latitude || location.latitude;
        const candidateLng = candidate.location?.longitude || location.longitude;
        const distMeters = calculateHaversineDistanceMeters(
          location.latitude,
          location.longitude,
          candidateLat,
          candidateLng
        );

        // 1. Spatial Proximity Score
        let spatialScore = 0.1;
        if (distMeters <= 50) spatialScore = 1.0;
        else if (distMeters <= 100) spatialScore = 0.7;
        else if (distMeters <= 200) spatialScore = 0.4;
        else if (distMeters <= 300) spatialScore = 0.2;

        // 2. Keyword Text Similarity
        const candidateText = `${candidate.title} ${candidate.description}`.toLowerCase();
        const textScore = calculateTextSimilarity(currentText, candidateText);

        // 3. Landmark & Address Token Disambiguation
        const candidateLandmark = `${candidate.location?.landmark || ''} ${candidate.location?.area || ''}`.toLowerCase();
        const hasLandmarkConflict = checkLandmarkConflict(currentLandmark, candidateLandmark);

        // 4. Combined Multi-Signal Score Calculation
        let combinedSimilarity = (textScore * 0.6) + (spatialScore * 0.4);
        if (hasLandmarkConflict) {
          combinedSimilarity *= 0.3; // Penalty for conflicting landmarks/spots
        }

        combinedSimilarity = Number(Math.min(1.0, combinedSimilarity).toFixed(2));

        if (combinedSimilarity > maxSimilarity) maxSimilarity = combinedSimilarity;

        // Strict multi-signal threshold for duplicate flagging (>= 0.45)
        if (combinedSimilarity >= 0.45) {
          possibleDuplicates.push({
            issueId: candidate.issueId,
            title: candidate.title,
            distanceMeters: Math.round(distMeters),
            similarity: combinedSimilarity
          });
        }
      }

      const estimatedRisk = Number((maxSimilarity * 0.9).toFixed(2));

      return {
        duplicateRisk: Math.max(0.05, estimatedRisk),
        possibleDuplicates
      };
    } catch (err) {
      console.warn('[DUPLICATE DETECTOR WARN] Duplicate search failed:', err.message);
      return { duplicateRisk: 0.05, possibleDuplicates: [] };
    }
  }
};

function calculateHaversineDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calculateTextSimilarity(str1, str2) {
  const words1 = new Set(
    str1.split(/\W+/).filter((w) => w.length > 2 && !STOPWORDS.has(w))
  );
  const words2 = new Set(
    str2.split(/\W+/).filter((w) => w.length > 2 && !STOPWORDS.has(w))
  );

  if (words1.size === 0 || words2.size === 0) return 0.1;

  let intersection = 0;
  for (const w of words1) {
    if (words2.has(w)) intersection++;
  }

  const union = new Set([...words1, ...words2]).size;
  return intersection / union;
}

function checkLandmarkConflict(landmark1, landmark2) {
  const tokens1 = landmark1.split(/\W+/).filter((w) => w.length > 0 && !STOPWORDS.has(w));
  const tokens2 = landmark2.split(/\W+/).filter((w) => w.length > 0 && !STOPWORDS.has(w));

  if (tokens1.length === 0 || tokens2.length === 0) return false;

  const set2 = new Set(tokens2);
  let matchCount = 0;
  for (const t of tokens1) {
    if (set2.has(t)) matchCount++;
  }

  // If both specified explicit landmark tokens and 0 matched -> conflict!
  return matchCount === 0;
}
