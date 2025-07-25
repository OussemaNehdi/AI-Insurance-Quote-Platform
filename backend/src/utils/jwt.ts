import jwt from 'jsonwebtoken';
import { config } from '../config';
import { JWTPayload } from '../types';

export const generateToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  if (!config.jwt.secret) {
    throw new Error('JWT secret is not configured');
  }
  
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn || '30d',
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): JWTPayload => {
  if (!config.jwt.secret) {
    throw new Error('JWT secret is not configured');
  }
  
  try {
    return jwt.verify(token, config.jwt.secret) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const extractTokenFromHeader = (authHeader: string | undefined): string => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided or invalid format');
  }
  
  return authHeader.substring(7); // Remove 'Bearer ' prefix
};
