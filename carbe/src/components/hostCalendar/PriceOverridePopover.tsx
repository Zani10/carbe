import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { X, Euro } from 'lucide-react';

interface PriceOverridePopoverProps {
  date: string;
  position: { x: number; y: number };
  currentPrice: number;
  basePrice: number;
  onSave: (price: number, isWeekendOverride: boolean) => void;
  onClose: () => void;
}

export default function PriceOverridePopover({
  date,
  position,
  currentPrice,
  basePrice,
  onSave,
  onClose
}: PriceOverridePopoverProps) {
  const [price, setPrice] = useState(currentPrice || basePrice);
  const [isWeekendOverride, setIsWeekendOverride] = useState(false);

  const dateObj = parseISO(date);
  const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
  const formattedDate = format(dateObj, 'MMM d, yyyy');

  const handleSave = () => {
    onSave(price, isWeekendOverride);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  // Position the popover above the clicked cell
  const popoverStyle: React.CSSProperties = {
    position: 'fixed',
    left: position.x - 132, // Half of popover width (264px / 2)
    top: position.y - 280, // Above the cell
    zIndex: 1000
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-50"
        onClick={onClose}
      />

      {/* Popover */}
      <div
        style={popoverStyle}
        className="bg-[#212121] rounded-lg shadow-xl border border-gray-700 w-64 z-50"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-base font-semibold text-white">Edit Price</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-4">
            <p className="text-white font-medium">{formattedDate}</p>
            <p className="text-xs text-gray-400">
              Current: €{currentPrice} • Base: €{basePrice}
              {isWeekend && <span className="ml-2 text-orange-400">Weekend</span>}
            </p>
          </div>

          {/* Price Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Price per night
            </label>
            <div className="relative">
              <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#FF2800] focus:border-transparent"
                placeholder={basePrice.toString()}
                min="1"
                autoFocus
              />
            </div>
          </div>

          {/* Quick Presets */}
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Quick presets:</p>
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => setPrice(basePrice)}
                className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
              >
                Base (€{basePrice})
              </button>
              <button
                onClick={() => setPrice(Math.round(basePrice * 1.2))}
                className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
              >
                +20%
              </button>
              <button
                onClick={() => setPrice(Math.round(basePrice * 1.5))}
                className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
              >
                +50%
              </button>
            </div>
          </div>

          {/* Weekend Override */}
          {isWeekend && (
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isWeekendOverride}
                  onChange={(e) => setIsWeekendOverride(e.target.checked)}
                  className="text-[#FF2800] bg-gray-700 border-gray-600 focus:ring-[#FF2800] focus:ring-2 rounded"
                />
                <span className="ml-2 text-white text-sm">
                  Set as weekend rate
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-2 p-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-3 py-2 text-gray-400 hover:text-white text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-2 bg-[#FF2800] text-white rounded-lg text-sm hover:bg-[#FF2800]/90 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </>
  );
} 