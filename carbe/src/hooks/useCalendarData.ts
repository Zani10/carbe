import { useState, useEffect, useCallback } from 'react';
import { CalendarData, DateCellData } from '@/types/calendar';
import { formatDateToString, isWeekendDay, calculateWeekendMarkup } from '@/lib/calendar/dateUtils';
import { getMockCalendarData } from '@/lib/calendar/mockData';

interface UseCalendarDataReturn {
  calendarData: CalendarData | null;
  loading: boolean;
  error: string | null;
  selectedDates: Date[];
  bulkMode: boolean;
  refreshData: () => Promise<void>;
  toggleDateSelection: (date: Date) => void;
  setBulkMode: (enabled: boolean) => void;
  clearSelection: () => void;
  updateAvailability: (dates: string[], status: 'available' | 'blocked', carId: string) => Promise<void>;
  updatePricing: (date: string, price: number, carId: string, isWeekendOverride?: boolean) => Promise<void>;
  bulkUpdatePricing: (dates: string[], price: number, carId: string) => Promise<void>;
  getDateCellData: (date: Date, carId: string) => DateCellData;
}

export const useCalendarData = (carId: string | 'all', month: Date): UseCalendarDataReturn => {
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [bulkMode, setBulkMode] = useState(false);

  const fetchCalendarData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For demo purposes, use mock data
      // TODO: Replace with actual API call once database is set up
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      const data: CalendarData = getMockCalendarData(month);
      setCalendarData(data);
      
      /* Uncomment when ready to use real API:
      const monthString = month.toISOString().substring(0, 7); // YYYY-MM
      const params = new URLSearchParams({
        month: monthString,
        ...(carId !== 'all' && { carId })
      });
      
      const response = await fetch(`/api/host/calendar?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch calendar data');
      }
      
      const data: CalendarData = await response.json();
      setCalendarData(data);
      */
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [carId, month]);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  const toggleDateSelection = useCallback((date: Date) => {
    if (!bulkMode) return;
    
    setSelectedDates(prev => {
      const isSelected = prev.some(d => d.getTime() === date.getTime());
      if (isSelected) {
        return prev.filter(d => d.getTime() !== date.getTime());
      } else {
        return [...prev, date];
      }
    });
  }, [bulkMode]);

  const clearSelection = useCallback(() => {
    setSelectedDates([]);
  }, []);

  const updateAvailability = useCallback(async (dates: string[], status: 'available' | 'blocked', targetCarId: string) => {
    try {
      const response = await fetch('/api/host/calendar/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carId: targetCarId, dates, status })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update availability');
      }
      
      await fetchCalendarData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update availability');
    }
  }, [fetchCalendarData]);

  const updatePricing = useCallback(async (date: string, price: number, targetCarId: string, isWeekendOverride = false) => {
    try {
      const response = await fetch('/api/host/calendar/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carId: targetCarId, date, priceOverride: price, isWeekendOverride })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update pricing');
      }
      
      await fetchCalendarData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update pricing');
    }
  }, [fetchCalendarData]);

  const bulkUpdatePricing = useCallback(async (dates: string[], price: number, targetCarId: string) => {
    try {
      const response = await fetch('/api/host/calendar/pricing/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carId: targetCarId, dates, priceOverride: price })
      });
      
      if (!response.ok) {
        throw new Error('Failed to bulk update pricing');
      }
      
      await fetchCalendarData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to bulk update pricing');
    }
  }, [fetchCalendarData]);

  const getDateCellData = useCallback((date: Date, targetCarId: string): DateCellData => {
    if (!calendarData) {
      return {
        date,
        status: 'available',
        price: 85, // default
        hasOverride: false,
        isWeekend: isWeekendDay(date),
        booking: undefined
      };
    }

    const dateString = formatDateToString(date);
    
    // Find availability
    const availability = calendarData.availability.find(
      a => a.date === dateString && (targetCarId === 'all' || a.car_id === targetCarId)
    );
    
    // Find pricing override
    const pricingOverride = calendarData.pricingOverrides.find(
      p => p.date === dateString && (targetCarId === 'all' || p.car_id === targetCarId)
    );
    
    // Find booking
    const booking = calendarData.bookings.find(
      b => b.car_id === targetCarId && 
      new Date(b.start_date) <= date && 
      new Date(b.end_date) >= date
    );
    
    const isWeekend = isWeekendDay(date);
    let price = calendarData.basePrice;
    
    if (pricingOverride) {
      price = pricingOverride.price_override;
    } else if (isWeekend) {
      price = calculateWeekendMarkup(calendarData.basePrice);
    }
    
    return {
      date,
      status: availability?.status || (booking ? 'booked' : 'available'),
      price,
      hasOverride: !!pricingOverride,
      isWeekend,
      booking
    };
  }, [calendarData]);

  return {
    calendarData,
    loading,
    error,
    selectedDates,
    bulkMode,
    refreshData: fetchCalendarData,
    toggleDateSelection,
    setBulkMode,
    clearSelection,
    updateAvailability,
    updatePricing,
    bulkUpdatePricing,
    getDateCellData
  };
}; 