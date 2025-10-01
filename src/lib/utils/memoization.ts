import { useMemo, useCallback } from 'react';

// Simple memoization utility for expensive calculations
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

// LRU Cache implementation for more sophisticated caching
export class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Memoized calculation functions
export const memoizedCalculations = {
  // Cache for energy calculations
  energyCalculation: memoize(
    (userProfile: any, contract: any) => {
      // This would be the actual calculation
      return { userProfile, contract, timestamp: Date.now() };
    },
    (userProfile: any, contract: any) => 
      `energy_${JSON.stringify(userProfile)}_${JSON.stringify(contract)}`
  ),

  // Cache for PV calculations
  pvCalculation: memoize(
    (pvOpwek: number, jaarverbruik: number, percentageZelfverbruik: number) => {
      return { pvOpwek, jaarverbruik, percentageZelfverbruik, timestamp: Date.now() };
    },
    (pvOpwek: number, jaarverbruik: number, percentageZelfverbruik: number) => 
      `pv_${pvOpwek}_${jaarverbruik}_${percentageZelfverbruik}`
  ),

  // Cache for gas calculations
  gasCalculation: memoize(
    (verbruik: number, kalePrijs: number, aansluiting: string) => {
      return { verbruik, kalePrijs, aansluiting, timestamp: Date.now() };
    },
    (verbruik: number, kalePrijs: number, aansluiting: string) => 
      `gas_${verbruik}_${kalePrijs}_${aansluiting}`
  ),
};

// React hooks for memoization
export function useMemoizedCalculation<T>(
  calculation: () => T,
  dependencies: React.DependencyList
): T {
  return useMemo(calculation, dependencies);
}

export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  dependencies: React.DependencyList
): T {
  return useCallback(callback, dependencies);
}

// Performance monitoring utilities
export class PerformanceMonitor {
  private timers = new Map<string, number>();
  private measurements: Array<{ name: string; duration: number; timestamp: number }> = [];

  start(name: string): void {
    this.timers.set(name, performance.now());
  }

  end(name: string): number {
    const startTime = this.timers.get(name);
    if (!startTime) {
      console.warn(`Timer '${name}' was not started`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(name);
    
    this.measurements.push({
      name,
      duration,
      timestamp: Date.now(),
    });

    // Keep only last 100 measurements
    if (this.measurements.length > 100) {
      this.measurements = this.measurements.slice(-100);
    }

    return duration;
  }

  getAverageTime(name: string): number {
    const measurements = this.measurements.filter(m => m.name === name);
    if (measurements.length === 0) return 0;
    
    const total = measurements.reduce((sum, m) => sum + m.duration, 0);
    return total / measurements.length;
  }

  getMeasurements(): Array<{ name: string; duration: number; timestamp: number }> {
    return [...this.measurements];
  }

  clear(): void {
    this.timers.clear();
    this.measurements = [];
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Higher-order function for timing calculations
export function withTiming<T extends (...args: any[]) => any>(
  fn: T,
  name: string
): T {
  return ((...args: Parameters<T>) => {
    performanceMonitor.start(name);
    try {
      const result = fn(...args);
      performanceMonitor.end(name);
      return result;
    } catch (error) {
      performanceMonitor.end(name);
      throw error;
    }
  }) as T;
}

// Debounce utility for expensive operations
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle utility for rate limiting
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
