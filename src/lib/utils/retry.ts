import { logger } from './logger';

// Retry configuration
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number; // Base delay in milliseconds
  maxDelay: number; // Maximum delay in milliseconds
  backoffMultiplier: number; // Exponential backoff multiplier
  jitter: boolean; // Add random jitter to prevent thundering herd
  retryCondition?: (error: Error) => boolean; // Custom retry condition
}

// Default retry configurations
export const retryConfigs = {
  // API requests
  api: {
    maxAttempts: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 10000, // 10 seconds
    backoffMultiplier: 2,
    jitter: true,
    retryCondition: (error: Error) => {
      // Retry on network errors, timeouts, and 5xx status codes
      return error.message.includes('network') || 
             error.message.includes('timeout') ||
             error.message.includes('5');
    },
  },
  
  // Database operations
  database: {
    maxAttempts: 5,
    baseDelay: 500, // 500ms
    maxDelay: 5000, // 5 seconds
    backoffMultiplier: 2,
    jitter: true,
    retryCondition: (error: Error) => {
      // Retry on connection errors and deadlocks
      return error.message.includes('connection') ||
             error.message.includes('deadlock') ||
             error.message.includes('timeout');
    },
  },
  
  // File operations
  file: {
    maxAttempts: 3,
    baseDelay: 2000, // 2 seconds
    maxDelay: 8000, // 8 seconds
    backoffMultiplier: 2,
    jitter: true,
    retryCondition: (error: Error) => {
      // Retry on file system errors
      return error.message.includes('ENOENT') ||
             error.message.includes('EBUSY') ||
             error.message.includes('EACCES');
    },
  },
  
  // External API calls
  externalApi: {
    maxAttempts: 4,
    baseDelay: 1500, // 1.5 seconds
    maxDelay: 15000, // 15 seconds
    backoffMultiplier: 2,
    jitter: true,
    retryCondition: (error: Error) => {
      // Retry on network errors and rate limiting
      return error.message.includes('network') ||
             error.message.includes('timeout') ||
             error.message.includes('429') || // Rate limited
             error.message.includes('5');
    },
  },
};

// Retry utility class
export class RetryManager {
  private config: RetryConfig;
  
  constructor(config: RetryConfig) {
    this.config = config;
  }
  
  async execute<T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
      try {
        const result = await operation();
        
        if (attempt > 1) {
          logger.info(`Operation succeeded on attempt ${attempt}`, {
            context,
            attempt,
            totalAttempts: this.config.maxAttempts,
          });
        }
        
        return result;
      } catch (error) {
        lastError = error as Error;
        
        // Check if we should retry this error
        if (this.config.retryCondition && !this.config.retryCondition(lastError)) {
          logger.warn(`Non-retryable error encountered`, {
            context,
            attempt,
            error: lastError.message,
          });
          throw lastError;
        }
        
        // If this was the last attempt, throw the error
        if (attempt === this.config.maxAttempts) {
          logger.error(`Operation failed after ${attempt} attempts`, {
            context,
            attempt,
            error: lastError.message,
          });
          throw lastError;
        }
        
        // Calculate delay for next attempt
        const delay = this.calculateDelay(attempt);
        
        logger.warn(`Operation failed, retrying in ${delay}ms`, {
          context,
          attempt,
          totalAttempts: this.config.maxAttempts,
          error: lastError.message,
          nextDelay: delay,
        });
        
        // Wait before retrying
        await this.sleep(delay);
      }
    }
    
    throw lastError!;
  }
  
  private calculateDelay(attempt: number): number {
    let delay = this.config.baseDelay * Math.pow(this.config.backoffMultiplier, attempt - 1);
    
    // Apply maximum delay limit
    delay = Math.min(delay, this.config.maxDelay);
    
    // Add jitter to prevent thundering herd
    if (this.config.jitter) {
      const jitter = Math.random() * 0.1 * delay; // 10% jitter
      delay += jitter;
    }
    
    return Math.floor(delay);
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Convenience functions for common retry scenarios
export const retry = {
  // API requests
  api: <T>(operation: () => Promise<T>, context?: string) => {
    const retryManager = new RetryManager(retryConfigs.api);
    return retryManager.execute(operation, context);
  },
  
  // Database operations
  database: <T>(operation: () => Promise<T>, context?: string) => {
    const retryManager = new RetryManager(retryConfigs.database);
    return retryManager.execute(operation, context);
  },
  
  // File operations
  file: <T>(operation: () => Promise<T>, context?: string) => {
    const retryManager = new RetryManager(retryConfigs.file);
    return retryManager.execute(operation, context);
  },
  
  // External API calls
  externalApi: <T>(operation: () => Promise<T>, context?: string) => {
    const retryManager = new RetryManager(retryConfigs.externalApi);
    return retryManager.execute(operation, context);
  },
  
  // Custom retry with specific configuration
  custom: <T>(operation: () => Promise<T>, config: RetryConfig, context?: string) => {
    const retryManager = new RetryManager(config);
    return retryManager.execute(operation, context);
  },
};

// React hook for retry functionality
export function useRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = retryConfigs.api
) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [attempt, setAttempt] = React.useState(0);
  
  const execute = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    setAttempt(0);
    
    try {
      const retryManager = new RetryManager(config);
      const result = await retryManager.execute(operation);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [operation, config]);
  
  return {
    data,
    loading,
    error,
    attempt,
    execute,
  };
}

// Circuit breaker pattern for preventing cascading failures
export class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime = 0;
  private nextAttemptTime = 0;
  
  constructor(
    private failureThreshold: number = 5,
    private recoveryTimeout: number = 60000, // 1 minute
    private monitoringPeriod: number = 60000 // 1 minute
  ) {}
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttemptTime) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess(): void {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }
  
  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttemptTime = Date.now() + this.recoveryTimeout;
      
      logger.warn('Circuit breaker opened', {
        failureCount: this.failureCount,
        nextAttemptTime: new Date(this.nextAttemptTime).toISOString(),
      });
    }
  }
  
  getState(): string {
    return this.state;
  }
  
  getFailureCount(): number {
    return this.failureCount;
  }
}

// Timeout wrapper for operations
export function withTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number
): Promise<T> {
  return Promise.race([
    operation(),
    new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    }),
  ]);
}

// Retry with timeout
export function retryWithTimeout<T>(
  operation: () => Promise<T>,
  retryConfig: RetryConfig,
  timeoutMs: number,
  context?: string
): Promise<T> {
  const retryManager = new RetryManager(retryConfig);
  
  return retryManager.execute(async () => {
    return withTimeout(operation, timeoutMs);
  }, context);
}

// Bulk retry for multiple operations
export async function retryBulk<T>(
  operations: Array<() => Promise<T>>,
  config: RetryConfig,
  context?: string
): Promise<T[]> {
  const retryManager = new RetryManager(config);
  const results: T[] = [];
  
  for (let i = 0; i < operations.length; i++) {
    try {
      const result = await retryManager.execute(operations[i], `${context}_${i}`);
      results.push(result);
    } catch (error) {
      logger.error(`Bulk operation ${i} failed`, {
        context: `${context}_${i}`,
        error: (error as Error).message,
      });
      throw error;
    }
  }
  
  return results;
}

// Retry statistics
export class RetryStats {
  private stats = new Map<string, {
    totalAttempts: number;
    successfulAttempts: number;
    failedAttempts: number;
    averageRetries: number;
  }>();
  
  recordAttempt(context: string, success: boolean, attempts: number): void {
    const current = this.stats.get(context) || {
      totalAttempts: 0,
      successfulAttempts: 0,
      failedAttempts: 0,
      averageRetries: 0,
    };
    
    current.totalAttempts++;
    if (success) {
      current.successfulAttempts++;
    } else {
      current.failedAttempts++;
    }
    
    current.averageRetries = (current.averageRetries * (current.totalAttempts - 1) + attempts) / current.totalAttempts;
    
    this.stats.set(context, current);
  }
  
  getStats(context: string): any {
    return this.stats.get(context);
  }
  
  getAllStats(): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [context, stats] of this.stats.entries()) {
      result[context] = stats;
    }
    return result;
  }
}

// Global retry statistics
export const retryStats = new RetryStats();
