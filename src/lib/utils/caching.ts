import { LRUCache } from './memoization';

// Cache configuration
export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of entries
  staleWhileRevalidate?: number; // Time to serve stale content while revalidating
}

// Cache entry with metadata
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
  lastAccessed: number;
}

// Generic cache implementation
export class Cache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private config: CacheConfig;
  private cleanupInterval: NodeJS.Timeout;

  constructor(config: CacheConfig) {
    this.config = config;
    
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  set(key: string, data: T, customTtl?: number): void {
    const ttl = customTtl || this.config.ttl;
    const now = Date.now();
    
    this.cache.set(key, {
      data,
      timestamp: now,
      ttl,
      hits: 0,
      lastAccessed: now,
    });

    // Enforce max size
    if (this.cache.size > this.config.maxSize) {
      this.evictLRU();
    }
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    
    // Check if expired
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update access statistics
    entry.hits++;
    entry.lastAccessed = now;
    
    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  getStats(): { size: number; hits: number; misses: number; hitRate: number } {
    let totalHits = 0;
    let totalMisses = 0;
    
    for (const entry of this.cache.values()) {
      totalHits += entry.hits;
    }
    
    // This is a simplified calculation - in a real implementation,
    // you'd track misses separately
    const totalRequests = totalHits + totalMisses;
    const hitRate = totalRequests > 0 ? totalHits / totalRequests : 0;
    
    return {
      size: this.cache.size,
      hits: totalHits,
      misses: totalMisses,
      hitRate,
    };
  }

  private cleanup(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  private evictLRU(): void {
    let oldestKey = '';
    let oldestTime = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.cache.clear();
  }
}

// Cache configurations for different types of data
export const cacheConfigs = {
  // Energy calculations (expensive, cache for 5 minutes)
  energyCalculation: {
    ttl: 5 * 60 * 1000, // 5 minutes
    maxSize: 1000,
    staleWhileRevalidate: 2 * 60 * 1000, // 2 minutes
  },
  
  // PV calculations (expensive, cache for 10 minutes)
  pvCalculation: {
    ttl: 10 * 60 * 1000, // 10 minutes
    maxSize: 500,
    staleWhileRevalidate: 5 * 60 * 1000, // 5 minutes
  },
  
  // Contract data (changes infrequently, cache for 1 hour)
  contractData: {
    ttl: 60 * 60 * 1000, // 1 hour
    maxSize: 100,
    staleWhileRevalidate: 30 * 60 * 1000, // 30 minutes
  },
  
  // User profiles (cache for 30 minutes)
  userProfile: {
    ttl: 30 * 60 * 1000, // 30 minutes
    maxSize: 500,
  },
  
  // API responses (cache for 15 minutes)
  apiResponse: {
    ttl: 15 * 60 * 1000, // 15 minutes
    maxSize: 200,
  },
};

// Global cache instances
export const caches = {
  energyCalculation: new Cache<any>(cacheConfigs.energyCalculation),
  pvCalculation: new Cache<any>(cacheConfigs.pvCalculation),
  contractData: new Cache<any>(cacheConfigs.contractData),
  userProfile: new Cache<any>(cacheConfigs.userProfile),
  apiResponse: new Cache<any>(cacheConfigs.apiResponse),
};

// Cache key generators
export const cacheKeys = {
  energyCalculation: (userProfile: any, contract: any) => 
    `energy_${JSON.stringify(userProfile)}_${JSON.stringify(contract)}`,
  
  pvCalculation: (pvOpwek: number, jaarverbruik: number, percentageZelfverbruik: number) => 
    `pv_${pvOpwek}_${jaarverbruik}_${percentageZelfverbruik}`,
  
  contractData: (contractId: string) => `contract_${contractId}`,
  
  userProfile: (profileId: string) => `profile_${profileId}`,
  
  apiResponse: (endpoint: string, params: any) => 
    `api_${endpoint}_${JSON.stringify(params)}`,
};

// Cache decorator for functions
export function cached<T extends (...args: any[]) => any>(
  cache: Cache<any>,
  keyGenerator: (...args: Parameters<T>) => string,
  ttl?: number
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = function (...args: Parameters<T>) {
      const key = keyGenerator(...args);
      const cachedResult = cache.get(key);
      
      if (cachedResult !== null) {
        return cachedResult;
      }
      
      const result = method.apply(this, args);
      cache.set(key, result, ttl);
      
      return result;
    };
    
    return descriptor;
  };
}

// React hook for caching
export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  config: CacheConfig
): { data: T | null; loading: boolean; error: Error | null; refetch: () => void } {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  
  const cache = React.useMemo(() => new Cache<T>(config), [config]);
  
  const fetchData = React.useCallback(async () => {
    const cachedData = cache.get(key);
    if (cachedData) {
      setData(cachedData);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetcher();
      cache.set(key, result);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, cache]);
  
  React.useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

// Cache middleware for API routes
export function withCache<T>(
  cache: Cache<T>,
  keyGenerator: (request: Request) => string,
  ttl?: number
) {
  return function (handler: (request: Request) => Promise<Response>) {
    return async (request: Request): Promise<Response> => {
      const key = keyGenerator(request);
      const cachedResponse = cache.get(key);
      
      if (cachedResponse) {
        return new Response(JSON.stringify(cachedResponse), {
          headers: {
            'Content-Type': 'application/json',
            'X-Cache': 'HIT',
          },
        });
      }
      
      const response = await handler(request);
      const data = await response.json();
      
      cache.set(key, data, ttl);
      
      return new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'X-Cache': 'MISS',
        },
      });
    };
  };
}

// Cache invalidation utilities
export class CacheInvalidator {
  private cache: Cache<any>;
  
  constructor(cache: Cache<any>) {
    this.cache = cache;
  }
  
  invalidatePattern(pattern: RegExp): void {
    for (const key of this.cache['cache'].keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
      }
    }
  }
  
  invalidatePrefix(prefix: string): void {
    this.invalidatePattern(new RegExp(`^${prefix}`));
  }
  
  invalidateSuffix(suffix: string): void {
    this.invalidatePattern(new RegExp(`${suffix}$`));
  }
  
  invalidateAll(): void {
    this.cache.clear();
  }
}

// Cache statistics and monitoring
export class CacheMonitor {
  private caches: Map<string, Cache<any>> = new Map();
  
  registerCache(name: string, cache: Cache<any>): void {
    this.caches.set(name, cache);
  }
  
  getStats(): Record<string, any> {
    const stats: Record<string, any> = {};
    
    for (const [name, cache] of this.caches.entries()) {
      stats[name] = cache.getStats();
    }
    
    return stats;
  }
  
  getTotalStats(): { totalSize: number; totalHits: number; totalMisses: number; overallHitRate: number } {
    let totalSize = 0;
    let totalHits = 0;
    let totalMisses = 0;
    
    for (const cache of this.caches.values()) {
      const stats = cache.getStats();
      totalSize += stats.size;
      totalHits += stats.hits;
      totalMisses += stats.misses;
    }
    
    const totalRequests = totalHits + totalMisses;
    const overallHitRate = totalRequests > 0 ? totalHits / totalRequests : 0;
    
    return {
      totalSize,
      totalHits,
      totalMisses,
      overallHitRate,
    };
  }
}

// Global cache monitor
export const cacheMonitor = new CacheMonitor();

// Register all caches
Object.entries(caches).forEach(([name, cache]) => {
  cacheMonitor.registerCache(name, cache);
});
