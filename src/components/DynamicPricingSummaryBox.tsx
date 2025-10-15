'use client';

import React from 'react';
import { FileText, TrendingDown, Sun, Battery } from 'lucide-react';

interface SummaryBoxProps {
  year: number;
  averagePrice: number;
  cheapestSeason: string;
  cheapestSeasonPrice: number;
  mostExpensiveSeason: string;
  mostExpensiveSeasonPrice: number;
  potentialSavings: string;
}

export function DynamicPricingSummaryBox({
  year,
  averagePrice,
  cheapestSeason,
  cheapestSeasonPrice,
  mostExpensiveSeason,
  mostExpensiveSeasonPrice,
  potentialSavings
}: SummaryBoxProps) {
  return (
    <article className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-2xl shadow-xl p-8 mb-8" aria-labelledby="summary-heading">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-8 h-8" />
        <h2 id="summary-heading" className="text-3xl font-bold">Samenvatting Dynamische Prijzen</h2>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="w-6 h-6 text-emerald-200" />
            <h3 className="font-bold text-lg">Gemiddelde Prijs</h3>
          </div>
          <p className="text-4xl font-bold mb-2">€{averagePrice.toFixed(3)}/kWh</p>
          <p className="text-sm text-emerald-100">Exclusief energiebelasting (€0,1316/kWh)</p>
          <p className="text-sm text-emerald-200 mt-1">
            Totaal: €{(averagePrice + 0.1316).toFixed(3)}/kWh
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
          <div className="flex items-center gap-2 mb-3">
            <Sun className="w-6 h-6 text-yellow-300" />
            <h3 className="font-bold text-lg">Goedkoopste Seizoen</h3>
          </div>
          <p className="text-3xl font-bold mb-2">{cheapestSeason}</p>
          <p className="text-lg">€{cheapestSeasonPrice.toFixed(3)}/kWh</p>
          <p className="text-sm text-emerald-100 mt-2">
            {Math.round(((averagePrice - cheapestSeasonPrice) / averagePrice) * 100)}% onder gemiddelde
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
          <div className="flex items-center gap-2 mb-3">
            <Battery className="w-6 h-6 text-orange-300" />
            <h3 className="font-bold text-lg">Duurste Seizoen</h3>
          </div>
          <p className="text-3xl font-bold mb-2">{mostExpensiveSeason}</p>
          <p className="text-lg">€{mostExpensiveSeasonPrice.toFixed(3)}/kWh</p>
          <p className="text-sm text-emerald-100 mt-2">
            {Math.round(((mostExpensiveSeasonPrice - averagePrice) / averagePrice) * 100)}% boven gemiddelde
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="w-6 h-6 text-green-300" />
            <h3 className="font-bold text-lg">Mogelijke Besparing*</h3>
          </div>
          <p className="text-4xl font-bold mb-2">{potentialSavings}</p>
          <p className="text-sm text-emerald-100">T.o.v. gemiddeld vast contract (€0,25/kWh incl. belasting)</p>
          <p className="text-sm text-yellow-200 mt-1">*Met slim verbruik - niet gegarandeerd</p>
        </div>
      </div>

      <div className="mt-6 bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
        <h3 className="font-bold text-xl mb-4">Meest geschikt voor:</h3>
        <ul className="grid md:grid-cols-2 gap-3 text-emerald-100 mb-4">
          <li className="flex items-center gap-2">
            <span className="text-2xl">✓</span>
            <span>EV-eigenaren (kunnen &apos;s nachts laden)</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-2xl">✓</span>
            <span>Zonnepanelen (goede terugleververgoeding)</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-2xl">✓</span>
            <span>Warmtepomp (programmeerbaar verbruik)</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-2xl">✓</span>
            <span>Flexibel dagritme (thuiswerken)</span>
          </li>
        </ul>
        <p className="text-sm text-yellow-200 border-t border-white/20 pt-4">
          <strong>⚠️ Let op:</strong> Zonder mogelijkheid om verbruik te verschuiven is een vast contract vaak zekerder en soms goedkoper.
        </p>
      </div>
    </article>
  );
}

