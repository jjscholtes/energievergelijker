import { NextResponse } from 'next/server';

export interface HistoricalDayData {
  date: string;
  average: number;
  min: number;
  max: number;
  prices: Array<{
    timestamp: string;
    price: number;
  }>;
}

export interface HistoricalResponse {
  data: HistoricalDayData[];
  fromDate: string;
  tillDate: string;
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

// Cache for 1 hour for historical data
export const revalidate = 3600;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fromParam = searchParams.get('from');
  const tillParam = searchParams.get('till');
  const inclBtw = searchParams.get('inclBtw') !== 'false';
  
  // Default: last 7 days
  const tillDate = tillParam ? new Date(tillParam) : new Date();
  const fromDate = fromParam 
    ? new Date(fromParam) 
    : new Date(tillDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  // Limit to max 365 days
  const maxDays = 365;
  const daysDiff = Math.ceil((tillDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff > maxDays) {
    return NextResponse.json(
      { error: `Maximum range is ${maxDays} days` },
      { status: 400 }
    );
  }
  
  // Format dates for API
  const apiFromDate = new Date(fromDate);
  apiFromDate.setUTCHours(0, 0, 0, 0);
  
  const apiTillDate = new Date(tillDate);
  apiTillDate.setUTCHours(23, 59, 59, 999);
  
  const apiUrl = `https://api.energyzero.nl/v1/energyprices?fromDate=${apiFromDate.toISOString()}&tillDate=${apiTillDate.toISOString()}&interval=4&usageType=1&inclBtw=${inclBtw}`;
  
  try {
    const response = await fetch(apiUrl, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data: EnergyZeroResponse = await response.json();
    
    // Group prices by date
    const pricesByDate = new Map<string, Array<{ timestamp: string; price: number }>>();
    
    for (const price of data.Prices) {
      const date = price.readingDate.split('T')[0];
      if (!pricesByDate.has(date)) {
        pricesByDate.set(date, []);
      }
      pricesByDate.get(date)!.push({
        timestamp: price.readingDate,
        price: price.price
      });
    }
    
    // Calculate stats for each day
    const historicalData: HistoricalDayData[] = [];
    
    for (const [date, prices] of pricesByDate) {
      const priceValues = prices.map(p => p.price).filter(p => typeof p === 'number' && !isNaN(p));
      if (priceValues.length === 0) continue;
      
      historicalData.push({
        date,
        average: priceValues.reduce((sum, p) => sum + p, 0) / priceValues.length,
        min: Math.min(...priceValues),
        max: Math.max(...priceValues),
        prices: prices.sort((a, b) => a.timestamp.localeCompare(b.timestamp))
      });
    }
    
    // Sort by date ascending
    historicalData.sort((a, b) => a.date.localeCompare(b.date));
    
    const responseData: HistoricalResponse = {
      data: historicalData,
      fromDate: apiFromDate.toISOString().split('T')[0],
      tillDate: apiTillDate.toISOString().split('T')[0],
      lastUpdated: new Date().toISOString()
    };
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('Error fetching historical prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch historical prices', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
