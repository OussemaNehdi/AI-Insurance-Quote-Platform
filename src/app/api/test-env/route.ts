import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    n8nWebhookUrl: process.env.N8N_WEBHOOK_URL ? 'configured' : 'not configured',
    actualUrl: process.env.N8N_WEBHOOK_URL || 'undefined'
  });
}
