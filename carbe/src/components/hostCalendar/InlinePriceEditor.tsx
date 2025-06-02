import React, { useState, useRef, useEffect } from 'react';
import { Check, X, Plus, DollarSign } from 'lucide-react';
import { BulkOperation } from '@/types/calendar';
import { format } from 'date-fns';

interface InlinePriceEditorProps {
  selectedDatesCount: number;
  selectedDates: string[];
  selectedCarIds: string[];
  onBulkOperation: (operation: BulkOperation) => Promise<void>;
  onClear: () => void;
}

export default function InlinePriceEditor({
  selectedDatesCount,
  selectedDates,
  selectedCarIds,
  onBulkOperation,
  onClear
}: InlinePriceEditorProps) {
  const [price, setPrice] = useState('130');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedDatesCount > 0) {
      setTimeout(() => setIsVisible(true), 50);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } else {
      setIsVisible(false);
    }
  }, [selectedDatesCount]);

  // Notify parent about selection mode for bottom navbar fade
  useEffect(() => {
    const event = new CustomEvent('selectionModeChange', { 
      detail: { isSelecting: selectedDatesCount > 0 } 
    });
    window.dispatchEvent(event);
  }, [selectedDatesCount]);

  if (selectedDatesCount === 0) return null;

  const handleSubmit = async () => {
    const priceValue = parseFloat(price);
    if (!price || isNaN(priceValue) || priceValue <= 0) return;

    setIsProcessing(true);
    try {
      await onBulkOperation({
        type: 'pricing',
        dates: selectedDates,
        carIds: selectedCarIds,
        value: priceValue
      });
      onClear();
    } catch (error) {
      console.error('Price update failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      onClear();
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
      return `${format(startDate, 'MMM d')}–${format(endDate, 'd')}`;
    }
  };

  const isValidPrice = price && !isNaN(parseFloat(price)) && parseFloat(price) > 0;

  return (
    <>
      {/* Date Range Indicator at Top */}
      <div 
        className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ease-out ${
          isVisible 
            ? 'opacity-100 translate-y-0 scale-100' 
            : 'opacity-0 -translate-y-8 scale-95'
        }`}
      >
        <div className="bg-black/90 backdrop-blur-xl text-white px-6 py-3 rounded-full text-sm font-medium flex items-center space-x-3 shadow-2xl border border-white/10">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-[#FF4646] rounded-full animate-pulse"></div>
            <span className="font-semibold">{getDateRange()}</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-300 text-xs">{selectedDatesCount} {selectedDatesCount === 1 ? 'day' : 'days'}</span>
          </div>
          <button
            onClick={onClear}
            className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Action Cards */}
      <div 
        className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ease-out ${
          isVisible 
            ? 'opacity-100 translate-y-0 scale-100' 
            : 'opacity-0 translate-y-8 scale-95'
        }`}
      >
        <div className="flex items-center space-x-4 px-6">
          {/* Price per night Card */}
          <div className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-3xl p-6 min-w-[200px] border border-white/20 shadow-2xl hover:shadow-[#FF4646]/20 transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full shadow-lg shadow-blue-400/30"></div>
                  <span className="text-white text-sm font-semibold">Price per night</span>
                </div>
                <DollarSign className="w-4 h-4 text-blue-400 opacity-60" />
              </div>
              
              <div className="flex items-center mb-4">
                <span className="text-white text-3xl font-bold mr-1">$</span>
                <input
                  ref={inputRef}
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="text-white text-3xl font-bold bg-transparent focus:outline-none w-24 placeholder-gray-500"
                  placeholder="130"
                  min="1"
                  step="1"
                />
              </div>
              
              <p className="text-gray-300 text-xs mb-4 leading-relaxed">Set custom pricing for selected dates</p>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={onClear}
                  className="p-2.5 bg-white/10 rounded-full hover:bg-white/20 transition-all duration-200 hover:scale-110"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!isValidPrice || isProcessing}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-2xl font-medium transition-all duration-200 ${
                    isProcessing
                      ? 'bg-blue-500/20 text-blue-300 cursor-not-allowed'
                      : isValidPrice
                        ? 'bg-white text-black hover:bg-gray-100 hover:scale-105 active:scale-95 shadow-lg'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                  }`}
                >
                  {isProcessing ? (
                    <div className="w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span className="text-sm">Update Price</span>
                </button>
              </div>
            </div>
          </div>

          {/* Custom Settings Card */}
          <div className="group relative bg-gradient-to-br from-white/8 to-white/3 backdrop-blur-2xl rounded-3xl p-6 border border-white/15 shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white text-sm font-semibold">Advanced</span>
                <Plus className="w-4 h-4 text-purple-400 opacity-60" />
              </div>
              
              <p className="text-gray-400 text-xs mb-4 leading-relaxed">Bulk operations & smart rules</p>
              
              <button className="w-full p-2.5 bg-white/10 rounded-2xl hover:bg-white/20 transition-all duration-200 hover:scale-105 group">
                <Plus className="w-4 h-4 text-white mx-auto group-hover:rotate-90 transition-transform duration-200" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 