'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import HostBottomNav from '@/components/layout/HostBottomNav';
import HostCalendarPage from '@/components/hostCalendar/HostCalendarPage';

export default function CalendarPage() {
  const { user, isHostMode, isLoading } = useAuth();
  const router = useRouter();

  // Only block if auth has finished loading AND user is not authorized
  // While loading, show calendar immediately
  if (!isLoading && (!user || !isHostMode)) {
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

  // Always render calendar immediately - no loading states!
  // Auth loads in background, calendar shows instantly
  return (
    <>
      <div className="min-h-screen bg-[#121212] pb-24">
        <HostCalendarPage />
      </div>
      <HostBottomNav />
    </>
  );
} 