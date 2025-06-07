import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ChevronLeft, X, MapPin, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import FilterModal from './FilterModal';
import { FilterState } from './FilterModal';
import DatePicker from '@/components/booking/DatePicker';
import { getUserLocation } from '@/lib/geocode';
import { useBottomNav } from '@/contexts/BottomNavContext';
import { format, isBefore, isAfter, isSameDay, startOfDay } from 'date-fns';

interface SearchBarProps {
  onSearch?: (searchParams: {
    location: string;
    dates: [Date | null, Date | null];
    filters?: FilterState;
  }) => void;
  className?: string;
  isLoading?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  className,
  isLoading = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
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
    // After selecting dates, perform search
    handleSearch();
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
          "fixed top-0 left-0 right-0 z-30 w-full bg-[#212121] pt-5 pb-4 px-4",
          className
        )}>
          <div className="flex flex-col">
            <div className="relative bg-white rounded-full shadow-md flex items-center py-3 px-4 w-full">
              <div className="flex-grow flex justify-between items-center">
                <button 
                  onClick={handleExpandSearch}
                  className="flex items-center text-left"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 text-[#FF4646] mr-2 flex-shrink-0 animate-spin" />
                  ) : (
                    <Search className="h-5 w-5 text-[#FF4646] mr-2 flex-shrink-0" />
                  )}
                  <div>
                    <div className="text-black font-medium text-sm">
                      {searchParams.location || 'Anywhere'}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {searchParams.dates[0] && searchParams.dates[1] ? 
                        `${searchParams.dates[0].toLocaleDateString()} - ${searchParams.dates[1].toLocaleDateString()}` :
                        'Any dates'
                      }
                    </div>
                  </div>
                </button>
                <button 
                  onClick={handleFilterClick}
                  className="relative p-2 hover:bg-gray-100 rounded-full flex-shrink-0"
                >
                  <SlidersHorizontal className="h-5 w-5 text-gray-800" />
                  {getActiveFilterCount() > 0 && (
                    <div className="absolute -top-1 -right-1 bg-[#FF4646] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {getActiveFilterCount()}
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <FilterModal 
          isOpen={isFilterModalOpen} 
          onClose={() => setIsFilterModalOpen(false)}
          onApplyFilters={handleApplyFilters}
          onResetFilters={handleResetFilters}
          initialFilters={activeFilters}
        />

        <DatePicker
          isOpen={isDatePickerOpen}
          onClose={() => setIsDatePickerOpen(false)}
          onSelectDates={handleDateSelect}
          initialStartDate={searchParams.dates[0] || undefined}
          initialEndDate={searchParams.dates[1] || undefined}
        />
      </>
    );
  }

  return (
    <>
      <div className={clsx(
        "fixed top-0 left-0 right-0 z-30 w-full bg-[#212121] transition-all",
        isExpanded ? "h-screen pb-0" : "rounded-b-[35px] pt-5 pb-4",
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
            <div className="relative bg-white rounded-full shadow-md flex items-center justify-between py-3 px-4 w-full" onClick={handleExpandSearch}>
              <div className="flex-grow flex justify-center items-center">
                <div className="flex items-center gap-2">
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 text-[#FF4646] flex-shrink-0 animate-spin" />
                  ) : (
                    <Search className="h-5 w-5 text-[#FF4646] flex-shrink-0" />
                  )}
                  <div className="text-black text-base font-normal">
                    Start your search
                  </div>
                </div>
              </div>
              <button 
                className="relative p-2 hover:bg-gray-100 rounded-full flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFilterClick();
                }}
              >
                <SlidersHorizontal className="h-5 w-5 text-gray-800" />
                {getActiveFilterCount() > 0 && (
                  <div className="absolute -top-1 -right-1 bg-[#FF4646] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {getActiveFilterCount()}
                  </div>
                )}
              </button>
            </div>
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

      <DatePicker
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onSelectDates={handleDateSelect}
        initialStartDate={searchParams.dates[0] || undefined}
        initialEndDate={searchParams.dates[1] || undefined}
      />
    </>
  );
};

export default SearchBar; 