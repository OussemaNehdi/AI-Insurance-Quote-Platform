import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import MaxWidthWrapper from '@/components/atoms/max-width-wrapper';
import Link from 'next/link';

export default function MongoDBTroubleshooterPage() {
  return (
    <MaxWidthWrapper className="py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">MongoDB Connection Troubleshooter</h1>
      
      <Card className="p-6 mb-8 bg-amber-50">
        <h2 className="text-xl font-semibold mb-2">Connection Issues</h2>
        <p className="mb-4">
          If you're seeing MongoDB connection errors like &quot;SSL routines:ssl3_read_bytes:tlsv1 alert internal error&quot;, 
          there are a few possible solutions:
        </p>
        
        <h3 className="text-lg font-medium mt-4 mb-2">1. Check your .env/.env.local file</h3>
        <p className="mb-2">
          Make sure you have the correct MongoDB connection string and SSL/TLS settings:
        </p>
        <pre className="bg-gray-100 p-3 rounded mb-4 overflow-auto">
          <code>
            DATABASE_URL=your_mongodb_connection_string<br/>
            MONGODB_SSL=true<br/>
            MONGODB_TLS=true
          </code>
        </pre>
        
        <h3 className="text-lg font-medium mt-4 mb-2">2. Try Local MongoDB</h3>
        <p className="mb-2">
          If cloud MongoDB isn't working, you can use a local MongoDB instance for development:
        </p>
        <pre className="bg-gray-100 p-3 rounded mb-4 overflow-auto">
          <code>
            DATABASE_URL=mongodb://localhost:27017/insurance-ai<br/>
            MONGODB_SSL=false<br/>
            MONGODB_TLS=false
          </code>
        </pre>
        
        <h3 className="text-lg font-medium mt-4 mb-2">3. Run the local MongoDB setup script</h3>
        <p className="mb-4">
          We've created a helper script that sets up a local MongoDB instance for testing:
        </p>
        <pre className="bg-gray-100 p-3 rounded mb-4 overflow-auto">
          <code>
            node src/scripts/setup-local-mongo.js
          </code>
        </pre>
      </Card>
      
      <Card className="p-6 mb-8 bg-blue-50">
        <h2 className="text-xl font-semibold mb-2">Step-by-Step Setup Guide</h2>
        
        <ol className="list-decimal list-inside mb-4 space-y-2">
          <li>Install MongoDB locally if you haven't already (<a href="https://www.mongodb.com/try/download/community" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Download Link</a>)</li>
          <li>Start the MongoDB service (varies by OS)</li>
          <li>Run the setup script: <code className="bg-gray-100 px-2 py-1 rounded">node src/scripts/setup-local-mongo.js</code></li>
          <li>Update your .env.local file with the connection string provided by the script</li>
          <li>Restart your Next.js development server</li>
        </ol>
      </Card>
      
      <div className="flex justify-center gap-4">
        <Button asChild>
          <Link href="/auth/register">
            Try Registration Again
          </Link>
        </Button>
        
        <Button asChild variant="outline">
          <Link href="/api/db/init?key=init-insurance-platform" target="_blank">
            Initialize Sample Data
          </Link>
        </Button>
      </div>
    </MaxWidthWrapper>
  );
}
