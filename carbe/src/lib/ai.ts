export interface SmartBookingQuery {
  location?: string;
  startDate?: Date;
  endDate?: Date;
  seats?: number;
  priceMax?: number;
  carType?: string;
  transmission?: 'automatic' | 'manual';
  features?: string[];
}

export interface SmartBookingResult {
  query: SmartBookingQuery;
  cars: Car[];
  confidence: number;
  explanation: string;
}

interface Car {
  id: string;
  make: string;
  model: string;
  location?: string;
  price_per_day: number;
  seats?: number;
  car_type?: string;
  transmission?: string;
  rating?: number;
  images?: string[];
}

// Keywords for parsing natural language queries
const LOCATION_KEYWORDS = ['near', 'in', 'around', 'at', 'from'];
const TIME_KEYWORDS = ['tomorrow', 'today', 'next week', 'weekend', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const PRICE_KEYWORDS = ['under', 'below', 'max', 'budget', 'cheap', 'affordable'];
const CAR_TYPE_KEYWORDS = ['suv', 'sedan', 'hatchback', 'wagon', 'convertible', 'coupe', 'van', 'truck'];

export function parseSmartBookingQuery(query: string): SmartBookingQuery {
  const lowerQuery = query.toLowerCase();
  const parsedQuery: SmartBookingQuery = {};

  // Parse location
  for (const keyword of LOCATION_KEYWORDS) {
    const locationMatch = lowerQuery.match(new RegExp(`${keyword}\\s+([a-zA-Z\\s]+?)(?:\\s+(?:${TIME_KEYWORDS.join('|')}|${PRICE_KEYWORDS.join('|')}|for|,|$))`, 'i'));
    if (locationMatch) {
      parsedQuery.location = locationMatch[1].trim();
      break;
    }
  }

  // Parse dates (simple implementation)
  if (lowerQuery.includes('tomorrow')) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    parsedQuery.startDate = tomorrow;
    
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);
    parsedQuery.endDate = dayAfter;
  } else if (lowerQuery.includes('today')) {
    parsedQuery.startDate = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    parsedQuery.endDate = tomorrow;
  } else if (lowerQuery.includes('weekend')) {
    const today = new Date();
    const saturday = new Date(today);
    saturday.setDate(today.getDate() + (6 - today.getDay()));
    const sunday = new Date(saturday);
    sunday.setDate(saturday.getDate() + 1);
    
    parsedQuery.startDate = saturday;
    parsedQuery.endDate = sunday;
  }

  // Parse price
  const priceMatch = lowerQuery.match(/(?:under|below|max|budget)\s*[€$]?(\d+)/i);
  if (priceMatch) {
    parsedQuery.priceMax = parseInt(priceMatch[1]);
  }

  // Parse seats
  const seatMatch = lowerQuery.match(/(\d+)[-\s]*(?:seater|seats|people|passengers)/i);
  if (seatMatch) {
    parsedQuery.seats = parseInt(seatMatch[1]);
  }

  // Parse car type
  for (const carType of CAR_TYPE_KEYWORDS) {
    if (lowerQuery.includes(carType)) {
      parsedQuery.carType = carType;
      break;
    }
  }

  // Parse transmission
  if (lowerQuery.includes('automatic') || lowerQuery.includes('auto')) {
    parsedQuery.transmission = 'automatic';
  } else if (lowerQuery.includes('manual')) {
    parsedQuery.transmission = 'manual';
  }

  return parsedQuery;
}

export async function processSmartBookingQuery(
  query: string,
  availableCars: Car[]
): Promise<SmartBookingResult> {
  const parsedQuery = parseSmartBookingQuery(query);
  
  // Filter cars based on parsed query
  let filteredCars = [...availableCars];
  
  // Location filter
  if (parsedQuery.location) {
    filteredCars = filteredCars.filter(car => 
      car.location?.toLowerCase().includes(parsedQuery.location!.toLowerCase())
    );
  }
  
  // Price filter
  if (parsedQuery.priceMax) {
    filteredCars = filteredCars.filter(car => 
      car.price_per_day <= parsedQuery.priceMax!
    );
  }
  
  // Seats filter
  if (parsedQuery.seats) {
    filteredCars = filteredCars.filter(car => 
      car.seats >= parsedQuery.seats!
    );
  }
  
  // Car type filter
  if (parsedQuery.carType) {
    filteredCars = filteredCars.filter(car => 
      car.car_type?.toLowerCase().includes(parsedQuery.carType!.toLowerCase()) ||
      car.make?.toLowerCase().includes(parsedQuery.carType!.toLowerCase()) ||
      car.model?.toLowerCase().includes(parsedQuery.carType!.toLowerCase())
    );
  }
  
  // Transmission filter
  if (parsedQuery.transmission) {
    filteredCars = filteredCars.filter(car => 
      car.transmission?.toLowerCase() === parsedQuery.transmission!.toLowerCase()
    );
  }
  
  // Sort by relevance (price, rating, etc.)
  filteredCars.sort((a, b) => {
    // Prioritize higher rated cars
    if (a.rating !== b.rating) {
      return (b.rating || 0) - (a.rating || 0);
    }
    // Then by price (lower first)
    return a.price_per_day - b.price_per_day;
  });
  
  // Limit to top 3 results
  const topResults = filteredCars.slice(0, 3);
  
  // Calculate confidence based on match quality
  let confidence = 0.5; // Base confidence
  if (parsedQuery.location) confidence += 0.2;
  if (parsedQuery.priceMax) confidence += 0.1;
  if (parsedQuery.seats) confidence += 0.1;
  if (parsedQuery.carType) confidence += 0.1;
  
  // Generate explanation
  const explanation = generateExplanation(parsedQuery, topResults.length);
  
  return {
    query: parsedQuery,
    cars: topResults,
    confidence: Math.min(confidence, 1.0),
    explanation
  };
}

function generateExplanation(query: SmartBookingQuery, resultCount: number): string {
  const conditions = [];
  
  if (query.location) conditions.push(`near ${query.location}`);
  if (query.priceMax) conditions.push(`under €${query.priceMax}/day`);
  if (query.seats) conditions.push(`${query.seats}+ seats`);
  if (query.carType) conditions.push(`${query.carType} type`);
  if (query.transmission) conditions.push(`${query.transmission} transmission`);
  
  const conditionsText = conditions.length > 0 ? ` matching ${conditions.join(', ')}` : '';
  
  if (resultCount === 0) {
    return `Sorry, I couldn't find any cars${conditionsText}. Try adjusting your criteria or location.`;
  } else if (resultCount === 1) {
    return `Found 1 perfect match${conditionsText}!`;
  } else {
    return `Found ${resultCount} great options${conditionsText}. Sorted by rating and price.`;
  }
} 