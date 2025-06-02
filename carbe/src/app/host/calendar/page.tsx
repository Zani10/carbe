'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import HostBottomNav from '@/components/layout/HostBottomNav';
import HostCalendarPage from '@/components/hostCalendar/HostCalendarPage';
import { Loader2 } from 'lucide-react';

export default function CalendarPage() {
  const { user, isHostMode } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSelecting, setIsSelecting] = useState(false);

  useEffect(() => {
    // Simulate loading check
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  // Listen for selection mode changes
  useEffect(() => {
    const handleSelectionModeChange = (event: CustomEvent) => {
      setIsSelecting(event.detail.isSelecting);
    };

    window.addEventListener('selectionModeChange', handleSelectionModeChange as EventListener);
    return () => {
      window.removeEventListener('selectionModeChange', handleSelectionModeChange as EventListener);
    };
  }, []);

  // Check authentication
  if (!user || !isHostMode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#121212] p-4">
        <div className="bg-[#212121] p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-700/50">
          <h2 className="text-2xl font-bold text-white mb-4">Host Access Required</h2>
          <p className="text-gray-300 mb-6">
            You need to be in host mode to access the calendar.
          </p>
          <button 
            onClick={() => router.push('/profile')}
            className="inline-block px-6 py-3 bg-[#FF2800] text-white rounded-xl hover:bg-[#FF2800]/90 transition-colors"
          >
            Go to Profile
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <>
        <div className="min-h-screen bg-[#121212] flex items-center justify-center pb-24">
          <div className="text-center">
            <Loader2 className="h-8 w-8 text-[#FF2800] animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading calendar...</p>
          </div>
        </div>
        <div className={`transition-opacity duration-300 ${isSelecting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <HostBottomNav />
      </div>
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#121212] pb-24">
        <HostCalendarPage />
      </div>
      <HostBottomNav />
    </>
  );
} 