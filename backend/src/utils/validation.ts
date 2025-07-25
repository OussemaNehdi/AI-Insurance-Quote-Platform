import { body, ValidationChain } from 'express-validator';

export const validateRegister: ValidationChain[] = [
  body('companyName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z0-9\s&.-]+$/)
    .withMessage('Company name contains invalid characters'),
    
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
    
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    
  body('phone')
    .optional()
    .trim()
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be between 10 and 15 characters'),
    
  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address cannot exceed 200 characters'),
    
  body('licenseNumber')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('License number cannot exceed 50 characters')
];

export const validateLogin: ValidationChain[] = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
    
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

export const validateCompanyUpdate: ValidationChain[] = [
  body('companyName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
    
  body('phone')
    .optional()
    .trim()
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be between 10 and 15 characters'),
    
  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address cannot exceed 200 characters'),
    
  body('licenseNumber')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('License number cannot exceed 50 characters')
];
