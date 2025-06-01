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
      <div className="min-h-screen bg-gradient-to-br from-[#1A1A1A] to-[#212121] pb-24">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-[#2A2A2A] to-[#252525] border-b border-gray-700/30 px-4 py-8 shadow-xl">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-white">Messages</h1>
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-[#FF4646]/10 rounded-full">
                <div className="w-2 h-2 bg-[#FF4646] rounded-full animate-pulse"></div>
                <span className="text-xs text-[#FF4646] font-medium">{conversations.length} Active</span>
              </div>
            </div>
            
            {/* Enhanced Search Bar */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#FF4646]/5 to-transparent rounded-xl pointer-events-none"></div>
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations, cars, or messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-[#1A1A1A]/80 backdrop-blur-sm border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-[#FF4646]/50 focus:border-[#FF4646]/50 focus:bg-[#1A1A1A] transition-all duration-300 shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* Enhanced Conversations Container */}
        <div className="max-w-md mx-auto px-4 py-6">
          {/* Activity Indicator */}
          {conversations.length > 0 && (
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-medium text-gray-300">Recent Conversations</h3>
              <span className="text-xs text-gray-500">{filteredConversations.length} of {conversations.length}</span>
            </div>
          )}

          <ConversationList
            conversations={filteredConversations}
            currentUserId={user.id}
            loading={loading}
          />
          
          {/* Enhanced No Results */}
          {searchQuery && filteredConversations.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-[#FF4646]/10 rounded-full animate-ping"></div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">No conversations found</h3>
              <p className="text-gray-400 max-w-xs mx-auto leading-relaxed">
                Try adjusting your search terms or start a new conversation with a host
              </p>
            </div>
          )}

          {/* Empty State */}
          {conversations.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-[#FF4646]/20 to-[#FF4646]/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="h-10 w-10 text-[#FF4646]" />
                </div>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-[#FF4646]/5 rounded-full animate-pulse"></div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Start Your First Conversation</h3>
              <p className="text-gray-400 max-w-xs mx-auto leading-relaxed mb-6">
                Browse cars and connect with hosts to ask questions or coordinate your trips
              </p>
              <button
                onClick={() => router.push('/explore')}
                className="px-6 py-3 bg-gradient-to-r from-[#FF4646] to-[#FF2800] text-white rounded-xl hover:from-[#FF4646]/90 hover:to-[#FF2800]/90 transition-all duration-300 font-medium shadow-lg"
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
