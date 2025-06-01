'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BookingDetailsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect back since we don't have full booking details implementation yet
    router.back();
  }, [router]);

  // This component just redirects back for now
  return null;
} 