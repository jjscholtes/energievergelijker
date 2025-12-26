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
  fixedContractCost: number;           // Vast met saldering (tot 2027)
  fixedContractCostNoNetMetering: number; // Vast zonder saldering (na 2027)
  savings: number;                     // vs vast met saldering
  savingsVsNoNetMetering: number;      // vs vast zonder saldering
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
  solarMonthlyBreakdown?: { month: number; production: number; selfConsumption: number; feedIn: number; savings: number; feedInRevenue: number }[];
  
  // EV (verbruik zit al in totaal, dit is de besparing door slim laden)
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

// Teruglevering marges
// Dynamisch: je krijgt spotprijs - kleine marge (vaak €0.01-0.02)
const DYNAMIC_FEED_IN_MARGIN = 0.015; // €/kWh afgetrokken van spotprijs

// Vast contract teruglevering:
// Veel leveranciers rekenen TERUGLEVERKOSTEN (€0.05-0.15/kWh) ipv een vergoeding!
// Sommigen geven een kleine vergoeding (€0.00-0.07/kWh)
// Netto effect: vaak NEGATIEF (je betaalt om terug te leveren)
// Bron: AD.nl, Keuze.nl vergelijking 2024/2025
const FIXED_FEED_IN_RATE = 0.04; // €/kWh - vergoeding (sommige leveranciers)
const FIXED_FEED_IN_COSTS = 0.09; // €/kWh - terugleverkosten (veel leveranciers)
// Netto: €0.04 - €0.09 = -€0.05/kWh (je BETAALT per teruggeleverde kWh!)

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
    
    // Monthly heating factors (relative, sums to ~5.63)
    const monthlyHeatingFactors = [1.00, 0.90, 0.70, 0.45, 0.20, 0.08, 0.05, 0.05, 0.15, 0.40, 0.70, 0.95];
    const heatingFactorSum = monthlyHeatingFactors.reduce((a, b) => a + b, 0);
    
    // Base load is relatively stable (normalized to ~11.37)
    const monthlyBaseFactors = [0.95, 0.92, 0.90, 0.88, 0.90, 0.95, 1.00, 1.00, 0.95, 0.92, 0.95, 1.05];
    const baseFactorSum = monthlyBaseFactors.reduce((a, b) => a + b, 0);
    
    // Hourly profiles (E1A for base, G1A for heating) - normalized to sum to 1.0
    const hourlyE1A = [0.020, 0.018, 0.016, 0.015, 0.015, 0.018, 0.030, 0.050, 0.055, 0.048, 0.042, 0.040, 0.045, 0.042, 0.040, 0.042, 0.048, 0.065, 0.075, 0.072, 0.065, 0.055, 0.042, 0.032];
    const hourlyG1A = [0.015, 0.012, 0.010, 0.010, 0.012, 0.025, 0.065, 0.075, 0.068, 0.055, 0.048, 0.045, 0.042, 0.040, 0.042, 0.048, 0.058, 0.068, 0.072, 0.065, 0.055, 0.045, 0.035, 0.025];
    const e1aSum = hourlyE1A.reduce((a, b) => a + b, 0);
    const g1aSum = hourlyG1A.reduce((a, b) => a + b, 0);
    
    for (let month = 0; month < 12; month++) {
      let monthConsumption = 0;
      let monthCost = 0;
      let monthHeatingCost = 0;
      let monthBaseCost = 0;
      let monthPriceSum = 0;
      
      // Monthly share of yearly consumption
      const baseMonthShare = (monthlyBaseFactors[month] / baseFactorSum);
      const heatingMonthShare = (monthlyHeatingFactors[month] / heatingFactorSum);
      
      // kWh for this month
      const baseKwhThisMonth = profileMix.baseKwh * baseMonthShare;
      const heatingKwhThisMonth = profileMix.heatingKwh * heatingMonthShare;
      
      for (let hour = 0; hour < 24; hour++) {
        const key = `${month}-${hour}`;
        const spotPrice = avgPriceByMonthHour.get(key) ?? 0.10;
        const allInPrice = spotPrice + SUPPLIER_MARKUP + ENERGY_TAX;
        
        // Hourly share within this month
        const baseHourShare = hourlyE1A[hour] / e1aSum;
        const heatingHourShare = hourlyG1A[hour] / g1aSum;
        
        // kWh for this hour (spread over all days in month)
        const baseConsumption = baseKwhThisMonth * baseHourShare;
        const heatingConsumption = heatingKwhThisMonth * heatingHourShare;
        
        const hourConsumption = baseConsumption + heatingConsumption;
        const hourCost = hourConsumption * allInPrice;
        
        monthConsumption += hourConsumption;
        monthCost += hourCost;
        monthHeatingCost += heatingConsumption * allInPrice;
        monthBaseCost += baseConsumption * allInPrice;
        monthPriceSum += spotPrice;
      }
      
      monthlySummary.push({
        month,
        monthName: monthNames[month],
        totalConsumption: monthConsumption,
        averagePrice: monthPriceSum / 24,
        totalCost: monthCost,
        heatingCost: monthHeatingCost,
        baseCost: monthBaseCost,
      });
      
      totalCost += monthCost;
      totalConsumption += monthConsumption;
    }
    
    // Debug: log if consumption doesn't match
    if (Math.abs(totalConsumption - adjustedKwh) > 1) {
      console.warn(`Consumption mismatch: expected ${adjustedKwh}, got ${totalConsumption}`);
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
    // Scenario 1: Met saldering (tot 2027) - je betaalt alleen netto afname
    let fixedContractCost = totalConsumption * FIXED_PRICE;
    // Scenario 2: Zonder saldering (na 2027) - je betaalt alles, krijgt lage vergoeding terug
    let fixedContractCostNoNetMetering = totalConsumption * FIXED_PRICE;
    
    // ===== ZONNEPANELEN BEREKENING =====
    let solarSavings = 0;
    let solarSelfConsumption = 0;
    let solarFeedIn = 0;
    let feedInRevenue = 0;
    
    // Maandelijkse solar breakdown voor resultaten
    const solarMonthlyBreakdown: { month: number; production: number; selfConsumption: number; feedIn: number; savings: number; feedInRevenue: number }[] = [];
    
    if (hasSolar && solarProduction > 0) {
      // Totale eigenverbruik en teruglevering (voor samenvatting)
      solarSelfConsumption = solarProduction * (selfConsumptionPercentage / 100);
      solarFeedIn = solarProduction - solarSelfConsumption;
      
      // Bereken per maand en per uur
      for (let month = 0; month < 12; month++) {
        const monthlyProduction = solarProduction * SOLAR_MONTHLY_PROFILE[month];
        const monthlyDays = daysInMonth[month];
        
        let monthSelfConsumptionSavings = 0;
        let monthFeedInRevenue = 0;
        let monthSelfConsumptionKwh = 0;
        let monthFeedInKwh = 0;
        
        for (let hour = 0; hour < 24; hour++) {
          // Productie dit uur (kWh voor de hele maand)
          const hourlyProductionPerDay = (monthlyProduction / monthlyDays) * SOLAR_HOURLY_PROFILE[hour];
          const hourlyProductionMonth = hourlyProductionPerDay * monthlyDays;
          
          // Eigenverbruik dit uur
          const hourSelfConsumption = hourlyProductionMonth * (selfConsumptionPercentage / 100);
          monthSelfConsumptionKwh += hourSelfConsumption;
          
          // Teruglevering dit uur
          const hourFeedIn = hourlyProductionMonth * ((100 - selfConsumptionPercentage) / 100);
          monthFeedInKwh += hourFeedIn;
          
          // Prijs voor dit uur in deze maand
          const key = `${month}-${hour}`;
          const spotPrice = avgPriceByMonthHour.get(key) ?? 0.10;
          
          // Eigenverbruik bespaart: spotprijs + opslag + energiebelasting (hele all-in prijs)
          const allInPrice = spotPrice + SUPPLIER_MARKUP + ENERGY_TAX;
          monthSelfConsumptionSavings += hourSelfConsumption * allInPrice;
          
          // Teruglevering bij DYNAMISCH: je krijgt spotprijs minus kleine marge
          // Dit is vaak HOGER dan de vaste terugleververgoeding, vooral overdag!
          // Bij negatieve spotprijs moet je soms betalen, maar meeste leveranciers kappen af op €0
          const dynamicFeedInPrice = Math.max(0, spotPrice - DYNAMIC_FEED_IN_MARGIN);
          monthFeedInRevenue += hourFeedIn * dynamicFeedInPrice;
        }
        
        // Update maandelijkse kosten met zonnepanelen impact
        monthlySummary[month].totalCost -= monthSelfConsumptionSavings;
        monthlySummary[month].totalCost -= monthFeedInRevenue;
        
        solarSavings += monthSelfConsumptionSavings;
        feedInRevenue += monthFeedInRevenue;
        
        solarMonthlyBreakdown.push({
          month,
          production: monthlyProduction,
          selfConsumption: monthSelfConsumptionKwh,
          feedIn: monthFeedInKwh,
          savings: monthSelfConsumptionSavings,
          feedInRevenue: monthFeedInRevenue,
        });
      }
      
      // Pas totale kosten aan
      totalCost -= solarSavings;
      totalCost -= feedInRevenue;
      
      // ===== VAST CONTRACT SCENARIO'S =====
      
      // Scenario 1: Met saldering (tot 2027)
      // Je betaalt alleen voor netto afname (afname minus teruglevering)
      const nettoAfname = Math.max(0, adjustedKwh - solarProduction);
      fixedContractCost = nettoAfname * FIXED_PRICE;
      
      // Scenario 2: Zonder saldering (na 2027 / of nu bij leverancier zonder saldering)
      // Je betaalt voor ALLE afname, en vaak TERUGLEVERKOSTEN voor wat je teruglevert!
      // Eigenverbruik bespaart wel de volle prijs
      const fixedSelfConsumptionSavings = solarSelfConsumption * FIXED_PRICE;
      
      // Netto terugleveropbrengst: vergoeding MINUS terugleverkosten
      // Veel leveranciers: €0.04 vergoeding - €0.09 kosten = -€0.05/kWh (je BETAALT!)
      const netFixedFeedInRate = FIXED_FEED_IN_RATE - FIXED_FEED_IN_COSTS; // Kan negatief zijn!
      const fixedFeedInRevenue = solarFeedIn * netFixedFeedInRate;
      
      fixedContractCostNoNetMetering = (adjustedKwh * FIXED_PRICE) - fixedSelfConsumptionSavings - fixedFeedInRevenue;
    }
    
    // Herbereken seizoenskosten NA zonnepanelen correctie
    const winterCostAfterSolar = monthlySummary
      .filter(m => [0, 1, 11].includes(m.month))
      .reduce((sum, m) => sum + m.totalCost, 0);
    
    const summerCostAfterSolar = monthlySummary
      .filter(m => [5, 6, 7].includes(m.month))
      .reduce((sum, m) => sum + m.totalCost, 0);
    
    // ===== EV BEREKENING =====
    // Het EV-verbruik zit AL in het totale verbruik (adjustedKwh)
    // De evKwhPerYear is een UITSPLITSING die aangeeft welk deel flexibel geladen kan worden
    // We berekenen de BESPARING door slim laden vs normaal laden
    let evSmartChargingSavings = 0;
    
    if (hasEV && evKwhPerYear > 0 && smartCharging) {
      const evKwhPerMonth = evKwhPerYear / 12;
      
      for (let month = 0; month < 12; month++) {
        // Vind alle uurprijzen voor deze maand
        const hourPrices: { hour: number; price: number }[] = [];
        for (let hour = 0; hour < 24; hour++) {
          const key = `${month}-${hour}`;
          const spotPrice = avgPriceByMonthHour.get(key) ?? 0.10;
          hourPrices.push({ hour, price: spotPrice });
        }
        
        // Gemiddelde prijs (zonder slim laden)
        const avgMonthPrice = hourPrices.reduce((sum, h) => sum + h.price, 0) / 24;
        
        // Goedkoopste 6 uren (met slim laden)
        hourPrices.sort((a, b) => a.price - b.price);
        const cheapestHours = hourPrices.slice(0, 6);
        const avgCheapPrice = cheapestHours.reduce((sum, h) => sum + h.price, 0) / 6;
        
        // Besparing door slim laden (verschil in spotprijs, opslag en belasting zijn gelijk)
        const priceDifference = avgMonthPrice - avgCheapPrice;
        evSmartChargingSavings += evKwhPerMonth * priceDifference;
      }
      
      // Trek de slim laden besparing af van de totale kosten
      // (het EV-verbruik zat al in de normale berekening tegen gemiddelde prijs)
      totalCost -= evSmartChargingSavings;
    }
    
    // Geen aanpassing aan fixedContractCost - EV zit al in het totaal
    
    // Bereken besparingen voor beide scenario's
    const savings = fixedContractCost - totalCost;
    const savingsPercentage = fixedContractCost > 0 ? (savings / fixedContractCost) * 100 : 0;
    const savingsVsNoNetMetering = fixedContractCostNoNetMetering - totalCost;
    
    const response: DynamicInsightResponse = {
      totalCost,
      totalConsumption,
      averagePrice: totalCost / totalConsumption - ENERGY_TAX - SUPPLIER_MARKUP,
      
      fixedContractCost,
      fixedContractCostNoNetMetering,
      savings,
      savingsVsNoNetMetering,
      savingsPercentage,
      
      profileMix,
      monthlySummary,
      
      winterCost: hasSolar ? winterCostAfterSolar : winterCost,
      summerCost: hasSolar ? summerCostAfterSolar : summerCost,
      
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
        solarMonthlyBreakdown,
      } : {}),
      
      // EV (verbruik zit al in totaal, alleen besparing door slim laden tonen)
      ...(hasEV && evKwhPerYear > 0 && smartCharging ? {
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

