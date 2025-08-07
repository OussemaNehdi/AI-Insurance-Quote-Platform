'use client';

// This file serves as an entry point for the improved client page
// It points to the new fixed implementation
import { redirect } from 'next/navigation';

export default function Page() {
  // Redirect to the new improved page implementation
  redirect('/client/page-new-fixed');
  
  // This return is never used due to the redirect
  return null;
}
