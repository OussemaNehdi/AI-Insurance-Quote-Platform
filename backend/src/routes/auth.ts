import { Router } from 'express';
import { register, login, getProfile, updateProfile } from '../controllers/authController';
import { authenticate, handleValidationErrors } from '../middleware/auth';
import { validateRegister, validateLogin, validateCompanyUpdate } from '../utils/validation';

const router = Router();

// Public routes
router.post('/register', validateRegister, handleValidationErrors, register);
router.post('/login', validateLogin, handleValidationErrors, login);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, validateCompanyUpdate, handleValidationErrors, updateProfile);

export default router;
