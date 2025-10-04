export interface ContractData {
  leverancier: string;
  productNaam: string;
  type: "vast" | "variabel" | "dynamisch";
  looptijdMaanden: number;
  
  // Leverancier kosten
  vasteLeveringskosten: number;        // €/maand
  tarieven: {
    stroomKalePrijs?: number;          // €/kWh (deprecated, gebruik piek/dal)
    stroomKalePrijsPiek?: number;      // €/kWh piek tarief
    stroomKalePrijsDal?: number;       // €/kWh dal tarief
    gasKalePrijs: number;              // €/m³
    terugleververgoeding: number;      // €/kWh
    vasteTerugleverkosten?: number;    // €/jaar bij PV
  };
  
  // Marketing
  kortingEenmalig: number;             // €
  duurzaamheidsScore: number;          // 0-10
  klanttevredenheid: number;           // 0-10
}

