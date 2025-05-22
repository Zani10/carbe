'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ChevronLeft, ChevronRight, Users } from 'lucide-react';

// Mock data for demo purposes
const bookingData = {
  '2023-12-05': { status: 'booked', renter: 'John S.', price: 80 },
  '2023-12-06': { status: 'booked', renter: 'John S.', price: 80 },
  '2023-12-07': { status: 'booked', renter: 'John S.', price: 80 },
  '2023-12-12': { status: 'booked', renter: 'Emily J.', price: 80 },
  '2023-12-13': { status: 'booked', renter: 'Emily J.', price: 80 },
  '2023-12-14': { status: 'booked', renter: 'Emily J.', price: 80 },
  '2023-12-15': { status: 'booked', renter: 'Emily J.', price: 80 },
  '2023-12-25': { status: 'unavailable', renter: null, price: 0 },
  '2023-12-26': { status: 'unavailable', renter: null, price: 0 },
};

export default function HostCalendarPage() {
  const { user, isHostMode } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [basePrice, setBasePrice] = useState(80);
  
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
  
  // Helper functions to generate calendar
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };
  
  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };
  
  const getDateString = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };
  
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  // Generate calendar days
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  
  const renderCalendarDays = () => {
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Add day headers
    dayNames.forEach(day => {
      days.push(
        <div key={`header-${day}`} className="text-center py-2 font-medium text-sm text-gray-500">
          {day}
        </div>
      );
    });
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="border border-gray-100 h-32 bg-gray-50"></div>
      );
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = getDateString(year, month, day);
      const booking = bookingData[date];
      const isBooked = booking && booking.status === 'booked';
      const isUnavailable = booking && booking.status === 'unavailable';
      
      days.push(
        <div 
          key={`day-${day}`} 
          className={`border border-gray-100 h-32 p-2 relative ${
            isUnavailable ? 'bg-gray-100' : 'bg-white'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className={`text-sm font-medium ${isBooked ? 'text-white' : 'text-gray-700'}`}>
              {day}
            </span>
            <span className="text-sm font-medium text-gray-500">
              €{booking ? booking.price : basePrice}
            </span>
          </div>
          
          {isBooked && (
            <div className="absolute inset-0 mt-6 bg-red-500 bg-opacity-90 p-2">
              <div className="flex items-center mb-1">
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                  <Users size={12} className="text-red-500" />
                </div>
                <span className="ml-1 text-xs font-medium text-white">{booking.renter}</span>
              </div>
              <div className="text-xs text-white opacity-80">Booked</div>
            </div>
          )}
          
          {isUnavailable && (
            <div className="mt-2 text-xs text-gray-500 font-medium">
              Unavailable
            </div>
          )}
        </div>
      );
    }
    
    return days;
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800">Calendar</h1>
        </div>
      </header>
      
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Calendar header */}
        <div className="bg-white rounded-t-xl shadow-sm p-4 flex justify-between items-center">
          <button
            onClick={prevMonth}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft size={20} />
          </button>
          
          <h2 className="text-lg font-semibold">
            {formatMonthYear(currentMonth)}
          </h2>
          
          <button
            onClick={nextMonth}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        
        {/* Calendar grid */}
        <div className="bg-white rounded-b-xl shadow-sm p-4 mb-6">
          <div className="grid grid-cols-7 gap-1">
            {renderCalendarDays()}
          </div>
        </div>
        
        {/* Pricing settings */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Pricing Settings</h2>
          
          <div className="mb-4">
            <label htmlFor="basePrice" className="block text-sm font-medium text-gray-700 mb-1">
              Base price per day (€)
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="number"
                name="basePrice"
                id="basePrice"
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-red-500 focus:border-red-500"
                placeholder="0"
              />
              <span className="inline-flex items-center px-3 py-2 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500">
                EUR
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              This price will be applied to all days unless overridden.
            </p>
          </div>
          
          <div className="flex space-x-4">
            <button
              className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Set Weekend Pricing
            </button>
            
            <button
              className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Block Dates
            </button>
            
            <button
              className="px-4 py-2 bg-red-500 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 