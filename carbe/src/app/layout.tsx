import '../styles/global.css';
import { Toaster } from 'react-hot-toast';
import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#212121] text-neutral-900 min-h-screen antialiased overflow-hidden">
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <main className="h-screen w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
