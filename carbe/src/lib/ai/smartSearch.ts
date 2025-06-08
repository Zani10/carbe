'use client'

import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { Car } from '@/types/car';

// Initialize OpenAI client (will be server-side in production)
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true, // Only for demo purposes
});

// Zod schemas for structured AI outputs
const SearchCriteria = z.object({
  location: z.string().nullable().describe('City or area where user wants to rent'),
  dates: z.object({
    start: z.string().nullable().describe('Start date in ISO format'),
    end: z.string().nullable().describe('End date in ISO format'),
    flexible: z.boolean().nullable().describe('If dates are flexible')
  }).nullable(),
  budget: z.object({
    max: z.number().nullable().describe('Maximum price per day'),
    currency: z.string().default('EUR').describe('Currency preference')
  }).nullable(),
  vehicle: z.object({
    type: z.enum(['any', 'suv', 'sedan', 'hatchback', 'coupe', 'convertible', 'van', 'truck', 'electric', 'luxury']).nullable(),
    transmission: z.enum(['automatic', 'manual', 'any']).nullable(),
    seats: z.number().min(2).max(9).nullable().describe('Minimum number of seats'),
    features: z.array(z.string()).nullable().describe('Specific features like eco-friendly, luxury, etc.')
  }).nullable(),
  urgency: z.enum(['today', 'tomorrow', 'this_week', 'next_week', 'flexible']).nullable(),
  confidence: z.number().min(0).max(1).describe('How confident the AI is about the extracted criteria')
});

const SearchResponse = z.object({
  criteria: SearchCriteria,
  explanation: z.string().describe('Friendly explanation of what was understood'),
  suggestions: z.array(z.string()).nullable().describe('Helpful suggestions if criteria seem incomplete'),
  searchStrategy: z.string().describe('How the search will be performed')
});

export type ParsedSearchCriteria = z.infer<typeof SearchCriteria>;
export type AISearchResponse = z.infer<typeof SearchResponse>;

export interface SmartSearchResult {
  response: AISearchResponse;
  cars: Car[];
  matchCount: number;
  totalAvailable: number;
}

export async function processSmartSearch(userQuery: string): Promise<SmartSearchResult> {
  try {
    // Step 1: Use AI to understand and structure the user's query
    const aiResponse = await openai.chat.completions.parse({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a smart car rental assistant for Carbe, a premium car-sharing platform.
          
          Your job is to understand natural language car rental requests and extract structured search criteria.
          
          Key guidelines:
          - Be helpful and conversational
          - Extract all possible criteria from the user's query  
          - If information is missing, suggest what might be helpful
          - Default to European locations (Belgium, Netherlands, etc.)
          - Assume EUR currency unless specified
          - Be realistic about dates (if someone says "today", use today's date)
          - Set confidence based on how specific the request is
          
          Example locations: Brussels, Antwerp, Amsterdam, Paris, Berlin, London
          `
        },
        {
          role: 'user', 
          content: userQuery
        }
      ],
      response_format: zodResponseFormat(SearchResponse, 'search_response'),
      temperature: 0.1, // Low temperature for consistent parsing
    });

    const aiResult = aiResponse.choices[0]?.message?.parsed;
    if (!aiResult) {
      throw new Error('Failed to parse AI response');
    }

    // Step 2: Execute the search based on AI-extracted criteria
    const { cars, totalAvailable } = await executeCarSearch(aiResult.criteria);

    // Step 3: Return comprehensive result
    return {
      response: aiResult,
      cars: cars.slice(0, 6), // Limit to top 6 matches
      matchCount: cars.length,
      totalAvailable
    };

  } catch (error) {
    console.error('Smart search error:', error);
    
    // Fallback: Simple text-based search
    const fallbackResult = await fallbackSearch(userQuery);
    
    return {
      response: {
        criteria: { 
          location: null,
          dates: null,
          budget: null,
          vehicle: null,
          urgency: null,
          confidence: 0.3 
        },
        explanation: `I found some cars that might interest you based on "${userQuery}"`,
        suggestions: [
          'Try being more specific with location, dates, or budget',
          'Include vehicle type preferences for better results',
          'AI search is temporarily unavailable'
        ],
        searchStrategy: 'Simple keyword matching (AI unavailable)'
      },
      cars: fallbackResult,
      matchCount: fallbackResult.length,
      totalAvailable: fallbackResult.length
    };
  }
}

async function executeCarSearch(criteria: ParsedSearchCriteria): Promise<{ cars: Car[]; totalAvailable: number }> {
  // Build Supabase query based on criteria
  let query = supabase
    .from('cars')
    .select('*')
    .eq('is_available', true);

  // Apply filters based on criteria
  if (criteria.location) {
    query = query.ilike('location', `%${criteria.location}%`);
  }

  if (criteria.budget?.max) {
    query = query.lte('price_per_day', criteria.budget.max);
  }

  if (criteria.vehicle?.seats) {
    query = query.gte('seats', criteria.vehicle.seats);
  }

  if (criteria.vehicle?.type && criteria.vehicle.type !== 'any') {
    // Map AI vehicle types to database car types
    const typeMapping: Record<string, string[]> = {
      'suv': ['SUV', 'Crossover'],
      'sedan': ['Sedan', 'Saloon'],
      'hatchback': ['Hatchback', 'Compact'],
      'coupe': ['Coupe', 'Sports'],
      'convertible': ['Convertible', 'Cabriolet'],
      'van': ['Van', 'Minivan', 'MPV'],
      'truck': ['Truck', 'Pickup'],
      'electric': ['Electric', 'EV', 'Hybrid'],
      'luxury': ['Luxury', 'Premium']
    };

    const dbTypes = typeMapping[criteria.vehicle.type] || [criteria.vehicle.type];
    query = query.or(
      dbTypes.map(type => `fuel_type.ilike.%${type}%`).join(',')
    );
  }

  if (criteria.vehicle?.transmission && criteria.vehicle.transmission !== 'any') {
    query = query.eq('transmission', criteria.vehicle.transmission.charAt(0).toUpperCase() + criteria.vehicle.transmission.slice(1));
  }

  // Execute query
  const { data: cars, error } = await query.order('rating', { ascending: false }).order('price_per_day', { ascending: true });

  if (error) {
    console.error('Database search error:', error);
    throw new Error('Failed to search cars');
  }

  // Get total available count (without filters for context)
  const { count: totalCount } = await supabase
    .from('cars')
    .select('*', { count: 'exact', head: true })
    .eq('is_available', true);

  return {
    cars: cars || [],
    totalAvailable: totalCount || 0
  };
}

async function fallbackSearch(userQuery: string): Promise<Car[]> {
  // Simple keyword-based fallback search
  const { data: cars } = await supabase
    .from('cars')
    .select('*')
    .eq('is_available', true)
    .or(`make.ilike.%${userQuery}%,model.ilike.%${userQuery}%,location.ilike.%${userQuery}%,fuel_type.ilike.%${userQuery}%`)
    .order('rating', { ascending: false })
    .limit(6);

  return cars || [];
}

// Helper function to generate contextual follow-up suggestions
export function generateFollowUpSuggestions(result: SmartSearchResult): string[] {
  const { response, cars, totalAvailable } = result;
  const suggestions: string[] = [];

  // Suggest refinements based on search results
  if (cars.length === 0) {
    suggestions.push("Try expanding your location or increasing your budget");
    suggestions.push("Consider flexible dates for better availability");
  } else if (cars.length < 3 && totalAvailable > cars.length) {
    suggestions.push("Broaden your search criteria for more options");
    if (response.criteria.budget?.max) {
      suggestions.push(`Consider increasing budget above €${response.criteria.budget.max}/day`);
    }
  }

  // Location-specific suggestions
  if (!response.criteria.location) {
    suggestions.push("Specify a city like Brussels, Amsterdam, or Paris for better results");
  }

  // Date-specific suggestions
  if (!response.criteria.dates?.start) {
    suggestions.push("Add specific dates to check real-time availability");
  }

  return suggestions.slice(0, 3); // Limit to 3 suggestions
}

// Quick preset searches for common queries
export const QUICK_SEARCHES = [
  {
    label: "Weekend getaway",
    query: "I need a car for this weekend",
    icon: "🚗"
  },
  {
    label: "Budget-friendly",
    query: "Find me the cheapest car available",
    icon: "💰"
  },
  {
    label: "Family road trip",
    query: "I need a 7-seater for next week",
    icon: "👨‍👩‍👧‍👦"
  },
  {
    label: "Luxury experience",
    query: "Show me luxury cars in Brussels",
    icon: "✨"
  },
  {
    label: "Eco-friendly",
    query: "Electric or hybrid cars near me",
    icon: "🌱"
  },
  {
    label: "City driving",
    query: "Small automatic car for Amsterdam",
    icon: "🏙️"
  }
]; 