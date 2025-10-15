'use client';

import { useState, useCallback, useEffect } from 'react';
import { Calculator } from 'lucide-react';
import { berekenEnergiekosten } from '@/lib/calculations/energyCalculator';
import { berekenDynamischeEnergiekosten } from '@/lib/calculations/dynamicEnergyCalculator';
import { dynamicContracts, generateRealisticCSVData } from '@/lib/data/sampleDynamicData';
import { leveranciers } from '@/lib/data/leveranciers';
import { ContractAdviesForm } from '@/components/energie-advies/ContractAdviesForm';
import { getAlleNetbeheerders } from '@/lib/data/netbeheerders';
import { BerekeningResult } from '@/types/calculations';

interface ContractAdviesProps {
  className?: string;
  onResultChange?: (result: ContractAdviesResult | null) => void;
}

interface NetbeheerderData {
  netbeheerder: string;
  stroomVastrecht: number;
  gasVastrecht: number;
  stroomVariabel: number;
  gasVariabel: number;
}

export interface ContractAdviesResult {
  vast: {
    totaal: number;
    stroomKosten: BerekeningResult['stroomKosten'];
    gasKosten: BerekeningResult['gasKosten'];
    pvOpbrengsten: BerekeningResult['pvOpbrengsten'];
    korting: number;
  };
  dynamisch: {
    totaal: number;
    stroomKosten: BerekeningResult['stroomKosten'];
    gasKosten: BerekeningResult['gasKosten'];
    pvOpbrengsten: BerekeningResult['pvOpbrengsten'];
    opslagPerKwh: number;
    maandbedragen?: number[]; // Added for monthly breakdown
  };
  besparing: number;
  goedkoopsteContract: 'vast' | 'dynamisch';
  netbeheerder: string;
  userProfile: {
    jaarverbruikStroom: number;
    jaarverbruikGas: number;
    pvOpwek: number;
    percentageZelfverbruik: number;
    geenGas: boolean;
  };
}

export function EnergiecontractAdvies({ className = '', onResultChange }: ContractAdviesProps) {
  const [netbeheerder, setNetbeheerder] = useState('');
  const [dalVerbruik, setDalVerbruik] = useState('');
  const [normaalVerbruik, setNormaalVerbruik] = useState('');
  const [gasVerbruik, setGasVerbruik] = useState('');
  const [geenGas, setGeenGas] = useState(false);
  const [pvTeruglevering, setPvTeruglevering] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ContractAdviesResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getNetbeheerderData = useCallback((naam: string): NetbeheerderData => {
    const netbeheerder = getAlleNetbeheerders().find((nb) => nb.naam === naam);

    if (!netbeheerder) {
      const fallback = getAlleNetbeheerders()[0];
      return {
        netbeheerder: fallback?.naam || 'Onbekend',
        stroomVastrecht: fallback?.kostenStroom || 0,
        gasVastrecht: fallback?.kostenGas || 0,
        stroomVariabel: fallback?.kostenStroom || 0,
        gasVariabel: fallback?.kostenGas || 0
      };
    }

    return {
      netbeheerder: netbeheerder.naam,
      stroomVastrecht: netbeheerder.kostenStroom,
      gasVastrecht: netbeheerder.kostenGas,
      stroomVariabel: netbeheerder.kostenStroom,
      gasVariabel: netbeheerder.kostenGas
    };
  }, []);

  // Memoized calculation function
  const calculateCosts = useCallback(async () => {
    if (!netbeheerder || !dalVerbruik || !normaalVerbruik || (!gasVerbruik && !geenGas) || !pvTeruglevering) {
      setError('Vul alle verplichte velden in');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get netbeheerder data
      const netbeheerderData = getNetbeheerderData(netbeheerder);

      // Parse inputs
      const dal = parseFloat(dalVerbruik);
      const normaal = parseFloat(normaalVerbruik);
      const gas = geenGas ? 0 : parseFloat(gasVerbruik);
      const pv = parseFloat(pvTeruglevering);

      // Validate inputs
      if (isNaN(dal) || isNaN(normaal) || isNaN(gas) || isNaN(pv)) {
        throw new Error('Ongeldige invoer. Controleer of alle velden correct zijn ingevuld.');
      }

      if (dal < 0 || normaal < 0 || gas < 0 || pv < 0) {
        throw new Error('Alle waarden moeten positief zijn.');
      }

      const totaalStroomVerbruik = dal + normaal;

      // Create user profile exactly like in zelf vergelijken tool
      const userProfile = {
        postcode: '0000AA',
        netbeheerder: netbeheerderData.netbeheerder,
        aansluitingElektriciteit: '1x25A' as const,
        aansluitingGas: geenGas ? undefined : 'G4' as const,
        jaarverbruikStroom: totaalStroomVerbruik,
        jaarverbruikStroomPiek: normaal,
        jaarverbruikStroomDal: dal,
        jaarverbruikGas: gas,
        heeftZonnepanelen: pv > 0,
        pvOpwek: pv,
        percentageZelfverbruik: 0,
        heeftWarmtepomp: false,
        heeftElektrischeAuto: false,
        geenGas: geenGas,
        piekDalVerdeling: {
          piek: normaal / totaalStroomVerbruik,
          dal: dal / totaalStroomVerbruik
        }
      };

      const vasteContracten = leveranciers.filter((c) => c.type === 'vast');
      if (vasteContracten.length === 0) {
        throw new Error('Geen vaste contracten beschikbaar voor vergelijking.');
      }

      const vasteResultaten = vasteContracten.map((contract) => {
        try {
          return berekenEnergiekosten(userProfile, contract);
        } catch (calcError) {
          throw new Error(
            `Vast contract "${contract.leverancier}" berekening mislukt: ${
              calcError instanceof Error ? calcError.message : 'Onbekende fout'
            }`
          );
        }
      });

      const gesorteerdeVaste = [...vasteResultaten].sort(
        (a, b) => a.totaleJaarkostenMetPv - b.totaleJaarkostenMetPv
      );
      const goedkoopsteVaste = gesorteerdeVaste[0];

      const csv2024 = generateRealisticCSVData(2024, 0.15);
      const csv2025 = generateRealisticCSVData(2025, 0.15);

      const dynamischeResultaten: BerekeningResult[] = dynamicContracts.length > 0
        ? await Promise.all(
            dynamicContracts.map(async (contract) => {
              const dynamischContract = {
                ...contract,
                csvData2024: csv2024,
                csvData2025: csv2025,
                maandelijkseVergoeding: contract.maandelijkseVergoeding ?? contract.vasteLeveringskosten,
                opslagPerKwh: contract.opslagPerKwh ?? 0.02,
                tarieven: {
                  ...contract.tarieven,
                  stroomKalePrijs: contract.tarieven?.stroomKalePrijs ?? 0.085
                }
              };

              try {
                return await berekenDynamischeEnergiekosten(
                  userProfile,
                  dynamischContract,
                  dynamischContract.csvData2024,
                  dynamischContract.csvData2025,
                  '2024'
                );
              } catch (calcError) {
                throw new Error(
                  `Dynamisch contract "${contract.leverancier}" berekening mislukt: ${
                    calcError instanceof Error ? calcError.message : 'Onbekende fout'
                  }`
                );
              }
            })
          )
        : [];

      const gesorteerdeDynamische = [...dynamischeResultaten].sort(
        (a, b) => a.totaleJaarkostenMetPv - b.totaleJaarkostenMetPv
      );
      const goedkoopsteDynamische = gesorteerdeDynamische[0];

      const besparing = Math.abs(
        goedkoopsteVaste.totaleJaarkostenMetPv - goedkoopsteDynamische.totaleJaarkostenMetPv
      );

      const goedkoopsteContract =
        goedkoopsteVaste.totaleJaarkostenMetPv < goedkoopsteDynamische.totaleJaarkostenMetPv
          ? 'vast'
          : 'dynamisch';

      setResult({
        vast: {
          totaal: goedkoopsteVaste.totaleJaarkostenMetPv,
          stroomKosten: goedkoopsteVaste.stroomKosten,
          gasKosten: goedkoopsteVaste.gasKosten,
          pvOpbrengsten: goedkoopsteVaste.pvOpbrengsten,
          korting: goedkoopsteVaste.contract.kortingEenmalig || 0
        },
        dynamisch: {
          totaal: goedkoopsteDynamische.totaleJaarkostenMetPv,
          stroomKosten: goedkoopsteDynamische.stroomKosten,
          gasKosten: goedkoopsteDynamische.gasKosten,
          pvOpbrengsten: goedkoopsteDynamische.pvOpbrengsten,
          opslagPerKwh: goedkoopsteDynamische.stroomKosten.opslagPerKwhTarief || 0,
          maandbedragen: Array.from({ length: 12 }, () => goedkoopsteDynamische.maandlastenGemiddeld)
        },
        besparing,
        goedkoopsteContract,
        netbeheerder: netbeheerderData.netbeheerder,
        userProfile: {
          jaarverbruikStroom: totaalStroomVerbruik,
          jaarverbruikGas: gas,
          pvOpwek: pv,
          percentageZelfverbruik: 0,
          geenGas: gas === 0
        }
      });

    } catch (error) {
      console.error('Calculation error:', error);
      
      // More specific error handling
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          setError('Netwerkfout: Kan netbeheerder niet ophalen. Probeer het opnieuw.');
        } else if (error.message.includes('parse')) {
          setError('Datafout: Ongeldige gegevens ontvangen. Controleer je invoer.');
        } else {
          setError(`Berekening fout: ${error.message}`);
        }
      } else {
        setError('Er is een onverwachte fout opgetreden. Controleer je invoer en probeer opnieuw.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [netbeheerder, dalVerbruik, normaalVerbruik, gasVerbruik, geenGas, pvTeruglevering, getNetbeheerderData]);

  // Notify parent when result changes
  useEffect(() => {
    if (onResultChange) {
      onResultChange(result);
    }
  }, [result, onResultChange]);

  return (
    <div className={`bg-white/90 backdrop-blur-sm rounded-3xl p-6 lg:p-8 shadow-2xl border border-white/40 ${className}`}>
      <div className="text-center mb-6 lg:mb-8">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-full text-sm font-bold mb-4 lg:mb-6 shadow-lg">
          <Calculator className="w-5 h-5" />
          <span>Energiecontract Advies</span>
        </div>
        <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3 lg:mb-4">
          Ontdek welk contract voor jou voordeliger is
        </h3>
        <p className="text-gray-600 mb-4 lg:mb-6 text-sm lg:text-base">
          Vul je gegevens in en krijg direct advies over het beste energiecontract
        </p>
      </div>

      <ContractAdviesForm
        netbeheerder={netbeheerder}
        setNetbeheerder={setNetbeheerder}
        dalVerbruik={dalVerbruik}
        setDalVerbruik={setDalVerbruik}
        normaalVerbruik={normaalVerbruik}
        setNormaalVerbruik={setNormaalVerbruik}
        gasVerbruik={gasVerbruik}
        setGasVerbruik={setGasVerbruik}
        geenGas={geenGas}
        setGeenGas={setGeenGas}
        pvTeruglevering={pvTeruglevering}
        setPvTeruglevering={setPvTeruglevering}
        isLoading={isLoading}
        onCalculate={calculateCosts}
        error={error}
      />
    </div>
  );
}