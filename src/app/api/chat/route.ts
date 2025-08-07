import { NextResponse } from 'next/server';
import { chatWithAI, ChatMessage } from '@/lib/openrouter-new'; // Use the improved version

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messages: ChatMessage[] = body.messages;
    
    // Ensure the system message has the right instructions for JSON format
    if (messages.length > 0 && messages[0].role === 'system') {
      // Make sure the system message includes strict JSON response format instructions
      if (!messages[0].content.includes('JSON')) {
        messages[0].content += `
        
⚠️ CRITICAL RULES:
- Your ENTIRE response must be ONLY a single valid JSON object
- Do not include any text outside the JSON object
- NEVER use markdown code blocks or formatting
- Your response MUST start with { and end with }
- Do NOT include the \`\`\`json prefix or \`\`\` suffix

Your entire response must only be in this EXACT JSON format:
{"answer": "your friendly response", "collectedData": {...}}`;
      }
    }
    
    const aiResponse = await chatWithAI(messages);
    
    // Validate that the response is properly formatted JSON
    try {
      // Clean the response to ensure it's valid JSON
      let cleanedResponse = aiResponse.content.trim();
      
      // Remove markdown code blocks if present
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, '');
      }
      if (cleanedResponse.endsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/\s*```$/, '');
      }
      
      // Test if the cleaned response is valid JSON
      const parsed = JSON.parse(cleanedResponse);
      
      // Make sure it has the expected structure
      if (!parsed.answer || typeof parsed.collectedData !== 'object') {
        throw new Error('Response missing required fields');
      }
      
      console.log('Valid JSON response detected');
      
      // If it's valid JSON with the right structure, return as is
      return NextResponse.json({
        success: true,
        message: cleanedResponse
      });
    } catch (jsonError) {
      console.warn('Response is not valid JSON, attempting to extract:', aiResponse.content);
      
      // Try to extract any JSON from the response with advanced pattern matching
      const jsonMatches = aiResponse.content.match(/(\{(?:[^{}]|(?:\{[^{}]*\}))*\})/g);
      
      if (jsonMatches && jsonMatches.length > 0) {
        // Try each potential JSON match, starting with the longest (most likely to be complete)
        const sortedMatches = jsonMatches.sort((a, b) => b.length - a.length);
        
        for (const match of sortedMatches) {
          try {
            const extractedJson = JSON.parse(match);
            if (extractedJson.answer && typeof extractedJson.collectedData === 'object') {
              console.log('Successfully extracted JSON from response');
              return NextResponse.json({
                success: true,
                message: match,
                warning: 'JSON was extracted from a non-JSON response'
              });
            }
          } catch (e) {
            // Continue to next match if this one fails
            continue;
          }
        }
      }
      
      // If extraction fails or no suitable JSON found, format a simple response
      console.log('Failed to extract valid JSON, creating fallback response');
      return NextResponse.json({
        success: true,
        message: JSON.stringify({
          answer: "I'm having trouble processing your request. Could you please provide your information again?",
          collectedData: {}
        })
      });
    }
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { 
        success: false,
        error: "I'm sorry, I encountered an error processing your request."
      },
      { status: 500 }
    );
  }
}
