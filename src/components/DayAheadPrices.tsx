'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingDown, TrendingUp, Activity, Clock, ArrowRight, Loader2 } from 'lucide-react';

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

export function DayAheadPrices() {
  const [data, setData] = useState<DayAheadData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPrices() {
      try {
        const response = await fetch('/api/dayahead');
        if (!response.ok) {
          throw new Error('Failed to fetch prices');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchPrices();
    
    // Refresh every 15 minutes
    const interval = setInterval(fetchPrices, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Format date to Dutch
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
      month: 'long' 
    });
  };

  // Get current hour price
  const getCurrentPrice = () => {
    if (!data?.prices.length) return null;
    
    const now = new Date();
    const currentHour = now.getHours();
    
    const currentPrice = data.prices.find(p => {
      const priceHour = new Date(p.timestamp).getHours();
      return priceHour === currentHour;
    });
    
    return currentPrice?.price ?? null;
  };

  // Find cheapest and most expensive hours
  const getExtremeHours = () => {
    if (!data?.prices.length) return { cheapest: null, expensive: null };
    
    let cheapest = data.prices[0];
    let expensive = data.prices[0];
    
    for (const price of data.prices) {
      if (price.price < cheapest.price) cheapest = price;
      if (price.price > expensive.price) expensive = price;
    }
    
    return {
      cheapest: { hour: new Date(cheapest.timestamp).getHours(), price: cheapest.price },
      expensive: { hour: new Date(expensive.timestamp).getHours(), price: expensive.price }
    };
  };

  if (loading) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 lg:p-8 shadow-2xl border border-white/40">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <span className="ml-3 text-gray-600">Prijzen laden...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 lg:p-8 shadow-2xl border border-white/40">
        <div className="text-center py-8">
          <p className="text-red-600">Kon prijzen niet laden. Probeer het later opnieuw.</p>
        </div>
      </div>
    );
  }

  const currentPrice = getCurrentPrice();
  const { cheapest, expensive } = getExtremeHours();
  const energyTax = 0.1316; // Energiebelasting inclusief BTW

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 lg:p-8 shadow-2xl border border-white/40">
      {/* Header */}
      <div className="text-center mb-6 lg:mb-8">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-full text-sm font-bold mb-4 lg:mb-6 shadow-lg">
          <Activity className="w-4 h-4" />
          <span>Day-Ahead Prijzen</span>
          <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">LIVE</span>
        </div>
        <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
          Stroomprijzen {formatDate(data.date)}
        </h3>
        <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
          <Clock className="w-4 h-4" />
          Bijgewerkt: {new Date(data.lastUpdated).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {/* Current Price Highlight */}
      {currentPrice !== null && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl text-white text-center">
          <p className="text-sm font-medium opacity-90 mb-1">Huidige Prijs (dit uur)</p>
          <p className="text-4xl font-bold">
            €{currentPrice.toFixed(3)}<span className="text-lg font-normal">/kWh</span>
          </p>
          <p className="text-sm opacity-80 mt-1">
            Totaal: €{(currentPrice + energyTax).toFixed(3)}/kWh incl. belasting
          </p>
        </div>
      )}
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-6">
        {/* Gemiddelde Prijs */}
        <div className="text-center p-4 lg:p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Activity className="w-5 h-5 text-slate-600" />
            <h4 className="text-lg font-bold text-slate-800">Gemiddeld</h4>
          </div>
          <div className="text-3xl lg:text-4xl font-bold text-slate-700 mb-2">
            €{data.average.toFixed(3)}
          </div>
          <p className="text-slate-500 text-xs lg:text-sm">per kWh excl. belasting</p>
        </div>

        {/* Laagste Prijs */}
        <div className="text-center p-4 lg:p-6 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl border border-green-200">
          <div className="flex items-center justify-center gap-2 mb-3">
            <TrendingDown className="w-5 h-5 text-green-600" />
            <h4 className="text-lg font-bold text-green-800">Laagste</h4>
          </div>
          <div className="text-3xl lg:text-4xl font-bold text-green-600 mb-2">
            €{data.min.toFixed(3)}
          </div>
          <p className="text-green-600 text-xs lg:text-sm">
            {cheapest ? `om ${cheapest.hour}:00 uur` : 'per kWh'}
          </p>
        </div>

        {/* Hoogste Prijs */}
        <div className="text-center p-4 lg:p-6 bg-gradient-to-br from-orange-50 to-amber-100 rounded-xl border border-orange-200">
          <div className="flex items-center justify-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <h4 className="text-lg font-bold text-orange-800">Hoogste</h4>
          </div>
          <div className="text-3xl lg:text-4xl font-bold text-orange-600 mb-2">
            €{data.max.toFixed(3)}
          </div>
          <p className="text-orange-600 text-xs lg:text-sm">
            {expensive ? `om ${expensive.hour}:00 uur` : 'per kWh'}
          </p>
        </div>
      </div>

      {/* Mini Chart Preview */}
      <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
        <div className="flex items-end justify-between h-16 gap-1">
          {data.prices.slice(0, 24).map((price, idx) => {
            const height = ((price.price - data.min) / (data.max - data.min || 1)) * 100;
            const isCurrentHour = new Date().getHours() === new Date(price.timestamp).getHours();
            return (
              <div 
                key={idx} 
                className={`flex-1 rounded-t transition-all ${
                  isCurrentHour 
                    ? 'bg-blue-500' 
                    : price.price === data.min 
                      ? 'bg-green-400' 
                      : price.price === data.max 
                        ? 'bg-orange-400' 
                        : 'bg-slate-300'
                }`}
                style={{ height: `${Math.max(10, height)}%` }}
                title={`${new Date(price.timestamp).getHours()}:00 - €${price.price.toFixed(3)}/kWh`}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>00:00</span>
          <span>12:00</span>
          <span>23:00</span>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link 
          href="/dayaheadprijzen"
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          <span>Bekijk Alle Prijzen</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link 
          href="/tool/dynamisch-inzicht"
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          <span>Bereken Jouw Kosten</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

