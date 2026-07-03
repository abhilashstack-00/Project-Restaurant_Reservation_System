/**
 * Handles requests to routes that don't exist.
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Single place where every error in the app ends up. Normalizes Mongoose
 * validation errors, duplicate key errors, and our own ApiError instances
 * into a consistent JSON shape so the frontend never has to guess the
 * error format.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  let message = err.message || 'Internal Server Error';

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for field '${err.path}'`;
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  // Mongo duplicate key error (e.g. duplicate email, or the reservation
  // double-booking partial unique index firing under a race condition)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern || {}).join(', ');
    message = field.includes('table')
      ? 'This table was just booked for the same date and time slot. Please try again.'
      : `Duplicate value for field: ${field}`;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
