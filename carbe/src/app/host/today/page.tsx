'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useBooking } from '@/hooks/booking/useBooking';
import { format, isToday, startOfToday, endOfToday } from 'date-fns';
import HostBottomNav from '@/components/layout/HostBottomNav';
import HostBookingCard from '@/components/booking/HostBookingCard';
import { 
  CalendarDays, 
  Car, 
  Clock, 
  Euro,
  TrendingUp,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { BookingWithCar } from '@/types/booking';

export default function HostTodayPage() {
  const { user, isHostMode } = useAuth();
  const { getHostBookings, isLoading } = useBooking();
  
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'upcoming'>('active');
  const [bookings, setBookings] = useState<BookingWithCar[]>([]);
  const [stats, setStats] = useState({
    todayEarnings: 0,
    thisWeekBookings: 0,
    pendingApprovals: 0,
    thisMonthEarnings: 0,
  });

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
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const thisMonthBookings = allBookings.filter(booking => 
      new Date(booking.created_at) >= startOfMonth && 
      ['confirmed', 'completed'].includes(booking.status)
    );

    const thisWeekBookings = allBookings.filter(booking => 
      new Date(booking.start_date) >= startOfWeek && 
      ['confirmed', 'completed'].includes(booking.status)
    );

    const todayBookings = allBookings.filter(booking =>
      isToday(new Date(booking.start_date)) && 
      ['confirmed', 'completed'].includes(booking.status)
    );

    const pendingBookings = allBookings.filter(booking => 
      booking.status === 'awaiting_approval' || booking.status === 'pending'
    );

    setStats({
      todayEarnings: todayBookings.reduce((sum, booking) => sum + booking.total_amount, 0),
      thisWeekBookings: thisWeekBookings.length,
      pendingApprovals: pendingBookings.length,
      thisMonthEarnings: thisMonthBookings.reduce((sum, booking) => sum + booking.total_amount, 0),
    });
  };

  const getTodaysBookings = () => {
    const today = startOfToday();
    const endToday = endOfToday();
    
    return bookings.filter(booking => {
      const startDate = new Date(booking.start_date);
      const endDate = new Date(booking.end_date);
      
      // Include bookings that start today, end today, or are ongoing today
      return (
        (startDate >= today && startDate <= endToday) ||
        (endDate >= today && endDate <= endToday) ||
        (startDate <= today && endDate >= endToday)
      );
    }).sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
  };

  const getUpcomingBookings = () => {
    const today = new Date();
    
    return bookings.filter(booking => {
      const startDate = new Date(booking.start_date);
      return startDate > today && ['confirmed', 'awaiting_approval'].includes(booking.status);
    }).sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
      .slice(0, 10); // Limit to next 10 bookings
  };

  const getPendingApprovals = () => {
    return bookings.filter(booking => 
      booking.status === 'awaiting_approval' || booking.status === 'pending'
    ).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  };

  const StatCard = ({ icon: Icon, value, subtitle, trend }: {
    icon: React.ComponentType<{ className?: string }>;
    value: string | number;
    subtitle: string;
    trend?: 'up' | 'down' | 'neutral';
  }) => (
    <div className="bg-[#2A2A2A] border border-gray-700/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-[#FF4646]/10 to-[#FF4646]/20 rounded-xl flex items-center justify-center">
          <Icon className="h-6 w-6 text-[#FF4646]" />
        </div>
        {trend && (
          <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            trend === 'up' ? 'bg-green-900/50 text-green-400' : 
            trend === 'down' ? 'bg-red-900/50 text-red-400' : 
            'bg-gray-800/50 text-gray-400'
          }`}>
            <TrendingUp className="h-3 w-3 mr-1" />
            {trend === 'up' ? '+12%' : trend === 'down' ? '-5%' : '±0%'}
          </div>
        )}
      </div>
      <div className="space-y-1">
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-sm text-gray-400">{subtitle}</div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <>
        <div className="min-h-screen bg-[#212121] flex items-center justify-center pb-24">
          <div className="text-center">
            <Loader2 className="h-8 w-8 text-[#FF4646] animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading your dashboard...</p>
          </div>
        </div>
        <HostBottomNav />
      </>
    );
  }

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'active':
        const todaysBookings = getTodaysBookings();
        return (
          <div className="space-y-4">
            {todaysBookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CalendarDays className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No active bookings</h3>
                <p className="text-gray-400 max-w-xs mx-auto">
                  No bookings happening today. Check pending approvals or upcoming reservations.
                </p>
              </div>
            ) : (
              todaysBookings.map((booking) => (
                <HostBookingCard 
                  key={booking.id} 
                  booking={booking} 
                  onStatusChange={loadHostData}
                  compact={false}
                />
              ))
            )}
          </div>
        );

      case 'pending':
        const pendingApprovals = getPendingApprovals();
        return (
          <div className="space-y-4">
            {pendingApprovals.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="h-8 w-8 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">All caught up!</h3>
                <p className="text-gray-400 max-w-xs mx-auto">
                  No pending booking requests at this time.
                </p>
              </div>
            ) : (
              pendingApprovals.map((booking) => (
                <HostBookingCard 
                  key={booking.id} 
                  booking={booking} 
                  onStatusChange={loadHostData}
                  compact={false}
                />
              ))
            )}
          </div>
        );

      case 'upcoming':
        const upcomingBookings = getUpcomingBookings();
        return (
          <div className="space-y-4">
            {upcomingBookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Car className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No upcoming bookings</h3>
                <p className="text-gray-400 max-w-xs mx-auto">
                  Your cars are available for new bookings.
                </p>
              </div>
            ) : (
              upcomingBookings.map((booking) => (
                <HostBookingCard 
                  key={booking.id} 
                  booking={booking} 
                  onStatusChange={loadHostData}
                  compact={true}
                />
              ))
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#212121] pb-24">
        {/* Header */}
        <div className="bg-[#2A2A2A] border-b border-gray-700/50 px-4 py-6">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-white">Host Dashboard</h1>
              <div className="text-right">
                <div className="text-sm text-gray-400">Today</div>
                <div className="text-lg font-bold text-white">{format(new Date(), 'MMM d')}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 py-6">
          {/* Stats Grid */}
                     <div className="grid grid-cols-2 gap-4 mb-8">
             <StatCard
               icon={Euro}
               value={`€${stats.todayEarnings}`}
               subtitle="From confirmed bookings"
               trend="up"
             />
             <StatCard
               icon={CalendarDays}
               value={stats.thisWeekBookings}
               subtitle="Bookings confirmed"
               trend="up"
             />
             <StatCard
               icon={AlertCircle}
               value={stats.pendingApprovals}
               subtitle="Need your review"
               trend="neutral"
             />
             <StatCard
               icon={TrendingUp}
               value={`€${stats.thisMonthEarnings}`}
               subtitle="This month&apos;s total"
               trend="up"
             />
           </div>

          {/* Tabs */}
          <div className="flex mb-6 bg-[#1A1A1A] rounded-xl p-1">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex-1 py-3 px-4 text-center rounded-lg transition-all duration-200 font-medium text-sm ${
                activeTab === 'active'
                  ? 'bg-[#FF4646] text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Active ({getTodaysBookings().length})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 py-3 px-4 text-center rounded-lg transition-all duration-200 font-medium text-sm relative ${
                activeTab === 'pending'
                  ? 'bg-[#FF4646] text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Pending ({stats.pendingApprovals})
              {stats.pendingApprovals > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex-1 py-3 px-4 text-center rounded-lg transition-all duration-200 font-medium text-sm ${
                activeTab === 'upcoming'
                  ? 'bg-[#FF4646] text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Upcoming ({getUpcomingBookings().length})
            </button>
          </div>

          {/* Content */}
          {renderActiveTabContent()}
        </div>
      </div>
      <HostBottomNav />
    </>
  );
} 