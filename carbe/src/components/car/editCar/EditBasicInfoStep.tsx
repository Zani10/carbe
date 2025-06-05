'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CAR_MAKES } from '@/types/car';
import { Car, MapPin, Calendar, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { COLORS } from '@/constants/colors';

const basicInfoSchema = z.object({
  make: z.string().min(1, 'Car make is required'),
  model: z.string()
    .min(1, 'Car model is required')
    .min(2, 'Model must be at least 2 characters')
    .max(50, 'Model cannot exceed 50 characters'),
  year: z.number()
    .min(1990, 'Year must be 1990 or later')
    .max(new Date().getFullYear(), 'Year cannot be in the future'),
  seats: z.number()
    .min(2, 'At least 2 seats required')
    .max(9, 'Maximum 9 seats allowed'),
  location: z.string()
    .min(3, 'Location must be at least 3 characters')
    .max(100, 'Location cannot exceed 100 characters')
    .regex(/^[a-zA-Z\s,.-]+$/, 'Location can only contain letters, spaces, commas, periods, and hyphens'),
});

type BasicInfoData = z.infer<typeof basicInfoSchema>;

interface EditBasicInfoStepProps {
  carData: any;
  onUpdate: (data: any) => void;
}

const COMMON_LOCATIONS = [
  'Amsterdam, Netherlands',
  'Berlin, Germany',
  'London, United Kingdom',
  'Paris, France',
  'Madrid, Spain',
  'Rome, Italy',
  'Vienna, Austria',
  'Brussels, Belgium',
  'Copenhagen, Denmark',
  'Stockholm, Sweden',
];

export default function EditBasicInfoStep({ carData, onUpdate }: EditBasicInfoStepProps) {
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const {
    register,
    watch,
    setValue,
    formState: { errors, touchedFields },
  } = useForm<BasicInfoData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      make: carData.make || '',
      model: carData.model || '',
      year: carData.year || new Date().getFullYear(),
      seats: carData.seats || 5,
      location: carData.location || '',
    },
    mode: 'onChange'
  });

  const watchedValues = watch();
  
  const make = watch('make');
  const model = watch('model');
  const year = watch('year');
  const seats = watch('seats');
  const location = watch('location');

  // Location autocomplete logic
  useEffect(() => {
    if (location && location.length >= 2) {
      const filtered = COMMON_LOCATIONS.filter(loc => 
        loc.toLowerCase().includes(location.toLowerCase())
      ).slice(0, 5);
      setLocationSuggestions(filtered);
      setShowLocationSuggestions(true);
    } else {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
    }
  }, [location]);

  // Update parent when form values change
  useEffect(() => {
    const hasFormChanges = 
      make !== carData.make ||
      model !== carData.model ||
      year !== carData.year ||
      seats !== carData.seats ||
      location !== carData.location;

    setHasChanges(hasFormChanges);

    if (hasFormChanges) {
      onUpdate({
        ...carData,
        make,
        model,
        year,
        seats,
        location
      });
    }
  }, [make, model, year, seats, location, carData, onUpdate]);

  const getFieldStatus = (fieldName: keyof BasicInfoData) => {
    const hasError = errors[fieldName];
    const isTouched = touchedFields[fieldName];
    const hasValue = watchedValues[fieldName];
    
    if (hasError && isTouched) return 'error';
    if (!hasError && isTouched && hasValue) return 'success';
    return 'default';
  };

  const getInputClassName = (fieldName: keyof BasicInfoData) => {
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

  const selectLocation = (selectedLocation: string) => {
    setValue('location', selectedLocation);
    setShowLocationSuggestions(false);
  };

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

      {/* Make */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-200 mb-3">
          <div 
            className="w-6 h-6 rounded-lg flex items-center justify-center mr-2"
            style={{ backgroundColor: `${COLORS.primary.red}33` }}
          >
            <Car className="h-4 w-4" style={{ color: COLORS.primary.red }} />
          </div>
          Car Make *
        </label>
        <div className="relative">
          <select
            {...register('make')}
            className={getInputClassName('make')}
          >
            <option value="">Select car make</option>
            {CAR_MAKES.map((make) => (
              <option key={make} value={make} className="bg-gray-800 text-white">
                {make}
              </option>
            ))}
          </select>
          {getFieldStatus('make') === 'success' && (
            <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
          )}
          {getFieldStatus('make') === 'error' && (
            <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-red-500" />
          )}
        </div>
        {errors.make && (
          <p className="mt-2 text-sm text-red-400 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.make.message}
          </p>
        )}
      </div>

      {/* Model */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-200 mb-3">
          <div className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center mr-2">
            <Car className="h-4 w-4 text-blue-500" />
          </div>
          Car Model *
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="e.g., Model 3, 3 Series, Golf, Civic"
            {...register('model')}
            className={getInputClassName('model')}
          />
          {getFieldStatus('model') === 'success' && (
            <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
          )}
          {getFieldStatus('model') === 'error' && (
            <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-red-500" />
          )}
        </div>
        {errors.model && (
          <p className="mt-2 text-sm text-red-400 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.model.message}
          </p>
        )}
      </div>

      {/* Year */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-200 mb-3">
          <div className="w-6 h-6 bg-purple-500/20 rounded-lg flex items-center justify-center mr-2">
            <Calendar className="h-4 w-4 text-purple-500" />
          </div>
          Manufacturing Year *
        </label>
        <div className="relative">
          <input
            type="number"
            min="1990"
            max={new Date().getFullYear()}
            placeholder={new Date().getFullYear().toString()}
            {...register('year', { valueAsNumber: true })}
            className={getInputClassName('year')}
          />
          {getFieldStatus('year') === 'success' && (
            <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
          )}
          {getFieldStatus('year') === 'error' && (
            <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-red-500" />
          )}
        </div>
        {errors.year && (
          <p className="mt-2 text-sm text-red-400 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.year.message}
          </p>
        )}
      </div>

      {/* Seats */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-200 mb-3">
          <div className="w-6 h-6 bg-orange-500/20 rounded-lg flex items-center justify-center mr-2">
            <Users className="h-4 w-4 text-orange-500" />
          </div>
          Number of Seats *
        </label>
        <div className="grid grid-cols-5 gap-3">
          {[2, 4, 5, 7, 9].map((seatCount) => (
            <button
              key={seatCount}
              type="button"
              onClick={() => setValue('seats', seatCount)}
              className={`py-3 px-2 rounded-xl border-2 transition-all duration-200 text-sm font-semibold relative overflow-hidden ${
                watchedValues.seats === seatCount
                  ? 'text-white shadow-lg transform scale-105'
                  : 'backdrop-blur-sm bg-gray-800/30 border-gray-600/30 text-gray-300 hover:border-gray-500/50 hover:bg-gray-800/50'
              }`}
              style={watchedValues.seats === seatCount ? {
                backgroundColor: COLORS.primary.red,
                borderColor: COLORS.primary.red
              } : {}}
            >
              <span className="relative z-10">{seatCount}</span>
            </button>
          ))}
        </div>
        {errors.seats && (
          <p className="mt-2 text-sm text-red-400 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.seats.message}
          </p>
        )}
      </div>

      {/* Location */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-200 mb-3">
          <div className="w-6 h-6 bg-green-500/20 rounded-lg flex items-center justify-center mr-2">
            <MapPin className="h-4 w-4 text-green-500" />
          </div>
          Car Location *
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="e.g., Amsterdam, Netherlands"
            {...register('location')}
            className={getInputClassName('location')}
            onFocus={() => location && setShowLocationSuggestions(true)}
          />
          {getFieldStatus('location') === 'success' && (
            <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
          )}
          {getFieldStatus('location') === 'error' && (
            <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-red-500" />
          )}
          
          {/* Location Suggestions */}
          {showLocationSuggestions && locationSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 backdrop-blur-xl bg-gray-900/90 border border-gray-600/30 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
              {locationSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => selectLocation(suggestion)}
                  className="w-full px-4 py-3 text-left text-gray-300 hover:bg-white/10 first:rounded-t-xl last:rounded-b-xl transition-colors"
                >
                  <MapPin className="inline h-4 w-4 mr-2 text-green-500" />
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
        {errors.location && (
          <p className="mt-2 text-sm text-red-400 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.location.message}
          </p>
        )}
      </div>

      {/* Preview */}
      {watchedValues.make && watchedValues.model && watchedValues.year && (
        <GlassCard gradient="accent" className="border-2">
          <div className="flex items-start space-x-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${COLORS.primary.red}33` }}
            >
              <Car className="h-6 w-6" style={{ color: COLORS.primary.red }} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium mb-1" style={{ color: COLORS.primary.red }}>Updated Preview</h3>
              <p className="text-white font-semibold text-lg">
                {watchedValues.year} {watchedValues.make} {watchedValues.model}
              </p>
              <div className="flex items-center text-sm text-gray-300 mt-2 space-x-4">
                <span className="flex items-center">
                  <Users className="h-4 w-4 mr-1 text-orange-500" />
                  {watchedValues.seats} seats
                </span>
                {watchedValues.location && (
                  <span className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-green-500" />
                    {watchedValues.location}
                  </span>
                )}
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Click outside to close suggestions */}
      {showLocationSuggestions && (
        <div 
          className="fixed inset-0 z-0"
          onClick={() => setShowLocationSuggestions(false)}
        />
      )}
    </div>
  );
} 