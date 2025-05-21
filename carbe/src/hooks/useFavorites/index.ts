import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Car } from '@/lib/car';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Car[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fetch favorites
  const fetchFavorites = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setFavorites([]);
        setFavoriteIds([]);
        setIsLoading(false);
        return;
      }
      
      // Fetch the user's favorites
      const { data: userFavorites, error } = await supabase
        .from('favorites')
        .select('car_id')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error fetching favorites:', error);
        setIsLoading(false);
        return;
      }
      
      // Extract car IDs
      const carIds = userFavorites.map(favorite => favorite.car_id);
      setFavoriteIds(carIds);
      
      if (carIds.length === 0) {
        setFavorites([]);
        setIsLoading(false);
        return;
      }
      
      // Fetch car details for the favorite cars
      const { data: cars, error: carsError } = await supabase
        .from('cars')
        .select('*')
        .in('id', carIds);
      
      if (carsError) {
        console.error('Error fetching favorite cars:', carsError);
        setIsLoading(false);
        return;
      }
      
      setFavorites(cars || []);
    } catch (error) {
      console.error('Error in fetchFavorites:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add a car to favorites
  const addFavorite = useCallback(async (carId: string) => {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // If not logged in, redirect to login
        router.push('/signin');
        return false;
      }
      
      // Add the car to favorites
      const { error } = await supabase.from('favorites').insert({
        user_id: user.id,
        car_id: carId,
      });
      
      if (error) {
        console.error('Error adding favorite:', error);
        return false;
      }
      
      // Refresh favorites
      await fetchFavorites();
      return true;
    } catch (error) {
      console.error('Error in addFavorite:', error);
      return false;
    }
  }, [fetchFavorites, router]);

  // Remove a car from favorites
  const removeFavorite = useCallback(async (carId: string) => {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return false;
      }
      
      // Remove the car from favorites
      const { error } = await supabase
        .from('favorites')
        .delete()
        .match({ user_id: user.id, car_id: carId });
      
      if (error) {
        console.error('Error removing favorite:', error);
        return false;
      }
      
      // Refresh favorites
      await fetchFavorites();
      return true;
    } catch (error) {
      console.error('Error in removeFavorite:', error);
      return false;
    }
  }, [fetchFavorites]);

  // Check if a car is in favorites
  const isFavorite = useCallback((carId: string) => {
    return favoriteIds.includes(carId);
  }, [favoriteIds]);

  // Toggle favorite status
  const toggleFavorite = useCallback(async (carId: string) => {
    if (isFavorite(carId)) {
      return removeFavorite(carId);
    } else {
      return addFavorite(carId);
    }
  }, [isFavorite, removeFavorite, addFavorite]);

  // Load favorites on component mount
  useEffect(() => {
    fetchFavorites();
    
    // Set up realtime subscription for favorites changes
    const favoritesSubscription = supabase
      .channel('favorites_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'favorites',
        },
        () => {
          fetchFavorites();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(favoritesSubscription);
    };
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