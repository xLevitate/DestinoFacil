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
  0: 1.2,  // janeiro
  1: 1.3,  // fevereiro
  2: 1.0,  // marco
  3: 0.9,  // abril
  4: 0.85, // maio
  5: 0.9,  // junho
  6: 1.1,  // julho
  7: 0.9,  // agosto
  8: 0.85, // setembro
  9: 0.9,  // outubro 
  10: 1.0, // novembro
  11: 1.3  // dezembro
};

const POPULAR_ROUTES: Record<string, number> = {
  'São Paulo-Rio de Janeiro': 0.9,
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

export const flightsService = {
  getFlightUrl: (params: FlightSearchParams): string => {
    let url = 'https://www.google.com/travel/flights';
    
    const queryParams = [];
    
    queryParams.push(`q=flights+from+${encodeURIComponent(params.origin)}+to+${encodeURIComponent(params.destination)}`);
    
    if (params.dates) {
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
    
    if (params.adults && params.adults > 1) {
      queryParams.push(`tbs=pt:${params.adults}`);
    }
    
    if (params.currency) {
      queryParams.push(`curr=${params.currency}`);
    }
    
    url += `?${queryParams.join('&')}`;
    
    return url;
  },
  
  estimateFlightPrice: async (origin: string, destination: string): Promise<number> => {
    try {
      const originInfo = await destinationServices.getDestinationInfo(origin);
      const destInfo = await destinationServices.getDestinationInfo(destination);
      
      if (!originInfo || !destInfo || !originInfo.coordinates || !destInfo.coordinates) {
        return calculateFallbackPrice(origin, destination);
      }
      
      const distance = calculateDistance(
        originInfo.coordinates.latitude,
        originInfo.coordinates.longitude,
        destInfo.coordinates.latitude,
        destInfo.coordinates.longitude
      );
      
      const basePrice = getBasePrice(distance);
      
      const originRegion = getRegion(originInfo.country);
      const destRegion = getRegion(destInfo.country);
      const regionFactor = (REGION_FACTORS[originRegion] + REGION_FACTORS[destRegion]) / 2;
      
      const routeKey = `${origin}-${destination}`;
      const reverseRouteKey = `${destination}-${origin}`;
      const routeFactor = POPULAR_ROUTES[routeKey] || POPULAR_ROUTES[reverseRouteKey] || 1.0;
      
      const currentMonth = new Date().getMonth();
      const seasonFactor = SEASON_FACTORS[currentMonth];
      
      const price = Math.round(basePrice * regionFactor * routeFactor * seasonFactor);
      
      const priceBRL = Math.round(price * 5);
      
      const variance = 1 + (Math.random() * 0.1 - 0.05);
      
      return Math.round(priceBRL * variance);
    } catch (error) {
      console.error('Error estimating flight price:', error);
      return calculateFallbackPrice(origin, destination);
    }
  },
  
  getFlightDeals: async (destination: string): Promise<{price: number, origin: string}[]> => {
    const popularOrigins = ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Belo Horizonte', 'Salvador', 'Fortaleza', 'Recife', 'Porto Alegre', 'Curitiba'];
    const deals = [];
    
    for (const origin of popularOrigins) {
      try {
        if (origin.toLowerCase() === destination.toLowerCase()) continue;
        
        const basePrice = await flightsService.estimateFlightPrice(origin, destination);
        
        const discountFactors = [
          0.85,
          0.8,
          0.75
        ];
        
        const routePopularity = POPULAR_ROUTES[`${origin}-${destination}`] || POPULAR_ROUTES[`${destination}-${origin}`] || 1.0;
        let discountIndex = 0;
        
        if (routePopularity <= 0.95) {
          discountIndex = 2;
        } else if (routePopularity <= 1.0) {
          discountIndex = 1;
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
    
    return deals.sort((a, b) => a.price - b.price).slice(0, 3);
  }
};

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
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

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function getBasePrice(distance: number): number {
  for (const [maxDistance, price] of DISTANCE_BASELINE) {
    if (distance <= maxDistance) {
      return price;
    }
  }
  
  const [maxTierDistance, maxTierPrice] = DISTANCE_BASELINE[DISTANCE_BASELINE.length - 1];
  const extraDistance = distance - maxTierDistance;
  const extraPrice = (extraDistance / 1000) * 100;
  
  return maxTierPrice + extraPrice;
}

function getRegion(country: string): string {
  return COUNTRY_TO_REGION[country] || 'South America';
}

function calculateFallbackPrice(origin: string, destination: string): number {
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
  
  let basePrice = 0;
  
  if (originIsBrazilian) {
    if (isBrazilianCity(destination)) {
      basePrice = 250;
    } else if (isEuropeanCity(destination)) {
      basePrice = 1200;
    } else if (isNorthAmericanCity(destination)) {
      basePrice = 800;
    } else if (isAsianCity(destination)) {
      basePrice = 1800;
    } else if (isOceaniaCity(destination)) {
      basePrice = 2000;
    } else {
      basePrice = 600;
    }
  }
  else {
    if (isBrazilianCity(destination)) {
      if (isEuropeanCity(origin)) {
        basePrice = 1200;
      } else if (isNorthAmericanCity(origin)) {
        basePrice = 800;
      } else if (isAsianCity(origin)) {
        basePrice = 1800;
      } else if (isOceaniaCity(origin)) {
        basePrice = 2000;
      } else {
        basePrice = 600;
      }
    } else {
      basePrice = 800;
    }
  }
  
  const variance = 1 + (Math.random() * 0.2 - 0.1);
  
  const priceBRL = Math.round(basePrice * 5 * variance);
  
  return priceBRL;
}

export default flightsService; 