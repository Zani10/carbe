'use client';

import React, { useState } from 'react';
import { MessageSquare, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/chat/useChat';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import clsx from 'clsx';

interface MessageHostButtonProps {
  carId: string;
  hostId: string;
  carName?: string;
  bookingId?: string;
  className?: string;
  variant?: 'primary' | 'secondary';
}

export const MessageHostButton: React.FC<MessageHostButtonProps> = ({
  carId,
  hostId,
  carName = 'this car',
  bookingId,
  className,
  variant = 'primary',
}) => {
  const { user } = useAuth();
  const { createOrGetConversation } = useChat();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleMessageHost = async () => {
    if (!user) {
      toast.error('Please sign in to message the host');
      router.push('/signin');
      return;
    }

    if (user.id === hostId) {
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

  return (
    <button
      onClick={handleMessageHost}
      disabled={isCreating}
      className={clsx(
        'flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all disabled:opacity-50',
        variant === 'primary' && 'bg-[#FF4646] text-white hover:bg-[#FF4646]/90',
        variant === 'secondary' && 'bg-[#2A2A2A] text-white border border-gray-700/50 hover:bg-[#333333] hover:border-gray-600/50',
        className
      )}
    >
      {isCreating ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <MessageSquare className="h-5 w-5" />
      )}
      <span>
        {isCreating ? 'Starting chat...' : `Message Host about ${carName}`}
      </span>
    </button>
  );
};

export default MessageHostButton; 