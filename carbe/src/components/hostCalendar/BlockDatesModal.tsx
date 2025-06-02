import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { X, Calendar } from 'lucide-react';
import { BulkOperation } from '@/types/calendar';

interface BlockDatesModalProps {
  selectedDates: string[];
  selectedCarIds: string[];
  onConfirm: (operation: BulkOperation) => void;
  onClose: () => void;
}

export default function BlockDatesModal({
  selectedDates,
  selectedCarIds,
  onConfirm,
  onClose
}: BlockDatesModalProps) {
  const [operation, setOperation] = useState<'block' | 'unblock'>('block');
  const [applyToAllVehicles, setApplyToAllVehicles] = useState(true);

  const sortedDates = [...selectedDates].sort();
  const dateRangeText = formatDateRange(sortedDates);

  function formatDateRange(dates: string[]): string {
    if (dates.length === 0) return '';
    if (dates.length === 1) return format(parseISO(dates[0]), 'MMM d');
    
    // Group consecutive dates
    const ranges: string[] = [];
    let start = 0;
    
    for (let i = 1; i <= dates.length; i++) {
      if (i === dates.length || 
          new Date(dates[i]).getTime() - new Date(dates[i-1]).getTime() > 24 * 60 * 60 * 1000) {
        // End of consecutive range
        if (start === i - 1) {
          ranges.push(format(parseISO(dates[start]), 'MMM d'));
        } else {
          ranges.push(`${format(parseISO(dates[start]), 'MMM d')}–${format(parseISO(dates[i-1]), 'MMM d')}`);
        }
        start = i;
      }
    }
    
    return ranges.join(', ');
  }

  const handleConfirm = () => {
    const bulkOperation: BulkOperation = {
      type: 'availability',
      dates: selectedDates,
      carIds: applyToAllVehicles ? selectedCarIds : selectedCarIds,
      value: operation === 'block' ? 'blocked' : 'available'
    };
    
    onConfirm(bulkOperation);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#212121] rounded-xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Edit Availability</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Selected Dates */}
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <Calendar className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-400">Selected dates</span>
            </div>
            <p className="text-white font-medium">{dateRangeText}</p>
            <p className="text-xs text-gray-500 mt-1">
              {selectedDates.length} date{selectedDates.length > 1 ? 's' : ''} selected
            </p>
          </div>

          {/* Operation Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              What would you like to do?
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="block"
                  checked={operation === 'block'}
                  onChange={(e) => setOperation(e.target.value as 'block')}
                  className="text-[#FF2800] bg-gray-700 border-gray-600 focus:ring-[#FF2800] focus:ring-2"
                />
                <span className="ml-3 text-white">Block these dates</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="unblock"
                  checked={operation === 'unblock'}
                  onChange={(e) => setOperation(e.target.value as 'unblock')}
                  className="text-[#FF2800] bg-gray-700 border-gray-600 focus:ring-[#FF2800] focus:ring-2"
                />
                <span className="ml-3 text-white">Unblock these dates</span>
              </label>
            </div>
          </div>

          {/* Vehicle Selection */}
          {selectedCarIds.length > 1 && (
            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={applyToAllVehicles}
                  onChange={(e) => setApplyToAllVehicles(e.target.checked)}
                  className="text-[#FF2800] bg-gray-700 border-gray-600 focus:ring-[#FF2800] focus:ring-2 rounded"
                />
                <span className="ml-3 text-white">
                  Apply to all selected vehicles ({selectedCarIds.length})
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-[#FF2800] text-white rounded-lg hover:bg-[#FF2800]/90 transition-colors"
          >
            {operation === 'block' ? 'Block' : 'Unblock'} Dates
          </button>
        </div>
      </div>
    </div>
  );
} 