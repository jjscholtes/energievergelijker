import { NextRequest, NextResponse } from 'next/server';

// Rate limiting configuration
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string; // Error message
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
}

// Default rate limit configurations
export const rateLimitConfigs = {
  // API endpoints
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per 15 minutes
    message: 'Te veel verzoeken. Probeer het later opnieuw.',
  },
  
  // Calculation endpoints (more restrictive)
  calculation: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 calculations per minute
    message: 'Te veel berekeningen. Wacht even voordat je opnieuw probeert.',
  },
  
  // Form submissions
  form: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5, // 5 form submissions per minute
    message: 'Te veel formulier verzendingen. Wacht even voordat je opnieuw probeert.',
  },
  
  // General requests
  general: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 requests per minute
    message: 'Te veel verzoeken. Probeer het later opnieuw.',
  },
};

// In-memory rate limiter (for development/single instance)
class MemoryRateLimiter {
  private requests = new Map<string, number[]>();

  isAllowed(identifier: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const windowStart = now - config.windowMs;
    
    // Get existing requests for this identifier
    const userRequests = this.requests.get(identifier) || [];
    
    // Filter out old requests outside the window
    const recentRequests = userRequests.filter(timestamp => timestamp > windowStart);
    
    // Check if limit is exceeded
    if (recentRequests.length >= config.maxRequests) {
      return false;
    }
    
    // Add current request
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);
    
    // Clean up old entries periodically
    this.cleanup();
    
    return true;
  }

  private cleanup(): void {
    const now = Date.now();
    const maxWindow = Math.max(...Object.values(rateLimitConfigs).map(config => config.windowMs));
    
    for (const [identifier, requests] of this.requests.entries()) {
      const recentRequests = requests.filter(timestamp => timestamp > now - maxWindow);
      if (recentRequests.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, recentRequests);
      }
    }
  }

  getRemainingRequests(identifier: string, config: RateLimitConfig): number {
    const now = Date.now();
    const windowStart = now - config.windowMs;
    const userRequests = this.requests.get(identifier) || [];
    const recentRequests = userRequests.filter(timestamp => timestamp > windowStart);
    
    return Math.max(0, config.maxRequests - recentRequests.length);
  }

  getResetTime(identifier: string, config: RateLimitConfig): number {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];
    
    if (userRequests.length === 0) {
      return now + config.windowMs;
    }
    
    const oldestRequest = Math.min(...userRequests);
    return oldestRequest + config.windowMs;
  }
}

// Global rate limiter instance
const rateLimiter = new MemoryRateLimiter();

// Get client identifier from request
function getClientIdentifier(request: NextRequest): string {
  // Try to get IP address from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  
  let ip = forwarded?.split(',')[0] || realIp || cfConnectingIp || 'unknown';
  
  // In development, use a fallback
  if (ip === 'unknown' || ip === '127.0.0.1' || ip === '::1') {
    ip = 'localhost';
  }
  
  return ip;
}

// Rate limiting middleware for Next.js API routes
export function withRateLimit(config: RateLimitConfig) {
  return function rateLimitMiddleware(
    handler: (request: NextRequest) => Promise<NextResponse>
  ) {
    return async (request: NextRequest): Promise<NextResponse> => {
      const identifier = getClientIdentifier(request);
      
      if (!rateLimiter.isAllowed(identifier, config)) {
        const remaining = rateLimiter.getRemainingRequests(identifier, config);
        const resetTime = rateLimiter.getResetTime(identifier, config);
        
        return NextResponse.json(
          {
            error: config.message || 'Rate limit exceeded',
            remaining,
            resetTime,
          },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': config.maxRequests.toString(),
              'X-RateLimit-Remaining': remaining.toString(),
              'X-RateLimit-Reset': resetTime.toString(),
              'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString(),
            },
          }
        );
      }
      
      // Add rate limit headers to successful responses
      const response = await handler(request);
      const remaining = rateLimiter.getRemainingRequests(identifier, config);
      const resetTime = rateLimiter.getResetTime(identifier, config);
      
      response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set('X-RateLimit-Reset', resetTime.toString());
      
      return response;
    };
  };
}

// Convenience functions for common rate limiting scenarios
export const rateLimit = {
  api: withRateLimit(rateLimitConfigs.api),
  calculation: withRateLimit(rateLimitConfigs.calculation),
  form: withRateLimit(rateLimitConfigs.form),
  general: withRateLimit(rateLimitConfigs.general),
};

// Client-side rate limiting for form submissions
export class ClientRateLimiter {
  private requests: number[] = [];
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  isAllowed(): boolean {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    
    // Filter out old requests
    this.requests = this.requests.filter(timestamp => timestamp > windowStart);
    
    // Check if limit is exceeded
    if (this.requests.length >= this.config.maxRequests) {
      return false;
    }
    
    // Add current request
    this.requests.push(now);
    
    return true;
  }

  getRemainingRequests(): number {
    return Math.max(0, this.config.maxRequests - this.requests.length);
  }

  getTimeUntilReset(): number {
    if (this.requests.length === 0) {
      return 0;
    }
    
    const oldestRequest = Math.min(...this.requests);
    const resetTime = oldestRequest + this.config.windowMs;
    return Math.max(0, resetTime - Date.now());
  }

  reset(): void {
    this.requests = [];
  }
}

// Hook for client-side rate limiting
export function useRateLimit(config: RateLimitConfig) {
  const limiter = new ClientRateLimiter(config);
  
  return {
    isAllowed: () => limiter.isAllowed(),
    getRemainingRequests: () => limiter.getRemainingRequests(),
    getTimeUntilReset: () => limiter.getTimeUntilReset(),
    reset: () => limiter.reset(),
  };
}

// Distributed rate limiting (for production with multiple instances)
export class DistributedRateLimiter {
  // This would integrate with Redis or similar for distributed rate limiting
  // For now, it's a placeholder for future implementation
  
  async isAllowed(identifier: string, config: RateLimitConfig): Promise<boolean> {
    // Implementation would use Redis or similar
    // For now, fall back to memory-based limiter
    return rateLimiter.isAllowed(identifier, config);
  }
  
  async getRemainingRequests(identifier: string, config: RateLimitConfig): Promise<number> {
    return rateLimiter.getRemainingRequests(identifier, config);
  }
  
  async getResetTime(identifier: string, config: RateLimitConfig): Promise<number> {
    return rateLimiter.getResetTime(identifier, config);
  }
}
