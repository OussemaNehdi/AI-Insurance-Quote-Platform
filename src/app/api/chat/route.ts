import { NextResponse } from 'next/server';
import { chatWithAI, ChatMessage } from '@/lib/openrouter';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messages: ChatMessage[] = body.messages;
    
    const aiResponse = await chatWithAI(messages);
    
    return NextResponse.json(aiResponse);
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { 
        answer: "I'm sorry, I encountered an error processing your request.",
        collectedData: {}
      },
      { status: 500 }
    );
  }
}
