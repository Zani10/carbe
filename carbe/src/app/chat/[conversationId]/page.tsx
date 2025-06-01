'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import ChatWindow from '@/components/chat/ChatWindow';

interface ChatPageProps {
  params: Promise<{
    conversationId: string;
  }>;
}

export default function ChatPage({ params }: ChatPageProps) {
  const router = useRouter();
  const [conversationId, setConversationId] = React.useState<string>('');

  React.useEffect(() => {
    params.then((resolvedParams) => {
      setConversationId(resolvedParams.conversationId);
    });
  }, [params]);

  const handleBack = () => {
    router.push('/chat');
  };

  if (!conversationId) {
    return (
      <div className="min-h-screen bg-[#212121] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <ChatWindow
        conversationId={conversationId}
        onBack={handleBack}
      />
    </div>
  );
}
