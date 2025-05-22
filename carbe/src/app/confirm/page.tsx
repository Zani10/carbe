'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function ConfirmPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      // Redirect to profile after confirmation
      router.push('/profile');
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Confirming your email...</h1>
        <p>Please wait while we verify your email address.</p>
      </div>
    </div>
  );
} 