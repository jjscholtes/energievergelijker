export interface DynamicContractData {
  leverancier: string;
  productNaam: string;
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

