'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function InitDbPage() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const initializeDatabase = async () => {
    try {
      setIsInitializing(true);
      setError(null);
      
      const response = await fetch('/api/db/init?key=init-insurance-platform');
      const data = await response.json();
      
      if (data.success) {
        setIsComplete(true);
        setTimeout(() => {
          router.push('/client/page-new-fixed');
        }, 2000);
      } else {
        setError(data.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error initializing database:', error);
      setError('Failed to initialize database');
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md border max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Database Initialization</h1>
        
        {isComplete ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md text-green-700 mb-4">
            ✅ Database initialized successfully! Redirecting to client page...
          </div>
        ) : (
          <>
            <p className="mb-6 text-gray-600">
              Initialize the database with sample companies and insurance types.
              This needs to be done once when setting up the application.
            </p>
            
            <button
              onClick={initializeDatabase}
              disabled={isInitializing}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2 rounded-md w-full"
            >
              {isInitializing ? 'Initializing...' : 'Initialize Database'}
            </button>
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
                Error: {error}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
