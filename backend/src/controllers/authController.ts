import { Request, Response } from 'express';
import { Company } from '../models/Company';
import { generateToken } from '../utils/jwt';

interface RegisterRequest {
  companyName: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  licenseNumber?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    token: string;
    company: {
      id: string;
      companyName: string;
      email: string;
      isActive: boolean;
    };
  };
}

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { companyName, email, password, phone, address, licenseNumber }: RegisterRequest = req.body;
    
    // Check if company already exists
    const existingCompany = await Company.findOne({ email });
    if (existingCompany) {
      const response: AuthResponse = {
        success: false,
        error: 'A company with this email already exists'
      };
      res.status(400).json(response);
      return;
    }
    
    // Create new company
    const company = new Company({
      companyName,
      email,
      password,
      phone,
      address,
      licenseNumber
    });
    
    await company.save();
    
    // Generate JWT token
    const token = generateToken({
      companyId: company.id,
      email: company.email,
      companyName: company.companyName
    });
    
    const response: AuthResponse = {
      success: true,
      message: 'Company registered successfully',
      data: {
        token,
        company: {
          id: company.id,
          companyName: company.companyName,
          email: company.email,
          isActive: company.isActive
        }
      }
    };
    
    res.status(201).json(response);
  } catch (error) {
    console.error('Registration error:', error);
    const response: AuthResponse = {
      success: false,
      error: 'Registration failed. Please try again.'
    };
    res.status(500).json(response);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginRequest = req.body;
    
    // Find company and include password for comparison
    const company = await Company.findOne({ email }).select('+password');
    
    if (!company || !company.isActive) {
      const response: AuthResponse = {
        success: false,
        error: 'Invalid credentials or inactive account'
      };
      res.status(401).json(response);
      return;
    }
    
    // Check password
    const isPasswordValid = await company.comparePassword(password);
    if (!isPasswordValid) {
      const response: AuthResponse = {
        success: false,
        error: 'Invalid credentials'
      };
      res.status(401).json(response);
      return;
    }
    
    // Generate JWT token
    const token = generateToken({
      companyId: company.id,
      email: company.email,
      companyName: company.companyName
    });
    
    const response: AuthResponse = {
      success: true,
      message: 'Login successful',
      data: {
        token,
        company: {
          id: company.id,
          companyName: company.companyName,
          email: company.email,
          isActive: company.isActive
        }
      }
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Login error:', error);
    const response: AuthResponse = {
      success: false,
      error: 'Login failed. Please try again.'
    };
    res.status(500).json(response);
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.company) {
      const response: ApiResponse = {
        success: false,
        error: 'Authentication required'
      };
      res.status(401).json(response);
      return;
    }
    
    const company = await Company.findById(req.company.id);
    
    if (!company) {
      const response: ApiResponse = {
        success: false,
        error: 'Company not found'
      };
      res.status(404).json(response);
      return;
    }
    
    const response: ApiResponse = {
      success: true,
      data: {
        id: company.id,
        companyName: company.companyName,
        email: company.email,
        phone: company.phone,
        address: company.address,
        licenseNumber: company.licenseNumber,
        isActive: company.isActive,
        createdAt: company.createdAt
      }
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Get profile error:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Failed to retrieve profile'
    };
    res.status(500).json(response);
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.company) {
      const response: ApiResponse = {
        success: false,
        error: 'Authentication required'
      };
      res.status(401).json(response);
      return;
    }
    
    const { companyName, phone, address, licenseNumber } = req.body;
    
    const updateData: any = {};
    if (companyName) updateData.companyName = companyName;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (licenseNumber) updateData.licenseNumber = licenseNumber;
    
    const company = await Company.findByIdAndUpdate(
      req.company.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!company) {
      const response: ApiResponse = {
        success: false,
        error: 'Company not found'
      };
      res.status(404).json(response);
      return;
    }
    
    const response: ApiResponse = {
      success: true,
      message: 'Profile updated successfully',
      data: company
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Update profile error:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Failed to update profile'
    };
    res.status(500).json(response);
  }
};
