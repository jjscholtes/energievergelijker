/**
 * Type definities voor thuisaccu terugverdientijd calculator
 */

export interface BatteryProfile {
  capaciteitKwh: number;           // Capaciteit in kWh (bijv. 10 kWh)
  prijsEuro: number;                // Aanschafprijs inclusief installatie (€)
  roundTripEfficiency: number;      // Rendement heen-en-terug (0.90 = 90%)
  garantieJaren: number;            // Garantie periode in jaren
  degradatiePerJaar: number;        // Capaciteitsverlies per jaar (0.02 = 2%)
}

export interface BatteryInput {
  battery: BatteryProfile;
  heeftZonnepanelen: boolean;
  pvOpwekKwh?: number;              // Jaarlijkse PV opbrengst
  huidigEigenverbruikPercentage?: number;  // Huidig eigenverbruik % (zonder accu)
  eigenverbruikMetAccuPercentage?: number; // Eigenverbruik % met accu
  jaarverbruikStroom: number;       // Totaal jaarverbruik in kWh
  contractType: 'vast' | 'dynamisch';
  stroomKalePrijs: number;          // €/kWh
  terugleververgoeding: number;     // €/kWh
  netbeheerder?: string;            // Voor netbeheerkosten lookup
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

