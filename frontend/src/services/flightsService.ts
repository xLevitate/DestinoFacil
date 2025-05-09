import { destinationServices } from './apiServices';

interface DateRange {
  departure: Date;
  return?: Date;
}

export interface FlightSearchParams {
  origin: string;
  destination: string;
  dates?: DateRange;
  adults?: number;
  currency?: string;
}

const REGION_FACTORS: Record<string, number> = {
  'Brazil': 1.0,
  'South America': 1.2,
  'North America': 1.8,
  'Europe': 2.0,
  'Asia': 2.3,
  'Africa': 2.2,
  'Oceania': 2.5
};

const COUNTRY_TO_REGION: Record<string, string> = {
  'Brazil': 'Brazil',
  'Argentina': 'South America',
  'Chile': 'South America',
  'Colombia': 'South America',
  'Peru': 'South America',
  'Uruguay': 'South America',
  'Bolivia': 'South America',
  'Ecuador': 'South America',
  'Paraguay': 'South America',
  'Venezuela': 'South America',
  
  'United States': 'North America',
  'Canada': 'North America',
  'Mexico': 'North America',
  'Cuba': 'North America',
  
  'United Kingdom': 'Europe',
  'France': 'Europe',
  'Germany': 'Europe',
  'Italy': 'Europe',
  'Spain': 'Europe',
  'Portugal': 'Europe',
  'Netherlands': 'Europe',
  'Belgium': 'Europe',
  'Switzerland': 'Europe',
  'Austria': 'Europe',
  'Ireland': 'Europe',
  'Greece': 'Europe',
  
  'Japan': 'Asia',
  'China': 'Asia',
  'South Korea': 'Asia',
  'India': 'Asia',
  'Thailand': 'Asia',
  'Vietnam': 'Asia',
  'Singapore': 'Asia',
  'Malaysia': 'Asia',
  'Indonesia': 'Asia',
  'Philippines': 'Asia',
  
  'South Africa': 'Africa',
  'Egypt': 'Africa',
  'Morocco': 'Africa',
  'Kenya': 'Africa',
  'Nigeria': 'Africa',
  
  'Australia': 'Oceania',
  'New Zealand': 'Oceania'
};

const DISTANCE_BASELINE: [number, number][] = [
  [500, 150],
  [1000, 250],
  [2000, 400],
  [5000, 700], 
  [10000, 1100],
  [15000, 1500],
  [20000, 2000]  
];

const SEASON_FACTORS: Record<number, number> = {
  0: 1.2,  // January - High season in Brazil (summer vacation)
  1: 1.3,  // February - High season + Carnival
  2: 1.0,  // March
  3: 0.9,  // April
  4: 0.85, // May
  5: 0.9,  // June
  6: 1.1,  // July - Winter vacation
  7: 0.9,  // August
  8: 0.85, // September
  9: 0.9,  // October 
  10: 1.0, // November
  11: 1.3  // December - Christmas/New Year high season
};

// Popular city pairs with adjusted pricing factor
const POPULAR_ROUTES: Record<string, number> = {
  'São Paulo-Rio de Janeiro': 0.9,    // High competition = lower prices
  'São Paulo-Brasília': 0.95,        
  'São Paulo-Recife': 1.0,
  'Rio de Janeiro-Brasília': 0.95,
  'Rio de Janeiro-Salvador': 0.9,
  'São Paulo-Buenos Aires': 1.0,
  'São Paulo-Santiago': 1.0,
  'São Paulo-New York': 1.05,
  'Rio de Janeiro-Paris': 1.05,
  'São Paulo-London': 1.05,
  'São Paulo-Miami': 1.0,
  'São Paulo-Orlando': 0.95,
  'São Paulo-Lisbon': 1.0,
  'São Paulo-Madrid': 1.0,
  'São Paulo-Frankfurt': 1.05
};

/**
 * Service for handling flight-related operations
 */
export const flightsService = {
  /**
   * Generates a URL to Google Flights for the specified search parameters
   */
  getFlightUrl: (params: FlightSearchParams): string => {
    // Basic URL structure
    let url = 'https://www.google.com/travel/flights';
    
    // Build the query part
    const queryParams = [];
    
    // Add the origin and destination
    queryParams.push(`q=flights+from+${encodeURIComponent(params.origin)}+to+${encodeURIComponent(params.destination)}`);
    
    // Add dates if provided
    if (params.dates) {
      // Format dates as YYYY-MM-DD
      const formatDate = (date: Date): string => {
        return date.toISOString().split('T')[0];
      };
      
      const departureDate = formatDate(params.dates.departure);
      queryParams.push(`tfs=${departureDate}`);
      
      if (params.dates.return) {
        const returnDate = formatDate(params.dates.return);
        queryParams.push(`tfd=${returnDate}`);
      }
    }
    
    // Add number of adults if provided
    if (params.adults && params.adults > 1) {
      queryParams.push(`tbs=pt:${params.adults}`);
    }
    
    // Add currency if provided
    if (params.currency) {
      queryParams.push(`curr=${params.currency}`);
    }
    
    // Combine all query parameters
    url += `?${queryParams.join('&')}`;
    
    return url;
  },
  
  /**
   * Estimates a flight price based on distance, region, seasonality and market data
   * Uses a realistic model based on distance bands and typical pricing patterns
   */
  estimateFlightPrice: async (origin: string, destination: string): Promise<number> => {
    try {
      // Try to get city details for both origin and destination
      const originInfo = await destinationServices.getDestinationInfo(origin);
      const destInfo = await destinationServices.getDestinationInfo(destination);
      
      if (!originInfo || !destInfo || !originInfo.coordinates || !destInfo.coordinates) {
        // If we can't get coordinates, use a fallback calculation
        return calculateFallbackPrice(origin, destination);
      }
      
      // Calculate distance using coordinates
      const distance = calculateDistance(
        originInfo.coordinates.latitude,
        originInfo.coordinates.longitude,
        destInfo.coordinates.latitude,
        destInfo.coordinates.longitude
      );
      
      // Get base price based on distance tier
      const basePrice = getBasePrice(distance);
      
      // Calculate region factor
      const originRegion = getRegion(originInfo.country);
      const destRegion = getRegion(destInfo.country);
      const regionFactor = (REGION_FACTORS[originRegion] + REGION_FACTORS[destRegion]) / 2;
      
      // Check if it's a popular route with specific pricing
      const routeKey = `${origin}-${destination}`;
      const reverseRouteKey = `${destination}-${origin}`;
      const routeFactor = POPULAR_ROUTES[routeKey] || POPULAR_ROUTES[reverseRouteKey] || 1.0;
      
      // Consider seasonality (current month)
      const currentMonth = new Date().getMonth();
      const seasonFactor = SEASON_FACTORS[currentMonth];
      
      // Calculate final price with all factors
      const price = Math.round(basePrice * regionFactor * routeFactor * seasonFactor);
      
      // Convert to BRL (rough estimate - 5:1 ratio)
      const priceBRL = Math.round(price * 5);
      
      // Add a small variance to avoid identical prices (±5%)
      const variance = 1 + (Math.random() * 0.1 - 0.05);
      
      return Math.round(priceBRL * variance);
    } catch (error) {
      console.error('Error estimating flight price:', error);
      return calculateFallbackPrice(origin, destination);
    }
  },
  
  /**
   * Gets flight deals for a destination
   * Uses realistic discounting patterns based on actual airline behavior
   */
  getFlightDeals: async (destination: string): Promise<{price: number, origin: string}[]> => {
    // Top Brazilian cities by population as likely origins
    const popularOrigins = ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Belo Horizonte', 'Salvador', 'Fortaleza', 'Recife', 'Porto Alegre', 'Curitiba'];
    const deals = [];
    
    for (const origin of popularOrigins) {
      try {
        // Skip if origin is the same as destination
        if (origin.toLowerCase() === destination.toLowerCase()) continue;
        
        const basePrice = await flightsService.estimateFlightPrice(origin, destination);
        
        // Apply discounts based on advance booking and off-peak travel
        // Airlines typically discount 15-30% for advance bookings or during sales
        const discountFactors = [
          0.85, // 15% discount - Standard advance booking
          0.8,  // 20% discount - Better advance booking deal
          0.75  // 25% discount - Special promotion
        ];
        
        // Pick a discount based on the city pair (more popular routes get better discounts)
        const routePopularity = POPULAR_ROUTES[`${origin}-${destination}`] || POPULAR_ROUTES[`${destination}-${origin}`] || 1.0;
        let discountIndex = 0;
        
        if (routePopularity <= 0.95) {
          discountIndex = 2; // Best discount for high-competition routes
        } else if (routePopularity <= 1.0) {
          discountIndex = 1; // Medium discount for normal routes
        }
        
        const discountFactor = discountFactors[discountIndex];
        const dealPrice = Math.round(basePrice * discountFactor);
        
        deals.push({
          price: dealPrice,
          origin: origin
        });
      } catch (error) {
        console.error(`Error getting deal for ${origin} to ${destination}:`, error);
      }
    }
    
    // Sort by price (lowest first) and take top 3
    return deals.sort((a, b) => a.price - b.price).slice(0, 3);
  }
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Get base price from distance using distance tiers
 */
function getBasePrice(distance: number): number {
  for (const [maxDistance, price] of DISTANCE_BASELINE) {
    if (distance <= maxDistance) {
      return price;
    }
  }
  
  // If distance exceeds our highest tier, use the highest tier price + extra
  const [maxTierDistance, maxTierPrice] = DISTANCE_BASELINE[DISTANCE_BASELINE.length - 1];
  const extraDistance = distance - maxTierDistance;
  const extraPrice = (extraDistance / 1000) * 100; // Add $100 per 1000km beyond our highest tier
  
  return maxTierPrice + extraPrice;
}

/**
 * Get region from country name
 */
function getRegion(country: string): string {
  return COUNTRY_TO_REGION[country] || 'South America'; // Default to South America
}

/**
 * Calculate a fallback price when we can't get coordinates
 * Uses name-based heuristics to estimate prices
 */
function calculateFallbackPrice(origin: string, destination: string): number {
  // Try to detect if these are cities in different continents based on naming patterns
  const isBrazilianCity = (city: string): boolean => {
    const brazilianCities = ['São Paulo', 'Rio', 'Brasília', 'Salvador', 'Fortaleza', 
      'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Porto Alegre', 'Belém', 
      'Goiânia', 'Guarulhos', 'Campinas', 'São Luís', 'Natal'];
    return brazilianCities.some(c => city.includes(c));
  };
  
  const isEuropeanCity = (city: string): boolean => {
    const europeanCities = ['London', 'Paris', 'Berlin', 'Madrid', 'Rome', 'Amsterdam', 
      'Barcelona', 'Lisbon', 'Vienna', 'Athens', 'Dublin', 'Brussels', 'Prague'];
    return europeanCities.some(c => city.includes(c));
  };
  
  const isNorthAmericanCity = (city: string): boolean => {
    const northAmericanCities = ['New York', 'Los Angeles', 'Chicago', 'Toronto', 
      'Miami', 'Vancouver', 'San Francisco', 'Las Vegas', 'Orlando', 'Washington', 
      'Boston', 'Seattle', 'Atlanta', 'Dallas', 'Houston', 'Denver'];
    return northAmericanCities.some(c => city.includes(c));
  };
  
  const isAsianCity = (city: string): boolean => {
    const asianCities = ['Tokyo', 'Seoul', 'Beijing', 'Shanghai', 'Hong Kong', 
      'Singapore', 'Bangkok', 'Delhi', 'Mumbai', 'Dubai', 'Tel Aviv', 'Doha'];
    return asianCities.some(c => city.includes(c));
  };
  
  const isOceaniaCity = (city: string): boolean => {
    const oceaniaCities = ['Sydney', 'Melbourne', 'Auckland', 'Brisbane', 
      'Perth', 'Adelaide', 'Wellington', 'Queenstown'];
    return oceaniaCities.some(c => city.includes(c));
  };
  
  const originIsBrazilian = isBrazilianCity(origin);
  
  // Basic price tiers in USD
  let basePrice = 0;
  
  // Origin in Brazil
  if (originIsBrazilian) {
    if (isBrazilianCity(destination)) {
      basePrice = 250; // Domestic Brazil flight
    } else if (isEuropeanCity(destination)) {
      basePrice = 1200; // Brazil to Europe
    } else if (isNorthAmericanCity(destination)) {
      basePrice = 800; // Brazil to North America
    } else if (isAsianCity(destination)) {
      basePrice = 1800; // Brazil to Asia
    } else if (isOceaniaCity(destination)) {
      basePrice = 2000; // Brazil to Oceania
    } else {
      basePrice = 600; // Brazil to other South American countries
    }
  }
  // Origin outside Brazil
  else {
    if (isBrazilianCity(destination)) {
      // Mirror the logic from above for non-Brazilian origins
      if (isEuropeanCity(origin)) {
        basePrice = 1200; // Europe to Brazil
      } else if (isNorthAmericanCity(origin)) {
        basePrice = 800; // North America to Brazil
      } else if (isAsianCity(origin)) {
        basePrice = 1800; // Asia to Brazil
      } else if (isOceaniaCity(origin)) {
        basePrice = 2000; // Oceania to Brazil
      } else {
        basePrice = 600; // Other South American to Brazil
      }
    } else {
      // Generic international flight with similar continent patterns
      basePrice = 800; // Default international
    }
  }
  
  // Apply a small random variance (±10%)
  const variance = 1 + (Math.random() * 0.2 - 0.1);
  
  // Convert to BRL (rough estimate - 5:1 ratio)
  const priceBRL = Math.round(basePrice * 5 * variance);
  
  return priceBRL;
}

export default flightsService; 