'use client'; // Required for using hooks like useAuth

import '../styles/global.css';
import { Toaster } from 'react-hot-toast';
import type { ReactNode } from 'react';
import BottomNav from '@/components/layout/BottomNav';
import HostBottomNav from '@/components/layout/HostBottomNav'; // Import HostBottomNav
import { useAuth } from '@/hooks/useAuth'; // useAuth hook

// Wrapper component to access useAuth context
function LayoutContent({ children }: { children: ReactNode }) {
  const { isHostMode, user } = useAuth(); // Get isHostMode and user state

  return (
    <html lang="en">
      <body className="bg-white text-neutral-900 min-h-screen antialiased">
        <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
        <div className="flex flex-col min-h-screen pb-24">
          <main className="flex-grow">{children}</main>
          {/* Conditionally render BottomNav based on user and isHostMode */}
          {user && (isHostMode ? <HostBottomNav /> : <BottomNav />)}
        </div>
      </body>
    </html>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  // Directly use useAuth here if it doesn't require a provider.
  // This assumes useAuth manages its state globally or is self-contained.
  const { isHostMode, user } = useAuth(); 

  return (
    <html lang="en">
      <body className="bg-white text-neutral-900 min-h-screen antialiased">
        <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
        <div className="flex flex-col min-h-screen pb-24">
          <main className="flex-grow">{children}</main>
          {/* Conditionally render BottomNav based on user and isHostMode */}
          {user && (isHostMode ? <HostBottomNav /> : <BottomNav />)}
        </div>
      </body>
    </html>
  );
}
