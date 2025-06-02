'use client';

import React, { useState, useCallback, useEffect } from 'react';
import CalendarHeader from './CalendarHeader';
import CalendarTabs from './CalendarTabs';
import AvailabilityGrid from './AvailabilityGrid';
import PricingGrid from './PricingGrid';
import { useCalendarData } from '@/hooks/useCalendarData';
import { CalendarFilters, BulkOperation, Vehicle } from '@/types/calendar';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';

export default function HostCalendarPage() {
  // Core state
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filters, setFilters] = useState<CalendarFilters>({
    selectedCarIds: [],
    displayMonth: format(new Date(), 'yyyy-MM'),
    activeTab: 'availability'
  });

  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [isDragSelecting, setIsDragSelecting] = useState(false);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);

  // Fetch user's vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setIsLoadingVehicles(true);
        console.log('Fetching vehicles from /api/host/vehicles');
        
        // Get the current session to send the access token
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Current session:', session ? 'exists' : 'missing');
        
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        
        // Add authorization header if we have a session
        if (session?.access_token) {
          headers.Authorization = `Bearer ${session.access_token}`;
          console.log('Adding auth header with token');
        }
        
        const response = await fetch('/api/host/vehicles', { headers });
        console.log('Vehicles API response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Vehicles API response data:', data);
          const userVehicles = data.cars || [];
          setVehicles(userVehicles);
          setFilters(prev => ({
            ...prev,
            selectedCarIds: userVehicles.map((v: Vehicle) => v.id)
          }));
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          console.error('Failed to fetch vehicles - Status:', response.status, 'Error:', errorData);
          
          // More specific error handling
          if (response.status === 401) {
            console.error('Authentication error - user not logged in or session expired');
          } else if (response.status === 500) {
            console.error('Server error:', errorData.details || errorData.error);
          }
          
          // Fallback to empty array
          setVehicles([]);
        }
      } catch (error) {
        console.error('Network error fetching vehicles:', error);
        setVehicles([]);
      } finally {
        setIsLoadingVehicles(false);
      }
    };

    fetchVehicles();
  }, []);

  // Data hook
  const {
    data: calendarData,
    loading,
    error,
    metrics,
    updateAvailability,
    updatePricing,
    bulkUpdate,
    refreshData
  } = useCalendarData(filters.displayMonth, filters.selectedCarIds);

  // Event handlers
  const handleMonthChange = useCallback((direction: 'prev' | 'next') => {
    const currentDate = new Date(filters.displayMonth + '-01');
    const newDate = direction === 'next' 
      ? new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
      : new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    
    setFilters(prev => ({
      ...prev,
      displayMonth: format(newDate, 'yyyy-MM')
    }));
    setSelectedDates([]);
  }, [filters.displayMonth]);

  const handleVehicleChange = useCallback((vehicleIds: string[]) => {
    setFilters(prev => ({
      ...prev,
      selectedCarIds: vehicleIds
    }));
    setSelectedDates([]);
  }, []);

  const handleTabChange = useCallback((tab: 'availability' | 'pricing') => {
    setFilters(prev => ({
      ...prev,
      activeTab: tab
    }));
    setSelectedDates([]);
  }, []);

  const handleDateClick = useCallback((date: string) => {
    if (!isDragSelecting) {
      setSelectedDates(prev => 
        prev.includes(date) 
          ? prev.filter(d => d !== date)
          : [...prev, date]
      );
    }
  }, [isDragSelecting]);

  const handleDragStart = useCallback((date: string) => {
    setIsDragSelecting(true);
    setSelectedDates([date]);
  }, []);

  const handleDragEnter = useCallback((date: string) => {
    if (isDragSelecting) {
      setSelectedDates(prev => 
        prev.includes(date) ? prev : [...prev, date]
      );
    }
  }, [isDragSelecting]);

  const handleDragEnd = useCallback(() => {
    setIsDragSelecting(false);
  }, []);

  const handleBulkOperation = useCallback(async (operation: BulkOperation) => {
    try {
      await bulkUpdate(operation);
      setSelectedDates([]);
      await refreshData();
    } catch (error) {
      console.error('Bulk operation failed:', error);
    }
  }, [bulkUpdate, refreshData]);

  const handleClearSelection = useCallback(() => {
    setSelectedDates([]);
  }, []);

  if (isLoadingVehicles) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF2800] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading vehicles...</p>
        </div>
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-8 max-w-md">
            <h3 className="text-white font-semibold mb-2">No Vehicles Found</h3>
            <p className="text-gray-400 text-sm mb-4">
              You need to add vehicles to your garage before you can manage your calendar.
            </p>
            <button
              onClick={() => window.location.href = '/host/garage/new'}
              className="px-4 py-2 bg-[#FF2800] text-white rounded-lg hover:bg-[#FF2800]/90 transition-colors"
            >
              Add Your First Vehicle
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF2800] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading calendar...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-6 max-w-md">
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
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-6">
      {/* Header */}
      <CalendarHeader
        displayMonth={filters.displayMonth}
        vehicles={vehicles}
        selectedCarIds={filters.selectedCarIds}
        metrics={metrics}
        selectedDatesCount={selectedDates.length}
        onMonthChange={handleMonthChange}
        onVehicleChange={handleVehicleChange}
        onClearSelection={handleClearSelection}
      />

      {/* Tabs */}
      <CalendarTabs
        activeTab={filters.activeTab}
        onTabChange={handleTabChange}
      />

      {/* Grid Content */}
      <div className="mt-6">
        {filters.activeTab === 'availability' ? (
          <AvailabilityGrid
            displayMonth={filters.displayMonth}
            selectedCarIds={filters.selectedCarIds}
            calendarData={calendarData}
            selectedDates={selectedDates}
            isDragSelecting={isDragSelecting}
            onDateClick={handleDateClick}
            onDragStart={handleDragStart}
            onDragEnter={handleDragEnter}
            onDragEnd={handleDragEnd}
            onBulkOperation={handleBulkOperation}
            onUpdateAvailability={updateAvailability}
          />
        ) : (
          <PricingGrid
            displayMonth={filters.displayMonth}
            selectedCarIds={filters.selectedCarIds}
            calendarData={calendarData}
            selectedDates={selectedDates}
            isDragSelecting={isDragSelecting}
            onDateClick={handleDateClick}
            onDragStart={handleDragStart}
            onDragEnter={handleDragEnter}
            onDragEnd={handleDragEnd}
            onBulkOperation={handleBulkOperation}
            onUpdatePricing={updatePricing}
          />
        )}
      </div>
    </div>
  );
} 