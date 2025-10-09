'use client';

import { useState } from 'react';
import { berekenDynamischeEnergiekosten } from '@/lib/calculations/dynamicEnergyCalculator';
import { sampleCSV2024, sampleCSV2025 } from '@/lib/data/sampleDynamicData';

export function CalculationTest() {
  const [testResult, setTestResult] = useState<string>('');

  const runCalculationTest = async () => {
    try {
      setTestResult('Starting calculation test...\n');

      // Test user profile
      const userProfile = {
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

      // Test dynamisch contract
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

      // Run calculation
      const result = await berekenDynamischeEnergiekosten(
        userProfile, 
        dynamischContract, 
        sampleCSV2024, 
        sampleCSV2025, 
        '2025'
      );

      setTestResult(prev => prev + `Calculation completed!\n\n`);

      // Show detailed breakdown
      setTestResult(prev => prev + `=== STROOMKOSTEN BREAKDOWN ===\n`);
      setTestResult(prev => prev + `Kale energie: €${result.stroomKosten.kaleEnergie.toFixed(2)}\n`);
      setTestResult(prev => prev + `Energiebelasting: €${result.stroomKosten.energiebelasting.toFixed(2)}\n`);
      setTestResult(prev => prev + `Netbeheer: €${result.stroomKosten.netbeheer.toFixed(2)}\n`);
      setTestResult(prev => prev + `Vaste leveringskosten: €${(result.stroomKosten.vasteLeveringskosten || 0).toFixed(2)}\n`);
      setTestResult(prev => prev + `Maandelijkse vergoeding: €${(result.stroomKosten.maandelijkseVergoeding || 0).toFixed(2)}\n`);
      setTestResult(prev => prev + `Opslag per kWh: €${(result.stroomKosten.opslagPerKwh || 0).toFixed(2)}\n`);
      setTestResult(prev => prev + `Stroomkosten totaal: €${result.stroomKosten.totaal.toFixed(2)}\n\n`);

      // Show gas costs
      setTestResult(prev => prev + `=== GASKOSTEN BREAKDOWN ===\n`);
      setTestResult(prev => prev + `Gas kosten totaal: €${result.gasKosten.totaal.toFixed(2)}\n\n`);

      // Show PV opbrengsten
      if (result.pvOpbrengsten) {
        setTestResult(prev => prev + `=== PV OPBRENGSTEN ===\n`);
        setTestResult(prev => prev + `Saldering besparing: €${(result.pvOpbrengsten.salderingsBesparing || 0).toFixed(2)}\n`);
        setTestResult(prev => prev + `Terugleververgoeding: €${(result.pvOpbrengsten.terugleververgoedingBedrag || 0).toFixed(2)}\n`);
        setTestResult(prev => prev + `Totale PV opbrengst: €${(result.pvOpbrengsten.totaleOpbrengst || 0).toFixed(2)}\n\n`);
      }

      // Show totals
      setTestResult(prev => prev + `=== TOTALE KOSTEN ===\n`);
      setTestResult(prev => prev + `Totale jaarkosten (zonder PV): €${result.totaleJaarkosten.toFixed(2)}\n`);
      setTestResult(prev => prev + `Totale jaarkosten (met PV): €${result.totaleJaarkostenMetPv.toFixed(2)}\n\n`);

      // Manual calculation check
      const manualTotal = result.stroomKosten.totaal + result.gasKosten.totaal + (result.stroomKosten.vasteLeveringskosten || 0) - (result.pvOpbrengsten?.totaleOpbrengst || 0);
      setTestResult(prev => prev + `=== MANUAL CHECK ===\n`);
      setTestResult(prev => prev + `Manual total: €${manualTotal.toFixed(2)}\n`);
      setTestResult(prev => prev + `System total: €${result.totaleJaarkostenMetPv.toFixed(2)}\n`);
      setTestResult(prev => prev + `Difference: €${Math.abs(manualTotal - result.totaleJaarkostenMetPv).toFixed(2)}\n`);

    } catch (error) {
      setTestResult(prev => prev + `ERROR: ${error}\n`);
      console.error('Calculation test error:', error);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Calculation Test</h2>
      
      <button
        onClick={runCalculationTest}
        className="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Run Calculation Test
      </button>

      <div className="bg-gray-100 p-4 rounded-lg">
        <pre className="text-sm whitespace-pre-wrap">{testResult}</pre>
      </div>
    </div>
  );
}
