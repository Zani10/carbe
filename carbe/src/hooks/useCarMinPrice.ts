import { useState, useEffect } from 'react';

interface CarMinPriceData {
  minPrice: number;
  isLoading: boolean;
}

export function useCarMinPrice(carId: string, defaultPrice: number): CarMinPriceData {
  const [data, setData] = useState<CarMinPriceData>({
    minPrice: defaultPrice,
    isLoading: false
  });

  useEffect(() => {
    if (!carId) return;

    const fetchMinPrice = async () => {
      setData(prev => ({ ...prev, isLoading: true }));

      try {
        const response = await fetch(`/api/cars/${carId}/availability?mode=calendar`);
        
        if (response.ok) {
          const availabilityData = await response.json();
          
          // Find the minimum price from base price and any pricing overrides
          let minPrice = availabilityData.basePrice || defaultPrice;
          const overrides = Object.values(availabilityData.pricingOverrides || {}) as number[];
          
          if (overrides.length > 0) {
            const minOverride = Math.min(...overrides);
            minPrice = Math.min(minPrice, minOverride);
          }
          
          setData({
            minPrice: minPrice,
            isLoading: false
          });
        } else {
          // Fallback to default price if API fails
          setData({
            minPrice: defaultPrice,
            isLoading: false
          });
        }
      } catch (error) {
        console.error('Error fetching min price:', error);
        setData({
          minPrice: defaultPrice,
          isLoading: false
        });
      }
    };

    fetchMinPrice();
  }, [carId, defaultPrice]);

  return data;
} 