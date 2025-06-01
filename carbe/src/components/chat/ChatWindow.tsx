'use client';

import React, { useEffect, useRef } from 'react';
import { useChat } from '@/hooks/chat/useChat';
import { useAuth } from '@/hooks/useAuth';
import ChatHeader from './ChatHeader';
import ChatBubble from './ChatBubble';
import MessageInput from './MessageInput';
import MessageLoading from './MessageLoading';
import { MessageSquare } from 'lucide-react';
import clsx from 'clsx';

interface ChatWindowProps {
  conversationId: string;
  onBack?: () => void;
  className?: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversationId,
  onBack,
  className,
}) => {
  const { user } = useAuth();
  const { 
    messages, 
    currentConversation, 
    loading, 
    error, 
    sendMessage 
  } = useChat(conversationId);


  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (content: string, file?: File) => {
    if (!content.trim() && !file) return;

    const messageType = file?.type.startsWith('image/') ? 'image' : file ? 'file' : 'text';
    
    await sendMessage({
      content,
      message_type: messageType,
      file,
    }, conversationId);
  };

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center bg-[#212121]">
        <div className="text-center">
          <h3 className="text-lg font-medium text-white mb-2">Sign in required</h3>
          <p className="text-gray-400">Please sign in to access messages</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-[#212121]">
        <div className="text-center">
          <h3 className="text-lg font-medium text-white mb-2">Error loading chat</h3>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (loading && !currentConversation) {
    return (
      <div className="h-full bg-[#212121]">
        <div className="h-16 bg-[#2A2A2A] border-b border-gray-700/50 animate-pulse"></div>
        <MessageLoading count={5} />
      </div>
    );
  }

  if (!currentConversation) {
    return (
      <div className="h-full flex items-center justify-center bg-[#212121]">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Conversation not found</h3>
          <p className="text-gray-400">This conversation may have been deleted</p>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('h-full flex flex-col bg-[#212121]', className)}>
      {/* Chat Header */}
      <div className="flex-shrink-0">
        <ChatHeader
          conversation={currentConversation}
          currentUserId={user.id}
          onBack={onBack}
        />
      </div>

      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0"
      >
        {loading && messages.length === 0 ? (
          <MessageLoading count={3} />
        ) : messages.length === 0 ? (
          <div className="text-center py-20">
            <MessageSquare className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No messages yet</h3>
            <p className="text-gray-400">Start the conversation below</p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isOwn = message.sender_id === user.id;
              const showTimestamp = 
                index === 0 || 
                index === messages.length - 1 ||
                (index > 0 && 
                  new Date(message.created_at).getTime() - 
                  new Date(messages[index - 1].created_at).getTime() > 300000); // 5 minutes

              return (
                <ChatBubble
                  key={message.id}
                  message={message}
                  isOwn={isOwn}
                  showTimestamp={showTimestamp}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="flex-shrink-0">
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={loading}
        />
      </div>
    </div>
  );
};

export default ChatWindow; 