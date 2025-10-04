export interface DynamicContractData {
  leverancier: string;
  productNaam?: string; // Optioneel gemaakt
  type: "dynamisch";
  looptijdMaanden: number;
  vasteLeveringskosten: number;
  csvData2024: string;
  csvData2025: string;
  kortingEenmalig: number;
  duurzaamheidsScore: number;
  klanttevredenheid: number;
  terugleververgoeding: number;
  maandelijkseVergoeding: number;  // €/maand (bijv. €5.99)
  opslagPerKwh: number;           // €/kWh voor afname (bijv. €0.02)
  tarieven: {
    stroomKalePrijs?: number;          // €/kWh (deprecated, gebruik piek/dal)
    stroomKalePrijsPiek?: number;      // €/kWh piek tarief
    stroomKalePrijsDal?: number;       // €/kWh dal tarief
    gasKalePrijs: number;              // €/m³
    terugleververgoeding: number;      // €/kWh
    vasteTerugleverkosten?: number;    // €/jaar bij PV
  };
}

export interface DynamicCalcParams {
  csvData2024: string;    // raw CSV-tekst
  csvData2025: string;
  baseLoad: number;       // kWh/uur
  wpProfile?: Record<string, number>;  // ISO timestamp → kWh
  evProfile?: Record<string, number>;
  fixedCosts?: number;
  year: '2024' | '2025';
  monteCarlo?: boolean;
  mcIterations?: number;
  mcBlockDays?: number;
}

export interface DynamicCostResult {
  median?: number;
  P10?: number;
  P90?: number;
  mean?: number;
  std?: number;
  totalCost?: number;
}

