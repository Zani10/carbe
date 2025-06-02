import React, { useState, useEffect } from 'react';
import { Check, X, Plus } from 'lucide-react';
import { BulkOperation } from '@/types/calendar';
import { format } from 'date-fns';

interface MinimalSelectionBarProps {
  selectedDatesCount: number;
  selectedDates: string[];
  selectedCarIds: string[];
  activeTab: 'availability' | 'pricing';
  onBulkOperation: (operation: BulkOperation) => Promise<void>;
  onClear: () => void;
}

export default function MinimalSelectionBar({
  selectedDatesCount,
  selectedDates,
  selectedCarIds,
  activeTab,
  onBulkOperation,
  onClear
}: MinimalSelectionBarProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  useEffect(() => {
    if (selectedDatesCount > 0) {
      setTimeout(() => setIsVisible(true), 50);
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

  const handleAction = async (action: 'available' | 'blocked') => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setProcessingAction(action);
    try {
      await onBulkOperation({
        type: 'availability',
        dates: selectedDates,
        carIds: selectedCarIds,
        value: action
      });
      onClear();
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setIsProcessing(false);
      setProcessingAction(null);
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

  return (
    <div 
      className={`w-full transition-all duration-300 ease-out ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 -translate-y-4'
      }`}
    >
      {activeTab === 'availability' && (
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-2xl">
          {/* Header with selected info and clear button */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-[#FF4646] rounded-full"></div>
              <span className="text-white font-medium">
                {selectedDatesCount} {selectedDatesCount === 1 ? 'day' : 'days'} selected
              </span>
              <span className="text-gray-400 text-sm">• {getDateRange()}</span>
            </div>
            <button
              onClick={onClear}
              className="text-gray-400 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Compact Action Buttons */}
          <div className="flex gap-3">
            {/* Available Button */}
            <button
              onClick={() => handleAction('available')}
              disabled={isProcessing}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                processingAction === 'available'
                  ? 'bg-emerald-500/20 text-emerald-300 cursor-not-allowed'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600 hover:scale-[1.02] active:scale-95 shadow-lg'
              }`}
            >
              {processingAction === 'available' ? (
                <div className="w-4 h-4 border-2 border-emerald-300 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>Available</span>
            </button>

            {/* Block Button */}
            <button
              onClick={() => handleAction('blocked')}
              disabled={isProcessing}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                processingAction === 'blocked'
                  ? 'bg-red-500/20 text-red-300 cursor-not-allowed'
                  : 'bg-[#FF4646] text-white hover:bg-[#FF4646]/90 hover:scale-[1.02] active:scale-95 shadow-lg'
              }`}
            >
              {processingAction === 'blocked' ? (
                <div className="w-4 h-4 border-2 border-red-300 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <X className="w-4 h-4" />
              )}
              <span>Block</span>
            </button>

            {/* Advanced Options Button */}
            <button className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-[1.02] group">
              <Plus className="w-4 h-4 text-white group-hover:rotate-90 transition-transform duration-200" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 