/**
 * Berekent de gestaffelde energiebelasting voor gas
 * Gebaseerd op de Nederlandse belastingtarieven 2024
 */
export const berekenGasbelasting = (verbruikM3: number): number => {
  const staffels = [
    { vanaf: 0, tot: 1000, tarief: 0.70544 },
    { vanaf: 1000, tot: 170000, tarief: 0.70544 },
    { vanaf: 170000, tot: 1000000, tarief: 0.31573 },
    { vanaf: 1000000, tot: 10000000, tarief: 0.20347 },
    { vanaf: 10000000, tot: Infinity, tarief: 0.05385 }
  ];

  let belasting = 0;
  let resterendVerbruik = verbruikM3;

  for (const staffel of staffels) {
    const verbruikInStaffel = Math.min(resterendVerbruik, staffel.tot - staffel.vanaf);
    if (verbruikInStaffel > 0) {
      belasting += verbruikInStaffel * staffel.tarief;
      resterendVerbruik -= verbruikInStaffel;
    }
  }

  return belasting;
};

/**
 * Berekent de netbeheerkosten voor gas
 * Gebaseerd op vaste jaarlijkse kosten per netbeheerder uit "Overzicht Kostencomponenten Energie"
 */
export const berekenGasNetbeheer = (
  verbruikM3: number,
  aansluiting: "G4" | "G6" | "G10" | "G16" | "G25"
): number => {
  // Vaste jaarlijkse kosten per netbeheerder (gemiddelde van Liander, Stedin, Enexis)
  // Liander: ~€248, Stedin: ~€268, Enexis: ~€254
  const gemiddeldeGasNetbeheerKosten = 257; // €/jaar (gemiddelde van de drie grote netbeheerders)

  return gemiddeldeGasNetbeheerKosten;
};
