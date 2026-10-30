import express from 'express';
import { registerUser, loginUser, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validateRegisterInput, validateLoginInput } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/register', validateRegisterInput, registerUser);
router.post('/login', validateLoginInput, loginUser);

// Protected routes (Supplementary Problem /me)
router.get('/me', protect, getMe);

export default router;
