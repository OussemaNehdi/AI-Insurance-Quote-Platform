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
      
      // Update system message with selected insurance type
      setChatHistory([
        {
          role: 'system',
          content: `You are a chatbot for an insurance company. The user has selected ${selectedInsuranceType} insurance.
          Your task is to collect information from users: 
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
          Add the insurance type to collectedData: {"insuranceType": "${selectedInsuranceType}"}
          
          For example, after getting age:
          { "answer": "...", "collectedData": {"insuranceType": "${selectedInsuranceType}", "age": 30} }
          
          And so on until all fields are filled: age, country, gender, city.
          
          Once you verify all fields are filled, add a completion message in the answer field and set "completed": true in collectedData.`
        }
      ]);

      // Add a welcome message for the chat
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: `Great! I'll help you get a quote for ${selectedInsuranceType} insurance. Let me ask you a few questions to calculate your personalized quote.`,
        isBot: true
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
          // Parse the JSON response from the AI
          const parsedResponse = JSON.parse(data.message);
          
          if (parsedResponse.answer && parsedResponse.collectedData) {
            // Add bot message to UI
            const botMessage = { id: Date.now() + 1, text: parsedResponse.answer, isBot: true };
            setMessages(prev => [...prev, botMessage]);

            // Update client data with collected information
            setClientData(prev => ({
              ...prev,
              ...parsedResponse.collectedData
            }));

            // Add assistant message to chat history
            setChatHistory([...updatedHistory, { role: 'assistant', content: data.message }]);

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
          // Fallback: treat as regular message
          const botMessage = { id: Date.now() + 1, text: data.message, isBot: true };
          setMessages(prev => [...prev, botMessage]);
          setChatHistory([...updatedHistory, { role: 'assistant', content: data.message }]);
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
        
        // Add quote message to chat
        const quoteMessage = {
          id: Date.now(),
          text: `🎉 Great news! I've calculated your personalized quote. Your ${selectedInsuranceType} insurance will cost $${result.quote.amount} per ${result.quote.period}. You can see the detailed breakdown above.`,
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
                  <Label htmlFor="company-select">Select Insurance Company</Label>
                  {isCompanyLoading ? (
                    <div className="flex items-center justify-center h-10 bg-gray-100 rounded-md">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
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
                  <Label htmlFor="insurance-type-select">Select Insurance Type</Label>
                  <select
                    id="insurance-type-select"
                    value={selectedInsuranceType}
                    onChange={(e) => setSelectedInsuranceType(e.target.value)}
                    disabled={!selectedCompany || insuranceTypes.length === 0}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                  >
                    <option value="">Choose insurance type...</option>
                    {insuranceTypes.map((type) => (
                      <option key={type} value={type}>
                        {type} Insurance
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
                <CardContent>
                  <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      ${quoteData.amount}
                    </div>
                    <div className="text-gray-600 mb-4">
                      per {quoteData.period}
                    </div>
                    <div className="text-sm text-gray-500">
                      {selectedInsuranceType} Insurance
                    </div>
                  </div>
                  
                  {quoteData.breakdown && (
                    <div className="mt-4 space-y-2">
                      <h4 className="font-semibold text-sm">Price Breakdown:</h4>
                      {quoteData.breakdown.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.name}</span>
                          <span>{item.factor > 1 ? '+' : ''}{((item.factor - 1) * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <Button className="w-full mt-4" size="lg">
                    Purchase This Plan
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Panel - Chat Interface */}
          <div className="lg:sticky lg:top-8">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Chat with AI Assistant
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.isBot
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                            : 'bg-blue-500 text-white'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
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

                {/* Input */}
                <div className="border-t p-4">
                  <div className="flex space-x-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={chatEnabled ? "Type your message..." : "Please select a company and insurance type first"}
                      disabled={!chatEnabled || isLoading}
                      className="flex-1"
                    />
                    <Button 
                      onClick={sendMessage} 
                      disabled={!chatEnabled || isLoading || !input.trim()}
                      size="sm"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  {!chatEnabled && (
                    <p className="text-xs text-gray-500 mt-2">
                      Complete Step 1 above to start chatting with the AI assistant
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  );
}
