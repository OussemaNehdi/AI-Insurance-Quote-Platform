// OpenRouter API client for Insurance AI

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  answer: string;
  collectedData: {
    insuranceType?: string;
    age?: number | string;
    country?: string;
    gender?: string;
    city?: string;
  };
}

export async function chatWithAI(messages: ChatMessage[]): Promise<AIResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const url = process.env.OPENROUTER_URL || 'https://openrouter.ai/api/v1/chat/completions';
  const model = process.env.MODEL_NAME || 'microsoft/phi-3-medium-128k-instruct';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        max_tokens: 1024, // Increased token limit to ensure complete responses
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    // Parse the JSON string from the response content
    try {
      let content = data.choices[0].message.content;
      
      // Clean up content if it comes wrapped in code block markers
      if (content.includes('```json')) {
        content = content.replace(/```json\n|\n```/g, '');
      } else if (content.includes('```')) {
        content = content.replace(/```\n|\n```/g, '');
      }
      
      const aiResponse = JSON.parse(content) as AIResponse;
      return aiResponse;
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return {
        answer: "Sorry, I encountered an error processing your information.",
        collectedData: {}
      };
    }
  } catch (error) {
    console.error('Error calling OpenRouter API:', error);
    return {
      answer: "I'm having trouble connecting right now. Please try again later.",
      collectedData: {}
    };
  }
}
