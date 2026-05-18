/**
 * Build a full public URL for an uploaded file.
 * Uses BASE_URL when set (e.g. https://api.premedsolution.com).
 */
function buildUploadUrl(req, filename, subfolder = 'images') {
  const base =
    process.env.BASE_URL ||
    `${req.protocol}://${req.get('host')}/`;
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  return `${normalizedBase}uploads/${subfolder}/${filename}`;
}

function buildImageUrl(req, filename) {
  return buildUploadUrl(req, filename, 'images');
}

function buildFileUrl(req, filename) {
  return buildUploadUrl(req, filename, 'files');
}

module.exports = { buildUploadUrl, buildImageUrl, buildFileUrl };
