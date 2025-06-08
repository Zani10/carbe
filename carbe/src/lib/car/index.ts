import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import { FilterState } from '@/components/home/FilterModal';

export type Car = Database['public']['Tables']['cars']['Row'];
export type CarInsert = Database['public']['Tables']['cars']['Insert'];
export type CarUpdate = Database['public']['Tables']['cars']['Update'];

/**
 * Enhanced search interface for cars
 */
export interface CarSearchParams {
  location?: string;
  startDate?: Date;
  endDate?: Date;
  filters?: FilterState;
  // Legacy filter support
  make?: string;
  model?: string;
  priceMin?: number;
  priceMax?: number;
  transmission?: string;
  seats?: number;
  fuelType?: string;
}

/**
 * Get all cars with optional filtering and search
 */
export async function getCars(searchParams?: CarSearchParams) {
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

  // Apply filters if provided
  if (searchParams) {
    const { filters, location, startDate, endDate, ...legacyFilters } = searchParams;

    // Handle location search
    if (location && location !== 'Anywhere' && location !== 'Nearby') {
      // Extract just the country/city parts for better matching
      const searchTerms = location.split(',').map(term => term.trim());
      
      // If searching for "Amsterdam, Netherlands" or just "Netherlands", try multiple approaches
      if (searchTerms.length > 1) {
        // Multi-part location like "Amsterdam, Netherlands"
        const city = searchTerms[0];
        const country = searchTerms[1];
        
        // Search for cars that match either the city or country
        query = query.or(`location.ilike.%${city}%,location.ilike.%${country}%`);
      } else {
        // Single search term - could be city or country
      query = query.ilike('location', `%${location}%`);
      }
    }

    // Handle new filter structure
    if (filters) {
      // Vehicle types
      if (filters.vehicleTypes.length > 0 && !filters.vehicleTypes.includes('cars')) {
        // Map vehicle types to database values if needed
        const dbVehicleTypes = filters.vehicleTypes.map(type => {
          switch (type) {
            case 'suvs': return 'SUV';
            case 'minivans': return 'Minivan';
            case 'trucks': return 'Truck';
            case 'vans': return 'Van';
            case 'cargo_vans': return 'Cargo Van';
            case 'box_trucks': return 'Box Truck';
            default: return 'Car';
          }
        });
        query = query.in('vehicle_type', dbVehicleTypes);
      }

      // Brands
      if (filters.brands.length > 0) {
        const brandNames = filters.brands.map(brandId => {
          // Convert brand IDs to actual brand names
          const brandMap: { [key: string]: string } = {
            'volkswagen': 'Volkswagen',
            'toyota': 'Toyota',
            'nissan': 'Nissan',
            'mercedes': 'Mercedes-Benz',
            'bmw': 'BMW',
            'audi': 'Audi',
            'ford': 'Ford',
            'honda': 'Honda',
            'tesla': 'Tesla',
            'porsche': 'Porsche',
            'jaguar': 'Jaguar',
            'land_rover': 'Land Rover',
            'volvo': 'Volvo',
            'mazda': 'Mazda',
            'subaru': 'Subaru',
            'kia': 'Kia',
            'hyundai': 'Hyundai',
            'peugeot': 'Peugeot',
            'renault': 'Renault',
            'citroen': 'Citroën',
            'fiat': 'Fiat',
            'seat': 'SEAT',
            'skoda': 'Škoda'
          };
          return brandMap[brandId] || brandId;
        });
        query = query.in('make', brandNames);
      }

      // Price range
      if (filters.priceRange[0] > 10 || filters.priceRange[1] < 500) {
        query = query.gte('price_per_day', filters.priceRange[0]);
        query = query.lte('price_per_day', filters.priceRange[1]);
      }

      // Transmission
      if (filters.transmission.length > 0) {
        const transmissionTypes = filters.transmission.map(t => 
          t.charAt(0).toUpperCase() + t.slice(1)
        );
        query = query.in('transmission', transmissionTypes);
      }

      // Seats
      if (filters.seats.length > 0) {
        const seatNumbers = filters.seats.map(s => {
          if (s === '7+') return 7; // Handle 7+ as minimum 7 seats
          return parseInt(s, 10);
        });
        
        if (filters.seats.includes('7+')) {
          // If 7+ is selected, get cars with 7 or more seats
          query = query.gte('seats', 7);
        } else {
          query = query.in('seats', seatNumbers);
        }
      }

      // Years
      if (filters.years.length > 0) {
        const currentYear = new Date().getFullYear();
        let yearConditions: string[] = [];
        
        filters.years.forEach(yearRange => {
          switch (yearRange) {
            case 'new':
              yearConditions.push(`year >= 2020`);
              break;
            case 'recent':
              yearConditions.push(`year >= 2015 AND year <= 2019`);
              break;
            case 'older':
              yearConditions.push(`year >= 2010 AND year <= 2014`);
              break;
            case 'classic':
              yearConditions.push(`year < 2010`);
              break;
          }
        });
        
        if (yearConditions.length > 0) {
          // Use OR logic for year ranges
          query = query.or(yearConditions.join(','));
        }
      }

      // Eco-friendly
      if (filters.ecoFriendly.length > 0) {
        const fuelTypes = filters.ecoFriendly.map(eco => {
          switch (eco) {
            case 'electric': return 'Electric';
            case 'hybrid': return 'Hybrid';
            default: return eco;
          }
        });
        query = query.in('fuel_type', fuelTypes);
      }
    }

    // Handle legacy filters for backward compatibility
    if (legacyFilters.make) {
      query = query.ilike('make', `%${legacyFilters.make}%`);
    }
    if (legacyFilters.model) {
      query = query.ilike('model', `%${legacyFilters.model}%`);
    }
    if (legacyFilters.priceMin) {
      query = query.gte('price_per_day', legacyFilters.priceMin);
    }
    if (legacyFilters.priceMax) {
      query = query.lte('price_per_day', legacyFilters.priceMax);
    }
    if (legacyFilters.transmission) {
      query = query.eq('transmission', legacyFilters.transmission);
    }
    if (legacyFilters.seats) {
      query = query.eq('seats', legacyFilters.seats);
    }
    if (legacyFilters.fuelType) {
      query = query.eq('fuel_type', legacyFilters.fuelType);
    }

    // TODO: Add date availability filtering
    // This would require checking against a bookings table
    if (startDate && endDate) {
      // This is a placeholder - in a real implementation, you'd check for conflicts
      // with existing bookings in a separate query or join
      console.log('Date filtering not yet implemented:', { startDate, endDate });
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching cars:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get a car by its ID
 */
export async function getCarById(id: string) {
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching car with ID ${id}:`, error);
    throw error;
  }

  return data;
}

/**
 * Create a new car listing
 */
export async function createCar(car: CarInsert) {
  const { data, error } = await supabase
    .from('cars')
    .insert(car)
    .select()
    .single();

  if (error) {
    console.error('Error creating car:', error);
    throw error;
  }

  return data;
}

/**
 * Update an existing car listing
 */
export async function updateCar(id: string, updates: CarUpdate) {
  const { data, error } = await supabase
    .from('cars')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating car with ID ${id}:`, error);
    throw error;
  }

  return data;
}

/**
 * Delete a car listing
 */
export async function deleteCar(id: string) {
  const { error } = await supabase
    .from('cars')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting car with ID ${id}:`, error);
    throw error;
  }

  return true;
}

/**
 * Get cars by owner ID
 */
export async function getCarsByOwnerId(ownerId: string) {
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .eq('owner_id', ownerId);

  if (error) {
    console.error(`Error fetching cars for owner ${ownerId}:`, error);
    throw error;
  }

  return data;
} 