'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAddCar } from '@/contexts/AddCarContext';
import { TRANSMISSION_TYPES, FUEL_TYPES, LOCK_TYPES } from '@/types/car';
import { Settings, Fuel, Gauge, Smartphone, Wrench } from 'lucide-react';
import { useEffect } from 'react';

const specsSchema = z.object({
  transmission: z.enum(['Manual', 'Automatic'], {
    required_error: 'Transmission type is required',
  }),
  fuel_type: z.enum(['Petrol', 'Diesel', 'Electric', 'Hybrid'], {
    required_error: 'Fuel type is required',
  }),
  range_km: z.number()
    .min(50, 'Range must be at least 50 km')
    .max(2000, 'Range cannot exceed 2000 km'),
  lock_type: z.enum(['manual', 'smart'], {
    required_error: 'Lock type is required',
  }),
});

type SpecsData = z.infer<typeof specsSchema>;

export default function SpecsStep() {
  const { draftState, updateSpecs } = useAddCar();
  
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SpecsData>({
    resolver: zodResolver(specsSchema),
    defaultValues: {
      transmission: draftState.specs.transmission || undefined,
      fuel_type: draftState.specs.fuel_type || undefined,
      range_km: draftState.specs.range_km || 500,
      lock_type: draftState.specs.lock_type || undefined,
    },
  });

  const watchedValues = watch();

  // Update context when form values change
  useEffect(() => {
    updateSpecs(watchedValues);
  }, [watchedValues, updateSpecs]);

  return (
    <div className="space-y-6">
      {/* Transmission */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          <Settings className="inline h-4 w-4 mr-1" />
          Transmission
        </label>
        <div className="grid grid-cols-2 gap-3">
          {TRANSMISSION_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setValue('transmission', type)}
              className={`py-4 px-4 rounded-xl border transition-colors text-center ${
                watchedValues.transmission === type
                  ? 'bg-[#FF2800] border-[#FF2800] text-white'
                  : 'bg-[#2A2A2A] border-gray-700/50 text-gray-300 hover:border-gray-600'
              }`}
            >
              <Wrench className="h-5 w-5 mx-auto mb-2" />
              <span className="font-medium">{type}</span>
            </button>
          ))}
        </div>
        {errors.transmission && (
          <p className="mt-1 text-sm text-red-400">{errors.transmission.message}</p>
        )}
      </div>

      {/* Fuel Type */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          <Fuel className="inline h-4 w-4 mr-1" />
          Fuel Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          {FUEL_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setValue('fuel_type', type)}
              className={`py-4 px-4 rounded-xl border transition-colors text-center ${
                watchedValues.fuel_type === type
                  ? 'bg-[#FF2800] border-[#FF2800] text-white'
                  : 'bg-[#2A2A2A] border-gray-700/50 text-gray-300 hover:border-gray-600'
              }`}
            >
              <Fuel className="h-5 w-5 mx-auto mb-2" />
              <span className="font-medium">{type}</span>
            </button>
          ))}
        </div>
        {errors.fuel_type && (
          <p className="mt-1 text-sm text-red-400">{errors.fuel_type.message}</p>
        )}
      </div>

      {/* Range */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <Gauge className="inline h-4 w-4 mr-1" />
          Range (km)
        </label>
        <input
          type="number"
          min="50"
          max="2000"
          step="10"
          placeholder={watchedValues.fuel_type === 'Electric' ? '400' : '800'}
          {...register('range_km', { valueAsNumber: true })}
          className="w-full px-4 py-3 bg-[#2A2A2A] border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#FF2800]/50 focus:border-transparent"
        />
        {errors.range_km && (
          <p className="mt-1 text-sm text-red-400">{errors.range_km.message}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          {watchedValues.fuel_type === 'Electric' 
            ? 'Battery range on a single charge'
            : 'Range on a full tank'
          }
        </p>
      </div>

      {/* Lock Type */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          <Smartphone className="inline h-4 w-4 mr-1" />
          Access Method
        </label>
        <div className="grid grid-cols-1 gap-3">
          {LOCK_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setValue('lock_type', type)}
              className={`py-4 px-4 rounded-xl border transition-colors text-left ${
                watchedValues.lock_type === type
                  ? 'bg-[#FF2800] border-[#FF2800] text-white'
                  : 'bg-[#2A2A2A] border-gray-700/50 text-gray-300 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center">
                {type === 'smart' ? (
                  <Smartphone className="h-5 w-5 mr-3" />
                ) : (
                  <Settings className="h-5 w-5 mr-3" />
                )}
                <div>
                  <p className="font-medium capitalize">
                    {type === 'smart' ? 'Smart Lock' : 'Manual Key Exchange'}
                  </p>
                  <p className="text-sm opacity-75 mt-1">
                    {type === 'smart' 
                      ? 'Guests can unlock via app - more convenient and secure'
                      : 'Traditional key pickup and return - meet in person'
                    }
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
        {errors.lock_type && (
          <p className="mt-1 text-sm text-red-400">{errors.lock_type.message}</p>
        )}
      </div>

      {/* Preview Summary */}
      {watchedValues.transmission && watchedValues.fuel_type && (
        <div className="bg-[#2A2A2A] border border-gray-700/50 rounded-xl p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Specifications Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Transmission:</span>
              <p className="text-white font-medium">{watchedValues.transmission}</p>
            </div>
            <div>
              <span className="text-gray-400">Fuel Type:</span>
              <p className="text-white font-medium">{watchedValues.fuel_type}</p>
            </div>
            <div>
              <span className="text-gray-400">Range:</span>
              <p className="text-white font-medium">{watchedValues.range_km} km</p>
            </div>
            <div>
              <span className="text-gray-400">Access:</span>
              <p className="text-white font-medium capitalize">
                {watchedValues.lock_type === 'smart' ? 'Smart Lock' : 'Manual Key'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 