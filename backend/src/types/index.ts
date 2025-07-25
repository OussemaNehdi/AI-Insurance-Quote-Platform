export interface Company {
  _id?: string;
  companyName: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  licenseNumber?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

export interface JWTPayload {
  companyId: string;
  email: string;
  companyName: string;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      company?: {
        id: string;
        email: string;
        companyName: string;
      };
    }
  }
}



