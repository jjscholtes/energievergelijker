'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Header } from '@/components/home/Header';
import { Footer } from '@/components/home/Footer';
import {
  Zap,
  Home,
  Thermometer,
  TrendingDown,
  TrendingUp,
  Calculator,
  Loader2,
  Info,
  Sun,
  Snowflake,
  Flame,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Car,
  BatteryCharging,
  Plug,
  Euro,
  PiggyBank,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { HeatingType, BuildYearRange, buildYearRanges } from '@/lib/data/neduProfiles';
import { ENERGY_CONSTANTS } from '@/lib/constants';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type NetbeheerderType = 'Liander' | 'Stedin' | 'Enexis';

const NETBEHEERDER_OPTIONS: { value: NetbeheerderType; label: string; kosten: number }[] = [
  { value: 'Liander', label: 'Liander', kosten: ENERGY_CONSTANTS.NETBEHEERDER_COSTS.LIANDER.stroom },
  { value: 'Stedin', label: 'Stedin', kosten: ENERGY_CONSTANTS.NETBEHEERDER_COSTS.STEDIN.stroom },
  { value: 'Enexis', label: 'Enexis', kosten: ENERGY_CONSTANTS.NETBEHEERDER_COSTS.ENEXIS.stroom },
];

// ============================================================================
// INTERFACES - Matching NEW API Response
// ============================================================================

interface MonthlySummary {
  month: number;
  monthName: string;
  consumption: number;
  production: number;
  selfConsumption: number;
  feedIn: number;
  gridConsumption: number;
  averageSpotPrice: number;
  cost: number;
}

interface CalculationResult {
  input: {
    totalKwh: number;
    solarProduction: number;
    selfConsumptionKwh: number;
    feedInKwh: number;
    gridConsumptionKwh: number;
  };
  
  variableCosts: {
    gridConsumptionCost: number;
    feedInRevenue: number;
    netVariableCost: number;
    avgPricePerKwh: number;
    avgFeedInPricePerKwh: number;
  };
  
  fixedCosts: {
    gridCosts: number;
    supplierFixedCosts: number;
    energyTaxReduction: number;
    netFixed: number;
  };
  
  totalCostDynamic: number;
  totalCostFixedWithSaldering: number;
  totalCostFixedNoSaldering: number;
  
  savingsVsFixedWithSaldering: number;
  savingsVsFixedNoSaldering: number;
  
  profileMix: {
    baseKwh: number;
    heatingKwh: number;
    evKwh: number;
    method: 'nibud' | 'buildYear';
  };
  
  solarAnalysis: {
    inputSelfConsumptionPct: number;
    calculatedSelfConsumptionPct: number;
    dynamicFeedInRevenue: number;
    fixedSalderingRevenue: number;
    fixedFeedInRevenue: number;
    fixedFeedInCosts: number;
    netFixedFeedInValue: number;
    dynamicAdvantage: number;
  };
  
  evAnalysis: {
    evKwh: number;
    smartChargingSavings: number;
  };
  
  monthlySummary: MonthlySummary[];
  
  winterCost: number;
  summerCost: number;
  
  netbeheerder: string;
  period: { from: string; till: string };
  lastUpdated: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function DynamischInzichtTool() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [totalKwh, setTotalKwh] = useState<number>(8000);
  const [heatingType, setHeatingType] = useState<HeatingType>('all-electric');
  const [buildYear, setBuildYear] = useState<BuildYearRange>('2006-2016');
  const [persons, setPersons] = useState<number | undefined>(undefined);
  const [netbeheerder, setNetbeheerder] = useState<NetbeheerderType>('Liander');
  
  // Zonnepanelen
  const [hasSolar, setHasSolar] = useState<boolean>(false);
  const [solarProduction, setSolarProduction] = useState<number>(4000);
  const [selfConsumptionPct, setSelfConsumptionPct] = useState<number>(30);
  
  // Elektrische Auto
  const [hasEV, setHasEV] = useState<boolean>(false);
  const [evKwhPerYear, setEvKwhPerYear] = useState<number>(3000);
  const [smartCharging, setSmartCharging] = useState<boolean>(true);
  
  // Daisycon comparison widget ref
  const comparisonWidgetRef = useRef<HTMLDivElement>(null);
  
  // Daisycon widget config with prefilled user data
  const daisyconConfig = useMemo(() => {
    // Schat aantal zonnepanelen: gemiddeld 400 kWh per paneel per jaar
    const estimatedPanels = hasSolar ? Math.round(solarProduction / 400) : 0;
    
    return {
      mediaId: 413683,
      locale: "nl-NL",
      filter: {
        tariffType: {
          value: ["dynamic"]
        }
      },
      prefill: {
        meter: "single",
        electricity_single: totalKwh,
        gas: heatingType === 'gas' ? 1500 : 0, // Geen gas bij all-electric/hybride
        solar: hasSolar ? 1 : 0,
        solar_panels: estimatedPanels,
      }
    };
  }, [totalKwh, heatingType, hasSolar, solarProduction]);
  
  // Load Daisycon energy comparison script
  useEffect(() => {
    const scriptId = 'daisycon-energy-script';
    
    // Check if script already exists
    if (document.getElementById(scriptId)) {
      return;
    }
    
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://daisycon.tools/energy-nl/app.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      // Cleanup: remove script on unmount
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);
  
  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/dynamic-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalKwh,
          heatingType,
          buildYear,
          persons: persons || undefined,
          netbeheerder,
          hasSolar,
          solarProduction: hasSolar ? solarProduction : 0,
          selfConsumptionPercentage: hasSolar ? selfConsumptionPct : 0,
          hasEV,
          evKwhPerYear: hasEV ? evKwhPerYear : 0,
          smartCharging: hasEV ? smartCharging : false,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Berekening mislukt');
      }
      
      const data = await response.json();
      setResult(data);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Onbekende fout');
    } finally {
      setLoading(false);
    }
  };
  
  const heatingOptions: { value: HeatingType; label: string; icon: typeof Flame; description: string }[] = [
    { value: 'gas', label: 'Gasverwarming', icon: Flame, description: 'CV-ketel op aardgas' },
    { value: 'hybrid', label: 'Hybride', icon: Thermometer, description: 'Warmtepomp + CV-ketel' },
    { value: 'all-electric', label: 'All-Electric', icon: Zap, description: 'Volledig elektrisch (warmtepomp)' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-full text-sm font-bold mb-6 shadow-lg">
            <Calculator className="w-4 h-4" />
            <span>Dynamische Energie Inzicht Tool</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Bereken Je Echte Dynamische Kosten
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Complete berekening inclusief netbeheerkosten, belastingvermindering en vaste kosten. 
            Speciaal ontwikkeld voor warmtepompen en all-electric woningen.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    step >= s 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                </div>
                {s < 3 && (
                  <div className={`w-20 h-1 mx-2 rounded ${step > s ? 'bg-purple-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Verbruik */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Zap className="w-6 h-6 text-purple-600" />
              Stap 1: Je Stroomverbruik
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jaarlijks stroomverbruik (kWh)
                </label>
                <input
                  type="number"
                  value={totalKwh}
                  onChange={(e) => setTotalKwh(Number(e.target.value))}
                  min={500}
                  max={50000}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
                  placeholder="Bijv. 8000"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Gemiddeld verbruik all-electric woning: 6.000 - 12.000 kWh/jaar
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Type verwarming
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {heatingOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setHeatingType(option.value)}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          heatingType === option.value
                            ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <Icon className={`w-6 h-6 mb-2 ${heatingType === option.value ? 'text-purple-600' : 'text-gray-400'}`} />
                        <div className="font-semibold text-gray-900">{option.label}</div>
                        <div className="text-sm text-gray-500">{option.description}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Zonnepanelen Toggle */}
              <div className="border-t border-gray-200 pt-6">
                <div 
                  onClick={() => setHasSolar(!hasSolar)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    hasSolar 
                      ? 'border-yellow-500 bg-yellow-50 ring-2 ring-yellow-200' 
                      : 'border-gray-200 hover:border-yellow-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Sun className={`w-6 h-6 ${hasSolar ? 'text-yellow-600' : 'text-gray-400'}`} />
                      <div>
                        <div className="font-semibold text-gray-900">Zonnepanelen</div>
                        <div className="text-sm text-gray-500">Eigenverbruik wordt per uur berekend!</div>
                      </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full transition-all ${hasSolar ? 'bg-yellow-500' : 'bg-gray-300'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform mt-0.5 ${hasSolar ? 'translate-x-6 ml-0.5' : 'translate-x-0.5'}`} />
                    </div>
                  </div>
                </div>

                {hasSolar && (
                  <div className="mt-4 p-4 bg-yellow-50 rounded-xl space-y-4 border border-yellow-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jaarproductie (kWh)
                      </label>
                      <input
                        type="number"
                        value={solarProduction}
                        onChange={(e) => setSolarProduction(Number(e.target.value))}
                        min={500}
                        max={20000}
                        className="w-full px-4 py-3 border-2 border-yellow-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        placeholder="Bijv. 4000"
                      />
                      <p className="text-xs text-gray-500 mt-1">Typisch: 8 panelen ≈ 3.000 kWh/jaar</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Geschat eigenverbruik: <span className="text-yellow-700 font-bold">{selfConsumptionPct}%</span>
                      </label>
                      <input
                        type="range"
                        min={10}
                        max={80}
                        value={selfConsumptionPct}
                        onChange={(e) => setSelfConsumptionPct(Number(e.target.value))}
                        className="w-full h-2 bg-yellow-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>10% (weinig thuis)</span>
                        <span>80% (thuiswerker + batterij)</span>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-yellow-100 rounded-lg text-sm text-yellow-800">
                      <strong>💡 Tip:</strong> We berekenen ook per uur op basis van gelijktijdigheid. 
                      In de resultaten zie je zowel jouw schatting als onze berekening.
                    </div>
                  </div>
                )}
              </div>

              {/* EV Toggle */}
              <div>
                <div 
                  onClick={() => setHasEV(!hasEV)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    hasEV 
                      ? 'border-green-500 bg-green-50 ring-2 ring-green-200' 
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Car className={`w-6 h-6 ${hasEV ? 'text-green-600' : 'text-gray-400'}`} />
                      <div>
                        <div className="font-semibold text-gray-900">Elektrische Auto</div>
                        <div className="text-sm text-gray-500">Eigen laadprofiel voor slim laden</div>
                      </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full transition-all ${hasEV ? 'bg-green-500' : 'bg-gray-300'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform mt-0.5 ${hasEV ? 'translate-x-6 ml-0.5' : 'translate-x-0.5'}`} />
                    </div>
                  </div>
                </div>

                {hasEV && (
                  <div className="mt-4 p-4 bg-green-50 rounded-xl space-y-4 border border-green-200">
                    <div className="p-3 bg-green-100 rounded-lg text-sm text-green-800">
                      <strong>💡 Toelichting:</strong> Je EV-verbruik zit al in je totale jaarverbruik hierboven. 
                      Geef hieronder aan hoeveel kWh daarvan voor de auto is.
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hoeveel kWh van je totaal is EV-laden?
                      </label>
                      <input
                        type="number"
                        value={evKwhPerYear}
                        onChange={(e) => setEvKwhPerYear(Number(e.target.value))}
                        min={500}
                        max={10000}
                        className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Bijv. 3000"
                      />
                      <p className="text-xs text-gray-500 mt-1">Richtlijn: 15.000 km ≈ 3.000 kWh</p>
                    </div>
                    <div 
                      onClick={() => setSmartCharging(!smartCharging)}
                      className={`p-3 rounded-lg cursor-pointer transition-all flex items-center justify-between ${
                        smartCharging ? 'bg-green-100 border-2 border-green-300' : 'bg-white border-2 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <BatteryCharging className={`w-5 h-5 ${smartCharging ? 'text-green-600' : 'text-gray-400'}`} />
                        <div>
                          <div className="font-medium text-gray-900">Slim Laden Actief</div>
                          <div className="text-xs text-gray-500">Laden in nachturen (0:00-6:00)</div>
                        </div>
                      </div>
                      <div className={`w-10 h-5 rounded-full transition-all ${smartCharging ? 'bg-green-500' : 'bg-gray-300'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform mt-0.5 ${smartCharging ? 'translate-x-5 ml-0.5' : 'translate-x-0.5'}`} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
              >
                Volgende
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Woning */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Home className="w-6 h-6 text-purple-600" />
              Stap 2: Je Woning
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Bouwjaar woning (bepaalt isolatiegraad)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {buildYearRanges.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setBuildYear(option.value)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        buildYear === option.value
                          ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="font-semibold text-gray-900">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aantal personen in huishouden (optioneel)
                </label>
                <select
                  value={persons || ''}
                  onChange={(e) => setPersons(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Niet opgeven (gebruik bouwjaar)</option>
                  <option value="1">1 persoon</option>
                  <option value="2">2 personen</option>
                  <option value="3">3 personen</option>
                  <option value="4">4 personen</option>
                  <option value="5">5+ personen</option>
                </select>
                <p className="text-sm text-gray-500 mt-2">
                  Met het aantal personen kunnen we nauwkeuriger inschatten welk deel van je verbruik 
                  naar verwarming gaat (NIBUD-methode).
                </p>
              </div>

              {/* Netbeheerder Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <div className="flex items-center gap-2">
                    <Plug className="w-4 h-4 text-gray-500" />
                    Netbeheerder (voor correcte netbeheerkosten)
                  </div>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {NETBEHEERDER_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setNetbeheerder(option.value)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        netbeheerder === option.value
                          ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="font-semibold text-gray-900">{option.label}</div>
                      <div className="text-sm text-purple-600 font-medium">€{option.kosten}/jaar</div>
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Check je energierekening voor je netbeheerder.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-bold text-lg hover:bg-gray-200 transition-all"
                >
                  Terug
                </button>
                <button
                  onClick={handleCalculate}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Berekenen...
                    </>
                  ) : (
                    <>
                      <Calculator className="w-5 h-5" />
                      Bereken Kosten
                    </>
                  )}
                </button>
              </div>
              
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700">{error}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Results */}
        {step === 3 && result && (
          <div className="space-y-8">
            
            {/* Main Cost Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
                <div className="text-sm font-medium opacity-80 mb-1">Totale Jaarkosten Dynamisch</div>
                <div className="text-4xl font-bold">€{result.totalCostDynamic.toFixed(0)}</div>
                <div className="text-sm opacity-80 mt-2">Inclusief alle vaste kosten</div>
              </div>
              
              <div className={`rounded-2xl p-6 shadow-xl ${result.savingsVsFixedWithSaldering > 0 ? 'bg-green-50 border-2 border-green-200' : 'bg-orange-50 border-2 border-orange-200'}`}>
                <div className={`text-sm font-medium mb-1 ${result.savingsVsFixedWithSaldering > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                  vs Vast (met saldering)
                </div>
                <div className={`text-4xl font-bold ${result.savingsVsFixedWithSaldering > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                  {result.savingsVsFixedWithSaldering > 0 ? '+' : ''}€{result.savingsVsFixedWithSaldering.toFixed(0)}
                </div>
                <div className={`text-sm mt-2 ${result.savingsVsFixedWithSaldering > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                  {result.savingsVsFixedWithSaldering > 0 ? 'besparing/jaar' : 'meerkosten/jaar'}
                </div>
              </div>
              
              {hasSolar && (
                <div className={`rounded-2xl p-6 shadow-xl ${result.savingsVsFixedNoSaldering > 0 ? 'bg-emerald-50 border-2 border-emerald-200' : 'bg-red-50 border-2 border-red-200'}`}>
                  <div className={`text-sm font-medium mb-1 ${result.savingsVsFixedNoSaldering > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    vs Vast (na 2027, geen saldering)
                  </div>
                  <div className={`text-4xl font-bold ${result.savingsVsFixedNoSaldering > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {result.savingsVsFixedNoSaldering > 0 ? '+' : ''}€{result.savingsVsFixedNoSaldering.toFixed(0)}
                  </div>
                  <div className={`text-sm mt-2 ${result.savingsVsFixedNoSaldering > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {result.savingsVsFixedNoSaldering > 0 ? 'besparing/jaar' : 'meerkosten/jaar'}
                  </div>
                </div>
              )}
            </div>

            {/* Jouw berekening - Transparant */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-purple-600" />
                Jouw Berekening (Transparant)
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Links: Verbruik & Productie */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700">Energie Stromen</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span>Totaal verbruik</span>
                      <span className="font-bold">{result.input.totalKwh.toFixed(0)} kWh</span>
                    </div>
                    {hasSolar && (
                      <>
                        <div className="flex justify-between p-3 bg-yellow-50 rounded-lg">
                          <span>Zonne-opwek</span>
                          <span className="font-bold text-yellow-700">{result.input.solarProduction.toFixed(0)} kWh</span>
                        </div>
                        <div className="flex justify-between p-3 bg-green-50 rounded-lg">
                          <span>Eigenverbruik ({result.solarAnalysis.calculatedSelfConsumptionPct.toFixed(0)}%)</span>
                          <span className="font-bold text-green-700">{result.input.selfConsumptionKwh.toFixed(0)} kWh</span>
                        </div>
                        <div className="flex justify-between p-3 bg-amber-50 rounded-lg">
                          <span>Teruglevering</span>
                          <span className="font-bold text-amber-700">{result.input.feedInKwh.toFixed(0)} kWh</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between p-3 bg-purple-50 rounded-lg border-2 border-purple-200">
                      <span>Netto afname van net</span>
                      <span className="font-bold text-purple-700">{result.input.gridConsumptionKwh.toFixed(0)} kWh</span>
                    </div>
                  </div>
                </div>
                
                {/* Rechts: Kosten */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700">Kostenberekening</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span>Afname ({result.input.gridConsumptionKwh.toFixed(0)} × €{result.variableCosts.avgPricePerKwh.toFixed(2)})</span>
                      <span className="font-bold">€{result.variableCosts.gridConsumptionCost.toFixed(0)}</span>
                    </div>
                    {hasSolar && result.variableCosts.feedInRevenue > 0 && (
                      <div className="flex justify-between p-3 bg-green-50 rounded-lg">
                        <span>Terugleveropbrengst ({result.input.feedInKwh.toFixed(0)} × €{result.variableCosts.avgFeedInPricePerKwh.toFixed(2)})</span>
                        <span className="font-bold text-green-600">-€{result.variableCosts.feedInRevenue.toFixed(0)}</span>
                      </div>
                    )}
                    <div className="flex justify-between p-3 bg-blue-50 rounded-lg">
                      <span>Netbeheer ({result.netbeheerder})</span>
                      <span className="font-bold">€{result.fixedCosts.gridCosts.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span>Vastrecht leverancier</span>
                      <span className="font-bold">€{result.fixedCosts.supplierFixedCosts.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-green-50 rounded-lg">
                      <span>Heffingskorting</span>
                      <span className="font-bold text-green-600">-€{result.fixedCosts.energyTaxReduction.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-purple-100 rounded-lg border-2 border-purple-300">
                      <span className="font-bold">TOTAAL DYNAMISCH</span>
                      <span className="font-bold text-purple-700 text-lg">€{result.totalCostDynamic.toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Vergelijking Tabel */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Euro className="w-5 h-5 text-purple-600" />
                Vergelijking Contracttypes
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Component</th>
                      <th className="text-right py-3 px-4 font-semibold text-purple-600">Dynamisch</th>
                      <th className="text-right py-3 px-4 font-semibold text-blue-600">Vast + Saldering</th>
                      {hasSolar && <th className="text-right py-3 px-4 font-semibold text-gray-600">Vast (na 2027)</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="py-3 px-4 text-gray-700">Variabele kosten netto</td>
                      <td className="text-right py-3 px-4 font-medium text-purple-600">€{result.variableCosts.netVariableCost.toFixed(0)}</td>
                      <td className="text-right py-3 px-4">€{(result.totalCostFixedWithSaldering - result.fixedCosts.netFixed).toFixed(0)}</td>
                      {hasSolar && <td className="text-right py-3 px-4">€{(result.totalCostFixedNoSaldering - result.fixedCosts.netFixed).toFixed(0)}</td>}
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="py-3 px-4 text-gray-700">Vaste kosten netto</td>
                      <td className="text-right py-3 px-4">€{result.fixedCosts.netFixed.toFixed(0)}</td>
                      <td className="text-right py-3 px-4">€{result.fixedCosts.netFixed.toFixed(0)}</td>
                      {hasSolar && <td className="text-right py-3 px-4">€{result.fixedCosts.netFixed.toFixed(0)}</td>}
                    </tr>
                    <tr className="bg-gray-800 text-white font-bold">
                      <td className="py-4 px-4">TOTAAL</td>
                      <td className="text-right py-4 px-4">€{result.totalCostDynamic.toFixed(0)}</td>
                      <td className="text-right py-4 px-4">€{result.totalCostFixedWithSaldering.toFixed(0)}</td>
                      {hasSolar && <td className="text-right py-4 px-4">€{result.totalCostFixedNoSaldering.toFixed(0)}</td>}
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {hasSolar && (
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-3">💡 Teruglevering: Dezelfde logica, andere prijzen</h4>
                  <div className="text-sm space-y-3">
                    
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <p className="font-semibold text-purple-700 mb-1">Dynamisch (2026)</p>
                      <p className="text-gray-600">
                        Afname: {result.input.gridConsumptionKwh.toFixed(0)} kWh × €0,25 = €{(result.input.gridConsumptionKwh * 0.25).toFixed(0)}
                      </p>
                      <p className="text-gray-600">
                        Teruglevering: {result.input.feedInKwh.toFixed(0)} kWh × €0,21 = <span className="text-green-600">-€{result.solarAnalysis.dynamicFeedInRevenue.toFixed(0)}</span>
                      </p>
                    </div>
                    
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="font-semibold text-blue-700 mb-1">Vast MET saldering (2026)</p>
                      <p className="text-gray-600">
                        Afname: {result.input.gridConsumptionKwh.toFixed(0)} kWh × €0,23 = €{(result.input.gridConsumptionKwh * 0.23).toFixed(0)}
                      </p>
                      <p className="text-gray-600">
                        Saldering: {result.input.feedInKwh.toFixed(0)} kWh × €0,12 = <span className="text-green-600">-€{result.solarAnalysis.fixedSalderingRevenue.toFixed(0)}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        (je krijgt de energiebelasting €0,12/kWh terug bij saldering)
                      </p>
                    </div>
                    
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <p className="font-semibold text-orange-700 mb-1">Vast ZONDER saldering (na 2027)</p>
                      <p className="text-gray-600">
                        Afname: {result.input.gridConsumptionKwh.toFixed(0)} kWh × €0,23 = €{(result.input.gridConsumptionKwh * 0.23).toFixed(0)}
                      </p>
                      <p className="text-gray-600">
                        Teruglevering: {result.input.feedInKwh.toFixed(0)} kWh × €0,01 = <span className="text-green-600">-€{result.solarAnalysis.netFixedFeedInValue.toFixed(0)}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        (vergoeding €0,05 - kosten €0,04 = netto €0,01/kWh)
                      </p>
                    </div>
                    
                    <div className="p-3 bg-green-100 rounded-lg">
                      <p className="font-bold text-green-800">
                        Dynamisch voordeel vs vast zonder saldering: €{result.solarAnalysis.dynamicAdvantage.toFixed(0)}/jaar
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Breakdown */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-purple-600" />
                Jouw Verbruiksprofiel
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="text-sm text-gray-500 mb-1">Basisverbruik</div>
                  <div className="text-2xl font-bold text-gray-800">{result.profileMix.baseKwh.toFixed(0)} kWh</div>
                  <div className="text-sm text-gray-500">Verlichting, apparaten</div>
                </div>
                <div className="p-4 bg-orange-50 rounded-xl">
                  <div className="text-sm text-orange-600 mb-1">Verwarming</div>
                  <div className="text-2xl font-bold text-orange-700">{result.profileMix.heatingKwh.toFixed(0)} kWh</div>
                  <div className="text-sm text-orange-600">Warmtepomp</div>
                </div>
                {result.profileMix.evKwh > 0 && (
                  <div className="p-4 bg-green-50 rounded-xl">
                    <div className="text-sm text-green-600 mb-1">EV Laden</div>
                    <div className="text-2xl font-bold text-green-700">{result.profileMix.evKwh.toFixed(0)} kWh</div>
                    <div className="text-sm text-green-600">{smartCharging ? 'Nachturen' : 'Avonduren'}</div>
                  </div>
                )}
                <div className="p-4 bg-purple-50 rounded-xl">
                  <div className="text-sm text-purple-600 mb-1">Methode</div>
                  <div className="text-lg font-bold text-purple-700">
                    {result.profileMix.method === 'nibud' ? 'NIBUD' : 'Bouwjaar'}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-gray-100 rounded-lg text-sm text-gray-700">
                <strong>Check:</strong> {result.profileMix.baseKwh.toFixed(0)} + {result.profileMix.heatingKwh.toFixed(0)} + {result.profileMix.evKwh.toFixed(0)} = {(result.profileMix.baseKwh + result.profileMix.heatingKwh + result.profileMix.evKwh).toFixed(0)} kWh 
                <span className="text-green-600 ml-2">✓ Klopt met invoer ({totalKwh} kWh)</span>
              </div>
            </div>

            {/* Solar Results */}
            {hasSolar && result.input.solarProduction > 0 && (
              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl shadow-lg p-6 border border-yellow-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Sun className="w-5 h-5 text-yellow-600" />
                  Zonnepanelen Analyse
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-white/70 rounded-xl">
                    <div className="text-sm text-gray-500 mb-1">Productie</div>
                    <div className="text-2xl font-bold text-yellow-700">{result.input.solarProduction.toFixed(0)} kWh</div>
                  </div>
                  <div className="p-4 bg-white/70 rounded-xl">
                    <div className="text-sm text-gray-500 mb-1">Eigenverbruik</div>
                    <div className="text-2xl font-bold text-green-600">{result.input.selfConsumptionKwh.toFixed(0)} kWh</div>
                    <div className="text-xs text-gray-500">
                      Berekend: {result.solarAnalysis.calculatedSelfConsumptionPct.toFixed(0)}% 
                      {result.solarAnalysis.inputSelfConsumptionPct > 0 && (
                        <span className="text-yellow-600 ml-1">(jouw schatting: {result.solarAnalysis.inputSelfConsumptionPct}%)</span>
                      )}
                    </div>
                  </div>
                  <div className="p-4 bg-white/70 rounded-xl">
                    <div className="text-sm text-gray-500 mb-1">Teruglevering</div>
                    <div className="text-2xl font-bold text-amber-600">{result.input.feedInKwh.toFixed(0)} kWh</div>
                  </div>
                  <div className="p-4 bg-white/70 rounded-xl">
                    <div className="text-sm text-green-600 mb-1">Teruglevering €</div>
                    <div className="text-2xl font-bold text-green-600">€{result.solarAnalysis.dynamicFeedInRevenue.toFixed(0)}</div>
                  </div>
                </div>
              </div>
            )}

            {/* EV Results */}
            {hasEV && result.evAnalysis.smartChargingSavings > 0 && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-6 border border-green-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Car className="w-5 h-5 text-green-600" />
                  Slim Laden Besparing
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-white/70 rounded-xl">
                    <div className="text-sm text-gray-500 mb-1">EV Verbruik</div>
                    <div className="text-2xl font-bold text-gray-800">{result.evAnalysis.evKwh.toFixed(0)} kWh</div>
                  </div>
                  <div className="p-4 bg-green-100 rounded-xl">
                    <div className="flex items-center gap-2 text-green-600 mb-1">
                      <BatteryCharging className="w-4 h-4" />
                      <span className="text-sm font-medium">Jaarlijkse Besparing</span>
                    </div>
                    <div className="text-3xl font-bold text-green-600">€{result.evAnalysis.smartChargingSavings.toFixed(0)}</div>
                  </div>
                  <div className="p-4 bg-white/70 rounded-xl">
                    <div className="text-sm text-gray-500 mb-1">Per kWh</div>
                    <div className="text-2xl font-bold text-gray-800">€{(result.evAnalysis.smartChargingSavings / result.evAnalysis.evKwh).toFixed(3)}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Seasonal Costs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-2xl p-6 shadow-lg border-2 border-blue-200">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <Snowflake className="w-5 h-5" />
                  <span className="text-lg font-bold">Winterkosten</span>
                </div>
                <div className="text-4xl font-bold text-blue-700">€{result.winterCost.toFixed(0)}</div>
                <div className="text-sm text-blue-600 mt-1">Dec, Jan, Feb</div>
              </div>
              
              <div className="bg-amber-50 rounded-2xl p-6 shadow-lg border-2 border-amber-200">
                <div className="flex items-center gap-2 text-amber-600 mb-2">
                  <Sun className="w-5 h-5" />
                  <span className="text-lg font-bold">Zomerkosten</span>
                </div>
                <div className="text-4xl font-bold text-amber-700">€{result.summerCost.toFixed(0)}</div>
                <div className="text-sm text-amber-600 mt-1">Jun, Jul, Aug</div>
              </div>
            </div>

            {/* Monthly Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Maandelijkse Kosten</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={result.monthlySummary}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="monthName" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(v) => `€${v}`} tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value) => [`€${Number(value).toFixed(2)}`, '']}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
                    />
                    <Bar dataKey="cost" fill="#8B5CF6" name="Netto kosten" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Price Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Gemiddelde Spotprijs per Maand</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={result.monthlySummary}>
                    <defs>
                      <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="monthName" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={(v) => `€${v.toFixed(2)}`} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value) => [`€${Number(value).toFixed(3)}/kWh`, 'Spotprijs']} />
                    <Area type="monotone" dataKey="averageSpotPrice" stroke="#8B5CF6" strokeWidth={2} fill="url(#priceGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="p-4 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-2 text-green-600 mb-1">
                    <TrendingDown className="w-4 h-4" />
                    <span className="text-sm font-medium">Goedkoopste Maand</span>
                  </div>
                  <div className="text-xl font-bold text-green-700">
                    {result.monthlySummary.reduce((min, m) => m.averageSpotPrice < min.averageSpotPrice ? m : min).monthName}
                  </div>
                </div>
                <div className="p-4 bg-orange-50 rounded-xl">
                  <div className="flex items-center gap-2 text-orange-600 mb-1">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-medium">Duurste Maand</span>
                  </div>
                  <div className="text-xl font-bold text-orange-700">
                    {result.monthlySummary.reduce((max, m) => m.averageSpotPrice > max.averageSpotPrice ? m : max).monthName}
                  </div>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
              <div className="flex items-start gap-4">
                <Info className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Over deze berekening</h3>
                  <div className="space-y-2 text-gray-600 text-sm">
                    <p>
                      <strong>Transparant:</strong> Afname ({result.input.gridConsumptionKwh.toFixed(0)} kWh) × €{result.variableCosts.avgPricePerKwh.toFixed(2)} 
                      - teruglevering ({result.input.feedInKwh.toFixed(0)} kWh) × €{result.variableCosts.avgFeedInPricePerKwh.toFixed(2)}
                    </p>
                    <p>
                      <strong>Vaste kosten:</strong> Netbeheer €{result.fixedCosts.gridCosts} + vastrecht €{result.fixedCosts.supplierFixedCosts} - heffingskorting €{result.fixedCosts.energyTaxReduction} = €{result.fixedCosts.netFixed}/jaar
                    </p>
                    <p>
                      <strong>Teruglevering dynamisch:</strong> Spotprijs + energiebelasting - €0,023 marge = ~€{result.variableCosts.avgFeedInPricePerKwh.toFixed(2)}/kWh
                    </p>
                    <p>
                      <strong>Periode:</strong> {result.period.from} t/m {result.period.till}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => { setStep(1); setResult(null); }}
                className="px-8 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
              >
                Nieuwe Berekening
              </button>
              <a
                href="/dayaheadprijzen"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-indigo-700 transition-all text-center"
              >
                Bekijk Huidige Day-Ahead Prijzen
              </a>
            </div>
          </div>
        )}

        {/* Explainer Section (always visible) */}
        {step < 3 && (
          <div className="mt-16 bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Wat maakt deze tool uniek?
            </h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Euro className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Complete Kosten</h3>
                <p className="text-gray-600 text-sm">
                  Netbeheer, vastrecht, heffingskorting — alles erin.
                </p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Thermometer className="w-7 h-7 text-orange-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Correcte Profielen</h3>
                <p className="text-gray-600 text-sm">
                  EV, verwarming en basis elk apart.
                </p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sun className="w-7 h-7 text-yellow-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Gelijktijdigheid</h3>
                <p className="text-gray-600 text-sm">
                  Eigenverbruik per uur berekend.
                </p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <PiggyBank className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Transparant</h3>
                <p className="text-gray-600 text-sm">
                  Zie precies hoe je totaal is opgebouwd.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Dynamische Contracten Vergelijker */}
        <div className="mt-16 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 rounded-2xl shadow-lg p-8 border border-purple-200">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Zap className="w-4 h-4" />
              Vergelijk dynamische contracten
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Klaar om over te stappen naar dynamisch?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Vergelijk hieronder alle dynamische energiecontracten en ontdek welke leverancier het beste bij jouw situatie past.
            </p>
            <p className="text-sm text-purple-600 mt-2">
              ✨ Je gegevens zijn al ingevuld: {totalKwh.toLocaleString()} kWh{hasSolar ? ` + ${Math.round(solarProduction / 400)} zonnepanelen` : ''}
            </p>
          </div>
          
          {/* Daisycon Energy Comparison Widget - Prefilled with user data */}
          <div 
            key={JSON.stringify(daisyconConfig.prefill)} // Re-render when prefill changes
            ref={comparisonWidgetRef}
            className="dc-tool dc-energy-tool min-h-[400px]"
            data-config={JSON.stringify(daisyconConfig)}
          />
          
          <p className="text-xs text-gray-500 mt-6 text-center">
            * Affiliate links — wij ontvangen een vergoeding bij overstap via bovenstaande vergelijker
          </p>
        </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
