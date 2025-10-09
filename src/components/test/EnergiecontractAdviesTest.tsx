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

      // Test 2: Polygon API call
      addResult('🌐 Test 2: Polygon API call');
      try {
        const testPostcode = '1234AB';
        const apiUrl = `https://opendata.polygonentool.nl/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=netbeheerders&cql_filter=postcode='${testPostcode}'&outputFormat=application/json`;
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(10000)
        });
        
        addResult(`  ✅ API Response status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          addResult(`  ✅ API Response data keys: ${Object.keys(data).join(', ')}`);
          if (data.features && data.features.length > 0) {
            addResult(`  ✅ Found ${data.features.length} features`);
            addResult(`  ✅ First feature properties: ${JSON.stringify(data.features[0].properties)}`);
          } else {
            addResult(`  ⚠️ No features found in API response`);
          }
        } else {
          addResult(`  ❌ API call failed with status: ${response.status}`);
        }
      } catch (error) {
        addResult(`  ❌ API test failed: ${error}`);
      }

      // Test 3: Sample CSV data
      addResult('📊 Test 3: Sample CSV data');
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

      // Test 5: Contract data creation
      addResult('📋 Test 5: Contract data creation');
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

      // Test 6: Vast contract calculation
      addResult('🧮 Test 6: Vast contract calculation');
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

      // Test 7: Dynamisch contract calculation
      addResult('⚡ Test 7: Dynamisch contract calculation');
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
