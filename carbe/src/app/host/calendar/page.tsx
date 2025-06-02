'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import HostBottomNav from '@/components/layout/HostBottomNav';
import CalendarHeader from '@/components/hostCalendar/CalendarHeader';
import MonthGrid from '@/components/hostCalendar/MonthGrid';
import PriceOverridePopover from '@/components/hostCalendar/PriceOverridePopover';
import BulkActionsModal from '@/components/hostCalendar/BulkActionsModal';
import BookingRequestSheet from '@/components/hostCalendar/BookingRequestSheet';
import { useCalendarData } from '@/hooks/useCalendarData';
import { formatDateToString } from '@/lib/calendar/dateUtils';
import { CalendarBooking, DateCellData } from '@/types/calendar';
import { Loader2, Calendar as CalendarIcon, Euro, Bell } from 'lucide-react';

export default function HostCalendarPage() {
  const { user, isHostMode } = useAuth();
  const router = useRouter();
  
  // State
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedCarId, setSelectedCarId] = useState<string>('all');
  const [selectedDateCell, setSelectedDateCell] = useState<DateCellData | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<CalendarBooking | null>(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'availability' | 'pricing'>('availability');
  const [mockVehicles] = useState([
    { id: '1', name: 'Tesla Model 3', make: 'Tesla', model: 'Model 3' },
    { id: '2', name: 'BMW X5', make: 'BMW', model: 'X5' }
  ]);

  // Calendar data hook
  const {
    calendarData,
    loading,
    error,
    selectedDates,
    bulkMode,
    refreshData,
    toggleDateSelection,
    setBulkMode,
    clearSelection,
    updateAvailability,
    updatePricing,
    bulkUpdatePricing,
    getDateCellData
  } = useCalendarData(selectedCarId, currentMonth);

  // Check authentication
  if (!user || !isHostMode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#121212] p-4">
        <div className="bg-[#212121] p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-700/50">
          <h2 className="text-2xl font-bold text-white mb-4">Host Access Required</h2>
          <p className="text-gray-300 mb-6">
            You need to be in host mode to access the calendar.
          </p>
          <button 
            onClick={() => router.push('/profile')}
            className="inline-block px-6 py-3 bg-[#FF2800] text-white rounded-xl hover:bg-[#FF2800]/90 transition-colors"
          >
            Go to Profile
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-[#121212] flex items-center justify-center pb-24">
          <div className="text-center">
            <Loader2 className="h-8 w-8 text-[#FF2800] animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading calendar...</p>
          </div>
        </div>
        <HostBottomNav />
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="min-h-screen bg-[#121212] flex items-center justify-center pb-24">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-6">
              <h3 className="text-red-300 font-semibold mb-2">Error Loading Calendar</h3>
              <p className="text-red-400 text-sm mb-4">{error}</p>
              <button
                onClick={refreshData}
                className="px-4 py-2 bg-[#FF2800] text-white rounded-lg hover:bg-[#FF2800]/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
        <HostBottomNav />
      </>
    );
  }

  // Event handlers
  const handleDateClick = (date: Date) => {
    const cellData = getDateCellData(date, selectedCarId);
    
    if (bulkMode) {
      toggleDateSelection(date);
      return;
    }
    
    if (cellData.status === 'pending' && cellData.booking) {
      setSelectedBooking(cellData.booking);
    } else if (cellData.status !== 'booked') {
      if (activeTab === 'pricing') {
        setSelectedDateCell(cellData);
      } else {
        // Availability mode - toggle availability
        const newStatus = cellData.status === 'available' ? 'blocked' : 'available';
        updateAvailability([formatDateToString(date)], newStatus, selectedCarId);
      }
    }
  };

  const handlePriceOverrideSave = async (price: number, isWeekendOverride: boolean) => {
    if (!selectedDateCell) return;
    
    try {
      await updatePricing(
        formatDateToString(selectedDateCell.date),
        price,
        selectedCarId,
        isWeekendOverride
      );
      setSelectedDateCell(null);
    } catch (error) {
      console.error('Failed to update pricing:', error);
    }
  };

  const handleBookingApprove = async (bookingId: string, message?: string) => {
    try {
      const response = await fetch('/api/bookings/host-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId, action: 'approve', message })
      });
      
      if (!response.ok) throw new Error('Failed to approve booking');
      
      await refreshData();
      setSelectedBooking(null);
    } catch (error) {
      console.error('Failed to approve booking:', error);
    }
  };

  const handleBookingDecline = async (bookingId: string, message?: string) => {
    try {
      const response = await fetch('/api/bookings/host-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId, action: 'reject', message })
      });
      
      if (!response.ok) throw new Error('Failed to decline booking');
      
      await refreshData();
      setSelectedBooking(null);
    } catch (error) {
      console.error('Failed to decline booking:', error);
    }
  };

  const handleBulkModeToggle = () => {
    setBulkMode(!bulkMode);
    if (bulkMode) {
      clearSelection();
    }
  };

  const handleBulkAction = () => {
    if (selectedDates.length > 0) {
      setShowBulkModal(true);
    }
  };

  // Calculate metrics
  const pendingRequestsCount = calendarData?.bookings.filter(b => b.status === 'pending').length || 0;
  const monthlyRevenue = calendarData?.bookings
    .filter(b => b.status === 'confirmed' || b.status === 'completed')
    .reduce((total, booking) => total + booking.total_amount, 0) || 0;

  return (
    <>
      <div className="min-h-screen bg-[#121212] pb-24">
        <div className="px-4 py-4">
          {/* Pending Requests Banner */}
          {pendingRequestsCount > 0 && (
            <div className="mb-4 bg-gradient-to-r from-[#FF8C00]/15 to-[#FFB347]/15 border border-[#FF8C00]/30 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bell className="h-5 w-5 text-[#FF8C00] mr-3" />
                  <div>
                    <p className="text-white font-semibold text-sm">
                      {pendingRequestsCount} new booking request{pendingRequestsCount > 1 ? 's' : ''}
                    </p>
                    <p className="text-[#FF8C00] text-xs">Respond quickly to maintain your rating</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-[#FF8C00] text-white rounded-lg text-sm font-medium">
                  View
                </button>
              </div>
            </div>
          )}

          {/* Header with minimal stats */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-white">Calendar</h1>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center text-gray-300">
                  <Euro className="h-4 w-4 mr-1" />
                  <span className="font-semibold">€{monthlyRevenue.toLocaleString()}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  <span className="font-semibold">{calendarData?.bookings.length || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar Header */}
          <CalendarHeader
            month={currentMonth}
            selectedCarId={selectedCarId}
            vehicles={mockVehicles}
            bulkMode={bulkMode}
            selectedDatesCount={selectedDates.length}
            pendingRequestsCount={0} // Hide from header since we show banner above
            onMonthChange={setCurrentMonth}
            onCarChange={setSelectedCarId}
            onBulkModeToggle={handleBulkModeToggle}
            onClearSelection={clearSelection}
            onSettingsClick={() => {}}
          />

          {/* Availability/Pricing Tabs */}
          <div className="mb-6">
            <div className="flex border-b border-gray-700">
              <button
                onClick={() => setActiveTab('availability')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'availability'
                    ? 'border-[#FF2800] text-white'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Availability
              </button>
              <button
                onClick={() => setActiveTab('pricing')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'pricing'
                    ? 'border-[#FF2800] text-white'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Pricing
              </button>
            </div>
            
            {/* Tab Help Text */}
            <div className="mt-2 px-4">
              <p className="text-xs text-gray-500">
                {activeTab === 'availability' 
                  ? 'Tap dates to block/unblock availability'
                  : 'Tap dates to set custom pricing'
                }
              </p>
            </div>
          </div>

          {/* Calendar Grid */}
          <MonthGrid
            month={currentMonth}
            selectedCarId={selectedCarId}
            selectedDates={selectedDates}
            bulkMode={bulkMode}
            getDateCellData={getDateCellData}
            onDateClick={handleDateClick}
          />

          {/* Bulk Actions Button */}
          {bulkMode && selectedDates.length > 0 && (
            <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50">
              <button
                onClick={handleBulkAction}
                className="px-6 py-3 bg-[#FF2800] text-white rounded-full shadow-lg font-medium"
              >
                Edit {selectedDates.length} Date{selectedDates.length > 1 ? 's' : ''}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedDateCell && activeTab === 'pricing' && (
        <PriceOverridePopover
          cellData={selectedDateCell}
          basePrice={calendarData?.basePrice || 85}
          onSave={handlePriceOverrideSave}
          onClose={() => setSelectedDateCell(null)}
        />
      )}

      {showBulkModal && (
        <BulkActionsModal
          selectedDates={selectedDates}
          selectedCarId={selectedCarId}
          basePrice={calendarData?.basePrice || 85}
          onAvailabilityUpdate={updateAvailability}
          onPricingUpdate={bulkUpdatePricing}
          onClose={() => setShowBulkModal(false)}
        />
      )}

      {selectedBooking && (
        <BookingRequestSheet
          booking={selectedBooking}
          onApprove={handleBookingApprove}
          onDecline={handleBookingDecline}
          onClose={() => setSelectedBooking(null)}
        />
      )}

      <HostBottomNav />
    </>
  );
} 