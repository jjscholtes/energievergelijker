'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getMonthlyData } from '@/lib/data/monthlyPriceData';

export function DynamicPricingSummary() {
  const [summaryData, setSummaryData] = useState<{
    average2024: number;
    average2025: number;
    min2024: number;
    max2024: number;
    min2025: number;
    max2025: number;
  } | null>(null);

  useEffect(() => {
    try {
      const data2024 = getMonthlyData(2024);
      const data2025 = getMonthlyData(2025);
      
      // Calculate averages for 2024
      const months2024 = Object.values(data2024);
      const avg2024 = months2024.reduce((sum, month) => sum + month.average, 0) / months2024.length;
      const min2024 = Math.min(...months2024.map(m => m.minimum));
      const max2024 = Math.max(...months2024.map(m => m.maximum));
      
      // Calculate averages for 2025
      const months2025 = Object.values(data2025);
      const avg2025 = months2025.reduce((sum, month) => sum + month.average, 0) / months2025.length;
      const min2025 = Math.min(...months2025.map(m => m.minimum));
      const max2025 = Math.max(...months2025.map(m => m.maximum));
      
      setSummaryData({
        average2024: Math.round(avg2024 * 1000) / 1000,
        average2025: Math.round(avg2025 * 1000) / 1000,
        min2024: Math.round(min2024 * 1000) / 1000,
        max2024: Math.round(max2024 * 1000) / 1000,
        min2025: Math.round(min2025 * 1000) / 1000,
        max2025: Math.round(max2025 * 1000) / 1000,
      });
    } catch (error) {
      console.error('Error loading summary data:', error);
    }
  }, []);

  if (!summaryData) {
    return (
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Prijzen laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl shadow-lg p-8 border border-gray-100">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-full text-sm font-bold mb-4 shadow-lg">
          <BarChart3 className="w-5 h-5" />
          <span>Dynamische Prijzen</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Echte Marktdata
        </h2>
        <p className="text-gray-600 text-lg">
          Bekijk de werkelijke dynamische energieprijzen per maand en seizoen
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* 2024 Data */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">2024 Gemiddelden</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-600" />
                <span className="font-medium">Gemiddeld</span>
              </div>
              <span className="text-2xl font-bold text-emerald-600">
                €{summaryData.average2024.toFixed(3)}/kWh
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-green-600" />
                <span className="font-medium">Laagste</span>
              </div>
              <span className="text-xl font-bold text-green-600">
                €{summaryData.min2024.toFixed(3)}/kWh
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-red-600" />
                <span className="font-medium">Hoogste</span>
              </div>
              <span className="text-xl font-bold text-red-600">
                €{summaryData.max2024.toFixed(3)}/kWh
              </span>
            </div>
          </div>
        </div>

        {/* 2025 Data */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">2025 Gemiddelden</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-600" />
                <span className="font-medium">Gemiddeld</span>
              </div>
              <span className="text-2xl font-bold text-emerald-600">
                €{summaryData.average2025.toFixed(3)}/kWh
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-green-600" />
                <span className="font-medium">Laagste</span>
              </div>
              <span className="text-xl font-bold text-green-600">
                €{summaryData.min2025.toFixed(3)}/kWh
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-red-600" />
                <span className="font-medium">Hoogste</span>
              </div>
              <span className="text-xl font-bold text-red-600">
                €{summaryData.max2025.toFixed(3)}/kWh
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-white rounded-xl p-6 shadow-md mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Belangrijke Inzichten</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">💡 Negatieve Prijzen</h4>
            <p className="text-gray-600 text-sm">
              Soms krijg je geld toe! Dit gebeurt bij overschot aan duurzame energie.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">📊 Seizoenspatronen</h4>
            <p className="text-gray-600 text-sm">
              Winter is duurder, zomer goedkoper. Plan je verbruik slim in.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <Link
          href="/dynamische-prijzen"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <BarChart3 className="w-5 h-5" />
          Bekijk Gedetailleerde Analyse
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}
