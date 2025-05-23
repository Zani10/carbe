'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HostPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/host/today');
  }, [router]);

  return null;
}
