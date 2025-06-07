'use client';

import { useState, useEffect, useCallback } from 'react';
import { getCars, CarSearchParams } from '@/lib/car';
import { supabase } from '@/lib/supabase';

// Database car type (updated to include owner profile)
export interface Car {
  id: string;
  owner_id: string;
  make: string;
  model: string;
  year: number;
  price_per_day: number;
  transmission: string;
  fuel_type: string;
  seats: number;
  location: string | null;
  images: string[];
  is_available: boolean;
  rating: number | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  vehicle_type?: string;
  // Owner profile information
  profiles?: {
    id: string;
    full_name: string;
    profile_image: string | null;
    created_at: string;
  } | null;
}

// Legacy interface for backward compatibility
export interface UseCarFilters {
  make?: string;
  model?: string;
  priceMin?: number;
  priceMax?: number;
  transmission?: string;
  fuelType?: string;
  location?: string;
}

// Timeout wrapper for database queries
async function fetchWithTimeout<T>(
  queryFn: () => Promise<T>,
  timeoutMs: number = 10000
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Query timeout')), timeoutMs);
  });

  return Promise.race([queryFn(), timeoutPromise]);
}

// Enhanced hook with search capabilities
export function useCars(searchParams?: CarSearchParams) {
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCars = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Build query with timeout wrapper
      const queryFn = async () => {
        return await getCars(searchParams);
      };

      const data = await fetchWithTimeout(queryFn);

      if (data) {
        setCars(data as Car[]);
      } else {
        setCars([]);
      }
    } catch (err) {
      console.error('Error fetching cars:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch cars';
      setError(errorMessage);
      setCars([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  const refetch = useCallback(() => {
    fetchCars();
  }, [fetchCars]);

  return {
    cars,
    isLoading,
    error,
    refetch,
  };
}

// Legacy hook for backward compatibility
export function useCarsLegacy(filters?: UseCarFilters) {
  // Convert legacy filters to new search params format
  const searchParams: CarSearchParams | undefined = filters ? {
    location: filters.location,
    make: filters.make,
    model: filters.model,
    priceMin: filters.priceMin,
    priceMax: filters.priceMax,
    transmission: filters.transmission,
    fuelType: filters.fuelType,
  } : undefined;

  return useCars(searchParams);
}

// Export the legacy function as the default export for backward compatibility
export { useCarsLegacy as useCarFilters };

export function useCarById(id: string) {
  const [car, setCar] = useState<Car | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCar = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('cars')
          .select(`
            *,
            profiles!owner_id (
              id,
              full_name,
              profile_image,
              verified,
              created_at
            )
          `)
          .eq('id', id)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        if (!data) {
          setError('Car not found');
          setCar(null);
          return;
        }

        const transformedCar: Car = {
          ...data,
          images: data.images ?? [], // Ensure always array
          host_profile: data.profiles && {
            id: data.profiles.id,
            full_name: data.profiles.full_name,
            avatar_url: data.profiles.profile_image,
            created_at: data.profiles.created_at,
          },
        };

        setCar(transformedCar);
      } catch (err) {
        console.error('Error fetching car:', err);
        setError('Failed to fetch car');
        setCar(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCar();
  }, [id]);

  return {
    car,
    isLoading,
    error,
  };
} 