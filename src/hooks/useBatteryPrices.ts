'use client';

import { useState, useEffect } from 'react';

export interface BatteryPriceData {
  id: string;
  brand: string;
  title: string;
  price: number;
  priceFormatted: string;
  capacity: string;
  image: string;
  affiliateLink: string;
  specs: string[];
  benefits: string[];
  lastUpdated: string;
  source: 'api' | 'fallback';
}

interface UseBatteryPricesResult {
  products: BatteryPriceData[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

// Cache the result for the session
let cachedProducts: BatteryPriceData[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export function useBatteryPrices(productId?: string): UseBatteryPricesResult {
  const [products, setProducts] = useState<BatteryPriceData[]>(cachedProducts || []);
  const [isLoading, setIsLoading] = useState(!cachedProducts);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = async () => {
    // Check cache first
    if (cachedProducts && cacheTimestamp && Date.now() - cacheTimestamp < CACHE_DURATION) {
      if (productId) {
        const filtered = cachedProducts.filter(p => p.id === productId);
        setProducts(filtered);
      } else {
        setProducts(cachedProducts);
      }
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const url = productId 
        ? `/api/battery-prices?id=${productId}`
        : '/api/battery-prices';
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch battery prices');
      }

      const data = await response.json();
      
      // Update cache
      if (!productId) {
        cachedProducts = data.products;
        cacheTimestamp = Date.now();
      }
      
      setProducts(data.products);
    } catch (err) {
      console.error('Error fetching battery prices:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, [productId]);

  return {
    products,
    isLoading,
    error,
    refetch: fetchPrices,
  };
}

// Helper to get a specific product
export function useBatteryPrice(productId: string) {
  const { products, isLoading, error, refetch } = useBatteryPrices();
  const product = products.find(p => p.id === productId);
  
  return {
    product,
    isLoading,
    error,
    refetch,
  };
}

