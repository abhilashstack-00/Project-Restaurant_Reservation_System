const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');

/**
 * Verifies the Bearer token on protected routes and attaches the
 * authenticated user (without password) to req.user for downstream
 * controllers/middleware to use.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized, no token provided');
  }

  try {
    const secret = process.env.JWT_SECRET || (process.env.NODE_ENV !== 'production' ? 'local-dev-secret' : null);

    if (!secret) {
      throw new ApiError(500, 'JWT_SECRET is required in production');
    }

    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new ApiError(401, 'Not authorized, user no longer exists');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(401, 'Not authorized, token failed or expired');
  }
});

module.exports = protect;
