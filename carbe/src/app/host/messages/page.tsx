'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { 
  ArrowLeft,
  Search,
  MoreVertical,
  Star,
  Clock,
  Car,
  User,
  MessageSquare
} from 'lucide-react';

interface Message {
  id: string;
  guestName: string;
  guestAvatar?: string;
  carName: string;
  lastMessage: string;
  timestamp: string;
  isUnread: boolean;
  rating?: number;
}

// Mock data for messages
const mockMessages: Message[] = [
  {
    id: '1',
    guestName: 'John Smith',
    carName: 'BMW 3 Series',
    lastMessage: 'Hi! I have a question about the pickup location. Is there parking available nearby?',
    timestamp: '2 hours ago',
    isUnread: true,
    rating: 4.8
  },
  {
    id: '2',
    guestName: 'Sarah Johnson',
    carName: 'Tesla Model 3',
    lastMessage: 'Thank you for the smooth rental experience! The car was perfect.',
    timestamp: '1 day ago',
    isUnread: false,
    rating: 4.9
  },
  {
    id: '3',
    guestName: 'Mike Chen',
    carName: 'BMW 3 Series',
    lastMessage: 'Could we extend the rental by one more day? Let me know if that works.',
    timestamp: '2 days ago',
    isUnread: true,
    rating: 4.7
  },
  {
    id: '4',
    guestName: 'Emma Davis',
    carName: 'Tesla Model 3',
    lastMessage: 'Everything went great! Will definitely rent from you again.',
    timestamp: '3 days ago',
    isUnread: false,
    rating: 5.0
  }
];

interface MessageItemProps {
  message: Message;
  onClick: () => void;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, onClick }) => (
  <Card variant="light" padding="md" onClick={onClick} className="text-left">
    <div className="flex items-start space-x-3">
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
          <User className="h-6 w-6 text-gray-600" />
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-2">
            <h3 className={`font-medium truncate ${message.isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
              {message.guestName}
            </h3>
            {message.rating && (
              <div className="flex items-center text-xs text-gray-500">
                <Star className="h-3 w-3 text-yellow-500 mr-1" />
                {message.rating}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-500">{message.timestamp}</span>
            {message.isUnread && (
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </div>
        </div>
        
        <div className="flex items-center text-xs text-gray-500 mb-2">
          <Car className="h-3 w-3 mr-1" />
          {message.carName}
        </div>
        
        <p className={`text-sm truncate ${message.isUnread ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
          {message.lastMessage}
        </p>
      </div>
    </div>
  </Card>
);

export default function HostMessagesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');

  const handleMessageClick = (messageId: string) => {
    router.push(`/host/messages/${messageId}`);
  };

  const filteredMessages = mockMessages.filter(message => {
    const matchesSearch = message.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.carName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filter === 'all' || 
                         (filter === 'unread' && message.isUnread) ||
                         (filter === 'archived' && !message.isUnread);
    
    return matchesSearch && matchesFilter;
  });

  const unreadCount = mockMessages.filter(m => m.isUnread).length;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Please sign in</h2>
          <p className="text-gray-600 mt-2">You need to be signed in to access messages.</p>
          <Button 
            variant="host-primary" 
            className="mt-4"
            onClick={() => router.push('/signin')}
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.back()}
                className="mr-3 text-gray-600"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Messages</h1>
                {unreadCount > 0 && (
                  <p className="text-sm text-gray-600">{unreadCount} unread</p>
                )}
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-4">
        {/* Search and Filter */}
        <div className="space-y-4 mb-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                filter === 'all' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All ({mockMessages.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                filter === 'unread' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>

        {/* Messages List */}
        <div className="space-y-3">
          {filteredMessages.length > 0 ? (
            filteredMessages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                onClick={() => handleMessageClick(message.id)}
              />
            ))
          ) : (
            <Card variant="light" padding="lg" className="text-center">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
              <p className="text-gray-600">
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'When guests message you, their conversations will appear here'
                }
              </p>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        {filteredMessages.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Card variant="light" padding="md" onClick={() => {}} className="text-center">
                <Clock className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Set Auto-Reply</p>
                <p className="text-xs text-gray-600">Respond faster</p>
              </Card>
              <Card variant="light" padding="md" onClick={() => {}} className="text-center">
                <MessageSquare className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Message Templates</p>
                <p className="text-xs text-gray-600">Save time</p>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 