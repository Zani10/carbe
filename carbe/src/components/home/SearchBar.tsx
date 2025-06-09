import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ChevronLeft, X, MapPin, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import FilterModal from './FilterModal';
import { FilterState } from './FilterModal';
import SimpleCompactDatePicker from '@/components/ui/SimpleCompactDatePicker';
import SmartBookingModal from '@/components/ai/SmartBookingModal';
import { getUserLocation } from '@/lib/geocode';
import { format, isBefore, isAfter, isSameDay, startOfDay } from 'date-fns';
import { motion } from 'framer-motion';
import { Car } from '@/types/car';
import { processSmartSearch } from '@/lib/ai';
import { supabase } from '@/lib/supabase';

interface SearchBarProps {
  onSearch?: (searchParams: {
    location: string;
    dates: [Date | null, Date | null];
    filters?: FilterState;
  }) => void;
  className?: string;
  isLoading?: boolean;
  onAIExpandedChange?: (isExpanded: boolean) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  className,
  isLoading = false,
  onAIExpandedChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'location' | 'dates' | null>(null);
  const [searchParams, setSearchParams] = useState({
    location: '',
    dates: [null, null] as [Date | null, Date | null],
  });
  const [hasSearched, setHasSearched] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [calendarStartDate, setCalendarStartDate] = useState<Date | null>(null);
  const [calendarEndDate, setCalendarEndDate] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [isAIMode, setIsAIMode] = useState(false);
  const [isAIExpanded, setIsAIExpanded] = useState(false);
  const [aiState, setAiState] = useState<'normal' | 'aiInput' | 'processing' | 'aiResults'>('normal');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResults, setAiResults] = useState<Car[]>([]);
  const [aiMatchCount, setAiMatchCount] = useState<1 | 2 | 3>(1);
  const [aiExtractedDates, setAiExtractedDates] = useState<{ startDate: Date | null, endDate: Date | null }>({ startDate: null, endDate: null });

  // Get user location on mount (keeping for future use)
  useEffect(() => {
    getUserLocation().then(setUserLocation);
  }, []);

  // Generate location suggestions based on user input
  useEffect(() => {
    if (searchParams.location && searchParams.location.length >= 2) {
      // In a real app, this would call a geocoding API
      const commonLocations = [
        'Amsterdam, Netherlands',
        'Berlin, Germany', 
        'London, United Kingdom',
        'Paris, France',
        'Madrid, Spain',
        'Rome, Italy',
        'Barcelona, Spain',
        'Munich, Germany',
        'Vienna, Austria',
        'Brussels, Belgium',
        'Copenhagen, Denmark',
        'Stockholm, Sweden',
        'Oslo, Norway',
        'Helsinki, Finland',
        'Dublin, Ireland',
        'Lisbon, Portugal',
        'Athens, Greece',
        'Prague, Czech Republic',
        'Warsaw, Poland',
        'Budapest, Hungary'
      ];
      
      const filtered = commonLocations.filter(loc => 
        loc.toLowerCase().includes(searchParams.location.toLowerCase())
      ).slice(0, 8);
      
      setLocationSuggestions(filtered);
    } else {
      setLocationSuggestions([]);
    }
  }, [searchParams.location]);

  // Emit bottom nav visibility events
  useEffect(() => {
    const event = new CustomEvent('bottomNavVisibility', { 
      detail: { visible: !isExpanded && !isFilterModalOpen && !isDatePickerOpen } 
    });
    window.dispatchEvent(event);
  }, [isExpanded, isFilterModalOpen, isDatePickerOpen]);

  const handleExpandSearch = () => {
    setIsExpanded(true);
    setActiveSection('location');
  };

  const handleCollapseSearch = () => {
    setIsExpanded(false);
    setActiveSection(null);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams({
      ...searchParams,
      location: e.target.value,
    });
  };

  const handleLocationSelect = (location: string) => {
    setSearchParams({
      ...searchParams,
      location,
    });
    // Now automatically show the date section right after selecting a location
    setActiveSection('dates');
  };

  const handleDateSelect = (startDate: Date, endDate: Date) => {
    setSearchParams({
      ...searchParams,
      dates: [startDate, endDate],
    });
    
    // If in AI mode, also update AI extracted dates
    if (aiState === 'aiResults') {
      setAiExtractedDates({ startDate, endDate });
    } else {
      // After selecting dates, perform search (only if not in AI mode)
    handleSearch();
    }
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch({
        ...searchParams,
        filters: activeFilters || undefined,
      });
    }
    setHasSearched(true);
    setIsExpanded(false);
    setActiveSection(null);
    setIsDatePickerOpen(false);
  };

  const handleFilterClick = () => {
    setIsFilterModalOpen(true);
  };

  const handleAIClick = () => {
    if (isAIMode) {
      // Toggle back to manual search
      handleAIClose();
    } else {
      // Enter AI mode - but don't expand
      setIsAIMode(true);
      setAiState('aiInput');
      setIsAIExpanded(false); // Keep it compact!
    }
  };

  const handleAIPromptSubmit = async () => {
    if (!aiPrompt.trim()) return;
    
    setAiState('processing');
    
    // Smart detection: Only use AI for complex natural language queries
    const isComplexQuery = (query: string): boolean => {
      const complexIndicators = [
        /\b(need|want|looking for|find me)\b/i,
        /\b(this|next|last)\s+(weekend|week|month)\b/i,
        /\b(under|below|max|maximum)\s*[€$]\d+/i,
        /\b(family|luxury|cheap|budget|eco|electric)\b/i,
        /\b(near|around|close to)\b/i,
        /\b(automatic|manual)\b/i,
        /\b(today|tomorrow|tonight)\b/i, // Time indicators
        /\b(for|in)\s+\w+/i, // "for vacation", "in paris"
      ];
      
      return complexIndicators.some(pattern => pattern.test(query)) || query.split(' ').length >= 3;
    };

    try {
      if (isComplexQuery(aiPrompt)) {
        // Use AI for complex natural language queries
        console.log('🤖 Using AI search for complex query:', aiPrompt);
        const result = await processSmartSearch(aiPrompt);
        
        // Extract dates from AI result first, fallback to prompt parsing
        const aiResultDates = result.response.criteria.dates;
        const extractedDates = aiResultDates?.start && aiResultDates?.end 
          ? { 
              startDate: new Date(aiResultDates.start), 
              endDate: new Date(aiResultDates.end) 
            }
          : extractDatesFromPrompt(aiPrompt);
        
        setAiResults(result.cars);
        setAiMatchCount(Math.min(result.cars.length, 3) as 1 | 2 | 3);
        setAiExtractedDates(extractedDates);
        setAiState('aiResults');
        onAIExpandedChange?.(true);
      } else {
        // Use traditional search for simple queries - inline implementation
        console.log('⚡ Using fast traditional search for simple query:', aiPrompt);
        
        // Enhanced traditional search with better keyword matching
        const searchTerms = aiPrompt.toLowerCase().split(' ').filter(term => term.length > 1);
        let query = supabase
          .from('cars')
          .select('*')
          .eq('is_available', true);

        // Build flexible OR conditions for each search term
        const orConditions = searchTerms.flatMap(term => [
          `make.ilike.%${term}%`,
          `model.ilike.%${term}%`,
          `location.ilike.%${term}%`,
          `fuel_type.ilike.%${term}%`,
          `description.ilike.%${term}%`
        ]);

        if (orConditions.length > 0) {
          query = query.or(orConditions.join(','));
        }

        const { data: fallbackResult } = await query
          .order('rating', { ascending: false })
          .limit(6);

        // If no results found, show some available cars as fallback
        let finalResults = fallbackResult || [];
        if (finalResults.length === 0) {
          console.log('🔄 No specific matches, showing available cars as fallback');
          const { data: allCars } = await supabase
            .from('cars')
            .select('*')
            .eq('is_available', true)
            .order('rating', { ascending: false })
            .limit(6);
          finalResults = allCars || [];
        }

        setAiResults(finalResults);
        setAiMatchCount(Math.min(Math.max(finalResults.length || 1, 1), 3) as 1 | 2 | 3);
        setAiExtractedDates({ startDate: null, endDate: null });
        setAiState('aiResults');
        onAIExpandedChange?.(true);
      }
    } catch (error) {
      console.error('AI processing failed:', error);
      setAiState('aiInput');
    }
  };

  const handleAIClose = () => {
    setAiState('normal');
    setIsAIMode(false);
    setIsAIExpanded(false);
    setAiPrompt('');
    setAiResults([]);
    onAIExpandedChange?.(false);
    setAiExtractedDates({ startDate: null, endDate: null });
    setIsAIModalOpen(false);
  };

  const extractDatesFromPrompt = (prompt: string): { startDate: Date | null, endDate: Date | null } => {
    const promptLower = prompt.toLowerCase();
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    // Simple date extraction patterns
    if (promptLower.includes('today')) {
      return { startDate: today, endDate: tomorrow };
    }
    if (promptLower.includes('tomorrow')) {
      return { startDate: tomorrow, endDate: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000) };
    }
    if (promptLower.includes('weekend')) {
      const friday = new Date(today);
      const dayOfWeek = today.getDay();
      const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
      friday.setDate(today.getDate() + daysUntilFriday);
      const sunday = new Date(friday);
      sunday.setDate(friday.getDate() + 2);
      return { startDate: friday, endDate: sunday };
    }
    if (promptLower.includes('next week')) {
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      const weekEnd = new Date(nextWeek);
      weekEnd.setDate(nextWeek.getDate() + 3);
      return { startDate: nextWeek, endDate: weekEnd };
    }
    
    return { startDate: null, endDate: null };
  };

  const handleReserve = (car: Car) => {
    // Use the extracted dates from AI or the current searchParams dates
    const startDate = aiExtractedDates.startDate || searchParams.dates[0];
    const endDate = aiExtractedDates.endDate || searchParams.dates[1];
    
    // Close AI mode
    handleAIClose();
    
    // Navigate to booking with pre-filled data
    const bookingUrl = `/book/${car.id}${startDate && endDate 
      ? `?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}` 
      : ''
    }`;
    
    window.location.href = bookingUrl;
  };

  const handleApplyFilters = (filters: FilterState) => {
    console.log('Applied filters:', filters);
    setActiveFilters(filters);
    // Trigger search with new filters
    if (onSearch) {
      onSearch({
        ...searchParams,
        filters,
      });
    }
  };

  const handleResetFilters = () => {
    setActiveFilters(null);
    // Trigger search without filters
    if (onSearch) {
      onSearch({
        ...searchParams,
        filters: undefined,
      });
    }
  };

  const getActiveFilterCount = (): number => {
    if (!activeFilters) return 0;
    
    let count = 0;
    
    // Count vehicle types (if not default 'cars')
    if (activeFilters.vehicleTypes.length > 0 && activeFilters.vehicleTypes[0] !== 'cars') count++;
    if (activeFilters.brands.length > 0) count++;
    if (activeFilters.ecoFriendly.length > 0) count++;
    if (activeFilters.years.length > 0) count++;
    if (activeFilters.seats.length > 0) count++;
    if (activeFilters.transmission.length > 0) count++;
    if (activeFilters.priceRange[0] > 10 || activeFilters.priceRange[1] < 500) count++;
    
    return count;
  };

  const renderLocationOptions = () => {
    // Generate dynamic location options
    const baseLocations = [
      { id: 'nearby', name: 'Nearby', description: 'Cars around your current location' },
      { id: 'anywhere', name: 'Anywhere', description: 'Search in all locations' },
    ];

    // Add popular European cities
    const popularLocations = [
      { id: 'amsterdam', name: 'Amsterdam, Netherlands', description: 'Popular destination' },
      { id: 'berlin', name: 'Berlin, Germany', description: 'Popular destination' },
      { id: 'london', name: 'London, United Kingdom', description: 'Popular destination' },
      { id: 'paris', name: 'Paris, France', description: 'Popular destination' },
      { id: 'barcelona', name: 'Barcelona, Spain', description: 'Popular destination' },
      { id: 'rome', name: 'Rome, Italy', description: 'Popular destination' },
    ];

    // Show search suggestions if user is typing, otherwise show popular locations
    const locationsToShow = locationSuggestions.length > 0 
      ? locationSuggestions.map((loc, index) => ({
          id: `suggestion_${index}`,
          name: loc,
          description: 'Search result'
        }))
      : [...baseLocations, ...popularLocations];

    return (
      <div className="h-[60vh] max-h-[500px] overflow-y-auto mt-2 py-2">
        {locationsToShow.map((location) => (
          <div
            key={location.id}
            className="flex items-center px-4 py-3 hover:bg-gray-700/20 rounded-lg cursor-pointer"
            onClick={() => handleLocationSelect(location.name)}
          >
            <div className="bg-gray-700 rounded-full p-2 mr-3 flex-shrink-0">
              <MapPin size={16} className="text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-white font-medium whitespace-pre break-words">{location.name}</div>
              <div className="text-gray-400 text-sm whitespace-pre break-words">{location.description}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderDateSelector = () => {
    // Use the calendar state from component level
    const startDate = calendarStartDate || searchParams.dates[0];
    const endDate = calendarEndDate || searchParams.dates[1];

    // Generate dates for the calendar (3 months)
    const generateCalendarDates = () => {
      const today = new Date();
      const months = [];
      
      for (let i = 0; i < 3; i++) {
        const monthStart = new Date(today.getFullYear(), today.getMonth() + i, 1);
        const monthName = format(monthStart, 'MMMM yyyy');
        
        const daysInMonth = new Date(
          monthStart.getFullYear(),
          monthStart.getMonth() + 1,
          0
        ).getDate();
        
        const startDay = (monthStart.getDay() + 6) % 7;
        
        const days = [];
        
        for (let d = 0; d < startDay; d++) {
          days.push(null);
        }
        
        for (let d = 1; d <= daysInMonth; d++) {
          const date = new Date(monthStart.getFullYear(), monthStart.getMonth(), d);
          days.push(date);
        }
        
        months.push({
          name: monthName,
          days,
        });
      }
      
      return months;
    };

    const isDateSelected = (date: Date) => {
      if (!startDate && !endDate) return false;
      if (startDate && isSameDay(date, startDate)) return true;
      if (endDate && isSameDay(date, endDate)) return true;
      if (startDate && endDate && isAfter(date, startDate) && isBefore(date, endDate)) return true;
      return false;
    };

    const isDateInRange = (date: Date) => {
      if (startDate && !endDate && hoverDate) {
        const start = startDate;
        const end = hoverDate;
        return (
          (isAfter(date, start) && isBefore(date, end)) ||
          (isAfter(date, end) && isBefore(date, start))
        );
      }
      return false;
    };

    const isDateDisabled = (date: Date) => {
      const today = startOfDay(new Date());
      return isBefore(date, today);
    };

    const handleDateClick = (date: Date) => {
      if (isDateDisabled(date)) return;

      // Case 1: No selection OR we have a range selected - start new single selection
      if (!startDate || (startDate && endDate && !isSameDay(startDate, endDate))) {
        setCalendarStartDate(date);
        setCalendarEndDate(date);
      }
      // Case 2: Single date selected and clicking the same date - clear selection
      else if (startDate && endDate && isSameDay(startDate, endDate) && isSameDay(date, startDate)) {
        setCalendarStartDate(null);
        setCalendarEndDate(null);
      }
      // Case 3: Single date selected and clicking different date - create range
      else if (startDate && endDate && isSameDay(startDate, endDate)) {
        const newStartDate = isBefore(date, startDate) ? date : startDate;
        const newEndDate = isBefore(date, startDate) ? startDate : date;
        
        setCalendarStartDate(newStartDate);
        setCalendarEndDate(newEndDate);
      }
    };

    const handleDateHover = (date: Date) => {
      if (!isDateDisabled(date)) {
        setHoverDate(date);
      }
    };

    const handleApplyDates = () => {
      if (startDate && endDate && !isSameDay(startDate, endDate)) {
        handleDateSelect(startDate, endDate);
      }
    };

    return (
      <div className="h-[60vh] max-h-[500px] flex flex-col">
        <div className="flex-1 overflow-y-auto mt-2 py-2 px-4">
          <div className="max-w-lg mx-auto">
            {generateCalendarDates().map((month, monthIndex) => (
              <div key={monthIndex} className="mb-8">
                <h3 className="text-white font-medium text-center mb-4">{month.name}</h3>
                
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <div 
                      key={day} 
                      className="text-xs text-center py-2 text-gray-400"
                    >
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {month.days.map((date, dateIndex) => {
                    if (!date) return <div key={`empty-${dateIndex}`} className="h-12" />;
                    
                    const isSelected = isDateSelected(date);
                    const isInRange = isDateInRange(date);
                    const disabled = isDateDisabled(date);
                    
                    return (
                      <button
                        key={dateIndex}
                        onClick={() => handleDateClick(date)}
                        onMouseEnter={() => handleDateHover(date)}
                        disabled={disabled}
                        className={`
                          h-12 flex items-center justify-center rounded-lg transition-all duration-200 text-sm font-medium
                          ${disabled ? 'text-gray-600 cursor-not-allowed' : 
                            'text-white cursor-pointer hover:bg-gray-700'}
                          ${isSelected && !isInRange ? 'bg-[#FF4646] text-white shadow-lg' : ''}
                          ${isInRange ? 'bg-[#FF4646]/30' : ''}
                          ${!disabled && !isSelected && !isInRange ? 'hover:scale-105' : ''}
                        `}
                      >
                        {format(date, 'd')}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Apply button at bottom */}
        {startDate && endDate && !isSameDay(startDate, endDate) && (
          <div className="p-4 border-t border-gray-800">
            <button
              onClick={handleApplyDates}
              className="w-full bg-[#FF4646] hover:bg-[#FF3333] text-white font-medium py-4 rounded-2xl transition-colors flex items-center justify-center"
            >
              Apply dates ({format(startDate, 'MMM d')} - {format(endDate, 'MMM d')})
            </button>
          </div>
        )}
      </div>
    );
  };

  // Compact searchbar in post-search state
  if (hasSearched && !isExpanded) {
    return (
      <>
        <div className={clsx(
          "fixed top-0 left-0 right-0 z-30 w-full bg-[#212121] rounded-b-[35px] pt-5 pb-4 px-4",
          className
        )}>
          <div className="flex flex-col">
            <motion.div 
              className={clsx(
                "relative rounded-full shadow-md py-3 px-4 w-full",
                isAIMode ? "bg-gradient-to-r from-[#FF4646] to-[#FF6B6B]" : "bg-white"
              )}
              style={{
                transition: 'background 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              animate={{
                borderRadius: aiState === 'aiResults' ? "0px" : "999px",
                height: aiState === 'aiResults' ? "100vh" : "auto",
                scale: isAIMode ? 1.01 : 1
              }}
              transition={{ 
                duration: 0.6,
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
            >
              {!isAIExpanded ? (
                // Normal compact SearchBar mode
                <div className="relative flex items-center">
                  {/* AI Button - Absolute positioned left */}
                  <button 
                    className={clsx(
                      "absolute left-0 p-2 rounded-full transition-all duration-300 z-10",
                      isAIMode ? "bg-white/20 backdrop-blur-sm" : "hover:bg-gray-100"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAIClick();
                    }}
                  >
                    <svg 
                      width="18" 
                      height="18" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      className={clsx(
                        "transition-colors duration-300",
                        isAIMode ? "text-white" : "text-[#FF4646]"
                      )}
                    >
                      <path 
                        d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" 
                        fill="currentColor"
                      />
                      <path 
                        d="M19 12L19.5 14.5L22 15L19.5 15.5L19 18L18.5 15.5L16 15L18.5 14.5L19 12Z" 
                        fill="currentColor" 
                        opacity="0.7"
                      />
                    </svg>
                  </button>

                  {/* Filter Button - Absolute positioned right */}
                  <button 
                    onClick={handleFilterClick}
                    className={clsx(
                      "absolute right-0 p-2 rounded-full transition-all duration-300 z-10",
                      isAIMode ? "bg-white/20 backdrop-blur-sm" : "hover:bg-gray-100"
                    )}
                  >
                    <SlidersHorizontal className={clsx(
                      "h-5 w-5 transition-colors duration-300",
                      isAIMode ? "text-white" : "text-gray-800"
                    )} />
                    {getActiveFilterCount() > 0 && (
                      <div className="absolute -top-1 -right-1 bg-[#FF4646] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {getActiveFilterCount()}
                      </div>
                    )}
                  </button>

                  {/* Search content - Perfectly centered */}
                  <div className="w-full flex justify-center">
                <button 
                  onClick={handleExpandSearch}
                  className="flex items-center text-left"
                >
                  {isLoading ? (
                        <Loader2 className={clsx(
                          "h-5 w-5 mr-2 flex-shrink-0 animate-spin transition-colors duration-300",
                          isAIMode ? "text-white" : "text-[#FF4646]"
                        )} />
                  ) : (
                        <Search className={clsx(
                          "h-5 w-5 mr-2 flex-shrink-0 transition-colors duration-300",
                          isAIMode ? "text-white" : "text-[#FF4646]"
                        )} />
                  )}
                  <div>
                        <div className={clsx(
                          "font-medium text-sm transition-colors duration-300",
                          isAIMode ? "text-white" : "text-black"
                        )}>
                      {searchParams.location || 'Anywhere'}
                    </div>
                        <div className={clsx(
                          "text-xs transition-colors duration-300",
                          isAIMode ? "text-white/80" : "text-gray-500"
                        )}>
                      {searchParams.dates[0] && searchParams.dates[1] ? 
                        `${searchParams.dates[0].toLocaleDateString()} - ${searchParams.dates[1].toLocaleDateString()}` :
                        'Any dates'
                      }
                    </div>
                  </div>
                </button>
                  </div>
                </div>
              ) : (
                // AI Expanded mode in compact view
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="p-4"
                >
                  {/* Same AI interface as the main SearchBar */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                          <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-white font-medium text-sm">Smart Booking AI</h4>
                        <p className="text-white/80 text-xs">Describe what you need</p>
                      </div>
                    </div>
                <button 
                      onClick={() => {
                        setIsAIExpanded(false);
                        setIsAIMode(false);
                        setIsAIModalOpen(false);
                      }}
                      className="w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                    >
                      <X size={14} />
                    </button>
                    </div>
                  
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="7-seater for tomorrow near Brussels..."
                      className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-3 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-1 focus:ring-white/50 transition-all text-sm"
                    />
                    <button className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full flex items-center justify-center text-[#FF4646] hover:bg-white/90 transition-colors">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="m5 12 7-7 7 7M12 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                </button>
              </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>

        <FilterModal 
          isOpen={isFilterModalOpen} 
          onClose={() => setIsFilterModalOpen(false)}
          onApplyFilters={handleApplyFilters}
          onResetFilters={handleResetFilters}
          initialFilters={activeFilters}
        />

        <SimpleCompactDatePicker
          isOpen={isDatePickerOpen}
          onClose={() => setIsDatePickerOpen(false)}
          onSelectDates={handleDateSelect}
          initialStartDate={aiExtractedDates.startDate || searchParams.dates[0] || undefined}
          initialEndDate={aiExtractedDates.endDate || searchParams.dates[1] || undefined}
        />
      </>
    );
  }

  return (
    <>
      <div className={clsx(
        "fixed top-0 left-0 right-0 z-30 w-full bg-[#212121] transition-all",
        isExpanded ? "h-screen pb-0" : "rounded-b-[35px] pt-5 pb-4",
        aiState === 'aiResults' ? "h-screen pt-5 pb-4 rounded-b-[35px]" : "",
        className
      )}>
        {isExpanded ? (
          <div className="flex flex-col h-full">
            <div className="pt-5 px-4 pb-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <button 
                  onClick={handleCollapseSearch}
                  className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-[30px] flex items-center justify-center text-white"
                >
                  <ChevronLeft size={24} />
                </button>
                {activeSection === 'location' && <h2 className="text-white text-lg font-medium">Where to?</h2>}
                {activeSection === 'dates' && <h2 className="text-white text-lg font-medium">When?</h2>}
                <div className="w-10" />
              </div>

              {/* Search input - only show when in location section */}
              {activeSection === 'location' && (
                <div className="relative bg-white rounded-full shadow-md flex items-center py-3 px-4 w-full">
                  <Search className="h-5 w-5 text-[#FF4646] mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    value={searchParams.location}
                    onChange={handleLocationChange}
                    placeholder="Search destinations"
                    className="bg-transparent flex-grow focus:outline-none text-black placeholder-gray-500 text-base font-normal"
                    autoFocus={activeSection === 'location'}
                  />
                  {searchParams.location && (
                    <button 
                      onClick={() => setSearchParams({...searchParams, location: ''})}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <X size={16} className="text-gray-500" />
                    </button>
                  )}
                </div>
              )}

              {/* Selected location display when in dates section */}
              {activeSection === 'dates' && searchParams.location && (
                <div 
                  className="bg-gray-800 rounded-full p-3 text-white flex items-center justify-between cursor-pointer"
                  onClick={() => setActiveSection('location')}
                >
                  <div className="flex items-center">
                    <MapPin size={18} className="mr-2 text-[#FF4646]" />
                    <span>{searchParams.location}</span>
                  </div>
                  <X size={16} className="text-gray-400" onClick={(e) => {
                    e.stopPropagation();
                    setSearchParams({...searchParams, location: ''});
                    setActiveSection('location');
                  }} />
                </div>
              )}
            </div>

            {/* Content area for location options or date picker */}
            <div className="flex-grow overflow-y-auto px-4">
              {activeSection === 'location' && renderLocationOptions()}
              {activeSection === 'dates' && renderDateSelector()}
            </div>
          </div>
        ) : (
          <div className="px-4">
            <motion.div 
              className="relative shadow-md w-full"
              variants={{
                normal: {
                  backgroundColor: isAIMode ? '#FF4646' : '#ffffff',
                  borderRadius: '999px',
                  height: '56px',
                  scale: isAIMode ? 1.01 : 1
                },
                ai: {
                  backgroundColor: 'transparent',
                  borderRadius: '35px',
                  height: '100vh',
                  scale: 1,
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  marginLeft: 0,
                  marginRight: 0,
                  marginTop: 0,
                  marginBottom: 0
                }
              }}
              initial="normal"
              animate={aiState === 'aiResults' ? 'ai' : 'normal'}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30
              }}
              onClick={!isAIExpanded && !isAIMode ? handleExpandSearch : undefined}
            >
{aiState === 'normal' ? (
                // Normal SearchBar mode
                <div className="relative py-3 px-4 flex items-center h-14">
                  {/* AI Button - Absolute positioned left */}
                  <motion.button 
                    className={clsx(
                      "absolute left-4 p-2 rounded-full transition-all duration-300 z-10",
                      isAIMode ? "bg-white/20 backdrop-blur-sm" : "hover:bg-gray-100"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAIClick();
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      className={clsx(
                        "transition-colors duration-300",
                        isAIMode ? "text-white" : "text-[#FF4646]"
                      )}
                    >
                      {/* Main sparkle */}
                      <path 
                        d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" 
                        fill="currentColor"
                      />
                      {/* Top right sparkle */}
                      <path 
                        d="M19 12L19.5 14.5L22 15L19.5 15.5L19 18L18.5 15.5L16 15L18.5 14.5L19 12Z" 
                        fill="currentColor" 
                        opacity="0.7"
                      />
                    </svg>
                  </motion.button>

                  {/* Filter Button - Absolute positioned right */}
                  <motion.button 
                    className={clsx(
                      "absolute right-4 p-2 rounded-full transition-all duration-300 z-10",
                      isAIMode ? "bg-white/20 backdrop-blur-sm opacity-0 pointer-events-none" : "hover:bg-gray-100 opacity-100"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFilterClick();
                    }}
                    animate={{ opacity: isAIMode ? 0 : 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <SlidersHorizontal className={clsx(
                      "h-5 w-5 transition-colors duration-300",
                      isAIMode ? "text-white" : "text-gray-800"
                    )} />
                    {getActiveFilterCount() > 0 && (
                      <div className="absolute -top-1 -right-1 bg-[#FF4646] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {getActiveFilterCount()}
                      </div>
                    )}
                  </motion.button>

                  {/* Search content - Perfectly centered */}
                  <div className="w-full flex justify-center items-center">
                    <motion.div 
                      className="flex items-center gap-2"
                      animate={{ 
                        opacity: isAIMode ? 0 : 1,
                        scale: isAIMode ? 0.9 : 1 
                      }}
                      transition={{ duration: 0.3 }}
                    >
                  {isLoading ? (
                        <Loader2 className={clsx(
                          "h-5 w-5 flex-shrink-0 animate-spin transition-colors duration-300",
                          isAIMode ? "text-white" : "text-[#FF4646]"
                        )} />
                  ) : (
                        <Search className={clsx(
                          "h-5 w-5 flex-shrink-0 transition-colors duration-300",
                          isAIMode ? "text-white" : "text-[#FF4646]"
                        )} />
                  )}
                      <div className={clsx(
                        "text-base font-normal transition-colors duration-300",
                        isAIMode ? "text-white" : "text-black"
                      )}>
                    Start your search
                  </div>
                    </motion.div>
                </div>
              </div>
              ) : aiState === 'aiInput' ? (
                // AI Input mode - Same SearchBar but with AI magic
                <div className="relative py-3 px-4 flex items-center h-14">
                  {/* AI Button - Now active/highlighted */}
                  <motion.button 
                    className="absolute left-4 p-2 rounded-full bg-white/30 backdrop-blur-sm z-10"
                onClick={(e) => {
                  e.stopPropagation();
                      handleAIClick();
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      className="text-white"
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      {/* Main sparkle */}
                      <path 
                        d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" 
                        fill="currentColor"
                      />
                      {/* Top right sparkle */}
                      <path 
                        d="M19 12L19.5 14.5L22 15L19.5 15.5L19 18L18.5 15.5L16 15L18.5 14.5L19 12Z" 
                        fill="currentColor" 
                        opacity="0.7"
                      />
                    </motion.svg>
                  </motion.button>

                  {/* Hidden Input for AI Prompt */}
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="7-seater for tomorrow in Brussels under €80..."
                    className="w-full bg-transparent text-white placeholder-white/70 outline-none text-left pr-16 pl-16 text-sm"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleAIPromptSubmit()}
                  />

                  {/* Send Button */}
                  {aiPrompt.trim() && (
                    <motion.button 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={handleAIPromptSubmit}
                      className="absolute right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#FF4646] hover:bg-white/90 transition-colors z-10"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="m5 12 7-7 7 7M12 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </motion.button>
                  )}
                  </div>
              ) : aiState === 'processing' ? (
                // Processing state - Clean SearchBar style
                <div className="relative py-3 px-4 flex items-center h-14">
                  {/* Animated AI Button */}
                  <motion.div 
                    className="absolute left-4 p-2 rounded-full bg-white/30 backdrop-blur-sm z-10"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 180, 360]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                  >
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      className="text-white"
                    >
                      {/* Main sparkle */}
                      <path 
                        d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" 
                        fill="currentColor"
                      />
                      {/* Top right sparkle */}
                      <path 
                        d="M19 12L19.5 14.5L22 15L19.5 15.5L19 18L18.5 15.5L16 15L18.5 14.5L19 12Z" 
                        fill="currentColor" 
                        opacity="0.9"
                      />
                      {/* Small top sparkle */}
                      <path 
                        d="M6 6L6.5 7.5L8 8L6.5 8.5L6 10L5.5 8.5L4 8L5.5 7.5L6 6Z" 
                        fill="currentColor" 
                        opacity="0.6"
                      />
                      {/* Tiny bottom sparkle */}
                      <circle cx="18" cy="6" r="1" fill="currentColor" opacity="0.8" />
                    </svg>
                  </motion.div>

                  {/* Processing Text with Animated Dots */}
                  <div className="w-full flex justify-center items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium text-sm">Finding perfect matches</span>
                      <motion.div 
                        className="flex gap-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-1 h-1 bg-white rounded-full"
                            animate={{ 
                              opacity: [0.3, 1, 0.3],
                              scale: [0.8, 1.2, 0.8]
                            }}
                            transition={{ 
                              duration: 1.5, 
                              repeat: Infinity, 
                              delay: i * 0.2,
                              ease: "easeInOut"
                            }}
                          />
                        ))}
                      </motion.div>
                    </div>
                  </div>

                  {/* Optional: Show processed prompt in smaller text */}
                  <motion.div 
                    className="absolute bottom-1 left-1/2 transform -translate-x-1/2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <p className="text-white/60 text-xs max-w-[200px] truncate">
                      &ldquo;{aiPrompt}&rdquo;
                    </p>
                  </motion.div>
                </div>
              ) : (
                // AI Results 
                <div className="h-full flex flex-col overflow-hidden rounded-[35px]">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FF4646] to-[#FF6B6B]" />
                  <div className="relative z-10 h-full flex flex-col">
                  {/* Results Header */}
                  <div className="flex-shrink-0 p-4 border-b border-white/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                            {/* Main sparkle */}
                            <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
                            {/* Secondary sparkle */}
                            <path d="M19 12L19.5 14.5L22 15L19.5 15.5L19 18L18.5 15.5L16 15L18.5 14.5L19 12Z" fill="currentColor" opacity="0.7"/>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="text-white font-bold text-lg leading-tight">
                            {aiMatchCount} Perfect {aiMatchCount === 1 ? 'Match' : 'Matches'}
                          </h2>
                          <p className="text-white/80 text-xs truncate">&ldquo;{aiPrompt}&rdquo;</p>
                        </div>
                      </div>
                      <button 
                        onClick={handleAIClose}
                        className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition-colors flex-shrink-0"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Compact Date Picker */}
                  <div className="flex-shrink-0 px-4 py-3 border-b border-white/20">
                    {aiExtractedDates.startDate && aiExtractedDates.endDate ? (
                      <button 
                        onClick={() => setIsDatePickerOpen(true)}
                        className="w-full bg-white/15 hover:bg-white/20 rounded-xl p-3 flex items-center gap-3 transition-colors"
                      >
                        <div className="w-5 h-5 text-white/80">
                          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-white font-medium text-sm">
                            {aiExtractedDates.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {aiExtractedDates.endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                          <div className="text-white/70 text-xs">Tap to change dates</div>
                        </div>
                      </button>
                    ) : (
                      <button 
                        onClick={() => setIsDatePickerOpen(true)}
                        className="w-full bg-white/15 hover:bg-white/20 rounded-xl p-3 flex items-center gap-3 transition-colors"
                      >
                        <div className="w-5 h-5 text-white/80">
                          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-white font-medium text-sm">Select dates</div>
                          <div className="text-white/70 text-xs">When do you need the car?</div>
                        </div>
                      </button>
                    )}
                  </div>

                  {/* AI Results List */}
                  <div className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-4">
                      {aiResults.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-white" />
                          </div>
                          <p className="text-white font-medium text-lg">No cars found</p>
                          <p className="text-white/70 text-sm mt-2">Try adjusting your search criteria</p>
                        </div>
                      ) : (
                        aiResults.map((car, index) => (
                          <motion.div
                            key={car.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-colors"
                          >
                            {/* Mobile-First Layout */}
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                              {/* Enhanced Car Image & Basic Info */}
                              <div className="flex items-center gap-3 flex-1">
                                <div className="relative w-20 h-14 rounded-xl overflow-hidden bg-white/10 flex-shrink-0 group">
                                  <img 
                                    src={car.images?.[0] || '/api/placeholder/64/48'} 
                                    alt={`${car.make} ${car.model}`}
                                    className="w-full h-full object-cover"
                                  />
                                  
                                  {/* Image Count Indicator */}
                                  {car.images && car.images.length > 1 && (
                                    <div className="absolute top-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                                      +{car.images.length - 1}
                                    </div>
                                  )}
                                  
                                  {/* Quick View Overlay */}
                                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="white" strokeWidth="2" fill="none"/>
                                      <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="2" fill="none"/>
                                    </svg>
                                  </div>
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-white font-bold text-base leading-tight">
                                    {car.make} {car.model}
                                  </h3>
                                  {/* Enhanced Location with Map Icon */}
                                  <div className="flex items-center gap-1 mt-1">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="text-white/60 flex-shrink-0">
                                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" fill="none"/>
                                      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
                                    </svg>
                                    <p className="text-white/70 text-xs truncate">{car.location}</p>
                                    <span className="text-white/50 text-xs">• 2.3km</span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Car Details */}
                              <div className="flex items-center gap-2 text-xs flex-wrap">
                                <span className="text-white/80 bg-white/10 px-2 py-1 rounded-md">
                                  {car.transmission}
                                </span>
                                <span className="text-white/80 bg-white/10 px-2 py-1 rounded-md">
                                  {car.seats} seats
                                </span>
                                {car.fuel_type && (
                                  <span className="text-white/80 bg-white/10 px-2 py-1 rounded-md">
                                    {car.fuel_type}
                                  </span>
                                )}
                              </div>
                              
                              {/* Price & Reserve */}
                              <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3">
                                <div className="text-left sm:text-right">
                                  <div className="text-white font-bold text-lg">€{car.price_per_day}</div>
                                  <div className="text-white/70 text-xs">per day</div>
                                </div>
                                
                                <button 
                                  onClick={() => handleReserve(car)}
                                  className="bg-white text-[#FF4646] font-bold px-4 py-2 rounded-xl hover:bg-white/90 transition-colors text-sm shadow-lg flex-shrink-0"
                                >
                                  Reserve
              </button>
            </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>

      <FilterModal 
        isOpen={isFilterModalOpen} 
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
        initialFilters={activeFilters}
      />

      <SimpleCompactDatePicker
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onSelectDates={handleDateSelect}
        initialStartDate={aiExtractedDates.startDate || searchParams.dates[0] || undefined}
        initialEndDate={aiExtractedDates.endDate || searchParams.dates[1] || undefined}
      />

      <SmartBookingModal 
        isOpen={isAIModalOpen} 
        onClose={() => {
          setIsAIModalOpen(false);
          setIsAIMode(false);
        }} 
      />
    </>
  );
};

export default SearchBar; 