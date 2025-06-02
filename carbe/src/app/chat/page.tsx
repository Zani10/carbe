'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/chat/useChat';
import { useRouter } from 'next/navigation';
import RenterBottomNav from '@/components/layout/RenterBottomNav';
import ConversationList from '@/components/chat/ConversationList';
import { MessageSquare, Users } from 'lucide-react';

export default function ChatPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { conversations, loading } = useChat();

  const unreadCount = conversations.filter(conv => (conv.unread_count || 0) > 0).length;

  if (!user) {
    return (
      <>
        <div className="h-screen flex flex-col bg-[#212121]">
          <div className="flex-1 flex items-center justify-center px-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-[#2A2A2A] rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="h-10 w-10 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-3">Sign in to view messages</h2>
              <p className="text-gray-400 mb-6 max-w-sm mx-auto">
                Connect with hosts and manage your car rental conversations
              </p>
              <button 
                onClick={() => router.push('/signin')}
                className="px-6 py-3 bg-[#FF4646] text-white rounded-lg hover:bg-[#FF4646]/90 transition-colors font-medium"
              >
                Sign In
              </button>
            </div>
          </div>
          <div className="flex-shrink-0">
            <RenterBottomNav />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="h-screen flex flex-col bg-[#212121]">
        {/* Header */}
        <div className="flex-shrink-0 bg-[#2A2A2A] border-b border-gray-700/50">
          <div className="px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Messages</h1>
                <p className="text-gray-400 text-sm mt-1">
                  {conversations.length === 0 
                    ? 'No conversations yet'
                    : `${conversations.length} conversation${conversations.length === 1 ? '' : 's'}`
                  }
                </p>
              </div>
              
              {unreadCount > 0 && (
                <div className="flex items-center space-x-2 bg-[#FF4646]/10 px-3 py-2 rounded-lg">
                  <div className="w-2 h-2 bg-[#FF4646] rounded-full"></div>
                  <span className="text-[#FF4646] text-sm font-medium">
                    {unreadCount} unread
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Conversations Container */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length > 0 ? (
            <div className="p-4">
              <ConversationList
                conversations={conversations}
                currentUserId={user.id}
                loading={loading}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center px-6">
              {loading ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#2A2A2A] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <MessageSquare className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-400">Loading conversations...</p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-20 h-20 bg-[#2A2A2A] rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    No conversations yet
                  </h3>
                  <p className="text-gray-400 mb-6 max-w-sm mx-auto">
                    Start exploring cars and connect with hosts to begin your first conversation
                  </p>
                  <button
                    onClick={() => router.push('/explore')}
                    className="px-6 py-3 bg-[#FF4646] text-white rounded-lg hover:bg-[#FF4646]/90 transition-colors font-medium"
                  >
                    Explore Cars
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="flex-shrink-0">
          <RenterBottomNav />
        </div>
      </div>
    </>
  );
}
