'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Settings, Wrench, Fuel, Zap, Gauge, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { COLORS } from '@/constants/colors';

const specsSchema = z.object({
  transmission: z.enum(['Manual', 'Automatic', 'CVT'], {
    required_error: 'Transmission type is required'
  }),
  fuel_type: z.enum(['Petrol', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid'], {
    required_error: 'Fuel type is required'
  }),
  range_km: z.number()
    .min(50, 'Range must be at least 50km')
    .max(2000, 'Range cannot exceed 2000km'),
  lock_type: z.enum(['manual', 'smart'], {
    required_error: 'Lock type is required'
  })
});

type SpecsData = z.infer<typeof specsSchema>;

interface EditSpecsStepProps {
  carData: any;
  onUpdate: (data: any) => void;
}

const TRANSMISSION_OPTIONS = ['Manual', 'Automatic', 'CVT'];
const FUEL_TYPE_OPTIONS = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid'];
const LOCK_TYPE_OPTIONS = [
  { value: 'manual', label: 'Manual Key', description: 'Traditional key handover' },
  { value: 'smart', label: 'Smart Lock', description: 'Remote unlock via app' }
];

export default function EditSpecsStep({ carData, onUpdate }: EditSpecsStepProps) {
  const [hasChanges, setHasChanges] = useState(false);
  
  const {
    register,
    watch,
    setValue,
    formState: { errors, touchedFields },
  } = useForm<SpecsData>({
    resolver: zodResolver(specsSchema),
    defaultValues: {
      transmission: carData.transmission || 'Automatic',
      fuel_type: carData.fuel_type || 'Petrol',
      range_km: carData.range_km || 400,
      lock_type: carData.lock_type || 'manual',
    },
    mode: 'onChange'
  });

  const watchedValues = watch();
  
  const transmission = watch('transmission');
  const fuel_type = watch('fuel_type');
  const range_km = watch('range_km');
  const lock_type = watch('lock_type');

  // Update parent when form values change
  useEffect(() => {
    const hasFormChanges = 
      transmission !== carData.transmission ||
      fuel_type !== carData.fuel_type ||
      range_km !== carData.range_km ||
      lock_type !== carData.lock_type;

    setHasChanges(hasFormChanges);

    if (hasFormChanges) {
      onUpdate({
        ...carData,
        transmission,
        fuel_type,
        range_km,
        lock_type
      });
    }
  }, [transmission, fuel_type, range_km, lock_type, carData, onUpdate]);

  const getFieldStatus = (fieldName: keyof SpecsData) => {
    const hasError = errors[fieldName];
    const isTouched = touchedFields[fieldName];
    const hasValue = watchedValues[fieldName];
    
    if (hasError && isTouched) return 'error';
    if (!hasError && isTouched && hasValue) return 'success';
    return 'default';
  };

  const getInputClassName = (fieldName: keyof SpecsData) => {
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

      {/* Transmission */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-200 mb-3">
          <div 
            className="w-6 h-6 rounded-lg flex items-center justify-center mr-2"
            style={{ backgroundColor: `${COLORS.primary.red}33` }}
          >
            <Settings className="h-4 w-4" style={{ color: COLORS.primary.red }} />
          </div>
          Transmission *
        </label>
        <div className="grid grid-cols-3 gap-3">
          {TRANSMISSION_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setValue('transmission', option as any)}
              className={`py-3 px-3 rounded-xl border-2 transition-all duration-200 text-sm font-semibold relative overflow-hidden ${
                watchedValues.transmission === option
                  ? 'text-white shadow-lg transform scale-105'
                  : 'backdrop-blur-sm bg-gray-800/30 border-gray-600/30 text-gray-300 hover:border-gray-500/50 hover:bg-gray-800/50'
              }`}
              style={watchedValues.transmission === option ? {
                backgroundColor: COLORS.primary.red,
                borderColor: COLORS.primary.red
              } : {}}
            >
              <span className="relative z-10">{option}</span>
            </button>
          ))}
        </div>
        {errors.transmission && (
          <p className="mt-2 text-sm text-red-400 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.transmission.message}
          </p>
        )}
      </div>

      {/* Fuel Type */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-200 mb-3">
          <div className="w-6 h-6 bg-green-500/20 rounded-lg flex items-center justify-center mr-2">
            <Fuel className="h-4 w-4 text-green-500" />
          </div>
          Fuel Type *
        </label>
        <div className="grid grid-cols-2 gap-3">
          {FUEL_TYPE_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setValue('fuel_type', option as any)}
              className={`py-3 px-3 rounded-xl border-2 transition-all duration-200 text-sm font-semibold relative overflow-hidden ${
                watchedValues.fuel_type === option
                  ? 'text-white shadow-lg'
                  : 'backdrop-blur-sm bg-gray-800/30 border-gray-600/30 text-gray-300 hover:border-gray-500/50 hover:bg-gray-800/50'
              }`}
              style={watchedValues.fuel_type === option ? {
                backgroundColor: COLORS.primary.red,
                borderColor: COLORS.primary.red
              } : {}}
            >
              <div className="flex items-center justify-center">
                {option === 'Electric' && <Zap className="h-4 w-4 mr-1" />}
                {option === 'Petrol' && <Fuel className="h-4 w-4 mr-1" />}
                {option === 'Diesel' && <Fuel className="h-4 w-4 mr-1" />}
                <span className="relative z-10">{option}</span>
              </div>
            </button>
          ))}
        </div>
        {errors.fuel_type && (
          <p className="mt-2 text-sm text-red-400 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.fuel_type.message}
          </p>
        )}
      </div>

      {/* Range */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-200 mb-3">
          <div className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center mr-2">
            <Gauge className="h-4 w-4 text-blue-500" />
          </div>
          Range (km) *
        </label>
        <div className="relative">
          <input
            type="number"
            min="50"
            max="2000"
            placeholder="e.g., 400"
            {...register('range_km', { valueAsNumber: true })}
            className={getInputClassName('range_km')}
          />
          {getFieldStatus('range_km') === 'success' && (
            <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
          )}
          {getFieldStatus('range_km') === 'error' && (
            <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-red-500" />
          )}
        </div>
        {errors.range_km && (
          <p className="mt-2 text-sm text-red-400 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.range_km.message}
          </p>
        )}
      </div>

      {/* Lock Type */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-200 mb-3">
          <div className="w-6 h-6 bg-purple-500/20 rounded-lg flex items-center justify-center mr-2">
            <Shield className="h-4 w-4 text-purple-500" />
          </div>
          Lock Type *
        </label>
        <div className="space-y-3">
          {LOCK_TYPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setValue('lock_type', option.value as any)}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                watchedValues.lock_type === option.value
                  ? 'text-white shadow-lg'
                  : 'backdrop-blur-sm bg-gray-800/30 border-gray-600/30 text-gray-300 hover:border-gray-500/50 hover:bg-gray-800/50'
              }`}
              style={watchedValues.lock_type === option.value ? {
                backgroundColor: `${COLORS.primary.red}20`,
                borderColor: COLORS.primary.red
              } : {}}
            >
              <div className="flex items-start">
                <div className="flex-1">
                  <div className="font-semibold text-sm">{option.label}</div>
                  <div className="text-xs text-gray-400 mt-1">{option.description}</div>
                </div>
                {watchedValues.lock_type === option.value && (
                  <CheckCircle className="h-5 w-5 mt-0.5" style={{ color: COLORS.primary.red }} />
                )}
              </div>
            </button>
          ))}
        </div>
        {errors.lock_type && (
          <p className="mt-2 text-sm text-red-400 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.lock_type.message}
          </p>
        )}
      </div>

      {/* Preview */}
      <GlassCard gradient="accent" className="border-2">
        <div className="flex items-start space-x-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${COLORS.primary.red}33` }}
          >
            <Wrench className="h-6 w-6" style={{ color: COLORS.primary.red }} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium mb-1" style={{ color: COLORS.primary.red }}>Updated Specifications</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Transmission:</span>
                <span className="text-white font-medium">{watchedValues.transmission}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Fuel Type:</span>
                <span className="text-white font-medium">{watchedValues.fuel_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Range:</span>
                <span className="text-white font-medium">{watchedValues.range_km} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Lock Type:</span>
                <span className="text-white font-medium capitalize">{watchedValues.lock_type}</span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
} 