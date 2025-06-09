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

// Comprehensive Zod schemas for all car rental scenarios
const SearchCriteria = z.object({
  // Location Intelligence
  location: z.string().nullable().describe('Primary city/area where user wants to rent'),
  locationAlternatives: z.array(z.string()).nullable().describe('Alternative names/spellings for the location'),
  
  // Advanced Date Intelligence
  dates: z.object({
    start: z.string().nullable().describe('Start date in YYYY-MM-DD format'),
    end: z.string().nullable().describe('End date in YYYY-MM-DD format'),
    startTime: z.string().nullable().describe('Start time if specified (HH:MM format)'),
    endTime: z.string().nullable().describe('End time if specified (HH:MM format)'),
    duration: z.number().nullable().describe('Duration in days if specified'),
    flexible: z.boolean().nullable().describe('If dates are flexible'),
    isWeekend: z.boolean().nullable().describe('If specifically weekend rental'),
    humanReadable: z.string().nullable().describe('Human description of the dates for context')
  }).nullable(),
  
  // Smart Budget Analysis
  budget: z.object({
    min: z.number().nullable().describe('Minimum price per day'),
    max: z.number().nullable().describe('Maximum price per day'),
    total: z.number().nullable().describe('Total budget for entire rental'),
    preference: z.enum(['cheapest', 'mid-range', 'premium', 'any']).nullable(),
    currency: z.string().default('EUR').describe('Currency preference')
  }).nullable(),
  
  // Comprehensive Vehicle Intelligence
  vehicle: z.object({
    // Size categories
    size: z.enum(['small', 'compact', 'mid-size', 'large', 'any']).nullable(),
    type: z.enum(['hatchback', 'sedan', 'suv', 'coupe', 'convertible', 'van', 'truck', 'wagon', 'crossover', 'any']).nullable(),
    
    // Technical specs
    transmission: z.enum(['automatic', 'manual', 'any']).nullable(),
    fuelType: z.enum(['gasoline', 'diesel', 'electric', 'hybrid', 'any']).nullable(),
    
    // Capacity
    seats: z.number().min(1).max(9).nullable().describe('Minimum number of seats needed'),
    passengerCount: z.number().nullable().describe('Actual number of passengers'),
    
    // Use case
    purpose: z.enum(['city', 'highway', 'family', 'business', 'leisure', 'moving', 'airport', 'any']).nullable(),
    
    // Brand preferences
    brands: z.array(z.string()).nullable().describe('Preferred car brands if mentioned'),
    
    // Special features
    features: z.array(z.enum(['gps', 'bluetooth', 'backup_camera', 'sunroof', 'leather_seats', 'heated_seats', 'ac', 'any'])).nullable(),
    
    // Quality level
    tier: z.enum(['economy', 'standard', 'premium', 'luxury', 'any']).nullable()
  }).nullable(),
  
  // Context & Intent
  urgency: z.enum(['immediate', 'today', 'tomorrow', 'this_week', 'next_week', 'flexible']).nullable(),
  userType: z.enum(['tourist', 'business', 'local', 'family', 'student', 'unknown']).nullable(),
  specialNeeds: z.array(z.string()).nullable().describe('Accessibility, baby seats, pet-friendly, etc.'),
  
  confidence: z.number().min(0).max(1).describe('AI confidence in understanding the request')
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
          content: `You are an expert car rental AI for Carbe, a premium European car-sharing platform. Your job is to perfectly understand ANY car rental request and extract comprehensive, accurate search criteria.

          TODAY'S DATE: ${new Date().toISOString().split('T')[0]} (Use this for relative date calculations)

          🎯 MISSION: Extract ALL relevant information from user queries with maximum intelligence and context awareness.

          📅 DATE INTELLIGENCE (CRITICAL):
          - "this saturday" → Calculate exact date (next Saturday from today)
          - "tomorrow" → ${new Date(Date.now() + 86400000).toISOString().split('T')[0]}
          - "this weekend" → Next Friday 18:00 to Sunday 20:00
          - "friday to sunday" → Next Friday to Sunday (3-day duration)
          - "from friday to sunday" → Next Friday to Sunday (duration: 3)
          - "saturday to monday" → This/next Saturday to Monday (duration: 3)
          - "next week" → Monday to Friday of next week
          - "for 3 days" → Set duration: 3, calculate end date
          - "january 15th" → 2024-01-15 (or next year if passed)
          
          IMPORTANT: When calculating "X to Y" date ranges:
          - Count ALL days including start and end day
          - "Friday to Sunday" = 3 days (Fri, Sat, Sun)
          - "Saturday to Monday" = 3 days (Sat, Sun, Mon)
          - Always calculate end date correctly based on day names
          
          💰 BUDGET INTELLIGENCE:
          - "cheap" → preference: cheapest, max: 40
          - "luxury" → preference: premium, min: 100
          - "around 60" → max: 75 (add 25% buffer)
          - "above 80" → min: 80
          - "under 50" → max: 50
          - "500 euros total for 5 days" → total: 500, max per day: 100

          🚗 VEHICLE INTELLIGENCE:
          - "automatic" → transmission: automatic
          - "stick shift" → transmission: manual
          - "small car" → size: small, type: hatchback
          - "family car" → seats: 5+, purpose: family
          - "business car" → tier: standard, purpose: business
          - "7-seater" → seats: 7, type: van or suv
          - "electric" → fuelType: electric
          - "hybrid" → fuelType: hybrid
          - "BMW" → brands: ["BMW"]
          - "eco-friendly" → fuelType: electric or hybrid

          🌍 LOCATION INTELLIGENCE:
          - Always provide alternatives for European cities
          - "Gent" → location: "Gent", alternatives: ["Ghent", "Gand"]
          - "Brussels" → alternatives: ["Brussel", "Bruxelles"]
          - "Antwerp" → alternatives: ["Antwerpen", "Anvers"]
          - "Belgium" → location: "Belgium", alternatives: ["Brussels", "Antwerp", "Ghent", "Bruges"]

          👤 USER TYPE DETECTION:
          - "business trip" → userType: business
          - "vacation" → userType: tourist
          - "family trip" → userType: family
          - "student" → userType: student
          - Airport pickup/drop → purpose: airport

          🎯 EXAMPLES:
          "I need an automatic BMW this Saturday for a business meeting in Brussels"
          → location: "Brussels", alternatives: ["Brussel"], dates: {start: "2024-XX-XX", humanReadable: "This Saturday"}, vehicle: {transmission: "automatic", brands: ["BMW"], purpose: "business"}, userType: "business"

          "I need a car from friday to sunday 5 seats"
          → dates: {start: "2024-XX-XX" (next Friday), end: "2024-XX-XX" (next Sunday), duration: 3, humanReadable: "Friday to Sunday"}, vehicle: {seats: 5}, userType: "family"

          "Cheap small car for weekend in Gent under 40 euros"
          → location: "Gent", alternatives: ["Ghent"], dates: {isWeekend: true}, vehicle: {size: "small"}, budget: {max: 40, preference: "cheapest"}

          Set confidence 0.9+ for detailed requests, 0.7+ for medium detail, 0.5+ for vague requests.
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
      cars: cars.slice(0, 3), // Limit to top 3 matches
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
          locationAlternatives: null,
          dates: null,
          budget: null,
          vehicle: null,
          urgency: null,
          userType: null,
          specialNeeds: null,
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
  console.log('🔍 AI Search Criteria:', criteria);
  
  // Get all available cars for intelligent scoring
  const { data: allCars, error } = await supabase
    .from('cars')
    .select('*')
    .eq('is_available', true);

  if (error) {
    console.error('Database error:', error);
    throw new Error('Failed to fetch cars');
  }

  if (!allCars || allCars.length === 0) {
    return { cars: [], totalAvailable: 0 };
  }

  console.log(`🗃️ Found ${allCars.length} available cars in database`);

  // Smart scoring system instead of strict filtering
  const scoredCars = allCars.map(car => {
    let score = 0;
    const reasons: string[] = [];

         // Location scoring (0-40 points)
     if (criteria.location || criteria.locationAlternatives) {
       const locationScore = calculateLocationScore(car.location, criteria.location, criteria.locationAlternatives);
       score += locationScore;
       if (locationScore > 0) reasons.push(`Location match: ${locationScore}pts`);
     }

         // Budget scoring (0-30 points)
     if (criteria.budget) {
       const budgetScore = calculateBudgetScore(car.price_per_day, criteria.budget);
       score += budgetScore;
       if (budgetScore > 0) reasons.push(`Budget match: ${budgetScore}pts`);
     }

    // Vehicle type scoring (0-20 points)
    if (criteria.vehicle?.type) {
      const typeScore = calculateVehicleTypeScore(car, criteria.vehicle.type);
      score += typeScore;
      if (typeScore > 0) reasons.push(`Type match: ${typeScore}pts`);
    }

    // Seats scoring (0-10 points)
    if (criteria.vehicle?.seats) {
      const seatsScore = calculateSeatsScore(car.seats, criteria.vehicle.seats);
      score += seatsScore;
      if (seatsScore > 0) reasons.push(`Seats match: ${seatsScore}pts`);
    }

    return { car, score, reasons };
  });

  // Sort by score and take top results
  const rankedCars = scoredCars
    .sort((a, b) => b.score - a.score)
    .slice(0, 12); // Get top 12 for better selection

  // Log top matches for debugging
  console.log('🏆 Top 5 scored cars:', rankedCars.slice(0, 5).map(({ car, score, reasons }) => ({
    make: car.make,
    model: car.model, 
    location: car.location,
    price: `€${car.price_per_day}`,
    score,
    reasons
  })));

  // Smart filtering: if we have high-scoring cars (20+ points), don't include low-scoring ones
  const highScoringCars = rankedCars.filter(({ score }) => score >= 20);
  const mediumScoringCars = rankedCars.filter(({ score }) => score >= 10 && score < 20);
  const lowScoringCars = rankedCars.filter(({ score }) => score > 0 && score < 10);
  
  let finalCars: Car[] = [];
  
  if (highScoringCars.length > 0) {
    // If we have good matches, only show those
    finalCars = highScoringCars.slice(0, 3).map(({ car }) => car);
  } else if (mediumScoringCars.length > 0) {
    // If we have medium matches, show those
    finalCars = mediumScoringCars.slice(0, 3).map(({ car }) => car);
  } else if (lowScoringCars.length > 0) {
    // Only show low-scoring cars if nothing better exists
    finalCars = lowScoringCars.slice(0, 3).map(({ car }) => car);
  } else {
    // Last resort: show top cars regardless of score
    finalCars = rankedCars.slice(0, 3).map(({ car }) => car);
  }

  console.log(`🎯 Returning ${finalCars.length} cars (High: ${highScoringCars.length}, Medium: ${mediumScoringCars.length}, Low: ${lowScoringCars.length})`);

  return {
    cars: finalCars,
    totalAvailable: allCars.length
  };
}

// Smart scoring functions
function calculateLocationScore(carLocation: string | null, searchLocation: string | null, locationAlternatives: string[] | null): number {
  if (!carLocation) return 0;
  
  const carLoc = carLocation.toLowerCase();
  const allSearchTerms: string[] = [];
  
  // Add primary location
  if (searchLocation) {
    allSearchTerms.push(searchLocation.toLowerCase());
  }
  
  // Add AI-provided alternatives
  if (locationAlternatives) {
    allSearchTerms.push(...locationAlternatives.map(alt => alt.toLowerCase()));
  }
  
  if (allSearchTerms.length === 0) return 0;
  
  let bestScore = 0;
  
  for (const searchTerm of allSearchTerms) {
    let currentScore = 0;
    
    // Exact match (highest priority)
    if (carLoc.includes(searchTerm) || searchTerm.includes(carLoc)) {
      currentScore = 40;
    }
    
    // Partial word matching
    if (currentScore === 0) {
      const searchWords = searchTerm.split(/[, ]+/);
      const carWords = carLoc.split(/[, ]+/);
      
      for (const searchWord of searchWords) {
        if (searchWord.length >= 3) { // Only check meaningful words
          for (const carWord of carWords) {
            if (carWord.includes(searchWord) || searchWord.includes(carWord)) {
              currentScore = Math.max(currentScore, 30); // Good partial match
            }
          }
        }
      }
    }
    
    bestScore = Math.max(bestScore, currentScore);
    
    // Early exit if we found a perfect match
    if (bestScore === 40) break;
  }
  
  console.log(`🎯 Location scoring: "${carLocation}" vs [${allSearchTerms.join(', ')}] = ${bestScore}pts`);
  
  return bestScore;
}

function calculateBudgetScore(carPrice: number, budget: { min: number | null; max: number | null; currency: string }): number {
  let score = 0;
  
  // Handle minimum price (for "above X" queries)
  if (budget.min !== null) {
    if (carPrice >= budget.min) {
      // Higher score for cars closer to the minimum
      const ratio = carPrice / budget.min;
      score += Math.round(15 * Math.min(ratio, 2)); // 15-30pts for meeting minimum
    } else {
      return 0; // Car is too cheap for "above X" request
    }
  }
  
  // Handle maximum price (for "under X" queries)
  if (budget.max !== null) {
    if (carPrice <= budget.max) {
      // Better score for cars well under budget
      const ratio = carPrice / budget.max;
      score += Math.round(30 * (2 - ratio)); // 30pts for very cheap, 15pts for at max
    } else {
      return 0; // Car is too expensive for "under X" request
    }
  }
  
  return score;
}

function calculateVehicleTypeScore(car: Car, vehicleType: string): number {
  const carMake = car.make?.toLowerCase() || '';
  const carModel = car.model?.toLowerCase() || '';
  const carFuelType = car.fuel_type?.toLowerCase() || '';
  
  switch (vehicleType.toLowerCase()) {
    case 'small':
    case 'hatchback':
    case 'compact':
      if (carMake.includes('mini') || carModel.includes('cooper') || 
          carModel.includes('clio') || carModel.includes('corsa') ||
          carModel.includes('fiesta') || carModel.includes('golf') ||
          carModel.includes('polo') || (car.seats && car.seats <= 4)) return 20;
      return 10;
      
    case 'suv':
      if (carFuelType.includes('suv') || carModel.includes('x-trail') ||
          carModel.includes('touareg') || (car.seats && car.seats >= 7)) return 20;
      return 0;
      
    case 'luxury':
      if (carMake.includes('bmw') || carMake.includes('mercedes') || 
          carMake.includes('audi') || carMake.includes('volvo') ||
          carModel.includes('s class') || carModel.includes('a4')) return 20;
      return 0;
      
    case 'electric':
      if (carFuelType.includes('electric') || carFuelType.includes('ev') ||
          carModel.includes('prius') || carMake.includes('tesla')) return 20;
      return 0;
      
    default:
      return 0; // No points for unmatched vehicle types
  }
}

function calculateSeatsScore(carSeats: number | null, minSeats: number): number {
  if (!carSeats) return 0;
  if (carSeats >= minSeats) {
    return carSeats === minSeats ? 10 : 8; // Prefer exact match
  }
  return 0;
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