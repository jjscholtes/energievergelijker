import { UserProfile } from '@/types/user';
import { bepaalNetbeheerder, getAlleNetbeheerders, Netbeheerder } from '@/lib/data/netbeheerders';

/**
 * Haalt de netbeheerder kosten op voor een gebruiker
 */
export function getNetbeheerderKosten(userProfile: UserProfile): { stroom: number; gas: number; netbeheerder: string } {
  let netbeheerder: Netbeheerder | null = null;
  let netbeheerderNaam = 'Onbekend';

  // Gebruik ALTIJD de geselecteerde netbeheerder als die er is
  if (userProfile.netbeheerder) {
    const alleNetbeheerders = getAlleNetbeheerders();
    netbeheerder = alleNetbeheerders.find(nb => nb.naam === userProfile.netbeheerder) || null;
    if (netbeheerder) {
      netbeheerderNaam = netbeheerder.naam;
    }
  }

  // Alleen als geen netbeheerder geselecteerd, probeer postcode lookup
  if (!netbeheerder && userProfile.postcode) {
    netbeheerder = bepaalNetbeheerder(userProfile.postcode);
    if (netbeheerder) {
      netbeheerderNaam = netbeheerder.naam;
    }
  }

  // Fallback naar gemiddelde kosten als geen netbeheerder gevonden
  if (!netbeheerder) {
    const alleNetbeheerders = getAlleNetbeheerders();
    const gemiddeldeStroom = alleNetbeheerders.reduce((sum, nb) => sum + nb.kostenStroom, 0) / alleNetbeheerders.length;
    const gemiddeldeGas = alleNetbeheerders.reduce((sum, nb) => sum + nb.kostenGas, 0) / alleNetbeheerders.length;
    
    return {
      stroom: Math.round(gemiddeldeStroom),
      gas: Math.round(gemiddeldeGas),
      netbeheerder: 'Gemiddelde kosten'
    };
  }

  return {
    stroom: netbeheerder.kostenStroom,
    gas: netbeheerder.kostenGas,
    netbeheerder: netbeheerderNaam
  };
}

/**
 * Controleert of een postcode een netbeheerder heeft
 */
export function heeftNetbeheerderVoorPostcode(postcode: string): boolean {
  return bepaalNetbeheerder(postcode) !== null;
}
