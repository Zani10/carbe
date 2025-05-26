import { supabase } from '@/lib/supabase';

export interface CarWithHost {
  id: string;
  make: string;
  model: string;
  year: number;
  description: string;
  price_per_day: number;
  location: string;
  transmission: string;
  seats: number;
  fuel_type: string;
  range_km: number | null;
  lock_type: string;
  images: string[];
  rating: number | null;
  created_at: string;
  owner_id: string;
  host_profile?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    verified: boolean;
    created_at: string;
  } | null;
}

export async function getCarById(carId: string): Promise<{
  data: CarWithHost | null;
  error: string | null;
}> {
  try {
    console.log('Fetching car with ID:', carId);
    
    const { data: car, error } = await supabase
      .from('cars')
      .select(`
        *,
        profiles!owner_id(
          id,
          full_name,
          avatar_url,
          verified,
          created_at
        )
      `)
      .eq('id', carId)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return { data: null, error: error.message };
    }

    if (!car) {
      return { data: null, error: 'Car not found' };
    }

    // Transform the data to match our interface
    const { profiles, ...carData } = car;
    const carWithHost: CarWithHost = {
      ...carData,
      host_profile: profiles || null
    };

    console.log('Successfully fetched car:', carWithHost);
    return { data: carWithHost, error: null };
  } catch (error) {
    console.error('Error fetching car by ID:', error);
    return { data: null, error: 'Failed to fetch car details' };
  }
} 