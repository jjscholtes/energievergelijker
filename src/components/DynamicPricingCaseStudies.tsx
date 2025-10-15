'use client';

import React from 'react';
import { Sun, Zap, Home, TrendingDown, Battery } from 'lucide-react';

interface CaseStudy {
  title: string;
  icon: React.ReactNode;
  profile: string;
  situation: string;
  approach: string;
  results: string;
  savings: string;
  lessons: string[];
  bgColor: string;
  borderColor: string;
  iconBg: string;
}

const caseStudies: CaseStudy[] = [
  {
    title: 'Familie Jansen met zonnepanelen',
    icon: <Sun className="w-6 h-6" />,
    profile: '2 volwassenen, 2 kinderen, rijtjeshuis',
    situation: 'Familie Jansen heeft 10 zonnepanelen (4 kWp) en verbruikt 3.200 kWh per jaar. Ze hadden een vast contract van €0,25/kWh en leverden stroom terug voor €0,05/kWh.',
    approach: 'Overgestapt naar een dynamisch contract. Ze laden hun wasmachine, droger en vaatwasser buiten piekuren. Hun zonnepanelen leveren vooral terug tijdens dure middaguren.',
    results: 'Gemiddelde inkoopprijs: €0,19/kWh (incl. opslag & belasting). Teruglevering gemiddeld €0,10/kWh. Jaarverbruik uit net: 1.800 kWh. Teruglevering: 2.600 kWh.',
    savings: '€320 per jaar',
    lessons: [
      'Dynamisch contract combineert perfect met zonnepanelen',
      'Teruglevering tijdens dure uren levert meer op',
      'Wasmachine draaien op daluren scheelt €50/jaar extra'
    ],
    bgColor: 'from-yellow-50 to-orange-50',
    borderColor: 'border-yellow-200',
    iconBg: 'bg-yellow-500'
  },
  {
    title: 'Appartement met warmtepomp',
    icon: <Home className="w-6 h-6" />,
    profile: 'Alleenstaande, appartement, all-electric',
    situation: 'Marco woont in een goed geïsoleerd appartement met warmtepomp. Jaarverbruik: 5.500 kWh. Hij had een vast contract van €0,25/kWh (incl. belasting) en dacht dat dynamisch altijd goedkoper zou zijn.',
    approach: 'Stapte over naar dynamisch. Eerste winter verbruikte hij veel tijdens piekuren (\'s avonds thuiskomen). Warmtepomp draaide vooral tussen 17:00-22:00. Geen flexibiliteit door werkschema.',
    results: 'Eerste jaar: gemiddelde prijs €0,26/kWh (incl. belasting) - duurder dan vast! Tweede jaar: warmtepomp geprogrammeerd op daluren, betere isolatie. Nieuwe gemiddelde: €0,22/kWh.',
    savings: 'Jaar 1: -€55 (duurder), Jaar 2: €165 besparing (na optimalisatie)',
    lessons: [
      'Dynamisch vereist flexibel verbruik - anders niet voordeliger',
      'Slimme thermostaat is essentieel om van dynamische prijzen te profiteren',
      'Winter is duurder - zorg voor goede isolatie'
    ],
    bgColor: 'from-blue-50 to-cyan-50',
    borderColor: 'border-blue-200',
    iconBg: 'bg-blue-500'
  },
  {
    title: 'EV-eigenaar profiteert van nachtelijk laden',
    icon: <Battery className="w-6 h-6" />,
    profile: 'Stel met elektrische auto, geen zonnepanelen',
    situation: 'Lisa en Tom rijden samen 25.000 km per jaar met hun EV (verbruik: 2.800 kWh/jaar voor laden). Huishouden: 2.800 kWh. Totaal: 5.600 kWh. Vast contract: €0,25/kWh (incl. belasting).',
    approach: 'Overgestapt naar dynamisch. Auto laden geprogrammeerd tussen 23:00-07:00. Slimme laadpaal stopt automatisch bij prijzen boven €0,15/kWh. Wasmachine ook vaak \'s nachts.',
    results: 'Huishoudelijk verbruik gemiddeld: €0,22/kWh (incl. belasting). EV laden gemiddeld: €0,14/kWh (daluren incl. belasting). Totale gemiddelde prijs: €0,19/kWh (gewogen naar verbruik).',
    savings: '€336 per jaar (€224 op EV, €112 op huishouden)',
    lessons: [
      'EV laden is perfect voor dynamische prijzen',
      'Nachtelijke lading is 40-50% goedkoper dan avondlading',
      'Slimme laadpaal met prijslimiet maximaliseert besparing',
      'Combineer met nachttarief voor wasmachine/droger'
    ],
    bgColor: 'from-emerald-50 to-teal-50',
    borderColor: 'border-emerald-200',
    iconBg: 'bg-emerald-500'
  }
];

export function DynamicPricingCaseStudies() {
  return (
    <section className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100" aria-labelledby="case-studies-heading">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-full text-sm font-bold mb-4 shadow-lg">
          <Zap className="w-5 h-5" />
          <span>Praktijkvoorbeelden</span>
        </div>
        <h2 id="case-studies-heading" className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
          Echte voorbeelden van dynamische prijzen
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Ontdek hoe verschillende huishoudens omgaan met dynamische prijzen en wat ze bespaarden
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {caseStudies.map((study, index) => (
          <article
            key={index}
            className={`bg-gradient-to-br ${study.bgColor} border-2 ${study.borderColor} rounded-xl overflow-hidden hover:shadow-xl transition-shadow`}
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 ${study.iconBg} rounded-full flex items-center justify-center text-white`}>
                  {study.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{study.title}</h3>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">👤 Profiel</h4>
                  <p className="text-gray-700">{study.profile}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">📋 Situatie</h4>
                  <p className="text-gray-700">{study.situation}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">🎯 Aanpak</h4>
                  <p className="text-gray-700">{study.approach}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">📊 Resultaat</h4>
                  <p className="text-gray-700">{study.results}</p>
                </div>

                <div className="bg-white/70 rounded-lg p-4 border-2 border-green-300">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">Besparing:</span>
                    <span className="text-2xl font-bold text-green-700">{study.savings}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">💡 Geleerde lessen</h4>
                  <ul className="space-y-1">
                    {study.lessons.map((lesson, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-700">
                        <TrendingDown className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{lesson}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl">
        <h3 className="text-lg font-bold text-gray-900 mb-3 text-center">Belangrijkste Conclusies</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white rounded-lg p-4 border border-purple-100">
            <p className="font-semibold text-purple-900 mb-1">✓ Flexibiliteit is key</p>
            <p className="text-gray-700">Hoe meer je je verbruik kunt verschuiven naar goedkope uren, hoe meer je bespaart</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-purple-100">
            <p className="font-semibold text-purple-900 mb-1">✓ Technologie helpt</p>
            <p className="text-gray-700">Slimme apparaten, laadpalen en thermostaten automatiseren de besparing</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-purple-100">
            <p className="font-semibold text-purple-900 mb-1">✓ Monitor en leer</p>
            <p className="text-gray-700">Eerste maanden zijn een leercurve - pas je gedrag aan op basis van data</p>
          </div>
        </div>
      </div>
    </section>
  );
}

