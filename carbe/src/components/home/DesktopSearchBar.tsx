import React, { useState, useRef } from 'react';
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
}) => {
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);

  const formatDateRange = () => {
    if (!checkIn && !checkOut) return 'Select dates';
    if (checkIn && !checkOut) return new Date(checkIn).toLocaleDateString();
    if (checkIn && checkOut) {
      return `${new Date(checkIn).toLocaleDateString()} - ${new Date(checkOut).toLocaleDateString()}`;
    }
    return 'Select dates';
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
    setShowFilters(false);
  };

  const clearDates = () => {
    onCheckInChange('');
    onCheckOutChange('');
  };

  // Calculate dropdown position
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
                    onFocus={() => setFocusedField('location')}
                    onBlur={() => setFocusedField(null)}
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

      {/* Date Picker Dropdown - Fixed positioning */}
      {showDatePicker && (
        <div style={getDropdownStyle()}>
          <div className="bg-[#2A2A2A] rounded-2xl p-4 border border-[#3A3A3A] shadow-2xl">
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
                  className="w-full bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#FF4646]"
                />
              </div>
              
              <div>
                <label className="text-gray-300 text-sm mb-2 block">Check-out</label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => onCheckOutChange(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#FF4646]"
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

      {/* Filter Dropdown - Fixed positioning */}
      {showFilters && (
        <div style={getDropdownStyle()}>
          <div className="bg-[#2A2A2A] rounded-2xl p-4 border border-[#3A3A3A] shadow-2xl">
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
                    className="flex-1 bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#FF4646]"
                  />
                  <input
                    type="number"
                    placeholder="Max €"
                    className="flex-1 bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#FF4646]"
                  />
                </div>
              </div>
              
              {/* Car Type */}
              <div>
                <label className="text-gray-300 text-sm mb-2 block">Car type</label>
                <select className="w-full bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FF4646]">
                  <option value="">Any type</option>
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="hatchback">Hatchback</option>
                  <option value="coupe">Coupe</option>
                </select>
              </div>
              
              {/* Transmission */}
              <div>
                <label className="text-gray-300 text-sm mb-2 block">Transmission</label>
                <select className="w-full bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FF4646]">
                  <option value="">Any</option>
                  <option value="automatic">Automatic</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
              
              {/* Fuel Type */}
              <div>
                <label className="text-gray-300 text-sm mb-2 block">Fuel type</label>
                <select className="w-full bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FF4646]">
                  <option value="">Any</option>
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="electric">Electric</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            {/* Quick Filter Options */}
            <div className="mb-4">
              <label className="text-gray-300 text-sm mb-2 block">Features</label>
              <div className="flex flex-wrap gap-2">
                {['GPS', 'Bluetooth', 'AC', 'Heated Seats', 'Sunroof', 'Parking Sensors'].map((feature) => (
                  <button
                    key={feature}
                    className="px-3 py-1.5 bg-[#1A1A1A] hover:bg-[#FF4646] text-white rounded-lg text-xs transition-colors border border-[#3A3A3A] hover:border-[#FF4646]"
                  >
                    {feature}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={() => setShowFilters(false)}
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