import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { CalendarData, BulkOperation } from '@/types/calendar';
import { supabase } from '@/lib/supabase';
import AvailabilityGrid from './AvailabilityGrid';

interface ScrollableMonthListProps {
  displayMonth: string;
  selectedCarIds: string[];
  calendarData?: CalendarData;
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
  calendarData,
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
  
  // Generate 3 months: previous, current, next (memoized to prevent recreation)
  const months = useMemo(() => {
    const currentDate = new Date(displayMonth + '-01');
    const prevMonth = format(subMonths(currentDate, 1), 'yyyy-MM');
    const nextMonth = format(addMonths(currentDate, 1), 'yyyy-MM');
    return [prevMonth, displayMonth, nextMonth];
  }, [displayMonth]);

  // Fetch data for a specific month (background loading)
  const fetchMonthData = useCallback(async (month: string) => {
    if (monthsData[month] || selectedCarIds.length === 0) return;

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
      }
    } catch (error) {
      console.error(`Failed to fetch data for ${month}:`, error);
    }
  }, [selectedCarIds, monthsData]);

  // Set current month data when it changes (instant)
  useEffect(() => {
    if (calendarData) {
      setMonthsData(prev => ({
        ...prev,
        [displayMonth]: calendarData
      }));
    }
  }, [displayMonth, calendarData]);

  // Fetch adjacent months data silently in background
  useEffect(() => {
    const [prevMonth, , nextMonth] = months;
    // Fetch in background without blocking UI
    setTimeout(() => fetchMonthData(prevMonth), 0);
    setTimeout(() => fetchMonthData(nextMonth), 0);
  }, [fetchMonthData, months]);

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
        
        return (
          <div 
            key={month} 
            className="snap-start h-[600px] flex flex-col"
          >
            {/* Month Header */}
            <div className="text-center py-4 bg-[#121212]">
              <h3 className={`text-lg font-medium ${isCurrentMonth ? 'text-white' : 'text-gray-400'}`}>
                {format(new Date(month + '-01'), 'MMMM yyyy')}
              </h3>
            </div>

            {/* Month Calendar - ALWAYS RENDER, even without data */}
            <div className={`flex-1 ${!isCurrentMonth ? 'opacity-70 pointer-events-none' : ''}`}>
              <AvailabilityGrid
                displayMonth={month}
                selectedCarIds={selectedCarIds}
                calendarData={monthData} // undefined is fine - will show skeleton
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