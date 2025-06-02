'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Conversation } from '@/types/message';
import { formatDistanceToNow } from 'date-fns';
import { Car, User, MessageSquare } from 'lucide-react';
import clsx from 'clsx';

interface ConversationListProps {
  conversations: Conversation[];
  currentUserId: string;
  loading?: boolean;
  onConversationClick?: (conversationId: string) => void;
  className?: string;
}

interface ConversationItemProps {
  conversation: Conversation;
  currentUserId: string;
  onClick: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  currentUserId,
  onClick,
}) => {
  const isHost = currentUserId === conversation.host_id;
  const otherUser = isHost ? conversation.renter : conversation.host;
  const hasUnread = (conversation.unread_count || 0) > 0;

  const formatTimestamp = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  return (
    <div
      onClick={onClick}
      className={clsx(
        'relative rounded-xl cursor-pointer transition-all duration-200 hover:bg-[#2A2A2A]/80',
        hasUnread 
          ? 'bg-[#2A2A2A] border-l-4 border-[#FF4646]' 
          : 'bg-[#2A2A2A]/50 hover:bg-[#2A2A2A]'
      )}
    >
      <div className="p-4">
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div className="flex-shrink-0 relative">
            {otherUser?.avatar_url ? (
              <img
                src={otherUser.avatar_url}
                alt={otherUser.full_name || 'User'}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="h-12 w-12 bg-[#404040] rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-gray-400" />
              </div>
            )}
            
            {/* Unread indicator */}
            {hasUnread && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#FF4646] rounded-full"></div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className={clsx(
                'font-medium text-base truncate',
                hasUnread ? 'text-white' : 'text-gray-200'
              )}>
                {otherUser?.full_name || 'Unknown User'}
              </h3>
              
              <div className="flex items-center space-x-2">
                {conversation.last_message_at && (
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(conversation.last_message_at)}
                  </span>
                )}
                {hasUnread && (
                  <div className="w-5 h-5 bg-[#FF4646] text-white text-xs font-medium rounded-full flex items-center justify-center">
                    {conversation.unread_count}
                  </div>
                )}
              </div>
            </div>

            {/* Car Info */}
            {conversation.car && (
              <div className="flex items-center text-xs text-gray-400 mb-1">
                <Car className="h-3 w-3 mr-1.5" />
                <span className="truncate">
                  {conversation.car.year} {conversation.car.make} {conversation.car.model}
                </span>
              </div>
            )}

            {/* Last Message */}
            {conversation.last_message ? (
              <p className={clsx(
                'text-sm truncate',
                hasUnread ? 'text-gray-300' : 'text-gray-500'
              )}>
                {conversation.last_message.message_type === 'image' && '📷 Photo'}
                {conversation.last_message.message_type === 'file' && '📎 File'}
                {conversation.last_message.message_type === 'text' && conversation.last_message.content}
              </p>
            ) : (
              <p className="text-sm text-gray-500 italic">Start the conversation...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ConversationListSkeleton: React.FC = () => (
  <div className="space-y-2">
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="p-4 bg-[#2A2A2A]/50 rounded-xl animate-pulse">
        <div className="flex items-start space-x-3">
          <div className="h-12 w-12 bg-gray-600 rounded-full"></div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="h-4 bg-gray-600 rounded w-32"></div>
              <div className="h-3 bg-gray-600 rounded w-16"></div>
            </div>
            <div className="h-3 bg-gray-600 rounded w-24 mb-2"></div>
            <div className="h-3 bg-gray-600 rounded w-40"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  currentUserId,
  loading = false,
  onConversationClick,
  className,
}) => {
  const router = useRouter();

  const handleConversationClick = (conversationId: string) => {
    if (onConversationClick) {
      onConversationClick(conversationId);
    } else {
      router.push(`/chat/${conversationId}`);
    }
  };

  if (loading) {
    return (
      <div className={clsx('', className)}>
        <ConversationListSkeleton />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className={clsx('text-center py-16', className)}>
        <div className="w-16 h-16 bg-[#2A2A2A] rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No conversations yet</h3>
        <p className="text-gray-400 mb-6">
          Start a conversation by asking about a car you&apos;re interested in
        </p>
        <button
          onClick={() => router.push('/explore')}
          className="px-6 py-3 bg-[#FF4646] text-white rounded-lg hover:bg-[#FF4646]/90 transition-colors font-medium"
        >
          Explore Cars
        </button>
      </div>
    );
  }

  return (
    <div className={clsx('space-y-2', className)}>
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          currentUserId={currentUserId}
          onClick={() => handleConversationClick(conversation.id)}
        />
      ))}
    </div>
  );
};

export default ConversationList; 