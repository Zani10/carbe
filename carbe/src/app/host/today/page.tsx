'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { CalendarDays, Car, Clock, Users, MapPin } from 'lucide-react';

// Mock data for demo purposes - this would come from the API in production
const upcomingBookings = [
  {
    id: 'bk1',
    carId: 'car1',
    carName: 'Tesla Model 3',
    status: 'confirmed',
    startDate: '2023-12-12T10:00:00',
    endDate: '2023-12-15T18:00:00',
    renter: {
      id: 'rnt1',
      name: 'John Smith',
      avatar: null,
      rating: 4.8
    },
    totalPrice: 240,
    location: 'Amsterdam, Netherlands'
  },
  {
    id: 'bk2',
    carId: 'car1',
    carName: 'Tesla Model 3',
    status: 'pending',
    startDate: '2023-12-20T09:00:00',
    endDate: '2023-12-22T17:00:00',
    renter: {
      id: 'rnt2',
      name: 'Emily Johnson',
      avatar: null,
      rating: 4.9
    },
    totalPrice: 160,
    location: 'Amsterdam, Netherlands'
  }
];

// Helper function to format dates
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

export default function HostTodayPage() {
  const { user, isHostMode } = useAuth();
  const [activeTab, setActiveTab] = useState('today');
  
  if (!user || !isHostMode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#212121] p-4">
        <div className="bg-[#2A2A2A] p-8 rounded-2xl shadow-md max-w-md w-full text-center border border-gray-700/50">
          <h2 className="text-2xl font-bold text-white mb-4">Host Access Required</h2>
          <p className="text-gray-300 mb-6">
            You need to be in host mode to access this page.
          </p>
          <a 
            href="/profile" 
            className="inline-block px-6 py-3 bg-[#FF2800] text-white rounded-xl hover:bg-[#FF2800]/90"
          >
            Go to Profile
          </a>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#212121] pb-20">
      {/* Header */}
      <header className="bg-[#2A2A2A] border-b border-gray-700/50 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white">Host Dashboard</h1>
        </div>
      </header>
      
      {/* Tabs */}
      <div className="bg-[#2A2A2A] border-b border-gray-700/50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex space-x-8">
            <button
              className={`py-4 px-1 font-medium text-sm border-b-2 ${
                activeTab === 'today' 
                  ? 'border-[#FF2800] text-[#FF2800]' 
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
              onClick={() => setActiveTab('today')}
            >
              Today
            </button>
            <button
              className={`py-4 px-1 font-medium text-sm border-b-2 ${
                activeTab === 'upcoming' 
                  ? 'border-[#FF2800] text-[#FF2800]' 
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
              onClick={() => setActiveTab('upcoming')}
            >
              Upcoming
            </button>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === 'today' ? (
          <>
            <div className="bg-[#2A2A2A] border border-gray-700/50 rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">Today&apos;s Schedule</h2>
              
              {upcomingBookings.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarDays size={48} className="mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400">You have no bookings scheduled for today.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingBookings.map(booking => (
                    <div key={booking.id} className="border border-gray-700/50 bg-[#1F1F1F] rounded-xl p-4 hover:bg-[#252525] transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <Car className="text-gray-400 mr-2" size={18} />
                          <span className="font-medium text-white">{booking.carName}</span>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          booking.status === 'confirmed' 
                            ? 'bg-green-900/50 text-green-300 border border-green-700/50' 
                            : 'bg-yellow-900/50 text-yellow-300 border border-yellow-700/50'
                        }`}>
                          {booking.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="flex items-center">
                          <Clock size={16} className="text-gray-500 mr-2" />
                          <div className="text-sm">
                            <div className="text-gray-200">
                              {formatDate(booking.startDate)} • {formatTime(booking.startDate)}
                            </div>
                            <div className="text-gray-400">Pickup</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <Clock size={16} className="text-gray-500 mr-2" />
                          <div className="text-sm">
                            <div className="text-gray-200">
                              {formatDate(booking.endDate)} • {formatTime(booking.endDate)}
                            </div>
                            <div className="text-gray-400">Return</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center mt-3">
                        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                          <Users size={16} className="text-gray-400" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-white">{booking.renter.name}</div>
                          <div className="text-xs text-gray-400">★ {booking.renter.rating}</div>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-700/50 flex justify-between items-center">
                        <div className="flex items-center text-sm text-gray-400">
                          <MapPin size={16} className="mr-1" />
                          {booking.location}
                        </div>
                        <div className="font-medium text-white">€{booking.totalPrice}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="bg-[#2A2A2A] border border-gray-700/50 rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Quick Stats</h2>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#1F1F1F] border border-gray-700/50 rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-1">Earnings This Month</div>
                  <div className="text-2xl font-bold text-white">€840</div>
                </div>
                
                <div className="bg-[#1F1F1F] border border-gray-700/50 rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-1">Occupancy Rate</div>
                  <div className="text-2xl font-bold text-white">68%</div>
                </div>
                
                <div className="bg-[#1F1F1F] border border-gray-700/50 rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-1">Average Rating</div>
                  <div className="text-2xl font-bold text-white">4.8 ★</div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-[#2A2A2A] border border-gray-700/50 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Upcoming Bookings</h2>
            
            {upcomingBookings.length === 0 ? (
              <div className="text-center py-12">
                <CalendarDays size={48} className="mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400">You have no upcoming bookings.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.map(booking => (
                  <div key={booking.id} className="border border-gray-700/50 bg-[#1F1F1F] rounded-xl p-4 hover:bg-[#252525] transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <Car className="text-gray-400 mr-2" size={18} />
                        <span className="font-medium text-white">{booking.carName}</span>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        booking.status === 'confirmed' 
                          ? 'bg-green-900/50 text-green-300 border border-green-700/50' 
                          : 'bg-yellow-900/50 text-yellow-300 border border-yellow-700/50'
                      }`}>
                        {booking.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="flex items-center">
                        <Clock size={16} className="text-gray-500 mr-2" />
                        <div className="text-sm">
                          <div className="text-gray-200">
                            {formatDate(booking.startDate)} • {formatTime(booking.startDate)}
                          </div>
                          <div className="text-gray-400">Pickup</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Clock size={16} className="text-gray-500 mr-2" />
                        <div className="text-sm">
                          <div className="text-gray-200">
                            {formatDate(booking.endDate)} • {formatTime(booking.endDate)}
                          </div>
                          <div className="text-gray-400">Return</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center mt-3">
                      <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                        <Users size={16} className="text-gray-400" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-white">{booking.renter.name}</div>
                        <div className="text-xs text-gray-400">★ {booking.renter.rating}</div>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-700/50 flex justify-between items-center">
                      <div className="flex items-center text-sm text-gray-400">
                        <MapPin size={16} className="mr-1" />
                        {booking.location}
                      </div>
                      <div className="font-medium text-white">€{booking.totalPrice}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 