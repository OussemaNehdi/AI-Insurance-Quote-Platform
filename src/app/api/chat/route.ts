import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Chat API called');
    const body = await request.json();
    console.log('Request body:', body);
    
    // Extract session information from the request
    let sessionId = null;
    let userMessage = null;
    let action = null;
    
    if (Array.isArray(body) && body.length > 0) {
      // Handle array format (like loadPreviousSession)
      sessionId = body[0].sessionId;
      action = body[0].action;
    } else if (body.sessionId) {
      // Handle object format (like sendMessage)
      sessionId = body.sessionId;
      userMessage = body.chatInput;
      action = body.action;
    }
    
    // Prepare data to send to n8n with session information
    const n8nPayload = {
      sessionId: sessionId,
      action: action,
      message: userMessage,
      timestamp: new Date().toISOString(),
      route: body.route || 'general',
      metadata: body.metadata || {},
      originalPayload: body // Include original payload for n8n to process
    };
    
    console.log('Prepared payload for n8n:', n8nPayload);
    
    // Forward the request to n8n webhook
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/42deb158-711b-43e1-be6a-349e0a209f99';
    console.log('N8N webhook URL:', n8nWebhookUrl);
    
    if (!n8nWebhookUrl) {
      console.error('N8N webhook URL not configured');
      return NextResponse.json(
        { error: 'N8N webhook URL not configured' },
        { status: 500 }
      );
    }

    console.log('Forwarding to n8n...');
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(n8nPayload),
    });

    console.log('N8N response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('N8N error response:', errorText);
      throw new Error(`N8N webhook error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('N8N response data:', data);
    
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Chat proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
