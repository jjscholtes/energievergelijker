'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Calculator } from 'lucide-react';
import { berekenEnergiekosten } from '@/lib/calculations/energyCalculator';
import { berekenDynamischeEnergiekosten } from '@/lib/calculations/dynamicEnergyCalculator';
import { sampleCSV2024, sampleCSV2025, dynamicContracts } from '@/lib/data/sampleDynamicData';
import { leveranciers } from '@/lib/data/leveranciers';
import { ContractAdviesForm } from '@/components/energie-advies/ContractAdviesForm';

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
    stroomKosten: any;
    gasKosten: any;
    pvOpbrengsten: any;
    korting: number;
  };
  dynamisch: {
    totaal: number;
    stroomKosten: any;
    gasKosten: any;
    pvOpbrengsten: any;
    opslagPerKwh: number;
    maandbedragen?: any[]; // Added for monthly breakdown
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

  // Memoized contract data to prevent recreation on every render
  const contractData = useMemo(() => {
    const vasteContracten = leveranciers.filter((c) => c.type === 'vast');
    const dynamischeBron = dynamicContracts;

    const vastContract = vasteContracten[0];
    const dynamischContract = {
      ...dynamischeBron[0],
      csvData2024: sampleCSV2024,
      csvData2025: sampleCSV2025,
      maandelijkseVergoeding: dynamischeBron[0].vasteLeveringskosten,
      opslagPerKwh: dynamischeBron[0].opslagPerKwh ?? 0.02,
      tarieven: {
        ...dynamischeBron[0].tarieven,
        stroomKalePrijs: dynamischeBron[0].tarieven?.stroomKalePrijs ?? 0.085
      }
    };

    return { vastContract, dynamischContract };
  }, []);

  // Memoized netbeheerder data getter
  const getNetbeheerderData = useCallback((naam: string): NetbeheerderData => {
    const netbeheerders = [
      { naam: 'Liander', stroomKosten: 471, gasKosten: 248 },
      { naam: 'Stedin', stroomKosten: 490, gasKosten: 254 },
      { naam: 'Enexis', stroomKosten: 492, gasKosten: 267 }
    ];
    
    const netbeheerder = netbeheerders.find(n => n.naam === naam);
    if (!netbeheerder) {
      return { 
        netbeheerder: 'Enexis', 
        stroomVastrecht: 492, 
        gasVastrecht: 267, 
        stroomVariabel: 492, 
        gasVariabel: 267 
      };
    }
    return {
      netbeheerder: netbeheerder.naam,
      stroomVastrecht: netbeheerder.stroomKosten,
      gasVastrecht: netbeheerder.gasKosten,
      stroomVariabel: netbeheerder.stroomKosten,
      gasVariabel: netbeheerder.gasKosten
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

      // Calculate vast contract using exact same logic
      console.log('Calculating vast contract...');
      let vastResult;
      try {
        vastResult = berekenEnergiekosten(userProfile, contractData.vastContract);
        console.log('Vast result:', vastResult);
      } catch (calcError) {
        console.error('Error calculating vast contract:', calcError);
        throw new Error(`Vast contract berekening mislukt: ${calcError instanceof Error ? calcError.message : 'Onbekende fout'}`);
      }

      // Calculate dynamisch contract using exact same logic
      console.log('Calculating dynamisch contract...');
      let dynamischResult;
      try {
        dynamischResult = await berekenDynamischeEnergiekosten(userProfile, contractData.dynamischContract, sampleCSV2024, sampleCSV2025, '2025');
        console.log('Dynamisch result:', dynamischResult);
      } catch (calcError) {
        console.error('Error calculating dynamisch contract:', calcError);
        throw new Error(`Dynamisch contract berekening mislukt: ${calcError instanceof Error ? calcError.message : 'Onbekende fout'}`);
      }

      const besparing = Math.abs(vastResult.totaleJaarkostenMetPv - dynamischResult.totaleJaarkostenMetPv);
      const goedkoopsteContract = vastResult.totaleJaarkostenMetPv < dynamischResult.totaleJaarkostenMetPv ? 'vast' : 'dynamisch';

      const dynamicMonthlyBreakdown = dynamischResult.maandlasten ? dynamischResult.maandlasten : Array.from({ length: 12 }, () => dynamischResult.maandlastenGemiddeld);

      setResult({
        vast: {
          totaal: vastResult.totaleJaarkostenMetPv,
          stroomKosten: vastResult.stroomKosten,
          gasKosten: vastResult.gasKosten,
          pvOpbrengsten: vastResult.pvOpbrengsten,
          korting: contractData.vastContract.kortingEenmalig
        },
        dynamisch: {
          totaal: dynamischResult.totaleJaarkostenMetPv,
          stroomKosten: dynamischResult.stroomKosten,
          gasKosten: dynamischResult.gasKosten,
          pvOpbrengsten: dynamischResult.pvOpbrengsten,
          opslagPerKwh: contractData.dynamischContract.opslagPerKwh,
          maandbedragen: dynamicMonthlyBreakdown
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
  }, [netbeheerder, dalVerbruik, normaalVerbruik, gasVerbruik, geenGas, pvTeruglevering, getNetbeheerderData, contractData]);

  const handleReset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

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