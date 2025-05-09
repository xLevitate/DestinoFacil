import axios from 'axios';

const PEXELS_API_KEY = process.env.NEXT_PUBLIC_PEXELS_API_KEY;

const PEXELS_API_URL = 'https://api.pexels.com/v1';
const GEODB_API_URL = 'http://geodb-free-service.wirefreethought.com/v1/geo';

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

const imageCache: Record<string, CacheItem<CityImage[]>> = {};
const citySearchCache: Record<string, CacheItem<GeoDBCity[]>> = {};
const cityDetailsCache: Record<string, CacheItem<GeoDBCity>> = {};
const nearbyCitiesCache: Record<string, CacheItem<GeoDBCity[]>> = {};
const cityDistanceCache: Record<string, CacheItem<number>> = {};
const destinationInfoCache: Record<string, CacheItem<DestinationInfo>> = {};

export interface PexelsImage {
  id: number;
  src: {
    original: string;
    large: string;
    medium: string;
    small: string;
  };
  photographer: string;
  photographer_url: string;
}

export interface CityImage {
  id: string | number;
  url: string;
  thumb: string;
  alt: string;
  photographer: {
    name: string;
    profile: string;
  };
}

export interface GeoDBCity {
  id: number;
  wikiDataId: string;
  type: string;
  name: string;
  country: string;
  countryCode: string;
  region: string;
  regionCode: string;
  latitude: number;
  longitude: number;
  population: number;
}

export interface DestinationInfo {
  id: string | number;
  name: string;
  country: string;
  region: string;
  population: number;
  images: CityImage[];
  nearbyCities?: DestinationInfo[];
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

const pexelsAPI = axios.create({
  baseURL: PEXELS_API_URL,
  headers: {
    Authorization: PEXELS_API_KEY
  }
});

const geoDBAPI = axios.create({
  baseURL: GEODB_API_URL
});

export const cityImageServices = {
  getPexelsCityImages: async (cityName: string, count: number = 3): Promise<CityImage[]> => {
    const cacheKey = `${cityName}_${count}`;
    
    if (imageCache[cacheKey] && 
        (Date.now() - imageCache[cacheKey].timestamp) < CACHE_DURATION) {
      console.log(`Using cached images for ${cityName}`);
      return imageCache[cacheKey].data;
    }
    
    try {
      const response = await pexelsAPI.get('/search', {
        params: {
          query: `${cityName} city`,
          per_page: count,
          orientation: 'landscape'
        }
      });
      
      const images = response.data.photos.map((img: PexelsImage) => ({
        id: img.id,
        url: img.src.large,
        thumb: img.src.medium,
        alt: `Photo of ${cityName}`,
        photographer: {
          name: img.photographer,
          profile: img.photographer_url
        }
      }));
      
      imageCache[cacheKey] = {
        data: images,
        timestamp: Date.now()
      };
      
      return images;
    } catch (error) {
      console.error('Error fetching Pexels images:', error);
      
      if (imageCache[cacheKey]) {
        console.log(`Using expired cached images for ${cityName} due to API error`);
        return imageCache[cacheKey].data;
      }
      
      return [];
    }
  },

  getCityImages: async (cityName: string, count: number = 3): Promise<CityImage[]> => {
    try {
      return await cityImageServices.getPexelsCityImages(cityName, count);
    } catch (error) {
      console.error('Error fetching city images:', error);
      return [];
    }
  }
};

export const cityInfoServices = {
  searchCities: async (cityName: string, limit: number = 10): Promise<GeoDBCity[]> => {
    const cacheKey = `${cityName}_${limit}`;
    
    if (citySearchCache[cacheKey] && 
        (Date.now() - citySearchCache[cacheKey].timestamp) < CACHE_DURATION) {
      console.log(`Using cached city search results for ${cityName}`);
      return citySearchCache[cacheKey].data;
    }
    
    try {
      const response = await geoDBAPI.get('/cities', {
        params: {
          namePrefix: cityName,
          limit: limit,
          sort: '-population'
        }
      });
      
      const cities = response.data.data;
      
      citySearchCache[cacheKey] = {
        data: cities,
        timestamp: Date.now()
      };
      
      return cities;
    } catch (error) {
      console.error('Error searching cities:', error);
      
      if (citySearchCache[cacheKey]) {
        console.log(`Using expired cached city search for ${cityName} due to API error`);
        return citySearchCache[cacheKey].data;
      }
      
      return [];
    }
  },

  getCityDetails: async (cityId: string): Promise<GeoDBCity | null> => {
    if (cityDetailsCache[cityId] && 
        (Date.now() - cityDetailsCache[cityId].timestamp) < CACHE_DURATION) {
      console.log(`Using cached city details for city ID ${cityId}`);
      return cityDetailsCache[cityId].data;
    }
    
    try {
      const response = await geoDBAPI.get(`/cities/${cityId}`);
      const cityDetails = response.data.data;
      
      cityDetailsCache[cityId] = {
        data: cityDetails,
        timestamp: Date.now()
      };
      
      return cityDetails;
    } catch (error) {
      console.error('Error fetching city details:', error);
      
      if (cityDetailsCache[cityId]) {
        console.log(`Using expired cached city details for ID ${cityId} due to API error`);
        return cityDetailsCache[cityId].data;
      }
      
      return null;
    }
  },

  getNearbyCities: async (cityId: string, radius: number = 100, limit: number = 5): Promise<GeoDBCity[]> => {
    const cacheKey = `${cityId}_${radius}_${limit}`;
    
    if (nearbyCitiesCache[cacheKey] && 
        (Date.now() - nearbyCitiesCache[cacheKey].timestamp) < CACHE_DURATION) {
      console.log(`Using cached nearby cities for city ID ${cityId}`);
      return nearbyCitiesCache[cacheKey].data;
    }
    
    try {
      const response = await geoDBAPI.get(`/cities/${cityId}/nearbyCities`, {
        params: {
          radius: radius,
          limit: limit
        }
      });
      
      const nearbyCities = response.data.data;
      
      nearbyCitiesCache[cacheKey] = {
        data: nearbyCities,
        timestamp: Date.now()
      };
      
      return nearbyCities;
    } catch (error) {
      console.error('Error fetching nearby cities:', error);
      
      if (nearbyCitiesCache[cacheKey]) {
        console.log(`Using expired cached nearby cities for ID ${cityId} due to API error`);
        return nearbyCitiesCache[cacheKey].data;
      }
      
      return [];
    }
  }
};

const normalizeCityName = (cityName: string): string => {
  return cityName
    .replace(/Região Metropolitana d[aeo]/i, '')
    .replace(/Grande/i, '')
    .replace(/Microrregião d[aeo]/i, '')
    .replace(/Município d[aeo]/i, '')
    .replace(/Cidade d[aeo]/i, '')
    .trim();
};

export const destinationServices = {
  getDestinationInfo: async (cityName: string): Promise<DestinationInfo | null> => {
    if (destinationInfoCache[cityName] && 
        (Date.now() - destinationInfoCache[cityName].timestamp) < CACHE_DURATION) {
      console.log(`Using cached destination info for ${cityName}`);
      return destinationInfoCache[cityName].data;
    }
    
    try {
      const normalizedCityName = normalizeCityName(cityName);
      
      if (normalizedCityName !== cityName && 
          destinationInfoCache[normalizedCityName] &&
          (Date.now() - destinationInfoCache[normalizedCityName].timestamp) < CACHE_DURATION) {
        console.log(`Using cached destination info for normalized name ${normalizedCityName}`);
        return destinationInfoCache[normalizedCityName].data;
      }
      
      let cities = await cityInfoServices.searchCities(normalizedCityName, 1);
      
      if (!cities || cities.length === 0) {
        cities = await cityInfoServices.searchCities(cityName, 1);
      }
      
      if (!cities || cities.length === 0) {
        throw new Error(`No information found for ${cityName}`);
      }
      
      const city = cities[0];
      const images = await cityImageServices.getCityImages(cityName, 5);
      const nearbyCities = await cityInfoServices.getNearbyCities(city.id.toString(), 100, 3);
      
      const destinationInfo: DestinationInfo = {
        id: city.id,
        name: city.name,
        country: city.country,
        region: city.region,
        population: city.population,
        images: images,
        coordinates: {
          latitude: city.latitude,
          longitude: city.longitude
        },
        nearbyCities: nearbyCities.map(nearbyCity => ({
          id: nearbyCity.id,
          name: nearbyCity.name,
          country: nearbyCity.country,
          region: nearbyCity.region,
          population: nearbyCity.population,
          coordinates: {
            latitude: nearbyCity.latitude,
            longitude: nearbyCity.longitude
          },
          images: []
        }))
      };
      
      destinationInfoCache[cityName] = {
        data: destinationInfo,
        timestamp: Date.now()
      };
      
      if (normalizedCityName !== cityName) {
        destinationInfoCache[normalizedCityName] = {
          data: destinationInfo,
          timestamp: Date.now()
        };
      }
      
      return destinationInfo;
    } catch (error) {
      console.error('Error fetching destination information:', error);
      
      if (destinationInfoCache[cityName]) {
        console.log(`Using expired cached destination info for ${cityName} due to API error`);
        return destinationInfoCache[cityName].data;
      }
      
      return null;
    }
  },

  getPopularCities: async (): Promise<string[]> => {
    const popularCities = [
      'Rio de Janeiro',
      'Paris',
      'New York',
      'Tokyo',
      'Barcelona',
      'Rome',
      'London',
      'Amsterdam',
      'Sydney',
      'Cape Town'
    ];
    
    return popularCities;
  },

  getCityImages: async (cityName: string, count: number = 3): Promise<CityImage[]> => {
    return cityImageServices.getCityImages(cityName, count);
  }
};

export const imageUtils = {
  preloadImages: (images: CityImage[]) => {
    if (typeof window !== 'undefined') {
      images.forEach(image => {
        const img = new Image();
        img.src = image.url;
      });
    }
  },
  
  getOptimizedImageUrl: (url: string, width: number = 800): string => {
    if (url.includes('images.pexels.com')) {
      return `${url}?auto=compress&w=${width}`;
    }
    return url;
  }
};

export const cacheUtils = {
  clearCache: () => {
    Object.keys(imageCache).forEach(key => delete imageCache[key]);
    Object.keys(citySearchCache).forEach(key => delete citySearchCache[key]);
    Object.keys(cityDetailsCache).forEach(key => delete cityDetailsCache[key]);
    Object.keys(nearbyCitiesCache).forEach(key => delete nearbyCitiesCache[key]);
    Object.keys(cityDistanceCache).forEach(key => delete cityDistanceCache[key]);
    Object.keys(destinationInfoCache).forEach(key => delete destinationInfoCache[key]);
    console.log('All caches cleared');
  }
};

export default {
  cityImageServices,
  cityInfoServices,
  destinationServices,
  cacheUtils,
  imageUtils
}; 