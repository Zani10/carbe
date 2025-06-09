'use client';

import { useCarsContext } from '@/contexts/CarContext';
import { FilterState } from '@/components/home/FilterModal';

/**
 * Simple hook to access cached cars with search functionality
 * This replaces direct Supabase calls and provides cached results
 */
export function useCachedCars() {
  const { state, fetchCars, clearCache } = useCarsContext();

  const searchCars = async (params?: {
    location: string;
    dates: [Date | null, Date | null];
    filters?: FilterState;
  }) => {
    await fetchCars(params);
  };

  return {
    cars: state.cars,
    isLoading: state.isLoading,
    error: state.error,
    searchCars,
    clearCache,
    lastFetch: state.lastFetch,
  };
} 