import '../styles/global.css';
import { Toaster } from 'react-hot-toast';
import type { ReactNode } from 'react';
import BottomNav from '@/components/layout/BottomNav';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-neutral-900 min-h-screen antialiased">
        <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
        <div className="flex flex-col min-h-screen pb-24">
          <main className="flex-grow">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
