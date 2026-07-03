const ApiError = require('../utils/ApiError');

/**
 * Restricts a route to specific roles. Must run AFTER `protect`, since it
 * relies on req.user being already populated.
 *
 * Usage: router.get('/reservations', protect, authorize('admin'), handler)
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'Not authorized, no authenticated user found');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(403, `Role '${req.user.role}' is not permitted to access this resource`);
    }

    next();
  };
};

module.exports = authorize;
