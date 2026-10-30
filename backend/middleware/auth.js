import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Utility helper to sign JWT token
export const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'charusat_itue301_practical7_jwt_secret_key_2026',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h'
    }
  );
};

// Express Middleware: Protect routes and verify JWT from Authorization header
export const protect = async (req, res, next) => {
  let token;

  // 1. Check for Bearer token in request Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 2. Reject if no token is provided
  if (!token) {
    return res.status(401).json({
      success: false,
      status: 401,
      error: 'Access denied. No authentication token provided in Authorization header.'
    });
  }

  try {
    // 3. Verify JWT token signature and expiration
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'charusat_itue301_practical7_jwt_secret_key_2026'
    );

    // 4. Check if user still exists in database
    const currentUser = await User.findById(decoded.id).select('-password');
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        status: 401,
        error: 'The user belonging to this token no longer exists.'
      });
    }

    // 5. Attach authenticated user object to Express request pipeline
    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        status: 401,
        error: 'Authentication token has expired. Please log in again.'
      });
    }

    return res.status(401).json({
      success: false,
      status: 401,
      error: 'Invalid authentication token. Authorization denied.'
    });
  }
};
