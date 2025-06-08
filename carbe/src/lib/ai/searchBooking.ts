import { Car } from '@/types/car';
import { supabase } from '@/lib/supabase';

export interface AISearchResult {
  cars: Car[];
  matchCount: 1 | 2 | 3;
  confidence: number;
  explanation: string;
}

export interface ParsedPrompt {
  location?: string;
  dates?: { start: Date; end: Date };
  carType?: string;
  transmission?: 'Automatic' | 'Manual';
  seats?: number;
  budget?: { max: number; currency: string };
  features?: string[];
  specificityScore: number;
}

export async function processAISearchPrompt(prompt: string): Promise<AISearchResult> {
  try {
    // Parse the natural language prompt
    const parsed = parsePrompt(prompt);
    
    // Fetch available cars
    const { data: cars, error } = await supabase
      .from('cars')
      .select('*')
      .eq('is_available', true);
    
    if (error || !cars) {
      throw new Error('Failed to fetch cars');
    }
    
    // Score and filter cars based on the prompt
    const scoredCars = cars
      .map(car => ({
        car,
        score: scoreCarMatch(car, parsed)
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);
    
    // Determine match count based on specificity
    const matchCount = determineMatchCount(parsed.specificityScore);
    
    // Get top matches
    const topMatches = scoredCars.slice(0, matchCount).map(item => item.car);
    
    // Calculate overall confidence
    const confidence = scoredCars.length > 0 ? 
      Math.min(scoredCars[0].score / 100, 0.95) : 0;
    
    // Generate explanation
    const explanation = generateExplanation(parsed, topMatches, matchCount);
    
    return {
      cars: topMatches,
      matchCount,
      confidence,
      explanation
    };
    
  } catch (error) {
    console.error('AI Search Error:', error);
    
    // Fallback to basic search
    const { data: fallbackCars } = await supabase
      .from('cars')
      .select('*')
      .eq('is_available', true)
      .limit(3);
    
    return {
      cars: fallbackCars || [],
      matchCount: 3,
      confidence: 0.5,
      explanation: 'Found some cars that might interest you'
    };
  }
}

function parsePrompt(prompt: string): ParsedPrompt {
  const promptLower = prompt.toLowerCase();
  let specificityScore = 0;
  
  // Location extraction
  const locationMatch = promptLower.match(/(?:in|near|at|around)\s+([a-z\s]+?)(?:\s|$|,)/);
  const location = locationMatch ? locationMatch[1].trim() : undefined;
  if (location) specificityScore++;
  
  // Date extraction
  const dates = extractDatesFromText(promptLower);
  if (dates) specificityScore++;
  
  // Car type extraction
  const carTypePatterns = {
    'suv': /\b(suv|crossover|4x4)\b/,
    'sedan': /\b(sedan|saloon)\b/,
    'hatchback': /\b(hatchback|compact)\b/,
    'coupe': /\b(coupe|sports car)\b/,
    'convertible': /\b(convertible|cabrio)\b/,
    'van': /\b(van|minivan|mpv)\b/,
    'truck': /\b(truck|pickup)\b/
  };
  
  let carType: string | undefined;
  for (const [type, pattern] of Object.entries(carTypePatterns)) {
    if (pattern.test(promptLower)) {
      carType = type;
      specificityScore++;
      break;
    }
  }
  
  // Transmission extraction
  let transmission: 'Automatic' | 'Manual' | undefined;
  if (/\b(automatic|auto)\b/.test(promptLower)) {
    transmission = 'Automatic';
    specificityScore++;
  } else if (/\bmanual\b/.test(promptLower)) {
    transmission = 'Manual';
    specificityScore++;
  }
  
  // Seats extraction
  const seatsMatch = promptLower.match(/(\d+)[-\s]?seater/);
  const seats = seatsMatch ? parseInt(seatsMatch[1]) : undefined;
  if (seats) specificityScore++;
  
  // Budget extraction
  let budget: { max: number; currency: string } | undefined;
  const budgetMatch = promptLower.match(/(?:under|below|max|budget).*?([€$])(\d+)/);
  if (budgetMatch) {
    budget = {
      max: parseInt(budgetMatch[2]),
      currency: budgetMatch[1]
    };
    specificityScore++;
  }
  
  // Feature extraction
  const features: string[] = [];
  if (/\b(eco|efficient|hybrid|electric)\b/.test(promptLower)) {
    features.push('eco-friendly');
    specificityScore++;
  }
  if (/\b(luxury|premium|high-end)\b/.test(promptLower)) {
    features.push('luxury');
    specificityScore++;
  }
  if (/\b(cheap|budget|affordable)\b/.test(promptLower)) {
    features.push('budget');
    specificityScore++;
  }
  
  return {
    location,
    dates,
    carType,
    transmission,
    seats,
    budget,
    features,
    specificityScore
  };
}

function extractDatesFromText(prompt: string): { start: Date; end: Date } | undefined {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  if (prompt.includes('today')) {
    return { start: today, end: tomorrow };
  }
  if (prompt.includes('tomorrow')) {
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(tomorrow.getDate() + 1);
    return { start: tomorrow, end: dayAfter };
  }
  if (prompt.includes('weekend')) {
    const friday = new Date(today);
    const dayOfWeek = today.getDay();
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
    friday.setDate(today.getDate() + daysUntilFriday);
    const sunday = new Date(friday);
    sunday.setDate(friday.getDate() + 2);
    return { start: friday, end: sunday };
  }
  if (prompt.includes('next week')) {
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const weekEnd = new Date(nextWeek);
    weekEnd.setDate(nextWeek.getDate() + 3);
    return { start: nextWeek, end: weekEnd };
  }
  
  return undefined;
}

function scoreCarMatch(car: Car, parsed: ParsedPrompt): number {
  let score = 50; // Base score
  
  // Location matching
  if (parsed.location && car.location) {
    const carLocation = car.location.toLowerCase();
    const searchLocation = parsed.location.toLowerCase();
    if (carLocation.includes(searchLocation) || searchLocation.includes(carLocation)) {
      score += 30;
    } else {
      // Partial location match
      const locationWords = searchLocation.split(' ');
      const matches = locationWords.filter(word => carLocation.includes(word));
      score += matches.length * 10;
    }
  }
  
  // Car type matching
  if (parsed.carType) {
    const carMake = car.make.toLowerCase();
    const carModel = car.model.toLowerCase();
    
    switch (parsed.carType) {
      case 'suv':
        if (/\b(suv|x\d|q\d|gla|glc|x-trail|cr-v|rav4|tiguan|tucson)\b/.test(carModel)) score += 25;
        break;
      case 'sedan':
        if (/\b(3 series|c-class|a4|accord|camry|passat)\b/.test(carModel)) score += 25;
        break;
      case 'hatchback':
        if (/\b(golf|focus|polo|fiesta|corsa|208|clio)\b/.test(carModel)) score += 25;
        break;
    }
  }
  
  // Transmission matching
  if (parsed.transmission && car.transmission === parsed.transmission) {
    score += 20;
  }
  
  // Seats matching
  if (parsed.seats && car.seats === parsed.seats) {
    score += 20;
  } else if (parsed.seats && car.seats && car.seats >= parsed.seats) {
    score += 10; // Partial match if car has more seats
  }
  
  // Budget matching
  if (parsed.budget && parsed.budget.currency === '€') {
    if (car.price_per_day <= parsed.budget.max) {
      score += 25;
    } else if (car.price_per_day <= parsed.budget.max * 1.2) {
      score += 10; // Slightly over budget
    } else {
      score -= 20; // Too expensive
    }
  }
  
  // Feature matching
  parsed.features?.forEach(feature => {
    switch (feature) {
      case 'eco-friendly':
        if (car.fuel_type === 'Hybrid' || car.fuel_type === 'Electric') score += 15;
        break;
      case 'luxury':
        if (['BMW', 'Mercedes', 'Audi', 'Volvo'].includes(car.make)) score += 15;
        break;
      case 'budget':
        if (car.price_per_day < 50) score += 15;
        break;
    }
  });
  
  // Rating boost
  if (car.rating && car.rating > 4.5) score += 10;
  
  return Math.max(0, score);
}

function determineMatchCount(specificityScore: number): 1 | 2 | 3 {
  if (specificityScore >= 4) return 1; // Very specific
  if (specificityScore >= 2) return 2; // Semi-specific
  return 3; // Vague
}

function generateExplanation(parsed: ParsedPrompt, matches: Car[], matchCount: 1 | 2 | 3): string {
  if (matches.length === 0) {
    return "No cars found matching your criteria. Try adjusting your search.";
  }
  
  const criteria: string[] = [];
  if (parsed.location) criteria.push(`in ${parsed.location}`);
  if (parsed.carType) criteria.push(`${parsed.carType} type`);
  if (parsed.transmission) criteria.push(`${parsed.transmission.toLowerCase()} transmission`);
  if (parsed.seats) criteria.push(`${parsed.seats} seats`);
  if (parsed.budget) criteria.push(`under ${parsed.budget.currency}${parsed.budget.max}/day`);
  
  const criteriaText = criteria.length > 0 ? ` matching ${criteria.join(', ')}` : '';
  
  if (matchCount === 1) {
    return `Found the perfect match${criteriaText}! ${matches[0].make} ${matches[0].model} fits all your requirements.`;
  } else if (matchCount === 2) {
    return `Found ${matches.length} great options${criteriaText}. Both are excellent choices for your needs.`;
  } else {
    return `Found ${matches.length} good options${criteriaText}. Here are the best matches for you to choose from.`;
  }
} 