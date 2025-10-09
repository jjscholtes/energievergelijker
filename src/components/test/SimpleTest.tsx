'use client';

import { useState } from 'react';
import { berekenEnergiekosten } from '@/lib/calculations/energyCalculator';
import { berekenDynamischeEnergiekosten } from '@/lib/calculations/dynamicEnergyCalculator';
import { bepaalNetbeheerder } from '@/lib/data/netbeheerders';
import { sampleCSV2024, sampleCSV2025 } from '@/lib/data/sampleDynamicData';

export function SimpleTest() {
  const [testResult, setTestResult] = useState<string>('');

  const runSimpleTest = async () => {
    try {
      setTestResult('Starting simple test...\n');

      // Test 1: Netbeheerder
      const netbeheerder = bepaalNetbeheerder('1234AB');
      setTestResult(prev => prev + `Netbeheerder: ${netbeheerder?.naam || 'Not found'}\n`);

      // Test 2: User Profile
      const userProfile = {
        postcode: '1234AB',
        netbeheerder: netbeheerder?.naam || 'Enexis',
        aansluitingElektriciteit: '1x25A' as const,
        aansluitingGas: 'G4' as const,
        jaarverbruikStroom: 3500,
        jaarverbruikStroomPiek: 1400,
        jaarverbruikStroomDal: 2100,
        jaarverbruikGas: 1200,
        heeftZonnepanelen: true,
        pvOpwek: 3000,
        percentageZelfverbruik: 30,
        heeftWarmtepomp: false,
        heeftElektrischeAuto: false,
        geenGas: false,
        piekDalVerdeling: {
          piek: 0.4,
          dal: 0.6
        }
      };
      setTestResult(prev => prev + `User profile created successfully\n`);

      // Test 3: Vast Contract
      const vastContract = {
        leverancier: 'Test Vast Contract',
        productNaam: 'Standaard Vast',
        type: 'vast' as const,
        looptijdMaanden: 12,
        duurzaamheidsScore: 3,
        klanttevredenheid: 3,
        tarieven: {
          stroomKalePrijs: 0.10,
          terugleververgoeding: 0.01,
          gasKalePrijs: 0.63,
          vasteTerugleverkosten: 389
        },
        vasteLeveringskosten: 10,
        kortingEenmalig: 200
      };
      setTestResult(prev => prev + `Vast contract created successfully\n`);

      // Test 4: Vast Calculation
      try {
        const vastResult = berekenEnergiekosten(userProfile, vastContract);
        setTestResult(prev => prev + `Vast calculation successful: €${vastResult.totaleJaarkostenMetPv.toFixed(2)}\n`);
      } catch (calcError) {
        setTestResult(prev => prev + `Vast calculation failed: ${calcError}\n`);
        console.error('Vast calculation error:', calcError);
        return;
      }

      // Test 5: Dynamisch Contract
      const dynamischContract = {
        leverancier: 'Test Dynamisch Contract',
        productNaam: 'Standaard Flexibel',
        type: 'dynamisch' as const,
        looptijdMaanden: 12,
        duurzaamheidsScore: 3,
        klanttevredenheid: 3,
        csvData2024: sampleCSV2024,
        csvData2025: sampleCSV2025,
        terugleververgoeding: 0.0595,
        maandelijkseVergoeding: 0,
        opslagPerKwh: 0.025,
        opslagInvoeding: 0.025,
        tarieven: {
          stroomKalePrijs: 0.085,
          terugleververgoeding: 0.0595,
          gasKalePrijs: 0.63,
          vasteTerugleverkosten: 0
        },
        vasteLeveringskosten: 7,
        kortingEenmalig: 0
      };
      setTestResult(prev => prev + `Dynamisch contract created successfully\n`);

      // Test 6: Dynamisch Calculation
      try {
        const dynamischResult = await berekenDynamischeEnergiekosten(
          userProfile, 
          dynamischContract, 
          sampleCSV2024, 
          sampleCSV2025, 
          '2025'
        );
        setTestResult(prev => prev + `Dynamisch calculation successful: €${dynamischResult.totaleJaarkostenMetPv.toFixed(2)}\n`);
      } catch (calcError) {
        setTestResult(prev => prev + `Dynamisch calculation failed: ${calcError}\n`);
        console.error('Dynamisch calculation error:', calcError);
        return;
      }

      setTestResult(prev => prev + `All tests completed successfully!\n`);

    } catch (error) {
      setTestResult(prev => prev + `ERROR: ${error}\n`);
      console.error('Simple test error:', error);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Simple Test</h2>
      
      <button
        onClick={runSimpleTest}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Run Simple Test
      </button>

      <div className="bg-gray-100 p-4 rounded-lg">
        <pre className="text-sm whitespace-pre-wrap">{testResult}</pre>
      </div>
    </div>
  );
}
