import { NextResponse } from 'next/server';
import {
  calculateProfileMix,
  getHourlyFraction,
  getBuildYearFromRange,
  BuildYearRange,
  HeatingType,
} from '@/lib/data/neduProfiles';

export interface DynamicInsightRequest {
  totalKwh: number;
  heatingType: HeatingType;
  buildYear: BuildYearRange;
  persons?: number;
  fromDate?: string;
  tillDate?: string;
}

export interface HourlyCost {
  timestamp: string;
  hour: number;
  month: number;
  consumption: number;
  spotPrice: number;
  allInPrice: number;
  cost: number;
}

export interface MonthlySummary {
  month: number;
  monthName: string;
  totalConsumption: number;
  averagePrice: number;
  totalCost: number;
  heatingCost: number;
  baseCost: number;
}

export interface DynamicInsightResponse {
  // Summary
  totalCost: number;
  totalConsumption: number;
  averagePrice: number;
  
  // Fixed contract comparison
  fixedContractCost: number;
  savings: number;
  savingsPercentage: number;
  
  // Profile info
  profileMix: {
    baseKwh: number;
    heatingKwh: number;
    method: 'nibud' | 'buildYear';
  };
  
  // Monthly breakdown
  monthlySummary: MonthlySummary[];
  
  // Seasonal analysis
  winterCost: number;  // Dec, Jan, Feb
  summerCost: number;  // Jun, Jul, Aug
  
  // Price analysis
  cheapestMonth: { month: number; name: string; avgPrice: number };
  expensiveMonth: { month: number; name: string; avgPrice: number };
  
  // Meta
  period: { from: string; till: string };
  lastUpdated: string;
}

interface EnergyZeroPrice {
  readingDate: string;
  price: number;
}

interface EnergyZeroResponse {
  Prices: EnergyZeroPrice[];
  average: number;
}

// Current energy tax rates (2024/2025)
const ENERGY_TAX = 0.1316; // €/kWh including VAT
const SUPPLIER_MARKUP = 0.025; // €/kWh typical dynamic contract markup
const FIXED_PRICE = 0.28; // €/kWh typical fixed contract all-in price

const monthNames = [
  'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
  'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
];

export async function POST(request: Request) {
  try {
    const body: DynamicInsightRequest = await request.json();
    
    const {
      totalKwh,
      heatingType,
      buildYear,
      persons,
      fromDate,
      tillDate
    } = body;
    
    // Validate inputs
    if (!totalKwh || totalKwh < 500 || totalKwh > 50000) {
      return NextResponse.json(
        { error: 'Invalid totalKwh: must be between 500 and 50000' },
        { status: 400 }
      );
    }
    
    // Calculate profile mix
    const buildYearNum = getBuildYearFromRange(buildYear);
    
    // Adjust for heating type
    let adjustedKwh = totalKwh;
    if (heatingType === 'gas') {
      // Gas heating: only base electricity load
      adjustedKwh = Math.min(totalKwh, 4000); // Cap at typical base load
    }
    
    const profileMix = calculateProfileMix(adjustedKwh, buildYearNum, persons);
    
    // Determine date range (default: last 12 months)
    const till = tillDate ? new Date(tillDate) : new Date();
    const from = fromDate ? new Date(fromDate) : new Date(till.getTime() - 365 * 24 * 60 * 60 * 1000);
    
    // Fetch historical prices
    const apiUrl = `https://api.energyzero.nl/v1/energyprices?fromDate=${from.toISOString()}&tillDate=${till.toISOString()}&interval=4&usageType=1&inclBtw=true`;
    
    const priceResponse = await fetch(apiUrl, {
      next: { revalidate: 3600 }
    });
    
    if (!priceResponse.ok) {
      throw new Error(`Failed to fetch prices: ${priceResponse.status}`);
    }
    
    const priceData: EnergyZeroResponse = await priceResponse.json();
    
    // Group prices by month and hour
    const pricesByMonthHour = new Map<string, number[]>();
    
    for (const price of priceData.Prices) {
      const date = new Date(price.readingDate);
      const month = date.getMonth();
      const hour = date.getHours();
      const key = `${month}-${hour}`;
      
      if (!pricesByMonthHour.has(key)) {
        pricesByMonthHour.set(key, []);
      }
      pricesByMonthHour.get(key)!.push(price.price);
    }
    
    // Calculate average price for each month-hour combination
    const avgPriceByMonthHour = new Map<string, number>();
    for (const [key, prices] of pricesByMonthHour) {
      avgPriceByMonthHour.set(key, prices.reduce((a, b) => a + b, 0) / prices.length);
    }
    
    // Calculate costs using profile mix
    const monthlySummary: MonthlySummary[] = [];
    let totalCost = 0;
    let totalConsumption = 0;
    
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    
    // Calculate total fractions for normalization
    let totalBaseFraction = 0;
    let totalHeatingFraction = 0;
    
    for (let month = 0; month < 12; month++) {
      for (let hour = 0; hour < 24; hour++) {
        const fractions = getHourlyFraction(hour, month, profileMix, adjustedKwh);
        totalBaseFraction += fractions.baseFraction * daysInMonth[month];
        totalHeatingFraction += fractions.heatingFraction * daysInMonth[month];
      }
    }
    
    for (let month = 0; month < 12; month++) {
      let monthConsumption = 0;
      let monthCost = 0;
      let monthHeatingCost = 0;
      let monthBaseCost = 0;
      let monthPriceSum = 0;
      let monthHours = 0;
      
      for (let hour = 0; hour < 24; hour++) {
        const key = `${month}-${hour}`;
        const spotPrice = avgPriceByMonthHour.get(key) ?? 0.10;
        const allInPrice = spotPrice + SUPPLIER_MARKUP + ENERGY_TAX;
        
        // Get consumption for this hour
        const fractions = getHourlyFraction(hour, month, profileMix, adjustedKwh);
        
        // Calculate actual kWh for this hour (normalized)
        const baseConsumption = totalBaseFraction > 0 
          ? (fractions.baseFraction / totalBaseFraction) * profileMix.baseKwh * daysInMonth[month]
          : 0;
        const heatingConsumption = totalHeatingFraction > 0
          ? (fractions.heatingFraction / totalHeatingFraction) * profileMix.heatingKwh * daysInMonth[month]
          : 0;
        
        const hourConsumption = baseConsumption + heatingConsumption;
        const hourCost = hourConsumption * allInPrice;
        
        monthConsumption += hourConsumption;
        monthCost += hourCost;
        monthHeatingCost += heatingConsumption * allInPrice;
        monthBaseCost += baseConsumption * allInPrice;
        monthPriceSum += spotPrice;
        monthHours++;
      }
      
      monthlySummary.push({
        month,
        monthName: monthNames[month],
        totalConsumption: monthConsumption,
        averagePrice: monthPriceSum / monthHours,
        totalCost: monthCost,
        heatingCost: monthHeatingCost,
        baseCost: monthBaseCost,
      });
      
      totalCost += monthCost;
      totalConsumption += monthConsumption;
    }
    
    // Calculate seasonal costs
    const winterCost = monthlySummary
      .filter(m => [0, 1, 11].includes(m.month)) // Jan, Feb, Dec
      .reduce((sum, m) => sum + m.totalCost, 0);
    
    const summerCost = monthlySummary
      .filter(m => [5, 6, 7].includes(m.month)) // Jun, Jul, Aug
      .reduce((sum, m) => sum + m.totalCost, 0);
    
    // Find cheapest and most expensive months
    const sortedByPrice = [...monthlySummary].sort((a, b) => a.averagePrice - b.averagePrice);
    const cheapestMonth = sortedByPrice[0];
    const expensiveMonth = sortedByPrice[sortedByPrice.length - 1];
    
    // Compare with fixed contract
    const fixedContractCost = totalConsumption * FIXED_PRICE;
    const savings = fixedContractCost - totalCost;
    const savingsPercentage = (savings / fixedContractCost) * 100;
    
    const response: DynamicInsightResponse = {
      totalCost,
      totalConsumption,
      averagePrice: totalCost / totalConsumption - ENERGY_TAX - SUPPLIER_MARKUP,
      
      fixedContractCost,
      savings,
      savingsPercentage,
      
      profileMix,
      monthlySummary,
      
      winterCost,
      summerCost,
      
      cheapestMonth: {
        month: cheapestMonth.month,
        name: cheapestMonth.monthName,
        avgPrice: cheapestMonth.averagePrice,
      },
      expensiveMonth: {
        month: expensiveMonth.month,
        name: expensiveMonth.monthName,
        avgPrice: expensiveMonth.averagePrice,
      },
      
      period: {
        from: from.toISOString().split('T')[0],
        till: till.toISOString().split('T')[0],
      },
      lastUpdated: new Date().toISOString(),
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Dynamic insight calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

