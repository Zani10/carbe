'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAddCar } from '@/contexts/AddCarContext';
import { CAR_MAKES } from '@/types/car';
import { Car, MapPin, Calendar, Users } from 'lucide-react';
import { useEffect } from 'react';

const basicInfoSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number()
    .min(1990, 'Year must be 1990 or later')
    .max(new Date().getFullYear(), 'Year cannot be in the future'),
  seats: z.number()
    .min(1, 'At least 1 seat required')
    .max(9, 'Maximum 9 seats allowed'),
  location: z.string().min(1, 'Location is required'),
});

type BasicInfoData = z.infer<typeof basicInfoSchema>;

export default function BasicInfoStep() {
  const { draftState, updateBasicInfo } = useAddCar();
  
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BasicInfoData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      make: draftState.basicInfo.make || '',
      model: draftState.basicInfo.model || '',
      year: draftState.basicInfo.year || new Date().getFullYear(),
      seats: draftState.basicInfo.seats || 5,
      location: draftState.basicInfo.location || '',
    },
  });

  const watchedValues = watch();
  
  // Watch specific fields to avoid infinite loops
  const make = watch('make');
  const model = watch('model');
  const year = watch('year');
  const seats = watch('seats');
  const location = watch('location');

  // Update context when form values change
  useEffect(() => {
    updateBasicInfo({
      make,
      model,
      year,
      seats,
      location
    });
  }, [make, model, year, seats, location, updateBasicInfo]);

  return (
    <div className="space-y-6">
      {/* Make */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <Car className="inline h-4 w-4 mr-1" />
          Make
        </label>
        <select
          {...register('make')}
          className="w-full px-4 py-3 bg-[#2A2A2A] border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-[#FF2800]/50 focus:border-transparent"
        >
          <option value="">Select make</option>
          {CAR_MAKES.map((make) => (
            <option key={make} value={make}>
              {make}
            </option>
          ))}
        </select>
        {errors.make && (
          <p className="mt-1 text-sm text-red-400">{errors.make.message}</p>
        )}
      </div>

      {/* Model */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Model
        </label>
        <input
          type="text"
          placeholder="e.g., Model 3, 3 Series, Golf"
          {...register('model')}
          className="w-full px-4 py-3 bg-[#2A2A2A] border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#FF2800]/50 focus:border-transparent"
        />
        {errors.model && (
          <p className="mt-1 text-sm text-red-400">{errors.model.message}</p>
        )}
      </div>

      {/* Year */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <Calendar className="inline h-4 w-4 mr-1" />
          Year
        </label>
        <input
          type="number"
          min="1990"
          max={new Date().getFullYear()}
          {...register('year', { valueAsNumber: true })}
          className="w-full px-4 py-3 bg-[#2A2A2A] border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#FF2800]/50 focus:border-transparent"
        />
        {errors.year && (
          <p className="mt-1 text-sm text-red-400">{errors.year.message}</p>
        )}
      </div>

      {/* Seats */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <Users className="inline h-4 w-4 mr-1" />
          Number of Seats
        </label>
        <div className="grid grid-cols-5 gap-2">
          {[2, 4, 5, 7, 9].map((seatCount) => (
            <button
              key={seatCount}
              type="button"
              onClick={() => setValue('seats', seatCount)}
              className={`py-3 px-2 rounded-xl border transition-colors text-sm font-medium ${
                watchedValues.seats === seatCount
                  ? 'bg-[#FF2800] border-[#FF2800] text-white'
                  : 'bg-[#2A2A2A] border-gray-700/50 text-gray-300 hover:border-gray-600'
              }`}
            >
              {seatCount}
            </button>
          ))}
        </div>
        {errors.seats && (
          <p className="mt-1 text-sm text-red-400">{errors.seats.message}</p>
        )}
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <MapPin className="inline h-4 w-4 mr-1" />
          Location
        </label>
        <input
          type="text"
          placeholder="e.g., Amsterdam, Netherlands"
          {...register('location')}
          className="w-full px-4 py-3 bg-[#2A2A2A] border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#FF2800]/50 focus:border-transparent"
        />
        {errors.location && (
          <p className="mt-1 text-sm text-red-400">{errors.location.message}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Enter the city and country where the car is located
        </p>
      </div>

      {/* Preview */}
      {watchedValues.make && watchedValues.model && watchedValues.year && (
        <div className="bg-[#2A2A2A] border border-gray-700/50 rounded-xl p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-2">Preview</h3>
          <p className="text-white font-semibold">
            {watchedValues.year} {watchedValues.make} {watchedValues.model}
          </p>
          <div className="flex items-center text-sm text-gray-400 mt-1 space-x-4">
            <span className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {watchedValues.seats} seats
            </span>
            {watchedValues.location && (
              <span className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {watchedValues.location}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 