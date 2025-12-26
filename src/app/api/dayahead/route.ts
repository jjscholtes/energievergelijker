import { NextResponse } from 'next/server';

export interface DayAheadPrice {
  timestamp: string;
  price: number; // Price in EUR/kWh (including BTW if requested)
}

export interface DayAheadResponse {
  prices: DayAheadPrice[];
  average: number;
  min: number;
  max: number;
  date: string;
  lastUpdated: string;
}

interface EnergyZeroPrice {
  readingDate: string;
  price: number;
}

interface EnergyZeroResponse {
  Prices: EnergyZeroPrice[];
  average: number;
  fromDate: string;
  tillDate: string;
  intervalType: number;
}

// Cache configuration: revalidate every 15 minutes
export const revalidate = 900;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date');
  const inclBtw = searchParams.get('inclBtw') !== 'false'; // Default true
  
  // Parse the date or use today/tomorrow
  let targetDate: Date;
  
  if (dateParam) {
    targetDate = new Date(dateParam);
  } else {
    // Always use today as the default - tomorrow's prices are fetched separately
    targetDate = new Date();
  }
  
  // Format dates for API
  const fromDate = new Date(targetDate);
  fromDate.setUTCHours(0, 0, 0, 0);
  
  const tillDate = new Date(targetDate);
  tillDate.setUTCHours(23, 59, 59, 999);
  
  const apiUrl = `https://api.energyzero.nl/v1/energyprices?fromDate=${fromDate.toISOString()}&tillDate=${tillDate.toISOString()}&interval=4&usageType=1&inclBtw=${inclBtw}`;
  
  try {
    const response = await fetch(apiUrl, {
      next: { revalidate: 900 } // Cache for 15 minutes
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data: EnergyZeroResponse = await response.json();
    return formatResponse(data, fromDate);
    
  } catch (error) {
    console.error('Error fetching day-ahead prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch day-ahead prices', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function formatResponse(data: EnergyZeroResponse, fromDate: Date): NextResponse<DayAheadResponse> {
  const prices: DayAheadPrice[] = data.Prices.map(p => ({
    timestamp: p.readingDate,
    price: p.price
  }));
  
  // Calculate statistics
  const priceValues = prices.map(p => p.price).filter(p => typeof p === 'number' && !isNaN(p));
  const average = priceValues.length > 0 
    ? priceValues.reduce((sum, p) => sum + p, 0) / priceValues.length 
    : 0;
  const min = priceValues.length > 0 ? Math.min(...priceValues) : 0;
  const max = priceValues.length > 0 ? Math.max(...priceValues) : 0;
  
  const responseData: DayAheadResponse = {
    prices,
    average,
    min,
    max,
    date: fromDate.toISOString().split('T')[0],
    lastUpdated: new Date().toISOString()
  };
  
  return NextResponse.json(responseData, {
    headers: {
      'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=60'
    }
  });
}
