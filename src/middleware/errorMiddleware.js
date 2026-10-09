function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  console.error(err.message);
  if (err.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: Object.values(err.errors).map(e => e.message) });
  }
  if (err.code === 11000) {
    return res.status(409).json({ success: false, message: 'Duplicate value already exists' });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid resource ID' });
  }
  res.status(err.statusCode || 500).json({ success: false, message: err.statusCode ? err.message : 'Internal server error' });
}

module.exports = { notFound, errorHandler };
