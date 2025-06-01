'use client';

import React from 'react';
import { ArrowLeft, User, Car, Calendar, MoreVertical } from 'lucide-react';
import { Conversation } from '@/types/message';
import clsx from 'clsx';

interface ChatHeaderProps {
  conversation: Conversation;
  currentUserId: string;
  onBack?: () => void;
  onMenuClick?: () => void;
  className?: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversation,
  currentUserId,
  onBack,
  onMenuClick,
  className,
}) => {
  const isHost = currentUserId === conversation.host_id;
  const otherUser = isHost ? conversation.renter : conversation.host;
  const userRole = isHost ? 'Renter' : 'Host';

  const formatDateRange = (startDate?: string, endDate?: string) => {
    if (!startDate || !endDate) return null;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const startMonth = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endMonth = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    return `${startMonth} - ${endMonth}`;
  };

  return (
    <div className={clsx(
      'flex items-center justify-between p-4 bg-[#2A2A2A] border-b border-gray-700/50',
      className
    )}>
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        {/* Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}

        {/* User Avatar */}
        <div className="flex-shrink-0">
          {otherUser?.avatar_url ? (
            <img
              src={otherUser.avatar_url}
              alt={otherUser.full_name || 'User'}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 bg-gray-700 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-gray-300" />
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="font-medium text-white truncate">
              {otherUser?.full_name || 'Unknown User'}
            </h3>
            <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
              {userRole}
            </span>
          </div>
          
          {/* Car and Booking Info */}
          <div className="flex items-center space-x-4 mt-1">
            {conversation.car && (
              <div className="flex items-center text-xs text-gray-400">
                <Car className="h-3 w-3 mr-1" />
                <span className="truncate">
                  {conversation.car.year} {conversation.car.make} {conversation.car.model}
                </span>
              </div>
            )}
            
            {conversation.booking && (
              <div className="flex items-center text-xs text-gray-400">
                <Calendar className="h-3 w-3 mr-1" />
                <span>
                  {formatDateRange(
                    conversation.booking.start_date,
                    conversation.booking.end_date
                  )}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Menu Button */}
      {onMenuClick && (
        <button
          onClick={onMenuClick}
          className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 rounded-lg transition-colors"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default ChatHeader; 