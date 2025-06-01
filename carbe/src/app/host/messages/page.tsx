'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/chat/useChat';
import { useRouter } from 'next/navigation';
import HostBottomNav from '@/components/layout/HostBottomNav';
import ConversationList from '@/components/chat/ConversationList';
import { MessageSquare } from 'lucide-react';

export default function HostMessagesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { conversations, loading } = useChat();

  const handleConversationClick = (conversationId: string) => {
    router.push(`/chat/${conversationId}`);
  };

  if (!user) {
    return (
      <>
        <div className="min-h-screen bg-[#212121] flex items-center justify-center pb-24">
          <div className="text-center px-4">
            <MessageSquare className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Sign in to view your messages</h2>
            <p className="text-gray-400 mb-6">Manage conversations with your renters</p>
            <button 
              onClick={() => router.push('/signin')}
              className="px-6 py-3 bg-[#FF4646] text-white rounded-xl hover:bg-[#FF4646]/90 transition-colors font-medium"
            >
              Sign In
            </button>
          </div>
        </div>
        <HostBottomNav />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#212121] pb-24">
        {/* Header */}
       

        {/* Conversations */}
                 <div className="max-w-md mx-auto px-4 py-4">
           <ConversationList
             conversations={conversations}
             currentUserId={user.id}
             loading={loading}
             onConversationClick={handleConversationClick}
           />
         </div>
      </div>
      <HostBottomNav />
    </>
  );
} 