/**
 * Type definitions for home battery payback calculator
 */

/**
 * Battery specifications and characteristics
 */
export interface BatteryProfile {
  /** Battery capacity in kWh (e.g., 10 kWh) */
  capaciteitKwh: number;
  /** Purchase price including installation (€) */
  prijsEuro: number;
  /** Round-trip efficiency (0.90 = 90%) */
  roundTripEfficiency: number;
  /** Warranty period in years */
  garantieJaren: number;
  /** Annual capacity degradation rate (0.02 = 2% per year) */
  degradatiePerJaar: number;
}

/**
 * Complete input data for battery payback calculation
 */
export interface BatteryInput {
  /** Battery specifications */
  battery: BatteryProfile;
  /** Whether user has solar panels */
  heeftZonnepanelen: boolean;
  /** Annual PV generation in kWh (only if heeftZonnepanelen = true) */
  pvOpwekKwh?: number;
  /** Current self-consumption percentage without battery (e.g., 30%) */
  huidigEigenverbruikPercentage?: number;
  /** Self-consumption percentage with battery (e.g., 60%) */
  eigenverbruikMetAccuPercentage?: number;
  /** Total annual electricity consumption in kWh */
  jaarverbruikStroom: number;
  /** Contract type: fixed or dynamic pricing */
  contractType: 'vast' | 'dynamisch';
  /** Base electricity price in €/kWh */
  stroomKalePrijs: number;
  /** Feed-in tariff in €/kWh */
  terugleververgoeding: number;
  /** Grid operator name for cost lookup (optional) */
  netbeheerder?: string;
  /** Postal code for regional calculations (optional) */
  postcode?: string;
}

export interface SavingsBreakdown {
  verhoogdEigenverbruik: number;    // € besparing door meer eigenverbruik
  vermedenTerugleverkosten: number; // € besparing door minder teruglevering
  arbitrageVoordeel: number;        // € voordeel door slim laden/ontladen (dynamisch)
  salderingsBesparing: number;      // € saldering voordeel (alleen tot 2027)
  totaal: number;                   // € totale jaarlijkse besparing
}

export interface BatteryScenario {
  naam: string;                     // "Nu (2024-2026)", "Na 2027", "Dynamisch + Arbitrage"
  beschrijving: string;
  salderingsPercentage: number;     // 1.0 = 100%, 0 = geen saldering
  heeftArbitrage: boolean;          // Of arbitrage meegenomen wordt
  badge?: string;                   // Optionele label voor UI
  jaarlijkseBesparing: SavingsBreakdown;
  terugverdientijd: number;         // Jaren
  totaleBesparingOver15Jaar: number; // €
  cashflowPerJaar: number[];        // Array van cumulatieve cashflow voor 15 jaar
  rendabel: boolean;                // Of het rendabel is (< 15 jaar)
}

export interface ArbitrageStats {
  gemiddeldeSpread: number;         // € gemiddelde spread tussen laag/hoog
  aantalCycliPerJaar: number;       // Geschat aantal laad/ontlaad cycli
  jaarlijkseWinst: number;          // € netto arbitrage winst per jaar
  negatievePrijsUren: number;       // Aantal uren met negatieve prijzen
  percentielPrijzen: {
    p20Laag: number;                // Gemiddelde van goedkoopste 20% uren
    p20Hoog: number;                // Gemiddelde van duurste 20% uren
  };
}

export interface EigenverbruikImpact {
  zonderAccu: {
    eigenverbruikKwh: number;
    terugleveringKwh: number;
    afnameNetKwh: number;
  };
  metAccu: {
    eigenverbruikKwh: number;
    terugleveringKwh: number;
    afnameNetKwh: number;
  };
  verbetering: {
    extraEigenverbruikKwh: number;
    minderTerugleveringKwh: number;
    minderAfnameKwh: number;
    financieelVoordeel: number;     // € per jaar
  };
}

export interface BatteryCalculationResult {
  input: BatteryInput;
  scenarios: {
    huidig: BatteryScenario;        // Met saldering (2024-2026)
    na2027: BatteryScenario;        // Zonder saldering (2027+)
    dynamischOptimaal: BatteryScenario; // Dynamisch contract + arbitrage
  };
  eigenverbruikImpact?: EigenverbruikImpact; // Alleen bij zonnepanelen
  arbitrageStats?: ArbitrageStats;  // Alleen bij dynamisch contract
  aanbeveling: {
    korteSamenvatting: string;
    isRendabel: boolean;
    besteScenario: 'huidig' | 'na2027' | 'dynamischOptimaal';
    waarschuwingen: string[];
  };
  aannamen: {
    roundTripEfficiency: number;
    aantalCycli: number;
    degradatie: string;
    energiebelasting: number;
    salderingTot2027: boolean;
    minimaleVergoeding2027: string;
  };
}

export interface ChartDataPoint {
  jaar: number;
  huidig: number;
  na2027: number;
  dynamisch: number;
}

