'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ClientPage() {
  useEffect(() => {
    // Configure the chat widget
    (window as any).ChatWidgetConfig = {
      webhook: {
        url: '/api/chat', 
        route: 'general'
      },
      branding: {
        logo: 'https://i.postimg.cc/ZqVW3DLg/Pngtree-robot-icon-in-a-round-15481918.png',
        name: 'Insurance Assistant',
        welcomeText: 'Hi, how can we help you with your insurance needs?',
        responseTimeText: 'We usually respond right away'
      },
      style: {
        primaryColor: '#2563eb',      
        secondaryColor: '#1e40af',   
        position: 'right',
        backgroundColor: '#f8fafc',   
        fontColor: '#1f2937'          
      }
    };

    // Load the chat widget script
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/gh/WayneSimpson/n8n-chatbot-template@ba944c3/chat-widget.js';
    script.async = true;
    document.body.appendChild(script);

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
          <h1 className="text-2xl md:text-3xl font-bold">Insurance Chat</h1>
          <Link href="/" className="text-blue-600 hover:underline">
            Back to Home
          </Link>
        </div>
      </header>
    </div>
  );
}
