'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  Search,
  MessageSquare,
  Users,
  ChevronRight,
  Star,
  Send
} from 'lucide-react';

// Mock data for demo purposes
const mockConversations = [
  {
    id: 'conv1',
    renter: {
      id: 'rnt1',
      name: 'John Smith',
      avatar: null,
      rating: 4.8
    },
    car: {
      id: 'car1',
      name: 'Tesla Model 3'
    },
    lastMessage: {
      text: 'Hi, I was wondering if the car is available for pickup earlier?',
      time: '2023-12-05T10:32:00',
      fromRenter: true
    },
    unread: true,
    booking: {
      id: 'bk1',
      startDate: '2023-12-12T10:00:00',
      endDate: '2023-12-15T18:00:00',
      status: 'confirmed'
    }
  },
  {
    id: 'conv2',
    renter: {
      id: 'rnt2',
      name: 'Emily Johnson',
      avatar: null,
      rating: 4.9
    },
    car: {
      id: 'car1',
      name: 'Tesla Model 3'
    },
    lastMessage: {
      text: 'Great! Looking forward to the trip.',
      time: '2023-12-04T16:45:00',
      fromRenter: false
    },
    unread: false,
    booking: {
      id: 'bk2',
      startDate: '2023-12-20T09:00:00',
      endDate: '2023-12-22T17:00:00',
      status: 'confirmed'
    }
  },
  {
    id: 'conv3',
    renter: {
      id: 'rnt3',
      name: 'David Brown',
      avatar: null,
      rating: 4.7
    },
    car: {
      id: 'car2',
      name: 'BMW 3 Series'
    },
    lastMessage: {
      text: 'Thanks for accepting my booking request!',
      time: '2023-12-03T11:23:00',
      fromRenter: true
    },
    unread: false,
    booking: {
      id: 'bk3',
      startDate: '2023-12-25T10:00:00',
      endDate: '2023-12-28T17:00:00',
      status: 'confirmed'
    }
  }
];

// Mock messages for a conversation
const mockMessages = [
  {
    id: 'msg1',
    text: 'Hi, I\'m interested in renting your Tesla Model 3.',
    time: '2023-12-04T09:30:00',
    fromRenter: true
  },
  {
    id: 'msg2',
    text: 'Hello! Thanks for your interest. It\'s available for the dates you\'re looking at.',
    time: '2023-12-04T09:45:00',
    fromRenter: false
  },
  {
    id: 'msg3',
    text: 'Great! I just made a booking request.',
    time: '2023-12-04T10:15:00',
    fromRenter: true
  },
  {
    id: 'msg4',
    text: 'Perfect, I\'ve accepted your request. Looking forward to your trip!',
    time: '2023-12-04T10:30:00',
    fromRenter: false
  },
  {
    id: 'msg5',
    text: 'Great! Looking forward to the trip.',
    time: '2023-12-04T16:45:00',
    fromRenter: true
  },
  {
    id: 'msg6',
    text: 'Hi, I was wondering if the car is available for pickup earlier?',
    time: '2023-12-05T10:32:00',
    fromRenter: true
  }
];

// Helper function to format date
const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
};

export default function HostMessagesPage() {
  const { user, isHostMode } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  if (!user || !isHostMode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-md max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Host Access Required</h2>
          <p className="text-gray-600 mb-6">
            You need to be in host mode to access this page.
          </p>
          <a 
            href="/profile" 
            className="inline-block px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600"
          >
            Go to Profile
          </a>
        </div>
      </div>
    );
  }
  
  const filteredConversations = searchQuery 
    ? mockConversations.filter(conv => 
        conv.renter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.car.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mockConversations;
    
  const handleSend = () => {
    if (messageText.trim() === '') return;
    
    // In a real app, this would send the message to the backend
    console.log('Sending message:', messageText);
    
    // Clear the input
    setMessageText('');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
        </div>
      </header>
      
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex h-[calc(100vh-200px)] min-h-[500px]">
            {/* Conversation list */}
            <div className="w-1/3 border-r border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                </div>
              </div>
              
              <div className="overflow-y-auto h-[calc(100%-66px)]">
                {filteredConversations.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No conversations found</p>
                  </div>
                ) : (
                  <div>
                    {filteredConversations.map(conversation => (
                      <div 
                        key={conversation.id}
                        className={`p-4 border-b border-gray-100 cursor-pointer ${
                          selectedConversation === conversation.id 
                            ? 'bg-gray-50' 
                            : 'hover:bg-gray-50'
                        } ${conversation.unread ? 'bg-red-50' : ''}`}
                        onClick={() => setSelectedConversation(conversation.id)}
                      >
                        <div className="flex items-start">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <Users size={18} className="text-gray-500" />
                          </div>
                          <div className="ml-3 flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-gray-900">{conversation.renter.name}</p>
                                <p className="text-sm text-gray-500 mt-0.5">{conversation.car.name}</p>
                              </div>
                              <span className="text-xs text-gray-500">
                                {formatTime(conversation.lastMessage.time)}
                              </span>
                            </div>
                            <p className={`text-sm mt-1 line-clamp-2 ${
                              conversation.unread ? 'font-medium text-gray-900' : 'text-gray-500'
                            }`}>
                              {conversation.lastMessage.fromRenter ? '' : 'You: '}
                              {conversation.lastMessage.text}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Conversation detail */}
            <div className="w-2/3 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Conversation header */}
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <Users size={18} className="text-gray-500" />
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">
                          {mockConversations.find(c => c.id === selectedConversation)?.renter.name}
                        </p>
                        <div className="flex items-center text-xs text-gray-500">
                          <Star size={12} className="text-yellow-500 mr-0.5" />
                          {mockConversations.find(c => c.id === selectedConversation)?.renter.rating}
                        </div>
                      </div>
                    </div>
                    <a 
                      href={`/bookings/${mockConversations.find(c => c.id === selectedConversation)?.booking.id}`}
                      className="text-sm text-red-500 flex items-center"
                    >
                      View Booking <ChevronRight size={16} />
                    </a>
                  </div>
                  
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {mockMessages.map(message => (
                      <div 
                        key={message.id}
                        className={`flex ${message.fromRenter ? 'justify-start' : 'justify-end'}`}
                      >
                        <div className={`max-w-[70%] rounded-xl p-3 ${
                          message.fromRenter 
                            ? 'bg-gray-100 text-gray-800' 
                            : 'bg-red-500 text-white'
                        }`}>
                          <p>{message.text}</p>
                          <p className={`text-xs mt-1 text-right ${
                            message.fromRenter ? 'text-gray-500' : 'text-red-200'
                          }`}>
                            {formatTime(message.time)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Message input */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center">
                      <input
                        type="text"
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-red-500 focus:border-red-500"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      />
                      <button
                        className="px-4 py-2 bg-red-500 text-white rounded-r-lg hover:bg-red-600"
                        onClick={handleSend}
                      >
                        <Send size={20} />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <MessageSquare size={64} className="text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-2">Select a conversation</p>
                  <p className="text-sm text-gray-400">Your messages with renters will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 