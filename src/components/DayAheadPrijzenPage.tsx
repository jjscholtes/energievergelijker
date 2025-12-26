'use client';

import { useEffect, useState, Suspense } from 'react';
import { Header } from '@/components/home/Header';
import { Footer } from '@/components/home/Footer';
import { 
  TrendingDown, 
  TrendingUp, 
  Activity, 
  Clock, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sun,
  Moon,
  Zap,
  Info
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
  BarChart,
  Bar,
} from 'recharts';

interface DayAheadPrice {
  timestamp: string;
  price: number;
}

interface DayAheadData {
  prices: DayAheadPrice[];
  average: number;
  min: number;
  max: number;
  date: string;
  lastUpdated: string;
}

interface HistoricalDayData {
  date: string;
  average: number;
  min: number;
  max: number;
  prices: DayAheadPrice[];
}

interface HistoricalData {
  data: HistoricalDayData[];
  fromDate: string;
  tillDate: string;
  lastUpdated: string;
}

type ViewMode = 'today' | 'week' | 'month' | 'year';

export function DayAheadPrijzenPage() {
  const [todayData, setTodayData] = useState<DayAheadData | null>(null);
  const [tomorrowData, setTomorrowData] = useState<DayAheadData | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('today');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const energyTax = 0.1316; // Energiebelasting inclusief BTW

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch today's prices
        const todayRes = await fetch('/api/dayahead');
        if (todayRes.ok) {
          setTodayData(await todayRes.json());
        }

        // Try to fetch tomorrow's prices (available after 13:00)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        const tomorrowRes = await fetch(`/api/dayahead?date=${tomorrowStr}`);
        if (tomorrowRes.ok) {
          const tomorrowResult = await tomorrowRes.json();
          if (tomorrowResult.prices?.length > 0) {
            setTomorrowData(tomorrowResult);
          }
        }

        // Fetch historical data based on view mode
        await fetchHistorical(viewMode);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  async function fetchHistorical(mode: ViewMode) {
    const till = new Date();
    let from = new Date();

    switch (mode) {
      case 'week':
        from.setDate(from.getDate() - 7);
        break;
      case 'month':
        from.setMonth(from.getMonth() - 1);
        break;
      case 'year':
        from.setFullYear(from.getFullYear() - 1);
        break;
      default:
        return;
    }

    try {
      const res = await fetch(
        `/api/dayahead/history?from=${from.toISOString().split('T')[0]}&till=${till.toISOString().split('T')[0]}`
      );
      if (res.ok) {
        setHistoricalData(await res.json());
      }
    } catch (err) {
      console.error('Error fetching historical data:', err);
    }
  }

  const handleViewModeChange = async (mode: ViewMode) => {
    setViewMode(mode);
    if (mode !== 'today') {
      await fetchHistorical(mode);
    }
  };

  // Format price for chart tooltip
  const formatPrice = (price: number) => `€${price.toFixed(3)}/kWh`;

  // Get chart data for current day
  const getHourlyChartData = (data: DayAheadData | null) => {
    if (!data?.prices) return [];
    return data.prices.map((p, idx) => ({
      hour: new Date(p.timestamp).getHours(),
      label: `${new Date(p.timestamp).getHours()}:00`,
      price: p.price,
      priceInclBtw: p.price + energyTax,
      isNegative: p.price < 0,
    }));
  };

  // Get chart data for historical view
  const getHistoricalChartData = () => {
    if (!historicalData?.data) return [];
    return historicalData.data.map(d => ({
      date: d.date,
      label: new Date(d.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' }),
      average: d.average,
      min: d.min,
      max: d.max,
    }));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Vandaag';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Morgen';
    }
    
    return date.toLocaleDateString('nl-NL', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
  };

  const currentData = viewMode === 'today' ? todayData : null;
  const hourlyChartData = getHourlyChartData(todayData);
  const tomorrowChartData = getHourlyChartData(tomorrowData);
  const historicalChartData = getHistoricalChartData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-full text-sm font-bold mb-6 shadow-lg">
            <Zap className="w-4 h-4" />
            <span>Day-Ahead Stroomprijzen</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs animate-pulse">LIVE</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Actuele Stroomprijzen per Uur
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Bekijk de EPEX spotmarkt prijzen voor vandaag en morgen. 
            Ontdek wanneer stroom het goedkoopst is en bespaar met slim laden.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            <span className="ml-4 text-lg text-gray-600">Prijzen laden...</span>
          </div>
        ) : (
          <>
            {/* View Mode Tabs */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex bg-white rounded-xl shadow-lg p-1 border border-gray-200">
                {[
                  { id: 'today' as ViewMode, label: 'Vandaag', icon: Sun },
                  { id: 'week' as ViewMode, label: 'Week', icon: Calendar },
                  { id: 'month' as ViewMode, label: 'Maand', icon: Calendar },
                  { id: 'year' as ViewMode, label: 'Jaar', icon: Calendar },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => handleViewModeChange(id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      viewMode === id
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Today's Stats */}
            {viewMode === 'today' && !todayData && !loading && (
              <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                <p className="text-gray-600">Geen prijzen beschikbaar. Probeer het later opnieuw.</p>
              </div>
            )}
            {todayData && viewMode === 'today' && hourlyChartData.length > 0 && todayData.average !== null && (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  {/* Current Price */}
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5" />
                      <span className="font-medium">Nu ({new Date().getHours()}:00)</span>
                    </div>
                    <div className="text-4xl font-bold mb-1">
                      €{(hourlyChartData.find(h => h.hour === new Date().getHours())?.price ?? 0).toFixed(3)}
                    </div>
                    <p className="text-blue-100 text-sm">per kWh excl. belasting</p>
                  </div>

                  {/* Average */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center gap-2 mb-2 text-gray-600">
                      <Activity className="w-5 h-5" />
                      <span className="font-medium">Gemiddeld</span>
                    </div>
                    <div className="text-4xl font-bold text-gray-800 mb-1">
                      €{(todayData.average ?? 0).toFixed(3)}
                    </div>
                    <p className="text-gray-500 text-sm">per kWh excl. belasting</p>
                  </div>

                  {/* Lowest */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 shadow-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2 text-green-700">
                      <TrendingDown className="w-5 h-5" />
                      <span className="font-medium">Laagste</span>
                    </div>
                    <div className="text-4xl font-bold text-green-600 mb-1">
                      €{(todayData.min ?? 0).toFixed(3)}
                    </div>
                    <p className="text-green-600 text-sm">
                      om {hourlyChartData.find(h => h.price === todayData.min)?.hour ?? 0}:00 uur
                    </p>
                  </div>

                  {/* Highest */}
                  <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-2xl p-6 shadow-lg border border-orange-200">
                    <div className="flex items-center gap-2 mb-2 text-orange-700">
                      <TrendingUp className="w-5 h-5" />
                      <span className="font-medium">Hoogste</span>
                    </div>
                    <div className="text-4xl font-bold text-orange-600 mb-1">
                      €{(todayData.max ?? 0).toFixed(3)}
                    </div>
                    <p className="text-orange-600 text-sm">
                      om {hourlyChartData.find(h => h.price === todayData.max)?.hour ?? 0}:00 uur
                    </p>
                  </div>
                </div>

                {/* Hourly Chart - Today */}
                <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 mb-8 border border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                    <Sun className="w-6 h-6 text-yellow-500" />
                    Prijzen Vandaag - {formatDate(todayData.date)}
                  </h2>
                  <p className="text-gray-500 mb-6">
                    Laatste update: {new Date(todayData.lastUpdated).toLocaleTimeString('nl-NL')}
                  </p>
                  
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={hourlyChartData}>
                        <defs>
                          <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis 
                          dataKey="label" 
                          tick={{ fill: '#6B7280', fontSize: 12 }}
                          tickLine={{ stroke: '#D1D5DB' }}
                        />
                        <YAxis 
                          tickFormatter={(v) => `€${v.toFixed(2)}`}
                          tick={{ fill: '#6B7280', fontSize: 12 }}
                          tickLine={{ stroke: '#D1D5DB' }}
                        />
                        <Tooltip 
                          formatter={(value) => [formatPrice(Number(value)), 'Prijs']}
                          labelFormatter={(label) => `Uur: ${label}`}
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                          }}
                        />
                        <ReferenceLine y={todayData.average} stroke="#10B981" strokeDasharray="5 5" label="Gemiddeld" />
                        <ReferenceLine y={0} stroke="#EF4444" strokeWidth={2} />
                        <Area 
                          type="monotone" 
                          dataKey="price" 
                          stroke="#3B82F6" 
                          strokeWidth={3}
                          fill="url(#priceGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Tomorrow's Prices (if available) */}
                {tomorrowData && tomorrowData.prices.length > 0 && tomorrowData.average !== null && (
                  <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 mb-8 border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                      <Moon className="w-6 h-6 text-indigo-500" />
                      Prijzen Morgen - {formatDate(tomorrowData.date)}
                    </h2>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-3 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-500">Gemiddeld</p>
                        <p className="text-xl font-bold text-gray-800">€{(tomorrowData.average ?? 0).toFixed(3)}</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-xl">
                        <p className="text-sm text-green-600">Laagste</p>
                        <p className="text-xl font-bold text-green-600">€{(tomorrowData.min ?? 0).toFixed(3)}</p>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-xl">
                        <p className="text-sm text-orange-600">Hoogste</p>
                        <p className="text-xl font-bold text-orange-600">€{(tomorrowData.max ?? 0).toFixed(3)}</p>
                      </div>
                    </div>
                    
                    <div className="h-60">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={tomorrowChartData}>
                          <defs>
                            <linearGradient id="tomorrowGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis dataKey="label" tick={{ fill: '#6B7280', fontSize: 11 }} />
                          <YAxis tickFormatter={(v) => `€${v.toFixed(2)}`} tick={{ fill: '#6B7280', fontSize: 11 }} />
                          <Tooltip 
                            formatter={(value) => [formatPrice(Number(value)), 'Prijs']}
                            labelFormatter={(label) => `Uur: ${label}`}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="price" 
                            stroke="#6366F1" 
                            strokeWidth={2}
                            fill="url(#tomorrowGradient)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Hourly Price Table */}
                <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 mb-8 border border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Alle Uurprijzen Vandaag
                  </h2>
                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                    {hourlyChartData.map((item) => {
                      const isCurrentHour = item.hour === new Date().getHours();
                      const isLowest = item.price === todayData.min;
                      const isHighest = item.price === todayData.max;
                      
                      return (
                        <div 
                          key={item.hour}
                          className={`p-3 rounded-xl text-center transition-all ${
                            isCurrentHour 
                              ? 'bg-blue-500 text-white shadow-lg ring-2 ring-blue-300' 
                              : isLowest 
                                ? 'bg-green-100 text-green-800 border border-green-300'
                                : isHighest
                                  ? 'bg-orange-100 text-orange-800 border border-orange-300'
                                  : 'bg-gray-50 text-gray-700 border border-gray-200'
                          }`}
                        >
                          <div className="text-xs font-medium opacity-80">{item.label}</div>
                          <div className="text-lg font-bold">€{(item.price ?? 0).toFixed(3)}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Historical View */}
            {viewMode !== 'today' && historicalData && (
              <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 mb-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Historische Prijzen - {viewMode === 'week' ? 'Afgelopen Week' : viewMode === 'month' ? 'Afgelopen Maand' : 'Afgelopen Jaar'}
                </h2>
                <p className="text-gray-500 mb-6">
                  {historicalData.fromDate} tot {historicalData.tillDate}
                </p>
                
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historicalChartData}>
                      <defs>
                        <linearGradient id="histAvgGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="label" 
                        tick={{ fill: '#6B7280', fontSize: 11 }}
                        interval={viewMode === 'year' ? 30 : viewMode === 'month' ? 3 : 0}
                      />
                        <YAxis 
                          tickFormatter={(v) => `€${(v ?? 0).toFixed(2)}`}
                          tick={{ fill: '#6B7280', fontSize: 12 }}
                        />
                      <Tooltip 
                        formatter={(value, name) => [
                          formatPrice(Number(value)), 
                          name === 'average' ? 'Gemiddeld' : name === 'min' ? 'Laagste' : 'Hoogste'
                        ]}
                        labelFormatter={(label) => `Datum: ${label}`}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="max" 
                        stroke="#F59E0B" 
                        strokeWidth={1}
                        fill="#FEF3C7"
                        fillOpacity={0.5}
                        name="max"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="average" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        fill="url(#histAvgGradient)"
                        name="average"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="min" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        dot={false}
                        name="min"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Summary Stats */}
                {historicalChartData.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <div className="p-6 bg-gray-50 rounded-xl text-center">
                      <p className="text-sm text-gray-500 mb-1">Gemiddelde Prijs</p>
                      <p className="text-3xl font-bold text-gray-800">
                        €{(historicalChartData.reduce((sum, d) => sum + d.average, 0) / historicalChartData.length).toFixed(3)}
                      </p>
                      <p className="text-sm text-gray-500">per kWh</p>
                    </div>
                    <div className="p-6 bg-green-50 rounded-xl text-center">
                      <p className="text-sm text-green-600 mb-1">Laagste Prijs</p>
                      <p className="text-3xl font-bold text-green-600">
                        €{Math.min(...historicalChartData.map(d => d.min)).toFixed(3)}
                      </p>
                      <p className="text-sm text-green-600">per kWh</p>
                    </div>
                    <div className="p-6 bg-orange-50 rounded-xl text-center">
                      <p className="text-sm text-orange-600 mb-1">Hoogste Prijs</p>
                      <p className="text-3xl font-bold text-orange-600">
                        €{Math.max(...historicalChartData.map(d => d.max)).toFixed(3)}
                      </p>
                      <p className="text-sm text-orange-600">per kWh</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-4">Wat kosten dynamische prijzen voor jouw situatie?</h3>
              <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
                Bereken je echte jaarkosten met onze Dynamische Energie Inzicht Tool. 
                Speciaal ontwikkeld voor warmtepompen en all-electric woningen.
              </p>
              <a 
                href="/tool/dynamisch-inzicht"
                className="inline-flex items-center gap-2 bg-white text-purple-600 px-8 py-4 rounded-xl font-bold hover:bg-purple-50 transition-all shadow-lg"
              >
                Bereken Jouw Kosten
                <Zap className="w-5 h-5" />
              </a>
            </div>

            {/* Info Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 lg:p-8 border border-blue-200">
              <div className="flex items-start gap-4">
                <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Over Day-Ahead Prijzen</h3>
                  <div className="space-y-3 text-gray-600">
                    <p>
                      <strong>Day-ahead prijzen</strong> worden elke dag rond 13:00 uur bekend gemaakt voor de volgende dag. 
                      Deze prijzen worden bepaald op de EPEX SPOT markt in Amsterdam.
                    </p>
                    <p>
                      De getoonde prijzen zijn <strong>exclusief energiebelasting</strong> (€0,1316/kWh incl. BTW) 
                      en <strong>inclusief BTW</strong>. Dynamische energieleveranciers rekenen vaak een kleine opslag 
                      bovenop deze spotprijs.
                    </p>
                    <p>
                      <strong>💡 Tip:</strong> Plan je grote verbruikers (wasmachine, droger, EV laden) 
                      in de uren met de laagste prijzen om maximaal te besparen!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

