'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Car } from '@/hooks/useCars';
import { FilterState } from '@/components/home/FilterModal';

// Types
interface CarState {
  cars: Car[];
  isLoading: boolean;
  error: string | null;
  lastFetch: number | null;
  searchParams: {
    location: string;
    dates: [Date | null, Date | null];
    filters?: FilterState;
  } | null;
  individualCars: Record<string, Car>;
  individualCarsLoading: Record<string, boolean>;
}

interface CarContextType {
  state: CarState;
  fetchCars: (params?: {
    location: string;
    dates: [Date | null, Date | null];
    filters?: FilterState;
  }) => Promise<void>;
  getCarById: (id: string) => Promise<Car | null>;
  clearCache: () => void;
  setCars: (cars: Car[]) => void;
}

// Actions
type CarAction =
  | { type: 'FETCH_CARS_START'; payload: { location: string; dates: [Date | null, Date | null]; filters?: FilterState } | null }
  | { type: 'FETCH_CARS_SUCCESS'; payload: Car[] }
  | { type: 'FETCH_CARS_ERROR'; payload: string }
  | { type: 'FETCH_CAR_BY_ID_START'; payload: string }
  | { type: 'FETCH_CAR_BY_ID_SUCCESS'; payload: { id: string; car: Car } }
  | { type: 'FETCH_CAR_BY_ID_ERROR'; payload: { id: string; error: string } }
  | { type: 'CLEAR_CACHE' }
  | { type: 'SET_CARS'; payload: Car[] };

// Initial state
const initialState: CarState = {
  cars: [],
  isLoading: false,
  error: null,
  lastFetch: null,
  searchParams: null,
  individualCars: {},
  individualCarsLoading: {},
};

// Reducer
function carReducer(state: CarState, action: CarAction): CarState {
  switch (action.type) {
    case 'FETCH_CARS_START':
      return {
        ...state,
        isLoading: true,
        error: null,
        searchParams: action.payload,
      };
    case 'FETCH_CARS_SUCCESS':
      return {
        ...state,
        isLoading: false,
        cars: action.payload,
        lastFetch: Date.now(),
        error: null,
      };
    case 'FETCH_CARS_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'FETCH_CAR_BY_ID_START':
      return {
        ...state,
        individualCarsLoading: {
          ...state.individualCarsLoading,
          [action.payload]: true,
        },
      };
    case 'FETCH_CAR_BY_ID_SUCCESS':
      return {
        ...state,
        individualCars: {
          ...state.individualCars,
          [action.payload.id]: action.payload.car,
        },
        individualCarsLoading: {
          ...state.individualCarsLoading,
          [action.payload.id]: false,
        },
      };
    case 'FETCH_CAR_BY_ID_ERROR':
      return {
        ...state,
        individualCarsLoading: {
          ...state.individualCarsLoading,
          [action.payload.id]: false,
        },
      };
    case 'CLEAR_CACHE':
      return initialState;
    case 'SET_CARS':
      return {
        ...state,
        cars: action.payload,
        lastFetch: Date.now(),
      };
    default:
      return state;
  }
}

// Context
const CarContext = createContext<CarContextType | undefined>(undefined);

// Cache duration (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// Provider
export function CarProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(carReducer, initialState);

  // Check if cache is still valid
  const isCacheValid = useCallback((searchParams?: typeof state.searchParams) => {
    if (!state.lastFetch) return false;
    
    // Check time validity
    const isTimeValid = Date.now() - state.lastFetch < CACHE_DURATION;
    if (!isTimeValid) return false;
    
    // Check search params match
    if (!searchParams && !state.searchParams) return true;
    if (!searchParams || !state.searchParams) return false;
    
    return (
      searchParams.location === state.searchParams.location &&
      searchParams.dates[0]?.getTime() === state.searchParams.dates[0]?.getTime() &&
      searchParams.dates[1]?.getTime() === state.searchParams.dates[1]?.getTime() &&
      JSON.stringify(searchParams.filters) === JSON.stringify(state.searchParams.filters)
    );
  }, [state.lastFetch, state.searchParams]);

  const fetchCars = useCallback(async (params?: {
    location: string;
    dates: [Date | null, Date | null];
    filters?: FilterState;
  }) => {
    // Check cache validity
    if (isCacheValid(params)) {
      console.log('🎯 Using cached cars data');
      return;
    }

    console.log('🔄 Fetching fresh cars data');
    dispatch({ type: 'FETCH_CARS_START', payload: params || null });

    try {
      let query = supabase
        .from('cars')
        .select('*')
        .eq('is_available', true);

      // Apply search filters if provided
      if (params?.location && params.location !== 'Anywhere') {
        query = query.ilike('location', `%${params.location}%`);
      }

      // Apply other filters if provided
      if (params?.filters) {
        const { priceRange, vehicleTypes, transmission, seats, brands } = params.filters;
        
        if (priceRange) {
          query = query.gte('price_per_day', priceRange[0]).lte('price_per_day', priceRange[1]);
        }
        if (vehicleTypes && vehicleTypes.length > 0 && !vehicleTypes.includes('cars')) {
          const typeConditions = vehicleTypes.map(type => `fuel_type.ilike.%${type}%`);
          query = query.or(typeConditions.join(','));
        }
        if (transmission && transmission.length > 0) {
          const transmissionConditions = transmission.map(t => `transmission.eq.${t.charAt(0).toUpperCase() + t.slice(1)}`);
          query = query.or(transmissionConditions.join(','));
        }
        if (seats && seats.length > 0) {
          const seatNumbers = seats.map(s => s === '7+' ? 7 : parseInt(s)).filter(n => !isNaN(n));
          if (seatNumbers.length > 0) {
            const seatConditions = seatNumbers.map(n => `seats.gte.${n}`);
            query = query.or(seatConditions.join(','));
          }
        }
        if (brands && brands.length > 0) {
          const brandConditions = brands.map(brand => `make.ilike.%${brand}%`);
          query = query.or(brandConditions.join(','));
        }
      }

      const { data, error } = await query
        .order('rating', { ascending: false })
        .order('price_per_day', { ascending: true });

      if (error) throw error;
      
      dispatch({ type: 'FETCH_CARS_SUCCESS', payload: data || [] });
    } catch (error) {
      console.error('Error fetching cars:', error);
      dispatch({ type: 'FETCH_CARS_ERROR', payload: 'Failed to fetch cars' });
    }
  }, [isCacheValid]);

  const getCarById = useCallback(async (id: string): Promise<Car | null> => {
    // Check if car is already in cache
    if (state.individualCars[id]) {
      console.log(`🎯 Using cached car data for ${id}`);
      return state.individualCars[id];
    }

    // Check if car is in the main cars list
    const carFromList = state.cars.find(car => car.id === id);
    if (carFromList) {
      console.log(`🎯 Using car from main list for ${id}`);
      dispatch({ type: 'FETCH_CAR_BY_ID_SUCCESS', payload: { id, car: carFromList } });
      return carFromList;
    }

    // Skip if already loading
    if (state.individualCarsLoading[id]) {
      return null;
    }

    console.log(`🔄 Fetching fresh car data for ${id}`);
    dispatch({ type: 'FETCH_CAR_BY_ID_START', payload: id });

    try {
      const { data, error } = await supabase
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

      if (error) throw error;

      if (!data) {
        dispatch({ type: 'FETCH_CAR_BY_ID_ERROR', payload: { id, error: 'Car not found' } });
        return null;
      }

      const transformedCar: Car = {
        ...data,
        images: data.images ?? [],
        host_profile: data.profiles && {
          id: data.profiles.id,
          full_name: data.profiles.full_name,
          avatar_url: data.profiles.profile_image,
          created_at: data.profiles.created_at,
        },
      };

      dispatch({ type: 'FETCH_CAR_BY_ID_SUCCESS', payload: { id, car: transformedCar } });
      return transformedCar;
    } catch (error) {
      console.error(`Error fetching car ${id}:`, error);
      dispatch({ type: 'FETCH_CAR_BY_ID_ERROR', payload: { id, error: 'Failed to fetch car' } });
      return null;
    }
  }, [state.individualCars, state.cars, state.individualCarsLoading]);

  const clearCache = useCallback(() => {
    console.log('🗑️ Clearing car cache');
    dispatch({ type: 'CLEAR_CACHE' });
  }, []);

  const setCars = useCallback((cars: Car[]) => {
    dispatch({ type: 'SET_CARS', payload: cars });
  }, []);

  // Load initial cars on mount
  useEffect(() => {
    if (state.cars.length === 0 && !state.isLoading) {
      fetchCars();
    }
  }, [fetchCars]);

  const value: CarContextType = {
    state,
    fetchCars,
    getCarById,
    clearCache,
    setCars,
  };

  return (
    <CarContext.Provider value={value}>
      {children}
    </CarContext.Provider>
  );
}

// Hook
export function useCarsContext() {
  const context = useContext(CarContext);
  if (context === undefined) {
    throw new Error('useCarsContext must be used within a CarProvider');
  }
  return context;
} 