'use client';

import { useRef, useState, type ReactNode } from 'react';
import { Battery, Info, TrendingUp, Zap, CheckCircle, Layers, BarChart3 } from 'lucide-react';
import { BatteryInputForm } from '@/components/tool/BatteryInputForm';
import { BatteryResults } from '@/components/tool/BatteryResults';
import { BatteryInput, BatteryCalculationResult } from '@/types/battery';
import { calculateBatteryScenarios } from '@/lib/calculations/batteryCalculator';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BatteryProductShowcase } from '@/components/tool/BatteryProductShowcase';
import { Header } from '@/components/home/Header';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function BatterijPage() {
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<BatteryCalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToResults = () => {
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden bij de berekening');
      console.error('Calculation error:', err);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      {/* Hero Section */}
      <section className="border-b border-slate-200 bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-10 lg:grid-cols-[1.8fr_1fr]">
            <div className="space-y-6">
              <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100/90">Nieuwe tool 2025</Badge>
              <h1 className="text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
                Bereken je thuisaccu in 5 stappen
              </h1>
              <p className="text-lg text-slate-600 sm:text-xl">
                Focus op de berekening, niet op de vorm. Vul je verbruik in, pas accu- en contractvoorkeuren aan
                en vergelijk direct de scenario’s mét en zonder saldering.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" className="shadow-md" onClick={scrollToForm}>
                  Start berekening
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={scrollToResults}
                  disabled={!result}
                  className="border-slate-300 text-slate-700 hover:border-orange-400 hover:text-orange-600"
                >
                  Bekijk resultaten
                </Button>
              </div>
              <ul className="grid gap-3 text-sm text-slate-700 sm:grid-cols-3">
                <li className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-emerald-600" />
                  <div>
                    <p className="font-semibold text-slate-900">Stap 1</p>
                    <p className="text-xs text-slate-500">Profiel & verbruik</p>
                  </div>
                </li>
                <li className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <TrendingUp className="mt-0.5 h-4 w-4 text-orange-500" />
                  <div>
                    <p className="font-semibold text-slate-900">Stap 2</p>
                    <p className="text-xs text-slate-500">Accu & arbitrage opties</p>
                  </div>
                </li>
                <li className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <BarChart3 className="mt-0.5 h-4 w-4 text-slate-600" />
                  <div>
                    <p className="font-semibold text-slate-900">Stap 3</p>
                    <p className="text-xs text-slate-500">Vergelijk scenario’s</p>
                  </div>
                </li>
              </ul>
            </div>

            <Card className="space-y-4 border-orange-200 bg-orange-50/80 p-6 shadow-lg shadow-orange-100">
              <div className="flex items-center gap-3">
                <Battery className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-sm uppercase tracking-wide text-orange-500">Wat je krijgt</p>
                  <h2 className="text-lg font-semibold text-slate-900">Functionele inzichten</h2>
                </div>
              </div>
              <div className="space-y-3 text-sm text-slate-700">
                <FeatureRow
                  icon={<Layers className="h-4 w-4 text-orange-500" />}
                  title="Scenario’s naast elkaar"
                  description="Huidig, na 2027 en dynamisch contract – inclusief eigenverbruik, arbitrage en staffels."
                />
                <FeatureRow
                  icon={<TrendingUp className="h-4 w-4 text-emerald-500" />}
                  title="Cashflow inzicht"
                  description="Zie exact wanneer je break-even draait en hoe de cashflow zich ontwikkelt."
                />
                <FeatureRow
                  icon={<Zap className="h-4 w-4 text-sky-500" />}
                  title="Slim laden"
                  description="Configureer laad- en ontlaaddrempels voor dynamische prijzen en flexibele lasten."
                />
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="h-full border-slate-200 bg-slate-50 p-6">
            <div className="flex items-start gap-3">
              <Info className="h-6 w-6 flex-shrink-0 text-blue-600" />
              <div className="space-y-3 text-sm text-slate-700">
                <h2 className="text-lg font-semibold text-slate-900">Waarom deze tool?</h2>
                <p>
                  <strong>Saldering wordt afgebouwd richting 2027.</strong> Met een accu verhoog je je eigenverbruik en
                  vermijd je terugleverkosten. Deze tool rekent drie scenario’s functioneel door:
                </p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Huidige situatie met volledige saldering (2024-2026).</li>
                  <li>Na 2027 – geen saldering, wettelijke minimale vergoeding.</li>
                  <li>Dynamisch contract – slim laden/ontladen op uurbasis.</li>
                </ul>
                <p className="text-xs text-slate-500">
                  We gebruiken conservatieve aannames; pas ze gerust aan naar je eigen situatie.
                </p>
              </div>
            </div>
          </Card>
          <Card className="h-full border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Wat je zelf kunt instellen</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <FeatureRow
                icon={<CheckCircle className="h-4 w-4 text-emerald-500" />}
                title="Dynamisch vs vast"
                description="Bekijk direct het effect van arbitrage, terugleverkosten en contractopslag."
              />
              <FeatureRow
                icon={<TrendingUp className="h-4 w-4 text-orange-500" />}
                title="Accu-specificaties"
                description="Capaciteit, prijs, degradatie en round-trip efficiency hebben direct impact op de cashflow."
              />
              <FeatureRow
                icon={<Zap className="h-4 w-4 text-sky-500" />}
                title="Flexibele lasten"
                description="Stel laadprofielen, EV/WP-flex en laad-/ontlaaddrempels in voor een realistisch profiel."
              />
            </div>
          </Card>
        </div>
      </section>

      {/* Input Form */}
      <section ref={formRef} id="bereken-form" className="container mx-auto px-4 pb-12">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="text-center space-y-3">
            <Badge variant="outline" className="border-orange-300 text-orange-600">
              Stap 1 · Vul je profiel in
            </Badge>
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Vul je gegevens in</h2>
            <p className="text-sm text-slate-600 sm:text-base">
              De wizard vraagt alleen wat we nodig hebben. Je kunt ieder veld aanpassen en direct zien wat dit
              betekent voor de terugverdientijd.
            </p>
          </div>

          <ErrorBoundary>
            <BatteryInputForm onCalculate={handleCalculate} isCalculating={isCalculating} />
          </ErrorBoundary>

          {error && (
            <Card className="border-red-200 bg-red-50 p-5">
              <div className="flex items-start gap-3 text-sm text-red-800">
                <Info className="mt-1 h-4 w-4 flex-shrink-0 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-900">Berekening mislukt</h3>
                  <p>{error}</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </section>

      {/* Results */}
      {result && (
        <section ref={resultsRef} id="results" className="container mx-auto px-4 pb-12">
          <div className="mx-auto max-w-5xl space-y-6">
            <div className="space-y-2 text-center">
              <Badge variant="outline" className="border-emerald-300 text-emerald-600">
                Stap 2 · Resultaten
              </Badge>
              <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Resultaten</h2>
              <p className="text-sm text-slate-600 sm:text-base">
                Vergelijk scenario’s, bekijk cashflow en zie precies waar de besparing vandaan komt.
              </p>
            </div>
            <ErrorBoundary>
              <BatteryResults result={result} />
            </ErrorBoundary>
          </div>
        </section>
      )}

      {/* Bottom Info */}
      {!result && (
        <section className="container mx-auto px-4 pb-12">
          <div className="mx-auto max-w-5xl">
            <Card className="border-slate-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-slate-900">Wat we meenemen in de berekening</h3>
              <div className="mt-4 grid gap-4 text-sm text-slate-700 md:grid-cols-2">
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                  <h4 className="font-semibold text-slate-900">Eigenverbruik verhogen</h4>
                  <p className="mt-1">
                    Van ~30% naar ~60% door opslag. Iedere extra kWh eigenverbruik scheelt afname én terugleverkosten.
                  </p>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                  <h4 className="font-semibold text-slate-900">Terugleverkosten vermijden</h4>
                  <p className="mt-1">
                    Minder teruglevering betekent lagere staffelkosten. We rekenen automatisch met je ingevoerde profiel.
                  </p>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                  <h4 className="font-semibold text-slate-900">Arbitrage op dynamische prijzen</h4>
                  <p className="mt-1">
                    Historische uurprijzen (2024-2025) bepalen hoeveel cycli rendabel zijn – inclusief opslag en vaste
                    kosten.
                  </p>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                  <h4 className="font-semibold text-slate-900">Saldering vs post-2027</h4>
                  <p className="mt-1">
                    Na 2027 reken je met minimale terugleververgoeding. De tool laat zien hoe een accu dat gat kan
                    dichten.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>
      )}

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

function FeatureRow({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-slate-900">{title}</p>
        <p className="text-xs text-slate-600">{description}</p>
      </div>
    </div>
  );
}

