'use client'

import { useState, useCallback } from 'react';
import { processSmartSearch, SmartSearchResult, generateFollowUpSuggestions } from '@/lib/ai/smartSearch';

// Legacy interface for compatibility
export interface SmartBookingResult {
  query: any;
  cars: any[];
  confidence: number;
  explanation: string;
}

interface UseSmartBookingReturn {
  // State
  isLoading: boolean;
  result: SmartSearchResult | null;
  error: string | null;
  isThinking: boolean;
  
  // Actions
  search: (query: string) => Promise<void>;
  retry: () => Promise<void>;
  reset: () => void;
  processQuery: (query: string) => Promise<void>; // Legacy compatibility
  resetResults: () => void; // Legacy compatibility
  
  // Helpers
  followUpSuggestions: string[];
  hasResults: boolean;
  confidence: number;
}

export function useSmartBooking(): UseSmartBookingReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [result, setResult] = useState<SmartSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<string>('');

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setIsLoading(true);
    setIsThinking(true);
    setError(null);
    setLastQuery(query);
    
    try {
      // AI thinking phase (show user something is happening)
      await new Promise(resolve => setTimeout(resolve, 300));
      setIsThinking(false);

      // Process the search with AI
      const searchResult = await processSmartSearch(query);
      setResult(searchResult);
      
      // Show empty state message if no results
      if (searchResult.cars.length === 0) {
        setError(`No cars found matching "${query}". Try adjusting your criteria.`);
      }
    } catch (err) {
      console.error('Smart search error:', err);
      setError('Something went wrong with the search. Please try again.');
      setResult(null);
    } finally {
      setIsLoading(false);
      setIsThinking(false);
    }
  }, []);

  const retry = useCallback(async () => {
    if (lastQuery) {
      await search(lastQuery);
    }
  }, [lastQuery, search]);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setLastQuery('');
  }, []);

  // Legacy compatibility methods
  const processQuery = search; // Alias for backward compatibility
  const resetResults = reset; // Alias for backward compatibility

  // Computed values
  const followUpSuggestions = result ? generateFollowUpSuggestions(result) : [];
  const hasResults = result !== null && result.cars.length > 0;
  const confidence = result?.response.criteria.confidence || 0;

  return {
    // State
    isLoading,
    result,
    error,
    isThinking,
    
    // Actions
    search,
    retry,
    reset,
    processQuery,
    resetResults,
    
    // Helpers
    followUpSuggestions,
    hasResults,
    confidence
  };
} 