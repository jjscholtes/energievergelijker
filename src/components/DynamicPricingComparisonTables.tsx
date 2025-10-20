'use client';

import React from 'react';
import { Table, Clock } from 'lucide-react';

export function DynamicPricingComparisonTables() {
  return (
    <section className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100" aria-labelledby="comparison-heading">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-full text-sm font-bold mb-4 shadow-lg">
          <Table className="w-5 h-5" />
          <span>Prijsanalyse per Seizoen & Tijdstip</span>
        </div>
        <h2 id="comparison-heading" className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
          Wanneer is stroom het goedkoopst?
        </h2>
      </div>

      {/* Seizoensverschillen */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Seizoensverschillen in Prijzen</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <th className="p-4 text-left font-bold">Seizoen</th>
                <th className="p-4 text-left font-bold">Gem. Spotprijs</th>
                <th className="p-4 text-left font-bold">Totaalprijs*</th>
                <th className="p-4 text-left font-bold">Verschil t.o.v. Jaargemiddelde</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 hover:bg-blue-50">
                <td className="p-4 font-semibold text-gray-900">❄️ Winter</td>
                <td className="p-4 text-gray-700">€0,095/kWh</td>
                <td className="p-4 text-gray-700">€0,250/kWh</td>
                <td className="p-4 text-red-600 font-bold">+23% duurder</td>
              </tr>
              <tr className="border-b border-gray-200 hover:bg-blue-50">
                <td className="p-4 font-semibold text-gray-900">🌸 Lente</td>
                <td className="p-4 text-gray-700">€0,072/kWh</td>
                <td className="p-4 text-gray-700">€0,227/kWh</td>
                <td className="p-4 text-green-600 font-bold">-7% goedkoper</td>
              </tr>
              <tr className="border-b border-gray-200 hover:bg-blue-50">
                <td className="p-4 font-semibold text-gray-900">☀️ Zomer</td>
                <td className="p-4 text-gray-700">€0,058/kWh</td>
                <td className="p-4 text-gray-700">€0,213/kWh</td>
                <td className="p-4 text-green-600 font-bold">-25% goedkoper</td>
              </tr>
              <tr className="hover:bg-blue-50">
                <td className="p-4 font-semibold text-gray-900">🍂 Herfst</td>
                <td className="p-4 text-gray-700">€0,081/kWh</td>
                <td className="p-4 text-gray-700">€0,236/kWh</td>
                <td className="p-4 text-orange-600 font-bold">Gemiddeld</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-600 mt-3 italic">
          *Totaalprijs = Spotprijs + Energiebelasting (€0,1316/kWh) + Leveranciersopslag (€0,023/kWh)
        </p>
      </div>

      {/* Beste tijden om te verbruiken */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-6 h-6 text-emerald-600" />
          Beste Tijden om Stroom te Verbruiken
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-emerald-600 to-green-600 text-white">
                <th className="p-4 text-left font-bold">Tijdstip</th>
                <th className="p-4 text-left font-bold">Totaalprijs*</th>
                <th className="p-4 text-left font-bold">Geschikt voor</th>
                <th className="p-4 text-left font-bold">vs Vast (€0,25/kWh)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 hover:bg-green-50">
                <td className="p-4 font-semibold text-gray-900">00:00 - 06:00 (Nacht)</td>
                <td className="p-4 text-green-700 font-bold">€0,20-0,24/kWh</td>
                <td className="p-4 text-gray-700">EV laden, wasmachine, droger, boiler</td>
                <td className="p-4 text-green-600 font-bold">4-20% goedkoper ✓</td>
              </tr>
              <tr className="border-b border-gray-200 hover:bg-green-50">
                <td className="p-4 font-semibold text-gray-900">06:00 - 09:00 (Ochtend)</td>
                <td className="p-4 text-orange-700 font-bold">€0,27-0,34/kWh</td>
                <td className="p-4 text-gray-700">Vermijd grootverbruikers</td>
                <td className="p-4 text-red-600 font-bold">8-36% duurder ✗</td>
              </tr>
              <tr className="border-b border-gray-200 hover:bg-green-50">
                <td className="p-4 font-semibold text-gray-900">09:00 - 16:00 (Middag)</td>
                <td className="p-4 text-yellow-700 font-bold">€0,24-0,28/kWh</td>
                <td className="p-4 text-gray-700">Redelijk, goed met zonnepanelen</td>
                <td className="p-4 text-yellow-600">4% goedkoper - 12% duurder</td>
              </tr>
              <tr className="border-b border-gray-200 hover:bg-green-50">
                <td className="p-4 font-semibold text-gray-900">16:00 - 21:00 (Avond)</td>
                <td className="p-4 text-red-700 font-bold">€0,31-0,41/kWh</td>
                <td className="p-4 text-gray-700">Duurste uren - vermijd indien mogelijk</td>
                <td className="p-4 text-red-600 font-bold">24-64% duurder ✗✗</td>
              </tr>
              <tr className="hover:bg-green-50">
                <td className="p-4 font-semibold text-gray-900">21:00 - 00:00 (Late avond)</td>
                <td className="p-4 text-yellow-700 font-bold">€0,25-0,29/kWh</td>
                <td className="p-4 text-gray-700">Redelijk, dalend naar nacht</td>
                <td className="p-4 text-yellow-600">Gelijk - 16% duurder</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-600 mt-3 italic">
          *Totaalprijs = Spotprijs + Energiebelasting (€0,1316/kWh) + Leveranciersopslag (€0,023/kWh)
        </p>
      </div>

      <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-emerald-50 border border-emerald-200 rounded-xl">
        <p className="text-sm text-gray-700">
          <strong>💡 Tip:</strong> Gebruik de seizoens- en tijdstip-informatie hierboven om je grootverbruikers (EV, wasmachine, warmtepomp) 
          te plannen tijdens de goedkoopste uren. Zo haal je het maximale uit dynamische prijzen.
        </p>
      </div>
    </section>
  );
}

