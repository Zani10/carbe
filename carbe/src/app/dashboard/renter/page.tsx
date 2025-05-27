'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import RenterBottomNav from '@/components/layout/RenterBottomNav';
import { 
  Calendar,
  Clock,
  MapPin,
  Car,
  Star,
  MessageSquare,
  MoreVertical,
  Search
} from 'lucide-react';

// Mock booking data
const mockBookings = [
  {
    id: 'bk1',
    car: {
      id: 'car1',
      name: 'Tesla Model 3',
      brand: 'Tesla',
      images: ['/api/placeholder/400/300'],
      location: 'Amsterdam, Netherlands'
    },
    startDate: '2023-12-05',
    endDate: '2023-12-08',
    status: 'completed',
    totalPrice: 240,
    rating: 5,
    reviewed: true
  },
  {
    id: 'bk2',
    car: {
      id: 'car2',
      name: 'BMW 3 Series',
      brand: 'BMW',
      images: ['/api/placeholder/400/300'],
      location: 'Amsterdam, Netherlands'
    },
    startDate: '2023-11-15',
    endDate: '2023-11-17',
    status: 'completed',
    totalPrice: 160,
    rating: null,
    reviewed: false
  },
  {
    id: 'bk3',
    car: {
      id: 'car3',
      name: 'Mercedes C-Class',
      brand: 'Mercedes',
      images: ['/api/placeholder/400/300'],
      location: 'Amsterdam, Netherlands'
    },
    startDate: '2024-01-20',
    endDate: '2024-01-22',
    status: 'upcoming',
    totalPrice: 190,
    rating: null,
    reviewed: false
  }
];

export default function RenterDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');

  if (!user) {
    return (
      <>
        <div className="min-h-screen bg-[#212121] flex items-center justify-center pb-24">
          <div className="text-center px-4">
            <Calendar className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Sign in to view your trips</h2>
            <p className="text-gray-400 mb-6">Track your bookings and past experiences</p>
            <button 
              onClick={() => router.push('/signin')}
              className="px-6 py-3 bg-[#FF4646] text-white rounded-xl hover:bg-[#FF4646]/90 transition-colors font-medium"
            >
              Sign In
            </button>
          </div>
        </div>
        <RenterBottomNav />
      </>
    );
  }

  const upcomingBookings = mockBookings.filter(b => b.status === 'upcoming');
  const pastBookings = mockBookings.filter(b => b.status === 'completed');

  const filteredBookings = (activeTab === 'upcoming' ? upcomingBookings : pastBookings).filter(booking =>
    booking.car.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.car.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.car.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const BookingCard = ({ booking }: { booking: typeof mockBookings[0] }) => (
    <div className="bg-[#2A2A2A] border border-gray-700/50 rounded-xl p-4 hover:bg-[#2A2A2A]/80 transition-colors">
      <div className="flex items-start space-x-4">
        {/* Car Image */}
        <div className="w-20 h-16 bg-gray-700 rounded-lg flex-shrink-0 overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
            <Car className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        {/* Booking Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-white font-medium">{booking.car.name}</h3>
              <p className="text-gray-400 text-sm">{booking.car.brand}</p>
            </div>
            <button className="p-1 text-gray-400 hover:text-gray-200">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center text-sm text-gray-400 mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            {booking.car.location}
          </div>

          <div className="flex items-center text-sm text-gray-400 mb-3">
            <Calendar className="h-4 w-4 mr-1" />
            {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-white font-medium">€{booking.totalPrice}</div>
            
            {booking.status === 'completed' && (
              <div className="flex items-center space-x-2">
                {booking.reviewed ? (
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-sm text-gray-400">{booking.rating}/5</span>
                  </div>
                ) : (
                  <button className="px-3 py-1 bg-[#FF4646] text-white text-sm rounded-lg hover:bg-[#FF4646]/90 transition-colors">
                    Rate Trip
                  </button>
                )}
              </div>
            )}

            {booking.status === 'upcoming' && (
              <div className="flex items-center space-x-2">
                <button className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors">
                  <MessageSquare className="h-4 w-4" />
                </button>
                <button className="px-3 py-1 bg-[#FF4646] text-white text-sm rounded-lg hover:bg-[#FF4646]/90 transition-colors">
                  View Details
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="min-h-screen bg-[#212121] pb-24">
        {/* Header - Simple title without back button */}
        <div className="bg-[#2A2A2A] border-b border-gray-700/50 px-4 py-6">
          <div className="max-w-md mx-auto">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-white">My Trips</h1>
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 py-4">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search trips..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#2A2A2A] border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#FF4646]/50 focus:border-transparent"
          />
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-[#2A2A2A] border border-gray-700/50 p-1 rounded-xl mb-6">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-colors flex items-center justify-center ${
              activeTab === 'upcoming' 
                ? 'bg-[#FF4646] text-white shadow-sm' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Clock className="h-4 w-4 mr-2" />
            Upcoming ({upcomingBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-colors flex items-center justify-center ${
              activeTab === 'past' 
                ? 'bg-[#FF4646] text-white shadow-sm' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Past ({pastBookings.length})
          </button>
        </div>

        {/* Content */}
        <div>
          {filteredBookings.length > 0 ? (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          ) : searchQuery ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No results found</h3>
              <p className="text-gray-400">Try adjusting your search terms</p>
            </div>
          ) : (
            <div className="text-center py-12">
              {activeTab === 'upcoming' ? (
                <>
                  <Clock className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No upcoming trips</h3>
                  <p className="text-gray-400 mb-6">
                    Book a car to start your next adventure
                  </p>
                  <button 
                    onClick={() => router.push('/explore')}
                    className="px-6 py-3 bg-[#FF4646] text-white rounded-xl hover:bg-[#FF4646]/90 transition-colors font-medium"
                  >
                    Explore Cars
                  </button>
                </>
              ) : (
                <>
                  <Calendar className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No past trips yet</h3>
                  <p className="text-gray-400 mb-6">
                    Your completed trips will appear here
                  </p>
                  <button 
                    onClick={() => router.push('/explore')}
                    className="px-6 py-3 bg-[#FF4646] text-white rounded-xl hover:bg-[#FF4646]/90 transition-colors font-medium"
                  >
                    Book Your First Trip
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {filteredBookings.length > 0 && (
          <div className="mt-8 p-4 bg-[#2A2A2A] border border-gray-700/50 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => router.push('/explore')}
                className="flex items-center justify-center p-3 bg-[#1F1F1F] border border-gray-700/50 rounded-lg hover:bg-[#252525] transition-colors"
              >
                <Car className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-white">Book Again</span>
              </button>
              
              <button 
                onClick={() => router.push('/favorites')}
                className="flex items-center justify-center p-3 bg-[#1F1F1F] border border-gray-700/50 rounded-lg hover:bg-[#252525] transition-colors"
              >
                <Star className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-white">View Saved</span>
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
      <RenterBottomNav />
    </>
  );
} 