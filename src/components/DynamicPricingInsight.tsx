'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Clock, Sun, Moon, Zap, BarChart3, Info } from 'lucide-react';

interface PriceData {
  hour: number;
  price: number;
  month: string;
  dayType: 'weekday' | 'weekend';
  season: 'winter' | 'spring' | 'summer' | 'autumn';
}

export function DynamicPricingInsight() {
  const [selectedMonth, setSelectedMonth] = useState('alle');
  const [selectedDayType, setSelectedDayType] = useState('alle');
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);

  const months = [
    { value: 'alle', label: 'Hele jaar' },
    { value: 'januari', label: 'Januari' },
    { value: 'februari', label: 'Februari' },
    { value: 'maart', label: 'Maart' },
    { value: 'april', label: 'April' },
    { value: 'mei', label: 'Mei' },
    { value: 'juni', label: 'Juni' },
    { value: 'juli', label: 'Juli' },
    { value: 'augustus', label: 'Augustus' },
    { value: 'september', label: 'September' },
    { value: 'oktober', label: 'Oktober' },
    { value: 'november', label: 'November' },
    { value: 'december', label: 'December' }
  ];

  const dayTypes = [
    { value: 'alle', label: 'Alle dagen' },
    { value: 'weekday', label: 'Werkdagen' },
    { value: 'weekend', label: 'Weekend' }
  ];

  // Simulated price data based on real market patterns
  const generatePriceData = () => {
    const data: PriceData[] = [];
    
    for (let hour = 0; hour < 24; hour++) {
      // Base price patterns
      let basePrice = 0.15; // €0.15/kWh base
      
      // Time of day adjustments
      if (hour >= 0 && hour <= 6) {
        basePrice *= 0.3; // Night: very low
      } else if (hour >= 7 && hour <= 9) {
        basePrice *= 1.8; // Morning peak
      } else if (hour >= 10 && hour <= 16) {
        basePrice *= 0.7; // Day: moderate
      } else if (hour >= 17 && hour <= 20) {
        basePrice *= 2.2; // Evening peak
      } else if (hour >= 21 && hour <= 23) {
        basePrice *= 0.9; // Evening: moderate
      }

      // Seasonal adjustments
      const seasonalMultiplier = {
        'winter': 1.3,
        'spring': 0.9,
        'summer': 0.8,
        'autumn': 1.1
      };

      // Weekend adjustments
      const weekendMultiplier = 0.7;

      data.push({
        hour,
        price: basePrice,
        month: 'alle',
        dayType: 'weekday',
        season: 'winter'
      });
    }

    return data;
  };

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setPriceData(generatePriceData());
      setLoading(false);
    }, 1000);
  }, []);

  const filteredData = priceData.filter(item => {
    if (selectedMonth !== 'alle' && item.month !== selectedMonth) return false;
    if (selectedDayType !== 'alle' && item.dayType !== selectedDayType) return false;
    return true;
  });

  const averagePrice = filteredData.length > 0 
    ? filteredData.reduce((sum, item) => sum + item.price, 0) / filteredData.length 
    : 0;

  const minPrice = Math.min(...filteredData.map(item => item.price));
  const maxPrice = Math.max(...filteredData.map(item => item.price));

  const getPriceColor = (price: number) => {
    if (price < 0.05) return 'text-green-600 bg-green-50';
    if (price < 0.10) return 'text-yellow-600 bg-yellow-50';
    if (price < 0.20) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
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
      <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Prijzen analyseren...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full text-sm font-bold mb-6 shadow-lg">
            <BarChart3 className="w-5 h-5" />
            <span>Dynamische Prijzen Inzicht</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Begrijp Dynamische Energieprijzen
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ontdek wanneer energie het goedkoopst en duurste is. Maak een educated guess over je gemiddelde kWh prijs.
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Periode
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {months.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Dagtype
              </label>
              <select
                value={selectedDayType}
                onChange={(e) => setSelectedDayType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {dayTypes.map(dayType => (
                  <option key={dayType.value} value={dayType.value}>
                    {dayType.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Price Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Gemiddelde Prijs</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600">
              €{averagePrice.toFixed(3)}/kWh
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Inclusief energiebelasting: €{(averagePrice * 1.21).toFixed(3)}/kWh
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
              €{minPrice.toFixed(3)}/kWh
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Meestal 's nachts (0:00-6:00)
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
              €{maxPrice.toFixed(3)}/kWh
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Meestal 's avonds (17:00-20:00)
            </p>
          </div>
        </div>

        {/* Hourly Price Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Clock className="w-6 h-6 text-blue-600" />
            Prijzen per Uur
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {filteredData.map((item) => (
              <div
                key={item.hour}
                className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${getPriceColor(item.price)}`}
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
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Info className="w-6 h-6" />
            Slimme Tips voor Dynamische Contracten
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold mb-3">💰 Bespaar Geld</h4>
              <ul className="space-y-2 text-blue-100">
                <li>• Wasmachine draaien 's nachts (€0.05/kWh)</li>
                <li>• Elektrische auto opladen tussen 0:00-6:00</li>
                <li>• Verwarming aanzetten tijdens daluren</li>
                <li>• Zonnepanelen + dynamisch = perfecte combinatie</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-3">⚠️ Vermijd Duur</h4>
              <ul className="space-y-2 text-blue-100">
                <li>• Geen zware apparaten tussen 17:00-20:00</li>
                <li>• Oven en vaatwasser buiten piekuren</li>
                <li>• Plan je energieverbruik slim in</li>
                <li>• Monitor prijzen via apps</li>
              </ul>
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
              Gebruik deze inzichten om een realistische schatting te maken van je gemiddelde kWh prijs.
            </p>
            <button
              onClick={() => {
                const element = document.getElementById('calculation-form');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Start Energievergelijking
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
