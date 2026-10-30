import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';

// POST /auth/register or /register - Register a new user
export const registerUser = async (req, res, next) => {
  try {
    const name = req.body.name || req.body['name '];
    const { email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        status: 400,
        error: `A user with email '${email}' already exists.`
      });
    }

    // Create user (bcrypt pre-save hook will hash password automatically)
    const user = await User.create({
      name: name || email.split('@')[0],
      email,
      password,
      role: role || 'student'
    });

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      data: {
        id: user._id,
        email: user.email,
        message: 'User registered successfully'
      },
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// POST /auth/login or /login - Authenticate user & issue JWT token
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Query user and explicitly include password field for verification
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        status: 401,
        error: 'Invalid email or password credentials.'
      });
    }

    // Verify password against stored bcrypt hash
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        status: 401,
        error: 'Invalid email or password credentials.'
      });
    }

    // Issue JWT token on successful verification
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      data: {
        token,
        id: user._id,
        email: user.email
      },
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /auth/me or /me - Supplementary Problem: Return current authenticated user details
export const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        id: req.user._id,
        email: req.user.email
      }
    });
  } catch (error) {
    next(error);
  }
};
