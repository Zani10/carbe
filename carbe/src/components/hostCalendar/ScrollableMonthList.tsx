import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { CalendarData, BulkOperation } from '@/types/calendar';
import { supabase } from '@/lib/supabase';
import AvailabilityGrid from './AvailabilityGrid';

interface ScrollableMonthListProps {
  displayMonth: string;
  selectedCarIds: string[];
  calendarData?: CalendarData; // Keep for interface compatibility
  selectedDates: string[];
  onDateClick: (date: string) => void;
  onDragStart: (date: string) => void;
  onDragEnter: (date: string) => void;
  onDragEnd: () => void;
  onBulkOperation: (operation: BulkOperation) => void;
  onMonthChange: (month: string) => void;
}

export default function ScrollableMonthList({
  displayMonth,
  selectedCarIds,
  calendarData: _calendarData, // Accept but ignore to prevent glitching
  selectedDates,
  onDateClick,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onBulkOperation,
  onMonthChange
}: ScrollableMonthListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [monthsData, setMonthsData] = useState<{ [month: string]: CalendarData }>({});
  
  // Smart cache tracking - tracks what we've actually fetched
  const fetchedMonthsRef = useRef<Set<string>>(new Set());
  const currentCarIdsRef = useRef<string[]>([]);
  
  // Generate 3 months: previous, current, next (memoized to prevent recreation)
  const months = useMemo(() => {
    const currentDate = new Date(displayMonth + '-01');
    const prevMonth = format(subMonths(currentDate, 1), 'yyyy-MM');
    const nextMonth = format(addMonths(currentDate, 1), 'yyyy-MM');
    return [prevMonth, displayMonth, nextMonth];
  }, [displayMonth]);

  // Reset cache when car selection changes
  useEffect(() => {
    const carIdsChanged = JSON.stringify(currentCarIdsRef.current) !== JSON.stringify(selectedCarIds);
    if (carIdsChanged) {
      console.log('🚗 Car selection changed, clearing cache');
      fetchedMonthsRef.current.clear();
      setMonthsData({});

      currentCarIdsRef.current = selectedCarIds;
    }
  }, [selectedCarIds]);

  // Stable fetch function (no monthsData dependency!)
  const fetchMonthData = useCallback(async (month: string) => {
    // Smart cache check: don't fetch if already fetched for current car selection
    const cacheKey = `${month}-${selectedCarIds.join(',')}`;
    if (fetchedMonthsRef.current.has(cacheKey) || selectedCarIds.length === 0) {
      console.log(`📋 Cache hit for ${month} - skipping fetch`);
      return;
    }

    console.log(`🌐 Fetching fresh data for ${month}`);
    fetchedMonthsRef.current.add(cacheKey);

    try {
      const params = new URLSearchParams({
        month,
        carIds: selectedCarIds.join(',')
      });

      const { data: { session } } = await supabase.auth.getSession();
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const response = await fetch(`/api/host/calendar?${params}`, { headers });
      
      if (response.ok) {
        const result = await response.json();
        // Update data without causing re-render of entire calendar
        setMonthsData(prev => ({
          ...prev,
          [month]: result.calendarData
        }));
        console.log(`✅ Successfully cached data for ${month}`);
      } else {
        // Remove from cache if fetch failed
        fetchedMonthsRef.current.delete(cacheKey);
        console.log(`❌ Failed to fetch ${month}, removed from cache`);
      }
    } catch (error) {
      // Remove from cache if fetch failed
      fetchedMonthsRef.current.delete(cacheKey);
      console.error(`Failed to fetch data for ${month}:`, error);
    } finally {
      // Fetch completed - cache already updated
    }
  }, [selectedCarIds]); // Only depend on selectedCarIds, not monthsData!

  // Set current month data when it changes (instant) - ONLY if we don't have it cached
  useEffect(() => {
    // IGNORE parent calendarData! It causes glitching when parent refetches
    // ScrollableMonthList should be completely independent with its own caching
    
    // Only fetch the current month if we don't have it and have cars selected
    if (selectedCarIds.length > 0 && !monthsData[displayMonth]) {
      const cacheKey = `${displayMonth}-${selectedCarIds.join(',')}`;
      if (!fetchedMonthsRef.current.has(cacheKey)) {
        console.log(`🔄 Initial fetch for current month: ${displayMonth}`);
        fetchMonthData(displayMonth);
      }
    }
  }, [displayMonth, selectedCarIds, monthsData]);

  // Fetch adjacent months data silently in background
  useEffect(() => {
    const [prevMonth, , nextMonth] = months;
    
    // Only fetch adjacent months if we have cars selected
    if (selectedCarIds.length > 0) {
      // Intelligent background fetching - only if not already cached
      const prevCacheKey = `${prevMonth}-${selectedCarIds.join(',')}`;
      const nextCacheKey = `${nextMonth}-${selectedCarIds.join(',')}`;
      
      if (!fetchedMonthsRef.current.has(prevCacheKey) && !monthsData[prevMonth]) {
        console.log(`🔄 Background fetch: ${prevMonth}`);
        setTimeout(() => fetchMonthData(prevMonth), 100);
      }
      
      if (!fetchedMonthsRef.current.has(nextCacheKey) && !monthsData[nextMonth]) {
        console.log(`🔄 Background fetch: ${nextMonth}`);
        setTimeout(() => fetchMonthData(nextMonth), 200);
      }
    }
  }, [months, selectedCarIds]); // Removed fetchMonthData dependency to prevent recreation

  // Handle scroll to detect month changes (debounced)
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    
    // Each month is exactly the container height
    const currentMonthIndex = Math.round(scrollTop / containerHeight);
    const newDisplayMonth = months[currentMonthIndex];
    
    if (newDisplayMonth && newDisplayMonth !== displayMonth) {
      // Instant month change - no waiting for data
      onMonthChange(newDisplayMonth);
    }
  }, [months, displayMonth, onMonthChange]);

  // Scroll to current month when displayMonth changes (instant snap)
  useEffect(() => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const currentIndex = months.indexOf(displayMonth);
    
    if (currentIndex !== -1) {
      const containerHeight = container.clientHeight;
      // Instant snap - no smooth scrolling animation
      container.scrollTo({
        top: currentIndex * containerHeight,
        behavior: 'instant'
      });
    }
  }, [displayMonth, months]);

  // Add scroll listener with passive mode for performance
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let scrollTimeout: NodeJS.Timeout;

    const debouncedScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScroll, 50);
    };

    container.addEventListener('scroll', debouncedScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', debouncedScroll);
      clearTimeout(scrollTimeout);
    };
  }, [handleScroll]);

  return (
    <div 
      ref={scrollContainerRef}
      className="h-[600px] overflow-y-scroll scrollbar-hide snap-y snap-mandatory"
    >
      {months.map((month) => {
        const monthData = monthsData[month];
        const isCurrentMonth = month === displayMonth;
        
        // NEVER use parent calendarData - it causes glitching!
        // Only use our own cached monthsData
        const displayData = monthData; // Pure cached data only
        
        return (
          <div 
            key={month} 
            className="snap-start h-[600px] flex flex-col"
          >
            {/* Month Header */}
            <div className="text-center py-4 bg-gradient-to-b from-[#121212] via-[#121212]/80 to-[#121212]/40 relative z-10">
              <h3 className={`text-lg font-medium ${isCurrentMonth ? 'text-white' : 'text-gray-400'}`}>
                {format(new Date(month + '-01'), 'MMMM yyyy')}
              </h3>
            </div>

            {/* Month Calendar - ALWAYS RENDER with our cached data only */}
            <div className={`flex-1 ${!isCurrentMonth ? 'opacity-70 pointer-events-none' : ''}`}>
              <AvailabilityGrid
                displayMonth={month}
                selectedCarIds={selectedCarIds}
                calendarData={displayData} // Only our cached data - never parent data!
                adjacentMonthsData={monthsData} // Pass all months data for cross-month bookings
                selectedDates={isCurrentMonth ? selectedDates : []}
                isDragSelecting={false}
                onDateClick={isCurrentMonth ? onDateClick : () => {}}
                onDragStart={isCurrentMonth ? onDragStart : () => {}}
                onDragEnter={isCurrentMonth ? onDragEnter : () => {}}
                onDragEnd={isCurrentMonth ? onDragEnd : () => {}}
                onBulkOperation={isCurrentMonth ? onBulkOperation : () => {}}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
} 