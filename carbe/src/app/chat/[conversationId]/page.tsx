interface ChatPageProps {
  params: Promise<{
    conversationId: string;
  }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { conversationId } = await params;
  
  return (
    <div className="min-h-screen bg-[#212121] p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Chat Conversation {conversationId}</h1>
        <div className="bg-[#2A2A2A] border border-gray-700/50 rounded-lg shadow p-6">
          <p className="text-gray-400">Chat functionality coming soon...</p>
        </div>
      </div>
    </div>
  );
}
