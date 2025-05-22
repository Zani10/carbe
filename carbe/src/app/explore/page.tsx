'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ExplorePage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the homepage which has the explore functionality
    router.replace('/');
  }, [router]);
  
  // Show a simple loading state while redirecting
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-500"></div>
    </div>
  );
} 