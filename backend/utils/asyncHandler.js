/**
 * Wraps an async Express route handler so any thrown error (or rejected
 * promise) is automatically forwarded to next(), landing in the
 * centralized error middleware instead of crashing the process or
 * requiring a try/catch in every single controller function.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
