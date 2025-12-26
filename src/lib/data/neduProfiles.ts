/**
 * NEDU/MFFBAS Standard Load Profiles
 * 
 * E1A: Standard electricity profile (lighting, appliances, cooking)
 * G1A: Standard gas profile (used as proxy for heating demand/outdoor temperature)
 * 
 * Values represent hourly fractions that sum to 1.0 over the year
 * Simplified to monthly averages per hour for practical use
 */

// Monthly heating factors (relative intensity based on HDD - Heating Degree Days)
// Jan=1.0 (coldest), Jul/Aug=0.05 (minimal), transitioning months in between
export const monthlyHeatingFactors: Record<number, number> = {
  0: 1.00,  // January
  1: 0.90,  // February
  2: 0.70,  // March
  3: 0.45,  // April
  4: 0.20,  // May
  5: 0.08,  // June
  6: 0.05,  // July
  7: 0.05,  // August
  8: 0.15,  // September
  9: 0.40,  // October
  10: 0.70, // November
  11: 0.95, // December
};

// Monthly base load factors (relatively stable, slight summer increase for cooling)
export const monthlyBaseFactors: Record<number, number> = {
  0: 0.95,  // January
  1: 0.92,  // February
  2: 0.90,  // March
  3: 0.88,  // April
  4: 0.90,  // May
  5: 0.95,  // June
  6: 1.00,  // July (some AC usage)
  7: 1.00,  // August
  8: 0.95,  // September
  9: 0.92,  // October
  10: 0.95, // November
  11: 1.05, // December (holidays)
};

// Hourly profile for E1A (base load) - normalized to sum to 1.0
// Peaks in morning (7-9) and evening (17-21)
export const hourlyProfileE1A: number[] = [
  0.020, // 00:00
  0.018, // 01:00
  0.016, // 02:00
  0.015, // 03:00
  0.015, // 04:00
  0.018, // 05:00
  0.030, // 06:00
  0.050, // 07:00 - morning peak start
  0.055, // 08:00
  0.048, // 09:00
  0.042, // 10:00
  0.040, // 11:00
  0.045, // 12:00 - lunch
  0.042, // 13:00
  0.040, // 14:00
  0.042, // 15:00
  0.048, // 16:00
  0.065, // 17:00 - evening peak start
  0.075, // 18:00
  0.072, // 19:00
  0.065, // 20:00
  0.055, // 21:00
  0.042, // 22:00
  0.032, // 23:00
];

// Hourly profile for G1A (heating load) - normalized to sum to 1.0
// Higher in morning and evening, very low during night (thermostat setback)
export const hourlyProfileG1A: number[] = [
  0.015, // 00:00 - night setback
  0.012, // 01:00
  0.010, // 02:00
  0.010, // 03:00
  0.012, // 04:00
  0.025, // 05:00 - heating starts
  0.065, // 06:00 - morning warmup
  0.075, // 07:00
  0.068, // 08:00
  0.055, // 09:00
  0.048, // 10:00
  0.045, // 11:00
  0.042, // 12:00
  0.040, // 13:00
  0.042, // 14:00
  0.048, // 15:00
  0.058, // 16:00 - afternoon/evening warmup
  0.068, // 17:00
  0.072, // 18:00
  0.065, // 19:00
  0.055, // 20:00
  0.045, // 21:00
  0.035, // 22:00
  0.025, // 23:00
];

// Normalize profiles to ensure they sum to 1.0
function normalizeProfile(profile: number[]): number[] {
  const sum = profile.reduce((a, b) => a + b, 0);
  return profile.map(v => v / sum);
}

export const normalizedE1A = normalizeProfile(hourlyProfileE1A);
export const normalizedG1A = normalizeProfile(hourlyProfileG1A);

/**
 * NIBUD standard base consumption per household size (kWh/year)
 * Source: NIBUD referentiebudget 2024
 */
export const nibudBaseConsumption: Record<number, number> = {
  1: 1900,  // 1 person
  2: 2450,  // 2 persons
  3: 3000,  // 3 persons
  4: 3500,  // 4 persons
  5: 4000,  // 5+ persons
};

/**
 * Building year to heating percentage mapping
 * Older buildings = more heating needed (worse insulation)
 */
export function getHeatingPercentageByBuildYear(buildYear: number): number {
  if (buildYear < 1992) return 0.70;      // Pre-insulation standards
  if (buildYear <= 2005) return 0.60;     // Basic insulation
  if (buildYear <= 2016) return 0.50;     // Improved insulation
  return 0.40;                            // Modern/BENG standards
}

/**
 * Calculate profile mix based on total consumption and household characteristics
 */
export function calculateProfileMix(
  totalKwh: number,
  buildYear: number,
  persons?: number
): { baseKwh: number; heatingKwh: number; method: 'nibud' | 'buildYear' } {
  // Try NIBUD method first if persons is provided
  if (persons && persons >= 1 && persons <= 5) {
    const nibudBase = nibudBaseConsumption[Math.min(persons, 5)];
    const heatingKwh = totalKwh - nibudBase;
    
    // Validate: heating should be positive and at least 10% of total
    if (heatingKwh > 0 && (heatingKwh / totalKwh) > 0.10) {
      return {
        baseKwh: nibudBase,
        heatingKwh: heatingKwh,
        method: 'nibud'
      };
    }
  }
  
  // Fallback to build year heuristic
  const heatingPercentage = getHeatingPercentageByBuildYear(buildYear);
  return {
    baseKwh: totalKwh * (1 - heatingPercentage),
    heatingKwh: totalKwh * heatingPercentage,
    method: 'buildYear'
  };
}

/**
 * Get hourly consumption fraction for a specific hour and month
 * Combines base load (E1A) and heating load (G1A) with seasonal factors
 */
export function getHourlyFraction(
  hour: number,
  month: number,
  profileMix: { baseKwh: number; heatingKwh: number },
  totalKwh: number
): { baseFraction: number; heatingFraction: number; totalFraction: number } {
  const baseWeight = profileMix.baseKwh / totalKwh;
  const heatingWeight = profileMix.heatingKwh / totalKwh;
  
  // Get seasonal factors
  const baseFactor = monthlyBaseFactors[month];
  const heatingFactor = monthlyHeatingFactors[month];
  
  // Calculate weighted fractions
  // Divide by 12 months and normalize by sum of monthly factors
  const baseMonthlySum = Object.values(monthlyBaseFactors).reduce((a, b) => a + b, 0);
  const heatingMonthlySum = Object.values(monthlyHeatingFactors).reduce((a, b) => a + b, 0);
  
  const baseFraction = normalizedE1A[hour] * baseWeight * (baseFactor / baseMonthlySum * 12);
  const heatingFraction = normalizedG1A[hour] * heatingWeight * (heatingFactor / heatingMonthlySum * 12);
  
  return {
    baseFraction,
    heatingFraction,
    totalFraction: baseFraction + heatingFraction
  };
}

/**
 * Calculate yearly consumption profile (hourly values for each month)
 * Returns consumption in kWh for each hour of each month
 */
export function calculateYearlyProfile(
  totalKwh: number,
  buildYear: number,
  persons?: number
): { month: number; hour: number; consumption: number; isHeating: boolean }[] {
  const mix = calculateProfileMix(totalKwh, buildYear, persons);
  const profile: { month: number; hour: number; consumption: number; isHeating: boolean }[] = [];
  
  // Calculate total fractions to normalize
  let totalBaseFraction = 0;
  let totalHeatingFraction = 0;
  
  for (let month = 0; month < 12; month++) {
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
    for (let hour = 0; hour < 24; hour++) {
      const fractions = getHourlyFraction(hour, month, mix, totalKwh);
      totalBaseFraction += fractions.baseFraction * daysInMonth;
      totalHeatingFraction += fractions.heatingFraction * daysInMonth;
    }
  }
  
  // Generate normalized profile
  for (let month = 0; month < 12; month++) {
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
    for (let hour = 0; hour < 24; hour++) {
      const fractions = getHourlyFraction(hour, month, mix, totalKwh);
      
      // Normalize to actual kWh
      const baseConsumption = (fractions.baseFraction / totalBaseFraction) * mix.baseKwh * daysInMonth;
      const heatingConsumption = (fractions.heatingFraction / totalHeatingFraction) * mix.heatingKwh * daysInMonth;
      
      profile.push({
        month,
        hour,
        consumption: baseConsumption + heatingConsumption,
        isHeating: heatingConsumption > baseConsumption
      });
    }
  }
  
  return profile;
}

export type HeatingType = 'gas' | 'hybrid' | 'all-electric';
export type BuildYearRange = '<1992' | '1992-2005' | '2006-2016' | '>2017';

export const buildYearRanges: { value: BuildYearRange; label: string; year: number }[] = [
  { value: '<1992', label: 'Voor 1992 (slecht geïsoleerd)', year: 1985 },
  { value: '1992-2005', label: '1992-2005 (basis isolatie)', year: 1998 },
  { value: '2006-2016', label: '2006-2016 (verbeterd)', year: 2010 },
  { value: '>2017', label: 'Na 2017 (goed geïsoleerd)', year: 2020 },
];

export function getBuildYearFromRange(range: BuildYearRange): number {
  const found = buildYearRanges.find(r => r.value === range);
  return found?.year ?? 2010;
}

