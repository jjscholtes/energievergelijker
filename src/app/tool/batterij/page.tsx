'use client';

import { useState } from 'react';
import { Battery, Info, TrendingUp, Zap, CheckCircle } from 'lucide-react';
import { BatteryInputForm } from '@/components/tool/BatteryInputForm';
import { BatteryResults } from '@/components/tool/BatteryResults';
import { BatteryInput, BatteryCalculationResult } from '@/types/battery';
import { calculateBatteryScenarios } from '@/lib/calculations/batteryCalculator';
import { Card } from '@/components/ui/card';
import { BatteryProductShowcase } from '@/components/tool/BatteryProductShowcase';
import { Header } from '@/components/home/Header';

export default function BatterijPage() {
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<BatteryCalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async (input: BatteryInput) => {
    setIsCalculating(true);
    setError(null);
    setResult(null);

    try {
      // Laad CSV data
      const [csv2024Response, csv2025Response] = await Promise.all([
        fetch('/jeroen_punt_nl_dynamische_stroomprijzen_jaar_2024.csv'),
        fetch('/jeroen_punt_nl_dynamische_stroomprijzen_jaar_2025.csv'),
      ]);

      if (!csv2024Response.ok || !csv2025Response.ok) {
        throw new Error('Kon prijsdata niet laden');
      }

      const csv2024 = await csv2024Response.text();
      const csv2025 = await csv2025Response.text();

      // Bereken scenario's
      const calculationResult = await calculateBatteryScenarios(input, csv2024, csv2025);
      
      setResult(calculationResult);
      
      // Scroll naar resultaten
      setTimeout(() => {
        const resultsElement = document.getElementById('results');
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden bij de berekening');
      console.error('Calculation error:', err);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
      <Header />
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Battery className="w-12 h-12" />
              <h1 className="text-4xl lg:text-5xl font-bold">
                Thuisaccu Terugverdientijd Calculator
              </h1>
            </div>
            <div className="inline-flex items-center gap-2 bg-white/20 text-white px-3 py-1 rounded-full text-sm font-semibold mb-6">
              <span className="bg-white text-orange-600 px-2 py-0.5 rounded-full text-xs font-bold uppercase">Beta</span>
              <span>We toetsen deze tool met echte gebruikersfeedback</span>
            </div>
            
            <p className="text-xl lg:text-2xl text-orange-100 mb-6 max-w-3xl mx-auto">
              Bereken of een thuisbatterij voor jou rendabel is, met en zonder saldering
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                <CheckCircle className="w-4 h-4" />
                <span>3 scenario's</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                <TrendingUp className="w-4 h-4" />
                <span>Arbitrage analyse</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                <Zap className="w-4 h-4" />
                <span>Impact eigenverbruik</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <Card className="p-6 mb-8 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-3">
              <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">Waarom deze tool?</h2>
                <div className="text-sm text-gray-700 space-y-2">
                  <p>
                    <strong>Saldering eindigt op 1 januari 2027.</strong> Dat maakt een thuisbatterij interessanter 
                    omdat je meer profijt hebt van zelfverbruik. Deze tool vergelijkt verschillende scenario's:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Huidig (2024-2026): met volledige saldering</li>
                    <li>Na 2027: zonder saldering, minimaal 50% terugleververgoeding</li>
                    <li>Dynamisch contract: met arbitrage voordelen door slim laden/ontladen</li>
                  </ul>
                  <p className="mt-3">
                    <strong>Let op:</strong> De berekeningen zijn conservatief en gebaseerd op gemiddelden. 
                    Werkelijke resultaten hangen af van jouw specifieke situatie, energieprijzen en gebruikspatroon.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Input Form */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Vul je gegevens in</h2>
            <BatteryInputForm onCalculate={handleCalculate} isCalculating={isCalculating} />
          </div>

          {/* Error Message */}
          {error && (
            <Card className="p-6 mb-8 bg-red-50 border-red-200">
              <div className="flex items-start gap-3">
                <Info className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-red-900 mb-1">Fout bij berekening</h3>
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Results */}
          {result && (
            <div id="results" className="scroll-mt-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Resultaten</h2>
              <BatteryResults result={result} />
            </div>
          )}

          {/* Bottom Info */}
          {!result && (
            <Card className="p-6 bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Wat berekenen we?</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <h4 className="font-semibold mb-2">Eigenverbruik verhoging</h4>
                  <p>
                    Met een accu verhoog je je eigenverbruik van typisch ~30% naar ~60%. 
                    Elke kWh die je zelf verbruikt hoef je niet uit het net te halen.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Terugleverkosten besparing</h4>
                  <p>
                    Door minder terug te leveren, betaal je minder terugleverkosten. 
                    Deze kosten zijn gestaffeld en kunnen flink oplopen.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Arbitrage voordeel</h4>
                  <p>
                    Bij een dynamisch contract kun je laden wanneer stroom goedkoop is 
                    en gebruiken/ontladen wanneer stroom duur is.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Saldering impact</h4>
                  <p>
                    Tot 2027 kun je nog salderen. Daarna wordt eigenverbruik belangrijker 
                    en wordt een accu potentieel interessanter.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      <BatteryProductShowcase />

      {/* Disclaimer */}
      <div className="bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center text-sm text-gray-600">
            <p>
              <strong>Disclaimer:</strong> Deze tool is bedoeld als indicatie en niet als financieel advies. 
              Werkelijke resultaten kunnen afwijken door veranderingen in energieprijzen, beleid, technologie 
              en persoonlijk gebruik. Raadpleeg altijd meerdere bronnen en leveranciers voordat je een aankoop doet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

