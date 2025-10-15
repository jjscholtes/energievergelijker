'use client';

import React from 'react';
import { Lightbulb, CheckCircle } from 'lucide-react';

export function DynamicPricingKeyTakeaways() {
  const takeaways = [
    {
      icon: '💰',
      text: 'Dynamische prijzen zijn gemiddeld goedkoper dan vast (€0,25/kWh), maar alleen met slim verbruik'
    },
    {
      icon: '🌙',
      text: 'Prijzen zijn doorgaans het laagst tussen 00:00-06:00 uur (nachtelijke daluren)'
    },
    {
      icon: '☀️',
      text: 'Zomer is meestal goedkoper dan winter door meer zonne-energie'
    },
    {
      icon: '⚡',
      text: 'Soms negatieve prijzen bij veel zon/wind - maar ook hoge pieken mogelijk'
    },
    {
      icon: '🔋',
      text: 'Meest geschikt voor flexibel verbruik: EV-laden, warmtepomp, zonnepanelen'
    },
    {
      icon: '📱',
      text: 'Vereist slimme meter + actieve monitoring via app - niet geschikt voor iedereen'
    }
  ];

  return (
    <section className="bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 border-2 border-yellow-300 rounded-2xl shadow-xl p-8 mb-8" aria-labelledby="takeaways-heading">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-14 h-14 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
          <Lightbulb className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 id="takeaways-heading" className="text-3xl font-bold text-gray-900">Belangrijkste Inzichten</h2>
          <p className="text-gray-600">Wat je moet weten over dynamische energieprijzen</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {takeaways.map((takeaway, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-5 border-2 border-yellow-200 hover:border-yellow-400 hover:shadow-lg transition-all"
          >
            <div className="flex items-start gap-3">
              <div className="text-3xl flex-shrink-0">{takeaway.icon}</div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-800 leading-relaxed">{takeaway.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl p-6">
        <p className="text-center text-lg font-semibold">
          💡 <strong>Let op:</strong> Dynamische prijzen kunnen voordeliger zijn, maar vereisen actieve monitoring en flexibel verbruik. 
          Zonder aanpassingen in je gedrag kan een vast contract zekerder en soms goedkoper zijn.
        </p>
      </div>
    </section>
  );
}

