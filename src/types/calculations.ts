export interface PvOpbrengsten {
  zelfVerbruikKwh: number;
  zelfVerbruikWaarde: number;        // €, informatief
  terugleveringKwh: number;          // Totale teruglevering naar het net
  afnameVanNetKwh: number;           // Afname van het net na zelfverbruik
  gesaldeerdKwh: number;
  salderingsBesparing: number;       // € bespaard door saldering
  nettoTerugleveringKwh: number;
  terugleververgoedingBedrag: number; // €
  terugleverkosten: number;          // € kosten voor teruglevering
  totaleOpbrengst: number;           // € saldering + vergoeding - kosten
}

export interface StroomKosten {
  kaleEnergie: number;
  energiebelasting: number;
  btw: number;
  netbeheer: number;
  vasteLeveringskosten?: number;    // €/jaar voor vaste contracten
  vasteLeveringskostenTarief?: number; // €/maand voor vaste contracten
  maandelijkseVergoeding?: number;  // €/jaar voor dynamische contracten
  opslagPerKwh?: number;            // €/jaar voor dynamische contracten
  maandelijkseVergoedingTarief?: number;  // €/maand voor dynamische contracten
  opslagPerKwhTarief?: number;           // €/kWh voor dynamische contracten
  totaal: number;
}

export interface GasKosten {
  kaleEnergie: number;
  energiebelasting: number;          // Gestaffeld
  btw: number;
  netbeheer: number;
  totaal: number;
}

export interface BerekeningResult {
  // Hoofdresultaten
  totaleJaarkosten: number;
  totaleJaarkostenMetPv: number;       // Met PV-opbrengsten
  maandlastenGemiddeld: number;
  
  // Details stroom
  stroomKosten: StroomKosten;
  
  // Details gas
  gasKosten: GasKosten;
  
  // PV details (alleen bij zonnepanelen)
  pvOpbrengsten?: PvOpbrengsten;
  
  // Vergelijking
  positieInRanking: number;
  verschilMetGoedkoopste: number;      // €
  
  // Contract info
  contract: {
    leverancier: string;
    productNaam: string;
    type: string;
    tarieven?: {
      stroomKalePrijs?: number;
      stroomKalePrijsPiek?: number;
      stroomKalePrijsDal?: number;
      gasKalePrijs: number;
      terugleververgoeding: number;
    };
  };
  
  // User profile (voor detailweergave)
  userProfile?: {
    jaarverbruikStroom: number;
    jaarverbruikStroomPiek?: number;
    jaarverbruikStroomDal?: number;
    jaarverbruikGas: number;
  };
}

