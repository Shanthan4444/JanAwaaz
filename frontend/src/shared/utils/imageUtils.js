export const resolveImageUrl = (imgSrc, fallback = 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80', issueId = null) => {
  // 1. Check local storage for stored photo for this specific issueId or latest issue photo!
  try {
    const photoStore = JSON.parse(localStorage.getItem('jansetu_issue_photos') || '{}');
    if (issueId && photoStore[issueId]) {
      return photoStore[issueId];
    }
    if (photoStore['latest'] && (!imgSrc || (typeof imgSrc === 'string' && imgSrc.includes('unsplash')))) {
      return photoStore['latest'];
    }
    const latest = localStorage.getItem('jansetu_latest_issue_photo');
    if (latest && (!imgSrc || (typeof imgSrc === 'string' && imgSrc.includes('unsplash')))) {
      return latest;
    }
  } catch (e) {}

  if (!imgSrc) return fallback;

  if (Array.isArray(imgSrc) && imgSrc.length > 0) {
    imgSrc = imgSrc[0];
  }

  if (typeof imgSrc === 'object' && imgSrc !== null) {
    imgSrc = imgSrc.url || imgSrc.src || '';
  }

  if (typeof imgSrc !== 'string' || imgSrc.trim() === '') {
    return fallback;
  }

  const cleanSrc = imgSrc.trim();

  // If it's a relative backend upload URL like /photos/... or /uploads/...
  if (cleanSrc.startsWith('/photos/') || cleanSrc.startsWith('/uploads/')) {
    let backendOrigin = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
    if (backendOrigin) {
      backendOrigin = backendOrigin.trim().replace(/\/api\/?$/, '');
    } else if (typeof window !== 'undefined' && window.location && window.location.hostname && window.location.hostname.includes('vercel.app')) {
      backendOrigin = 'https://jansetu-2ul5.onrender.com';
    } else if (typeof window !== 'undefined' && window.location) {
      backendOrigin = `${window.location.protocol}//${window.location.hostname}:5001`;
    } else {
      backendOrigin = 'http://localhost:5001';
    }
    return `${backendOrigin}${cleanSrc}`;
  }

  return cleanSrc;
};

export const isRealUserPhoto = (evidence) => {
  if (!evidence) return false;
  let url = '';
  if (Array.isArray(evidence) && evidence.length > 0) {
    const item = evidence[0];
    url = typeof item === 'string' ? item : (item?.url || item?.src || '');
  } else if (typeof evidence === 'object' && evidence !== null) {
    url = evidence.url || evidence.src || '';
  } else if (typeof evidence === 'string') {
    url = evidence;
  }

  if (!url || typeof url !== 'string') return false;
  const cleanUrl = url.trim().toLowerCase();

  // Filter out dummy unsplash images
  if (cleanUrl.includes('unsplash.com')) return false;

  // Real user uploaded photos start with /photos/, /uploads/, data:image/, or blob:
  if (
    cleanUrl.startsWith('/photos/') ||
    cleanUrl.startsWith('/uploads/') ||
    cleanUrl.startsWith('data:image/') ||
    cleanUrl.startsWith('blob:')
  ) {
    return true;
  }

  return false;
};

