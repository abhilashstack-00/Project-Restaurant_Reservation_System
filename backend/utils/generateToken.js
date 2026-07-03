const jwt = require('jsonwebtoken');

/**
 * Signs a JWT containing the user's id and role. Role is embedded directly
 * in the token so authorization middleware can check permissions without
 * an extra database lookup on every request.
 */
const generateToken = (userId, role) => {
  const secret = process.env.JWT_SECRET || (process.env.NODE_ENV !== 'production' ? 'local-dev-secret' : null);

  if (!secret) {
    throw new Error('JWT_SECRET is required in production');
  }

  return jwt.sign({ id: userId, role }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

module.exports = generateToken;
