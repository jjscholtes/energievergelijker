import { UserProfile } from '@/types/user';
import { ContractData } from '@/types/contracts';
import { BerekeningResult, StroomKosten, GasKosten, PvOpbrengsten } from '@/types/calculations';
import { berekenGasbelasting, berekenGasNetbeheer } from './gasStaffels';
import { berekenSaldering } from './saldering';
import { getNetbeheerderKosten } from './netbeheerderKosten';

/**
 * Hoofdberekening engine voor energiecontracten
 */
export const berekenEnergiekosten = (
  userProfile: UserProfile,
  contract: ContractData
): BerekeningResult => {
  // Haal netbeheerder kosten op
  const netbeheerderKosten = getNetbeheerderKosten(userProfile);

  // Berekening stroomkosten - SIMPEL!
  const stroomKosten = berekenStroomkosten(
    userProfile.jaarverbruikStroom,
    contract.tarieven.stroomKalePrijs || 0.25, // alleen voor enkel tarief contracts
    userProfile.aansluitingElektriciteit,
    netbeheerderKosten.stroom,
    contract.vasteLeveringskosten,
    userProfile.jaarverbruikStroomPiek,
    userProfile.jaarverbruikStroomDal,
    contract.tarieven.stroomKalePrijsPiek,
    contract.tarieven.stroomKalePrijsDal
  );

  // Berekening gaskosten (alleen als geenGas false is)
  const gasKosten = userProfile.geenGas ? {
    kaleEnergie: 0,
    energiebelasting: 0,
    btw: 0,
    netbeheer: 0,
    totaal: 0
  } : berekenGaskosten(
    userProfile.jaarverbruikGas,
    contract.tarieven.gasKalePrijs,
    userProfile.aansluitingGas,
    netbeheerderKosten.gas
  );

  // Vaste kosten
  const vasteKostenJaar = contract.vasteLeveringskosten * 12;

  // Totale kosten zonder PV
  // vasteKostenJaar is al meegenomen in stroomKosten.totaal, dus niet dubbel tellen
  const totaleJaarkosten = stroomKosten.totaal + gasKosten.totaal - contract.kortingEenmalig;

  // PV opbrengsten berekenen (indien van toepassing)
  let pvOpbrengsten: PvOpbrengsten | undefined;
  let totaleJaarkostenMetPv = totaleJaarkosten;

  if (userProfile.heeftZonnepanelen && userProfile.pvOpwek && userProfile.percentageZelfverbruik) {
    pvOpbrengsten = berekenSaldering(
      userProfile.pvOpwek,
      userProfile.jaarverbruikStroom,
      userProfile.percentageZelfverbruik,
      contract.tarieven.stroomKalePrijs || contract.tarieven.stroomKalePrijsPiek || 0.25, // Gebruik ingevulde tarieven
      contract.tarieven.terugleververgoeding,
      contract.type as 'vast' | 'dynamisch',
      1.0, // salderingsPercentage
      contract.tarieven.vasteTerugleverkosten || 0 // Ingevulde terugleverkosten
    );

    // Trek PV opbrengsten af van totale kosten
    totaleJaarkostenMetPv = totaleJaarkosten - pvOpbrengsten.totaleOpbrengst;
  }

  // Maandlasten berekenen
  const maandlastenGemiddeld = totaleJaarkostenMetPv / 12;

  return {
    totaleJaarkosten,
    totaleJaarkostenMetPv,
    maandlastenGemiddeld,
    stroomKosten,
    gasKosten,
    pvOpbrengsten,
    positieInRanking: 0, // Wordt later bepaald bij vergelijking
    verschilMetGoedkoopste: 0, // Wordt later bepaald bij vergelijking
    contract: {
      leverancier: contract.leverancier,
      productNaam: contract.productNaam,
      type: contract.type,
      tarieven: contract.tarieven
    },
    userProfile: {
      jaarverbruikStroom: userProfile.jaarverbruikStroom,
      jaarverbruikStroomPiek: userProfile.jaarverbruikStroomPiek,
      jaarverbruikStroomDal: userProfile.jaarverbruikStroomDal,
      jaarverbruikGas: userProfile.jaarverbruikGas
    }
  };
};

/**
 * Berekent de stroomkosten inclusief alle belastingen en netbeheerkosten
 * Ondersteunt zowel enkel tarief als piek/dal tarieven
 */
function berekenStroomkosten(
  verbruikKwh: number,
  kalePrijs: number,
  aansluiting: UserProfile['aansluitingElektriciteit'],
  netbeheerKosten: number,
  vasteLeveringskostenMaand: number = 0,
  verbruikPiek?: number,
  verbruikDal?: number,
  kalePrijsPiek?: number,
  kalePrijsDal?: number
): StroomKosten {
  // 1. Kale energie (inclusief BTW) - gebruik piek/dal als beschikbaar
  let kaleEnergie: number;
  if (verbruikPiek && verbruikDal && kalePrijsPiek && kalePrijsDal) {
    // Piek/dal tarieven
    kaleEnergie = (verbruikPiek * kalePrijsPiek) + (verbruikDal * kalePrijsDal);
  } else {
    // Enkel tarief - gebruik de CALCULATED kalePrijs (zonder fallback naar 0.25)
    kaleEnergie = verbruikKwh * kalePrijs;
  }

  // 2. Energiebelasting stroom (2025 tarief) - inclusief BTW
  const energiebelasting = verbruikKwh * 0.1316; // €/kWh (€0,1088 * 1,21)

  // 3. Netbeheerkosten (vast bedrag per jaar)
  const netbeheer = netbeheerKosten;

  // 4. Vermindering energiebelasting (heffingskorting) - €631.35 per jaar
  const heffingskorting = 631.35;

  // 5. Vaste leveringskosten (jaarlijks)
  const vasteLeveringskostenJaar = vasteLeveringskostenMaand * 12;

  // Totale kosten: kale energie + energiebelasting (incl BTW) + netbeheer + vaste leveringskosten - heffingskorting
  const totaal = kaleEnergie + energiebelasting + netbeheer + vasteLeveringskostenJaar - heffingskorting;

  return {
    kaleEnergie,
    energiebelasting,
    btw: 0, // Geen aparte BTW meer
    netbeheer,
    vasteLeveringskosten: vasteLeveringskostenJaar,
    vasteLeveringskostenTarief: vasteLeveringskostenMaand,
    totaal
  };
};

/**
 * Berekent de gaskosten inclusief alle belastingen en netbeheerkosten
 * Opbouw: kale prijs, energiebelasting (incl BTW), netbeheer
 */
function berekenGaskosten(
  verbruikM3: number,
  kalePrijs: number,
  aansluiting: UserProfile['aansluitingGas'],
  netbeheerKosten: number
): GasKosten {
  // 1. Kale energie (inclusief BTW)
  const kaleEnergie = verbruikM3 * kalePrijs;

  // 2. Gestaffelde energiebelasting gas (inclusief BTW)
  const energiebelastingExclBtw = berekenGasbelasting(verbruikM3);
  const energiebelastingBtw = energiebelastingExclBtw * 0.21;
  const energiebelasting = energiebelastingExclBtw + energiebelastingBtw; // Inclusief BTW

  // 3. Netbeheerkosten (vast bedrag per jaar)
  const netbeheer = netbeheerKosten;

  const totaal = kaleEnergie + energiebelasting + netbeheer;

  return {
    kaleEnergie,
    energiebelasting,
    btw: 0, // Geen aparte BTW meer
    netbeheer,
    totaal
  };
};

/**
 * Berekent netbeheerkosten voor stroom
 * Gebaseerd op vaste jaarlijkse kosten per netbeheerder uit "Overzicht Kostencomponenten Energie"
 */
function berekenStroomNetbeheer(
  verbruikKwh: number,
  aansluiting: UserProfile['aansluitingElektriciteit']
): number {
  // Vaste jaarlijkse kosten per netbeheerder (gemiddelde van Liander, Stedin, Enexis)
  // Liander: ~€471, Stedin: ~€490, Enexis: ~€492
  const gemiddeldeNetbeheerKosten = 485; // €/jaar (gemiddelde van de drie grote netbeheerders)

  return gemiddeldeNetbeheerKosten;
};
