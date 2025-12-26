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
  // Zonnepanelen
  hasSolar?: boolean;
  solarProduction?: number;
  selfConsumptionPercentage?: number;
  // Elektrische Auto
  hasEV?: boolean;
  evKwhPerYear?: number;
  smartCharging?: boolean;
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
  
  // Zonnepanelen
  solarSavings?: number;
  solarSelfConsumption?: number;
  solarFeedIn?: number;
  feedInRevenue?: number;
  
  // EV
  evCost?: number;
  evSmartChargingSavings?: number;
  
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
const FEED_IN_MARKUP = 0.02; // €/kWh supplier margin on feed-in

// Solar production profile by month (relative, sums to ~1.0)
const SOLAR_MONTHLY_PROFILE = [
  0.03, // Jan
  0.05, // Feb
  0.08, // Mar
  0.11, // Apr
  0.13, // May
  0.14, // Jun
  0.14, // Jul
  0.12, // Aug
  0.09, // Sep
  0.06, // Oct
  0.03, // Nov
  0.02, // Dec
];

// Solar hourly production profile (relative to daily production)
const SOLAR_HOURLY_PROFILE = [
  0, 0, 0, 0, 0, 0.01, // 0-5
  0.03, 0.06, 0.09, 0.11, 0.13, 0.14, // 6-11
  0.14, 0.13, 0.11, 0.09, 0.06, 0.03, // 12-17
  0.01, 0, 0, 0, 0, 0 // 18-23
];

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
      tillDate,
      // Zonnepanelen
      hasSolar,
      solarProduction = 0,
      selfConsumptionPercentage = 30,
      // EV
      hasEV,
      evKwhPerYear = 0,
      smartCharging = true,
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
    let fixedContractCost = totalConsumption * FIXED_PRICE;
    
    // ===== ZONNEPANELEN BEREKENING =====
    let solarSavings = 0;
    let solarSelfConsumption = 0;
    let solarFeedIn = 0;
    let feedInRevenue = 0;
    
    if (hasSolar && solarProduction > 0) {
      // Bereken maandelijkse productie en eigenverbruik
      solarSelfConsumption = solarProduction * (selfConsumptionPercentage / 100);
      solarFeedIn = solarProduction - solarSelfConsumption;
      
      // Bereken besparingen per maand/uur
      let monthlyFeedInRevenue = 0;
      let monthlySelfConsumptionSavings = 0;
      
      for (let month = 0; month < 12; month++) {
        const monthlyProduction = solarProduction * SOLAR_MONTHLY_PROFILE[month];
        const monthlyDays = daysInMonth[month];
        const dailyProduction = monthlyProduction / monthlyDays;
        
        for (let hour = 0; hour < 24; hour++) {
          const hourlyProduction = dailyProduction * SOLAR_HOURLY_PROFILE[hour];
          const key = `${month}-${hour}`;
          const spotPrice = avgPriceByMonthHour.get(key) ?? 0.10;
          
          // Eigenverbruik bespaart alle-in prijs
          const hourSelfConsumption = hourlyProduction * (selfConsumptionPercentage / 100) * monthlyDays;
          const allInPrice = spotPrice + SUPPLIER_MARKUP + ENERGY_TAX;
          monthlySelfConsumptionSavings += hourSelfConsumption * allInPrice;
          
          // Teruglevering: spotprijs minus marge (kan negatief zijn!)
          const hourFeedIn = hourlyProduction * ((100 - selfConsumptionPercentage) / 100) * monthlyDays;
          const feedInPrice = Math.max(0, spotPrice - FEED_IN_MARKUP); // Minimaal €0
          monthlyFeedInRevenue += hourFeedIn * feedInPrice;
        }
      }
      
      solarSavings = monthlySelfConsumptionSavings;
      feedInRevenue = monthlyFeedInRevenue;
      
      // Pas totale kosten aan
      totalCost -= solarSavings;
      totalCost -= feedInRevenue;
      
      // Fixed contract vergelijking: hier zou saldering gelden (nog wel tot 2027)
      const saldeerPrijs = FIXED_PRICE; // Bij vast contract krijg je zelfde prijs terug
      fixedContractCost -= solarProduction * saldeerPrijs * 0.9; // 90% effectief door timing
    }
    
    // ===== EV BEREKENING =====
    let evCost = 0;
    let evSmartChargingSavings = 0;
    
    if (hasEV && evKwhPerYear > 0) {
      // Bereken EV kosten per maand
      const evKwhPerMonth = evKwhPerYear / 12;
      
      if (smartCharging) {
        // Slim laden: laad in de 6 goedkoopste uren per dag
        for (let month = 0; month < 12; month++) {
          // Vind de 6 goedkoopste uren per maand
          const hourPrices: { hour: number; price: number }[] = [];
          for (let hour = 0; hour < 24; hour++) {
            const key = `${month}-${hour}`;
            const spotPrice = avgPriceByMonthHour.get(key) ?? 0.10;
            hourPrices.push({ hour, price: spotPrice });
          }
          hourPrices.sort((a, b) => a.price - b.price);
          const cheapestHours = hourPrices.slice(0, 6);
          
          // Bereken kosten voor slim laden (verspreid over 6 goedkoopste uren)
          const avgCheapPrice = cheapestHours.reduce((sum, h) => sum + h.price, 0) / 6;
          const allInCheapPrice = avgCheapPrice + SUPPLIER_MARKUP + ENERGY_TAX;
          evCost += evKwhPerMonth * allInCheapPrice;
          
          // Bereken wat het zou kosten zonder slim laden (gemiddelde prijs)
          const avgMonthPrice = hourPrices.reduce((sum, h) => sum + h.price, 0) / 24;
          const allInAvgPrice = avgMonthPrice + SUPPLIER_MARKUP + ENERGY_TAX;
          evSmartChargingSavings += evKwhPerMonth * (allInAvgPrice - allInCheapPrice);
        }
      } else {
        // Normaal laden: gemiddelde prijs
        for (let month = 0; month < 12; month++) {
          let monthPriceSum = 0;
          for (let hour = 0; hour < 24; hour++) {
            const key = `${month}-${hour}`;
            const spotPrice = avgPriceByMonthHour.get(key) ?? 0.10;
            monthPriceSum += spotPrice;
          }
          const avgMonthPrice = monthPriceSum / 24;
          const allInPrice = avgMonthPrice + SUPPLIER_MARKUP + ENERGY_TAX;
          evCost += evKwhPerMonth * allInPrice;
        }
      }
      
      // Voeg EV kosten toe aan totaal
      totalCost += evCost;
      totalConsumption += evKwhPerYear;
      
      // Fixed contract: EV tegen vaste prijs
      fixedContractCost += evKwhPerYear * FIXED_PRICE;
    }
    
    const savings = fixedContractCost - totalCost;
    const savingsPercentage = fixedContractCost > 0 ? (savings / fixedContractCost) * 100 : 0;
    
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
      
      // Zonnepanelen
      ...(hasSolar && solarProduction > 0 ? {
        solarSavings,
        solarSelfConsumption,
        solarFeedIn,
        feedInRevenue,
      } : {}),
      
      // EV
      ...(hasEV && evKwhPerYear > 0 ? {
        evCost,
        evSmartChargingSavings,
      } : {}),
      
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

