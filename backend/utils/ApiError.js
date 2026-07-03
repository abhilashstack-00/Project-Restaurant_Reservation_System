/**
 * Lightweight custom error class so controllers/services can throw errors
 * with an explicit HTTP status code attached. The centralized error
 * middleware reads `statusCode` off caught errors and falls back to 500
 * for anything unexpected (e.g. a raw Mongoose or programming error).
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
