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
  { minKwh: 1, maxKwh: 250, kostenPerMaand: 0.00, kostenPerJaar: 0.00 },
  { minKwh: 251, maxKwh: 500, kostenPerMaand: 3.00, kostenPerJaar: 36.00 },
  { minKwh: 501, maxKwh: 750, kostenPerMaand: 7.00, kostenPerJaar: 84.00 },
  { minKwh: 751, maxKwh: 1000, kostenPerMaand: 12.00, kostenPerJaar: 144.00 },
  { minKwh: 1001, maxKwh: 1500, kostenPerMaand: 16.00, kostenPerJaar: 192.00 },
  { minKwh: 1501, maxKwh: 2000, kostenPerMaand: 22.00, kostenPerJaar: 264.00 },
  { minKwh: 2001, maxKwh: 2500, kostenPerMaand: 29.00, kostenPerJaar: 348.00 },
  { minKwh: 2501, maxKwh: 3000, kostenPerMaand: 36.50, kostenPerJaar: 438.00 },
  { minKwh: 3001, maxKwh: 3500, kostenPerMaand: 44.00, kostenPerJaar: 528.00 },
  { minKwh: 3501, maxKwh: 4000, kostenPerMaand: 52.00, kostenPerJaar: 624.00 },
  { minKwh: 4001, maxKwh: 4500, kostenPerMaand: 59.00, kostenPerJaar: 708.00 },
  { minKwh: 4501, maxKwh: 5000, kostenPerMaand: 67.00, kostenPerJaar: 804.00 },
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
    // Voor teruglevering boven 5000 kWh, gebruik de hoogste staffel
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
