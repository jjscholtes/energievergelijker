import { create } from 'zustand';
import { UserProfile } from '@/types/user';
import { BerekeningResult } from '@/types/calculations';
import { berekenEnergiekosten } from '@/lib/calculations/energyCalculator';
import { leveranciers } from '@/lib/data/leveranciers';
import { dynamicContracts } from '@/lib/data/sampleDynamicData';
import { berekenDynamischeEnergiekosten } from '@/lib/calculations/dynamicEnergyCalculator';
import { generateRealisticCSVData } from '@/lib/data/sampleDynamicData';

interface CalculationStore {
  userProfile: UserProfile | null;
  results: BerekeningResult[];
  dynamicResults: BerekeningResult[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUserProfile: (profile: UserProfile) => void;
  calculateResults: () => void;
  calculateDynamicResults: () => void;
  clearResults: () => void;
  setError: (error: string | null) => void;
}

export const useCalculationStore = create<CalculationStore>((set, get) => ({
  userProfile: null,
  results: [],
  dynamicResults: [],
  isLoading: false,
  error: null,

  setUserProfile: (profile: UserProfile) => {
    set({ userProfile: profile });
    // Automatisch herberekenen als profiel wordt ingesteld
    get().calculateResults();
    get().calculateDynamicResults();
  },

  calculateResults: () => {
    const { userProfile } = get();
    
    if (!userProfile) {
      set({ results: [], error: 'Geen gebruikersprofiel ingesteld' });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      // Bereken voor alle leveranciers
      const calculatedResults = leveranciers.map(contract => 
        berekenEnergiekosten(userProfile, contract)
      );

      // Sorteer op totale kosten (met PV indien van toepassing)
      const sortedResults = calculatedResults.sort((a, b) => 
        a.totaleJaarkostenMetPv - b.totaleJaarkostenMetPv
      );

      // Voeg ranking toe
      const rankedResults = sortedResults.map((result, index) => ({
        ...result,
        positieInRanking: index + 1,
        verschilMetGoedkoopste: index === 0 ? 0 : result.totaleJaarkostenMetPv - sortedResults[0].totaleJaarkostenMetPv
      }));

      set({ results: rankedResults, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Onbekende fout bij berekening',
        isLoading: false 
      });
    }
  },

  calculateDynamicResults: async () => {
    const { userProfile } = get();
    
    if (!userProfile) {
      set({ dynamicResults: [], error: 'Geen gebruikersprofiel ingesteld' });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      // Genereer CSV data voor dynamische contracten
      const csv2024 = generateRealisticCSVData(2024, 0.15);
      const csv2025 = generateRealisticCSVData(2025, 0.15);
      
      // Bereken voor alle dynamische contracten met de nieuwe geïntegreerde calculator
      const dynamicCalculations = await Promise.all(
        dynamicContracts.map(async (contract) => {
          // Maak dezelfde contract aanpassingen als in de advies module
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

          const result = await berekenDynamischeEnergiekosten(
            userProfile,
            dynamischContract,
            dynamischContract.csvData2024,
            dynamischContract.csvData2025,
            '2024'
          );

          return result;
        })
      );

      // Sorteer op totale kosten
      const sortedResults = dynamicCalculations.sort((a, b) => 
        a.totaleJaarkostenMetPv - b.totaleJaarkostenMetPv
      );

      // Voeg ranking toe
      const rankedResults = sortedResults.map((result, index) => ({
        ...result,
        positieInRanking: index + 1,
        verschilMetGoedkoopste: index === 0 ? 0 : result.totaleJaarkostenMetPv - sortedResults[0].totaleJaarkostenMetPv
      }));

      set({ dynamicResults: rankedResults, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Onbekende fout bij dynamische berekening',
        isLoading: false 
      });
    }
  },

  clearResults: () => {
    set({ results: [], dynamicResults: [], error: null });
  },

  setError: (error: string | null) => {
    set({ error });
  }
}));
