'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAddCar } from '@/contexts/AddCarContext';
import { DollarSign, TrendingUp, Info } from 'lucide-react';
import { useEffect, useState } from 'react';

const pricingSchema = z.object({
  price_per_day: z.number()
    .min(20, 'Minimum price is €20 per day')
    .max(500, 'Maximum price is €500 per day'),
  smart_pricing_enabled: z.boolean(),
});

type PricingData = z.infer<typeof pricingSchema>;

// Suggested pricing based on car make (simplified)
const getSuggestedPricing = (make: string, fuelType: string) => {
  const premiumBrands = ['BMW', 'Mercedes-Benz', 'Audi', 'Tesla', 'Porsche', 'Jaguar'];
  const isPremium = premiumBrands.includes(make);
  const isElectric = fuelType === 'Electric';
  
  let basePrice = 50;
  if (isPremium) basePrice += 25;
  if (isElectric) basePrice += 15;
  
  return {
    suggested: basePrice,
    min: Math.max(20, basePrice - 20),
    max: Math.min(500, basePrice + 30)
  };
};

export default function PricingStep() {
  const { draftState, updatePricing } = useAddCar();
  const [showSuggestion, setShowSuggestion] = useState(true);
  
  const suggestedPricing = getSuggestedPricing(
    draftState.basicInfo.make || '',
    draftState.specs.fuel_type || ''
  );

  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PricingData>({
    resolver: zodResolver(pricingSchema),
    defaultValues: {
      price_per_day: draftState.pricing.price_per_day || suggestedPricing.suggested,
      smart_pricing_enabled: draftState.pricing.smart_pricing_enabled || false,
    },
  });

  const watchedValues = watch();
  
  // Watch specific fields to avoid infinite loops
  const price_per_day = watch('price_per_day');
  const smart_pricing_enabled = watch('smart_pricing_enabled');

  // Update context when form values change
  useEffect(() => {
    updatePricing({
      price_per_day,
      smart_pricing_enabled
    });
  }, [price_per_day, smart_pricing_enabled, updatePricing]);

  const calculateEarnings = (dailyRate: number) => {
    const weeklyRate = dailyRate * 7 * 0.95; // 5% discount for weekly
    const monthlyRate = dailyRate * 30 * 0.8; // 20% discount for monthly
    
    return {
      daily: dailyRate,
      weekly: Math.round(weeklyRate),
      monthly: Math.round(monthlyRate)
    };
  };

  const earnings = calculateEarnings(watchedValues.price_per_day || 0);

  return (
    <div className="space-y-6">
      {/* Pricing Suggestion */}
      {showSuggestion && draftState.basicInfo.make && (
        <div className="bg-blue-900/20 border border-blue-700/50 rounded-xl p-4">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-400 mr-3 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-blue-300 font-medium mb-1">Pricing Suggestion</h3>
              <p className="text-blue-200 text-sm mb-3">
                Based on your {draftState.basicInfo.make} {draftState.specs.fuel_type && `(${draftState.specs.fuel_type})`}, 
                we suggest €{suggestedPricing.suggested}/day
              </p>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setValue('price_per_day', suggestedPricing.suggested);
                    setShowSuggestion(false);
                  }}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Use Suggestion
                </button>
                <button
                  type="button"
                  onClick={() => setShowSuggestion(false)}
                  className="px-3 py-1 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daily Rate */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <DollarSign className="inline h-4 w-4 mr-1" />
          Daily Rate (€)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">€</span>
          <input
            type="number"
            min="20"
            max="500"
            step="5"
            {...register('price_per_day', { valueAsNumber: true })}
            className="w-full pl-8 pr-4 py-3 bg-[#2A2A2A] border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#FF2800]/50 focus:border-transparent"
          />
        </div>
        {errors.price_per_day && (
          <p className="mt-1 text-sm text-red-400">{errors.price_per_day.message}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Recommended range: €{suggestedPricing.min} - €{suggestedPricing.max}
        </p>
      </div>

      {/* Smart Pricing Toggle */}
      <div className="bg-[#2A2A2A] border border-gray-700/50 rounded-xl p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
              <h3 className="text-white font-medium">Smart Pricing</h3>
            </div>
            <p className="text-gray-400 text-sm mb-3">
              Automatically adjust prices based on demand, events, and seasonal trends to maximize your earnings.
            </p>
            <div className="flex items-center text-xs text-gray-500">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
              Up to 20% increase in bookings
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer ml-4">
            <input
              type="checkbox"
              {...register('smart_pricing_enabled')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#FF2800]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF2800]"></div>
          </label>
        </div>
      </div>

      {/* Earnings Preview */}
      <div className="bg-[#2A2A2A] border border-gray-700/50 rounded-xl p-4">
        <h3 className="text-white font-medium mb-3">Potential Earnings</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-gray-400 text-xs uppercase tracking-wide">Daily</p>
            <p className="text-white font-bold text-lg">€{earnings.daily}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-xs uppercase tracking-wide">Weekly</p>
            <p className="text-white font-bold text-lg">€{earnings.weekly}</p>
            <p className="text-green-400 text-xs">5% discount</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-xs uppercase tracking-wide">Monthly</p>
            <p className="text-white font-bold text-lg">€{earnings.monthly}</p>
            <p className="text-green-400 text-xs">20% discount</p>
          </div>
        </div>
        
        {watchedValues.smart_pricing_enabled && (
          <div className="mt-3 p-3 bg-green-900/20 border border-green-700/50 rounded-lg">
            <p className="text-green-300 text-sm">
              💡 With Smart Pricing enabled, you could earn 15-25% more during peak times!
            </p>
          </div>
        )}
      </div>

      {/* Pricing Tips */}
      <div className="bg-[#2A2A2A] border border-gray-700/50 rounded-xl p-4">
        <h3 className="text-white font-medium mb-3">💡 Pricing Tips</h3>
        <ul className="space-y-2 text-sm text-gray-400">
          <li>• Start competitive and adjust based on booking frequency</li>
          <li>• Consider your car&apos;s age, condition, and unique features</li>
          <li>• Check similar cars in your area for reference</li>
          <li>• Premium features (smart lock, new model) can justify higher prices</li>
        </ul>
      </div>
    </div>
  );
} 