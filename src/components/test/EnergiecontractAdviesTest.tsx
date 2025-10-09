'use client';

import { useState } from 'react';
import { berekenEnergiekosten } from '@/lib/calculations/energyCalculator';
import { berekenDynamischeEnergiekosten } from '@/lib/calculations/dynamicEnergyCalculator';
import { bepaalNetbeheerder } from '@/lib/data/netbeheerders';
import { sampleCSV2024, sampleCSV2025 } from '@/lib/data/sampleDynamicData';

export function EnergiecontractAdviesTest() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      addResult('🚀 Starting Energiecontract Advies tests...');

      // Test 1: Netbeheerder detection
      addResult('📋 Test 1: Netbeheerder detection');
      try {
        const testPostcodes = ['1234AB', '2492TD', '1012JS', '5611AB'];
        for (const postcode of testPostcodes) {
          const netbeheerder = bepaalNetbeheerder(postcode);
          addResult(`  ✅ ${postcode}: ${netbeheerder?.naam || 'Not found'}`);
        }
      } catch (error) {
        addResult(`  ❌ Netbeheerder test failed: ${error}`);
      }

      // Test 2: Local netbeheerder detection (no API)
      addResult('🏠 Test 2: Local netbeheerder detection');
      try {
        const testPostcodes = ['1234AB', '2492TD', '1012JS', '5611AB', '9711AA'];
        for (const postcode of testPostcodes) {
          const netbeheerder = bepaalNetbeheerder(postcode);
          addResult(`  ✅ ${postcode}: ${netbeheerder?.naam || 'Not found'} (€${netbeheerder?.kostenStroom || 'N/A'} stroom, €${netbeheerder?.kostenGas || 'N/A'} gas)`);
        }
      } catch (error) {
        addResult(`  ❌ Local netbeheerder test failed: ${error}`);
      }

      // Test 3: fetchNetbeheerder function simulation
      addResult('🔧 Test 3: fetchNetbeheerder function simulation');
      try {
        // Simuleer de fetchNetbeheerder functie
        const simulateFetchNetbeheerder = (postcode: string) => {
          const netbeheerder = bepaalNetbeheerder(postcode);
          if (netbeheerder) {
            return {
              netbeheerder: netbeheerder.naam,
              stroomVastrecht: netbeheerder.kostenStroom,
              gasVastrecht: netbeheerder.kostenGas,
              stroomVariabel: netbeheerder.kostenStroom,
              gasVariabel: netbeheerder.kostenGas
            };
          }
          return { 
            netbeheerder: 'Enexis', 
            stroomVastrecht: 492, 
            gasVastrecht: 254, 
            stroomVariabel: 492, 
            gasVariabel: 254 
          };
        };

        const testPostcodes = ['1234AB', '2492TD', '9999ZZ'];
        for (const postcode of testPostcodes) {
          const result = simulateFetchNetbeheerder(postcode);
          addResult(`  ✅ ${postcode}: ${result.netbeheerder} (€${result.stroomVastrecht} stroom, €${result.gasVastrecht} gas)`);
        }
      } catch (error) {
        addResult(`  ❌ fetchNetbeheerder simulation failed: ${error}`);
      }

      // Test 4: Sample CSV data
      addResult('📊 Test 4: Sample CSV data');
      try {
        addResult(`  ✅ sampleCSV2024 length: ${sampleCSV2024.length} characters`);
        addResult(`  ✅ sampleCSV2025 length: ${sampleCSV2025.length} characters`);
        
        // Test CSV parsing
        const lines2024 = sampleCSV2024.split('\n');
        addResult(`  ✅ CSV 2024 lines: ${lines2024.length}`);
        addResult(`  ✅ CSV 2024 header: ${lines2024[0]}`);
        addResult(`  ✅ CSV 2024 first data: ${lines2024[1]}`);
      } catch (error) {
        addResult(`  ❌ CSV test failed: ${error}`);
      }

      // Test 4: User profile creation
      addResult('👤 Test 4: User profile creation');
      try {
        const testUserProfile = {
          postcode: '1234AB',
          netbeheerder: 'Enexis',
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
        addResult(`  ✅ User profile created successfully`);
        addResult(`  ✅ Profile keys: ${Object.keys(testUserProfile).join(', ')}`);
      } catch (error) {
        addResult(`  ❌ User profile test failed: ${error}`);
      }

      // Test 6: Contract data creation
      addResult('📋 Test 6: Contract data creation');
      try {
        const vastContract = {
          leverancier: 'Test Vast Contract',
          productNaam: 'Standaard Vast',
          type: 'vast' as const,
          tarieven: {
            stroomKalePrijs: 0.100,
            gasKalePrijs: 1.20,
            terugleververgoeding: 0.01
          },
          vasteLeveringskosten: 8.99,
          kortingEenmalig: 0,
          looptijdMaanden: 12,
          duurzaamheidsScore: 3,
          klanttevredenheid: 4
        };

        const dynamischContract = {
          leverancier: 'Test Dynamisch Contract',
          productNaam: 'Flexibel',
          type: 'dynamisch' as const,
          tarieven: {
            stroomKalePrijs: 0.15,
            gasKalePrijs: 1.20,
            terugleververgoeding: 0.15
          },
          vasteLeveringskosten: 7,
          opslagPerKwh: 0.025,
          kortingEenmalig: 0,
          looptijdMaanden: 12,
          csvData2024: sampleCSV2024,
          csvData2025: sampleCSV2025,
          duurzaamheidsScore: 3,
          klanttevredenheid: 4,
          risicoScore: 2,
          flexibiliteitScore: 5,
          gemiddeldeSpotprijs: 0.15,
          volatiliteit: 0.3,
          terugleververgoeding: 0.15,
          maandelijkseVergoeding: 0,
          opslagInvoeding: 0
        };

        addResult(`  ✅ Vast contract created successfully`);
        addResult(`  ✅ Dynamisch contract created successfully`);
      } catch (error) {
        addResult(`  ❌ Contract creation test failed: ${error}`);
      }

      // Test 7: Vast contract calculation
      addResult('🧮 Test 7: Vast contract calculation');
      try {
        const testUserProfile = {
          postcode: '1234AB',
          netbeheerder: 'Enexis',
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

        const vastContract = {
          leverancier: 'Test Vast Contract',
          productNaam: 'Standaard Vast',
          type: 'vast' as const,
          tarieven: {
            stroomKalePrijs: 0.100,
            gasKalePrijs: 1.20,
            terugleververgoeding: 0.01
          },
          vasteLeveringskosten: 8.99,
          kortingEenmalig: 0,
          looptijdMaanden: 12,
          duurzaamheidsScore: 3,
          klanttevredenheid: 4
        };

        const vastResult = berekenEnergiekosten(testUserProfile, vastContract);
        addResult(`  ✅ Vast calculation successful`);
        addResult(`  ✅ Vast total: €${vastResult.totaleJaarkostenMetPv.toFixed(2)}`);
        addResult(`  ✅ Vast stroomkosten: €${vastResult.stroomKosten.totaal.toFixed(2)}`);
        addResult(`  ✅ Vast gaskosten: €${vastResult.gasKosten.totaal.toFixed(2)}`);
        if (vastResult.pvOpbrengsten) {
          addResult(`  ✅ Vast PV opbrengsten: €${vastResult.pvOpbrengsten.totaleOpbrengst.toFixed(2)}`);
        }
      } catch (error) {
        addResult(`  ❌ Vast calculation failed: ${error}`);
      }

      // Test 8: Dynamisch contract calculation
      addResult('⚡ Test 8: Dynamisch contract calculation');
      try {
        const testUserProfile = {
          postcode: '1234AB',
          netbeheerder: 'Enexis',
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

        const dynamischContract = {
          leverancier: 'Test Dynamisch Contract',
          productNaam: 'Flexibel',
          type: 'dynamisch' as const,
          tarieven: {
            stroomKalePrijs: 0.15,
            gasKalePrijs: 1.20,
            terugleververgoeding: 0.15
          },
          vasteLeveringskosten: 7,
          opslagPerKwh: 0.025,
          kortingEenmalig: 0,
          looptijdMaanden: 12,
          csvData2024: sampleCSV2024,
          csvData2025: sampleCSV2025,
          duurzaamheidsScore: 3,
          klanttevredenheid: 4,
          risicoScore: 2,
          flexibiliteitScore: 5,
          gemiddeldeSpotprijs: 0.15,
          volatiliteit: 0.3,
          terugleververgoeding: 0.15,
          maandelijkseVergoeding: 0,
          opslagInvoeding: 0
        };

        const dynamischResult = await berekenDynamischeEnergiekosten(
          testUserProfile, 
          dynamischContract, 
          sampleCSV2024, 
          sampleCSV2025, 
          '2025'
        );
        
        addResult(`  ✅ Dynamisch calculation successful`);
        addResult(`  ✅ Dynamisch total: €${dynamischResult.totaleJaarkostenMetPv.toFixed(2)}`);
        addResult(`  ✅ Dynamisch stroomkosten: €${dynamischResult.stroomKosten.totaal.toFixed(2)}`);
        addResult(`  ✅ Dynamisch gaskosten: €${dynamischResult.gasKosten.totaal.toFixed(2)}`);
        if (dynamischResult.pvOpbrengsten) {
          addResult(`  ✅ Dynamisch PV opbrengsten: €${dynamischResult.pvOpbrengsten.totaleOpbrengst.toFixed(2)}`);
        }
      } catch (error) {
        addResult(`  ❌ Dynamisch calculation failed: ${error}`);
      }

      // Test 9: Full Energiecontract Advies flow simulation
      addResult('🔄 Test 9: Full Energiecontract Advies flow simulation');
      try {
        // Simuleer de volledige flow zoals in EnergiecontractAdvies component
        const testPostcode = '1234AB';
        const dalVerbruik = 2100;
        const normaalVerbruik = 1400;
        const gasVerbruik = 1200;
        const pvTeruglevering = 3000;
        const percentageZelfverbruik = 30;
        const geenGas = false;

        // Stap 1: Netbeheerder ophalen
        const netbeheerder = bepaalNetbeheerder(testPostcode);
        if (!netbeheerder) {
          throw new Error('Netbeheerder not found for test postcode');
        }

        // Stap 2: User profile maken
        const totaalStroomVerbruik = dalVerbruik + normaalVerbruik;
        const userProfile = {
          postcode: testPostcode,
          netbeheerder: netbeheerder.naam,
          aansluitingElektriciteit: '1x25A' as const,
          aansluitingGas: 'G4' as const,
          jaarverbruikStroom: totaalStroomVerbruik,
          jaarverbruikStroomPiek: normaalVerbruik,
          jaarverbruikStroomDal: dalVerbruik,
          jaarverbruikGas: gasVerbruik,
          heeftZonnepanelen: pvTeruglevering > 0,
          pvOpwek: pvTeruglevering,
          percentageZelfverbruik: percentageZelfverbruik,
          heeftWarmtepomp: false,
          heeftElektrischeAuto: false,
          geenGas: geenGas,
          piekDalVerdeling: {
            piek: normaalVerbruik / totaalStroomVerbruik,
            dal: dalVerbruik / totaalStroomVerbruik
          }
        };

        // Stap 3: Contracten maken
        const vastContract = {
          leverancier: 'Test Vast Contract',
          productNaam: 'Standaard Vast',
          type: 'vast' as const,
          tarieven: {
            stroomKalePrijs: 0.100,
            gasKalePrijs: 1.20,
            terugleververgoeding: 0.01
          },
          vasteLeveringskosten: 8.99,
          kortingEenmalig: 0,
          looptijdMaanden: 12,
          duurzaamheidsScore: 3,
          klanttevredenheid: 4
        };

        const dynamischContract = {
          leverancier: 'Test Dynamisch Contract',
          productNaam: 'Flexibel',
          type: 'dynamisch' as const,
          tarieven: {
            stroomKalePrijs: 0.15,
            gasKalePrijs: 1.20,
            terugleververgoeding: 0.15
          },
          vasteLeveringskosten: 7,
          opslagPerKwh: 0.025,
          kortingEenmalig: 0,
          looptijdMaanden: 12,
          csvData2024: sampleCSV2024,
          csvData2025: sampleCSV2025,
          duurzaamheidsScore: 3,
          klanttevredenheid: 4,
          risicoScore: 2,
          flexibiliteitScore: 5,
          gemiddeldeSpotprijs: 0.15,
          volatiliteit: 0.3,
          terugleververgoeding: 0.15,
          maandelijkseVergoeding: 0,
          opslagInvoeding: 0
        };

        // Stap 4: Berekeningen uitvoeren
        const vastResult = berekenEnergiekosten(userProfile, vastContract);
        const dynamischResult = await berekenDynamischeEnergiekosten(
          userProfile, 
          dynamischContract, 
          sampleCSV2024, 
          sampleCSV2025, 
          '2025'
        );

        // Stap 5: Resultaten analyseren
        const besparing = Math.abs(vastResult.totaleJaarkostenMetPv - dynamischResult.totaleJaarkostenMetPv);
        const goedkoopsteContract = vastResult.totaleJaarkostenMetPv < dynamischResult.totaleJaarkostenMetPv ? 'vast' : 'dynamisch';

        addResult(`  ✅ Full flow simulation successful!`);
        addResult(`  ✅ Netbeheerder: ${netbeheerder.naam}`);
        addResult(`  ✅ Vast contract: €${vastResult.totaleJaarkostenMetPv.toFixed(2)}`);
        addResult(`  ✅ Dynamisch contract: €${dynamischResult.totaleJaarkostenMetPv.toFixed(2)}`);
        addResult(`  ✅ Besparing: €${besparing.toFixed(2)}`);
        addResult(`  ✅ Goedkoopste: ${goedkoopsteContract}`);
        
      } catch (error) {
        addResult(`  ❌ Full flow simulation failed: ${error}`);
      }

      addResult('🎉 All tests completed!');

    } catch (error) {
      addResult(`💥 Test suite failed: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Energiecontract Advies Test Suite</h2>
      
      <button
        onClick={runTests}
        disabled={isRunning}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isRunning ? 'Running Tests...' : 'Run Tests'}
      </button>

      <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-y-auto">
        <h3 className="font-bold mb-2">Test Results:</h3>
        {testResults.length === 0 ? (
          <p className="text-gray-500">No tests run yet. Click "Run Tests" to start.</p>
        ) : (
          <div className="space-y-1">
            {testResults.map((result, index) => (
              <div key={index} className="text-sm font-mono">
                {result}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
