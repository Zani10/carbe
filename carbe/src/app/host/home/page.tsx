'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useBooking } from '@/hooks/booking/useBooking';
import { format, startOfToday, endOfToday, addDays } from 'date-fns';
import HostBottomNav from '@/components/layout/HostBottomNav';
import { 
  CheckCircle,
  X,
  Check,
  MessageCircle,
  Calendar,
  Car
} from 'lucide-react';
import { BookingWithCar } from '@/types/booking';
import { useBooking as useBookingActions } from '@/hooks/booking/useBooking';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

interface QuickStats {
  monthlyEarnings: number;
  pendingActions: number;
}

interface BookingGroup {
  title: string;
  description: string;
  bookings: BookingWithCar[];
  priority: 'urgent' | 'high' | 'normal';
}

export default function HostHomePage() {
  const { user, isHostMode } = useAuth();
  const { getHostBookings, isLoading } = useBooking();
  const { approveBooking } = useBookingActions();
  
  const [bookings, setBookings] = useState<BookingWithCar[]>([]);
  const [stats, setStats] = useState<QuickStats>({
    monthlyEarnings: 0,
    pendingActions: 0,
  });
  const [activeGroup, setActiveGroup] = useState<'requests' | 'bookings' | 'this-week'>('bookings');
  const [processingActions, setProcessingActions] = useState<Record<string, 'approve' | 'decline' | null>>({});

  useEffect(() => {
    if (user && isHostMode) {
      loadHostData();
    }
  }, [user, isHostMode]);

  const loadHostData = async () => {
    try {
      const hostBookings = await getHostBookings();
      setBookings(hostBookings);
      calculateStats(hostBookings);
    } catch (error) {
      console.error('Error loading host data:', error);
    }
  };

  const calculateStats = (allBookings: BookingWithCar[]) => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const thisMonthBookings = allBookings.filter(booking => 
      new Date(booking.created_at) >= startOfMonth && 
      ['confirmed', 'completed'].includes(booking.status)
    );

    const pendingBookings = allBookings.filter(booking => 
      booking.status === 'awaiting_approval' || booking.status === 'pending'
    );

    setStats({
      monthlyEarnings: thisMonthBookings.reduce((sum, booking) => sum + booking.total_amount, 0),
      pendingActions: pendingBookings.length,
    });
  };

  const getBookingGroups = (): BookingGroup[] => {
    const today = startOfToday();
    const endToday = endOfToday();
    const thisWeekEnd = addDays(today, 7);

    // Needs Action - Highest Priority
    const needsAction = bookings.filter(booking => 
      booking.status === 'awaiting_approval' || booking.status === 'pending'
    );

    // Today - Active bookings happening today
    const todayBookings = bookings.filter(booking => {
      const startDate = new Date(booking.start_date);
      const endDate = new Date(booking.end_date);
      
      return (
        (startDate >= today && startDate <= endToday) ||
        (endDate >= today && endDate <= endToday) ||
        (startDate <= today && endDate >= endToday)
      ) && ['confirmed', 'active'].includes(booking.status);
    });

    // This Week - Confirmed bookings in the next 7 days
    const thisWeekBookings = bookings.filter(booking => {
      const startDate = new Date(booking.start_date);
      return startDate > endToday && 
             startDate <= thisWeekEnd && 
             ['confirmed'].includes(booking.status);
    });

    return [
      {
        title: 'Requests',
        description: 'Booking requests awaiting your response',
        bookings: needsAction,
        priority: 'urgent'
      },
      {
        title: 'Bookings',
        description: 'Upcoming and active bookings',
        bookings: bookings.filter(booking => {
          const today = new Date();
          const endDate = new Date(booking.end_date);
          return ['confirmed', 'active'].includes(booking.status) && endDate >= today;
        }).sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()),
        priority: 'high'
      },
      {
        title: 'This Week',
        description: 'Upcoming confirmed trips',
        bookings: thisWeekBookings,
        priority: 'normal'
      }
    ];
  };

  const handleQuickAction = async (bookingId: string, action: 'approve' | 'decline') => {
    setProcessingActions(prev => ({ ...prev, [bookingId]: action }));
    
    try {
      const success = await approveBooking({
        booking_id: bookingId,
        action: action === 'decline' ? 'reject' : action,
      });

      if (success) {
        toast.success(action === 'approve' ? 'Trip approved!' : 'Request declined');
        loadHostData();
      }
    } catch (error) {
      console.error('Error processing action:', error);
      toast.error('Failed to process request');
    } finally {
      setProcessingActions(prev => ({ ...prev, [bookingId]: null }));
    }
  };

  const QuickActionCard = ({ booking }: { booking: BookingWithCar }) => {
    const processing = processingActions[booking.id];
    
    return (
      <div className="backdrop-blur-xl bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-transparent border border-amber-500/20 rounded-2xl p-4 shadow-lg">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              <div className="absolute inset-0 w-2 h-2 bg-amber-400 rounded-full animate-ping opacity-60" />
            </div>
            <span className="text-amber-400 font-medium text-xs uppercase tracking-wide">Urgent</span>
          </div>
          <div className="text-xl font-bold text-white">€{booking.total_amount}</div>
        </div>

        {/* Compact Car Info & Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div className="w-14 h-10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-lg overflow-hidden border border-gray-600/30">
              {booking.cars.images && booking.cars.images.length > 0 ? (
                <Image
                  src={booking.cars.images[0]}
                  alt={`${booking.cars.make} ${booking.cars.model}`}
                  width={56}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Car className="h-4 w-4 text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white text-sm truncate">
                {booking.cars.make} {booking.cars.model}
              </h3>
              <p className="text-xs text-gray-400">
                {format(new Date(booking.start_date), 'MMM d')} - {format(new Date(booking.end_date), 'MMM d')}
              </p>
            </div>
          </div>

          {/* Compact Action Buttons */}
          <div className="flex space-x-2 ml-3">
            <button
              onClick={() => handleQuickAction(booking.id, 'decline')}
              disabled={!!processing}
              className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-3 py-2 text-xs font-medium hover:bg-red-500/20 transition-all disabled:opacity-50 backdrop-blur-sm"
            >
              {processing === 'decline' ? (
                <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <X className="h-3 w-3" />
              )}
            </button>
            
            <button
              onClick={() => handleQuickAction(booking.id, 'approve')}
              disabled={!!processing}
              className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl px-3 py-2 text-xs font-medium hover:bg-green-500/20 transition-all disabled:opacity-50 backdrop-blur-sm"
            >
              {processing === 'approve' ? (
                <div className="w-3 h-3 border border-green-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="h-3 w-3" />
              )}
            </button>
            
            <button className="bg-[#FF4646]/10 border border-[#FF4646]/30 text-[#FF4646] rounded-xl px-3 py-2 text-xs font-medium hover:bg-[#FF4646]/20 transition-all backdrop-blur-sm">
              <MessageCircle className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const RegularBookingCard = ({ booking }: { booking: BookingWithCar }) => {
    const getStatusConfig = () => {
      switch (booking.status) {
        case 'confirmed':
          return { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' };
        case 'active':
          return { color: 'text-gray-300', bg: 'bg-gray-700/20', border: 'border-gray-600/30' };
        default:
          return { color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20' };
      }
    };

    const statusConfig = getStatusConfig();

    return (
      <div className="backdrop-blur-xl bg-gradient-to-br from-gray-500/5 via-gray-900/20 to-transparent border border-gray-700/30 rounded-2xl p-5 hover:border-gray-600/50 transition-all shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-12 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-600/30">
              {booking.cars.images && booking.cars.images.length > 0 ? (
                <Image
                  src={booking.cars.images[0]}
                  alt={`${booking.cars.make} ${booking.cars.model}`}
                  width={64}
                  height={48}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Car className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>
            
            <div>
              <h4 className="font-semibold text-white">
                {booking.cars.make} {booking.cars.model}
              </h4>
              <p className="text-sm text-gray-400">
                {format(new Date(booking.start_date), 'MMM d')} - {format(new Date(booking.end_date), 'MMM d')}
              </p>
            </div>
          </div>
          
          <div className="text-right space-y-2">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border} border`}>
              {booking.status === 'confirmed' ? 'Confirmed' : booking.status === 'active' ? 'Active' : booking.status}
            </div>
            <div className="text-lg font-bold text-white">€{booking.total_amount}</div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <>
        <div className="min-h-screen bg-[#212121] flex items-center justify-center pb-24">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#FF4646] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading your home...</p>
          </div>
        </div>
        <HostBottomNav />
      </>
    );
  }

  const bookingGroups = getBookingGroups();
  const activeGroupData = bookingGroups.find(group => 
    group.title.toLowerCase().replace(' ', '-') === activeGroup
  );

  return (
    <>
      <div className="min-h-screen bg-[#212121] pb-24">
        <div className="max-w-md mx-auto px-4 pt-6">

          {/* Fleet Status Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {/* Active Rentals */}
            <div className="relative backdrop-blur-xl bg-gradient-to-br from-gray-800/20 via-gray-900/10 to-transparent border border-gray-600/20 rounded-2xl p-4 shadow-lg hover:border-gray-500/30 transition-all">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  {bookings.filter(b => b.status === 'active').length}
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Active</div>
              </div>
            </div>

            {/* Available Cars */}
            <div className="relative backdrop-blur-xl bg-gradient-to-br from-gray-800/20 via-gray-900/10 to-transparent border border-gray-600/20 rounded-2xl p-4 shadow-lg hover:border-gray-500/30 transition-all">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">4</div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Available</div>
              </div>
            </div>

            {/* Cleaning Status */}
            <div className="relative backdrop-blur-xl bg-gradient-to-br from-gray-800/20 via-gray-900/10 to-transparent border border-gray-600/20 rounded-2xl p-4 shadow-lg hover:border-gray-500/30 transition-all">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">1</div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Cleaning</div>
              </div>
            </div>

            {/* Today's Activity */}
            <div className="relative backdrop-blur-xl bg-gradient-to-br from-gray-800/20 via-gray-900/10 to-transparent border border-gray-600/20 rounded-2xl p-4 shadow-lg hover:border-gray-500/30 transition-all">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  {bookings.filter(b => {
                    const today = new Date();
                    const startDate = new Date(b.start_date);
                    const endDate = new Date(b.end_date);
                    return (startDate.toDateString() === today.toDateString() || 
                            endDate.toDateString() === today.toDateString()) && 
                           ['confirmed', 'active'].includes(b.status);
                  }).length}
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Today</div>
              </div>
            </div>
          </div>

          {/* Smart Category Tabs with Sliding Animation */}
          <div className="relative mb-6 backdrop-blur-xl bg-gradient-to-r from-gray-900/30 via-gray-800/20 to-gray-900/30 border border-gray-700/30 rounded-2xl p-1 shadow-lg">
            {/* Sliding Background Indicator */}
            <div 
              className="absolute top-1 bottom-1 bg-gradient-to-r from-[#FF4646] to-[#FF4646]/80 rounded-xl shadow-lg transition-all duration-300 ease-out"
              style={{
                width: `${100 / bookingGroups.length}%`,
                left: `${(bookingGroups.findIndex(group => group.title.toLowerCase().replace(' ', '-') === activeGroup) * 100) / bookingGroups.length}%`,
              }}
            />
            
            {/* Tab Buttons */}
            <div className="relative flex">
              {bookingGroups.map((group) => {
                const tabId = group.title.toLowerCase().replace(' ', '-') as typeof activeGroup;
                const isActive = activeGroup === tabId;
                const count = group.bookings.length;
                
                return (
                  <button
                    key={tabId}
                    onClick={() => setActiveGroup(tabId)}
                    className={`flex-1 py-3 px-3 text-center rounded-xl transition-all duration-300 font-medium text-sm relative z-10 ${
                      isActive
                        ? 'text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{group.title}</span>
                    {count > 0 && (
                      <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                        isActive 
                          ? 'bg-white/20 text-white' 
                          : group.priority === 'urgent' 
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-gray-600/50 text-gray-300'
                      }`}>
                        {count}
                      </span>
                    )}
                    {group.priority === 'urgent' && count > 0 && !isActive && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4">
            {activeGroupData?.bookings.length === 0 ? (
              <div className="text-center py-16">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                  activeGroup === 'requests' 
                    ? 'bg-green-900/50' 
                    : 'bg-gray-700'
                }`}>
                  {activeGroup === 'requests' ? (
                    <CheckCircle className="h-8 w-8 text-green-400" />
                  ) : (
                    <Calendar className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {activeGroup === 'requests' 
                    ? 'All caught up!' 
                    : activeGroup === 'bookings'
                      ? 'No bookings'
                      : 'No upcoming trips'
                  }
                </h3>
                <p className="text-gray-400 max-w-xs mx-auto">
                  {activeGroupData?.description}
                </p>
              </div>
            ) : (
              activeGroupData?.bookings.map((booking) => (
                <div key={booking.id}>
                  {activeGroup === 'requests' ? (
                    <QuickActionCard booking={booking} />
                  ) : (
                    <RegularBookingCard booking={booking} />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <HostBottomNav />
    </>
  );
} 