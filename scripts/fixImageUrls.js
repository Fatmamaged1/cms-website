/**
 * Migration: Fix malformed image URLs in the database.
 * Replaces /../ segments and double slashes in all image URL fields.
 *
 * Usage: node scripts/fixImageUrls.js
 *
 * Requires: .env with MONGODB_URI and BASE_URL set.
 */
require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');

const imageFields = [
  'logo', 'image', 'featuredImage', 'thumbnail',
  'backgroundImage', 'avatar', 'authorImage', 'icon',
  'resume', 'coverImage', 'headerImage', 'footerImage',
];

/**
 * Resolve /../ segments in a URL string.
 * e.g. https://api.premedsolution.com/../uploads/images/x.png
 *   => https://api.premedsolution.com/uploads/images/x.png
 */
function normalizeUrl(url) {
  if (!url || typeof url !== 'string' || !url.startsWith('http')) return url;
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split('/').filter(Boolean);
    const resolved = [];
    for (const s of segments) {
      if (s === '..') resolved.pop();
      else if (s !== '.') resolved.push(s);
    }
    parsed.pathname = resolved.length ? '/' + resolved.join('/') : '/';
    // Also strip double slashes
    const result = parsed.toString().replace(/\/+/g, '/').replace(/:\//, '://');
    return result;
  } catch {
    return url;
  }
}

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const collections = [
      'partners', 'clients', 'services', 'blogs', 'careers',
      'abouts', 'pagecontents', 'users', 'testimonials',
      'jobapplications', 'contactsubmissions', 'settings',
    ];

    let totalFixed = 0;

    for (const colName of collections) {
      const col = mongoose.connection.db.collection(colName);
      const docs = await col.find().toArray();

      if (docs.length === 0) continue;

      for (const doc of docs) {
        const updates = {};
        let changed = false;

        for (const field of imageFields) {
          const value = doc[field];
          if (!value) continue;

          if (typeof value === 'string') {
            const normalized = normalizeUrl(value);
            if (normalized !== value) {
              updates[field] = normalized;
              changed = true;
              console.log(`  ${colName} ${doc._id}: ${field} "${value}" -> "${normalized}"`);
            }
          } else if (Array.isArray(value)) {
            const normalizedArray = value.map((item) => {
              if (typeof item === 'string') return normalizeUrl(item);
              return item;
            });
            if (JSON.stringify(normalizedArray) !== JSON.stringify(value)) {
              updates[field] = normalizedArray;
              changed = true;
            }
          }
        }

        if (changed) {
          await col.updateOne({ _id: doc._id }, { $set: updates });
          totalFixed++;
        }
      }
    }

    console.log(`\nDone. Fixed ${totalFixed} documents across ${collections.length} collections.`);
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

migrate();
