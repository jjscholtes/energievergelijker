'use client';

import { useState } from 'react';
import { Header } from '@/components/home/Header';
import { Footer } from '@/components/home/Footer';
import {
  Zap,
  Home,
  Users,
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
  Leaf,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { HeatingType, BuildYearRange, buildYearRanges } from '@/lib/data/neduProfiles';

interface MonthlySummary {
  month: number;
  monthName: string;
  totalConsumption: number;
  averagePrice: number;
  totalCost: number;
  heatingCost: number;
  baseCost: number;
}

interface CalculationResult {
  totalCost: number;
  totalConsumption: number;
  averagePrice: number;
  fixedContractCost: number;
  fixedContractCostNoNetMetering?: number;
  savings: number;
  savingsVsNoNetMetering?: number;
  savingsPercentage: number;
  profileMix: {
    baseKwh: number;
    heatingKwh: number;
    method: 'nibud' | 'buildYear';
  };
  monthlySummary: MonthlySummary[];
  winterCost: number;
  summerCost: number;
  cheapestMonth: { month: number; name: string; avgPrice: number };
  expensiveMonth: { month: number; name: string; avgPrice: number };
  period: { from: string; till: string };
  // Zonnepanelen
  solarSavings?: number;
  solarSelfConsumption?: number;
  solarFeedIn?: number;
  feedInRevenue?: number;
  // EV
  evCost?: number;
  evSmartChargingSavings?: number;
}

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
  
  // Zonnepanelen
  const [hasSolar, setHasSolar] = useState<boolean>(false);
  const [solarProduction, setSolarProduction] = useState<number>(4000);
  const [selfConsumptionPercentage, setSelfConsumptionPercentage] = useState<number>(30);
  
  // Elektrische Auto
  const [hasEV, setHasEV] = useState<boolean>(false);
  const [evKwhPerYear, setEvKwhPerYear] = useState<number>(3000);
  const [smartCharging, setSmartCharging] = useState<boolean>(true);
  
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
          // Zonnepanelen
          hasSolar,
          solarProduction: hasSolar ? solarProduction : 0,
          selfConsumptionPercentage: hasSolar ? selfConsumptionPercentage : 0,
          // Elektrische Auto
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
    { 
      value: 'gas', 
      label: 'Gasverwarming', 
      icon: Flame,
      description: 'CV-ketel op aardgas'
    },
    { 
      value: 'hybrid', 
      label: 'Hybride', 
      icon: Thermometer,
      description: 'Warmtepomp + CV-ketel'
    },
    { 
      value: 'all-electric', 
      label: 'All-Electric', 
      icon: Zap,
      description: 'Volledig elektrisch (warmtepomp)'
    },
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
            Geen gemiddelden, maar echte historische uurprijzen gecombineerd met jouw 
            specifieke verbruiksprofiel. Speciaal ontwikkeld voor warmtepompen en all-electric woningen.
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
                        <div className="text-sm text-gray-500">Inclusief teruglevering en eigenverbruik</div>
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
                        Eigenverbruik percentage: {selfConsumptionPercentage}%
                      </label>
                      <input
                        type="range"
                        value={selfConsumptionPercentage}
                        onChange={(e) => setSelfConsumptionPercentage(Number(e.target.value))}
                        min={10}
                        max={80}
                        className="w-full accent-yellow-500"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>10% (weinig thuis)</span>
                        <span>80% (thuiswerker + batterij)</span>
                      </div>
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
                        <div className="text-sm text-gray-500">Thuis laden met slim laden simulatie</div>
                      </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full transition-all ${hasEV ? 'bg-green-500' : 'bg-gray-300'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform mt-0.5 ${hasEV ? 'translate-x-6 ml-0.5' : 'translate-x-0.5'}`} />
                    </div>
                  </div>
                </div>

                {hasEV && (
                  <div className="mt-4 p-4 bg-green-50 rounded-xl space-y-4 border border-green-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Thuisladen per jaar (kWh)
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
                      <p className="text-xs text-gray-500 mt-1">15.000 km ≈ 3.000 kWh (5 kWh/km)</p>
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
                          <div className="font-medium text-gray-900">Slim Laden</div>
                          <div className="text-xs text-gray-500">Automatisch laden in goedkoopste uren</div>
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
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
                <div className="text-sm font-medium opacity-80 mb-1">Totale Jaarkosten</div>
                <div className="text-4xl font-bold">€{result.totalCost.toFixed(0)}</div>
                <div className="text-sm opacity-80 mt-2">Dynamisch contract</div>
              </div>
              
              {hasSolar && result.savingsVsNoNetMetering !== undefined ? (
                <div className={`rounded-2xl p-6 shadow-xl ${result.savingsVsNoNetMetering > 0 ? 'bg-green-50 border-2 border-green-200' : 'bg-orange-50 border-2 border-orange-200'}`}>
                  <div className={`text-sm font-medium mb-1 ${result.savingsVsNoNetMetering > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                    vs Vast (na 2027)
                  </div>
                  <div className={`text-4xl font-bold ${result.savingsVsNoNetMetering > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                    €{Math.abs(result.savingsVsNoNetMetering).toFixed(0)}
                  </div>
                  <div className={`text-sm mt-2 ${result.savingsVsNoNetMetering > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                    {result.savingsVsNoNetMetering > 0 ? 'besparing' : 'duurder'}
                  </div>
                </div>
              ) : (
                <div className={`rounded-2xl p-6 shadow-xl ${result.savings > 0 ? 'bg-green-50 border-2 border-green-200' : 'bg-orange-50 border-2 border-orange-200'}`}>
                  <div className={`text-sm font-medium mb-1 ${result.savings > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                    {result.savings > 0 ? 'Besparing t.o.v. vast' : 'Meerkosten t.o.v. vast'}
                  </div>
                  <div className={`text-4xl font-bold ${result.savings > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                    €{Math.abs(result.savings).toFixed(0)}
                  </div>
                  <div className={`text-sm mt-2 ${result.savings > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                    {result.savingsPercentage.toFixed(1)}% {result.savings > 0 ? 'goedkoper' : 'duurder'}
                  </div>
                </div>
              )}
              
              <div className="bg-blue-50 rounded-2xl p-6 shadow-lg border-2 border-blue-200">
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                  <Snowflake className="w-4 h-4" />
                  <span className="text-sm font-medium">Winterkosten</span>
                </div>
                <div className="text-3xl font-bold text-blue-700">€{result.winterCost.toFixed(0)}</div>
                <div className="text-sm text-blue-600 mt-1">Dec, Jan, Feb</div>
              </div>
              
              <div className="bg-amber-50 rounded-2xl p-6 shadow-lg border-2 border-amber-200">
                <div className="flex items-center gap-2 text-amber-600 mb-1">
                  <Sun className="w-4 h-4" />
                  <span className="text-sm font-medium">Zomerkosten</span>
                </div>
                <div className="text-3xl font-bold text-amber-700">€{result.summerCost.toFixed(0)}</div>
                <div className="text-sm text-amber-600 mt-1">Jun, Jul, Aug</div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-purple-600" />
                Jouw Verbruiksprofiel
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="text-sm text-gray-500 mb-1">Basisverbruik (E1A profiel)</div>
                  <div className="text-2xl font-bold text-gray-800">{result.profileMix.baseKwh.toFixed(0)} kWh</div>
                  <div className="text-sm text-gray-500">Verlichting, witgoed, koken</div>
                </div>
                <div className="p-4 bg-orange-50 rounded-xl">
                  <div className="text-sm text-orange-600 mb-1">Verwarmingsverbruik (G1A profiel)</div>
                  <div className="text-2xl font-bold text-orange-700">{result.profileMix.heatingKwh.toFixed(0)} kWh</div>
                  <div className="text-sm text-orange-600">Warmtepomp, volgt buitentemp</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl">
                  <div className="text-sm text-purple-600 mb-1">Methode</div>
                  <div className="text-xl font-bold text-purple-700">
                    {result.profileMix.method === 'nibud' ? 'NIBUD (huishoudgrootte)' : 'Bouwjaar (isolatie)'}
                  </div>
                  <div className="text-sm text-purple-600">Basis voor profielverdeling</div>
                </div>
              </div>
            </div>

            {/* Zonnepanelen Results */}
            {result.solarSavings !== undefined && (
              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl shadow-lg p-6 border border-yellow-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Sun className="w-5 h-5 text-yellow-600" />
                  Zonnepanelen Impact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-white/70 rounded-xl">
                    <div className="text-sm text-gray-500 mb-1">Eigenverbruik</div>
                    <div className="text-2xl font-bold text-yellow-700">{result.solarSelfConsumption?.toFixed(0)} kWh</div>
                    <div className="text-sm text-gray-500">Direct verbruikt</div>
                  </div>
                  <div className="p-4 bg-white/70 rounded-xl">
                    <div className="text-sm text-gray-500 mb-1">Teruglevering</div>
                    <div className="text-2xl font-bold text-amber-600">{result.solarFeedIn?.toFixed(0)} kWh</div>
                    <div className="text-sm text-gray-500">Naar het net</div>
                  </div>
                  <div className="p-4 bg-white/70 rounded-xl">
                    <div className="text-sm text-green-600 mb-1">Bespaard (eigen)</div>
                    <div className="text-2xl font-bold text-green-600">€{result.solarSavings?.toFixed(0)}</div>
                    <div className="text-sm text-green-600">Niet gekocht</div>
                  </div>
                  <div className="p-4 bg-white/70 rounded-xl">
                    <div className="text-sm text-blue-600 mb-1">Terugleveropbrengst</div>
                    <div className="text-2xl font-bold text-blue-600">€{result.feedInRevenue?.toFixed(0)}</div>
                    <div className="text-sm text-blue-600">Excl. saldering</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-4 p-3 bg-yellow-100 rounded-lg">
                  <strong>💡 Let op:</strong> Na 2027 vervalt saldering. Met dynamisch contract ontvang je de spotprijs minus marge voor teruglevering. Dit kan bij negatieve prijzen nadelig uitpakken!
                </p>
              </div>
            )}

            {/* EV Results */}
            {result.evCost !== undefined && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-6 border border-green-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Car className="w-5 h-5 text-green-600" />
                  Elektrische Auto Kosten
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-white/70 rounded-xl">
                    <div className="text-sm text-gray-500 mb-1">EV Laadkosten</div>
                    <div className="text-2xl font-bold text-gray-800">€{result.evCost?.toFixed(0)}</div>
                    <div className="text-sm text-gray-500">Per jaar thuis laden</div>
                  </div>
                  {(result.evSmartChargingSavings ?? 0) > 0 && (
                    <div className="p-4 bg-green-100 rounded-xl">
                      <div className="flex items-center gap-2 text-green-600 mb-1">
                        <BatteryCharging className="w-4 h-4" />
                        <span className="text-sm">Slim Laden Besparing</span>
                      </div>
                      <div className="text-2xl font-bold text-green-600">€{result.evSmartChargingSavings?.toFixed(0)}</div>
                      <div className="text-sm text-green-600">Door laden in goedkoopste uren</div>
                    </div>
                  )}
                  <div className="p-4 bg-white/70 rounded-xl">
                    <div className="text-sm text-gray-500 mb-1">Kosten per kWh</div>
                    <div className="text-2xl font-bold text-gray-800">€{evKwhPerYear > 0 ? ((result.evCost ?? 0) / evKwhPerYear).toFixed(2) : '0.00'}</div>
                    <div className="text-sm text-gray-500">Gemiddeld met slim laden</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-4 p-3 bg-green-100 rounded-lg">
                  <strong>⚡ Slim laden tip:</strong> Door te laden in de 6 goedkoopste uren per dag (meestal &apos;s nachts) bespaar je met dynamisch tot 30% op laadkosten!
                </p>
              </div>
            )}

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
                    <Legend />
                    <Bar dataKey="baseCost" stackId="a" fill="#8B5CF6" name="Basisverbruik" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="heatingCost" stackId="a" fill="#F97316" name="Verwarming" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Price Analysis */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Prijsanalyse per Maand</h3>
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
                    <Tooltip 
                      formatter={(value) => [`€${Number(value).toFixed(3)}/kWh`, 'Gem. spotprijs']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="averagePrice" 
                      stroke="#8B5CF6" 
                      strokeWidth={2}
                      fill="url(#priceGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="p-4 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-2 text-green-600 mb-1">
                    <TrendingDown className="w-4 h-4" />
                    <span className="text-sm font-medium">Goedkoopste Maand</span>
                  </div>
                  <div className="text-xl font-bold text-green-700">{result.cheapestMonth.name}</div>
                  <div className="text-sm text-green-600">€{result.cheapestMonth.avgPrice.toFixed(3)}/kWh</div>
                </div>
                <div className="p-4 bg-orange-50 rounded-xl">
                  <div className="flex items-center gap-2 text-orange-600 mb-1">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-medium">Duurste Maand</span>
                  </div>
                  <div className="text-xl font-bold text-orange-700">{result.expensiveMonth.name}</div>
                  <div className="text-sm text-orange-600">€{result.expensiveMonth.avgPrice.toFixed(3)}/kWh</div>
                </div>
              </div>
            </div>

            {/* Comparison Table */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Vergelijking: Dynamisch vs. Vast Contract</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Contract</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Jaarkosten</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Per maand</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">vs Dynamisch</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100 bg-purple-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Zap className="w-5 h-5 text-purple-600" />
                          <span className="font-medium">Dynamisch contract</span>
                        </div>
                      </td>
                      <td className="text-right py-4 px-4 font-bold text-purple-600">
                        €{result.totalCost.toFixed(0)}
                      </td>
                      <td className="text-right py-4 px-4 text-gray-600">
                        €{(result.totalCost / 12).toFixed(0)}
                      </td>
                      <td className="text-right py-4 px-4 text-gray-400">—</td>
                    </tr>
                    {hasSolar && result.fixedContractCostNoNetMetering !== undefined && (
                      <>
                        <tr className="border-b border-gray-100">
                          <td className="py-4 px-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <Calculator className="w-5 h-5 text-green-600" />
                                <span className="font-medium">Vast + Saldering</span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">Tot 2027, netto verrekening</div>
                            </div>
                          </td>
                          <td className="text-right py-4 px-4 font-bold text-green-600">
                            €{result.fixedContractCost.toFixed(0)}
                          </td>
                          <td className="text-right py-4 px-4 text-gray-600">
                            €{(result.fixedContractCost / 12).toFixed(0)}
                          </td>
                          <td className="text-right py-4 px-4">
                            <span className={result.savings < 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                              {result.savings > 0 ? '+' : ''}€{result.savings.toFixed(0)}
                            </span>
                          </td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-4 px-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <Calculator className="w-5 h-5 text-orange-600" />
                                <span className="font-medium">Vast zonder Saldering</span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">Na 2027, ~€0,07/kWh terugleververgoeding</div>
                            </div>
                          </td>
                          <td className="text-right py-4 px-4 font-bold text-orange-600">
                            €{result.fixedContractCostNoNetMetering.toFixed(0)}
                          </td>
                          <td className="text-right py-4 px-4 text-gray-600">
                            €{(result.fixedContractCostNoNetMetering / 12).toFixed(0)}
                          </td>
                          <td className="text-right py-4 px-4">
                            <span className={result.savingsVsNoNetMetering && result.savingsVsNoNetMetering < 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                              {result.savingsVsNoNetMetering && result.savingsVsNoNetMetering > 0 ? '+' : ''}€{result.savingsVsNoNetMetering?.toFixed(0) ?? 0}
                            </span>
                          </td>
                        </tr>
                      </>
                    )}
                    {!hasSolar && (
                      <tr>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Calculator className="w-5 h-5 text-gray-400" />
                            <span className="font-medium">Vast contract (€0,28/kWh)</span>
                          </div>
                        </td>
                        <td className="text-right py-4 px-4 font-bold text-gray-600">
                          €{result.fixedContractCost.toFixed(0)}
                        </td>
                        <td className="text-right py-4 px-4 text-gray-600">
                          €{(result.fixedContractCost / 12).toFixed(0)}
                        </td>
                        <td className="text-right py-4 px-4">
                          <span className={result.savings < 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                            {result.savings > 0 ? '+' : ''}€{result.savings.toFixed(0)}
                          </span>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {hasSolar && result.savingsVsNoNetMetering !== undefined && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-sm text-amber-800">
                    <strong>⚠️ Let op:</strong> Na 2027 vervalt saldering. Met een vast contract krijg je dan typisch maar €0,05-0,09/kWh terug voor teruggeleverde stroom. 
                    {result.savingsVsNoNetMetering > 0 
                      ? ` Met dynamisch bespaar je dan €${result.savingsVsNoNetMetering.toFixed(0)} per jaar.`
                      : ` Dynamisch is dan ongeveer gelijk of €${Math.abs(result.savingsVsNoNetMetering).toFixed(0)} duurder.`
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
              <div className="flex items-start gap-4">
                <Info className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Over deze berekening</h3>
                  <div className="space-y-2 text-gray-600">
                    <p>
                      Deze berekening gebruikt <strong>historische uurprijzen</strong> van het afgelopen jaar 
                      gecombineerd met officiële NEDU-verbruiksprofielen.
                    </p>
                    <p>
                      Het "Frankenstein" profiel combineert het E1A-profiel (basisverbruik) met het G1A-profiel 
                      (verwarming) om all-electric woningen realistisch te simuleren.
                    </p>
                    <p>
                      <strong>Let op:</strong> Toekomstige prijzen kunnen afwijken. Dynamische contracten 
                      bieden kansen, maar ook risico&apos;s bij extreme prijspieken.
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
              Hoe werkt deze tool?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Echte Uurprijzen</h3>
                <p className="text-gray-600 text-sm">
                  We gebruiken historische EPEX spotprijzen per uur, geen gemiddelden.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Thermometer className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">NEDU Profielen</h3>
                <p className="text-gray-600 text-sm">
                  Officiële verbruiksprofielen die rekening houden met seizoenen en dagritme.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Home className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Warmtepomp Slim</h3>
                <p className="text-gray-600 text-sm">
                  Speciaal "hybride profiel" voor all-electric woningen met warmtepomp.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

