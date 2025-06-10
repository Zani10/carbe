'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useBooking } from '@/hooks/booking/useBooking';
import { useRouter } from 'next/navigation';
import RenterBottomNav from '@/components/layout/RenterBottomNav';
import RenterBookingCard from '@/components/booking/RenterBookingCard';
import { 
  Calendar,
  Loader2,
  ArrowLeft,
  User
} from 'lucide-react';
import { BookingWithCar } from '@/types/booking';
import Link from 'next/link';

export default function RenterDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { getUserBookings, isLoading } = useBooking();
  
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [bookings, setBookings] = useState<BookingWithCar[]>([]);

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user]);

  const loadBookings = async () => {
    console.log('🔍 Loading bookings for user:', user?.id);
    const userBookings = await getUserBookings();
    console.log('📋 Received bookings:', userBookings);
    setBookings(userBookings);
  };

  if (!user) {
    return (
      <>
        <div className="min-h-screen bg-[#212121] flex items-center justify-center pb-24">
          <div className="text-center px-4">
            <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Sign in to view your rides</h2>
            <p className="text-gray-400 mb-8">Track your bookings and past experiences</p>
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

  const filteredBookings = getBookingsByStatus();





  if (isLoading) {
    return (
      <>
        <div className="min-h-screen bg-[#212121] flex items-center justify-center pb-24">
          <div className="text-center">
            <Loader2 className="h-8 w-8 text-[#FF4646] animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading your rides...</p>
          </div>
        </div>
        <RenterBottomNav />
      </>
  );
  }

  return (
    <>
      {/* Mobile Layout - Hidden on Desktop */}
      <div className="lg:hidden min-h-screen bg-[#212121] pb-24">
        <div className="max-w-md mx-auto px-4 py-6">
        {/* Tabs */}
          <div className="flex mb-6 bg-[#1A1A1A] rounded-xl p-1">
          <button
            onClick={() => setActiveTab('upcoming')}
              className={`flex-1 py-3 px-4 text-center rounded-lg transition-all duration-200 font-medium ${
              activeTab === 'upcoming' 
                ? 'bg-[#FF4646] text-white shadow-sm' 
                  : 'text-gray-400 hover:text-white'
            }`}
          >
              Upcoming
          </button>
          <button
            onClick={() => setActiveTab('past')}
              className={`flex-1 py-3 px-4 text-center rounded-lg transition-all duration-200 font-medium ${
              activeTab === 'past' 
                ? 'bg-[#FF4646] text-white shadow-sm' 
                  : 'text-gray-400 hover:text-white'
            }`}
          >
              Past
          </button>
        </div>

          {/* Bookings List */}
            <div className="space-y-4">
            {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="h-8 w-8 text-gray-400" />
            </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {activeTab === 'upcoming' ? 'No upcoming rides' : 'No past rides'}
                </h3>
                <p className="text-gray-400 mb-8 max-w-xs mx-auto">
                  {activeTab === 'upcoming' 
                    ? 'Start exploring cars and book your first ride!' 
                    : 'Your completed rides will appear here.'
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
                <RenterBookingCard key={booking.id} booking={booking} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Desktop Layout - Hidden on Mobile */}
      <div className="hidden lg:block min-h-screen bg-[#212121]">
        {/* Desktop Navigation */}
        <nav className="bg-[#212121] border-b border-gray-800 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Left - Back Button & Title */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.back()}
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer"
                >
                  <ArrowLeft size={20} />
                  <span className="text-sm font-medium">Back</span>
                </button>
                <div className="h-4 w-px bg-gray-700"></div>
                <Link href="/" className="text-xl font-semibold text-white hover:text-[#FF4646] transition-colors duration-200">
                  carbe
                </Link>
              </div>

              {/* Right - Navigation */}
              <div className="flex items-center space-x-6 flex-shrink-0">
                <Link
                  href="/favorites"
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm font-medium"
                >
                  Saved
                </Link>

                <Link
                  href="/dashboard/renter"
                  className="text-sm font-medium text-white"
                >
                  Rides
                </Link>
                
                <Link
                  href="/chat"
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm font-medium"
                >
                  Inbox
                </Link>
                
                
                <Link
                  href={user ? "/profile" : "/signin"}
                  className="text-sm font-medium text-gray-400 hover:text-white transition-colors duration-200"
                  >
                  <User className="w-6 h-6" />
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Desktop Content */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <Loader2 className="h-12 w-12 text-[#FF4646] animate-spin mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Loading your rides...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex mb-6 bg-[#1A1A1A] rounded-xl p-1 max-w-xs">
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`flex-1 py-3 px-4 text-center rounded-lg transition-all duration-200 font-medium ${
                    activeTab === 'upcoming' 
                      ? 'bg-[#FF4646] text-white shadow-sm' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => setActiveTab('past')}
                  className={`flex-1 py-3 px-4 text-center rounded-lg transition-all duration-200 font-medium ${
                    activeTab === 'past' 
                      ? 'bg-[#FF4646] text-white shadow-sm' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Past
                </button>
              </div>

              {/* Bookings Count */}
              <div className="mb-6">
                <p className="text-gray-400 text-lg">
                  {filteredBookings.length} {activeTab} ride{filteredBookings.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Bookings List */}
              <div>
                {filteredBookings.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Calendar className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-semibold text-white mb-4">
                      {activeTab === 'upcoming' ? 'No upcoming rides' : 'No past rides'}
                    </h3>
                    <p className="text-gray-400 mb-8 text-lg max-w-md mx-auto">
                      {activeTab === 'upcoming' 
                        ? 'Start exploring cars and book your first ride!' 
                        : 'Your completed rides will appear here.'
                      }
                    </p>
                    {activeTab === 'upcoming' && (
                      <button 
                        onClick={() => router.push('/explore')}
                        className="px-8 py-4 bg-[#FF4646] text-white rounded-xl hover:bg-[#FF4646]/90 transition-colors font-medium text-lg"
                      >
                        Browse Cars
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredBookings.map((booking) => (
                      <div key={booking.id} className="col-span-1 max-w-md mx-auto w-full">
                        <RenterBookingCard booking={booking} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation - Hidden on Desktop */}
      <div className="lg:hidden">
        <RenterBottomNav />
      </div>
    </>
  );
}