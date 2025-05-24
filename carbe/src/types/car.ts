import { Database } from './supabase';

export type Car = Database['public']['Tables']['cars']['Row'];
export type CarInsert = Database['public']['Tables']['cars']['Insert'];
export type CarUpdate = Database['public']['Tables']['cars']['Update'];

// Form step types for the Add New Car wizard
export interface CarBasicInfo {
  make: string;
  model: string;
  year: number;
  seats: number;
  location: string;
}

export interface CarSpecs {
  transmission: 'Manual' | 'Automatic';
  fuel_type: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
  range_km: number;
  lock_type: 'manual' | 'smart';
}

export interface CarPricing {
  price_per_day: number;
  smart_pricing_enabled: boolean;
}

export interface CarPhotos {
  photos: File[];
}

// Complete form data combining all steps
export interface AddCarFormData extends CarBasicInfo, CarSpecs, CarPricing {
  description?: string;
  photos: File[];
}

// Draft state for context
export interface CarDraftState {
  step: number;
  basicInfo: Partial<CarBasicInfo>;
  specs: Partial<CarSpecs>;
  pricing: Partial<CarPricing>;
  photos: File[];
}

// Validation error types
export interface FormErrors {
  [key: string]: string[];
}

// Upload progress for photos
export interface PhotoUploadProgress {
  file: File;
  progress: number;
  url?: string;
  error?: string;
}

// Car make/model options (can be extended)
export const CAR_MAKES = [
  'Audi', 'BMW', 'Mercedes-Benz', 'Volkswagen', 'Toyota', 'Honda',
  'Ford', 'Chevrolet', 'Nissan', 'Hyundai', 'Kia', 'Mazda',
  'Subaru', 'Volvo', 'Jaguar', 'Land Rover', 'Porsche', 'Tesla',
  'Peugeot', 'Renault', 'Citroën', 'Fiat', 'SEAT', 'Skoda', 'Other'
] as const;

export const TRANSMISSION_TYPES = ['Manual', 'Automatic'] as const;
export const FUEL_TYPES = ['Petrol', 'Diesel', 'Electric', 'Hybrid'] as const;
export const LOCK_TYPES = ['manual', 'smart'] as const;

export type CarMake = typeof CAR_MAKES[number];
export type TransmissionType = typeof TRANSMISSION_TYPES[number];
export type FuelType = typeof FUEL_TYPES[number];
export type LockType = typeof LOCK_TYPES[number];
