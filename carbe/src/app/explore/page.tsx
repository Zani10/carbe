'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Explore Page - Redirects to Homepage
 * 
 * The car exploration functionality (search, filters, map, car listings) 
 * is actually implemented on the homepage (/). This page just redirects there.
 * 
 * Homepage components:
 * - SearchBar: Search functionality
 * - MapView: Interactive map with car locations
 * - CarList: Draggable panel with car listings
 */
export default function ExplorePage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the homepage which contains the actual explore functionality
    router.replace('/');
  }, [router]);
  
  // Show a simple loading state while redirecting
  return (
    <div className="flex justify-center items-center min-h-screen bg-[#212121]">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FF4646]"></div>
    </div>
  );
} 