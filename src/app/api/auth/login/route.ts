import { NextResponse } from 'next/server';
import { loginUser } from '@/lib/db';
import { createToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Authenticate user
    const user = await loginUser(email, password);
    
    // Generate JWT token
    const token = createToken(user);
    
    return NextResponse.json({
      success: true,
      user,
      token
    });
  } catch (error: any) {
    console.error('Login error:', error);
    
    // Handle specific MongoDB connection errors
    if (error.message && (
      error.message.includes('MongoServerSelectionError') || 
      error.message.includes('Failed to connect to MongoDB') ||
      error.message.includes('SSL routines')
    )) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database connection error. Please try again later or contact support.',
          details: 'The server could not connect to the database. This might be temporary.'
        },
        { status: 503 }
      );
    }
    
    // Return appropriate error message for auth issues
    if (error.message === 'User not found' || error.message === 'Invalid password') {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Generic error
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to login', 
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
