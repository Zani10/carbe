import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '../useAuth';
import { Car } from '../useCars';

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Car[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch favorites from Supabase
  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      setFavoriteIds([]);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // First, get favorite car IDs
      const { data: favoriteData, error: favoriteError } = await supabase
        .from('favorites')
        .select('car_id')
        .eq('user_id', user.id);

      if (favoriteError) {
        console.error('Error fetching favorites:', favoriteError);
        setFavorites([]);
        setFavoriteIds([]);
        return;
      }

      if (!favoriteData || favoriteData.length === 0) {
        setFavorites([]);
        setFavoriteIds([]);
        return;
      }

      const carIds = favoriteData.map(fav => fav.car_id);
      setFavoriteIds(carIds);

      // Then, get cars data for those IDs
      const { data: carsData, error: carsError } = await supabase
        .from('cars')
        .select('*')
        .in('id', carIds);

      if (carsError) {
        console.error('Error fetching cars:', carsError);
        setFavorites([]);
        return;
      }

      if (!carsData || carsData.length === 0) {
        setFavorites([]);
        return;
      }

      // Get unique owner IDs
      const ownerIds = [...new Set(carsData.map(car => car.owner_id))];

      // Get profiles for all owners
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, profile_image, created_at')
        .in('id', ownerIds);

      if (profilesError) {
        console.warn('Could not fetch profiles:', profilesError);
      }

      // Create a map of profiles by ID
      const profilesMap = new Map();
      if (profilesData) {
        profilesData.forEach(profile => {
          profilesMap.set(profile.id, profile);
        });
      }

      // Transform cars with profile data
      const transformedCars: Car[] = carsData.map(car => {
        const profile = profilesMap.get(car.owner_id);
        
        return {
          ...car,
          images: car.images ?? [],
          host_profile: profile ? {
            id: profile.id,
            full_name: profile.full_name,
            avatar_url: profile.profile_image,
            created_at: profile.created_at,
          } : undefined,
        };
      });

      setFavorites(transformedCars);
      setFavoriteIds(carIds);
    } catch (error) {
      console.error('Error in fetchFavorites:', error);
      setFavorites([]);
      setFavoriteIds([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Add a car to favorites
  const addFavorite = useCallback(async (carId: string) => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('favorites')
        .insert([{
          user_id: user.id,
          car_id: carId
        }]);

      if (error) {
        console.error('Error adding favorite:', error);
        return false;
      }
      
      // Update local state
      if (!favoriteIds.includes(carId)) {
        setFavoriteIds(prev => [...prev, carId]);
        // Refresh favorites to get the full car data
        await fetchFavorites();
      }
      
      return true;
    } catch (error) {
      console.error('Error in addFavorite:', error);
      return false;
    }
  }, [user, favoriteIds, fetchFavorites]);

  // Remove a car from favorites with direct optimistic update
  const removeFavorite = useCallback(async (carId: string) => {
    if (!user) return false;
    
    try {
      // IMMEDIATE optimistic update - remove from display right away
      setFavorites(prev => {
        const newFavorites = prev.filter(car => car.id !== carId);
        console.log('🚀 Optimistic update: removing car', carId, 'new length:', newFavorites.length);
        return newFavorites;
      });
      setFavoriteIds(prev => prev.filter(id => id !== carId));

      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('car_id', carId);

      if (error) {
        console.error('❌ Database error removing favorite:', error);
        // On error, refresh from database to get correct state
        await fetchFavorites();
        return false;
      }
      
      console.log('✅ Successfully removed favorite from database');
      // Success - optimistic update was correct, no need to change anything
      return true;
    } catch (error) {
      console.error('💥 Error in removeFavorite:', error);
      // On error, refresh from database to get correct state
      await fetchFavorites();
      return false;
    }
  }, [user, fetchFavorites]); // Need fetchFavorites for error recovery

  // Check if a car is in favorites
  const isFavorite = useCallback((carId: string) => {
    return favoriteIds.includes(carId);
  }, [favoriteIds]);

  // Toggle favorite status
  const toggleFavorite = useCallback(async (carId: string) => {
    if (!user) return false;
    
    if (isFavorite(carId)) {
      return removeFavorite(carId);
    } else {
      return addFavorite(carId);
    }
  }, [isFavorite, removeFavorite, addFavorite, user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return {
    favorites,
    favoriteIds,
    isLoading,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    refreshFavorites: fetchFavorites,
  };
} 