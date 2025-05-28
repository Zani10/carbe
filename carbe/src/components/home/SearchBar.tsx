import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ChevronLeft, X, MapPin, Calendar, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import FilterModal from './FilterModal';
import { FilterState } from './FilterModal';

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
  const [activeSection, setActiveSection] = useState<'location' | 'dates' | null>(null);
  const [searchParams, setSearchParams] = useState({
    location: '',
    dates: [null, null] as [Date | null, Date | null],
  });
  const [hasSearched, setHasSearched] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState | null>(null);

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

  // Auto-scroll to date section when it becomes active
  useEffect(() => {
    if (activeSection === 'dates') {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        const dateSection = document.querySelector('[data-date-section]');
        if (dateSection) {
          dateSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [activeSection]);

  const handleDatesSelect = (dates: [Date | null, Date | null]) => {
    setSearchParams({
      ...searchParams,
      dates,
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
    if (activeFilters.features.length > 0) count++;
    if (activeFilters.ecoFriendly.length > 0) count++;
    if (activeFilters.years.length > 0) count++;
    if (activeFilters.seats.length > 0) count++;
    if (activeFilters.transmission.length > 0) count++;
    if (activeFilters.priceRange[0] > 10 || activeFilters.priceRange[1] < 500) count++;
    if (activeFilters.mileage < 100) count++;
    if (activeFilters.deliveryOption) count++;
    if (activeFilters.deluxeClass) count++;
    
    return count;
  };

  const renderLocationOptions = () => {
    const locations = [
      { id: 'nearby', name: 'Nearby', description: 'Cars around your current location' },
      { id: 'anywhere', name: 'Anywhere', description: 'Search in all locations' },
      { id: 'new_york', name: 'New York, NY', description: 'Popular destination' },
      { id: 'los_angeles', name: 'Los Angeles, CA', description: 'Popular destination' },
      { id: 'miami', name: 'Miami, FL', description: 'Popular destination' },
      { id: 'chicago', name: 'Chicago, IL', description: 'Popular destination' },
      { id: 'san_francisco', name: 'San Francisco, CA', description: 'Popular destination' },
      { id: 'seattle', name: 'Seattle, WA', description: 'Popular destination' },
    ];

    return (
      <div className="h-[60vh] max-h-[500px] overflow-y-auto mt-2 py-2">
        {locations.map((location) => (
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
    const dateOptions = [
      { 
        id: 'anytime', 
        label: 'Anytime',
        description: 'Flexible dates',
        action: () => handleDatesSelect([null, null])
      },
      { 
        id: 'weekend', 
        label: 'This weekend',
        description: 'Saturday - Sunday',
        action: () => {
          const now = new Date();
          const saturday = new Date(now);
          const sunday = new Date(now);
          
          // Find next Saturday
          const daysUntilSaturday = (6 - now.getDay()) % 7;
          saturday.setDate(now.getDate() + (daysUntilSaturday || 7));
          
          // Sunday is next day
          sunday.setDate(saturday.getDate() + 1);
          
          handleDatesSelect([saturday, sunday]);
        }
      },
      { 
        id: 'week', 
        label: 'This week',
        description: 'Next 7 days',
        action: () => {
          const now = new Date();
          const nextWeek = new Date(now);
          nextWeek.setDate(now.getDate() + 7);
          handleDatesSelect([now, nextWeek]);
        }
      },
      { 
        id: 'next_weekend', 
        label: 'Next weekend',
        description: 'Next Saturday - Sunday',
        action: () => {
          const now = new Date();
          const nextSaturday = new Date(now);
          const nextSunday = new Date(now);
          
          // Find next Saturday (if today is Saturday, get the following one)
          const daysUntilSaturday = ((6 - now.getDay()) % 7) || 7;
          nextSaturday.setDate(now.getDate() + daysUntilSaturday);
          
          // Sunday is next day
          nextSunday.setDate(nextSaturday.getDate() + 1);
          
          handleDatesSelect([nextSaturday, nextSunday]);
        }
      },
      { 
        id: 'month', 
        label: 'This month',
        description: 'Next 30 days',
        action: () => {
          const now = new Date();
          const nextMonth = new Date(now);
          nextMonth.setDate(now.getDate() + 30);
          handleDatesSelect([now, nextMonth]);
        }
      },
    ];

    return (
      <div data-date-section className="h-[60vh] max-h-[500px] overflow-y-auto mt-2 py-2">
        <div className="px-4 py-2 mb-4">
          <div className="text-lg font-medium text-white mb-1">When would you like to rent?</div>
          <div className="text-gray-400">Select a date range or choose from options below</div>
        </div>
        
        {/* Date options */}
        <div className="px-4 space-y-2">
          {dateOptions.map((option) => (
            <div
              key={option.id}
              className="flex items-center justify-between py-4 hover:bg-gray-700/20 rounded-lg cursor-pointer px-4"
              onClick={option.action}
            >
              <div className="flex items-center">
                <div className="bg-gray-700 rounded-full p-2 mr-3 flex-shrink-0">
                  <Calendar size={16} className="text-white" />
                </div>
                <div>
                  <div className="text-white font-medium">{option.label}</div>
                  <div className="text-gray-400 text-sm">{option.description}</div>
                </div>
              </div>
              {/* Show if this option is currently selected */}
              {((option.id === 'anytime' && !searchParams.dates[0] && !searchParams.dates[1]) ||
                (searchParams.dates[0] && searchParams.dates[1] && 
                 ((option.id === 'weekend' && isThisWeekend(searchParams.dates)) ||
                  (option.id === 'week' && isThisWeek(searchParams.dates)) ||
                  (option.id === 'month' && isThisMonth(searchParams.dates))))) && (
                <div className="w-2 h-2 bg-[#FF4646] rounded-full"></div>
              )}
            </div>
          ))}
        </div>

        {/* Simple date input section */}
        <div className="px-4 mt-6">
          <div className="bg-gray-800 rounded-2xl p-4">
            <div className="text-white font-medium mb-4">Custom dates</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm block mb-2">Start date</label>
                <input
                  type="date"
                  value={searchParams.dates[0] ? searchParams.dates[0].toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const startDate = e.target.value ? new Date(e.target.value) : null;
                    handleDatesSelect([startDate, searchParams.dates[1]]);
                  }}
                  className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-[#FF4646] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-2">End date</label>
                <input
                  type="date"
                  value={searchParams.dates[1] ? searchParams.dates[1].toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const endDate = e.target.value ? new Date(e.target.value) : null;
                    handleDatesSelect([searchParams.dates[0], endDate]);
                  }}
                  className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-[#FF4646] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Helper functions to check if dates match predefined options
  const isThisWeekend = (dates: [Date | null, Date | null]) => {
    if (!dates[0] || !dates[1]) return false;
    const diffTime = Math.abs(dates[1].getTime() - dates[0].getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 2 && dates[0].getDay() === 6; // Saturday
  };

  const isThisWeek = (dates: [Date | null, Date | null]) => {
    if (!dates[0] || !dates[1]) return false;
    const diffTime = Math.abs(dates[1].getTime() - dates[0].getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 6 && diffDays <= 8;
  };

  const isThisMonth = (dates: [Date | null, Date | null]) => {
    if (!dates[0] || !dates[1]) return false;
    const diffTime = Math.abs(dates[1].getTime() - dates[0].getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 28 && diffDays <= 32;
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
                        'Any week'
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
                    placeholder="Enter location"
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
    </>
  );
};

export default SearchBar; 