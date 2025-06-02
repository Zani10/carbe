import React from 'react';
import { Euro, Calendar, TrendingUp } from 'lucide-react';

interface PricingOverviewProps {
  basePrice: number;
  weekendPrice: number;
  isMultipleCars: boolean;
}

export default function PricingOverview({
  basePrice,
  weekendPrice,
  isMultipleCars
}: PricingOverviewProps) {
  const weekendMarkup = Math.round(((weekendPrice - basePrice) / basePrice) * 100);

  return (
    <div className="bg-[#1F1F1F] rounded-xl p-4 border border-gray-700/50">
      <h3 className="text-white font-semibold mb-4 flex items-center">
        <Euro className="h-4 w-4 mr-2" />
        Pricing Overview
        {isMultipleCars && (
          <span className="ml-2 text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">
            Multiple vehicles
          </span>
        )}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Base Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-gray-300 text-sm">Base Price:</span>
          </div>
          <span className="text-white font-semibold">
            €{Math.round(basePrice)} / night
          </span>
        </div>

        {/* Weekend Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <TrendingUp className="h-4 w-4 text-orange-400 mr-2" />
            <span className="text-gray-300 text-sm">Weekend Price:</span>
          </div>
          <span className="text-white font-semibold">
            €{weekendPrice} / night
          </span>
        </div>

        {/* Weekend Markup */}
        <div className="flex items-center justify-between">
          <span className="text-gray-300 text-sm">Weekend markup:</span>
          <span className="text-orange-300 font-semibold">
            +{weekendMarkup}%
          </span>
        </div>
      </div>

      {isMultipleCars && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <p className="text-xs text-gray-500">
            Prices shown are averages across selected vehicles. Individual vehicle prices may vary.
          </p>
        </div>
      )}
    </div>
  );
} 