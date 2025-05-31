'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useBooking } from '@/hooks/booking/useBooking';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import RenterBottomNav from '@/components/layout/RenterBottomNav';
import { 
  Calendar,
  Clock,
  MapPin,
  Car,
  MessageSquare,
  MoreVertical,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { BookingWithCar, BookingStatus } from '@/types/booking';
import Image from 'next/image';

export default function RenterDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { getUserBookings, isLoading } = useBooking();
  
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookings, setBookings] = useState<BookingWithCar[]>([]);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    const userBookings = await getUserBookings();
    setBookings(userBookings);
  };

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

  const getBookingsByStatus = () => {
    const now = new Date();
    
    if (activeTab === 'upcoming') {
      return bookings.filter(booking => {
        const startDate = new Date(booking.start_date);
        return startDate >= now || ['pending', 'awaiting_approval', 'confirmed'].includes(booking.status);
      });
    } else {
      return bookings.filter(booking => {
        const endDate = new Date(booking.end_date);
        return endDate < now || ['completed', 'cancelled', 'rejected'].includes(booking.status);
      });
    }
  };

  const filteredBookings = getBookingsByStatus().filter(booking =>
    booking.cars.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.cars.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
      case 'awaiting_approval':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'cancelled':
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: BookingStatus) => {
    switch (status) {
      case 'pending':
        return 'Processing';
      case 'awaiting_approval':
        return 'Awaiting approval';
      case 'confirmed':
        return 'Confirmed';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return 'text-green-500';
      case 'pending':
      case 'awaiting_approval':
        return 'text-yellow-500';
      case 'cancelled':
      case 'rejected':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const BookingCard = ({ booking }: { booking: BookingWithCar }) => (
    <div 
      className="bg-[#2A2A2A] border border-gray-700/50 rounded-xl p-4 hover:bg-[#2A2A2A]/80 transition-colors cursor-pointer"
      onClick={() => router.push(`/booking/${booking.id}`)}
    >
      <div className="flex items-start space-x-4">
        {/* Car Image */}
        <div className="w-20 h-16 bg-gray-700 rounded-lg flex-shrink-0 overflow-hidden">
          {booking.cars.images && booking.cars.images.length > 0 ? (
            <Image
              src={booking.cars.images[0]}
              alt={`${booking.cars.make} ${booking.cars.model}`}
              width={80}
              height={64}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
              <Car className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Booking Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-white font-medium">
                {booking.cars.make} {booking.cars.model}
              </h3>
              <p className="text-gray-400 text-sm">{booking.cars.year}</p>
            </div>
            <button 
              className="p-1 text-gray-400 hover:text-gray-200"
              onClick={(e) => {
                e.stopPropagation();
                // Add context menu functionality here
              }}
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center text-sm text-gray-400 mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            {'Location not specified'}
          </div>

          <div className="flex items-center text-sm text-gray-400 mb-2">
            <Calendar className="h-4 w-4 mr-1" />
            {format(new Date(booking.start_date), 'MMM d')} - {format(new Date(booking.end_date), 'MMM d, yyyy')}
          </div>

          {/* Status */}
          <div className="flex items-center text-sm mb-3">
            {getStatusIcon(booking.status)}
            <span className={`ml-1 ${getStatusColor(booking.status)}`}>
              {getStatusText(booking.status)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-white font-medium">€{booking.total_amount}</div>
            
            {booking.status === 'completed' && (
              <div className="flex items-center space-x-2">
                <button 
                  className="px-3 py-1 bg-[#FF4646] text-white text-sm rounded-lg hover:bg-[#FF4646]/90 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Add review functionality
                  }}
                >
                  Rate Trip
                </button>
              </div>
            )}

            {['confirmed', 'awaiting_approval'].includes(booking.status) && (
              <div className="flex items-center space-x-2">
                <button 
                  className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/chat/${booking.id}`);
                  }}
                >
                  <MessageSquare className="h-4 w-4" />
                </button>
                <button className="px-3 py-1 bg-[#FF4646] text-white text-sm rounded-lg hover:bg-[#FF4646]/90 transition-colors">
                  View Details
                </button>
              </div>
            )}

            {booking.status === 'awaiting_approval' && (
              <div className="text-xs text-yellow-500">
                {booking.approval_deadline && (
                  <>Deadline: {format(new Date(booking.approval_deadline), 'MMM d, HH:mm')}</>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <>
        <div className="min-h-screen bg-[#212121] flex items-center justify-center pb-24">
          <div className="text-center">
            <Loader2 className="h-8 w-8 text-[#FF4646] animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading your trips...</p>
          </div>
        </div>
        <RenterBottomNav />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#212121] pb-24">
        {/* Header */}
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
              className="w-full bg-[#2A2A2A] border border-gray-700/50 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF4646]/50"
            />
          </div>

          {/* Tabs */}
          <div className="flex mb-6">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex-1 py-3 px-4 text-center rounded-l-xl border border-gray-700/50 transition-colors ${
                activeTab === 'upcoming'
                  ? 'bg-[#FF4646] text-white border-[#FF4646]'
                  : 'bg-[#2A2A2A] text-gray-400 hover:text-white'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`flex-1 py-3 px-4 text-center rounded-r-xl border border-l-0 border-gray-700/50 transition-colors ${
                activeTab === 'past'
                  ? 'bg-[#FF4646] text-white border-[#FF4646]'
                  : 'bg-[#2A2A2A] text-gray-400 hover:text-white'
              }`}
            >
              Past
            </button>
          </div>

          {/* Bookings List */}
          <div className="space-y-4">
            {filteredBookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  {activeTab === 'upcoming' ? 'No upcoming trips' : 'No past trips'}
                </h3>
                <p className="text-gray-400 mb-6">
                  {activeTab === 'upcoming' 
                    ? 'Start exploring cars and book your first trip!' 
                    : 'Your completed trips will appear here.'
                  }
                </p>
                {activeTab === 'upcoming' && (
                  <button
                    onClick={() => router.push('/explore')}
                    className="px-6 py-3 bg-[#FF4646] text-white rounded-xl hover:bg-[#FF4646]/90 transition-colors font-medium"
                  >
                    Browse Cars
                  </button>
                )}
              </div>
            ) : (
              filteredBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </div>
        </div>
      </div>
      <RenterBottomNav />
    </>
  );
} 