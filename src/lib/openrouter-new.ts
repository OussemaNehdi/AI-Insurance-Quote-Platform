// OpenRouter API client for Insurance AI - Improved version

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  success: boolean;
  message?: string;
  error?: string;
  warning?: string;
}

export interface InsuranceAIResponse {
  answer: string;
  collectedData: {
    insuranceType?: string;
    age?: number | string;
    country?: string;
    gender?: string;
    city?: string;
    completed?: boolean;
  };
}

export async function chatWithAI(messages: ChatMessage[]): Promise<{ content: string }> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const url = process.env.OPENROUTER_URL || 'https://openrouter.ai/api/v1/chat/completions';
  const model = process.env.MODEL_NAME || 'deepseek/deepseek-chat-v3-0324';

  try {
    console.log('Calling OpenRouter with model:', model);
    console.log('First message preview:', messages[0]?.content.substring(0, 100) + '...');
    
    // Ensure the system message enforces JSON response format
    if (messages.length > 0 && messages[0].role === 'system') {
      if (!messages[0].content.includes('JSON')) {
        messages[0].content += `\n\nCRITICAL: Your ENTIRE response must be ONLY a valid JSON object in the format: {"answer": "your response", "collectedData": {}}. Do not include any text outside this JSON object.`;
      }
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
        'X-Title': process.env.APP_NAME || 'Insurance AI Assistant',
        'OpenAI-Organization': 'org-',  // Required for OpenRouter
        'X-Requested-With': 'xmlhttprequest'
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        max_tokens: 1024,
        temperature: 0.7,
        response_format: { type: "json_object" },
        tool_choice: "none" // Disable tool choice for DeepSeek model
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenRouter API error (${response.status}):`, errorText);
      throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    // Enhanced logging for debugging
    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
      const responseContent = data.choices[0].message.content;
      console.log('OpenRouter response preview:', 
        responseContent.substring(0, 100) + (responseContent.length > 100 ? '...' : ''));
      
      try {
        // Validate if it's proper JSON
        JSON.parse(responseContent);
        console.log('Response is valid JSON');
      } catch (error) {
        const jsonError = error as Error;
        console.warn('Response is not valid JSON:', jsonError.message);
      }
    } else {
      console.warn('Unexpected API response format:', data);
    }
    
    return {
      content: data.choices[0].message.content
    };
  } catch (error) {
    console.error('Error calling OpenRouter API:', error);
    
    // Return a graceful error response that the client can handle
    return {
      content: JSON.stringify({
        answer: "I'm sorry, but I'm having trouble processing your request right now. Could you please try again?",
        collectedData: {}
      })
    };
  }
}
