'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChatMessage, AIResponse } from '@/lib/openrouter';

interface Message {
  id: number;
  text: string;
  isBot: boolean;
}

interface InsuranceData {
  insuranceType?: string;
  age?: number | string; // Support both number and string for flexibility
  country?: string;
  gender?: string;
  city?: string;
}

export default function ClientPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your insurance assistant. I can help you find the best insurance plan. What type of insurance are you looking for? (Auto, Home, Life, or Health)",
      isBot: true,
    },
  ]);
  const [clientData, setClientData] = useState<InsuranceData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showQuote, setShowQuote] = useState(false);
  const [quoteData, setQuoteData] = useState<any>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      role: 'system',
      content: `You are a chatbot for an insurance company. Your task is to collect information from users: 
      1) insurance type (Auto, Home, Life, Health), 
      2) age (must be a number), 
      3) country, 
      4) gender, 
      5) city.

      ⚠️ IMPORTANT RULES:
      DO NOT output anything except a single valid JSON object.
      Your entire response must only be in this JSON format:
      { "answer": "your friendly response", "collectedData": { ... } }
      Never include any natural language outside the JSON.
      Be extremely conversational inside the answer field, like ChatGPT.
      Do not move to the next question until the current one is valid.
      
      Update the collectedData object as you collect each piece of information.
      For example, after getting the insurance type:
      { "answer": "...", "collectedData": {"insuranceType": "Auto"} }
      
      After getting age:
      { "answer": "...", "collectedData": {"insuranceType": "Auto", "age": 30} }
      
      And so on until all fields are filled.
      
      Once you verify all fields are filled, add a completion message in the answer field.`
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Process user input and get AI response
  const processInput = async (userInput: string) => {
    setIsLoading(true);
    
    // Add user message to chat
    const newUserMessage: Message = {
      id: messages.length + 1,
      text: userInput,
      isBot: false,
    };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    
    // Update chat history with user's message
    const updatedHistory = [...chatHistory, { role: 'user' as const, content: userInput }];
    setChatHistory(updatedHistory);
    
    try {
      // Make API call to get AI response
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: updatedHistory }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }
      
      const aiData: AIResponse = await response.json();
      
      // Add AI response to chat
      const newBotMessage: Message = {
        id: messages.length + 2,
        text: aiData.answer,
        isBot: true,
      };
      setMessages(prevMessages => [...prevMessages, newBotMessage]);
      
      // Update chat history with AI's response
      setChatHistory([...updatedHistory, { role: 'assistant' as const, content: JSON.stringify(aiData) }]);
      
      // Update client data with any new information
      if (aiData.collectedData) {
        setClientData(prev => ({...prev, ...aiData.collectedData}));
        
        // Check if all required data has been collected
        const requiredFields = ['insuranceType', 'age', 'country', 'gender', 'city'];
        const allFieldsFilled = requiredFields.every(field => 
          aiData.collectedData && field in aiData.collectedData
        );
        
        if (allFieldsFilled) {
          // Generate a quote with the collected data
          await generateQuote(aiData.collectedData);
        }
      }
    } catch (error) {
      console.error('Error processing input:', error);
      const errorMessage: Message = {
        id: messages.length + 2,
        text: "I'm sorry, I encountered an error. Please try again.",
        isBot: true,
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate a quote using the collected data
  const generateQuote = async (data: InsuranceData) => {
    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate quote');
      }
      
      const quoteResponse = await response.json();
      setQuoteData(quoteResponse);
      setShowQuote(true);
      
      // Add a message about the quote
      const quoteMessage: Message = {
        id: messages.length + 3,
        text: `Great! Based on your information, we've generated a quote of $${quoteResponse.quote.amount} ${quoteResponse.quote.currency} ${quoteResponse.quote.period}. You can see the details in the panel.`,
        isBot: true,
      };
      setMessages(prevMessages => [...prevMessages, quoteMessage]);
    } catch (error) {
      console.error('Error generating quote:', error);
    }
  };

  // Handle user message submission
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    processInput(input);
    setInput('');
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <header className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold">Insurance Finder</h1>
          <Link href="/" className="text-blue-600 hover:underline">
            Back to Home
          </Link>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Chatbot Interface */}
        <div className="w-full md:w-2/3 flex flex-col h-[600px] bg-white rounded-lg shadow">
          <div className="p-4 bg-blue-600 text-white rounded-t-lg">
            <h2 className="font-semibold">Insurance AI Assistant</h2>
          </div>
          
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    message.isBot
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input area */}
          <form onSubmit={handleSendMessage} className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading || showQuote}
              />
              <button
                type="submit"
                className={`${isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white px-4 py-2 rounded-full`}
                disabled={isLoading || showQuote}
              >
                {isLoading ? 'Thinking...' : 'Send'}
              </button>
            </div>
          </form>
        </div>

        {/* Results panel - shows data collection progress or quote */}
        <div className="w-full md:w-1/3">
          {showQuote && quoteData ? (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Your Insurance Quote</h2>
              
              <div className="mb-6 p-5 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-2xl font-bold text-green-800">${quoteData.quote.amount} {quoteData.quote.currency}</p>
                <p className="text-sm text-green-600">{quoteData.quote.period} premium</p>
                <p className="mt-2 text-gray-700">{quoteData.quote.details}</p>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-md">
                <h3 className="font-semibold text-lg">Your Information</h3>
                <ul className="mt-2 space-y-1">
                  <li><span className="font-medium">Insurance Type:</span> {quoteData.userInfo.insuranceType}</li>
                  <li><span className="font-medium">Age:</span> {quoteData.userInfo.age}</li>
                  <li><span className="font-medium">Country:</span> {quoteData.userInfo.country}</li>
                  <li><span className="font-medium">Gender:</span> {quoteData.userInfo.gender}</li>
                  <li><span className="font-medium">City:</span> {quoteData.userInfo.city}</li>
                </ul>
              </div>
              
              <div className="mt-6">
                <button 
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md"
                  onClick={() => alert('This would proceed to payment or contact an agent')}
                >
                  Proceed with this quote
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Information Collection</h2>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${clientData.insuranceType ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                    {clientData.insuranceType ? '✓' : '1'}
                  </div>
                  <span className="flex-1">Insurance Type</span>
                  {clientData.insuranceType && <span className="text-sm text-gray-600">{clientData.insuranceType}</span>}
                </div>
                
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${clientData.age ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                    {clientData.age ? '✓' : '2'}
                  </div>
                  <span className="flex-1">Age</span>
                  {clientData.age && <span className="text-sm text-gray-600">{clientData.age}</span>}
                </div>
                
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${clientData.country ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                    {clientData.country ? '✓' : '3'}
                  </div>
                  <span className="flex-1">Country</span>
                  {clientData.country && <span className="text-sm text-gray-600">{clientData.country}</span>}
                </div>
                
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${clientData.gender ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                    {clientData.gender ? '✓' : '4'}
                  </div>
                  <span className="flex-1">Gender</span>
                  {clientData.gender && <span className="text-sm text-gray-600">{clientData.gender}</span>}
                </div>
                
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${clientData.city ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                    {clientData.city ? '✓' : '5'}
                  </div>
                  <span className="flex-1">City</span>
                  {clientData.city && <span className="text-sm text-gray-600">{clientData.city}</span>}
                </div>
              </div>
              
              <div className="mt-6 text-sm text-gray-600">
                {Object.keys(clientData).length === 0 ? 
                  'Please answer the questions to generate your insurance quote.' : 
                  'Continue the conversation to complete your information.'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
