'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RenterPersonalSettingsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the host settings page since it now works for both
    router.replace('/host/settings/personal');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#212121] flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#FF4646]"></div>
    </div>
  );
} 