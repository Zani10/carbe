import { useState, useEffect } from 'react';

interface CarAvailabilityData {
  carId: string;
  basePrice: number;
  unavailableDates: string[];
  pricingOverrides: { [date: string]: number };
  userBookingDates: string[];
  hostSettings?: {
    minimumBookingDuration: number;
    bookingAdvanceNotice: number;
    weekendPriceAdjustmentType: string;
    weekendPriceAdjustmentValue: number;
  };
  period: {
    start_date: string;
    end_date: string;
  };
}

interface UseCarAvailabilityReturn {
  data: CarAvailabilityData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCarAvailability(carId: string): UseCarAvailabilityReturn {
  const [data, setData] = useState<CarAvailabilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailability = async () => {
    if (!carId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/cars/${carId}/availability?mode=calendar`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch availability data');
      }

      const availabilityData = await response.json();
      setData(availabilityData);
    } catch (err) {
      console.error('Error fetching car availability:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch availability');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [carId]);

  return {
    data,
    loading,
    error,
    refetch: fetchAvailability,
  };
} 