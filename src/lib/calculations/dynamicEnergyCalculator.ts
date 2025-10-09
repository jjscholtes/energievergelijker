import Papa from 'papaparse';
import { parseISO } from 'date-fns';
import { UserProfile } from '@/types/user';
import { ContractData } from '@/types/contracts';
import { DynamicContractData } from '@/types/dynamicContracts';
import { BerekeningResult, StroomKosten, GasKosten, PvOpbrengsten } from '@/types/calculations';
import { berekenGasbelasting, berekenGasNetbeheer } from './gasStaffels';
import { berekenSaldering } from './saldering';
import { getNetbeheerderKosten } from './netbeheerderKosten';

/**
 * Geïntegreerde dynamische energiecalculator
 * Verwerkt alle componenten: dynamische prijzen, belastingen, netbeheer, saldering
 */
export const berekenDynamischeEnergiekosten = async (
  userProfile: UserProfile,
  contract: DynamicContractData,
  csvData2024: string,
  csvData2025: string,
  year: '2024' | '2025' = '2024'
): Promise<BerekeningResult> => {
  try {
    // 1. Parse CSV data
    const priceMap2024 = parseCSV(csvData2024);
    const priceMap2025 = parseCSV(csvData2025);
    const priceMap = year === '2024' ? priceMap2024 : priceMap2025;

    if (Object.keys(priceMap).length === 0) {
      throw new Error('Geen geldige prijsdata gevonden in CSV');
    }

    // 2. Bereken gemiddelde spotprijs voor het jaar
    const timestamps = Object.keys(priceMap).sort();
    const gemiddeldeSpotPrijs = timestamps.length > 0 
      ? timestamps.reduce((sum, ts) => sum + priceMap[ts], 0) / timestamps.length 
      : 0.085; // Fallback prijs

    // 3. Bereken kosten op basis van jaarverbruik en gebruiker input basisprijs
    const basisprijs = contract.tarieven?.stroomKalePrijs || gemiddeldeSpotPrijs;
    const totaleKaleEnergie = userProfile.jaarverbruikStroom * basisprijs;
    const totaleEnergiebelasting = userProfile.jaarverbruikStroom * 0.1316; // €/kWh (€0,1088 * 1,21)
    const totaleStroomKosten = totaleKaleEnergie + totaleEnergiebelasting;

    // Constantes voor berekeningen (2025 tarieven)
    const HEFFINGSKORTING = 631.35; // €/jaar vermindering energiebelasting
    
    // Haal netbeheerder kosten op (wordt later gebruikt)
    const netbeheerderKosten = getNetbeheerderKosten(userProfile);

    // Netbeheerkosten zijn jaarlijks vast
    const totaleNetbeheer = netbeheerderKosten.stroom;

    // Pas heffingskorting toe op totale stroomkosten
    const totaleStroomKostenMetKorting = totaleStroomKosten - HEFFINGSKORTING;

    // 5. Bereken gas kosten (alleen als geenGas false is)
    const gasKosten = userProfile.geenGas ? {
      kaleEnergie: 0,
      energiebelasting: 0,
      btw: 0,
      netbeheer: 0,
      totaal: 0
    } : {
      kaleEnergie: userProfile.jaarverbruikGas * 0.30, // Gemiddelde gasprijs voor dynamische contracten
      energiebelasting: berekenGasbelasting(userProfile.jaarverbruikGas) * 1.21, // Inclusief BTW
      btw: 0, // Geen aparte BTW meer
      netbeheer: netbeheerderKosten.gas, // Vaste jaarlijkse kosten
      totaal: 0 // Wordt hieronder berekend
    };

    // Bereken totaal voor gas (alleen als geenGas false is)
    if (!userProfile.geenGas) {
      gasKosten.totaal = gasKosten.kaleEnergie + gasKosten.energiebelasting + gasKosten.netbeheer;
    }

    // 6. Vaste kosten
    const vasteKostenJaar = contract.vasteLeveringskosten * 12;
    
    // 7. Maandelijkse vergoeding (nieuwe kosten)
    const maandelijkseVergoedingJaar = contract.maandelijkseVergoeding * 12;
    
    // 8. Opslag per kWh voor afname (nieuwe kosten)
    // Opslag wordt alleen toegepast op afname van het net, niet op invoeding
    const opslagKosten = userProfile.jaarverbruikStroom * contract.opslagPerKwh;

    // 9. Totale kosten zonder PV (met heffingskorting)
    const totaleJaarkosten = totaleStroomKostenMetKorting + gasKosten.totaal + vasteKostenJaar + maandelijkseVergoedingJaar + opslagKosten;

    // 8. PV opbrengsten berekenen (indien van toepassing)
    let pvOpbrengsten: PvOpbrengsten | undefined;
    let totaleJaarkostenMetPv = totaleJaarkosten;

    if (userProfile.heeftZonnepanelen && userProfile.pvOpwek && userProfile.percentageZelfverbruik !== undefined) {
      // Voor dynamische contracten gebruiken we de basisprijs voor saldering en terugleververgoeding voor PV opbrengsten
      
      pvOpbrengsten = berekenSaldering(
        userProfile.pvOpwek,
        userProfile.jaarverbruikStroom,
        userProfile.percentageZelfverbruik,
        basisprijs, // Gebruik basisprijs (gebruiker input)
        contract.tarieven?.terugleververgoeding || basisprijs, // Gebruik terugleververgoeding of fallback naar basisprijs
        'dynamisch', // Dynamische contracten gebruiken basisprijs
        1.0, // salderingsPercentage
        0 // Dynamische contracten hebben geen terugleverkosten
      );

      // Trek PV opbrengsten af van totale kosten
      totaleJaarkostenMetPv = totaleJaarkosten - pvOpbrengsten.totaleOpbrengst;
    }

    // 8. Maandlasten berekenen
    const maandlastenGemiddeld = totaleJaarkostenMetPv / 12;

    // 10. Stroomkosten object samenstellen
    const stroomKosten: StroomKosten = {
      kaleEnergie: totaleKaleEnergie,
      energiebelasting: totaleEnergiebelasting,
      btw: 0, // Geen aparte BTW meer
      netbeheer: totaleNetbeheer,
      vasteLeveringskosten: contract.vasteLeveringskosten * 12, // Jaarlijkse vaste leveringskosten
      vasteLeveringskostenTarief: contract.vasteLeveringskosten, // Maandelijkse tarief
      maandelijkseVergoeding: maandelijkseVergoedingJaar,
      opslagPerKwh: opslagKosten,
      maandelijkseVergoedingTarief: contract.maandelijkseVergoeding,
      opslagPerKwhTarief: contract.opslagPerKwh,
      totaal: totaleStroomKostenMetKorting + maandelijkseVergoedingJaar + opslagKosten // Zonder vaste leveringskosten
    };

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
        productNaam: contract.productNaam || 'Dynamisch Contract',
        type: contract.type,
        kortingEenmalig: contract.kortingEenmalig,
        tarieven: {
          stroomKalePrijs: basisprijs, // Gebruiker input basisprijs
          gasKalePrijs: contract.tarieven?.gasKalePrijs || 1.20,
          terugleververgoeding: contract.tarieven?.terugleververgoeding || basisprijs
        }
      },
      userProfile: {
        jaarverbruikStroom: userProfile.jaarverbruikStroom, // Origineel verbruik zoals ingevoerd
        jaarverbruikStroomPiek: userProfile.jaarverbruikStroomPiek,
        jaarverbruikStroomDal: userProfile.jaarverbruikStroomDal,
        jaarverbruikGas: userProfile.jaarverbruikGas
      }
    };
  } catch (error) {
    throw new Error(`Fout bij dynamische berekening: ${error instanceof Error ? error.message : 'Onbekende fout'}`);
  }
};

/**
 * Berekent de gaskosten inclusief alle belastingen en netbeheerkosten
 */
const berekenGaskosten = (
  verbruikM3: number,
  kalePrijs: number,
  aansluiting: UserProfile['aansluitingGas']
): GasKosten => {
  // Kale energie
  const kaleEnergie = verbruikM3 * kalePrijs;

  // Gestaffelde energiebelasting gas
  const energiebelasting = berekenGasbelasting(verbruikM3);

  // BTW (21%)
  const btw = (kaleEnergie + energiebelasting) * 0.21;

  // Netbeheerkosten
  const netbeheer = berekenGasNetbeheer(verbruikM3, aansluiting);

  const totaal = kaleEnergie + energiebelasting + btw + netbeheer;

  return {
    kaleEnergie,
    energiebelasting,
    btw,
    netbeheer,
    totaal
  };
};


/**
 * Parse CSV data naar price map - SYNCHRONOUS VERSION
 */
function parseCSV(csv: string): Record<string, number> {
  const result: Record<string, number> = {};
  
  if (!csv || csv.trim().length === 0) {
    return result;
  }

  try {
    // Gebruik Papa.parseSync voor synchrone parsing
    const parsed = Papa.parse(csv, {
      header: true,
      skipEmptyLines: true
    });

    if (parsed.errors && parsed.errors.length > 0) {
      console.warn('CSV parse errors:', parsed.errors);
    }

    (parsed.data as any[]).forEach(row => {
      // Probeer verschillende timestamp kolommen
      const timestampKey = Object.keys(row).find(key => 
        key.toLowerCase().includes('timestamp') || 
        key.toLowerCase().includes('time') ||
        key.toLowerCase().includes('datetime')
      );
      
      const priceKey = Object.keys(row).find(key => 
        key.toLowerCase().includes('price') || 
        key.toLowerCase().includes('prijs') ||
        key.toLowerCase().includes('tarief')
      );

      if (timestampKey && priceKey) {
        try {
          const ts = parseISO(row[timestampKey]);
          const price = parseFloat(row[priceKey]);
          
          if (!isNaN(price) && ts instanceof Date && !isNaN(ts.getTime())) {
            result[ts.toISOString()] = price;
          }
        } catch (parseError) {
          console.warn(`Fout bij parsen van rij: ${JSON.stringify(row)}`);
        }
      }
    });
  } catch (error) {
    console.error('CSV parsing gefaald:', error);
    // Return empty result instead of throwing
    return {};
  }

  return result;
}

/**
 * Helper functie om prijsstatistieken te berekenen
 */
export function calculatePriceStats(csvData: string): {
  min: number;
  max: number;
  average: number;
  median: number;
} {
  const priceMap = parseCSV(csvData);
  const prices = Object.values(priceMap).sort((a, b) => a - b);
  
  if (prices.length === 0) {
    return { min: 0, max: 0, average: 0, median: 0 };
  }
  
  const min = prices[0];
  const max = prices[prices.length - 1];
  const average = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  const median = prices.length % 2 === 0 
    ? (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2
    : prices[Math.floor(prices.length / 2)];
  
  return { min, max, average, median };
}
