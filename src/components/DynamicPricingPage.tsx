'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Clock, Sun, Moon, Zap, BarChart3, Info, ArrowLeft, Calendar, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { getMonthlyData, getHourlyDataForMonth, getDailyDataForMonth, MonthlyStats } from '@/lib/data/monthlyPriceData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export function DynamicPricingPage() {
  const [selectedYear, setSelectedYear] = useState(2024);
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [monthlyData, setMonthlyData] = useState<{ [month: number]: MonthlyStats }>({});
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Prijzen analyseren...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Terug naar Home</span>
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
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
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full text-sm font-bold mb-6 shadow-lg">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

        {currentMonthData ? (
          <>
            {/* Monthly Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Zap className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Gemiddelde Prijs</h3>
                </div>
                <p className="text-3xl font-bold text-blue-600">
                  €{currentMonthData.average.toFixed(3)}/kWh
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Exclusief energiebelasting (€0.1316/kWh)
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Totaal: €{(currentMonthData.average + 0.1316).toFixed(3)}/kWh
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingDown className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Laagste Prijs</h3>
                </div>
                <p className="text-3xl font-bold text-green-600">
                  €{currentMonthData.minimum.toFixed(3)}/kWh
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Excl. belasting - Totaal: €{(currentMonthData.minimum + 0.1316).toFixed(3)}/kWh
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Hoogste Prijs</h3>
                </div>
                <p className="text-3xl font-bold text-red-600">
                  €{currentMonthData.maximum.toFixed(3)}/kWh
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Excl. belasting - Totaal: €{(currentMonthData.maximum + 0.1316).toFixed(3)}/kWh
                </p>
              </div>
            </div>

            {/* Hourly Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Clock className="w-6 h-6 text-blue-600" />
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
                      stroke="#3B82F6"
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6, fill: '#3B82F6', stroke: '#fff', strokeWidth: 2 }}
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
                <Clock className="w-6 h-6 text-purple-600" />
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
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-lg p-8 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Info className="w-6 h-6 text-blue-600" />
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
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
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
