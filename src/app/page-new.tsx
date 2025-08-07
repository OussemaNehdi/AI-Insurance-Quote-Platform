'use client';

import Link from 'next/link';
import MaxWidthWrapper from "@/components/atoms/max-width-wrapper";
import { ArrowRight } from "lucide-react";

export default function Home() {

  return (
    <div className="min-h-screen bg-slate-50">
      <MaxWidthWrapper className="py-20 px-4 flex flex-col items-center">
        <div className="max-w-3xl text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Insurance AI Platform</h1>
          <p className="text-xl text-neutral-600 mb-6">
            Smart Pricing &amp; AI-Driven Client Interaction
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          <div className="bg-white p-8 rounded-lg shadow-md border">
            <h2 className="text-2xl font-bold mb-3">For Insurance Companies</h2>
            <p className="mb-6 text-neutral-600">
              Set up your insurance parameters, configure rates, and manage your plans. 
              Connect with clients through our AI-powered platform.
            </p>
            <p className="mb-2 text-sm text-neutral-500">
              <strong>Demo credentials:</strong><br />
              Email: contact@secureinsurance.example<br />
              Password: company123
            </p>
            <Link href="/auth/login" className="group inline-flex items-center text-blue-600 font-semibold hover:text-blue-800">
              Company Login
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-md border">
            <h2 className="text-2xl font-bold mb-3">For Clients</h2>
            <p className="mb-6 text-neutral-600">
              Chat with our AI assistant to find the best insurance plan for your needs. 
              Get personalized quotes based on your specific situation.
            </p>
            <p className="mb-6 text-neutral-600">
              Select from multiple insurance companies and get instant quotes!
            </p>
            <Link 
              href="/client"
              className="inline-flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors"
            >
              Get Insurance Quote
            </Link>
          </div>
        </div>
        
        <div className="mt-16 p-6 bg-white rounded-lg shadow-sm border w-full max-w-4xl">
          <h2 className="text-xl font-semibold mb-4">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="font-medium mb-1">Select a Company</h3>
              <p className="text-sm text-neutral-600">Choose from our list of insurance providers</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <h3 className="font-medium mb-1">Chat with AI</h3>
              <p className="text-sm text-neutral-600">Our AI collects your details and preferences</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <h3 className="font-medium mb-1">Get Your Quote</h3>
              <p className="text-sm text-neutral-600">Receive a personalized insurance quote instantly</p>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
      
      <footer className="py-6 border-t">
        <MaxWidthWrapper>
          <p className="text-center text-sm text-neutral-500">
            &copy; {new Date().getFullYear()} Insurance AI Platform. All rights reserved.
          </p>
        </MaxWidthWrapper>
      </footer>
    </div>
  );
}
