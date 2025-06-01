'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/chat/useChat';
import { useRouter } from 'next/navigation';
import RenterBottomNav from '@/components/layout/RenterBottomNav';
import ConversationList from '@/components/chat/ConversationList';
import { MessageSquare, Search } from 'lucide-react';

export default function ChatPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { conversations, loading } = useChat();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(conversation => {
    const isHost = user?.id === conversation.host_id;
    const otherUser = isHost ? conversation.renter : conversation.host;
    const searchTerm = searchQuery.toLowerCase();
    
    return (
      otherUser?.full_name?.toLowerCase().includes(searchTerm) ||
      conversation.car?.make?.toLowerCase().includes(searchTerm) ||
      conversation.car?.model?.toLowerCase().includes(searchTerm) ||
      conversation.last_message?.content?.toLowerCase().includes(searchTerm)
    );
  });

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
        {/* Header */}
        <div className="bg-[#2A2A2A] border-b border-gray-700/50 px-4 py-4">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-semibold text-white">Messages</h1>
              {conversations.length > 0 && (
                <span className="text-sm text-gray-400">{conversations.length}</span>
              )}
            </div>
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#1A1A1A] border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:ring-1 focus:ring-[#FF4646]/50 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Conversations Container */}
        <div className="max-w-md mx-auto px-4 py-4">
          <ConversationList
            conversations={filteredConversations}
            currentUserId={user.id}
            loading={loading}
          />
          
          {/* No Results */}
          {searchQuery && filteredConversations.length === 0 && !loading && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No conversations found</h3>
              <p className="text-gray-400">Try different search terms</p>
            </div>
          )}

          {/* Empty State */}
          {conversations.length === 0 && !loading && (
            <div className="text-center py-20">
              <MessageSquare className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No conversations yet</h3>
              <p className="text-gray-400 mb-6">
                Start a conversation by messaging a host
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
      </div>
      <RenterBottomNav />
    </>
  );
}
