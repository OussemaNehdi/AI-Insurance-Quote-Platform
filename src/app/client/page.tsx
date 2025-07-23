'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface Message {
  id: number;
  text: string;
  isBot: boolean;
}

export default function ClientPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your insurance assistant. I can help you find the best insurance plan. Let's start with some basic information. What type of insurance are you looking for? (e.g., Auto, Home, Life, Health)",
      isBot: true,
    },
  ]);
  const [clientData, setClientData] = useState({
    insuranceType: '',
    age: '',
    country: '',
    gender: '',
    additionalInfo: {},
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [availableCompanies, setAvailableCompanies] = useState([
    { id: 1, name: 'InsureCorp', types: ['Auto', 'Home'] },
    { id: 2, name: 'SafeGuard Insurance', types: ['Auto', 'Life', 'Health'] },
    { id: 3, name: 'SecureCover', types: ['Home', 'Life'] },
  ]);
  const [showResults, setShowResults] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Process user input based on current step
  // Here I just did an exemple without AI just for demonstration
  const processInput = (userInput: string) => {
    let botResponse = '';
    let nextStep = currentStep;

    switch (currentStep) {
      case 0: // Insurance type
        const insuranceType = userInput.trim();
        setClientData({ ...clientData, insuranceType });
        botResponse = `Great! You're looking for ${insuranceType} insurance. How old are you?`;
        nextStep = 1;
        break;

      case 1: // Age
        const age = userInput.trim();
        setClientData({ ...clientData, age });
        botResponse = 'Thank you. Which country do you live in?';
        nextStep = 2;
        break;

      case 2: // Country
        const country = userInput.trim();
        setClientData({ ...clientData, country });
        botResponse = 'What is your gender? (Male/Female/Other/Prefer not to say)';
        nextStep = 3;
        break;

      case 3: // Gender
        const gender = userInput.trim();
        setClientData({ ...clientData, gender });
        
        // For auto insurance, ask about car details
        if (clientData.insuranceType.toLowerCase() === 'auto') {
          botResponse = 'What is the make and model of your car?';
          nextStep = 4;
        } 
        // For home insurance, ask about home details
        else if (clientData.insuranceType.toLowerCase() === 'home') {
          botResponse = 'What is the approximate square footage of your home?';
          nextStep = 4;
        } 
        // For other types, finalize
        else {
          botResponse = 'Thank you for providing all the required information. Let me find the best insurance options for you.';
          nextStep = 5;
        }
        break;

      case 4: // Additional info specific to insurance type
        const additionalInfo = { ...clientData.additionalInfo, [clientData.insuranceType]: userInput.trim() };
        setClientData({ ...clientData, additionalInfo });
        botResponse = 'Thank you for providing all the required information. Let me find the best insurance options for you.';
        nextStep = 5;
        break;

      default:
        botResponse = "I'm sorry, I didn't understand that. Can you please try again?";
    }

    // Add user message
    const newUserMessage: Message = {
      id: messages.length + 1,
      text: userInput,
      isBot: false,
    };

    // Add bot response
    const newBotMessage: Message = {
      id: messages.length + 2,
      text: botResponse,
      isBot: true,
    };

    setMessages([...messages, newUserMessage, newBotMessage]);
    setCurrentStep(nextStep);

    // Show results when all information is collected
    if (nextStep === 5) {
      setTimeout(() => {
        setShowResults(true);
      }, 1500);
    }
  };

  // Handle user message submission
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    processInput(input);
    setInput('');
  };

  // Filter available companies based on insurance type
  const filteredCompanies = availableCompanies.filter(company => 
    company.types.includes(clientData.insuranceType)
  );

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
            <h2 className="font-semibold">Insurance Assistant</h2>
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
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full"
              >
                Send
              </button>
            </div>
          </form>
        </div>

        {/* Results panel - shows when all info is collected */}
        <div className="w-full md:w-1/3">
          {showResults && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Available Options</h2>
              
              {filteredCompanies.length > 0 ? (
                <>
                  <p className="mb-4">Based on your information, here are insurance companies that offer {clientData.insuranceType} insurance:</p>
                  
                  <ul className="space-y-4">
                    {filteredCompanies.map(company => (
                      <li key={company.id} className="border p-4 rounded-md hover:bg-gray-50">
                        <h3 className="font-medium">{company.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">Insurance types: {company.types.join(', ')}</p>
                        <button 
                          className="mt-2 text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md"
                          onClick={() => alert('This would generate a quote from ' + company.name)}
                        >
                          Get Quote
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p>We couldn't find any companies that match your requirements. Please try a different insurance type.</p>
              )}

              <div className="mt-6 p-4 bg-blue-50 rounded-md">
                <h3 className="font-semibold text-lg">Your Information</h3>
                <ul className="mt-2 space-y-1">
                  <li><span className="font-medium">Insurance Type:</span> {clientData.insuranceType}</li>
                  <li><span className="font-medium">Age:</span> {clientData.age}</li>
                  <li><span className="font-medium">Country:</span> {clientData.country}</li>
                  <li><span className="font-medium">Gender:</span> {clientData.gender}</li>
                  {Object.entries(clientData.additionalInfo).map(([key, value]) => (
                    <li key={key}><span className="font-medium">{key}:</span> {value as string}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
