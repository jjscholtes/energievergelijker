import { getMonthlyData, MonthlyStats } from '@/lib/data/monthlyPriceData';

export const ENERGY_TAX_EUR_PER_KWH = 0.1316;

export type HouseholdProfileKey = 'allElectric' | 'hybrid';

export interface HouseholdProfile {
  id: HouseholdProfileKey;
  name: string;
  description: string;
  reportSource: string;
  annualConsumptionKwh: number;
  monthlyConsumptionKwh: Record<number, number>;
}

export interface SeasonalPriceBreakdownItem {
  id: string;
  label: string;
  months: number[];
  expectedConsumptionShare: number;
  availableConsumptionShare: number;
  averagePriceExclTax: number | null;
  averagePriceInclTax: number | null;
  missingMonths: number[];
  totalConsumptionKwh: number;
  baseConsumptionKwh: number;
  evConsumptionKwh: number;
  baseContributionExclTax: number;
  evContributionExclTax: number;
}

export interface SeasonalPriceCalculation {
  year: number;
  profile: HouseholdProfile;
  includeEV: boolean;
  seasonalBreakdown: SeasonalPriceBreakdownItem[];
  annualAveragePriceExclTax: number | null;
  annualAveragePriceInclTax: number | null;
  annualCoverage: number;
  baseAnnualConsumptionKwh: number;
  evAnnualConsumptionKwh: number;
  totalAnnualConsumptionKwh: number;
}

export interface SeasonalPriceCalculationOptions {
  includeEV?: boolean;
}

export interface SolarFeedInBreakdown {
  id: SeasonId;
  label: string;
  months: number[];
  expectedGenerationKwh: number;
  analyzedGenerationKwh: number;
  revenueEuro: number;
  averagePrice: number | null;
  minHourlyPrice: number | null;
  maxHourlyPrice: number | null;
  hourlyPattern: number[];
  missingMonths: number[];
}

export interface SolarFeedInResult {
  year: number;
  systemSizeKwp: number;
  annualExpectedGenerationKwh: number;
  annualAnalyzedGenerationKwh: number;
  annualRevenueEuro: number;
  averageFeedInPrice: number | null;
  coverage: number;
  breakdown: SolarFeedInBreakdown[];
}

type SeasonId = 'winter' | 'spring' | 'summer' | 'autumn';

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

const SEASON_DEFINITIONS: { id: SeasonId; label: string; months: number[] }[] = [
  { id: 'winter', label: 'Winter', months: [12, 1, 2] },
  { id: 'spring', label: 'Lente', months: [3, 4, 5] },
  { id: 'summer', label: 'Zomer', months: [6, 7, 8] },
  { id: 'autumn', label: 'Herfst', months: [9, 10, 11] }
];

const MONTH_TO_SEASON: Record<number, SeasonId> = {
  1: 'winter',
  2: 'winter',
  3: 'spring',
  4: 'spring',
  5: 'spring',
  6: 'summer',
  7: 'summer',
  8: 'summer',
  9: 'autumn',
  10: 'autumn',
  11: 'autumn',
  12: 'winter'
};

const ALL_ELECTRIC_MONTHLY_KWH: Record<number, number> = {
  1: 840,
  2: 720,
  3: 600,
  4: 420,
  5: 300,
  6: 240,
  7: 240,
  8: 300,
  9: 360,
  10: 480,
  11: 660,
  12: 840
};

const EV_ANNUAL_CONSUMPTION_KWH = 2500;

const EV_MONTHLY_CONSUMPTION_KWH: Record<number, number> = MONTHS.reduce((acc, month) => {
  acc[month] = EV_ANNUAL_CONSUMPTION_KWH / 12;
  return acc;
}, {} as Record<number, number>);

const HOUSEHOLD_HOURLY_SHAPES: Record<HouseholdProfileKey, Record<SeasonId, number[]>> = {
  allElectric: {
    winter: [
      3, 3, 3, 3, 3, 3, 6, 8, 9, 6, 5, 4,
      4, 4, 5, 7, 9, 10, 9, 8, 7, 6, 5, 4
    ],
    spring: [
      3, 3, 3, 3, 3, 3, 5, 7, 7, 5, 4, 3,
      3, 3, 4, 5, 6, 7, 7, 6, 5, 4, 3, 3
    ],
    summer: [
      2, 2, 2, 2, 2, 2, 4, 5, 5, 4, 3, 3,
      3, 3, 3, 4, 5, 6, 7, 7, 6, 4, 3, 3
    ],
    autumn: [
      3, 3, 3, 3, 3, 3, 5, 7, 8, 6, 5, 4,
      4, 4, 5, 6, 8, 9, 9, 7, 6, 5, 4, 4
    ]
  },
  hybrid: {
    winter: [
      2, 2, 2, 2, 2, 2, 4, 6, 6, 5, 4, 4,
      4, 4, 4, 5, 6, 6, 6, 5, 4, 3, 3, 2
    ],
    spring: [
      2, 2, 2, 2, 2, 2, 4, 5, 5, 5, 4, 4,
      4, 4, 4, 4, 5, 6, 6, 5, 4, 3, 3, 2
    ],
    summer: [
      2, 2, 2, 2, 2, 2, 3, 4, 4, 4, 3, 3,
      3, 3, 3, 4, 5, 5, 6, 5, 4, 3, 3, 2
    ],
    autumn: [
      2, 2, 2, 2, 2, 2, 4, 5, 6, 5, 4, 4,
      4, 4, 4, 5, 6, 6, 6, 5, 4, 3, 3, 2
    ]
  }
};

const HYBRID_MONTHLY_KWH: Record<number, number> = {
  1: 352,
  2: 320,
  3: 288,
  4: 240,
  5: 208,
  6: 192,
  7: 192,
  8: 208,
  9: 224,
  10: 272,
  11: 320,
  12: 384
};

export const HOUSEHOLD_PROFILES: Record<HouseholdProfileKey, HouseholdProfile> = {
  allElectric: {
    id: 'allElectric',
    name: 'All-electric huishouden',
    description:
      'Volledig elektrische woning met warmtepomp (6.000 kWh/jaar). Bruto maandverbruik uit het rapport “Energieverbruiksprofielen van Nederlandse Huishoudens”, opgeschaald naar een hoogverbruiksscenario.',
    reportSource: 'energieverbruiksprofielen-van-nederlandse-huishoudens-een-analyse-voor-kostenmodellering',
    annualConsumptionKwh: 6000,
    monthlyConsumptionKwh: ALL_ELECTRIC_MONTHLY_KWH
  },
  hybrid: {
    id: 'hybrid',
    name: 'Hybride huishouden',
    description:
      'Hybride warmtepomp + cv (3.200 kWh/jaar). Bruto elektriciteitsverbruik per maand uit “Analyse van Energiekosten voor All-Electric en Hybride Huishoudens”.',
    reportSource: 'analyse-van-energiekosten-voor-all-electric-en-hybride-huishoudens-in-nederland',
    annualConsumptionKwh: 3200,
    monthlyConsumptionKwh: HYBRID_MONTHLY_KWH
  }
};

const PV_REFERENCE_SYSTEM_KWP = 4;

// Maandelijkse opbrengst voor 4 kWp systeem (Tabel 4 uit rapport)
const PV_MONTHLY_GENERATION_4KWP: Record<number, number> = {
  1: 108,
  2: 180,
  3: 324,
  4: 432,
  5: 504,
  6: 540,
  7: 504,
  8: 432,
  9: 324,
  10: 180,
  11: 108,
  12: 72
};

const PV_SEASONAL_HOURLY_SHAPES: Record<SeasonId, number[]> = {
  winter: [
    0, 0, 0, 0, 0, 0, 1, 3, 6, 8, 9, 8,
    6, 4, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0
  ],
  spring: [
    0, 0, 0, 0, 0, 1, 3, 6, 9, 11, 12, 11,
    9, 7, 5, 3, 2, 1, 0, 0, 0, 0, 0, 0
  ],
  summer: [
    0, 0, 0, 0, 0, 1, 4, 7, 11, 13, 15, 14,
    12, 10, 8, 6, 4, 2, 1, 0, 0, 0, 0, 0
  ],
  autumn: [
    0, 0, 0, 0, 0, 0, 2, 5, 8, 9, 10, 9,
    7, 5, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0
  ]
};

function safeAverage(sum: number, weight: number): number | null {
  if (weight <= 0) {
    return null;
  }
  return sum / weight;
}

function getNightChargingAverage(monthStats: MonthlyStats): number {
  const nightHours = [0, 1, 2, 3, 4, 5, 6];
  let sum = 0;
  let count = 0;

  nightHours.forEach((hour) => {
    const value = monthStats.hourlyAverages[hour];
    if (typeof value === 'number') {
      sum += value;
      count += 1;
    }
  });

  if (count > 0) {
    return sum / count;
  }

  return monthStats.average;
}

function getSeasonalBreakdown(
  year: number,
  profile: HouseholdProfile,
  monthlyData: { [month: number]: MonthlyStats },
  options: SeasonalPriceCalculationOptions
): SeasonalPriceBreakdownItem[] {
  const includeEV = Boolean(options.includeEV);
  const baseAnnual = profile.annualConsumptionKwh;
  const evAnnual = includeEV ? EV_ANNUAL_CONSUMPTION_KWH : 0;
  const totalAnnual = baseAnnual + evAnnual;
  const hourlyShape = HOUSEHOLD_HOURLY_SHAPES[profile.id];

  return SEASON_DEFINITIONS.map((season) => {
    let weightedSum = 0;
    let availableEnergy = 0;
    let expectedEnergy = 0;
    let baseEnergy = 0;
    let evEnergy = 0;
    let baseContributionSum = 0;
    let evContributionSum = 0;
    const missingMonths: number[] = [];

    season.months.forEach((month) => {
      const baseKwh = profile.monthlyConsumptionKwh[month] ?? 0;
      const evKwh = includeEV ? (EV_MONTHLY_CONSUMPTION_KWH[month] ?? 0) : 0;
      const totalKwh = baseKwh + evKwh;

      expectedEnergy += totalKwh;
      baseEnergy += baseKwh;
      evEnergy += evKwh;

      const monthStats = monthlyData[month];
      if (monthStats && totalKwh > 0) {
        const seasonShape = hourlyShape?.[season.id];
        let baseContribution = 0;

        if (seasonShape && seasonShape.length === 24) {
          let totalShape = seasonShape.reduce((sum, value) => sum + value, 0);
          if (totalShape <= 0) totalShape = 1;

          seasonShape.forEach((fraction, hour) => {
            const normalizedFraction = fraction / totalShape;
            const hourConsumption = baseKwh * normalizedFraction;
            const price = monthStats.hourlyAverages[hour] ?? monthStats.average ?? 0;
            baseContribution += hourConsumption * price;
          });
        } else {
          baseContribution = baseKwh * (monthStats.average ?? 0);
        }

        const evPrice = includeEV ? getNightChargingAverage(monthStats) : 0;
        const evContribution = evKwh * evPrice;
        const monthContribution = baseContribution + evContribution;

        weightedSum += monthContribution;
        availableEnergy += totalKwh;
        baseContributionSum += baseContribution;
        evContributionSum += evContribution;
      } else if (totalKwh > 0) {
        missingMonths.push(month);
      }
    });

    const avgExclTax = safeAverage(weightedSum, availableEnergy);
    const avgInclTax = avgExclTax === null ? null : avgExclTax + ENERGY_TAX_EUR_PER_KWH;

    return {
      id: season.id,
      label: season.label,
      months: season.months,
      expectedConsumptionShare: totalAnnual > 0 ? expectedEnergy / totalAnnual : 0,
      availableConsumptionShare: totalAnnual > 0 ? availableEnergy / totalAnnual : 0,
      averagePriceExclTax: avgExclTax,
      averagePriceInclTax: avgInclTax,
      missingMonths,
      totalConsumptionKwh: expectedEnergy,
      baseConsumptionKwh: baseEnergy,
      evConsumptionKwh: evEnergy,
      baseContributionExclTax: baseContributionSum,
      evContributionExclTax: evContributionSum
    };
  });
}

export function calculateSeasonalRealisticPrice(
  year: number,
  profileKey: HouseholdProfileKey,
  options: SeasonalPriceCalculationOptions = {}
): SeasonalPriceCalculation {
  const profile = HOUSEHOLD_PROFILES[profileKey];
  if (!profile) {
    throw new Error(`Onbekend profiel: ${profileKey}`);
  }

  const monthlyData = getMonthlyData(year);
  const includeEV = Boolean(options.includeEV);
  const baseAnnual = profile.annualConsumptionKwh;
  const evAnnual = includeEV ? EV_ANNUAL_CONSUMPTION_KWH : 0;
  const totalAnnual = baseAnnual + evAnnual;

  let annualAvailableEnergy = 0;
  let annualWeightedSum = 0;

  MONTHS.forEach((month) => {
    const monthStats = monthlyData[month];
    const baseKwh = profile.monthlyConsumptionKwh[month] ?? 0;
    const evKwh = includeEV ? (EV_MONTHLY_CONSUMPTION_KWH[month] ?? 0) : 0;
    const totalKwh = baseKwh + evKwh;

    if (monthStats && totalKwh > 0) {
      const seasonId = MONTH_TO_SEASON[month];
      const seasonShape = HOUSEHOLD_HOURLY_SHAPES[profile.id]?.[seasonId];
      let baseContribution = 0;

      if (seasonShape && seasonShape.length === 24) {
        let totalShape = seasonShape.reduce((sum, value) => sum + value, 0);
        if (totalShape <= 0) totalShape = 1;

        seasonShape.forEach((fraction, hour) => {
          const normalizedFraction = fraction / totalShape;
          const hourConsumption = baseKwh * normalizedFraction;
          const price = monthStats.hourlyAverages[hour] ?? monthStats.average ?? 0;
          baseContribution += hourConsumption * price;
        });
      } else {
        baseContribution = baseKwh * (monthStats.average ?? 0);
      }

      const evContribution = evKwh * (includeEV ? getNightChargingAverage(monthStats) : 0);
      const monthContribution = baseContribution + evContribution;

      annualAvailableEnergy += totalKwh;
      annualWeightedSum += monthContribution;
    }
  });

  const annualAvgExclTax = safeAverage(annualWeightedSum, annualAvailableEnergy);
  const annualAvgInclTax = annualAvgExclTax === null ? null : annualAvgExclTax + ENERGY_TAX_EUR_PER_KWH;

  const seasonalBreakdown = getSeasonalBreakdown(year, profile, monthlyData, options);

  return {
    year,
    profile,
    includeEV,
    seasonalBreakdown,
    annualAveragePriceExclTax: annualAvgExclTax,
    annualAveragePriceInclTax: annualAvgInclTax,
    annualCoverage: totalAnnual > 0 ? annualAvailableEnergy / totalAnnual : 0,
    baseAnnualConsumptionKwh: baseAnnual,
    evAnnualConsumptionKwh: evAnnual,
    totalAnnualConsumptionKwh: totalAnnual
  };
}

export function formatMonthName(month: number): string {
  const monthNames = [
    'januari',
    'februari',
    'maart',
    'april',
    'mei',
    'juni',
    'juli',
    'augustus',
    'september',
    'oktober',
    'november',
    'december'
  ];

  return monthNames[month - 1] ?? `maand ${month}`;
}

export function formatPrice(value: number | null, decimals = 3): string {
  if (value === null || Number.isNaN(value)) {
    return 'n.v.t.';
  }
  return `€${value.toFixed(decimals)}`;
}

function normalizeShape(shape: number[]): number[] {
  const total = shape.reduce((sum, value) => sum + value, 0);
  if (total <= 0) {
    return shape.map(() => 1 / shape.length);
  }
  return shape.map((value) => value / total);
}

function getPvHourlyPattern(seasonId: SeasonId): number[] {
  return normalizeShape(PV_SEASONAL_HOURLY_SHAPES[seasonId] ?? Array(24).fill(0));
}

function calculatePvMonthlyGenerationKwh(systemSizeKwp: number, month: number): number {
  const baseGenerationFor4kWp = PV_MONTHLY_GENERATION_4KWP[month] ?? 0;
  const scalingFactor = systemSizeKwp / PV_REFERENCE_SYSTEM_KWP;
  return baseGenerationFor4kWp * scalingFactor;
}

export function getSolarMonthlyProfile(systemSizeKwp: number): { month: number; sharePercent: number; generationKwh: number }[] {
  const totalGeneration = Object.values(PV_MONTHLY_GENERATION_4KWP).reduce((sum, value) => sum + value, 0);
  
  return MONTHS.map((month) => {
    const baseGeneration = PV_MONTHLY_GENERATION_4KWP[month] ?? 0;
    const generation = calculatePvMonthlyGenerationKwh(systemSizeKwp, month);
    const sharePercent = totalGeneration > 0 ? (baseGeneration / totalGeneration) * 100 : 0;
    
    return {
      month,
      sharePercent,
      generationKwh: generation
    };
  });
}

function calculatePvSeasonalBreakdown(
  year: number,
  systemSizeKwp: number,
  monthlyData: { [month: number]: MonthlyStats }
): SolarFeedInBreakdown[] {
  return SEASON_DEFINITIONS.map((season) => {
    const hourlyPattern = getPvHourlyPattern(season.id);
    let expectedGeneration = 0;
    let analyzedGeneration = 0;
    let revenue = 0;
    let minPrice = Number.POSITIVE_INFINITY;
    let maxPrice = Number.NEGATIVE_INFINITY;
    const missingMonths: number[] = [];

    season.months.forEach((month) => {
      const generation = calculatePvMonthlyGenerationKwh(systemSizeKwp, month);
      expectedGeneration += generation;
      const monthStats = monthlyData[month];

      if (!monthStats || generation <= 0) {
        if (generation > 0) {
          missingMonths.push(month);
        }
        return;
      }

      const hourlyAverages = monthStats.hourlyAverages;
      const hourlyPrices = Object.keys(hourlyAverages)
        .map((key) => ({ hour: Number(key), price: hourlyAverages[Number(key)] }))
        .sort((a, b) => a.hour - b.hour);

      if (hourlyPrices.length !== 24) {
        missingMonths.push(month);
        return;
      }

      const monthGeneration = hourlyPattern.map((fraction) => fraction * generation);
      analyzedGeneration += generation;

      monthGeneration.forEach((hourGeneration, index) => {
        const price = hourlyPrices[index].price;
        revenue += hourGeneration * price;
        minPrice = Math.min(minPrice, price);
        maxPrice = Math.max(maxPrice, price);
      });
    });

    const averagePrice = analyzedGeneration > 0 ? revenue / analyzedGeneration : null;

    return {
      id: season.id,
      label: season.label,
      months: season.months,
      expectedGenerationKwh: expectedGeneration,
      analyzedGenerationKwh: analyzedGeneration,
      revenueEuro: revenue,
      averagePrice,
      minHourlyPrice: minPrice === Number.POSITIVE_INFINITY ? null : minPrice,
      maxHourlyPrice: maxPrice === Number.NEGATIVE_INFINITY ? null : maxPrice,
      hourlyPattern,
      missingMonths
    };
  });
}

export function calculateSolarFeedIn(
  year: number,
  systemSizeKwp: number
): SolarFeedInResult {
  const monthlyData = getMonthlyData(year);
  const breakdown = calculatePvSeasonalBreakdown(year, systemSizeKwp, monthlyData);

  const annualExpectedGeneration = breakdown.reduce((sum, season) => sum + season.expectedGenerationKwh, 0);
  const annualAnalyzedGeneration = breakdown.reduce((sum, season) => sum + season.analyzedGenerationKwh, 0);
  const annualRevenueEuro = breakdown.reduce((sum, season) => sum + season.revenueEuro, 0);

  const averageFeedInPrice = annualAnalyzedGeneration > 0 ? annualRevenueEuro / annualAnalyzedGeneration : null;
  const coverage = annualExpectedGeneration > 0 ? annualAnalyzedGeneration / annualExpectedGeneration : 0;

  return {
    year,
    systemSizeKwp,
    annualExpectedGenerationKwh: annualExpectedGeneration,
    annualAnalyzedGenerationKwh: annualAnalyzedGeneration,
    annualRevenueEuro,
    averageFeedInPrice,
    coverage,
    breakdown
  };
}


