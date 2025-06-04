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
  forceRefresh: () => Promise<void>;
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

      const { data: { session } } = await supabase.auth.getSession();
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
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
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log('useCalendarData: updateAvailability called', {
        dates,
        status,
        carIds,
        hasSession: !!session,
        hasAccessToken: !!session?.access_token
      });
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const requestBody = {
        carIds,
        dates,
        status
      };
      
      console.log('useCalendarData: Making availability request', { 
        url: '/api/host/calendar/availability',
        method: 'POST',
        requestBody, 
        headers: Object.fromEntries(Object.entries(headers))
      });

      const response = await fetch('/api/host/calendar/availability', {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      console.log('useCalendarData: Availability response', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        let errorData;
        const responseText = await response.text();
        console.log('useCalendarData: Raw error response text:', responseText);
        
        try {
          errorData = JSON.parse(responseText);
        } catch (parseError) {
          console.error('useCalendarData: Failed to parse error response as JSON:', parseError);
          errorData = { rawResponse: responseText };
        }
        
        console.error('useCalendarData: Availability error response', errorData);
        throw new Error(`Failed to update availability: ${response.status} ${response.statusText}`);
      }

      console.log('useCalendarData: Availability update successful, refreshing data');
      
      // Force refresh from server to get latest data
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update availability');
      throw err;
    }
  }, [fetchData]);

  const updatePricing = useCallback(async (
    date: string,
    price: number,
    carIds: string[],
    isWeekendOverride = false
  ) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const response = await fetch('/api/host/calendar/pricing', {
        method: 'POST',
        headers,
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
        const { data: { session } } = await supabase.auth.getSession();
        
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        
        if (session?.access_token) {
          headers.Authorization = `Bearer ${session.access_token}`;
        }

        const response = await fetch('/api/host/calendar/pricing/bulk', {
          method: 'POST',
          headers,
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

        console.log('useCalendarData: Pricing update successful, refreshing data');
        
        // Force refresh from server to get latest data
        await fetchData();
      }
      
      // NUCLEAR OPTION: Force multiple refreshes after ANY operation
      console.log('🚨 NUCLEAR REFRESH: Forcing multiple data refreshes');
      setTimeout(async () => {
        console.log('🚨 Refresh #1');
        await fetchData();
      }, 100);
      
      setTimeout(async () => {
        console.log('🚨 Refresh #2');
        await fetchData();
      }, 300);
      
      setTimeout(async () => {
        console.log('🚨 Refresh #3');
        await fetchData();
      }, 600);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform bulk update');
      throw err;
    }
  }, [updateAvailability, fetchData]);

  const refreshData = useCallback(async () => {
    console.log('🔄 useCalendarData: Manual refresh triggered');
    await fetchData();
  }, [fetchData]);
  
  // Nuclear refresh function that forces everything to update
  const forceRefresh = useCallback(async () => {
    console.log('🚨 FORCE REFRESH: Clearing all state and refetching');
    setData(undefined);
    setLoading(true);
    setError(null);
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (selectedCarIds.length > 0) {
      fetchData();
    }
  }, [fetchData, selectedCarIds.length]);

  return {
    data,
    loading,
    error,
    metrics,
    updateAvailability,
    updatePricing,
    bulkUpdate,
    refreshData,
    forceRefresh
  };
} 