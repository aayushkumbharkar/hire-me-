const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Generate JWT token
const generateToken = (payload) => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'hire-me-app',
    audience: 'hire-me-users'
  });
};

// Verify JWT token
const verifyToken = (token) => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'hire-me-app',
      audience: 'hire-me-users'
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else if (error.name === 'NotBeforeError') {
      throw new Error('Token not active');
    } else {
      throw new Error('Token verification failed');
    }
  }
};

// Decode JWT token without verification (for debugging)
const decodeToken = (token) => {
  return jwt.decode(token);
};

// Generate refresh token (longer expiration)
const generateRefreshToken = (payload) => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '30d',
    issuer: 'hire-me-app',
    audience: 'hire-me-users'
  });
};

// Extract token from Authorization header
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) {
    return null;
  }
  
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1];
  }
  
  return null;
};

module.exports = {
  generateToken,
  verifyToken,
  decodeToken,
  generateRefreshToken,
  extractTokenFromHeader
};
