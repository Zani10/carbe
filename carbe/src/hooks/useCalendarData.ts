import { useState, useEffect, useCallback } from 'react';
import { CalendarData, CalendarMetrics, BulkOperation } from '@/types/calendar';
import { supabase } from '@/lib/supabase';

interface UseCalendarDataResult {
  data?: CalendarData;
  loading: boolean;
  error: string | null;
  metrics?: CalendarMetrics;
  updateAvailability: (dates: string[], status: 'available' | 'blocked', carIds: string[]) => Promise<void>;
  updatePricing: (date: string, price: number, carIds: string[], isWeekendOverride?: boolean) => Promise<void>;
  bulkUpdate: (operation: BulkOperation) => Promise<void>;
  refreshData: () => Promise<void>;
}

export function useCalendarData(
  displayMonth: string,
  selectedCarIds: string[]
): UseCalendarDataResult {
  const [data, setData] = useState<CalendarData | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<CalendarMetrics | undefined>();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        month: displayMonth,
        carIds: selectedCarIds.join(',')
      });

      // Get the current session to send the access token
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization header if we have a session
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const response = await fetch(`/api/host/calendar?${params}`, { headers });
      
      if (!response.ok) {
        throw new Error('Failed to fetch calendar data');
      }

      const result = await response.json();
      setData(result.calendarData);
      setMetrics(result.metrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [displayMonth, selectedCarIds]);

  const updateAvailability = useCallback(async (
    dates: string[],
    status: 'available' | 'blocked',
    carIds: string[]
  ) => {
    try {
      const response = await fetch('/api/host/calendar/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carIds,
          dates,
          status
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update availability');
      }

      // Optimistically update local state
      if (data) {
        const newData = { ...data };
        carIds.forEach(carId => {
          if (!newData.availability[carId]) {
            newData.availability[carId] = {};
          }
          dates.forEach(date => {
            newData.availability[carId][date] = status;
          });
        });
        setData(newData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update availability');
      throw err;
    }
  }, [data]);

  const updatePricing = useCallback(async (
    date: string,
    price: number,
    carIds: string[],
    isWeekendOverride = false
  ) => {
    try {
      const response = await fetch('/api/host/calendar/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carIds,
          date,
          priceOverride: price,
          isWeekendOverride
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update pricing');
      }

      // Optimistically update local state
      if (data) {
        const newData = { ...data };
        carIds.forEach(carId => {
          if (!newData.pricingOverrides[carId]) {
            newData.pricingOverrides[carId] = {};
          }
          newData.pricingOverrides[carId][date] = price;
        });
        setData(newData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update pricing');
      throw err;
    }
  }, [data]);

  const bulkUpdate = useCallback(async (operation: BulkOperation) => {
    try {
      if (operation.type === 'availability') {
        await updateAvailability(
          operation.dates,
          operation.value as 'available' | 'blocked',
          operation.carIds
        );
      } else if (operation.type === 'pricing') {
        const response = await fetch('/api/host/calendar/pricing/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            carIds: operation.carIds,
            dates: operation.dates,
            priceOverride: operation.value,
            isWeekendOverride: operation.isWeekendOverride || false
          })
        });

        if (!response.ok) {
          throw new Error('Failed to bulk update pricing');
        }

        // Optimistically update local state
        if (data) {
          const newData = { ...data };
          operation.carIds.forEach(carId => {
            if (!newData.pricingOverrides[carId]) {
              newData.pricingOverrides[carId] = {};
            }
            operation.dates.forEach(date => {
              newData.pricingOverrides[carId][date] = operation.value as number;
            });
          });
          setData(newData);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform bulk update');
      throw err;
    }
  }, [data, updateAvailability]);

  const refreshData = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    metrics,
    updateAvailability,
    updatePricing,
    bulkUpdate,
    refreshData
  };
} 