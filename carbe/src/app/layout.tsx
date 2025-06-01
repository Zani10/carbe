'use client'; // Required for using hooks like useAuth

import '../styles/global.css';
import { Toaster } from 'react-hot-toast';
import type { ReactNode } from 'react';


export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#212121] text-white min-h-screen antialiased">
        <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
        <main className="flex-grow">{children}</main>
      </body>
    </html>
  );
}
