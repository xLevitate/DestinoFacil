export interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

const GLOBAL_PREFIX = 'destino_facil_';

export class PersistentCache {
  private prefix: string;
  
  constructor(namespace: string) {
    this.prefix = `${GLOBAL_PREFIX}${namespace}_`;
  }
  
  set<T>(key: string, data: T, ttl: number = 24 * 60 * 60 * 1000): void {
    if (typeof window === 'undefined') return;
    
    const cacheKey = this.getFullKey(key);
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiry: ttl
    };
    
    try {
      localStorage.setItem(cacheKey, JSON.stringify(item));
      console.log(`Cache set: ${cacheKey}`);
    } catch (error) {
      console.error('Error setting cache item:', error);
      this.cleanup();
    }
  }
  
  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    
    const cacheKey = this.getFullKey(key);
    const item = localStorage.getItem(cacheKey);
    
    if (!item) return null;
    
    try {
      const parsed = JSON.parse(item) as CacheItem<T>;
      const now = Date.now();
      
      if (now - parsed.timestamp > parsed.expiry) {
        this.remove(key);
        return null;
      }
      
      console.log(`Cache hit: ${cacheKey}`);
      return parsed.data;
    } catch (error) {
      console.error('Error parsing cache item:', error);
      this.remove(key);
      return null;
    }
  }
  
  remove(key: string): void {
    if (typeof window === 'undefined') return;
    
    const cacheKey = this.getFullKey(key);
    localStorage.removeItem(cacheKey);
  }
  
  clear(): void {
    if (typeof window === 'undefined') return;
    
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix))
      .forEach(key => localStorage.removeItem(key));
  }
  
  cleanup(): void {
    if (typeof window === 'undefined') return; // Guard for SSR
    
    const now = Date.now();
    Object.keys(localStorage)
      .filter(key => key.startsWith(GLOBAL_PREFIX))
      .forEach(key => {
        try {
          const item = JSON.parse(localStorage.getItem(key) || '{}');
          if (item.timestamp && item.expiry && now - item.timestamp > item.expiry) {
            localStorage.removeItem(key);
          }
        } catch (error) {
          localStorage.removeItem(key);
        }
      });
  }
  
  private getFullKey(key: string): string {
    return `${this.prefix}${key}`;
  }
}

export const destinationCache = new PersistentCache('destinations');
export const cityInfoCache = new PersistentCache('city_info');
export const imageCache = new PersistentCache('images');
export const searchResultsCache = new PersistentCache('search_results');

export default {
  destinationCache,
  cityInfoCache,
  imageCache,
  searchResultsCache
}; 