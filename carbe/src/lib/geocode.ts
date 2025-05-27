'use client';

import { supabase } from './supabase';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeocodeResult extends Coordinates {
  address: string;
  cached: boolean;
}

export interface CarWithCoordinates {
  id: string;
  lat: number;
  lng: number;
  pricePerDay: number;
  make: string;
  model: string;
  images: string[];
  rating: number | null;
  location: string;
}

// In-memory cache for session
const geocodeCache = new Map<string, Coordinates>();

// Default center (Amsterdam, Netherlands - adjust as needed)
const DEFAULT_CENTER: Coordinates = { lat: 52.3676, lng: 4.9041 };

/**
 * Normalize address for consistent caching
 */
function normalizeAddress(address: string): string {
  return address.toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Add small random jitter to coordinates to prevent exact overlaps
 */
function addJitter(coords: Coordinates): Coordinates {
  const jitterAmount = 0.0002; // ~20 meters
  return {
    lat: coords.lat + (Math.random() - 0.5) * jitterAmount,
    lng: coords.lng + (Math.random() - 0.5) * jitterAmount,
  };
}

/**
 * Get user's current location
 */
export function getUserLocation(): Promise<Coordinates> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(DEFAULT_CENTER);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        // If geolocation fails, use default center
        resolve(DEFAULT_CENTER);
      },
      {
        timeout: 10000,
        enableHighAccuracy: false,
      }
    );
  });
}

/**
 * Geocode a single address using Nominatim (free OpenStreetMap service)
 * Alternative: Use Google Geocoding API, Mapbox, etc. for production
 */
async function geocodeAddress(address: string): Promise<Coordinates | null> {
  const normalizedAddress = normalizeAddress(address);
  
  // Check in-memory cache first
  if (geocodeCache.has(normalizedAddress)) {
    return geocodeCache.get(normalizedAddress)!;
  }

  try {
    // Check Supabase cache first
    const { data: cached } = await supabase
      .from('geocode_cache')
      .select('lat, lng')
      .eq('address', normalizedAddress)
      .single();

    if (cached) {
      const coords = { lat: cached.lat, lng: cached.lng };
      geocodeCache.set(normalizedAddress, coords);
      return coords;
    }

    // If not cached, geocode using Nominatim
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`,
      {
        headers: {
          'User-Agent': 'Carbe-App/1.0', // Required by Nominatim
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || data.length === 0) {
      throw new Error('No geocoding results found');
    }

    const coords: Coordinates = {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };

    // Cache in memory
    geocodeCache.set(normalizedAddress, coords);

    // Cache in Supabase (fire and forget)
    try {
      await supabase
        .from('geocode_cache')
        .insert({ address: normalizedAddress, lat: coords.lat, lng: coords.lng });
      console.log('Cached geocode result for:', address);
    } catch (error) {
      console.warn('Failed to cache geocode result:', error);
    }

    return coords;
  } catch (error) {
    console.error('Geocoding error for address:', address, error);
    return null;
  }
}

/**
 * Geocode multiple addresses with rate limiting
 */
export async function geocodeAll(cars: Array<{ id: string; location: string; price_per_day: number; make: string; model: string; images: string[]; rating: number | null }>): Promise<CarWithCoordinates[]> {
  const results: CarWithCoordinates[] = [];
  
  // Process in batches to avoid rate limiting
  const batchSize = 5;
  const delay = 1000; // 1 second between batches

  for (let i = 0; i < cars.length; i += batchSize) {
    const batch = cars.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (car) => {
      if (!car.location) {
        return null;
      }

      const coords = await geocodeAddress(car.location);
      if (!coords) {
        return null;
      }

      const jitteredCoords = addJitter(coords);
      return {
        id: car.id,
        lat: jitteredCoords.lat,
        lng: jitteredCoords.lng,
        pricePerDay: car.price_per_day,
        make: car.make,
        model: car.model,
        images: car.images,
        rating: car.rating,
        location: car.location,
      };
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults.filter((result): result is CarWithCoordinates => result !== null));

    // Add delay between batches (except for the last batch)
    if (i + batchSize < cars.length) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return results;
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
} 