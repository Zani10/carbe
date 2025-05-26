interface ChatPageProps {
  params: Promise<{
    conversationId: string;
  }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { conversationId } = await params;
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Chat Conversation {conversationId}</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Chat functionality coming soon...</p>
        </div>
      </div>
    </div>
  );
}
