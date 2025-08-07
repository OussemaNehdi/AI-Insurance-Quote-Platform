// This file handles JWT token creation and verification

import { sign, verify } from 'jsonwebtoken';
import { User } from '@/lib/types';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key-change-in-production';
const TOKEN_EXPIRY = '7d';

export function createToken(user: Partial<User>): string {
  // Remove sensitive information
  const { id, email, companyId, role } = user;
  
  return sign(
    { id, email, companyId, role },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

export function verifyToken(token: string): User | null {
  try {
    const decoded = verify(token, JWT_SECRET) as User;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function getUserFromRequest(req: Request): User | null {
  try {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.split(' ')[1];
    return verifyToken(token);
  } catch (error) {
    return null;
  }
}
