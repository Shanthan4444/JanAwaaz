import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const photosDir = path.join(__dirname, '../../public/photos');
const uploadsDir = path.join(__dirname, '../../public/uploads');

if (!fs.existsSync(photosDir)) {
  fs.mkdirSync(photosDir, { recursive: true });
}

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export const saveImageLocally = (base64OrUrl, filenamePrefix = 'evidence') => {
  if (!base64OrUrl || typeof base64OrUrl !== 'string') return base64OrUrl;

  // If it's already a HTTP URL or local path (/photos/ or /uploads/), return as is
  if (!base64OrUrl.startsWith('data:image/')) {
    return base64OrUrl;
  }

  try {
    const matches = base64OrUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return base64OrUrl;

    const mimeType = matches[1];
    const base64Data = matches[2];
    const extension = mimeType.split('/')[1] || 'jpg';

    const filename = `${filenamePrefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}.${extension}`;
    const filePath = path.join(photosDir, filename);

    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
    console.log(`[LOCAL DB IMAGE] Saved image file locally to disk: public/photos/${filename}`);

    return `/photos/${filename}`;
  } catch (err) {
    console.warn('[LOCAL DB IMAGE WARN] Could not write to disk, using inline URI:', err.message);
    return base64OrUrl;
  }
};

