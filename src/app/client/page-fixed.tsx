'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import MaxWidthWrapper from "@/components/atoms/max-width-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChatMessage, AIResponse } from '@/lib/openrouter';
import { InsuranceType } from '@/lib/types';
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
}

interface Company {
  companyId: string;
  companyName: string;
  insuranceTypes: string[];
}

export default function ClientPage() {
  const [input, setInput] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [insuranceTypes, setInsuranceTypes] = useState<string[]>([]);
  const [selectedInsuranceType, setSelectedInsuranceType] = useState<string>('');
  const [isCompanyLoading, setIsCompanyLoading] = useState(true);
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
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch('/api/companies');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setCompanies(data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
      } finally {
        setIsCompanyLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany && companies.length > 0) {
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

  useEffect(() => {
    if (selectedCompany && selectedInsuranceType) {
      setChatEnabled(true);
      setClientData(prev => ({
        ...prev,
        companyId: selectedCompany,
        insuranceType: selectedInsuranceType
      }));

      // Initialize chat with a simple system message
      setChatHistory([
        {
          role: 'system',
          content: 'You are a helpful insurance assistant. Ask the user for their age, country, gender, and city one by one. Respond ONLY in valid JSON format: {"answer": "your response", "collectedData": {...}}. Do not use markdown code blocks or any formatting. Once you have all information, set "completed": true in collectedData.'
        }
      ]);

      setMessages(prev => [...prev, {
        id: Date.now(),
        text: `Great! I'll help you get a quote for ${selectedInsuranceType} insurance. Let me ask you a few questions to calculate your personalized quote.`,
        isBot: true,
      }]);
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
          // Clean the AI response - remove markdown code blocks if present
          let cleanMessage = data.message.trim();
          
          // Remove ```json and ``` markers if present
          if (cleanMessage.startsWith('```json')) {
            cleanMessage = cleanMessage.replace(/^```json\s*/, '');
          }
          if (cleanMessage.endsWith('```')) {
            cleanMessage = cleanMessage.replace(/\s*```$/, '');
          }
          
          // Try to parse the cleaned JSON response
          const parsedResponse = JSON.parse(cleanMessage);
          
          if (parsedResponse.answer && parsedResponse.collectedData !== undefined) {
            // Add only the answer text to UI (not the raw JSON)
            const botMessage = { id: Date.now() + 1, text: parsedResponse.answer, isBot: true };
            setMessages(prev => [...prev, botMessage]);

            // Update client data with collected information
            setClientData(prev => ({
              ...prev,
              ...parsedResponse.collectedData
            }));

            // Add assistant message to chat history using just the answer
            setChatHistory([...updatedHistory, { role: 'assistant', content: parsedResponse.answer }]);

            // Check if data collection is complete
            if (parsedResponse.collectedData.completed || 
                (parsedResponse.collectedData.age && 
                 parsedResponse.collectedData.country && 
                 parsedResponse.collectedData.gender && 
                 parsedResponse.collectedData.city)) {
              
              // All data collected, get quote
              await getQuote({
                ...clientData,
                ...parsedResponse.collectedData
              });
            }
          } else {
            throw new Error('Invalid response format');
          }
        } catch (parseError) {
          console.error('Error parsing AI response:', parseError);
          console.log('Raw AI message:', data.message);
          // Fallback: treat as regular message if not JSON
          const botMessage = { id: Date.now() + 1, text: data.message, isBot: true };
          setMessages(prev => [...prev, botMessage]);
          setChatHistory([...updatedHistory, { role: 'assistant', content: data.message }]);
        }
      } else {
        throw new Error('Failed to get AI response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { id: Date.now() + 1, text: "Sorry, I'm having trouble connecting. Please try again.", isBot: true };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getQuote = async (data: InsuranceData) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setQuoteData(result.quote);
        setShowQuote(true);
        
        // Add quote message to chat with detailed breakdown
        const adjustmentsList = result.quote.adjustments && result.quote.adjustments.length > 0 
          ? result.quote.adjustments.map((adj: any) => `• ${adj.name}: ${adj.factor > 1 ? '+' : ''}${Math.round((adj.factor - 1) * 100)}% (${adj.description})`).join('\n')
          : '';
        
        const quoteMessage = {
          id: Date.now(),
          text: `🎉 Perfect! I've calculated your personalized ${selectedInsuranceType} insurance quote:

💰 **Total Monthly Premium: $${result.quote.amount}**

📊 **Calculation Breakdown:**
• Base Price: $${result.quote.basePrice || result.quote.amount}
${adjustmentsList ? '\n**Adjustments Applied:**\n' + adjustmentsList : ''}

This quote is based on the information you provided and ${result.companyInfo?.companyName || 'the insurance company'}'s current rates. Your coverage will be tailored to your specific needs!

Would you like to proceed with this quote or do you have any questions about the coverage?`,
          isBot: true
        };
        setMessages(prev => [...prev, quoteMessage]);
      } else {
        throw new Error(result.error || 'Failed to get quote');
      }
    } catch (error) {
      console.error('Error getting quote:', error);
      const errorMessage = {
        id: Date.now(),
        text: "Sorry, I couldn't calculate your quote. Please try again or contact support.",
        isBot: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <MaxWidthWrapper className="py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Get Your Insurance Quote</h1>
            <p className="text-neutral-600 dark:text-neutral-300">
              Chat with our AI assistant to find the perfect insurance plan
            </p>
          </div>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Quote Display */}
        {showQuote && quoteData && (
          <Card className="mb-8 border-green-200 bg-green-50 dark:bg-green-900/20">
            <CardHeader>
              <CardTitle className="text-green-800 dark:text-green-200 flex items-center">
                <MessageCircle className="h-5 w-5 mr-2" />
                Your Insurance Quote
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-lg">${quoteData.amount} / {quoteData.period}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{quoteData.details}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Coverage Details:</h4>
                  {quoteData.adjustments && quoteData.adjustments.length > 0 && (
                    <ul className="text-sm space-y-1">
                      {quoteData.adjustments.map((adj: any, index: number) => (
                        <li key={index} className="flex justify-between">
                          <span>{adj.name}:</span>
                          <span>{Math.round((adj.factor - 1) * 100)}%</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Company and Insurance Type Selection */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Select Insurance Company</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isCompanyLoading ? (
                  <div className="text-center">Loading companies...</div>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="company">Insurance Company</Label>
                      <select
                        id="company"
                        value={selectedCompany}
                        onChange={(e) => setSelectedCompany(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                      >
                        <option value="">Select a company...</option>
                        {companies.map((company) => (
                          <option key={company.companyId} value={company.companyId}>
                            {company.companyName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedCompany && (
                      <div>
                        <Label htmlFor="insurance-type">Insurance Type</Label>
                        <select
                          id="insurance-type"
                          value={selectedInsuranceType}
                          onChange={(e) => setSelectedInsuranceType(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                        >
                          <option value="">Select insurance type...</option>
                          {insuranceTypes.map((type) => (
                            <option key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)} Insurance
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {!selectedCompany || !selectedInsuranceType ? (
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Please select both a company and insurance type to start chatting with our AI assistant.
                      </p>
                    ) : (
                      <p className="text-sm text-green-600 dark:text-green-400">
                        ✓ Ready to chat! Use the chat interface to get your quote.
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Insurance Assistant
                </CardTitle>
              </CardHeader>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[450px]">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg whitespace-pre-wrap ${
                        message.isBot
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="p-4 border-t">
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={chatEnabled ? "Type your message..." : "Please select company and insurance type first"}
                    disabled={!chatEnabled || isLoading}
                    className="flex-1"
                  />
                  <Button 
                    type="submit" 
                    disabled={!chatEnabled || !input.trim() || isLoading}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  );
}
