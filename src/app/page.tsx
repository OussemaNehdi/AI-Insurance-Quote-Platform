import Link from 'next/link';

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center">
        <h1 className="text-4xl font-bold mb-6">Insurance AI Platform</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          <div className="border p-8 rounded-lg shadow-md max-w-md">
            <h2 className="text-2xl font-semibold mb-4">For Insurance Companies</h2>
            <p className="mb-6">Set up your insurance parameters, configure rates, and manage your plans.</p>
            <Link href="/company/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md inline-block">
              Company Login
            </Link>
          </div>
          
          <div className="border p-8 rounded-lg shadow-md max-w-md">
            <h2 className="text-2xl font-semibold mb-4">For Clients</h2>
            <p className="mb-6">Chat with our insurance assistant to get personalized quotes and support.</p>
            <Link href="/client" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md inline-block">
              Get Insurance Quote
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
