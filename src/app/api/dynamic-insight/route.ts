import { NextResponse } from 'next/server';
import {
  calculateProfileMix,
  getBuildYearFromRange,
  BuildYearRange,
  HeatingType,
} from '@/lib/data/neduProfiles';
import { ENERGY_CONSTANTS } from '@/lib/constants';

// ============================================================================
// INTERFACES
// ============================================================================

export type NetbeheerderType = 'Liander' | 'Stedin' | 'Enexis';

export interface DynamicInsightRequest {
  totalKwh: number;
  heatingType: HeatingType;
  buildYear: BuildYearRange;
  persons?: number;
  fromDate?: string;
  tillDate?: string;
  // Netbeheerder
  netbeheerder?: NetbeheerderType;
  // Zonnepanelen
  hasSolar?: boolean;
  solarProduction?: number;
  selfConsumptionPercentage?: number; // Alleen voor weergave, we berekenen het per uur
  // Elektrische Auto
  hasEV?: boolean;
  evKwhPerYear?: number;
  smartCharging?: boolean;
}

export interface CostBreakdown {
  base: { kwh: number; cost: number };
  heating: { kwh: number; cost: number };
  ev: { kwh: number; cost: number; smartSavings: number };
  solar: { 
    production: number; 
    selfConsumption: number; 
    selfConsumptionSavings: number;
    feedIn: number; 
    feedInRevenue: number;
  };
}

export interface MonthlySummary {
  month: number;
  monthName: string;
  consumption: number;
  production: number;
  selfConsumption: number;
  feedIn: number;
  gridConsumption: number;
  averageSpotPrice: number;
  cost: number;
}

export interface DynamicInsightResponse {
  // Breakdown per component
  breakdown: CostBreakdown;
  
  // Variabele kosten
  consumptionCost: number;
  feedInRevenue: number;
  
  // Vaste kosten
  gridCosts: number;
  supplierFixedCosts: number;
  energyTaxReduction: number;
  
  // Netbeheerder info
  netbeheerder: string;
  
  // Totalen (met vaste kosten)
  totalCostDynamic: number;
  totalCostFixed: number;
  totalCostFixedNoSaldering: number;
  
  // Besparing
  savingsVsFixed: number;
  savingsVsFixedNoSaldering: number;
  savingsPercentage: number;
  
  // Maandelijkse breakdown
  monthlySummary: MonthlySummary[];
  
  // Seizoensanalyse
  winterCost: number;
  summerCost: number;
  
  // Prijsanalyse
  cheapestMonth: { month: number; name: string; avgPrice: number };
  expensiveMonth: { month: number; name: string; avgPrice: number };
  
  // Profiel info
  profileMix: {
    baseKwh: number;
    heatingKwh: number;
    evKwh: number;
    method: 'nibud' | 'buildYear';
  };
  
  // Berekend eigenverbruik percentage
  calculatedSelfConsumptionPercentage: number;
  
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

// ============================================================================
// CONSTANTEN - Tarieven 2025 (consistent met energyCalculator)
// ============================================================================

// Variabele kosten per kWh
const ENERGY_TAX = ENERGY_CONSTANTS.ENERGY_TAX_STROOM_PER_KWH; // €0.1316/kWh incl. BTW
const SUPPLIER_MARKUP = ENERGY_CONSTANTS.DEFAULT_DYNAMISCH_CONTRACT.OPSLAG_PER_KWH; // €0.025/kWh
const FIXED_PRICE_KWH = 0.28; // Typische vaste all-in kWh prijs

// Vaste jaarkosten
const ENERGY_TAX_REDUCTION = ENERGY_CONSTANTS.ENERGY_TAX_REDUCTION; // €631.35/jaar
const SUPPLIER_FIXED_COSTS = ENERGY_CONSTANTS.DEFAULT_DYNAMISCH_CONTRACT.VASTE_LEVERINGSKOSTEN * 12; // €7 * 12 = €84/jaar

// Netbeheerkosten per netbeheerder (actuele tarieven 2025)
const GRID_COSTS_BY_NETBEHEERDER: Record<NetbeheerderType, number> = {
  Liander: ENERGY_CONSTANTS.NETBEHEERDER_COSTS.LIANDER.stroom, // €471/jaar
  Stedin: ENERGY_CONSTANTS.NETBEHEERDER_COSTS.STEDIN.stroom,   // €490/jaar
  Enexis: ENERGY_CONSTANTS.NETBEHEERDER_COSTS.ENEXIS.stroom,   // €492/jaar
};

// Teruglevering - Dynamisch contract
const DYNAMIC_FEED_IN_MARGIN = ENERGY_CONSTANTS.DEFAULT_DYNAMISCH_CONTRACT.OPSLAG_INVOEDING; // €0.023/kWh

// Teruglevering - Vast contract
const FIXED_FEED_IN_RATE = ENERGY_CONSTANTS.DEFAULT_VAST_CONTRACT.TERUGLEVERVERGOEDING; // €0.01/kWh
const FIXED_FEED_IN_COSTS = 0.09; // Terugleverkosten bij vast contract (veel leveranciers)
// Netto: €0.01 - €0.09 = -€0.08/kWh (je BETAALT!)

// ============================================================================
// PROFIELEN
// ============================================================================

// Maandelijkse verwarmingsfactoren (relatief, hoogste in winter)
const MONTHLY_HEATING_FACTORS = [1.00, 0.90, 0.70, 0.45, 0.20, 0.08, 0.05, 0.05, 0.15, 0.40, 0.70, 0.95];
const HEATING_FACTOR_SUM = MONTHLY_HEATING_FACTORS.reduce((a, b) => a + b, 0);

// Maandelijkse basisfactoren (relatief stabiel)
const MONTHLY_BASE_FACTORS = [0.95, 0.92, 0.90, 0.88, 0.90, 0.95, 1.00, 1.00, 0.95, 0.92, 0.95, 1.05];
const BASE_FACTOR_SUM = MONTHLY_BASE_FACTORS.reduce((a, b) => a + b, 0);

// Uurprofiel E1A (basis - verlichting, apparaten)
const HOURLY_E1A = [0.020, 0.018, 0.016, 0.015, 0.015, 0.018, 0.030, 0.050, 0.055, 0.048, 0.042, 0.040, 0.045, 0.042, 0.040, 0.042, 0.048, 0.065, 0.075, 0.072, 0.065, 0.055, 0.042, 0.032];
const E1A_SUM = HOURLY_E1A.reduce((a, b) => a + b, 0);

// Uurprofiel G1A (verwarming - volgt buitentemperatuur)
const HOURLY_G1A = [0.015, 0.012, 0.010, 0.010, 0.012, 0.025, 0.065, 0.075, 0.068, 0.055, 0.048, 0.045, 0.042, 0.040, 0.042, 0.048, 0.058, 0.068, 0.072, 0.065, 0.055, 0.045, 0.035, 0.025];
const G1A_SUM = HOURLY_G1A.reduce((a, b) => a + b, 0);

// EV laadprofiel - Slim laden (nachturen 0-6)
const HOURLY_EV_SMART = [0.18, 0.18, 0.18, 0.18, 0.16, 0.12, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00];
// EV laadprofiel - Normaal laden (avonduren 18-23)
const HOURLY_EV_NORMAL = [0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.05, 0.20, 0.25, 0.25, 0.15, 0.10, 0.00];

// Zonnepanelen maandprofiel (relatief, som = 1.0)
const SOLAR_MONTHLY_PROFILE = [0.03, 0.05, 0.08, 0.11, 0.13, 0.14, 0.14, 0.12, 0.09, 0.06, 0.03, 0.02];

// Zonnepanelen uurprofiel (relatief t.o.v. dagproductie)
const SOLAR_HOURLY_PROFILE = [0, 0, 0, 0, 0, 0.01, 0.03, 0.06, 0.09, 0.11, 0.13, 0.14, 0.14, 0.13, 0.11, 0.09, 0.06, 0.03, 0.01, 0, 0, 0, 0, 0];
const SOLAR_HOURLY_SUM = SOLAR_HOURLY_PROFILE.reduce((a, b) => a + b, 0);

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const MONTH_NAMES = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'];

// ============================================================================
// MAIN API HANDLER
// ============================================================================

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
      netbeheerder = 'Liander',
      hasSolar = false,
      solarProduction = 0,
      hasEV = false,
      evKwhPerYear = 0,
      smartCharging = true,
    } = body;
    
    // Bepaal netbeheerkosten op basis van selectie
    const gridCosts = GRID_COSTS_BY_NETBEHEERDER[netbeheerder] || GRID_COSTS_BY_NETBEHEERDER.Liander;
    
    // ========================================================================
    // VALIDATIE
    // ========================================================================
    
    if (!totalKwh || totalKwh < 500 || totalKwh > 50000) {
      return NextResponse.json(
        { error: 'Invalid totalKwh: must be between 500 and 50000' },
        { status: 400 }
      );
    }
    
    // ========================================================================
    // STAP 1: PROFIEL BEREKENING - EV EERST AFTREKKEN!
    // ========================================================================
    
    // EV-verbruik is ONDERDEEL van totaal, maar heeft eigen profiel
    // Dus eerst aftrekken voor huishoudelijke profiel-mix
    const evKwh = hasEV ? Math.min(evKwhPerYear, totalKwh * 0.5) : 0; // Max 50% van totaal
    const householdKwh = totalKwh - evKwh;
    
    // Bereken profiel alleen voor huishoudelijk verbruik (basis + verwarming)
    const buildYearNum = getBuildYearFromRange(buildYear);
    
    // Bij gas verwarming: geen warmtepomp verbruik
    let adjustedHouseholdKwh = householdKwh;
    if (heatingType === 'gas') {
      adjustedHouseholdKwh = Math.min(householdKwh, 4000);
    }
    
    const profileMixRaw = calculateProfileMix(adjustedHouseholdKwh, buildYearNum, persons);
    
    // Zorg dat basis + verwarming = huishoudelijk
    const profileMix = {
      baseKwh: profileMixRaw.baseKwh,
      heatingKwh: heatingType === 'gas' ? 0 : profileMixRaw.heatingKwh,
      evKwh: evKwh,
      method: profileMixRaw.method,
    };
    
    // Herbereken voor gas: alles is basis
    if (heatingType === 'gas') {
      profileMix.baseKwh = adjustedHouseholdKwh;
      profileMix.heatingKwh = 0;
    }
    
    // ========================================================================
    // STAP 2: HISTORISCHE PRIJZEN OPHALEN
    // ========================================================================
    
    const till = tillDate ? new Date(tillDate) : new Date();
    const from = fromDate ? new Date(fromDate) : new Date(till.getTime() - 365 * 24 * 60 * 60 * 1000);
    
    const apiUrl = `https://api.energyzero.nl/v1/energyprices?fromDate=${from.toISOString()}&tillDate=${till.toISOString()}&interval=4&usageType=1&inclBtw=true`;
    
    const priceResponse = await fetch(apiUrl, { next: { revalidate: 3600 } });
    
    if (!priceResponse.ok) {
      throw new Error(`Failed to fetch prices: ${priceResponse.status}`);
    }
    
    const priceData: EnergyZeroResponse = await priceResponse.json();
    
    // Groepeer prijzen per maand-uur
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
    
    // Bereken gemiddelde prijs per maand-uur
    const avgPriceByMonthHour = new Map<string, number>();
    for (const [key, prices] of pricesByMonthHour) {
      avgPriceByMonthHour.set(key, prices.reduce((a, b) => a + b, 0) / prices.length);
    }
    
    // ========================================================================
    // STAP 3: VERBRUIK EN KOSTEN BEREKENEN PER UUR
    // ========================================================================
    
    const monthlySummary: MonthlySummary[] = [];
    
    // Totalen voor breakdown
    let totalBaseCost = 0;
    let totalBaseKwh = 0;
    let totalHeatingCost = 0;
    let totalHeatingKwh = 0;
    let totalEvCost = 0;
    let totalEvKwh = 0;
    let totalEvSmartSavings = 0;
    let totalSolarProduction = 0;
    let totalSelfConsumption = 0;
    let totalSelfConsumptionSavings = 0;
    let totalFeedIn = 0;
    let totalFeedInRevenue = 0;
    let totalConsumptionCost = 0;
    
    for (let month = 0; month < 12; month++) {
      const days = DAYS_IN_MONTH[month];
      
      // Maandelijkse fracties
      const baseMonthFraction = MONTHLY_BASE_FACTORS[month] / BASE_FACTOR_SUM;
      const heatingMonthFraction = MONTHLY_HEATING_FACTORS[month] / HEATING_FACTOR_SUM;
      
      // kWh voor deze maand
      const baseKwhMonth = profileMix.baseKwh * baseMonthFraction;
      const heatingKwhMonth = profileMix.heatingKwh * heatingMonthFraction;
      const evKwhMonth = profileMix.evKwh / 12; // EV is gelijkmatig verdeeld
      const solarKwhMonth = hasSolar ? solarProduction * SOLAR_MONTHLY_PROFILE[month] : 0;
      
      let monthConsumption = 0;
      let monthProduction = 0;
      let monthSelfConsumption = 0;
      let monthFeedIn = 0;
      let monthGridConsumption = 0;
      let monthCost = 0;
      let monthPriceSum = 0;
      let monthEvNormalCost = 0; // Kosten zonder slim laden (voor besparing berekening)
      
      for (let hour = 0; hour < 24; hour++) {
        const key = `${month}-${hour}`;
        const spotPrice = avgPriceByMonthHour.get(key) ?? 0.10;
        const allInPrice = spotPrice + SUPPLIER_MARKUP + ENERGY_TAX;
        
        // ====== VERBRUIK PER COMPONENT ======
        
        // Basis verbruik dit uur
        const baseHourFraction = HOURLY_E1A[hour] / E1A_SUM;
        const baseKwhHour = baseKwhMonth * baseHourFraction;
        
        // Verwarming dit uur
        const heatingHourFraction = HOURLY_G1A[hour] / G1A_SUM;
        const heatingKwhHour = heatingKwhMonth * heatingHourFraction;
        
        // EV dit uur (afhankelijk van slim laden)
        const evProfile = smartCharging ? HOURLY_EV_SMART : HOURLY_EV_NORMAL;
        const evKwhHour = evKwhMonth * evProfile[hour];
        
        // Totaal verbruik dit uur
        const totalKwhHour = baseKwhHour + heatingKwhHour + evKwhHour;
        
        // ====== ZONNEPANELEN - GELIJKTIJDIGHEID ======
        
        let solarKwhHour = 0;
        let selfConsumptionHour = 0;
        let feedInHour = 0;
        let gridConsumptionHour = totalKwhHour;
        let selfConsumptionSavingsHour = 0;
        let feedInRevenueHour = 0;
        
        if (hasSolar && solarProduction > 0) {
          // Productie dit uur
          solarKwhHour = solarKwhMonth * (SOLAR_HOURLY_PROFILE[hour] / SOLAR_HOURLY_SUM);
          
          // Gelijktijdigheidsberekening: eigenverbruik = min(productie, verbruik)
          selfConsumptionHour = Math.min(solarKwhHour, totalKwhHour);
          feedInHour = solarKwhHour - selfConsumptionHour;
          gridConsumptionHour = totalKwhHour - selfConsumptionHour;
          
          // Besparing eigenverbruik: bespaart de hele all-in prijs
          selfConsumptionSavingsHour = selfConsumptionHour * allInPrice;
          
          // Teruglevering opbrengst: spotprijs minus marge
          const feedInPrice = Math.max(0, spotPrice - DYNAMIC_FEED_IN_MARGIN);
          feedInRevenueHour = feedInHour * feedInPrice;
          
          monthProduction += solarKwhHour;
          monthSelfConsumption += selfConsumptionHour;
          monthFeedIn += feedInHour;
          totalSolarProduction += solarKwhHour;
          totalSelfConsumption += selfConsumptionHour;
          totalSelfConsumptionSavings += selfConsumptionSavingsHour;
          totalFeedIn += feedInHour;
          totalFeedInRevenue += feedInRevenueHour;
        }
        
        // ====== KOSTEN BEREKENEN ======
        
        // Kosten voor wat we van het net afnemen
        const gridCostHour = gridConsumptionHour * allInPrice;
        
        // Netto kosten dit uur = grid kosten - teruglevering opbrengst
        const netCostHour = gridCostHour - feedInRevenueHour;
        
        monthConsumption += totalKwhHour;
        monthGridConsumption += gridConsumptionHour;
        monthCost += netCostHour;
        monthPriceSum += spotPrice;
        
        // Breakdown per component (voor totalen)
        totalBaseKwh += baseKwhHour;
        totalBaseCost += baseKwhHour * allInPrice;
        totalHeatingKwh += heatingKwhHour;
        totalHeatingCost += heatingKwhHour * allInPrice;
        totalEvKwh += evKwhHour;
        totalEvCost += evKwhHour * allInPrice;
        
        // EV: bereken ook kosten zonder slim laden voor besparing
        if (hasEV && evKwh > 0) {
          const evNormalKwhHour = evKwhMonth * HOURLY_EV_NORMAL[hour];
          monthEvNormalCost += evNormalKwhHour * allInPrice;
        }
      }
      
      // EV slim laden besparing deze maand
      if (hasEV && evKwh > 0 && smartCharging) {
        const evSmartCostMonth = evKwhMonth * (monthCost / monthConsumption); // Approx
        // Bereken werkelijke besparing door prijsverschil
        const avgSmartPrice = (() => {
          let totalPrice = 0;
          let totalWeight = 0;
          for (let hour = 0; hour < 24; hour++) {
            const key = `${month}-${hour}`;
            const spotPrice = avgPriceByMonthHour.get(key) ?? 0.10;
            const weight = HOURLY_EV_SMART[hour];
            totalPrice += spotPrice * weight;
            totalWeight += weight;
          }
          return totalWeight > 0 ? totalPrice / totalWeight : 0.10;
        })();
        const avgNormalPrice = (() => {
          let totalPrice = 0;
          let totalWeight = 0;
          for (let hour = 0; hour < 24; hour++) {
            const key = `${month}-${hour}`;
            const spotPrice = avgPriceByMonthHour.get(key) ?? 0.10;
            const weight = HOURLY_EV_NORMAL[hour];
            totalPrice += spotPrice * weight;
            totalWeight += weight;
          }
          return totalWeight > 0 ? totalPrice / totalWeight : 0.10;
        })();
        
        const evSavingsMonth = evKwhMonth * (avgNormalPrice - avgSmartPrice);
        totalEvSmartSavings += evSavingsMonth;
      }
      
      monthlySummary.push({
        month,
        monthName: MONTH_NAMES[month],
        consumption: monthConsumption,
        production: monthProduction,
        selfConsumption: monthSelfConsumption,
        feedIn: monthFeedIn,
        gridConsumption: monthGridConsumption,
        averageSpotPrice: monthPriceSum / 24,
        cost: monthCost,
      });
      
      totalConsumptionCost += monthCost;
    }
    
    // ========================================================================
    // STAP 4: TOTALEN EN VASTE KOSTEN
    // ========================================================================
    
    // Variabele kosten dynamisch (al berekend per uur)
    const consumptionCost = totalConsumptionCost;
    const feedInRevenue = totalFeedInRevenue;
    
    // Totaal dynamisch = variabel + vast
    const totalCostDynamic = consumptionCost + gridCosts + SUPPLIER_FIXED_COSTS - ENERGY_TAX_REDUCTION;
    
    // ========================================================================
    // STAP 5: VERGELIJKING MET VAST CONTRACT
    // ========================================================================
    
    // Scenario 1: Vast MET saldering (tot 2027)
    // Netto afname = verbruik - productie (bij volledig salderen)
    const netConsumption = hasSolar 
      ? Math.max(0, totalKwh - solarProduction) 
      : totalKwh;
    const fixedVariableCost = netConsumption * FIXED_PRICE_KWH;
    const totalCostFixed = fixedVariableCost + gridCosts + SUPPLIER_FIXED_COSTS - ENERGY_TAX_REDUCTION;
    
    // Scenario 2: Vast ZONDER saldering (na 2027)
    // Je betaalt voor alle afname, krijgt lage vergoeding - hoge kosten voor teruglevering
    const fixedSelfConsumptionSavings = totalSelfConsumption * FIXED_PRICE_KWH;
    const netFixedFeedInRate = FIXED_FEED_IN_RATE - FIXED_FEED_IN_COSTS; // -€0.08/kWh!
    const fixedFeedInValue = totalFeedIn * netFixedFeedInRate; // Negatief = je betaalt!
    const fixedVariableCostNoSaldering = (totalKwh * FIXED_PRICE_KWH) - fixedSelfConsumptionSavings - fixedFeedInValue;
    const totalCostFixedNoSaldering = fixedVariableCostNoSaldering + gridCosts + SUPPLIER_FIXED_COSTS - ENERGY_TAX_REDUCTION;
    
    // ========================================================================
    // STAP 6: BESPARINGEN BEREKENEN
    // ========================================================================
    
    const savingsVsFixed = totalCostFixed - totalCostDynamic;
    const savingsVsFixedNoSaldering = totalCostFixedNoSaldering - totalCostDynamic;
    const savingsPercentage = totalCostFixed > 0 ? (savingsVsFixed / totalCostFixed) * 100 : 0;
    
    // ========================================================================
    // STAP 7: SEIZOENSANALYSE
    // ========================================================================
    
    const winterCost = monthlySummary
      .filter(m => [0, 1, 11].includes(m.month))
      .reduce((sum, m) => sum + m.cost, 0);
    
    const summerCost = monthlySummary
      .filter(m => [5, 6, 7].includes(m.month))
      .reduce((sum, m) => sum + m.cost, 0);
    
    // Goedkoopste en duurste maand
    const sortedByPrice = [...monthlySummary].sort((a, b) => a.averageSpotPrice - b.averageSpotPrice);
    const cheapestMonth = sortedByPrice[0];
    const expensiveMonth = sortedByPrice[sortedByPrice.length - 1];
    
    // ========================================================================
    // STAP 8: BEREKEND EIGENVERBRUIK %
    // ========================================================================
    
    const calculatedSelfConsumptionPercentage = totalSolarProduction > 0 
      ? (totalSelfConsumption / totalSolarProduction) * 100 
      : 0;
    
    // ========================================================================
    // RESPONSE
    // ========================================================================
    
    const response: DynamicInsightResponse = {
      breakdown: {
        base: { kwh: totalBaseKwh, cost: totalBaseCost },
        heating: { kwh: totalHeatingKwh, cost: totalHeatingCost },
        ev: { kwh: totalEvKwh, cost: totalEvCost, smartSavings: totalEvSmartSavings },
        solar: {
          production: totalSolarProduction,
          selfConsumption: totalSelfConsumption,
          selfConsumptionSavings: totalSelfConsumptionSavings,
          feedIn: totalFeedIn,
          feedInRevenue: totalFeedInRevenue,
        },
      },
      
      consumptionCost,
      feedInRevenue,
      
      gridCosts,
      supplierFixedCosts: SUPPLIER_FIXED_COSTS,
      energyTaxReduction: ENERGY_TAX_REDUCTION,
      netbeheerder,
      
      totalCostDynamic,
      totalCostFixed,
      totalCostFixedNoSaldering,
      
      savingsVsFixed,
      savingsVsFixedNoSaldering,
      savingsPercentage,
      
      monthlySummary,
      
      winterCost,
      summerCost,
      
      cheapestMonth: {
        month: cheapestMonth.month,
        name: cheapestMonth.monthName,
        avgPrice: cheapestMonth.averageSpotPrice,
      },
      expensiveMonth: {
        month: expensiveMonth.month,
        name: expensiveMonth.monthName,
        avgPrice: expensiveMonth.averageSpotPrice,
      },
      
      profileMix,
      calculatedSelfConsumptionPercentage,
      
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
