import React, { useState } from 'react';
import { Search, Calendar, SlidersHorizontal, MapPin } from 'lucide-react';
import clsx from 'clsx';

interface DesktopSearchBarProps {
  location: string;
  onLocationChange: (location: string) => void;
  checkIn: string;
  onCheckInChange: (date: string) => void;
  checkOut: string;
  onCheckOutChange: (date: string) => void;
  onSearch: () => void;
  onFilterClick: () => void;
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
  onFilterClick,
  className,
}) => {
  const [focusedField, setFocusedField] = useState<string | null>(null);

  return (
    <div className={clsx("max-w-3xl mx-auto w-full", className)}>
      <div className="bg-[#2A2A2A] rounded-full shadow-2xl p-2 flex items-center border border-gray-700 hover:border-gray-600 transition-colors">
        <div className="flex-1 flex items-center divide-x divide-gray-600">
          {/* Location */}
          <div className="flex-1 px-4 py-3 relative">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Where
                </label>
                <input
                  type="text"
                  placeholder="Search destinations"
                  value={location}
                  onChange={(e) => onLocationChange(e.target.value)}
                  onFocus={() => setFocusedField('location')}
                  onBlur={() => setFocusedField(null)}
                  className={clsx(
                    "w-full text-sm text-white placeholder-gray-500 bg-transparent border-0 p-0 focus:ring-0 focus:outline-none",
                    focusedField === 'location' && "text-[#FF4646]"
                  )}
                />
              </div>
            </div>
          </div>

          {/* Date Range */}
          <div className="flex-1 px-4 py-3 relative">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
              <div className="flex-1 grid grid-cols-2 gap-3">
                {/* Check In */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Check in
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => onCheckInChange(e.target.value)}
                    onFocus={() => setFocusedField('checkin')}
                    onBlur={() => setFocusedField(null)}
                    className={clsx(
                      "w-full text-sm text-white bg-transparent border-0 p-0 focus:ring-0 focus:outline-none",
                      "[color-scheme:dark]",
                      focusedField === 'checkin' && "text-[#FF4646]"
                    )}
                  />
                </div>

                {/* Check Out */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Check out
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => onCheckOutChange(e.target.value)}
                    onFocus={() => setFocusedField('checkout')}
                    onBlur={() => setFocusedField(null)}
                    className={clsx(
                      "w-full text-sm text-white bg-transparent border-0 p-0 focus:ring-0 focus:outline-none",
                      "[color-scheme:dark]",
                      focusedField === 'checkout' && "text-[#FF4646]"
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Button */}
        <button
          onClick={onFilterClick}
          className="ml-2 bg-[#333333] hover:bg-[#404040] text-white p-3 rounded-full transition-colors duration-200 border border-gray-600"
          aria-label="Filters"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>

        {/* Search Button */}
        <button
          onClick={onSearch}
          className="ml-2 bg-[#FF4646] hover:bg-red-600 text-white p-3 rounded-full transition-colors duration-200"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default DesktopSearchBar; 