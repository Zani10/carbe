'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useBooking } from '@/hooks/booking/useBooking';
import { format, isToday, startOfToday, endOfToday } from 'date-fns';
import HostBottomNav from '@/components/layout/HostBottomNav';
import { 
  CalendarDays, 
  Car, 
  Clock, 
  Users, 
  MapPin, 
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { BookingWithCar, BookingStatus } from '@/types/booking';

export default function HostTodayPage() {
  const { user, isHostMode } = useAuth();
  const { getHostBookings, isLoading } = useBooking();
  
  const [activeTab, setActiveTab] = useState('today');
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
      booking.status === 'awaiting_approval'
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

  const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'awaiting_approval':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'awaiting_approval':
        return 'Needs Approval';
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-900/50 text-green-300 border border-green-700/50';
      case 'awaiting_approval':
        return 'bg-yellow-900/50 text-yellow-300 border border-yellow-700/50';
      case 'completed':
        return 'bg-blue-900/50 text-blue-300 border border-blue-700/50';
      default:
        return 'bg-gray-900/50 text-gray-300 border border-gray-700/50';
    }
  };

  const BookingCard = ({ booking }: { booking: BookingWithCar }) => (
    <div className="border border-gray-700/50 bg-[#1F1F1F] rounded-xl p-4 hover:bg-[#252525] transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <Car className="text-gray-400 mr-2" size={18} />
          <span className="font-medium text-white">
            {booking.cars.make} {booking.cars.model} ({booking.cars.year})
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon(booking.status)}
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
            {getStatusText(booking.status)}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="flex items-center">
          <Clock size={16} className="text-gray-500 mr-2" />
          <div className="text-sm">
            <div className="text-gray-200">
              {format(new Date(booking.start_date), 'MMM d • HH:mm')}
            </div>
            <div className="text-gray-400">Pickup</div>
          </div>
        </div>
        
        <div className="flex items-center">
          <Clock size={16} className="text-gray-500 mr-2" />
          <div className="text-sm">
            <div className="text-gray-200">
              {format(new Date(booking.end_date), 'MMM d • HH:mm')}
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
          <div className="text-sm font-medium text-white">
            {booking.snapshot_first_name} {booking.snapshot_last_name}
          </div>
          <div className="text-xs text-gray-400">{booking.snapshot_email}</div>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-700/50 flex justify-between items-center">
        <div className="flex items-center text-sm text-gray-400">
          <MapPin size={16} className="mr-1" />
          {'Location not specified'}
        </div>
        <div className="font-medium text-white">€{booking.total_amount}</div>
      </div>

      {booking.special_requests && (
        <div className="mt-3 p-2 bg-gray-800/50 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Special Requests:</p>
          <p className="text-sm text-gray-300">{booking.special_requests}</p>
        </div>
      )}
    </div>
  );
  
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
            className="inline-block px-6 py-3 bg-[#FF4646] text-white rounded-xl hover:bg-[#FF4646]/90"
          >
            Go to Profile
          </a>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <>
        <div className="min-h-screen bg-[#212121] flex items-center justify-center pb-24">
          <div className="text-center">
            <Loader2 className="h-8 w-8 text-[#FF4646] animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading host dashboard...</p>
          </div>
        </div>
        <HostBottomNav />
      </>
    );
  }
  
  const todaysBookings = getTodaysBookings();
  const upcomingBookings = getUpcomingBookings();
  
  return (
    <>
      <div className="min-h-screen bg-[#212121] pb-24">
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
                    ? 'border-[#FF4646] text-[#FF4646]' 
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
                onClick={() => setActiveTab('today')}
              >
                Today ({todaysBookings.length})
              </button>
              <button
                className={`py-4 px-1 font-medium text-sm border-b-2 ${
                  activeTab === 'upcoming' 
                    ? 'border-[#FF4646] text-[#FF4646]' 
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
                onClick={() => setActiveTab('upcoming')}
              >
                Upcoming ({upcomingBookings.length})
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
              
              {todaysBookings.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarDays size={48} className="mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400">You have no bookings scheduled for today.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todaysBookings.map(booking => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              )}
            </div>
            
            <div className="bg-[#2A2A2A] border border-gray-700/50 rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Quick Stats</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#1F1F1F] border border-gray-700/50 rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-1">Today&apos;s Earnings</div>
                  <div className="text-2xl font-bold text-white">€{stats.todayEarnings}</div>
                </div>
                
                <div className="bg-[#1F1F1F] border border-gray-700/50 rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-1">This Week</div>
                  <div className="text-2xl font-bold text-white">{stats.thisWeekBookings}</div>
                  <div className="text-xs text-gray-500">bookings</div>
                </div>
                
                <div className="bg-[#1F1F1F] border border-gray-700/50 rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-1">Pending</div>
                  <div className="text-2xl font-bold text-yellow-400">{stats.pendingApprovals}</div>
                  <div className="text-xs text-gray-500">approvals</div>
                </div>
                
                <div className="bg-[#1F1F1F] border border-gray-700/50 rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-1">This Month</div>
                  <div className="text-2xl font-bold text-green-400">€{stats.thisMonthEarnings}</div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-[#2A2A2A] border border-gray-700/50 rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Upcoming Bookings</h2>
              
              {upcomingBookings.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarDays size={48} className="mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400">No upcoming bookings found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingBookings.map(booking => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
    <HostBottomNav />
    </>
  );
} 