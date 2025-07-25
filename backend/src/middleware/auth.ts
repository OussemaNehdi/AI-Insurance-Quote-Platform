import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { verifyToken, extractTokenFromHeader } from '../utils/jwt';
import { Company } from '../models/Company';
import { ApiResponse, JWTPayload } from '../types';

declare global {
  namespace Express {
    interface Request {
      company?: {
        id: string;
        companyName: string;
        email: string;
      };
    }
  }
}

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const response: ApiResponse = {
      success: false,
      error: 'Validation failed',
      data: errors.array()
    };
    res.status(400).json(response);
    return;
  }
  
  next();
};

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    const decoded: JWTPayload = verifyToken(token);
    
    // Verify company still exists and is active
    const company = await Company.findById(decoded.companyId).select('+isActive');
    
    if (!company || !company.isActive) {
      const response: ApiResponse = {
        success: false,
        error: 'Company not found or inactive'
      };
      res.status(401).json(response);
      return;
    }
    
    // Add company info to request
    req.company = {
      id: company.id,
      companyName: company.companyName,
      email: company.email
    };
    
    next();
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Authentication failed'
    };
    res.status(401).json(response);
  }
};
