'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import MaxWidthWrapper from "@/components/atoms/max-width-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChatMessage, AIResponse } from '@/lib/openrouter-new';
import { ArrowLeft, Send, MessageCircle } from "lucide-react";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
}

interface InsuranceData {
  companyId?: string;
  insuranceType?: string;
  age?: number | string;
  country?: string;
  gender?: string;
  city?: string;
  completed?: boolean;
}

interface Company {
  companyId: string;
  companyName: string;
  insuranceTypes: { type: string; displayName: string }[];
}

export default function ClientPage() {
  const [input, setInput] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [insuranceTypes, setInsuranceTypes] = useState<{ type: string; displayName: string }[]>([]);
  const [selectedInsuranceType, setSelectedInsuranceType] = useState<string>('');
  const [isCompanyLoading, setIsCompanyLoading] = useState(true);

  // Helper function to get display name for selected insurance type
  const getSelectedInsuranceDisplayName = () => {
    const selectedInsuranceTypeObj = insuranceTypes.find(type => type.type === selectedInsuranceType);
    return selectedInsuranceTypeObj?.displayName || selectedInsuranceType;
  };
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your insurance assistant. I can help you find the best insurance plan. Please select an insurance company and type to begin.",
      isBot: true,
    },
  ]);
  const [clientData, setClientData] = useState<InsuranceData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showQuote, setShowQuote] = useState(false);
  const [quoteData, setQuoteData] = useState<any>(null);
  const [chatEnabled, setChatEnabled] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      role: 'system',
      content: `You are a chatbot for an insurance company. Your task is to collect information from users: 
      1) age (must be a number), 
      2) country, 
      3) gender, 
      4) city.

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
  
  // Fetch companies when component mounts
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch('/api/companies');
        if (!response.ok) {
          throw new Error('Failed to fetch companies');
        }
        
        const data = await response.json();
        if (data.success && data.data) {
          setCompanies(data.data);
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
      } finally {
        setIsCompanyLoading(false);
      }
    };
    
    fetchCompanies();
  }, []);
  
  // Update insurance types when company selection changes
  useEffect(() => {
    if (selectedCompany) {
      const company = companies.find(c => c.companyId === selectedCompany);
      if (company) {
        setInsuranceTypes(company.insuranceTypes);
        setSelectedInsuranceType('');
      }
    } else {
      setInsuranceTypes([]);
      setSelectedInsuranceType('');
    }
  }, [selectedCompany, companies]);
  
  // Enable chat when both company and insurance type are selected
  useEffect(() => {
    if (selectedCompany && selectedInsuranceType) {
      setChatEnabled(true);
      setClientData(prevData => ({
        ...prevData,
        companyId: selectedCompany,
        insuranceType: selectedInsuranceType
      }));
      
      // Get the display name for the selected insurance type
      const selectedDisplayName = getSelectedInsuranceDisplayName();
      
      // Fetch the specific insurance fields for this company and type
      const fetchInsuranceFields = async () => {
        try {
          const response = await fetch(`/api/companies?companyId=${selectedCompany}&type=${selectedInsuranceType}`);
          if (!response.ok) {
            throw new Error('Failed to fetch insurance fields');
          }
          
          const data = await response.json();
          if (data.success && data.data?.insuranceTypes?.length > 0) {
            const fields = data.data.insuranceTypes[0].fields || [];
            
            // Extract field names and create a list
            const fieldsList = fields.map((field: any) => `${field.name} (${field.type === 'select' ? 'options: ' + 
              field.options.map((opt: any) => opt.value).join(', ') : 
              'range: ' + field.brackets?.[0]?.min + '-' + field.brackets?.[field.brackets.length-1]?.max})`).join(', ');
            
            // Start the chat with specific fields to collect
            setChatHistory([
              {
                role: 'system',
                content: `You are a chatbot for an insurance company. The user has selected ${selectedDisplayName}.
                Your task is to collect ONLY the following information from users: 
                ${fields.map((f: any, i: number) => `${i+1}) ${f.name} (${f.label})`).join('\n')}
                
                If the list above doesn't include age, country, gender, or city, DO NOT ask for them.

          ⚠️ CRITICAL RULES:
          - Your ENTIRE response must be ONLY a single valid JSON object
          - Do not include any text outside the JSON object
          - NEVER use markdown code blocks or formatting
          - Your response MUST start with { and end with }
          - Do NOT include the \`\`\`json prefix or \`\`\` suffix
          
          Your entire response must only be in this EXACT JSON format:
          {"answer": "your friendly response", "collectedData": {...}}
          
          Be extremely conversational inside the answer field, like ChatGPT.
          Do not move to the next question until the current one is valid.
          
          Update the collectedData object as you collect each piece of information.
          Add the insurance type to collectedData: {"insuranceType": "${selectedInsuranceType}"}
          
          For example, after getting age:
          {"answer": "...", "collectedData": {"insuranceType": "${selectedInsuranceType}", "age": 30}}
          
          And so on until all fields are filled: age, country, gender, city.
          
          Once you verify all fields are filled, add a completion message in the answer field and set "completed": true in collectedData.`
        }
      ]);

              // Add a welcome message for the chat
              setMessages(prev => [...prev, {
                id: Date.now(),
                text: `Great! I'll help you get a quote for ${selectedDisplayName}. Let me ask you a few questions to calculate your personalized quote.`,
                isBot: true
              }]);
            }
          } catch (error) {
            console.error('Error fetching insurance fields:', error);
            // Fallback message if we couldn't get the specific fields
            const selectedDisplayName = getSelectedInsuranceDisplayName();
            
            setChatHistory([
              {
                role: 'system',
                content: `You are a chatbot for an insurance company. The user has selected ${selectedDisplayName}.
                Your task is to collect information from users:
                1) age (must be a number between 18-100),
                2) country,
                3) gender, 
                4) city.

                ⚠️ CRITICAL RULES:
                - Your ENTIRE response must be ONLY a single valid JSON object
                - Do not include any text outside the JSON object
                - Your response MUST start with { and end with }
                
                Your entire response must only be in this EXACT JSON format:
                {"answer": "your friendly response", "collectedData": {...}}`
              }
            ]);

            // Add a fallback welcome message
            setMessages(prev => [...prev, {
              id: Date.now(),
              text: `Great! I'll help you get a quote for ${selectedDisplayName}. Let me ask you a few questions.`,
              isBot: true
            }]);
          }
        };
        
        fetchInsuranceFields();
      } else {
        setChatEnabled(false);
      }
    }, [selectedCompany, selectedInsuranceType]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !chatEnabled) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message to UI
    const newUserMessage = { id: Date.now(), text: userMessage, isBot: false };
    setMessages(prev => [...prev, newUserMessage]);

    // Add user message to chat history
    const updatedHistory = [...chatHistory, { role: 'user' as const, content: userMessage }];

    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: updatedHistory }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data: AIResponse = await response.json();

      if (data.success && data.message) {
        try {
          console.log('Raw AI response:', data.message);
          
          // Clean the AI response to ensure it's valid JSON
          let cleanMessage = data.message.trim();
          
          // Remove ```json and ``` markers if present
          if (cleanMessage.startsWith('```json')) {
            cleanMessage = cleanMessage.replace(/^```json\s*/, '');
          }
          if (cleanMessage.endsWith('```')) {
            cleanMessage = cleanMessage.replace(/\s*```$/, '');
          }
          
          // Try to extract JSON from the message if there's extra text
          let jsonString = cleanMessage;
          
          // Look for JSON object pattern in the message - handle cases like "Thank you!{...}"
          const jsonMatch = cleanMessage.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/);
          if (jsonMatch) {
            jsonString = jsonMatch[0];
          } else {
            // If no JSON found, try to find the last occurrence of {
            const lastBraceIndex = cleanMessage.lastIndexOf('{');
            if (lastBraceIndex !== -1) {
              jsonString = cleanMessage.substring(lastBraceIndex);
            }
          }
          
          console.log('Cleaned JSON string:', jsonString);
          
          // Try to parse the cleaned JSON response
          const parsedResponse = JSON.parse(jsonString);
          console.log('Parsed response:', parsedResponse);
          
          if (parsedResponse.answer && parsedResponse.collectedData !== undefined) {
            // Add only the answer text to UI (not the raw JSON)
            const botMessage = { id: Date.now() + 1, text: parsedResponse.answer, isBot: true };
            setMessages(prev => [...prev, botMessage]);

            // Update client data with collected information
            const updatedClientData = {
              ...clientData,
              ...parsedResponse.collectedData
            };
            setClientData(updatedClientData);
            console.log('Updated client data:', updatedClientData);

            // Add assistant message to chat history as JSON string
            // This ensures the AI remembers the collected data
            setChatHistory([...updatedHistory, { 
              role: 'assistant', 
              content: JSON.stringify({
                answer: parsedResponse.answer,
                collectedData: parsedResponse.collectedData
              }) 
            }]);

            // Check if data collection is complete
            if (parsedResponse.collectedData.completed === true || 
                (parsedResponse.collectedData.age && 
                 parsedResponse.collectedData.country && 
                 parsedResponse.collectedData.gender && 
                 parsedResponse.collectedData.city)) {
              
              console.log('Data collection complete, generating quote');
              
              // All data collected, get quote
              await getQuote({
                companyId: selectedCompany,
                insuranceType: selectedInsuranceType,
                age: parsedResponse.collectedData.age || updatedClientData.age,
                country: parsedResponse.collectedData.country || updatedClientData.country,
                gender: parsedResponse.collectedData.gender || updatedClientData.gender,
                city: parsedResponse.collectedData.city || updatedClientData.city
              });
            }
          } else {
            throw new Error('Invalid response format');
          }
        } catch (parseError) {
          console.error('Error parsing AI response:', parseError);
          console.log('Raw AI message:', data.message);
          // Fallback: treat as regular message if not JSON
          const botMessage = { id: Date.now() + 1, text: "I'm having trouble processing your response. Let's continue with our conversation. What information can I help you provide next?", isBot: true };
          setMessages(prev => [...prev, botMessage]);
          setChatHistory([...updatedHistory, { 
            role: 'assistant', 
            content: JSON.stringify({
              answer: "I'm having trouble processing your response. Let's continue with our conversation.",
              collectedData: clientData
            })
          }]);
        }
      } else {
        throw new Error(data.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { 
        id: Date.now() + 1, 
        text: "Sorry, I encountered an error. Please try again.", 
        isBot: true 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getQuote = async (data: InsuranceData) => {
    try {
      setIsLoading(true);
      console.log('Getting quote for data:', data);
      
      // Ensure all required fields are present
      if (!data.companyId || !data.insuranceType || !data.age || !data.country || !data.gender || !data.city) {
        console.error('Missing required data for quote', data);
        throw new Error('Missing required information. Please complete all questions.');
      }
      
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log('Quote API response:', result);

      if (result.success) {
        setQuoteData(result.quote);
        setShowQuote(true);
        
        // Add quote message to chat with detailed breakdown
        const adjustmentsList = result.quote.adjustments && result.quote.adjustments.length > 0 
          ? result.quote.adjustments.map((adj: any) => 
              `• ${adj.name}: ${adj.percentage || (adj.factor > 1 ? '+' : '') + Math.round((adj.factor - 1) * 100) + '%'} (${adj.description})`
            ).join('\n')
          : '';
        
        const quoteMessage = {
          id: Date.now(),
          text: `🎉 Perfect! I've calculated your personalized ${getSelectedInsuranceDisplayName()} quote:

💰 **Total Monthly Premium: $${result.quote.amount}**

📊 **Calculation Breakdown:**
• Base Price: $${result.quote.basePrice || result.quote.amount}
${adjustmentsList ? '\n**Adjustments Applied:**\n' + adjustmentsList : ''}

This quote is based on the information you provided and ${result.companyInfo?.companyName || 'the insurance company'}'s current rates. Your coverage will be tailored to your specific needs!

Would you like to proceed with this quote or do you have any questions about the coverage?`,
          isBot: true
        };
        setMessages(prev => [...prev, quoteMessage]);
        
        // Also add to chat history to maintain context
        setChatHistory(prev => [...prev, { 
          role: 'assistant', 
          content: JSON.stringify({
            answer: `I've calculated your quote! The monthly premium is $${result.quote.amount}.`,
            collectedData: { 
              ...data, 
              completed: true,
              quoteGenerated: true
            }
          }) 
        }]);
      } else {
        throw new Error(result.error || 'Failed to get quote');
      }
    } catch (error: any) {
      console.error('Error getting quote:', error);
      const errorMessage = {
        id: Date.now(),
        text: `Sorry, I couldn't calculate your quote: ${error.message || 'An error occurred'}. Please try again or contact support.`,
        isBot: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <MaxWidthWrapper className="py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Get Your Insurance Quote</h1>
            <p className="text-neutral-600 dark:text-neutral-300">
              Select a company and insurance type, then chat with our AI to get a personalized quote
            </p>
          </div>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Selection and Quote */}
          <div className="space-y-6">
            {/* Company & Insurance Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Step 1: Choose Your Insurance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Company Selection */}
                <div>
                  <label htmlFor="company-select" className="block text-sm font-medium mb-1">
                    Select Insurance Company
                  </label>
                  {isCompanyLoading ? (
                    <div className="flex items-center justify-center h-10 bg-gray-100 rounded-md">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                    </div>
                  ) : companies.length === 0 ? (
                    <div className="border border-yellow-300 bg-yellow-50 p-3 rounded text-sm">
                      <p className="text-yellow-800">No insurance companies found in the database.</p>
                      <p className="mt-1 text-yellow-700">
                        <Link href="/" className="underline">Return to homepage</Link> and click "Initialize Database" first.
                      </p>
                    </div>
                  ) : (
                    <select
                      id="company-select"
                      value={selectedCompany}
                      onChange={(e) => setSelectedCompany(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                    >
                      <option value="">Choose a company...</option>
                      {companies.map((company) => (
                        <option key={company.companyId} value={company.companyId}>
                          {company.companyName}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Insurance Type Selection */}
                <div>
                  <label htmlFor="insurance-type-select" className="block text-sm font-medium mb-1">
                    Select Insurance Type
                  </label>
                  <select
                    id="insurance-type-select"
                    value={selectedInsuranceType}
                    onChange={(e) => setSelectedInsuranceType(e.target.value)}
                    disabled={!selectedCompany || insuranceTypes.length === 0}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                  >
                    <option value="">Choose insurance type...</option>
                    {insuranceTypes.map((insuranceTypeObj) => (
                      <option key={insuranceTypeObj.type} value={insuranceTypeObj.type}>
                        {insuranceTypeObj.displayName}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedCompany && selectedInsuranceType && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-green-700 text-sm">
                      ✅ Great! Now chat with our AI assistant to get your personalized quote.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quote Display */}
            {showQuote && quoteData && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Personalized Quote</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <h3 className="font-bold text-xl mb-2">${quoteData.amount} <span className="text-sm font-normal text-neutral-600">/ month</span></h3>
                    <p className="text-sm text-neutral-600">Base price: ${quoteData.basePrice}</p>
                  </div>
                  
                  {quoteData.adjustments && quoteData.adjustments.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Adjustments:</h4>
                      <ul className="space-y-1">
                        {quoteData.adjustments.map((adj: any, i: number) => (
                          <li key={i} className="text-sm flex justify-between">
                            <span>{adj.name}</span>
                            <span className={adj.factor > 1 ? 'text-red-500' : 'text-green-500'}>
                              {adj.percentage || `${adj.factor > 1 ? '+' : ''}${Math.round((adj.factor - 1) * 100)}%`}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <Button className="w-full">
                    Purchase This Plan
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Panel - Chat */}
          <div>
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Insurance Assistant
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto mb-4 pr-2 max-h-[400px]">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`mb-3 ${
                        msg.isBot
                          ? 'bg-gray-100 dark:bg-gray-800 p-3 rounded-lg'
                          : 'bg-blue-100 dark:bg-blue-900 p-3 rounded-lg ml-auto'
                      } ${msg.isBot ? 'mr-12' : 'ml-12'} max-w-[90%]`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg mr-12 mb-3 flex items-center space-x-2 max-w-[90%]">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div className="border-t pt-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendMessage();
                    }}
                    className="flex space-x-2"
                  >
                    <Input
                      placeholder={chatEnabled ? "Type your message..." : "Select a company and insurance type to start..."}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      disabled={!chatEnabled || isLoading}
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={!chatEnabled || !input.trim() || isLoading}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  );
}
