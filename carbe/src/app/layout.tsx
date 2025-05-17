import '../styles/global.css';
import { Toaster } from 'react-hot-toast';
import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-neutral-100 text-neutral-900 min-h-screen antialiased">
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <main className="container mx-auto px-4 py-6 max-w-5xl">
          {children}
        </main>
      </body>
    </html>
  );
}
