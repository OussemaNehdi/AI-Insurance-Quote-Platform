'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ClientPage() {
  useEffect(() => {
    // Configure the chat widget
    (window as any).ChatWidgetConfig = {
      webhook: {
        url: '/api/chat', // Use our proxy API route instead of direct n8n webhook
        route: 'general'
      },
      branding: {
        logo: 'https://i.postimg.cc/V6t9g2Hb/SWautomation-logo.png',
        name: 'Insurance Assistant',
        welcomeText: 'Hi, how can we help you with your insurance needs?',
        responseTimeText: 'We usually respond right away'
      },
      style: {
        primaryColor: '#54dde4',
        secondaryColor: '#172565',
        position: 'right',
        backgroundColor: '#ffffff',
        fontColor: '#333333'
      }
    };

    // Load the chat widget script
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/gh/WayneSimpson/n8n-chatbot-template@ba944c3/chat-widget.js';
    script.async = true;
    document.body.appendChild(script);

    // Cleanup function
    return () => {
      // Remove the script when component unmounts
      const existingScript = document.querySelector('script[src="https://cdn.jsdelivr.net/gh/WayneSimpson/n8n-chatbot-template@ba944c3/chat-widget.js"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
      // Clean up the config
      delete (window as any).ChatWidgetConfig;
    };
  }, []);

  return (
    <div className="container mx-auto p-4 md:p-6">
      <header className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold">Insurance Chat Support</h1>
          <Link href="/" className="text-blue-600 hover:underline">
            Back to Home
          </Link>
        </div>
      </header>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Get Your Insurance Quote</h2>
          <p className="text-gray-600 mb-6">
            Our insurance assistant is ready to help you find the perfect insurance plan. 
            Click the chat widget in the bottom right corner to get started!
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-800 mb-2">How it works:</h3>
            <ol className="text-left text-blue-700 space-y-1">
              <li>1. Click the chat widget to start a conversation</li>
              <li>2. Tell us what type of insurance you need</li>
              <li>3. Provide your basic information</li>
              <li>4. Get your personalized quote instantly</li>
            </ol>
          </div>

          <div className="text-sm text-gray-500">
            💬 Look for the chat widget in the bottom right corner of your screen
          </div>
        </div>
      </div>
    </div>
  );
}
