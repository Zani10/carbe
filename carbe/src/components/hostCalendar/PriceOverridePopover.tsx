import React, { useState, useEffect } from 'react';
import { DateCellData } from '@/types/calendar';
import { formatDisplayDate } from '@/lib/calendar/dateUtils';
import { X, Save, Euro, Calendar, TrendingUp } from 'lucide-react';

interface PriceOverridePopoverProps {
  cellData: DateCellData;
  basePrice: number;
  onSave: (price: number, isWeekendOverride: boolean) => void;
  onClose: () => void;
  onRemoveOverride?: () => void;
}

export default function PriceOverridePopover({
  cellData,
  basePrice,
  onSave,
  onClose,
  onRemoveOverride
}: PriceOverridePopoverProps) {
  const [price, setPrice] = useState(cellData.price);
  const [isWeekendOverride, setIsWeekendOverride] = useState(cellData.isWeekend);
  const [presetSelected, setPresetSelected] = useState<string | null>(null);

  useEffect(() => {
    setPrice(cellData.price);
    setIsWeekendOverride(cellData.isWeekend);
  }, [cellData]);

  const handleSave = () => {
    onSave(price, isWeekendOverride);
    onClose();
  };

  const handlePresetClick = (percentage: number) => {
    const newPrice = Math.round(basePrice * (1 + percentage / 100));
    setPrice(newPrice);
    setPresetSelected(`${percentage > 0 ? '+' : ''}${percentage}%`);
  };

  const pricePresets = [
    { label: '-20%', value: -20 },
    { label: '-10%', value: -10 },
    { label: 'Base', value: 0 },
    { label: '+10%', value: 10 },
    { label: '+20%', value: 20 },
    { label: '+50%', value: 50 }
  ];

  const difference = price - basePrice;
  const percentageChange = basePrice > 0 ? ((difference / basePrice) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#212121] border border-gray-700/50 rounded-xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <h3 className="text-white font-semibold">Set Price</h3>
              <p className="text-gray-400 text-sm">{formatDisplayDate(cellData.date)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Current Status */}
          <div className="bg-[#1A1A1A] border border-gray-700/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Base Price</span>
              <span className="text-white font-medium">€{basePrice}</span>
            </div>
            {cellData.isWeekend && (
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Weekend Markup</span>
                <span className="text-[#FF2800] text-sm">+15%</span>
              </div>
            )}
            {cellData.hasOverride && (
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Current Override</span>
                <span className="text-[#FFC400] font-medium">€{cellData.price}</span>
              </div>
            )}
          </div>

          {/* Price Input */}
          <div>
            <label className="block text-white font-medium mb-2">Custom Price</label>
            <div className="relative">
              <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="number"
                value={price}
                onChange={(e) => {
                  setPrice(Number(e.target.value));
                  setPresetSelected(null);
                }}
                className="w-full bg-[#1F1F1F] border border-gray-600 text-white rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-[#FF2800] focus:border-transparent"
                min="1"
                step="1"
              />
            </div>
            
            {/* Price Change Indicator */}
            {difference !== 0 && (
              <div className="flex items-center mt-2 text-sm">
                <TrendingUp className={`h-4 w-4 mr-2 ${difference > 0 ? 'text-green-400' : 'text-red-400'}`} />
                <span className={difference > 0 ? 'text-green-400' : 'text-red-400'}>
                  {difference > 0 ? '+' : ''}€{difference} ({percentageChange.toFixed(0)}%)
                </span>
              </div>
            )}
          </div>

          {/* Price Presets */}
          <div>
            <label className="block text-white font-medium mb-3">Quick Adjustments</label>
            <div className="grid grid-cols-3 gap-2">
              {pricePresets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handlePresetClick(preset.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    presetSelected === preset.label
                      ? 'bg-[#FF2800] text-white'
                      : 'bg-[#1A1A1A] border border-gray-600 text-gray-300 hover:bg-[#252525] hover:text-white'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Weekend Override Toggle */}
          {cellData.isWeekend && (
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Weekend Override</label>
                <p className="text-gray-400 text-sm">Apply to all weekends</p>
              </div>
              <button
                onClick={() => setIsWeekendOverride(!isWeekendOverride)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isWeekendOverride ? 'bg-[#FF2800]' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isWeekendOverride ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-2">
            {cellData.hasOverride && onRemoveOverride && (
              <button
                onClick={() => {
                  onRemoveOverride();
                  onClose();
                }}
                className="flex-1 px-4 py-3 bg-transparent border border-gray-600 text-gray-400 rounded-lg hover:bg-gray-700 hover:text-white transition-colors"
              >
                Remove Override
              </button>
            )}
            
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-transparent border border-gray-600 text-gray-400 rounded-lg hover:bg-gray-700 hover:text-white transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-3 bg-[#FF2800] text-white rounded-lg hover:bg-[#FF2800]/90 transition-colors flex items-center justify-center"
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 