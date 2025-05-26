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
  images: string[] | null;
  rating: number | null;
  fuel_type: string | null;
  seats: number | null;
  description: string | null;
  availability_start: string | null;
  availability_end: string | null;
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

export function useCars(filters?: UseCarFilters) {
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCars = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Build query - get all cars (no is_available field exists)
      let query = supabase
        .from('cars')
        .select('*')
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

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      // Transform data to match our interface (without host profile for now)
      const transformedCars: Car[] = (data || []).map(car => ({
        ...car,
        host_profile: undefined, // Will add host profile once we fix the join
      }));

      setCars(transformedCars);
    } catch (err) {
      console.error('Error fetching cars:', err);
      setError('Failed to fetch cars');
      setCars([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

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
          .select('*')
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

        // Transform data to match our interface (without host profile for now)
        const transformedCar: Car = {
          ...data,
          host_profile: undefined, // Will add host profile once we fix the join
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