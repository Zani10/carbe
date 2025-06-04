import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { BulkOperation, CalendarData } from '@/types/calendar';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface MinimalSelectionBarProps {
  selectedDatesCount: number;
  selectedDates: string[];
  selectedCarIds: string[];
  calendarData?: CalendarData; // Add calendar data to determine current state
  onBulkOperation: (operation: BulkOperation) => Promise<void>;
  onClear: () => void;
}

export default function MinimalSelectionBar({
  selectedDatesCount,
  selectedDates,
  selectedCarIds,
  calendarData,
  onBulkOperation,
  onClear
}: MinimalSelectionBarProps) {
  const [isUpdatingAvailability, setIsUpdatingAvailability] = useState(false);
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);
  const [priceInputValue, setPriceInputValue] = useState('75');
  const [showPricePopover, setShowPricePopover] = useState(false);
  const [showCustomSettings, setShowCustomSettings] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  
  // Determine current availability status based on selected dates and calendar data
  const getCurrentAvailabilityStatus = () => {
    if (!calendarData || selectedDates.length === 0 || selectedCarIds.length === 0) {
      return true; // Default to available
    }
    
    // Check if any of the selected dates are blocked for any of the selected cars
    let hasBlocked = false;
    let hasAvailable = false;
    
    for (const carId of selectedCarIds) {
      for (const date of selectedDates) {
        const isBlocked = calendarData.availability?.[carId]?.[date] === 'blocked';
        if (isBlocked) {
          hasBlocked = true;
        } else {
          hasAvailable = true;
        }
      }
    }
    
    // If we have mixed states, show as available (so clicking will block)
    // If all are blocked, show as blocked (so clicking will make available)
    return hasBlocked && !hasAvailable ? false : true;
  };
  
  const isAvailable = getCurrentAvailabilityStatus();
  
  // Get current price from calendar data
  const getCurrentPrice = () => {
    if (!calendarData || selectedDates.length === 0 || selectedCarIds.length === 0) {
      return '75'; // Default price
    }
    
    // Get price from the first selected date and car (for simplicity)
    const firstCarId = selectedCarIds[0];
    const firstDate = selectedDates[0];
    const priceOverride = calendarData.pricingOverrides?.[firstCarId]?.[firstDate];
    
    return priceOverride ? priceOverride.toString() : '75';
  };
  
  // Update price input when selection changes
  useEffect(() => {
    const currentPrice = getCurrentPrice();
    setPriceInputValue(currentPrice);
  }, [selectedDates, selectedCarIds, calendarData]);

  // Mobile keyboard detection
  useEffect(() => {
    const handleViewportChange = () => {
      if (typeof window !== 'undefined') {
        const viewportHeight = window.visualViewport?.height || window.innerHeight;
        const windowHeight = window.innerHeight;
        const keyboardHeight = Math.max(0, windowHeight - viewportHeight);
        setKeyboardHeight(keyboardHeight);
      }
    };

    if (typeof window !== 'undefined' && window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      return () => {
        window.visualViewport?.removeEventListener('resize', handleViewportChange);
      };
    }
  }, []);

  // Notify parent about selection mode for bottom navbar fade
  useEffect(() => {
    const event = new CustomEvent('selectionModeChange', { 
      detail: { isSelecting: selectedDatesCount > 0 } 
    });
    window.dispatchEvent(event);
  }, [selectedDatesCount]);

  if (selectedDatesCount === 0) return null;

  const handleAvailabilityToggle = async () => {
    if (isUpdatingAvailability) return;
    
    const newStatus = isAvailable ? 'blocked' : 'available';
    console.log('MinimalSelectionBar: Starting availability update', {
      selectedDates,
      selectedCarIds,
      datesCount: selectedDates.length,
      carsCount: selectedCarIds.length,
      currentStatus: isAvailable ? 'available' : 'blocked',
      newStatus
    });
    
    setIsUpdatingAvailability(true);
    try {
      await onBulkOperation({
        type: 'availability',
        dates: selectedDates,
        carIds: selectedCarIds,
        value: newStatus
      });
      console.log('MinimalSelectionBar: Availability update successful, new status:', newStatus);
    } catch (error) {
      console.error('MinimalSelectionBar: Availability update failed:', error);
      // Show user-friendly error
      alert('Failed to update availability. Please try again.');
    } finally {
      setIsUpdatingAvailability(false);
    }
  };

  const handlePriceUpdate = async () => {
    if (isUpdatingPrice) return;
    
    setIsUpdatingPrice(true);
    try {
      const price = parseInt(priceInputValue);
      if (price > 0) {
        await onBulkOperation({
          type: 'pricing',
          dates: selectedDates,
          carIds: selectedCarIds,
          value: price
        });
        setShowPricePopover(false);
      }
    } catch (error) {
      console.error('Price update failed:', error);
    } finally {
      setIsUpdatingPrice(false);
    }
  };

  // Get date range for display
  const getDateRange = () => {
    if (selectedDates.length === 0) return '';
    
    const sortedDates = [...selectedDates].sort();
    const startDate = new Date(sortedDates[0]);
    const endDate = new Date(sortedDates[sortedDates.length - 1]);
    
    if (sortedDates.length === 1) {
      return format(startDate, 'MMM d');
    } else {
      return `${format(startDate, 'MMM d')} – ${format(endDate, 'd')}`;
    }
  };

  return (
    <>
      <AnimatePresence key="selection-bar">
        {selectedDatesCount > 0 && (
          <motion.div
            initial={{ y: 140 }}
            animate={{ y: 0 }}
            exit={{ y: 140 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed left-0 right-0 z-50 bg-gradient-to-t from-[#1A1A1A] to-[#212121] rounded-t-3xl p-4 shadow-2xl border-t border-gray-700/30"
            style={{ 
              height: '140px',
              bottom: keyboardHeight > 0 ? `${keyboardHeight + 20}px` : '0px'
            }}
          >
          {/* Date Range Pill */}
          <div className="flex justify-center mb-4">
            <div className="bg-[#2A2A2A] rounded-full py-1.5 px-4 flex items-center justify-between min-w-[110px]">
              <span className="text-white text-sm">
                {getDateRange()}
              </span>
              <button
                onClick={onClear}
                className="ml-2 p-0.5 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Clear date selection"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Three Control Cards */}
          <div className="flex items-center justify-center space-x-3">
            {/* Availability Toggle Card */}
            <motion.div
              whileTap={{ scale: 0.96 }}
              onClick={handleAvailabilityToggle}
              className={`w-20 h-20 rounded-lg bg-[#1F1F1F] p-2 flex flex-col items-center justify-center cursor-pointer ${
                isUpdatingAvailability ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              <span className="text-xs font-medium mb-1 text-white">
                {isUpdatingAvailability ? 'Updating...' : (isAvailable ? 'Available' : 'Blocked')}
              </span>
              
              {/* Toggle Switch */}
              <div className={`w-10 h-5 rounded-full transition-colors duration-150 ${
                isAvailable ? 'bg-[#00A680]' : 'bg-[#FF2800]'
              }`}>
                <motion.div
                  className="w-4 h-4 bg-white rounded-full mt-0.5"
                  animate={{ x: isAvailable ? 24 : 4 }}
                  transition={{ duration: 0.15 }}
                />
              </div>
            </motion.div>

            {/* Price Card */}
            <div className="relative">
              <motion.div
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  setShowPricePopover(true);
                }}
                className="w-20 h-20 rounded-lg bg-[#1F1F1F] p-2 flex flex-col items-center justify-center cursor-pointer"
              >
                <span className="text-xs text-gray-400 mb-1">Price</span>
                <span className="text-white text-lg font-semibold">€{priceInputValue}</span>
              </motion.div>

              {/* Price Popover */}
              <AnimatePresence key="price-popover">
                {showPricePopover && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-[#2A2A2A] rounded-lg p-3 shadow-xl"
                  >
                    <input
                      type="number"
                      value={priceInputValue}
                      onChange={(e) => setPriceInputValue(e.target.value)}
                      className="bg-[#2A2A2A] text-white text-lg text-center w-24 border border-gray-600 rounded-md px-2 py-1"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handlePriceUpdate();
                        }
                      }}
                    />
                    <button
                      onClick={handlePriceUpdate}
                      disabled={isUpdatingPrice}
                      className="bg-[#FF2800] text-white rounded-md py-1 px-3 mt-2 w-full text-sm disabled:opacity-50"
                    >
                      {isUpdatingPrice ? 'Saving...' : 'Save'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Custom Settings Card */}
            <motion.div
              whileTap={{ scale: 0.96 }}
              onClick={() => setShowCustomSettings(true)}
              className="w-20 h-20 rounded-lg bg-[#1F1F1F] p-2 flex flex-col items-center justify-center cursor-pointer"
            >
              <span className="text-xs text-gray-400 mb-1">More</span>
              <Plus className="w-6 h-6 text-[#FF2800]" />
            </motion.div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
      
      {/* Custom Settings Overlay */}
      <AnimatePresence key="custom-settings">
        {showCustomSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setShowCustomSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#212121] rounded-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-white text-lg font-semibold mb-4">Custom Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Minimum stay (nights)</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full bg-[#2A2A2A] text-white rounded-lg px-3 py-2 border border-gray-600"
                    placeholder="1"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Weekend price</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full bg-[#2A2A2A] text-white rounded-lg px-3 py-2 border border-gray-600"
                    placeholder="Weekend markup"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Special event override</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full bg-[#2A2A2A] text-white rounded-lg px-3 py-2 border border-gray-600"
                    placeholder="Special pricing"
                  />
                </div>
              </div>

              <button
                onClick={() => setShowCustomSettings(false)}
                className="w-full bg-[#FF2800] text-white rounded-lg py-3 mt-6 font-medium"
              >
                Save All
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 