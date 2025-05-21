import React, { useState } from 'react';
import { Search, SlidersHorizontal, ChevronLeft, X, MapPin, Calendar } from 'lucide-react';
import clsx from 'clsx';
import FilterModal from './FilterModal';
import { FilterState } from './FilterModal';

interface SearchBarProps {
  onSearch?: (searchParams: {
    location: string;
    dates: [Date | null, Date | null];
  }) => void;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'location' | 'dates' | null>(null);
  const [searchParams, setSearchParams] = useState({
    location: '',
    dates: [null, null] as [Date | null, Date | null],
  });
  const [hasSearched, setHasSearched] = useState(false);

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
      onSearch(searchParams);
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
    // Handle filters application
  };

  const renderLocationOptions = () => {
    const locations = [
      { id: 'nearby', name: 'Nearby', description: 'Cars around your current location' },
      { id: 'anywhere', name: 'Anywhere', description: 'Search in all locations' },
      { id: 'new_york', name: 'New York, NY', description: 'Popular destination' },
      { id: 'los_angeles', name: 'Los Angeles, CA', description: 'Popular destination' },
      { id: 'miami', name: 'Miami, FL', description: 'Popular destination' },
    ];

    return (
      <div className="max-h-64 overflow-y-auto mt-2 py-2">
        {locations.map((location) => (
          <div
            key={location.id}
            className="flex items-center px-4 py-3 hover:bg-gray-700/20 rounded-lg cursor-pointer"
            onClick={() => handleLocationSelect(location.name)}
          >
            <div className="bg-gray-700 rounded-full p-2 mr-3">
              <MapPin size={16} className="text-white" />
            </div>
            <div>
              <div className="text-white font-medium">{location.name}</div>
              <div className="text-gray-400 text-sm">{location.description}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderDateSelector = () => {
    // This would be replaced with a proper date picker component
    const dateOptions = [
      { id: 'anytime', label: 'Anytime' },
      { id: 'weekend', label: 'This weekend' },
      { id: 'week', label: 'This week' },
      { id: 'month', label: 'This month' },
      { id: 'custom', label: 'Custom dates' },
    ];

    return (
      <div className="max-h-64 overflow-y-auto mt-2 py-2">
        <div className="px-4 py-2 mb-4">
          <div className="text-lg font-medium text-white mb-1">When would you like to rent?</div>
          <div className="text-gray-400">Select a date range or choose from options below</div>
        </div>
        {dateOptions.map((option) => (
          <div
            key={option.id}
            className="flex items-center px-4 py-3 hover:bg-gray-700/20 rounded-lg cursor-pointer"
            onClick={() => {
              const now = new Date();
              const nextWeek = new Date(now);
              nextWeek.setDate(now.getDate() + 7);
              handleDatesSelect([now, nextWeek]);
            }}
          >
            <div className="bg-gray-700 rounded-full p-2 mr-3">
              <Calendar size={16} className="text-white" />
            </div>
            <div className="text-white font-medium">{option.label}</div>
          </div>
        ))}
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
                  <Search className="h-5 w-5 text-[#FF4646] mr-2 flex-shrink-0" />
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
                  className="p-2 hover:bg-gray-100 rounded-full flex-shrink-0"
                >
                  <SlidersHorizontal className="h-5 w-5 text-gray-800" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <FilterModal 
          isOpen={isFilterModalOpen} 
          onClose={() => setIsFilterModalOpen(false)}
          onApplyFilters={handleApplyFilters}
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
            <div className="relative bg-white rounded-full shadow-md flex items-center py-3 px-4 w-full" onClick={handleExpandSearch}>
              <div className="flex-grow flex justify-center items-center mr-2">
                <Search className="h-5 w-5 text-[#FF4646] mr-2 flex-shrink-0" />
                <div className="bg-transparent focus:outline-none text-black placeholder-gray-500 text-base font-normal">
                  Start your search
                </div>
              </div>
              <button 
                className="p-2 hover:bg-gray-100 rounded-full flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFilterClick();
                }}
              >
                <SlidersHorizontal className="h-5 w-5 text-gray-800" />
              </button>
            </div>
          </div>
        )}
      </div>

      <FilterModal 
        isOpen={isFilterModalOpen} 
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={handleApplyFilters}
      />
    </>
  );
};

export default SearchBar; 