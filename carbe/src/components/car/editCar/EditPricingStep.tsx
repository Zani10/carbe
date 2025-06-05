'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DollarSign, TrendingUp, ToggleLeft, ToggleRight, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { COLORS } from '@/constants/colors';

const pricingSchema = z.object({
  price_per_day: z.number()
    .min(10, 'Daily rate must be at least €10')
    .max(500, 'Daily rate cannot exceed €500'),
  smart_pricing_enabled: z.boolean()
});

type PricingData = z.infer<typeof pricingSchema>;

interface EditPricingStepProps {
  carData: any;
  onUpdate: (data: any) => void;
}

export default function EditPricingStep({ carData, onUpdate }: EditPricingStepProps) {
  const [hasChanges, setHasChanges] = useState(false);
  const [estimatedRange, setEstimatedRange] = useState({ min: 0, max: 0 });
  
  const {
    register,
    watch,
    setValue,
    formState: { errors, touchedFields },
  } = useForm<PricingData>({
    resolver: zodResolver(pricingSchema),
    defaultValues: {
      price_per_day: carData.price_per_day || 50,
      smart_pricing_enabled: carData.smart_pricing_enabled || false,
    },
    mode: 'onChange'
  });

  const watchedValues = watch();
  
  const price_per_day = watch('price_per_day');
  const smart_pricing_enabled = watch('smart_pricing_enabled');

  // Calculate estimated pricing range based on base price
  useEffect(() => {
    if (price_per_day && smart_pricing_enabled) {
      const min = Math.round(price_per_day * 0.8); // 20% below
      const max = Math.round(price_per_day * 1.3); // 30% above
      setEstimatedRange({ min, max });
    } else {
      setEstimatedRange({ min: price_per_day, max: price_per_day });
    }
  }, [price_per_day, smart_pricing_enabled]);

  // Update parent when form values change
  useEffect(() => {
    const hasFormChanges = 
      price_per_day !== carData.price_per_day ||
      smart_pricing_enabled !== carData.smart_pricing_enabled;

    setHasChanges(hasFormChanges);

    if (hasFormChanges) {
      onUpdate({
        ...carData,
        price_per_day,
        smart_pricing_enabled
      });
    }
  }, [price_per_day, smart_pricing_enabled, carData, onUpdate]);

  const getFieldStatus = (fieldName: keyof PricingData) => {
    const hasError = errors[fieldName];
    const isTouched = touchedFields[fieldName];
    const hasValue = watchedValues[fieldName] !== undefined;
    
    if (hasError && isTouched) return 'error';
    if (!hasError && isTouched && hasValue) return 'success';
    return 'default';
  };

  const getInputClassName = (fieldName: keyof PricingData) => {
    const status = getFieldStatus(fieldName);
    const baseClasses = "w-full px-4 py-3 backdrop-blur-sm bg-gray-800/30 border rounded-xl text-white placeholder-gray-500 transition-all focus:outline-none focus:ring-2";
    
    switch (status) {
      case 'error':
        return `${baseClasses} border-red-500/50 focus:ring-red-500/30 focus:border-red-500`;
      case 'success':
        return `${baseClasses} border-green-500/50 focus:ring-green-500/30 focus:border-green-500`;
      default:
        return `${baseClasses} border-gray-600/30 focus:ring-[${COLORS.primary.red}]/30 focus:border-[${COLORS.primary.red}]`;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const quickPrices = [25, 40, 55, 75, 100, 150];

  return (
    <div className="space-y-6">
      {/* Changes Indicator */}
      {hasChanges && (
        <GlassCard gradient="accent" padding="sm">
          <div className="flex items-center text-sm">
            <AlertCircle className="h-4 w-4 mr-2" style={{ color: COLORS.primary.red }} />
            <span style={{ color: COLORS.primary.red }}>Unsaved changes detected</span>
          </div>
        </GlassCard>
      )}

      {/* Daily Rate */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-200 mb-3">
          <div 
            className="w-6 h-6 rounded-lg flex items-center justify-center mr-2"
            style={{ backgroundColor: `${COLORS.primary.red}33` }}
          >
            <DollarSign className="h-4 w-4" style={{ color: COLORS.primary.red }} />
          </div>
          Daily Rate (EUR) *
        </label>
        
        {/* Price Input */}
        <div className="relative mb-4">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg font-semibold">
            €
          </div>
          <input
            type="number"
            min="10"
            max="500"
            placeholder="50"
            {...register('price_per_day', { valueAsNumber: true })}
            className={`${getInputClassName('price_per_day')} pl-8 text-lg font-semibold`}
          />
          {getFieldStatus('price_per_day') === 'success' && (
            <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
          )}
          {getFieldStatus('price_per_day') === 'error' && (
            <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-red-500" />
          )}
        </div>

        {/* Quick Price Buttons */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {quickPrices.map((price) => (
            <button
              key={price}
              type="button"
              onClick={() => setValue('price_per_day', price)}
              className={`py-2 px-3 rounded-xl border-2 transition-all duration-200 text-sm font-semibold ${
                watchedValues.price_per_day === price
                  ? 'text-white shadow-lg'
                  : 'backdrop-blur-sm bg-gray-800/30 border-gray-600/30 text-gray-300 hover:border-gray-500/50 hover:bg-gray-800/50'
              }`}
              style={watchedValues.price_per_day === price ? {
                backgroundColor: COLORS.primary.red,
                borderColor: COLORS.primary.red
              } : {}}
            >
              {formatCurrency(price)}
            </button>
          ))}
        </div>

        {errors.price_per_day && (
          <p className="mt-2 text-sm text-red-400 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.price_per_day.message}
          </p>
        )}
      </div>

      {/* Smart Pricing */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-200 mb-3">
          <div className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center mr-2">
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </div>
          Smart Pricing
        </label>
        
        <GlassCard padding="md" className="border-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-white font-semibold text-sm mb-1">Automatic Price Optimization</h4>
              <p className="text-gray-400 text-xs mb-3">
                Automatically adjust your pricing based on demand, seasonality, and local market rates
              </p>
              
              {smart_pricing_enabled && (
                <div className="space-y-2">
                  <div className="text-xs text-gray-300">
                    <span className="font-medium">Estimated range:</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-gray-400">Low demand:</span>
                    <span className="text-white font-semibold">{formatCurrency(estimatedRange.min)}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-400">High demand:</span>
                    <span className="text-white font-semibold">{formatCurrency(estimatedRange.max)}</span>
                  </div>
                </div>
              )}
            </div>
            
            <button
              type="button"
              onClick={() => setValue('smart_pricing_enabled', !smart_pricing_enabled)}
              className="flex items-center ml-4"
            >
              {smart_pricing_enabled ? (
                <ToggleRight className="h-8 w-8" style={{ color: COLORS.primary.red }} />
              ) : (
                <ToggleLeft className="h-8 w-8 text-gray-400" />
              )}
            </button>
          </div>
        </GlassCard>

        {smart_pricing_enabled && (
          <div className="mt-3 p-3 rounded-xl" style={{ backgroundColor: `${COLORS.primary.red}10` }}>
            <div className="flex items-start space-x-2">
              <Info className="h-4 w-4 mt-0.5" style={{ color: COLORS.primary.red }} />
              <div className="text-xs text-gray-300">
                <span style={{ color: COLORS.primary.red }} className="font-medium">Smart pricing is enabled.</span>
                <br />
                Your base rate of {formatCurrency(price_per_day)} will be automatically adjusted within the estimated range shown above.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Revenue Projection */}
      <GlassCard gradient="accent" className="border-2">
        <div className="flex items-start space-x-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${COLORS.primary.red}33` }}
          >
            <TrendingUp className="h-6 w-6" style={{ color: COLORS.primary.red }} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium mb-2" style={{ color: COLORS.primary.red }}>Revenue Projection</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-white font-bold text-lg">{formatCurrency(price_per_day * 7)}</div>
                <div className="text-gray-400 text-xs">Weekly</div>
              </div>
              <div>
                <div className="text-white font-bold text-lg">{formatCurrency(price_per_day * 30)}</div>
                <div className="text-gray-400 text-xs">Monthly</div>
              </div>
              <div>
                <div className="text-white font-bold text-lg">{formatCurrency(price_per_day * 365)}</div>
                <div className="text-gray-400 text-xs">Yearly</div>
              </div>
            </div>
            {smart_pricing_enabled && (
              <div className="mt-3 text-xs text-gray-400 text-center">
                *Estimates based on 100% occupancy with smart pricing optimization
              </div>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Updated Preview */}
      <GlassCard padding="md">
        <h4 className="text-sm font-medium text-white mb-3 flex items-center">
          <DollarSign className="h-4 w-4 mr-2" style={{ color: COLORS.primary.red }} />
          Updated Pricing Summary
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Base Daily Rate:</span>
            <span className="text-white font-semibold">{formatCurrency(price_per_day || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Smart Pricing:</span>
            <span className={`text-sm px-2 py-1 rounded-full ${
              smart_pricing_enabled 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-gray-500/20 text-gray-400'
            }`}>
              {smart_pricing_enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          {smart_pricing_enabled && (
            <div className="flex justify-between">
              <span className="text-gray-400">Price Range:</span>
              <span className="text-white text-sm">
                {formatCurrency(estimatedRange.min)} - {formatCurrency(estimatedRange.max)}
              </span>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
} 