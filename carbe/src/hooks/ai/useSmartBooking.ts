import { useState, useCallback } from 'react';
import { processSmartBookingQuery, SmartBookingResult } from '@/lib/ai';
import { useCars } from '@/hooks/useCars';

export function useSmartBooking() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SmartBookingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Get all available cars for processing
  const { cars: allCars } = useCars();

  const processQuery = useCallback(async (query: string) => {
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Add a small delay to simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const result = await processSmartBookingQuery(query, allCars);
      setResult(result);
      
      if (result.cars.length === 0) {
        setError('No cars found matching your criteria. Try a different search.');
      }
    } catch (err) {
      console.error('Smart booking error:', err);
      setError('Failed to process your request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [allCars]);

  const resetResults = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    processQuery,
    resetResults,
    result,
    isLoading,
    error
  };
} 