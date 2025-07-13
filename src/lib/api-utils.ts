// src/lib/api-utils.ts
// Centralized API utilities for rate limiting, retry logic, and error handling

interface ApiConfig {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
  rateLimitDelay?: number;
}

class ApiManager {
  private requestCounts: Map<string, number> = new Map();
  private lastRequestTimes: Map<string, number> = new Map();
  
  constructor(private config: ApiConfig = {}) {
    this.config = {
      maxRetries: 3,
      retryDelay: 1000,
      timeout: 10000,
      rateLimitDelay: 100,
      ...config
    };
  }

  async fetchWithRetry(
    url: string, 
    options: RequestInit = {}, 
    apiName: string = 'default'
  ): Promise<Response> {
    let lastError: Error | null = null;
    
    // Rate limiting
    await this.enforceRateLimit(apiName);
    
    for (let attempt = 1; attempt <= this.config.maxRetries!; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
        
        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          this.updateRequestCount(apiName);
          return response;
        }
        
        // Handle specific HTTP errors
        if (response.status === 429) {
          // Rate limited - wait longer
          await this.delay(this.config.rateLimitDelay! * 5);
          continue;
        }
        
        if (response.status >= 500) {
          // Server error - retry
          if (attempt < this.config.maxRetries!) {
            await this.delay(this.config.retryDelay! * attempt);
            continue;
          }
        }
        
        // Non-retryable error
        return response;
        
      } catch (error) {
        lastError = error as Error;
        
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error(`Request timeout after ${this.config.timeout}ms`);
        }
        
        if (attempt < this.config.maxRetries!) {
          await this.delay(this.config.retryDelay! * attempt);
          continue;
        }
      }
    }
    
    throw lastError || new Error('Max retries exceeded');
  }

  private async enforceRateLimit(apiName: string): Promise<void> {
    const now = Date.now();
    const lastRequest = this.lastRequestTimes.get(apiName) || 0;
    const timeSinceLastRequest = now - lastRequest;
    
    if (timeSinceLastRequest < this.config.rateLimitDelay!) {
      await this.delay(this.config.rateLimitDelay! - timeSinceLastRequest);
    }
    
    this.lastRequestTimes.set(apiName, Date.now());
  }

  private updateRequestCount(apiName: string): void {
    const count = this.requestCounts.get(apiName) || 0;
    this.requestCounts.set(apiName, count + 1);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getRequestStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    this.requestCounts.forEach((count, api) => {
      stats[api] = count;
    });
    return stats;
  }
}

// Create API manager instances for different services
export const alphaVantageApi = new ApiManager({
  rateLimitDelay: 12000, // Alpha Vantage: 5 requests per minute
  maxRetries: 2
});

export const yahooApi = new ApiManager({
  rateLimitDelay: 100, // Yahoo Finance: more lenient
  maxRetries: 3
});

export const newsApi = new ApiManager({
  rateLimitDelay: 1000, // News API: 1000 requests per day
  maxRetries: 2
});

// Utility function for safe JSON parsing
export function safeJsonParse<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

// Utility function for API error handling
export function handleApiError(error: any, context: string): never {
  console.error(`API Error in ${context}:`, error);
  
  if (error.message?.includes('timeout')) {
    throw new Error(`Request timeout in ${context}`);
  }
  
  if (error.message?.includes('rate limit')) {
    throw new Error(`Rate limit exceeded for ${context}`);
  }
  
  throw new Error(`Failed to fetch data from ${context}: ${error.message}`);
} 