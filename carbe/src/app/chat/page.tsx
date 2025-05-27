'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import RenterBottomNav from '@/components/layout/RenterBottomNav';
import { MessageSquare, Search } from 'lucide-react';

export default function ChatPage() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <>
        <div className="min-h-screen bg-[#212121] flex items-center justify-center pb-24">
          <div className="text-center px-4">
            <MessageSquare className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Sign in to view your messages</h2>
            <p className="text-gray-400 mb-6">Connect with hosts and get support</p>
            <button 
              onClick={() => router.push('/signin')}
              className="px-6 py-3 bg-[#FF4646] text-white rounded-xl hover:bg-[#FF4646]/90 transition-colors font-medium"
            >
              Sign In
            </button>
          </div>
        </div>
        <RenterBottomNav />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#212121] pb-24">
        {/* Header - Simple title without back button */}
        <div className="bg-[#2A2A2A] border-b border-gray-700/50 px-4 py-6">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-white">Messages</h1>
              <button className="p-2 text-gray-400 hover:text-gray-200 rounded-lg transition-colors">
                <Search className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 py-8">
          {/* Coming Soon Content */}
          <div className="text-center py-12">
            <MessageSquare className="h-16 w-16 text-gray-600 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-white mb-4">Messages Coming Soon</h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              We&apos;re building an amazing messaging experience where you can chat with hosts, 
              get support, and manage your bookings seamlessly.
            </p>
            
            <div className="bg-[#2A2A2A] border border-gray-700/50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-medium text-white mb-3">What to expect:</h3>
              <div className="space-y-2 text-sm text-gray-400 text-left">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-[#FF4646] rounded-full mr-3"></div>
                  <span>Real-time messaging with hosts</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-[#FF4646] rounded-full mr-3"></div>
                  <span>Booking updates and notifications</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-[#FF4646] rounded-full mr-3"></div>
                  <span>24/7 customer support chat</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-[#FF4646] rounded-full mr-3"></div>
                  <span>Photo and document sharing</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-[#FF4646] text-white rounded-xl hover:bg-[#FF4646]/90 transition-colors font-medium"
            >
              Continue Exploring
            </button>
          </div>
        </div>
      </div>
      <RenterBottomNav />
    </>
  );
}
