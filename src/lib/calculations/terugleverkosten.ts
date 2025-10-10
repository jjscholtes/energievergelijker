/**
 * Berekent terugleverkosten op basis van jaarlijkse teruglevering
 * Gebaseerd op staffel van de gebruiker
 */

export interface TerugleverkostenStaffel {
  minKwh: number;
  maxKwh: number;
  kostenPerMaand: number;
  kostenPerJaar: number;
}

export const TERUGLEVERKOSTEN_STAFFEL: TerugleverkostenStaffel[] = [
  { minKwh: 0, maxKwh: 5, kostenPerMaand: 0.00, kostenPerJaar: 0.00 },
  { minKwh: 5, maxKwh: 500, kostenPerMaand: 3.00, kostenPerJaar: 36.00 },
  { minKwh: 500, maxKwh: 1000, kostenPerMaand: 7.50, kostenPerJaar: 90.00 },
  { minKwh: 1000, maxKwh: 1500, kostenPerMaand: 13.50, kostenPerJaar: 162.00 },
  { minKwh: 1500, maxKwh: 2000, kostenPerMaand: 17.50, kostenPerJaar: 210.00 },
  { minKwh: 2000, maxKwh: 2500, kostenPerMaand: 23.00, kostenPerJaar: 276.00 },
  { minKwh: 2500, maxKwh: 3000, kostenPerMaand: 29.00, kostenPerJaar: 348.00 },
  { minKwh: 3000, maxKwh: 3500, kostenPerMaand: 36.50, kostenPerJaar: 438.00 },
  { minKwh: 3500, maxKwh: 4000, kostenPerMaand: 42.00, kostenPerJaar: 504.00 },
  { minKwh: 4000, maxKwh: 4500, kostenPerMaand: 48.00, kostenPerJaar: 576.00 },
  { minKwh: 4500, maxKwh: 5000, kostenPerMaand: 53.50, kostenPerJaar: 642.00 },
  { minKwh: 5000, maxKwh: 5500, kostenPerMaand: 58.50, kostenPerJaar: 702.00 },
  { minKwh: 5500, maxKwh: 6000, kostenPerMaand: 64.50, kostenPerJaar: 774.00 },
  { minKwh: 6000, maxKwh: 6500, kostenPerMaand: 70.00, kostenPerJaar: 840.00 },
  { minKwh: 6500, maxKwh: 7000, kostenPerMaand: 77.00, kostenPerJaar: 924.00 },
  { minKwh: 7000, maxKwh: 7500, kostenPerMaand: 81.00, kostenPerJaar: 972.00 },
  { minKwh: 7500, maxKwh: 8000, kostenPerMaand: 89.00, kostenPerJaar: 1068.00 },
  { minKwh: 8000, maxKwh: 8500, kostenPerMaand: 93.00, kostenPerJaar: 1116.00 },
  { minKwh: 8500, maxKwh: 9000, kostenPerMaand: 101.50, kostenPerJaar: 1218.00 },
  { minKwh: 9000, maxKwh: 9500, kostenPerMaand: 102.00, kostenPerJaar: 1224.00 },
  { minKwh: 9500, maxKwh: 10000, kostenPerMaand: 112.00, kostenPerJaar: 1344.00 },
  { minKwh: 10000, maxKwh: 12500, kostenPerMaand: 126.50, kostenPerJaar: 1518.00 },
  { minKwh: 12500, maxKwh: 15000, kostenPerMaand: 157.50, kostenPerJaar: 1890.00 },
  { minKwh: 15000, maxKwh: 17500, kostenPerMaand: 181.00, kostenPerJaar: 2172.00 },
  { minKwh: 17500, maxKwh: 20000, kostenPerMaand: 214.00, kostenPerJaar: 2568.00 },
  { minKwh: 20000, maxKwh: Infinity, kostenPerMaand: 252.00, kostenPerJaar: 3024.00 },
];

/**
 * Berekent terugleverkosten op basis van jaarlijkse teruglevering in kWh
 */
export function berekenTerugleverkosten(jaarlijkseTerugleveringKwh: number): number {
  if (jaarlijkseTerugleveringKwh <= 0) {
    return 0;
  }

  // Zoek de juiste staffel
  const staffel = TERUGLEVERKOSTEN_STAFFEL.find(s => 
    jaarlijkseTerugleveringKwh >= s.minKwh && jaarlijkseTerugleveringKwh <= s.maxKwh
  );

  if (!staffel) {
    // Voor teruglevering boven de hoogste staffel (20,000+ kWh), gebruik de hoogste staffel
    return TERUGLEVERKOSTEN_STAFFEL[TERUGLEVERKOSTEN_STAFFEL.length - 1].kostenPerJaar;
  }

  return staffel.kostenPerJaar;
}

/**
 * Berekent terugleververgoeding voor vaste contracten
 * Voor dynamische contracten wordt de spotprijs gebruikt
 */
export function berekenTerugleververgoeding(
  nettoTerugleveringKwh: number,
  contractType: 'vast' | 'dynamisch',
  terugleververgoedingPerKwh: number = 0.01 // €0.01/kWh voor vaste contracten
): number {
  if (nettoTerugleveringKwh <= 0) {
    return 0;
  }

  if (contractType === 'dynamisch') {
    // Voor dynamische contracten wordt de spotprijs gebruikt
    return nettoTerugleveringKwh * terugleververgoedingPerKwh;
  }

  // Voor vaste contracten: vaste vergoeding per kWh
  return nettoTerugleveringKwh * terugleververgoedingPerKwh;
}
