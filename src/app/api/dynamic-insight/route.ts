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
  netbeheerder?: NetbeheerderType;
  hasSolar?: boolean;
  solarProduction?: number;
  selfConsumptionPercentage?: number;
  hasEV?: boolean;
  evKwhPerYear?: number;
  smartCharging?: boolean;
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
  // Input echo
  input: {
    totalKwh: number;
    solarProduction: number;
    selfConsumptionKwh: number;
    feedInKwh: number;
    gridConsumptionKwh: number;
  };
  
  // Variabele kosten breakdown
  variableCosts: {
    gridConsumptionCost: number;      // Wat je betaalt voor afname
    feedInRevenue: number;            // Wat je krijgt voor teruglevering
    netVariableCost: number;          // Netto variabel
    avgPricePerKwh: number;           // Gemiddelde prijs per kWh
    avgFeedInPricePerKwh: number;     // Gemiddelde terugleverprijs per kWh
  };
  
  // Vaste kosten
  fixedCosts: {
    gridCosts: number;
    supplierFixedCosts: number;
    energyTaxReduction: number;
    netFixed: number;
  };
  
  // Totalen
  totalCostDynamic: number;
  totalCostFixedWithSaldering: number;
  totalCostFixedNoSaldering: number;
  
  // Besparingen
  savingsVsFixedWithSaldering: number;
  savingsVsFixedNoSaldering: number;
  
  // Profiel breakdown
  profileMix: {
    baseKwh: number;
    heatingKwh: number;
    evKwh: number;
    method: 'nibud' | 'buildYear';
  };
  
  // Zonnepanelen
  solarAnalysis: {
    inputSelfConsumptionPct: number;
    calculatedSelfConsumptionPct: number;
    // Dynamisch
    dynamicFeedInRevenue: number;
    // Vast met saldering
    fixedSalderingRevenue: number;
    // Vast zonder saldering
    fixedFeedInRevenue: number;
    fixedFeedInCosts: number;
    netFixedFeedInValue: number;
    // Voordeel
    dynamicAdvantage: number;
  };
  
  // EV analyse
  evAnalysis: {
    evKwh: number;
    smartChargingSavings: number;
  };
  
  // Maandelijks
  monthlySummary: MonthlySummary[];
  
  // Seizoenen
  winterCost: number;
  summerCost: number;
  
  // Meta
  netbeheerder: string;
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
// CONSTANTEN - Tarieven 2025/2026
// ============================================================================

// Energiebelasting en BTW
const ENERGY_TAX = ENERGY_CONSTANTS.ENERGY_TAX_STROOM_PER_KWH; // €0.1316/kWh
const SUPPLIER_MARKUP = ENERGY_CONSTANTS.DEFAULT_DYNAMISCH_CONTRACT.OPSLAG_PER_KWH; // €0.025/kWh

// Vaste jaarkosten
const ENERGY_TAX_REDUCTION = ENERGY_CONSTANTS.ENERGY_TAX_REDUCTION; // €631.35/jaar
const SUPPLIER_FIXED_COSTS = ENERGY_CONSTANTS.DEFAULT_DYNAMISCH_CONTRACT.VASTE_LEVERINGSKOSTEN * 12; // €84/jaar

// Netbeheerkosten
const GRID_COSTS_BY_NETBEHEERDER: Record<NetbeheerderType, number> = {
  Liander: ENERGY_CONSTANTS.NETBEHEERDER_COSTS.LIANDER.stroom,
  Stedin: ENERGY_CONSTANTS.NETBEHEERDER_COSTS.STEDIN.stroom,
  Enexis: ENERGY_CONSTANTS.NETBEHEERDER_COSTS.ENEXIS.stroom,
};

// Teruglevering dynamisch: je krijgt spotprijs - kleine marge
// MAAR ook de energiebelasting terug (bij saldering in 2025/2026)!
const DYNAMIC_FEED_IN_MARGIN = ENERGY_CONSTANTS.DEFAULT_DYNAMISCH_CONTRACT.OPSLAG_INVOEDING; // €0.023/kWh

// Vast contract tarieven (typisch 2025/2026)
const FIXED_PRICE_KWH = 0.23;           // All-in afnameprijs vast contract

// Teruglevering vast contract (ZONDER saldering):
// Typisch: vergoeding €0.05/kWh, kosten €0.045/kWh → netto €0.005-0.01/kWh
const FIXED_FEED_IN_RATE = 0.05;        // Terugleververgoeding per kWh
const FIXED_FEED_IN_COST_PER_KWH = 0.04; // Terugleverkosten per kWh
const NET_FIXED_FEED_IN_RATE = FIXED_FEED_IN_RATE - FIXED_FEED_IN_COST_PER_KWH; // ~€0.01/kWh netto

// ============================================================================
// PROFIELEN (voor seizoensverdeling)
// ============================================================================

const MONTHLY_HEATING_FACTORS = [1.00, 0.90, 0.70, 0.45, 0.20, 0.08, 0.05, 0.05, 0.15, 0.40, 0.70, 0.95];
const HEATING_FACTOR_SUM = MONTHLY_HEATING_FACTORS.reduce((a, b) => a + b, 0);

const MONTHLY_BASE_FACTORS = [0.95, 0.92, 0.90, 0.88, 0.90, 0.95, 1.00, 1.00, 0.95, 0.92, 0.95, 1.05];
const BASE_FACTOR_SUM = MONTHLY_BASE_FACTORS.reduce((a, b) => a + b, 0);

const SOLAR_MONTHLY_PROFILE = [0.03, 0.05, 0.08, 0.11, 0.13, 0.14, 0.14, 0.12, 0.09, 0.06, 0.03, 0.02];

// Uurprofielen voor gelijktijdigheidsberekening
const HOURLY_E1A = [0.020, 0.018, 0.016, 0.015, 0.015, 0.018, 0.030, 0.050, 0.055, 0.048, 0.042, 0.040, 0.045, 0.042, 0.040, 0.042, 0.048, 0.065, 0.075, 0.072, 0.065, 0.055, 0.042, 0.032];
const E1A_SUM = HOURLY_E1A.reduce((a, b) => a + b, 0);

const HOURLY_G1A = [0.015, 0.012, 0.010, 0.010, 0.012, 0.025, 0.065, 0.075, 0.068, 0.055, 0.048, 0.045, 0.042, 0.040, 0.042, 0.048, 0.058, 0.068, 0.072, 0.065, 0.055, 0.045, 0.035, 0.025];
const G1A_SUM = HOURLY_G1A.reduce((a, b) => a + b, 0);

const SOLAR_HOURLY_PROFILE = [0, 0, 0, 0, 0, 0.01, 0.03, 0.06, 0.09, 0.11, 0.13, 0.14, 0.14, 0.13, 0.11, 0.09, 0.06, 0.03, 0.01, 0, 0, 0, 0, 0];
const SOLAR_HOURLY_SUM = SOLAR_HOURLY_PROFILE.reduce((a, b) => a + b, 0);

// EV profielen
const HOURLY_EV_SMART = [0.18, 0.18, 0.18, 0.18, 0.16, 0.12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const HOURLY_EV_NORMAL = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.05, 0.20, 0.25, 0.25, 0.15, 0.10, 0];

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
      selfConsumptionPercentage = 30,
      hasEV = false,
      evKwhPerYear = 0,
      smartCharging = true,
    } = body;
    
    // Netbeheerkosten
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
    // STAP 1: PROFIEL BEREKENING
    // ========================================================================
    
    const evKwh = hasEV ? Math.min(evKwhPerYear, totalKwh * 0.5) : 0;
    const householdKwh = totalKwh - evKwh;
    
    const buildYearNum = getBuildYearFromRange(buildYear);
    
    let adjustedHouseholdKwh = householdKwh;
    if (heatingType === 'gas') {
      adjustedHouseholdKwh = Math.min(householdKwh, 4000);
    }
    
    const profileMixRaw = calculateProfileMix(adjustedHouseholdKwh, buildYearNum, persons);
    
    const profileMix = {
      baseKwh: heatingType === 'gas' ? adjustedHouseholdKwh : profileMixRaw.baseKwh,
      heatingKwh: heatingType === 'gas' ? 0 : profileMixRaw.heatingKwh,
      evKwh: evKwh,
      method: profileMixRaw.method,
    };
    
    // ========================================================================
    // STAP 2: ZONNEPANELEN - EIGENVERBRUIK BEREKENEN
    // ========================================================================
    
    // Gebruik het ingevoerde percentage voor de berekening
    // We berekenen ook per uur voor vergelijking, maar de input is leidend
    
    let calculatedSelfConsumption = 0;
    
    if (hasSolar && solarProduction > 0) {
      // Bereken ook gelijktijdigheid voor vergelijking
      for (let month = 0; month < 12; month++) {
        const solarMonth = solarProduction * SOLAR_MONTHLY_PROFILE[month];
        const baseMonth = profileMix.baseKwh * (MONTHLY_BASE_FACTORS[month] / BASE_FACTOR_SUM);
        const heatingMonth = profileMix.heatingKwh * (MONTHLY_HEATING_FACTORS[month] / HEATING_FACTOR_SUM);
        const evMonth = evKwh / 12;
        
        for (let hour = 0; hour < 24; hour++) {
          const solarHour = solarMonth * (SOLAR_HOURLY_PROFILE[hour] / SOLAR_HOURLY_SUM);
          const baseHour = baseMonth * (HOURLY_E1A[hour] / E1A_SUM);
          const heatingHour = heatingMonth * (HOURLY_G1A[hour] / G1A_SUM);
          const evProfile = smartCharging ? HOURLY_EV_SMART : HOURLY_EV_NORMAL;
          const evHour = evMonth * evProfile[hour];
          const consumptionHour = baseHour + heatingHour + evHour;
          
          calculatedSelfConsumption += Math.min(solarHour, consumptionHour);
        }
      }
    }
    
    // Gebruik het INGEVOERDE percentage voor de berekening
    const selfConsumptionKwh = hasSolar 
      ? solarProduction * (selfConsumptionPercentage / 100) 
      : 0;
    const feedInKwh = hasSolar ? solarProduction - selfConsumptionKwh : 0;
    const gridConsumptionKwh = totalKwh - selfConsumptionKwh;
    
    // Berekend percentage (voor vergelijking)
    const calculatedSelfConsumptionPct = solarProduction > 0 
      ? (calculatedSelfConsumption / solarProduction) * 100 
      : 0;
    
    // ========================================================================
    // STAP 3: HISTORISCHE PRIJZEN OPHALEN
    // ========================================================================
    
    const till = tillDate ? new Date(tillDate) : new Date();
    const from = fromDate ? new Date(fromDate) : new Date(till.getTime() - 365 * 24 * 60 * 60 * 1000);
    
    const apiUrl = `https://api.energyzero.nl/v1/energyprices?fromDate=${from.toISOString()}&tillDate=${till.toISOString()}&interval=4&usageType=1&inclBtw=true`;
    
    const priceResponse = await fetch(apiUrl, { next: { revalidate: 3600 } });
    
    if (!priceResponse.ok) {
      throw new Error(`Failed to fetch prices: ${priceResponse.status}`);
    }
    
    const priceData: EnergyZeroResponse = await priceResponse.json();
    
    // Bereken gemiddelde spotprijs per maand
    const pricesByMonth = new Map<number, number[]>();
    
    for (const price of priceData.Prices) {
      const date = new Date(price.readingDate);
      const month = date.getMonth();
      
      if (!pricesByMonth.has(month)) {
        pricesByMonth.set(month, []);
      }
      pricesByMonth.get(month)!.push(price.price);
    }
    
    const avgPriceByMonth = new Map<number, number>();
    for (const [month, prices] of pricesByMonth) {
      avgPriceByMonth.set(month, prices.reduce((a, b) => a + b, 0) / prices.length);
    }
    
    // Gemiddelde spotprijs voor heel jaar
    const avgSpotPrice = priceData.Prices.length > 0
      ? priceData.Prices.reduce((sum, p) => sum + p.price, 0) / priceData.Prices.length
      : 0.10;
    
    // ========================================================================
    // STAP 4: KOSTEN BEREKENEN - SIMPEL EN CORRECT
    // ========================================================================
    
    // All-in prijs per kWh voor afname
    const allInPricePerKwh = avgSpotPrice + SUPPLIER_MARKUP + ENERGY_TAX;
    
    // Terugleverprijs per kWh (dynamisch MET saldering = spot + EB - marge)
    // Bij saldering krijg je effectief de EB terug!
    const feedInPricePerKwh = avgSpotPrice + ENERGY_TAX - DYNAMIC_FEED_IN_MARGIN;
    
    // Variabele kosten
    const gridConsumptionCost = gridConsumptionKwh * allInPricePerKwh;
    const feedInRevenue = feedInKwh * feedInPricePerKwh;
    const netVariableCost = gridConsumptionCost - feedInRevenue;
    
    // Vaste kosten
    const netFixed = gridCosts + SUPPLIER_FIXED_COSTS - ENERGY_TAX_REDUCTION;
    
    // TOTAAL DYNAMISCH
    const totalCostDynamic = netVariableCost + netFixed;
    
    // ========================================================================
    // STAP 5: VERGELIJKING MET VAST
    // ========================================================================
    
    // Vast MET saldering (2026):
    // Bij saldering mag je teruggeleverde kWh verrekenen met afname
    // Je betaalt effectief alleen voor (afname - teruglevering) × prijs
    // Als je meer terugleverd dan afneemt, krijg je voor overschot ~€0.09/kWh
    
    const gesaldeerdeKwh = Math.min(feedInKwh, gridConsumptionKwh); // Maximaal salderen tot afname
    const overschotKwh = Math.max(feedInKwh - gridConsumptionKwh, 0); // Eventueel overschot
    const effectieveAfnameKwh = gridConsumptionKwh - gesaldeerdeKwh; // Wat je echt betaalt
    
    // Saldering waarde = je bespaart de hele kWh prijs (€0.23) voor gesaldeerde kWh
    const salderingWaarde = gesaldeerdeKwh * FIXED_PRICE_KWH;
    // Overschot krijg je ~€0.09/kWh voor (terugleververgoeding vast contract)
    const overschotVergoeding = overschotKwh * 0.09;
    
    const fixedAfnameCostWithSaldering = gridConsumptionKwh * FIXED_PRICE_KWH;
    const fixedSalderingRevenue = salderingWaarde + overschotVergoeding;
    const fixedVariableWithSaldering = fixedAfnameCostWithSaldering - fixedSalderingRevenue;
    const totalCostFixedWithSaldering = fixedVariableWithSaldering + netFixed;
    
    // Vast ZONDER saldering (na 2027): afname betalen, teruglevering krijg je ~€0.01/kWh netto
    // Afname = totaal - eigenverbruik (wat je van net haalt)
    const fixedGridConsumptionKwh = totalKwh - selfConsumptionKwh;
    const fixedGridConsumptionCost = fixedGridConsumptionKwh * FIXED_PRICE_KWH;
    
    // Teruglevering: vergoeding €0.05/kWh - kosten €0.04/kWh = netto €0.01/kWh
    const fixedFeedInRevenue = feedInKwh * FIXED_FEED_IN_RATE;
    const fixedFeedInCosts = feedInKwh * FIXED_FEED_IN_COST_PER_KWH;
    const netFixedFeedInValue = feedInKwh * NET_FIXED_FEED_IN_RATE; // ~€0.01/kWh
    
    const fixedVariableNoSaldering = fixedGridConsumptionCost - netFixedFeedInValue;
    const totalCostFixedNoSaldering = fixedVariableNoSaldering + netFixed;
    
    // Besparingen
    const savingsVsFixedWithSaldering = totalCostFixedWithSaldering - totalCostDynamic;
    const savingsVsFixedNoSaldering = totalCostFixedNoSaldering - totalCostDynamic;
    
    // ========================================================================
    // STAP 6: MAANDELIJKSE ANALYSE (voor grafieken)
    // ========================================================================
    
    const monthlySummary: MonthlySummary[] = [];
    
    for (let month = 0; month < 12; month++) {
      const spotPriceMonth = avgPriceByMonth.get(month) ?? avgSpotPrice;
      const allInMonth = spotPriceMonth + SUPPLIER_MARKUP + ENERGY_TAX;
      const feedInMonth = spotPriceMonth + ENERGY_TAX - DYNAMIC_FEED_IN_MARGIN;
      
      // Verbruik deze maand
      const baseMonth = profileMix.baseKwh * (MONTHLY_BASE_FACTORS[month] / BASE_FACTOR_SUM);
      const heatingMonth = profileMix.heatingKwh * (MONTHLY_HEATING_FACTORS[month] / HEATING_FACTOR_SUM);
      const evMonthKwh = evKwh / 12;
      const consumptionMonth = baseMonth + heatingMonth + evMonthKwh;
      
      // Productie deze maand
      const productionMonth = hasSolar ? solarProduction * SOLAR_MONTHLY_PROFILE[month] : 0;
      
      // Eigenverbruik deze maand (proportioneel aan totaal)
      const selfConsumptionMonth = solarProduction > 0 
        ? selfConsumptionKwh * (productionMonth / solarProduction)
        : 0;
      
      const feedInMonthKwh = productionMonth - selfConsumptionMonth;
      const gridConsumptionMonth = consumptionMonth - selfConsumptionMonth;
      
      const costMonth = (gridConsumptionMonth * allInMonth) - (feedInMonthKwh * feedInMonth);
      
      monthlySummary.push({
        month,
        monthName: MONTH_NAMES[month],
        consumption: consumptionMonth,
        production: productionMonth,
        selfConsumption: selfConsumptionMonth,
        feedIn: feedInMonthKwh,
        gridConsumption: gridConsumptionMonth,
        averageSpotPrice: spotPriceMonth,
        cost: costMonth,
      });
    }
    
    // ========================================================================
    // STAP 7: EV SLIM LADEN BESPARING
    // ========================================================================
    
    let smartChargingSavings = 0;
    
    if (hasEV && evKwh > 0 && smartCharging) {
      // Schat besparing: verschil tussen avondprijzen en nachtprijzen
      // Gemiddeld ~€0.03-0.05/kWh verschil
      smartChargingSavings = evKwh * 0.04;
    }
    
    // ========================================================================
    // STAP 8: SEIZOENSKOSTEN
    // ========================================================================
    
    const winterCost = monthlySummary
      .filter(m => [0, 1, 11].includes(m.month))
      .reduce((sum, m) => sum + m.cost, 0);
    
    const summerCost = monthlySummary
      .filter(m => [5, 6, 7].includes(m.month))
      .reduce((sum, m) => sum + m.cost, 0);
    
    // ========================================================================
    // RESPONSE
    // ========================================================================
    
    const response: DynamicInsightResponse = {
      input: {
        totalKwh,
        solarProduction: hasSolar ? solarProduction : 0,
        selfConsumptionKwh,
        feedInKwh,
        gridConsumptionKwh,
      },
      
      variableCosts: {
        gridConsumptionCost,
        feedInRevenue,
        netVariableCost,
        avgPricePerKwh: allInPricePerKwh,
        avgFeedInPricePerKwh: feedInPricePerKwh,
      },
      
      fixedCosts: {
        gridCosts,
        supplierFixedCosts: SUPPLIER_FIXED_COSTS,
        energyTaxReduction: ENERGY_TAX_REDUCTION,
        netFixed,
      },
      
      totalCostDynamic,
      totalCostFixedWithSaldering,
      totalCostFixedNoSaldering,
      
      savingsVsFixedWithSaldering,
      savingsVsFixedNoSaldering,
      
      profileMix,
      
      solarAnalysis: {
        inputSelfConsumptionPct: selfConsumptionPercentage,
        calculatedSelfConsumptionPct,
        // Dynamisch
        dynamicFeedInRevenue: feedInRevenue,
        // Vast met saldering
        fixedSalderingRevenue: fixedSalderingRevenue,
        // Vast zonder saldering
        fixedFeedInRevenue: fixedFeedInRevenue,
        fixedFeedInCosts: fixedFeedInCosts,
        netFixedFeedInValue: netFixedFeedInValue,
        // Voordeel dynamisch vs vast zonder saldering
        dynamicAdvantage: feedInRevenue - netFixedFeedInValue,
      },
      
      evAnalysis: {
        evKwh,
        smartChargingSavings,
      },
      
      monthlySummary,
      
      winterCost,
      summerCost,
      
      netbeheerder,
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
