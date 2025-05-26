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
      
      const { data, error } = await supabase
        .from('user_favorites')
        .select(`
          car_id,
          cars (
            *,
            profiles!owner_id(
              id,
              full_name,
              avatar_url,
              created_at
            )
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching favorites:', error);
        setFavorites([]);
        setFavoriteIds([]);
        return;
      }

      // Transform the data - temporarily use any for complex Supabase types
      const favoriteCars = (data || [])
        .map((item: any) => item.cars)
        .filter((car: any) => car !== null)
        .map((car: any) => ({
          ...car,
          host_profile: car.profiles ? {
            id: car.profiles.id,
            full_name: car.profiles.full_name,
            avatar_url: car.profiles.avatar_url,
            created_at: car.profiles.created_at,
          } : undefined,
        })) as Car[];

      const favoriteCarIds = favoriteCars.map(car => car.id);

      setFavorites(favoriteCars);
      setFavoriteIds(favoriteCarIds);
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
        .from('user_favorites')
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
      }
      
      // Refresh favorites to get the full car data
      await fetchFavorites();
      
      return true;
    } catch (error) {
      console.error('Error in addFavorite:', error);
      return false;
    }
  }, [user, favoriteIds, fetchFavorites]);

  // Remove a car from favorites
  const removeFavorite = useCallback(async (carId: string) => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('car_id', carId);

      if (error) {
        console.error('Error removing favorite:', error);
        return false;
      }
      
      // Update local state
      setFavoriteIds(prev => prev.filter(id => id !== carId));
      setFavorites(prev => prev.filter(car => car.id !== carId));
      
      return true;
    } catch (error) {
      console.error('Error in removeFavorite:', error);
      return false;
    }
  }, [user]);

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

  // Load favorites on component mount or when user changes
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