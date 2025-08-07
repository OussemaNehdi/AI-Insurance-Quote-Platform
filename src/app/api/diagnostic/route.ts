import { NextResponse } from 'next/server';
import { checkDatabaseConnection } from '@/lib/db';

export async function GET() {
  try {
    // Check OpenRouter API key
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    
    // Check database connection using the new utility function
    const dbStatus = await checkDatabaseConnection();
    const dbConnected = dbStatus.status === 'connected';
    const dbMessage = dbConnected
      ? `Connected successfully (${dbStatus.connectionType}) to ${dbStatus.databaseName}. Collections: ${dbStatus.collections?.join(', ')}`
      : dbStatus.details;
    
    return NextResponse.json({
      success: true,
      environment: {
        OPENROUTER_API_KEY_SET: !!openrouterKey,
        OPENROUTER_API_KEY_LENGTH: openrouterKey ? openrouterKey.length : 0,
        MODEL_NAME: process.env.MODEL_NAME || 'Not set',
        APP_URL: process.env.APP_URL || 'Not set',
        NODE_ENV: process.env.NODE_ENV || 'Not set',
        MONGODB_SSL: process.env.MONGODB_SSL || 'Not set',
        MONGODB_TLS: process.env.MONGODB_TLS || 'Not set'
      },
      database: {
        connected: dbConnected,
        message: dbMessage
      }
    });
  } catch (error) {
    console.error('Error in diagnostic API:', error);
    return NextResponse.json(
      { 
        success: false,
        error: "Error running diagnostics"
      },
      { status: 500 }
    );
  }
}
