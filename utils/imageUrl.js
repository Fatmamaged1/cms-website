/**
 * Build a full public URL for an uploaded file.
 * Uses BASE_URL when set (e.g. https://api.premedsolution.com).
 * Always produces clean URLs — no ../, no double slashes, no path segments.
 */
function buildUploadUrl(req, filename, subfolder = 'images') {
  let base = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

  // Strip trailing slashes
  base = base.replace(/\/+$/, '');

  // If BASE_URL contains a path (e.g. https://api.premedsolution.com/api/v1),
  // extract only the origin (protocol + host).
  try {
    const url = new URL(base);
    base = url.origin;
  } catch {
    // Not a valid URL — use as-is (development fallback)
  }

  // Clean filename: remove leading ../ or /
  const cleanFilename = filename.replace(/^(\.\.\/|\/)+/, '');

  return `${base}/uploads/${subfolder}/${cleanFilename}`;
}

function buildImageUrl(req, filename) {
  return buildUploadUrl(req, filename, 'images');
}

function buildFileUrl(req, filename) {
  return buildUploadUrl(req, filename, 'files');
}

/**
 * Normalize an existing image URL stored in the database.
 * Fixes: ../ segments, double slashes, trailing slashes.
 * Returns the original URL if it already starts with http and is clean.
 */
function normalizeImageUrl(url) {
  if (!url || !url.startsWith('http')) return url;

  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split('/').filter(Boolean);
    const resolved = [];
    for (const s of segments) {
      if (s === '..') resolved.pop();
      else if (s !== '.') resolved.push(s);
    }
    parsed.pathname = resolved.length ? '/' + resolved.join('/') : '/';
    return parsed.toString();
  } catch {
    return url;
  }
}

module.exports = { buildUploadUrl, buildImageUrl, buildFileUrl, normalizeImageUrl };
