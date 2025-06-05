'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useBooking } from '@/hooks/booking/useBooking';
import { format, isToday, startOfToday, endOfToday, isWithinInterval, addDays } from 'date-fns';
import HostBottomNav from '@/components/layout/HostBottomNav';
import { 
  Euro,
  AlertCircle,
  Clock,
  CheckCircle,
  X,
  Check,
  ChevronRight,
  MessageCircle,
  Calendar,
  Car,
  MapPin
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

export default function HostTodayPage() {
  const { user, isHostMode } = useAuth();
  const { getHostBookings, isLoading } = useBooking();
  const { approveBooking } = useBookingActions();
  
  const [bookings, setBookings] = useState<BookingWithCar[]>([]);
  const [stats, setStats] = useState<QuickStats>({
    monthlyEarnings: 0,
    pendingActions: 0,
  });
  const [activeGroup, setActiveGroup] = useState<'needs-action' | 'today' | 'this-week'>('needs-action');
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
        title: 'Needs Action',
        description: 'Requests awaiting your response',
        bookings: needsAction,
        priority: 'urgent'
      },
      {
        title: 'Today',
        description: 'Active and starting today',
        bookings: todayBookings,
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
      <div className="bg-gradient-to-br from-[#2A2A2A] to-[#242424] border border-amber-500/30 rounded-3xl p-6 space-y-5">
        {/* Header with urgency indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse" />
              <div className="absolute inset-0 w-3 h-3 bg-amber-400 rounded-full animate-ping opacity-40" />
            </div>
            <span className="text-amber-400 font-medium text-sm">AWAITING YOUR RESPONSE</span>
          </div>
          <div className="text-2xl font-bold text-white">€{booking.total_amount}</div>
        </div>

        {/* Car and Trip Info */}
        <div className="flex items-center space-x-4">
          <div className="w-20 h-14 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden">
            {booking.cars.images && booking.cars.images.length > 0 ? (
              <Image
                src={booking.cars.images[0]}
                alt={`${booking.cars.make} ${booking.cars.model}`}
                width={80}
                height={56}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Car className="h-6 w-6 text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-white text-lg">
              {booking.cars.make} {booking.cars.model}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(booking.start_date), 'MMM d')} - {format(new Date(booking.end_date), 'MMM d')}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{format(new Date(booking.created_at), 'HH:mm')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={() => handleQuickAction(booking.id, 'decline')}
            disabled={!!processing}
            className="flex-1 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl py-4 px-6 font-medium flex items-center justify-center space-x-2 hover:bg-red-500/20 transition-all disabled:opacity-50"
          >
            {processing === 'decline' ? (
              <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <X className="h-5 w-5" />
                <span>Decline</span>
              </>
            )}
          </button>
          
          <button
            onClick={() => handleQuickAction(booking.id, 'approve')}
            disabled={!!processing}
            className="flex-1 bg-green-500/10 border border-green-500/30 text-green-400 rounded-2xl py-4 px-6 font-medium flex items-center justify-center space-x-2 hover:bg-green-500/20 transition-all disabled:opacity-50"
          >
            {processing === 'approve' ? (
              <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Check className="h-5 w-5" />
                <span>Approve</span>
              </>
            )}
          </button>
        </div>

        {/* Message Button */}
        <button className="w-full bg-[#FF4646]/10 border border-[#FF4646]/30 text-[#FF4646] rounded-2xl py-3 px-6 font-medium flex items-center justify-center space-x-2 hover:bg-[#FF4646]/20 transition-all">
          <MessageCircle className="h-5 w-5" />
          <span>Message Renter</span>
        </button>
      </div>
    );
  };

  const RegularBookingCard = ({ booking }: { booking: BookingWithCar }) => {
    const getStatusConfig = () => {
      switch (booking.status) {
        case 'confirmed':
          return { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' };
        case 'active':
          return { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
        default:
          return { color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20' };
      }
    };

    const statusConfig = getStatusConfig();

    return (
      <div className="bg-gradient-to-br from-[#2A2A2A] to-[#242424] border border-gray-700/40 rounded-2xl p-5 hover:border-gray-600/60 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden">
              {booking.cars.images && booking.cars.images.length > 0 ? (
                <Image
                  src={booking.cars.images[0]}
                  alt={`${booking.cars.make} ${booking.cars.model}`}
                  width={64}
                  height={48}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Car className="h-6 w-6 text-gray-400" />
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
            <p className="text-gray-400">Loading your dashboard...</p>
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
          {/* Quick Stats - Only 2 essential ones */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-[#2A2A2A] border border-gray-700/50 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#FF4646]/10 to-[#FF4646]/20 rounded-xl flex items-center justify-center">
                  <Euro className="h-5 w-5 text-[#FF4646]" />
                </div>
                <div className="text-xs text-green-400 font-medium">+12%</div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">€{stats.monthlyEarnings}</div>
              <div className="text-sm text-gray-400">This month</div>
            </div>

            <div className="bg-[#2A2A2A] border border-gray-700/50 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500/10 to-amber-500/20 rounded-xl flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-amber-400" />
                </div>
                {stats.pendingActions > 0 && (
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                )}
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stats.pendingActions}</div>
              <div className="text-sm text-gray-400">Need action</div>
            </div>
          </div>

          {/* Smart Category Tabs */}
          <div className="flex mb-6 bg-[#1A1A1A] rounded-2xl p-1">
            {bookingGroups.map((group) => {
              const tabId = group.title.toLowerCase().replace(' ', '-') as typeof activeGroup;
              const isActive = activeGroup === tabId;
              const count = group.bookings.length;
              
              return (
                <button
                  key={tabId}
                  onClick={() => setActiveGroup(tabId)}
                  className={`flex-1 py-3 px-3 text-center rounded-xl transition-all duration-200 font-medium text-sm relative ${
                    isActive
                      ? 'bg-[#FF4646] text-white shadow-lg'
                      : 'text-gray-400 hover:text-white'
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

          {/* Content */}
          <div className="space-y-4">
            {activeGroupData?.bookings.length === 0 ? (
              <div className="text-center py-16">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                  activeGroup === 'needs-action' 
                    ? 'bg-green-900/50' 
                    : 'bg-gray-700'
                }`}>
                  {activeGroup === 'needs-action' ? (
                    <CheckCircle className="h-8 w-8 text-green-400" />
                  ) : (
                    <Calendar className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {activeGroup === 'needs-action' 
                    ? 'All caught up!' 
                    : activeGroup === 'today'
                      ? 'Nothing happening today'
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
                  {activeGroup === 'needs-action' ? (
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