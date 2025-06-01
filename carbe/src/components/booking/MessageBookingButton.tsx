'use client';

import React, { useState } from 'react';
import { MessageSquare, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/chat/useChat';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import clsx from 'clsx';

interface MessageBookingButtonProps {
  carId: string;
  hostId: string;
  renterId: string;
  bookingId: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'icon';
  size?: 'sm' | 'md' | 'lg';
}

export const MessageBookingButton: React.FC<MessageBookingButtonProps> = ({
  carId,
  hostId,
  renterId,
  bookingId,
  className,
  variant = 'secondary',
  size = 'md',
}) => {
  const { user } = useAuth();
  const { createOrGetConversation } = useChat();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleMessageStart = async () => {
    if (!user) {
      toast.error('Please sign in to message');
      router.push('/signin');
      return;
    }

    // Determine who we're messaging based on current user
    const otherUserId = user.id === hostId ? renterId : hostId;
    
    if (user.id === otherUserId) {
      toast.error("You can't message yourself");
      return;
    }

    setIsCreating(true);
    try {
      const conversationId = await createOrGetConversation(carId, hostId, bookingId);
      
      if (conversationId) {
        router.push(`/chat/${conversationId}`);
      } else {
        toast.error('Failed to start conversation');
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to start conversation');
    } finally {
      setIsCreating(false);
    }
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleMessageStart}
        disabled={isCreating}
        className={clsx(
          'flex items-center justify-center rounded-lg transition-colors disabled:opacity-50',
          size === 'sm' && 'p-1.5',
          size === 'md' && 'p-2',
          size === 'lg' && 'p-3',
          'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50',
          className
        )}
      >
        {isCreating ? (
          <Loader2 className={clsx(
            'animate-spin',
            size === 'sm' && 'h-3 w-3',
            size === 'md' && 'h-4 w-4',
            size === 'lg' && 'h-5 w-5'
          )} />
        ) : (
          <MessageSquare className={clsx(
            size === 'sm' && 'h-3 w-3',
            size === 'md' && 'h-4 w-4',
            size === 'lg' && 'h-5 w-5'
          )} />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleMessageStart}
      disabled={isCreating}
      className={clsx(
        'flex items-center justify-center space-x-2 font-medium transition-all disabled:opacity-50',
        variant === 'primary' && 'bg-[#FF4646] text-white hover:bg-[#FF4646]/90',
        variant === 'secondary' && 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600',
        size === 'sm' && 'px-3 py-1.5 text-xs rounded-lg',
        size === 'md' && 'px-4 py-2 text-sm rounded-lg',
        size === 'lg' && 'px-6 py-3 text-base rounded-xl',
        className
      )}
    >
      {isCreating ? (
        <Loader2 className={clsx(
          'animate-spin',
          size === 'sm' && 'h-3 w-3',
          size === 'md' && 'h-4 w-4',
          size === 'lg' && 'h-5 w-5'
        )} />
      ) : (
        <MessageSquare className={clsx(
          size === 'sm' && 'h-3 w-3',
          size === 'md' && 'h-4 w-4',
          size === 'lg' && 'h-5 w-5'
        )} />
      )}
      <span>
        {isCreating ? 'Starting...' : 'Message'}
      </span>
    </button>
  );
};

export default MessageBookingButton; 