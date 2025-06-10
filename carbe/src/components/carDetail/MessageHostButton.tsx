'use client';

import React, { useState } from 'react';
import { MessageCircle, Loader2 } from 'lucide-react';
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
  variant = 'secondary',
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
        'w-full bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-3.5 px-4 rounded-full flex items-center justify-center transition-colors disabled:opacity-50',
        className
      )}
    >
      {isCreating ? (
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
      ) : (
        <MessageCircle className="w-5 h-5 mr-2" />
      )}
      <span>
        {isCreating ? 'Starting chat...' : 'Message host'}
      </span>
    </button>
  );
};

export default MessageHostButton; 