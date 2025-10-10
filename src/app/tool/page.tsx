'use client';

import { useState } from 'react';
import { ContractData } from '@/types/contracts';
import { DynamicContractData } from '@/types/dynamicContracts';
import { BerekeningResult } from '@/types/calculations';
import { berekenEnergiekosten } from '@/lib/calculations/energyCalculator';
import { berekenDynamischeEnergiekosten } from '@/lib/calculations/dynamicEnergyCalculator';
import { generateRealisticCSVData } from '@/lib/data/sampleDynamicData';
import { ToolLayout } from '@/components/tool/ToolLayout';
import { UserProfileForm } from '@/components/tool/UserProfileForm';
import { ContractInputForm } from '@/components/tool/ContractInputForm';
import { ContractList } from '@/components/tool/ContractList';
import { CalculationResults } from '@/components/tool/CalculationResults';
import { DetailedComparison } from '@/components/tool/DetailedComparison';

interface UserProfile {
  netbeheerder: string;
  jaarverbruikStroom: number;
  jaarverbruikStroomPiek: number;
  jaarverbruikStroomDal: number;
  jaarverbruikGas: number;
  geenGas: boolean;
  heeftZonnepanelen: boolean;
  pvOpwek: number;
  percentageZelfverbruik: number;
}

export default function ToolPage() {
  const [contracts, setContracts] = useState<ContractData[]>([]);
  const [dynamicContracts, setDynamicContracts] = useState<DynamicContractData[]>([]);
  const [results, setResults] = useState<BerekeningResult[]>([]);
  const [dynamicResults, setDynamicResults] = useState<BerekeningResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Gebruikersprofiel voor berekeningen
  const [userProfile, setUserProfile] = useState<UserProfile>({
    netbeheerder: 'Liander',
    jaarverbruikStroom: 2900,
    jaarverbruikStroomPiek: 1160, // 40% van 2900
    jaarverbruikStroomDal: 1740, // 60% van 2900
    jaarverbruikGas: 1200,
    geenGas: false,
    heeftZonnepanelen: false,
    pvOpwek: 0,
    percentageZelfverbruik: 0 // Geen zelfverbruik, alles wordt teruggeleverd (eenvoudiger)
  });

  const handleAddContract = (contract: ContractData | DynamicContractData) => {
    if ('csvData2024' in contract) {
      // Dynamic contract
      const updatedDynamicContracts = [...dynamicContracts, contract];
      setDynamicContracts(updatedDynamicContracts);
    } else {
      // Regular contract
      const updatedContracts = [...contracts, contract];
      setContracts(updatedContracts);
    }
  };

  const handleRemoveContract = (index: number, type: 'vast' | 'dynamisch') => {
    if (type === 'dynamisch') {
      const updatedDynamicContracts = dynamicContracts.filter((_, i) => i !== index);
      setDynamicContracts(updatedDynamicContracts);
    } else {
      const updatedContracts = contracts.filter((_, i) => i !== index);
      setContracts(updatedContracts);
    }
  };

  const handleCalculate = async () => {
    if (contracts.length === 0 && dynamicContracts.length === 0) {
      setError('Voeg minimaal één energiecontract toe om te berekenen');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Voor vaste contracten
      const fixedResults: BerekeningResult[] = [];
      for (const contract of contracts) {
        const fullUserProfile = {
          postcode: '1234AB', // Dummy postcode, netbeheerder wordt direct gebruikt
          netbeheerder: userProfile.netbeheerder,
          aansluitingElektriciteit: '1x25A' as const,
          aansluitingGas: 'G4' as const,
          jaarverbruikStroom: userProfile.jaarverbruikStroom,
          jaarverbruikStroomPiek: userProfile.jaarverbruikStroomPiek,
          jaarverbruikStroomDal: userProfile.jaarverbruikStroomDal,
          jaarverbruikGas: userProfile.jaarverbruikGas,
          heeftZonnepanelen: userProfile.heeftZonnepanelen,
          pvOpwek: userProfile.pvOpwek,
          percentageZelfverbruik: userProfile.percentageZelfverbruik,
          heeftWarmtepomp: false,
          heeftElektrischeAuto: false,
          geenGas: userProfile.geenGas,
          piekDalVerdeling: {
            piek: 0.4,
            dal: 0.6
          }
        };

        const result = berekenEnergiekosten(fullUserProfile, contract);
        fixedResults.push(result);
      }

      // Voor dynamische contracten
      const dynamicResults: BerekeningResult[] = [];
      if (dynamicContracts.length > 0) {
        const csv2024 = generateRealisticCSVData(2024, 0.15);
        const csv2025 = generateRealisticCSVData(2025, 0.15);
        
        for (const contract of dynamicContracts) {
          const fullUserProfile = {
            postcode: '1234AB', // Dummy postcode, netbeheerder wordt direct gebruikt
            netbeheerder: userProfile.netbeheerder,
            aansluitingElektriciteit: '1x25A' as const,
            aansluitingGas: 'G4' as const,
            jaarverbruikStroom: userProfile.jaarverbruikStroom,
            jaarverbruikStroomPiek: userProfile.jaarverbruikStroomPiek,
            jaarverbruikStroomDal: userProfile.jaarverbruikStroomDal,
            jaarverbruikGas: userProfile.jaarverbruikGas,
            heeftZonnepanelen: userProfile.heeftZonnepanelen,
            pvOpwek: userProfile.pvOpwek,
            percentageZelfverbruik: userProfile.percentageZelfverbruik,
            heeftWarmtepomp: false,
            heeftElektrischeAuto: false,
            geenGas: userProfile.geenGas,
            piekDalVerdeling: {
              piek: 0.4,
              dal: 0.6
            }
          };

          const dynamicContract: DynamicContractData = {
            ...contract,
            csvData2024: csv2024,
            csvData2025: csv2025,
          };

          const result = await berekenDynamischeEnergiekosten(
            fullUserProfile,
            dynamicContract,
            csv2024,
            csv2025,
            '2024'
          );
          dynamicResults.push(result);
        }
      }

      const sortedFixedResults = fixedResults.sort((a, b) => a.totaleJaarkostenMetPv - b.totaleJaarkostenMetPv);
      const sortedDynamicResults = dynamicResults.sort((a, b) => a.totaleJaarkostenMetPv - b.totaleJaarkostenMetPv);

      setResults(sortedFixedResults);
      setDynamicResults(sortedDynamicResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Onbekende fout bij berekening');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ToolLayout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Column - Forms */}
        <div className="space-y-6">
          <UserProfileForm 
            userProfile={userProfile} 
            setUserProfile={setUserProfile} 
          />
          
          <ContractInputForm 
            userProfile={userProfile}
            onAddContract={handleAddContract}
          />
        </div>

        {/* Right Column - Results & Contract Lists */}
        <div className="space-y-6 lg:sticky lg:top-24 lg:max-h-screen lg:overflow-y-auto">
          <ContractList 
            contracts={contracts}
            dynamicContracts={dynamicContracts}
            onRemoveContract={handleRemoveContract}
          />

          <CalculationResults 
            results={results}
            dynamicResults={dynamicResults}
            isLoading={isLoading}
            error={error}
            onCalculate={handleCalculate}
            contracts={contracts}
            dynamicContracts={dynamicContracts}
          />

          {/* Detailed Comparison */}
          {(results.length > 0 || dynamicResults.length > 0) && (
            <DetailedComparison results={results} dynamicResults={dynamicResults} />
          )}
        </div>
      </div>
    </ToolLayout>
  );
}