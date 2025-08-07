import { NextResponse } from 'next/server';
import { createUser } from '@/lib/db';
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

    // Create user
    const user = await createUser(email, password, 'company');
    
    // Generate JWT token
    const token = createToken(user);
    
    return NextResponse.json({
      success: true,
      user,
      token
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    
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
    
    // Handle user already exists error
    if (error.message && error.message.includes('User already exists')) {
      return NextResponse.json(
        { success: false, error: 'A user with this email already exists' },
        { status: 409 }
      );
    }
    
    // Generic error
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to register', 
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
