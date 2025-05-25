'use client';

import { useState, useEffect, useCallback } from 'react';
import { getHostCars, getHostStats, deleteCar, CarWithBookingStats, CarStats } from '@/lib/car/hostCars';
import { useAuth } from './useAuth';
import { toast } from 'react-hot-toast';

export function useHostCars() {
  const { user } = useAuth();
  const [cars, setCars] = useState<CarWithBookingStats[]>([]);
  const [stats, setStats] = useState<CarStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCars = useCallback(async () => {
    if (!user) return;

    try {
      setError(null);
      const { data, error: fetchError } = await getHostCars(user.id);
      
      if (fetchError) {
        setError(fetchError);
        toast.error(fetchError);
        return;
      }

      setCars(data || []);
    } catch (err) {
      console.error('Error fetching cars:', err);
      const errorMessage = 'Failed to fetch cars';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, [user]);

  const fetchStats = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error: statsError } = await getHostStats(user.id);
      
      if (statsError) {
        console.error('Error fetching stats:', statsError);
        return;
      }

      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, [user]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchCars(), fetchStats()]);
    setIsLoading(false);
  }, [fetchCars, fetchStats]);

  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([fetchCars(), fetchStats()]);
    setIsRefreshing(false);
  }, [fetchCars, fetchStats]);

  const handleDeleteCar = useCallback(async (carId: string) => {
    try {
      const { success, error: deleteError } = await deleteCar(carId);
      
      if (!success) {
        toast.error(deleteError || 'Failed to delete car');
        return false;
      }

      // Remove car from local state
      setCars(prev => prev.filter(car => car.id !== carId));
      
      // Refresh stats
      await fetchStats();
      
      toast.success('Car deleted successfully');
      return true;
    } catch (err) {
      console.error('Error deleting car:', err);
      toast.error('Failed to delete car');
      return false;
    }
  }, [fetchStats]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  return {
    cars,
    stats,
    isLoading,
    isRefreshing,
    error,
    refreshData,
    deleteCar: handleDeleteCar,
    refetch: fetchData
  };
} 