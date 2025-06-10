import React, { useState, useRef, useEffect } from 'react';
import { Search, Calendar, SlidersHorizontal, MapPin, X } from 'lucide-react';
import clsx from 'clsx';

interface DesktopSearchBarProps {
  location: string;
  onLocationChange: (location: string) => void;
  checkIn: string;
  onCheckInChange: (date: string) => void;
  checkOut: string;
  onCheckOutChange: (date: string) => void;
  onSearch: () => void;
  className?: string;
  isCompact?: boolean;
  activeFilterCount?: number;
  currentFilters?: {
    priceMin: string;
    priceMax: string;
    carType: string;
    transmission: string;
    fuelType: string;
  };
  onFiltersChange?: (filters: {
    priceMin: string;
    priceMax: string;
    carType: string;
    transmission: string;
    fuelType: string;
  }) => void;
}

const DesktopSearchBar: React.FC<DesktopSearchBarProps> = ({
  location,
  onLocationChange,
  checkIn,
  onCheckInChange,
  checkOut,
  onCheckOutChange,
  onSearch,
  className,
  isCompact = false,
  activeFilterCount = 0,
  currentFilters,
  onFiltersChange,
}) => {
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);

  // Filter state - Initialize with current values if provided
  const [priceMin, setPriceMin] = useState(currentFilters?.priceMin || '');
  const [priceMax, setPriceMax] = useState(currentFilters?.priceMax || '');
  const [carType, setCarType] = useState(currentFilters?.carType || '');
  const [transmission, setTransmission] = useState(currentFilters?.transmission || '');
  const [fuelType, setFuelType] = useState(currentFilters?.fuelType || '');

  // Sync local state with currentFilters prop changes
  useEffect(() => {
    if (currentFilters) {
      setPriceMin(currentFilters.priceMin || '');
      setPriceMax(currentFilters.priceMax || '');
      setCarType(currentFilters.carType || '');
      setTransmission(currentFilters.transmission || '');
      setFuelType(currentFilters.fuelType || '');
    }
  }, [currentFilters]);


  const formatDateRange = () => {
    if (!checkIn && !checkOut) return 'Select dates';
    if (checkIn && !checkOut) return new Date(checkIn).toLocaleDateString();
    if (checkIn && checkOut) {
      return `${new Date(checkIn).toLocaleDateString()} - ${new Date(checkOut).toLocaleDateString()}`;
    }
    return 'Select dates';
  };

  const formatCompactDateRange = () => {
    if (!checkIn && !checkOut) return 'Dates';
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      return `${start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;
    }
    return 'Dates';
  };

  const handleFilterClick = () => {
    setShowFilters(!showFilters);
    setShowDatePicker(false); // Close date picker if open
  };

  const handleDateClick = () => {
    setShowDatePicker(!showDatePicker);
    setShowFilters(false); // Close filters if open
  };

  const handleApplyDates = () => {
    setShowDatePicker(false);
  };

  const handleApplyFilters = () => {
    // Notify parent of filter changes first
    if (onFiltersChange) {
      onFiltersChange({
        priceMin,
        priceMax,
        carType,
        transmission,
        fuelType,
      });
    }
    
    // Apply the filters by calling onSearch
    onSearch();
    
    // Close the filters dropdown
    setShowFilters(false);
  };

  const clearDates = () => {
    onCheckInChange('');
    onCheckOutChange('');
  };

  const clearAllFilters = () => {
    setPriceMin('');
    setPriceMax('');
    setCarType('');
    setTransmission('');
    setFuelType('');
    
    // Notify parent of filter changes
    if (onFiltersChange) {
      onFiltersChange({
        priceMin: '',
        priceMax: '',
        carType: '',
        transmission: '',
        fuelType: '',
      });
    }
    
    // Trigger search to apply the cleared filters
    onSearch();
  };



  // Calculate dropdown position for regular search bar
  const getDropdownStyle = () => {
    if (!searchBarRef.current) return {};
    
    const rect = searchBarRef.current.getBoundingClientRect();
    return {
      position: 'fixed' as const,
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
    };
  };

  // Calculate dropdown position for compact mode
  const getCompactDropdownStyle = () => {
    const dropdownWidth = 400;
    
    // Use the same centering approach as the search bar: left-1/2 with transform
    return {
      position: 'fixed' as const,
      top: 72, // Just below the nav
      left: '50%',
      transform: 'translateX(-50%)',
      width: dropdownWidth,
      zIndex: 9999,
    };
  };

  // Compact version for navigation
  if (isCompact) {
    return (
      <>
        <div className={clsx("flex items-center justify-center", className)}>
          <div className="bg-[#2A2A2A] rounded-full shadow-lg p-1 flex items-center border border-[#3A3A3A] min-w-0 max-w-lg" ref={searchBarRef}>
            <input
              type="text"
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              onFocus={(e) => {
                // Select all text when focused
                e.target.select();
              }}
              onBlur={() => {
                onSearch(); // Trigger search when losing focus
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.currentTarget.blur(); // This will trigger onBlur and search
                }
              }}
              onClick={(e) => {
                // Select all text when clicked
                e.currentTarget.select();
              }}
              placeholder="Anywhere"
              className="px-3 py-2 bg-transparent text-white text-sm font-medium placeholder-gray-400 focus:outline-none hover:bg-[#333333] rounded-full transition-colors min-w-0 flex-1 cursor-text"
              style={{ maxWidth: '120px' }}
            />
            <div className="w-px h-4 bg-[#444444]" />
            <button
              onClick={handleDateClick}
              className="px-3 py-2 text-white text-sm font-medium truncate hover:bg-[#333333] rounded-full transition-colors"
            >
              {formatCompactDateRange()}
            </button>
            <div className="w-px h-4 bg-[#444444]" />
            
            {/* Filter indicator */}
            <button
              onClick={handleFilterClick}
              className="relative p-2 hover:bg-[#333333] rounded-full transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4 text-gray-400" />
              {activeFilterCount > 0 && (
                <div className="absolute -top-0.5 -right-0.5 bg-[#FF4646] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium text-[10px]">
                  {activeFilterCount}
                </div>
              )}
            </button>
            
            <button
              onClick={() => window.location.reload()} // Simple refresh to reset search
              className="p-2 text-gray-400 hover:text-white transition-colors hover:bg-[#333333] rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Backdrop for compact mode dropdowns */}
        {(showDatePicker || showFilters) && (
          <div 
            className="fixed inset-0 z-[9998]"
            onClick={() => {
              setShowDatePicker(false);
              setShowFilters(false);
            }}
          />
        )}



        {/* Date Picker Dropdown for compact mode */}
        {showDatePicker && (
          <div style={getCompactDropdownStyle()}>
            <div className="bg-[#2A2A2A] rounded-2xl p-4 border border-[#3A3A3A] shadow-2xl drop-shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Select dates</h3>
                <button
                  onClick={() => setShowDatePicker(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Check-in</label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => {
                      onCheckInChange(e.target.value);
                      onSearch(); // Trigger search immediately
                    }}
                    className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:border-[#FF4646] [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Check-out</label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => {
                      onCheckOutChange(e.target.value);
                      onSearch(); // Trigger search immediately
                    }}
                    className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:border-[#FF4646] [color-scheme:dark]"
                  />
                </div>
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={() => {
                    clearDates();
                    onSearch(); // Trigger search immediately when clearing
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
                >
                  Clear dates
                </button>
                <button
                  onClick={() => setShowDatePicker(false)}
                  className="px-6 py-2 bg-[#FF4646] hover:bg-[#E63E3E] text-white rounded-lg transition-colors text-sm font-medium"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters Dropdown for compact mode */}
        {showFilters && (
          <div style={getCompactDropdownStyle()}>
            <div className="bg-[#2A2A2A] rounded-2xl p-4 border border-[#3A3A3A] shadow-2xl drop-shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* Price Range */}
              <div className="mb-4">
                <h4 className="text-white font-medium mb-2">Price range</h4>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Min price"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="px-3 py-2 bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FF4646] text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max price"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="px-3 py-2 bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FF4646] text-sm"
                  />
                </div>
              </div>

              {/* Car Type */}
              <div className="mb-4">
                <h4 className="text-white font-medium mb-2">Car type</h4>
                <select
                  value={carType}
                  onChange={(e) => setCarType(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:border-[#FF4646] text-sm"
                >
                  <option value="">Any type</option>
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Convertible">Convertible</option>
                  <option value="Coupe">Coupe</option>
                  <option value="Wagon">Wagon</option>
                  <option value="Pickup">Pickup</option>
                  <option value="Van">Van</option>
                </select>
              </div>

              {/* Transmission */}
              <div className="mb-4">
                <h4 className="text-white font-medium mb-2">Transmission</h4>
                <select
                  value={transmission}
                  onChange={(e) => setTransmission(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:border-[#FF4646] text-sm"
                >
                  <option value="">Any transmission</option>
                  <option value="Manual">Manual</option>
                  <option value="Automatic">Automatic</option>
                </select>
              </div>

              {/* Fuel Type */}
              <div className="mb-4">
                <h4 className="text-white font-medium mb-2">Fuel type</h4>
                <select
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:border-[#FF4646] text-sm"
                >
                  <option value="">Any fuel type</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
                >
                  Clear all
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="px-6 py-2 bg-[#FF4646] hover:bg-[#E63E3E] text-white rounded-lg transition-colors text-sm font-medium"
                >
                  Apply filters
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className={clsx("max-w-3xl mx-auto w-full relative", className)} ref={searchBarRef}>
        <div className="bg-[#2A2A2A] rounded-full shadow-2xl p-1.5 flex items-center border border-[#3A3A3A]">
          {/* Where Field - Smaller Width */}
          <div className="flex-[0.7]">
            <div className={clsx(
              "px-5 py-3 rounded-full transition-all duration-200 mx-1",
              focusedField === 'location' ? 'bg-[#3A3A3A]' : 'hover:bg-[#333333]'
            )}>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[#FF4646] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-300 mb-1">Where</div>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => onLocationChange(e.target.value)}
                    onFocus={(e) => {
                      setFocusedField('location');
                      setTimeout(() => e.target.select(), 0);
                    }}
                    onBlur={() => setFocusedField(null)}
                    onMouseUp={(e) => e.preventDefault()}
                    placeholder="Search destinations"
                    className="w-full bg-transparent text-white text-sm placeholder-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-[#444444]" />

          {/* Select Dates Field - Smaller Width */}
          <div className="flex-[0.7] relative">
            <button
              onClick={handleDateClick}
              className={clsx(
                "w-full px-5 py-3 rounded-full transition-all duration-200 text-left mx-1",
                showDatePicker ? 'bg-[#3A3A3A]' : 'hover:bg-[#333333]'
              )}
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-[#FF4646] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-300 mb-1">When</div>
                  <div className="text-white text-sm truncate">
                    {formatDateRange()}
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Filter Button - Left of Search */}
          <button
            onClick={handleFilterClick}
            className={clsx(
              "p-3 rounded-full transition-all duration-200 ml-2",
              showFilters ? 'bg-[#FF4646] text-white' : 'text-gray-400 hover:text-white hover:bg-[#333333]'
            )}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>

          {/* Search Button */}
          <button
            onClick={onSearch}
            className="bg-[#FF4646] hover:bg-[#E63E3E] text-white px-6 py-3 mx-2 rounded-full transition-all duration-200 flex items-center gap-2 font-medium"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* Date Picker Dropdown - Fixed positioning with shadow */}
      {showDatePicker && (
        <div style={getDropdownStyle()}>
          <div className="bg-[#2A2A2A] rounded-2xl p-4 border border-[#3A3A3A] shadow-2xl drop-shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Select dates</h3>
              <button
                onClick={() => setShowDatePicker(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-gray-300 text-sm mb-2 block">Check-in</label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => onCheckInChange(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:border-[#FF4646] [color-scheme:dark]"
                />
              </div>
              
              <div>
                <label className="text-gray-300 text-sm mb-2 block">Check-out</label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => onCheckOutChange(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:border-[#FF4646] [color-scheme:dark]"
                />
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={clearDates}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm"
              >
                Clear dates
              </button>
              <button
                onClick={handleApplyDates}
                className="px-6 py-2 bg-[#FF4646] hover:bg-[#E63E3E] text-white rounded-lg transition-colors text-sm font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Dropdown - Fixed positioning with shadow */}
      {showFilters && (
        <div style={getDropdownStyle()}>
          <div className="bg-[#2A2A2A] rounded-2xl p-4 border border-[#3A3A3A] shadow-2xl drop-shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Price Range */}
              <div>
                <label className="text-gray-300 text-sm mb-2 block">Price range</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min €"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="flex-1 bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#FF4646]"
                  />
                  <input
                    type="number"
                    placeholder="Max €"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="flex-1 bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#FF4646]"
                  />
                </div>
              </div>
              
              {/* Car Type */}
              <div>
                <label className="text-gray-300 text-sm mb-2 block">Car type</label>
                <select 
                  value={carType}
                  onChange={(e) => setCarType(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FF4646]"
                >
                  <option value="">Any type</option>
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Convertible">Convertible</option>
                  <option value="Coupe">Coupe</option>
                  <option value="Wagon">Wagon</option>
                  <option value="Pickup">Pickup</option>
                  <option value="Van">Van</option>
                </select>
              </div>
              
              {/* Transmission */}
              <div>
                <label className="text-gray-300 text-sm mb-2 block">Transmission</label>
                <select 
                  value={transmission}
                  onChange={(e) => setTransmission(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FF4646]"
                >
                  <option value="">Any transmission</option>
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>
              
              {/* Fuel Type */}
              <div>
                <label className="text-gray-300 text-sm mb-2 block">Fuel type</label>
                <select 
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FF4646]"
                >
                  <option value="">Any fuel type</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm"
              >
                Clear all
              </button>
              <button
                onClick={handleApplyFilters}
                className="px-6 py-2 bg-[#FF4646] hover:bg-[#E63E3E] text-white rounded-lg transition-colors text-sm font-medium"
              >
                Apply filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop to close dropdowns when clicking outside */}
      {(showDatePicker || showFilters) && (
        <div 
          className="fixed inset-0 z-[9998]"
          onClick={() => {
            setShowDatePicker(false);
            setShowFilters(false);
          }}
        />
      )}
    </>
  );
};

export default DesktopSearchBar; 