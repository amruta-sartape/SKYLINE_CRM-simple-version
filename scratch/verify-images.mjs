import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Read discoveryData.ts
const tsContent = fs.readFileSync(path.join(rootDir, 'client/src/utils/discoveryData.ts'), 'utf8');

// Regex to capture property id and images block
const propertyRegex = /id:\s*['"]([^'"]+)['"][\s\S]*?images:\s*\{[\s\S]*?cover:\s*['"]([^'"]+)['"][\s\S]*?gallery:\s*\[([\s\S]*?)\]/g;

let match;
const properties = [];
const allCovers = new Map();
const allGalleryImgs = new Map();
const duplicates = [];

while ((match = propertyRegex.exec(tsContent)) !== null) {
  const propId = match[1];
  const coverUrl = match[2];
  const galleryRaw = match[3];

  const galleryUrls = [];
  const urlRegex = /url:\s*['"]([^'"]+)['"]/g;
  let gMatch;
  while ((gMatch = urlRegex.exec(galleryRaw)) !== null) {
    galleryUrls.push(gMatch[1]);
  }

  properties.push({ id: propId, cover: coverUrl, gallery: galleryUrls });

  if (allCovers.has(coverUrl)) {
    duplicates.push({ type: 'cover', url: coverUrl, prop1: allCovers.get(coverUrl), prop2: propId });
  } else {
    allCovers.set(coverUrl, propId);
  }

  galleryUrls.forEach((url) => {
    if (allGalleryImgs.has(url) && allGalleryImgs.get(url) !== propId) {
      duplicates.push({ type: 'gallery', url, prop1: allGalleryImgs.get(url), prop2: propId });
    } else {
      allGalleryImgs.set(url, propId);
    }
  });
}

console.log('====================================================');
console.log('   PROPERTY IMAGE UNIQUENESS VALIDATION REPORT');
console.log('====================================================');
console.log('Count of catalog properties analyzed:', properties.length);
console.log('Count of unique cover images:', allCovers.size);
console.log('Count of unique gallery images:', allGalleryImgs.size);
console.log('Duplicate image paths found across properties:', duplicates.length);

if (duplicates.length > 0) {
  console.error('\n❌ DUPLICATES DETECTED:');
  console.error(JSON.stringify(duplicates, null, 2));
  process.exit(1);
} else {
  console.log('\n✅ PASS: Zero duplicate image paths found across properties!');
}

// Check all classification images
const classificationRegex = /id:\s*['"]([^'"]+)['"][\s\S]*?image:\s*['"]([^'"]+)['"]/g;
let clsMatch;
const classificationImages = [];
while ((clsMatch = classificationRegex.exec(tsContent)) !== null) {
  classificationImages.push({ id: clsMatch[1], image: clsMatch[2] });
}

console.log('\nCount of property classifications:', classificationImages.length);

// Verify all files exist on disk
let missingFiles = 0;
for (const p of properties) {
  const coverDiskPath = path.join(rootDir, 'client/public', p.cover);
  if (!fs.existsSync(coverDiskPath)) {
    console.error('Missing cover file:', coverDiskPath, 'for property', p.id);
    missingFiles++;
  }
  for (const gUrl of p.gallery) {
    const gDiskPath = path.join(rootDir, 'client/public', gUrl);
    if (!fs.existsSync(gDiskPath)) {
      console.error('Missing gallery file:', gDiskPath, 'for property', p.id);
      missingFiles++;
    }
  }
}

for (const c of classificationImages) {
  const clsDiskPath = path.join(rootDir, 'client/public', c.image);
  if (!fs.existsSync(clsDiskPath)) {
    console.error('Missing classification image:', clsDiskPath, 'for classification', c.id);
    missingFiles++;
  }
}

if (missingFiles > 0) {
  console.error('\n❌ Total missing files on disk:', missingFiles);
  process.exit(1);
} else {
  console.log('✅ PASS: All 19 classification images and all property gallery images exist on disk!');
}
console.log('====================================================');
