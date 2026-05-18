/**
 * One-time migration: find base64 image data in MongoDB and save as real files.
 *
 * Usage: node scripts/migrateBase64Images.js
 *
 * Connects to MongoDB, scans all PageContent documents for section
 * fields whose url starts with "data:image", extracts the base64 data,
 * saves it to public/uploads/images/, and replaces the url with the
 * proper file URL.
 *
 * Requires a .env file with MONGODB_URI and BASE_URL set.
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const IMAGE_DIR = path.join(__dirname, '..', 'public', 'uploads', 'images');
const BASE_URL = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/+$/, '');

// Ensure output dir exists
fs.mkdirSync(IMAGE_DIR, { recursive: true });

// ─── Helpers ────────────────────────────────────────────────────────────

function isBase64Url(val) {
  if (!val) return false;
  if (typeof val === 'string') return val.startsWith('data:image');
  if (typeof val === 'object' && val.url) return typeof val.url === 'string' && val.url.startsWith('data:image');
  return false;
}

function extractBase64Data(base64Url) {
  const matches = base64Url.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!matches) return null;
  const mime = matches[1];
  const b64 = matches[2];
  const ext = mime.split('/')[1].replace('jpeg', 'jpg');
  return { mime, ext, buffer: Buffer.from(b64, 'base64') };
}

/**
 * Recursively walk an object and replace any field whose value
 * is a base64 string or { url: "data:image..." } with a real file URL.
 * Returns the number of replacements made.
 */
function walkAndFix(obj, results) {
  if (!obj || typeof obj !== 'object') return;

  for (const key of Object.keys(obj)) {
    const val = obj[key];

    if (typeof val === 'string' && val.startsWith('data:image')) {
      const extracted = extractBase64Data(val);
      if (!extracted) continue;

      const filename = `migrated-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extracted.ext}`;
      const filePath = path.join(IMAGE_DIR, filename);
      fs.writeFileSync(filePath, extracted.buffer);

      const url = `${BASE_URL}/uploads/images/${filename}`;
      obj[key] = url;
      results.push({ original: val.substring(0, 80) + '...', url, file: filename });
    } else if (typeof val === 'object' && val && val.url && typeof val.url === 'string' && val.url.startsWith('data:image')) {
      const extracted = extractBase64Data(val.url);
      if (!extracted) continue;

      const filename = `migrated-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extracted.ext}`;
      const filePath = path.join(IMAGE_DIR, filename);
      fs.writeFileSync(filePath, extracted.buffer);

      const url = `${BASE_URL}/uploads/images/${filename}`;
      val.url = url;
      val.mimeType = extracted.mime;
      val.size = extracted.buffer.length;
      val.uploadedAt = new Date();
      results.push({ original: val.url.substring(0, 80) + '...', url, file: filename });
    } else if (typeof val === 'object') {
      walkAndFix(val, results);
    }
  }
}

// ─── Main ───────────────────────────────────────────────────────────────

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI not set in .env');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');

  const PageContent = mongoose.model('PageContent', new mongoose.Schema({}, { strict: false, collection: 'pagecontents' }));

  const docs = await PageContent.find({ pageType: 'home' });
  console.log(`📄 Found ${docs.length} home page document(s)`);

  let totalFixed = 0;

  for (const doc of docs) {
    const results = [];
    const sections = doc.sections || {};

    for (const [sectionKey, sectionData] of Object.entries(sections)) {
      if (typeof sectionData === 'object') {
        walkAndFix(sectionData, results);
      }
    }

    if (results.length > 0) {
      console.log(`\n🔧 Fixing "${doc.language || 'en'}" home page (${results.length} image(s)):`);
      results.forEach((r) => console.log(`  • ${r.file}`));

      const set = { updatedAt: new Date() };
      set.sections = sections;

      await PageContent.updateOne({ _id: doc._id }, { $set: set });
      totalFixed += results.length;
    } else {
      console.log(`  ✓ No base64 data in "${doc.language || 'en'}" home page`);
    }
  }

  console.log(`\n✅ Migration complete — ${totalFixed} image(s) migrated`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
