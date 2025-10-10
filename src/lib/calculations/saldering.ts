import { PvOpbrengsten } from '@/types/calculations';
import { berekenTerugleververgoeding, berekenTerugleverkosten } from './terugleverkosten';

/**
 * Berekent de saldering en PV opbrengsten
 * Dit is de meest complexe berekening in de applicatie
 */
export const berekenSaldering = (
  pvOpwek: number,
  jaarverbruik: number,
  percentageZelfverbruik: number,
  stroomKalePrijs: number,
  terugleververgoeding: number,
  contractType: 'vast' | 'dynamisch',
  salderingsPercentage: number = 1.0  // 1.0 t/m 2026
): PvOpbrengsten => {
  // Stap 1: Verdeel PV opwek
  const zelfVerbruikKwh = pvOpwek * (percentageZelfverbruik / 100);
  const terugleveringKwh = pvOpwek - zelfVerbruikKwh;
  const afnameVanNetKwh = Math.max(0, jaarverbruik - zelfVerbruikKwh);

  // Stap 2: Saldering toepassen
  const gesaldeerdKwh = Math.min(afnameVanNetKwh, terugleveringKwh) * salderingsPercentage;
  const nettoTerugleveringKwh = Math.max(0, terugleveringKwh - afnameVanNetKwh);

  // Stap 3: Financiële impact
  const ENERGIEBELASTING_STROOM = 0.13163; // €/kWh
  const BTW = 0.21;

  // Saldering besparing gaat alleen over de energiebelasting (€0.1316/kWh)
  const salderingsBesparing = gesaldeerdKwh * ENERGIEBELASTING_STROOM;

  // Berekent terugleververgoeding op basis van contract type
  // Voor vaste contracten: vergoeding over totale teruglevering (niet alleen netto)
  const terugleververgoedingBedrag = berekenTerugleververgoeding(
    terugleveringKwh, // Totale teruglevering, niet alleen netto
    contractType,
    terugleververgoeding // Gebruik ingevulde waarde
  );

  // Berekent terugleverkosten dynamisch op basis van teruglevering kWh
  // Alleen voor vaste contracten - dynamische contracten hebben geen terugleverkosten
  const terugleverkosten = contractType === 'vast' ? berekenTerugleverkosten(terugleveringKwh) : 0;

  // Informatieve waarde van zelfverbruik
  const zelfVerbruikWaarde = zelfVerbruikKwh * (stroomKalePrijs + ENERGIEBELASTING_STROOM) * (1 + BTW);

  return {
    zelfVerbruikKwh,
    zelfVerbruikWaarde,
    terugleveringKwh,
    afnameVanNetKwh,
    gesaldeerdKwh,
    salderingsBesparing,
    nettoTerugleveringKwh,
    terugleververgoedingBedrag,
    terugleverkosten,
    totaleOpbrengst: salderingsBesparing + terugleververgoedingBedrag - terugleverkosten
  };
};

