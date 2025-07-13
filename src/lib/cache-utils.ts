// src/lib/cache-utils.ts
// Caching utilities for API responses and computed data

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class CacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize = 1000; // Maximum cache entries

  set<T>(key: string, data: T, ttl: number = 300000): void { // Default 5 minutes
    // Clean up old entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
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

  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.cache.delete(key));

    // If still too large, remove oldest entries
    if (this.cache.size >= this.maxSize) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = entries.slice(0, Math.floor(this.maxSize * 0.2)); // Remove 20%
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  getStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize
    };
  }
}

// Create cache instances for different data types
export const stockDataCache = new CacheManager();
export const newsCache = new CacheManager();
export const searchCache = new CacheManager();

// Cache key generators
export function generateStockCacheKey(symbol: string, dataType: string): string {
  return `stock:${symbol.toLowerCase()}:${dataType}`;
}

export function generateNewsCacheKey(query: string, page: number): string {
  return `news:${query.toLowerCase()}:${page}`;
}

export function generateSearchCacheKey(query: string): string {
  return `search:${query.toLowerCase()}`;
}

// Cache decorator for functions
export function withCache<T extends any[], R>(
  cache: CacheManager,
  keyGenerator: (...args: T) => string,
  ttl: number = 300000
) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function(...args: T): Promise<R> {
      const cacheKey = keyGenerator(...args);
      const cached = cache.get<R>(cacheKey);
      
      if (cached !== null) {
        return cached;
      }

      const result = await method.apply(this, args);
      cache.set(cacheKey, result, ttl);
      
      return result;
    };
  };
} 