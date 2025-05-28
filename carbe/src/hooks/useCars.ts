'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// Real car interface matching Supabase schema
export interface Car {
  id: string;
  owner_id: string;
  make: string;
  model: string;
  year: number;
  price_per_day: number;
  location: string | null;
  transmission: string | null;
  images: string[]; // Always an array
  rating: number | null;
  fuel_type: string | null;
  seats: number | null;
  description: string | null;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  // Host profile from join
  host_profile?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    created_at: string;
  };
}

export interface UseCarFilters {
  make?: string;
  model?: string;
  priceMin?: number;
  priceMax?: number;
  transmission?: string;
  fuelType?: string;
  location?: string;
}

// Timeout wrapper to prevent stuck loaders
async function fetchWithTimeout<T>(fn: () => Promise<T>, ms = 10000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Request timed out')), ms);
    fn()
      .then(res => { clearTimeout(timer); resolve(res); })
      .catch(err => { clearTimeout(timer); reject(err); });
  });
}

export function useCars(filters?: UseCarFilters) {
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCars = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Build query with timeout wrapper
      const queryFn = async () => {
        let query = supabase
          .from('cars')
          .select(`
            *,
            profiles!owner_id (
              id,
              full_name,
              profile_image,
              created_at
            )
          `)
          .eq('is_available', true) // Only available cars
          .order('created_at', { ascending: false });

        // Apply filters
        if (filters) {
          if (filters.make) {
            query = query.ilike('make', `%${filters.make}%`);
          }
          if (filters.model) {
            query = query.ilike('model', `%${filters.model}%`);
          }
          if (filters.priceMin !== undefined) {
            query = query.gte('price_per_day', filters.priceMin);
          }
          if (filters.priceMax !== undefined) {
            query = query.lte('price_per_day', filters.priceMax);
          }
          if (filters.transmission) {
            query = query.eq('transmission', filters.transmission);
          }
          if (filters.fuelType) {
            query = query.eq('fuel_type', filters.fuelType);
          }
          if (filters.location) {
            query = query.ilike('location', `%${filters.location}%`);
          }
        }

        return query;
      };

      const { data, error: fetchError } = await fetchWithTimeout(queryFn);

      if (fetchError) {
        throw fetchError;
      }

      // Transform data with ChatGPT's improvements
      const transformedCars: Car[] = (data || []).map(car => ({
        ...car,
        images: car.images ?? [], // Ensure always array
        host_profile: car.profiles && {
          id: car.profiles.id,
          full_name: car.profiles.full_name,
          avatar_url: car.profiles.profile_image, // Map profile_image → avatar_url
          created_at: car.profiles.created_at,
        },
      }));

      setCars(transformedCars);
    } catch (err) {
      console.error('Error fetching cars:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch cars');
      setCars([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  // Re-fetch when tab becomes visible (fixes tab switching issues)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && cars.length === 0 && !isLoading) {
        console.log('Tab became visible, re-fetching cars...');
        fetchCars();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchCars, cars.length, isLoading]);

  return {
    cars,
    isLoading,
    error,
    refetch: fetchCars,
  };
}

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