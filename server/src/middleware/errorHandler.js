/** Forward unmatched routes to the error handler as a 404. */
export const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found — ${req.method} ${req.originalUrl}`));
};

/** Centralized error handler — normalizes common Mongoose errors. */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || 'Server error';

  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    status = 404;
    message = 'Resource not found';
  }
  if (err.code === 11000) {
    status = 409;
    message = `That ${Object.keys(err.keyValue || { value: '' }).join(', ')} is already taken`;
  }
  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }

  res.status(status).json({
    message,
    ...(process.env.NODE_ENV === 'production' ? {} : { stack: err.stack }),
  });
};
