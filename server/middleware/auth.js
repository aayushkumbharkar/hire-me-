const { verifyToken, extractTokenFromHeader } = require('../utils/jwt');
const User = require('../models/User');

// Authenticate user middleware
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    // Verify token
    const decoded = verifyToken(token);
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. User not found.'
      });
    }
    
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Account is deactivated.'
      });
    }
    
    // Attach user to request object
    req.user = user;
    req.userId = user._id;
    req.userRole = user.role;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.message.includes('expired') || error.message.includes('invalid')) {
      return res.status(401).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Authorize specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }
    
    next();
  };
};

// Optional authentication (for routes that work with/without auth)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
    
    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
        req.userId = user._id;
        req.userRole = user.role;
      }
    }
    
    next();
  } catch (error) {
    // Ignore auth errors in optional auth
    next();
  }
};

// Check if user owns resource
const checkOwnership = (resourceUserField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.'
      });
    }
    
    // For URL parameters
    if (req.params[resourceUserField] && req.params[resourceUserField] !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources.'
      });
    }
    
    // For request body
    if (req.body[resourceUserField] && req.body[resourceUserField] !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only modify your own resources.'
      });
    }
    
    next();
  };
};

// Rate limiting per user
const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const userRequests = new Map();
  
  return (req, res, next) => {
    if (!req.user) {
      return next();
    }
    
    const userId = req.userId.toString();
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Get or create user's request log
    if (!userRequests.has(userId)) {
      userRequests.set(userId, []);
    }
    
    const requests = userRequests.get(userId);
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => time > windowStart);
    
    if (validRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    // Add current request
    validRequests.push(now);
    userRequests.set(userId, validRequests);
    
    next();
  };
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
  checkOwnership,
  userRateLimit
};
