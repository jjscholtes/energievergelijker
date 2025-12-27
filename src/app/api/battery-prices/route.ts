import { NextResponse } from 'next/server';
import { batteryProducts, BatteryProduct } from '@/lib/data/batteryProducts';

export const revalidate = 3600; // Cache for 1 hour

interface PriceResult {
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

async function fetchShopifyPrice(product: BatteryProduct): Promise<number | null> {
  try {
    const response = await fetch(product.apiUrl, {
      next: { revalidate: 3600 },
      headers: {
        'User-Agent': 'EnergieVergelijker/1.0',
      },
    });

    if (!response.ok) {
      console.error(`Shopify API error for ${product.id}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    // Shopify returns product with variants, get the first variant price
    if (data.product?.variants?.[0]?.price) {
      return parseFloat(data.product.variants[0].price);
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching Shopify price for ${product.id}:`, error);
    return null;
  }
}

async function fetchWooCommercePrice(product: BatteryProduct): Promise<number | null> {
  try {
    const response = await fetch(product.apiUrl, {
      next: { revalidate: 3600 },
      headers: {
        'User-Agent': 'EnergieVergelijker/1.0',
      },
    });

    if (!response.ok) {
      console.error(`WooCommerce API error for ${product.id}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    // WooCommerce Store API returns array, find matching product
    if (Array.isArray(data)) {
      const matchingProduct = data.find((p: { slug?: string }) => 
        p.slug === product.slug || p.slug?.includes(product.slug)
      );
      
      if (matchingProduct?.prices?.price) {
        // WooCommerce returns price in cents (minor units)
        return parseInt(matchingProduct.prices.price) / 100;
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching WooCommerce price for ${product.id}:`, error);
    return null;
  }
}

async function fetchPrice(product: BatteryProduct): Promise<{ price: number; source: 'api' | 'fallback' }> {
  let price: number | null = null;

  if (product.apiSource === 'shopify') {
    price = await fetchShopifyPrice(product);
  } else if (product.apiSource === 'woocommerce') {
    price = await fetchWooCommercePrice(product);
  }

  if (price !== null && price > 0) {
    return { price, source: 'api' };
  }

  // Fallback to stored price
  return { price: product.fallbackPrice, source: 'fallback' };
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('id');

  try {
    const productsToFetch = productId 
      ? [batteryProducts[productId]].filter(Boolean)
      : Object.values(batteryProducts);

    if (productsToFetch.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Fetch all prices in parallel
    const results: PriceResult[] = await Promise.all(
      productsToFetch.map(async (product) => {
        const { price, source } = await fetchPrice(product);
        
        return {
          id: product.id,
          brand: product.brand,
          title: product.title,
          price,
          priceFormatted: formatPrice(price),
          capacity: product.capacity,
          image: product.image,
          affiliateLink: product.affiliateLink,
          specs: product.specs,
          benefits: product.benefits,
          lastUpdated: new Date().toISOString(),
          source,
        };
      })
    );

    return NextResponse.json({
      products: results,
      cachedUntil: new Date(Date.now() + 3600 * 1000).toISOString(),
    });
  } catch (error) {
    console.error('Error fetching battery prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prices' },
      { status: 500 }
    );
  }
}

