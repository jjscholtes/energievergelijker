'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Clock, Sun, Moon, Zap, BarChart3, Info, ArrowLeft, Calendar, DollarSign, FileText, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getMonthlyData, getHourlyDataForMonth, getDailyDataForMonth, MonthlyStats } from '@/lib/data/monthlyPriceData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export function DynamicPricingPage() {
  const [selectedYear, setSelectedYear] = useState(2024);
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [monthlyData, setMonthlyData] = useState<{ [month: number]: MonthlyStats }>({});
  const [weightedAverage, setWeightedAverage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Jaarlijkse gemiddelde prijzen data
  const yearlyAverages = [
    { jaar: 2022, gemiddelde_prijs: 0.2409 },
    { jaar: 2023, gemiddelde_prijs: 0.0961 },
    { jaar: 2024, gemiddelde_prijs: 0.0771 },
    { jaar: 2025, gemiddelde_prijs: 0.0868 }
  ];

  const years = [
    { value: 2024, label: '2024' },
    { value: 2025, label: '2025' }
  ];

  const months = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maart' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Augustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  useEffect(() => {
    setLoading(true);
    
    try {
      const data = getMonthlyData(selectedYear);
      setMonthlyData(data);
      
      // Set first available month as default
      const availableMonths = Object.keys(data).map(Number).sort((a, b) => a - b);
      if (availableMonths.length > 0 && !data[selectedMonth]) {
        setSelectedMonth(availableMonths[0]);
      }
      
      // Calculate weighted average for all available months
      const weightedAvg = calculateWeightedAverage(data, availableMonths);
      setWeightedAverage(weightedAvg);
    } catch (error) {
      console.error('Error loading monthly data:', error);
    }
    
    setLoading(false);
  }, [selectedYear]);

  const currentMonthData = monthlyData[selectedMonth];
  const hourlyData = currentMonthData ? getHourlyDataForMonth(selectedYear, selectedMonth) : [];
  const dailyData = currentMonthData ? getDailyDataForMonth(selectedYear, selectedMonth) : [];

  const getPriceColor = (price: number, min: number, max: number) => {
    const range = max - min;
    const position = (price - min) / range;
    
    // Special handling for negative prices
    if (price < 0) return 'text-green-700 bg-green-100 border-green-300 font-bold';
    if (position < 0.2) return 'text-green-600 bg-green-50 border-green-200';
    if (position < 0.4) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (position < 0.6) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (position < 0.8) return 'text-red-500 bg-red-50 border-red-200';
    return 'text-red-700 bg-red-100 border-red-300';
  };

  const getTimeLabel = (hour: number) => {
    if (hour === 0) return 'Middernacht';
    if (hour < 6) return 'Nacht';
    if (hour < 12) return 'Ochtend';
    if (hour < 18) return 'Middag';
    return 'Avond';
  };

  const getTimeIcon = (hour: number) => {
    if (hour >= 6 && hour < 18) return <Sun className="w-4 h-4" />;
    return <Moon className="w-4 h-4" />;
  };

  // Calculate weighted average for available months
  const calculateWeightedAverage = (data: { [month: number]: MonthlyStats }, months: number[]) => {
    let totalWeightedSum = 0;
    let totalDataPoints = 0;
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    const seasonalBreakdown: { season: string; average: number; months: number[] }[] = [];
    
    // Group months by season
    const seasons = {
      winter: { months: [12, 1, 2], name: 'Winter' },
      spring: { months: [3, 4, 5], name: 'Lente' },
      summer: { months: [6, 7, 8], name: 'Zomer' },
      autumn: { months: [9, 10, 11], name: 'Herfst' }
    };
    
    Object.keys(seasons).forEach(seasonKey => {
      const season = seasons[seasonKey as keyof typeof seasons];
      const seasonMonths = months.filter(month => season.months.includes(month));
      
      if (seasonMonths.length > 0) {
        let seasonSum = 0;
        let seasonDataPoints = 0;
        let seasonMin = Infinity;
        let seasonMax = -Infinity;
        
        seasonMonths.forEach(month => {
          const monthStats = data[month];
          if (monthStats) {
            // Weight by number of data points (more data = more reliable)
            const weight = monthStats.dataPoints;
            seasonSum += monthStats.average * weight;
            seasonDataPoints += weight;
            seasonMin = Math.min(seasonMin, monthStats.minimum);
            seasonMax = Math.max(seasonMax, monthStats.maximum);
          }
        });
        
        if (seasonDataPoints > 0) {
          const seasonAverage = seasonSum / seasonDataPoints;
          seasonalBreakdown.push({
            season: season.name,
            average: Math.round(seasonAverage * 1000) / 1000,
            months: seasonMonths
          });
          
          totalWeightedSum += seasonSum;
          totalDataPoints += seasonDataPoints;
          minPrice = Math.min(minPrice, seasonMin);
          maxPrice = Math.max(maxPrice, seasonMax);
        }
      }
    });
    
    const weightedAverage = totalDataPoints > 0 ? totalWeightedSum / totalDataPoints : 0;
    const monthNames = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 
                       'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
    const period = months.map(m => monthNames[m - 1]).join(', ');
    
    return {
      weightedAverage: Math.round(weightedAverage * 1000) / 1000,
      totalDataPoints,
      period,
      minPrice: minPrice === Infinity ? 0 : Math.round(minPrice * 1000) / 1000,
      maxPrice: maxPrice === -Infinity ? 0 : Math.round(maxPrice * 1000) / 1000,
      seasonalBreakdown
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Prijzen analyseren...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Terug naar Home</span>
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">⚡</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Dynamische Prijzen</h1>
                <p className="text-gray-600 text-sm">Echte marktdata {selectedYear}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-full text-sm font-bold mb-6 shadow-lg">
            <BarChart3 className="w-5 h-5" />
            <span>Dynamische Energieprijzen</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Echte Marktdata {selectedYear}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Analyseer de werkelijke dynamische energieprijzen per maand. Bekijk gemiddelde, hoogste en laagste prijzen per maand en per dag van de week.
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Jaar
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                {years.map(year => (
                  <option key={year.value} value={year.value}>
                    {year.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Maand
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                {months.map(month => {
                  const hasData = monthlyData[month.value];
                  return (
                    <option key={month.value} value={month.value} disabled={!hasData}>
                      {month.label} {hasData ? '' : '(Geen data)'}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {/* Weighted Average Section */}
        {weightedAverage && (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl shadow-lg p-8 mb-8 text-white">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm font-bold mb-4 shadow-lg">
                <DollarSign className="w-5 h-5" />
                <span>Gewogen Gemiddelde</span>
              </div>
              <h2 className="text-3xl font-bold mb-4">
                Gemiddelde Prijs {selectedYear}
              </h2>
              <p className="text-emerald-100 text-lg">
                Gebaseerd op {weightedAverage.totalDataPoints.toLocaleString()} datapunten
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold mb-2">Gemiddelde Prijs</h3>
                <p className="text-4xl font-bold mb-2">
                  €{weightedAverage.weightedAverage.toFixed(3)}/kWh
                </p>
                <p className="text-sm text-emerald-100">
                  Exclusief energiebelasting
                </p>
                <p className="text-sm text-emerald-200 mt-1">
                  Totaal: €{(weightedAverage.weightedAverage + 0.1316).toFixed(3)}/kWh
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold mb-2">Laagste Prijs</h3>
                <p className="text-4xl font-bold mb-2">
                  €{weightedAverage.minPrice.toFixed(3)}/kWh
                </p>
                <p className="text-sm text-emerald-100">
                  Exclusief energiebelasting
                </p>
                <p className="text-sm text-emerald-200 mt-1">
                  Totaal: €{(weightedAverage.minPrice + 0.1316).toFixed(3)}/kWh
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold mb-2">Hoogste Prijs</h3>
                <p className="text-4xl font-bold mb-2">
                  €{weightedAverage.maxPrice.toFixed(3)}/kWh
                </p>
                <p className="text-sm text-emerald-100">
                  Exclusief energiebelasting
                </p>
                <p className="text-sm text-emerald-200 mt-1">
                  Totaal: €{(weightedAverage.maxPrice + 0.1316).toFixed(3)}/kWh
                </p>
              </div>
            </div>

            {/* Seasonal Breakdown */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 text-center">Seizoenspatronen</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {weightedAverage.seasonalBreakdown.map((season: { season: string; average: number; months: number[] }, index: number) => (
                  <div key={index} className="bg-white/5 rounded-lg p-4 text-center">
                    <h4 className="font-semibold text-lg mb-2">{season.season}</h4>
                    <p className="text-2xl font-bold mb-1">
                      €{season.average.toFixed(3)}/kWh
                    </p>
                    <p className="text-sm text-emerald-200">
                      {season.months.length} maand{season.months.length !== 1 ? 'en' : ''}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Explanation */}
            <div className="mt-6 bg-white/5 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Wat betekent dit voor jou?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">💡 Planning</h4>
                  <ul className="space-y-1 text-emerald-100">
                    <li>• Gemiddelde prijs: €{weightedAverage.weightedAverage.toFixed(3)}/kWh</li>
                    <li>• Plan grootverbruikers buiten piekuren</li>
                    <li>• Zomer is meestal goedkoper dan winter</li>
                    <li>• Weekend prijzen zijn vaak lager</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">📊 Vergelijking</h4>
                  <ul className="space-y-1 text-emerald-100">
                    <li>• Vergelijk met vaste contracten</li>
                    <li>• Houd rekening met seizoensvariatie</li>
                    <li>• Overweeg hybride contracten</li>
                    <li>• Monitor prijzen via apps</li>
                  </ul>
                </div>
              </div>
              
              {/* Negative Prices Explanation */}
              <div className="mt-4 p-4 bg-green-500/20 rounded-lg border border-green-400/30">
                <h4 className="font-semibold text-green-200 mb-2">🟢 Negatieve Prijzen</h4>
                <p className="text-green-100 text-sm">
                  Soms zijn de spotmarkt prijzen negatief (je krijgt geld toe!). Dit gebeurt bij overschot aan duurzame energie. 
                  Perfect moment om je auto op te laden, de wasmachine te draaien of je huis te verwarmen!
                </p>
              </div>
            </div>
          </div>
        )}

        {currentMonthData ? (
          <>

            {/* Hourly Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Clock className="w-6 h-6 text-emerald-600" />
                Prijzen per Uur - {currentMonthData.monthName} {selectedYear}
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
                    <XAxis
                      dataKey="hour"
                      tickFormatter={(tick) => `${tick}:00`}
                      interval="preserveStartEnd"
                      minTickGap={20}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      axisLine={{ stroke: '#D1D5DB' }}
                      tickLine={{ stroke: '#D1D5DB' }}
                    />
                    <YAxis
                      tickFormatter={(tick) => `€${tick.toFixed(2)}`}
                      domain={['auto', 'auto']}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      axisLine={{ stroke: '#D1D5DB' }}
                      tickLine={{ stroke: '#D1D5DB' }}
                    />
                    <Tooltip
                      formatter={(value: number) => [
                        `€${value.toFixed(3)}/kWh`,
                        'Prijs (excl. belasting)'
                      ]}
                      labelFormatter={(label) => `Uur: ${label}:00`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price"
                      stroke="#10B981"
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6, fill: '#10B981', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Daily Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Calendar className="w-6 h-6 text-green-600" />
                Gemiddelde Prijzen per Dag van de Week
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
                    <XAxis
                      dataKey="dayName"
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      axisLine={{ stroke: '#D1D5DB' }}
                      tickLine={{ stroke: '#D1D5DB' }}
                    />
                    <YAxis
                      tickFormatter={(tick) => `€${tick.toFixed(2)}`}
                      domain={['auto', 'auto']}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      axisLine={{ stroke: '#D1D5DB' }}
                      tickLine={{ stroke: '#D1D5DB' }}
                    />
                    <Tooltip
                      formatter={(value: number) => [
                        `€${value.toFixed(3)}/kWh`,
                        'Gemiddelde prijs'
                      ]}
                      labelFormatter={(label) => `${label}`}
                    />
                    <Bar
                      dataKey="price"
                      fill="#10B981"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Hourly Grid */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Clock className="w-6 h-6 text-orange-600" />
                Gedetailleerd Overzicht per Uur
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                {hourlyData.map((item) => (
                  <div
                    key={item.hour}
                    className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${getPriceColor(item.price, currentMonthData.minimum, currentMonthData.maximum)}`}
                  >
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-2">
                        {getTimeIcon(item.hour)}
                        <span className="text-sm font-semibold">
                          {item.hour.toString().padStart(2, '0')}:00
                        </span>
                      </div>
                      <p className="text-lg font-bold">
                        €{item.price.toFixed(3)}
                      </p>
                      <p className="text-xs opacity-75">
                        {getTimeLabel(item.hour)}
                      </p>
                      <p className="text-xs mt-1 font-medium">
                        Totaal: €{(item.price + 0.1316).toFixed(3)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Info */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl shadow-lg p-8 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Info className="w-6 h-6 text-emerald-600" />
                Over deze Data
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">📊 Data Bron</h4>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Gebaseerd op echte spotmarkt data uit CSV bestanden</li>
                    <li>• {currentMonthData.dataPoints} datapunten geanalyseerd voor {currentMonthData.monthName}</li>
                    <li>• Prijzen zijn exclusief energiebelasting (€0.1316/kWh)</li>
                    <li>• Data komt van de Nederlandse energiemarkt</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">💡 Hoe te Gebruiken</h4>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Vergelijk verschillende maanden om seizoenspatronen te zien</li>
                    <li>• Gebruik de uurdata om je verbruik te plannen</li>
                    <li>• Weekend prijzen zijn vaak lager dan werkdagen</li>
                    <li>• Zomer maanden hebben meestal lagere prijzen</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 text-center">
            <div className="text-gray-500 mb-4">
              <Calendar className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Geen Data Beschikbaar</h3>
              <p>Er is geen data beschikbaar voor de geselecteerde maand in {selectedYear}.</p>
            </div>
          </div>
        )}

        {/* Diepgaande Analyses */}
        <div className="mt-12 space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white px-6 py-3 rounded-full text-sm font-bold mb-4 shadow-lg">
              <FileText className="w-5 h-5" />
              <span>Diepgaande Analyses</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Historische Trends & Patronen
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Ontdek de lange-termijn trends en seizoenspatronen in dynamische energieprijzen
            </p>
          </div>

          {/* Jaarlijkse Trends */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <TrendingDown className="w-6 h-6 text-emerald-600" />
              Jaarlijkse Gemiddelde Prijzen (2022-2025)
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Chart */}
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={yearlyAverages}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="jaar" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `${value}`}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `€${value.toFixed(3)}`}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`€${value.toFixed(3)}/kWh`, 'Gemiddelde Prijs']}
                      labelFormatter={(label) => `Jaar ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="gemiddelde_prijs" 
                      stroke="#10B981"
                      strokeWidth={3}
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, stroke: '#10B981', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              {/* Analysis */}
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border border-red-200">
                  <h4 className="font-bold text-red-800 mb-3">📈 2022: Energiecrisis</h4>
                  <p className="text-red-700 text-sm mb-2">
                    <strong>€0.241/kWh</strong> - Extreem hoge prijzen door oorlog in Oekraïne
                  </p>
                  <p className="text-red-600 text-xs">
                    Gasprijzen stegen dramatisch, wat directe impact had op elektriciteitsprijzen
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                  <h4 className="font-bold text-green-800 mb-3">📉 2023-2024: Normalisatie</h4>
                  <p className="text-green-700 text-sm mb-2">
                    <strong>€0.096/kWh (2023)</strong> → <strong>€0.077/kWh (2024)</strong>
                  </p>
                  <p className="text-green-600 text-xs">
                    Markt stabiliseerde, meer duurzame energie, lagere gasprijzen
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
                  <h4 className="font-bold text-emerald-800 mb-3">🔮 2025: Lichte Stijging</h4>
                  <p className="text-emerald-700 text-sm mb-2">
                    <strong>€0.087/kWh</strong> - Voorspelling voor 2025
                  </p>
                  <p className="text-emerald-600 text-xs">
                    Verwacht lichte stijging door toenemende vraag en transitie naar duurzame energie
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Maandelijkse Trends Visualisatie */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <ImageIcon className="w-6 h-6 text-purple-600" />
              Maandelijkse Prijstrends (2022-2025)
            </h3>
            
            <div className="text-center mb-6">
              <Image
                src="/spotprijs-maandelijks-2022-2025.png"
                alt="Gemiddelde spotprijs per maand 2022-2025"
                width={800}
                height={400}
                className="rounded-xl shadow-lg mx-auto"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
                <h4 className="font-bold text-emerald-800 mb-3">📊 Wat Zie Je Hier?</h4>
                <ul className="space-y-2 text-emerald-700 text-sm">
                  <li>• <strong>Seizoenspatronen:</strong> Winter duurder, zomer goedkoper</li>
                  <li>• <strong>2022 piek:</strong> Extreem hoge prijzen door energiecrisis</li>
                  <li>• <strong>2023-2024:</strong> Duidelijke normalisatie van prijzen</li>
                  <li>• <strong>Voorspelling 2025:</strong> Lichte stijging verwacht</li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <h4 className="font-bold text-green-800 mb-3">💡 Praktische Tips</h4>
                <ul className="space-y-2 text-green-700 text-sm">
                  <li>• <strong>Plan je contract:</strong> Overweeg vaste contracten in winter</li>
                  <li>• <strong>Dynamisch in zomer:</strong> Profiteer van lagere zomerprijzen</li>
                  <li>• <strong>Hybride aanpak:</strong> Combineer vaste en dynamische contracten</li>
                  <li>• <strong>Monitor trends:</strong> Houd ontwikkelingen in de gaten</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Seizoenspatronen Detailanalyse */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Calendar className="w-6 h-6 text-orange-600" />
              Seizoenspatronen
            </h3>
            
            <div className="text-center mb-6">
              <Image
                src="/herfst-2024-uur-dag-prijzen.png"
                alt="Gemiddelde prijs per uur en dag - Alle seizoenen"
                width={800}
                height={400}
                className="rounded-xl shadow-lg mx-auto"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                <h4 className="font-bold text-orange-800 mb-3">🌅 Ochtendpiek</h4>
                <p className="text-orange-700 text-sm">
                  <strong>7:00-9:00:</strong> Hoge prijzen door ochtendspits
                </p>
                <p className="text-orange-600 text-xs mt-2">
                  Vermijd grootverbruikers in deze periode
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <h4 className="font-bold text-green-800 mb-3">🌙 Nachtvoordeel</h4>
                <p className="text-green-700 text-sm">
                  <strong>23:00-6:00:</strong> Laagste prijzen van de dag
                </p>
                <p className="text-green-600 text-xs mt-2">
                  Perfect voor auto opladen en wasmachine
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-6 border border-teal-200">
                <h4 className="font-bold text-teal-800 mb-3">📅 Weekendvoordeel</h4>
                <p className="text-teal-700 text-sm">
                  <strong>Zaterdag/Zondag:</strong> Consistente lagere prijzen
                </p>
                <p className="text-teal-600 text-xs mt-2">
                  Ideaal voor huishoudelijke taken
                </p>
              </div>
            </div>
          </div>

          {/* Conclusie */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl shadow-lg p-8 text-white">
            <h3 className="text-2xl font-bold mb-6 text-center">🎯 Belangrijkste Conclusies</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold text-lg mb-4">📈 Trends</h4>
                <ul className="space-y-2 text-emerald-100 text-sm">
                  <li>• Prijzen zijn sinds 2022 drastisch gedaald</li>
                  <li>• 2024 was het goedkoopste jaar (€0.077/kWh)</li>
                  <li>• 2025 verwacht lichte stijging naar €0.087/kWh</li>
                  <li>• Seizoenspatronen blijven consistent</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold text-lg mb-4">💡 Strategie</h4>
                <ul className="space-y-2 text-emerald-100 text-sm">
                  <li>• Overweeg dynamische contracten voor zomer</li>
                  <li>• Plan grootverbruikers buiten piekuren</li>
                  <li>• Weekend is meestal goedkoper</li>
                  <li>• Monitor prijzen via apps en websites</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-white/10 rounded-xl">
              <p className="text-center text-emerald-100">
                <strong>💡 Tip:</strong> Deze analyses helpen je een realistische verwachting te vormen van dynamische energieprijzen. 
                Gebruik deze inzichten bij het vergelijken van energiecontracten!
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Klaar om te Vergelijken?
            </h3>
            <p className="text-gray-600 mb-6">
              Gebruik deze inzichten om een realistische schatting te maken van je gemiddelde kWh prijs voor dynamische contracten.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <DollarSign className="w-5 h-5" />
              Start Energievergelijking
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
