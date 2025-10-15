'use client';

import React from 'react';
import { CheckCircle, Smartphone, TrendingUp, Clock, Shield, Zap } from 'lucide-react';

const steps = [
  {
    number: 1,
    title: 'Check je slimme meter',
    description: 'Controleer of je netbeheerder een slimme meter heeft geïnstalleerd. Dit is noodzakelijk voor dynamische prijzen omdat je verbruik per uur moet worden gemeten.',
    icon: <Zap className="w-5 h-5" />,
    action: 'Kijk op je meterkast of bel je netbeheerder',
    tip: 'Geen slimme meter? Je kunt deze gratis aanvragen bij je netbeheerder.'
  },
  {
    number: 2,
    title: 'Analyseer je huidige verbruik',
    description: 'Bekijk je jaarverbruik en denk na over je verbruikspatroon. Kun je flexibel zijn met grote apparaten? Heb je een EV, zonnepanelen of warmtepomp?',
    icon: <TrendingUp className="w-5 h-5" />,
    action: 'Download je verbruiksdata via je netbeheerder',
    tip: 'Hoog verbruik in de avond? Dan is er veel te winnen door te verschuiven naar daluren.'
  },
  {
    number: 3,
    title: 'Bekijk historische prijzen',
    description: 'Gebruik deze pagina om te zien hoe prijzen door het jaar heen fluctueren. Let op seizoenspatronen en uurpatronen om te zien of dynamische prijzen bij je passen.',
    icon: <Clock className="w-5 h-5" />,
    action: 'Scroll door de grafieken op deze pagina',
    tip: 'Let vooral op de prijsverschillen tussen dag/nacht en winter/zomer.'
  },
  {
    number: 4,
    title: 'Kies een leverancier met goede app',
    description: 'Selecteer een energieleverancier die een gebruiksvriendelijke app heeft voor prijsmonitoring. Dit is cruciaal om optimaal van dynamische prijzen te profiteren.',
    icon: <Smartphone className="w-5 h-5" />,
    action: 'Vergelijk leveranciers op app-kwaliteit en opslag',
    tip: 'Populaire apps: Tibber, ANWB Energie, Zonneplan, Frank Energie, Eneco.'
  },
  {
    number: 5,
    title: 'Start met een kort contract',
    description: 'Begin met een contract van 3-6 maanden om te ervaren of dynamische prijzen bij je passen. Zo kun je zonder grote commitments uitproberen.',
    icon: <Shield className="w-5 h-5" />,
    action: 'Kies een flexibel contract zonder lange looptijd',
    tip: 'Let op: sommige leveranciers hebben maandelijks opzegbare contracten.'
  },
  {
    number: 6,
    title: 'Monitor en optimaliseer',
    description: 'Volg je eerste maand actief via de app. Experimenteer met het verschuiven van verbruik naar goedkope uren. Leer van je verbruikspatronen en pas aan.',
    icon: <CheckCircle className="w-5 h-5" />,
    action: 'Installeer de leveranciers-app en stel notificaties in',
    tip: 'Stel prijsalarmen in voor extreem lage of hoge prijzen.'
  }
];

export function DynamicPricingGettingStarted() {
  // HowTo Schema for search engines
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Hoe begin ik met dynamische energieprijzen?',
    description: 'Stap-voor-stap gids om te starten met een dynamisch energiecontract',
    step: steps.map(step => ({
      '@type': 'HowToStep',
      position: step.number,
      name: step.title,
      text: step.description,
      itemListElement: {
        '@type': 'HowToDirection',
        text: step.action
      }
    }))
  };

  return (
    <section className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100" aria-labelledby="getting-started-heading">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-6 py-3 rounded-full text-sm font-bold mb-4 shadow-lg">
          <CheckCircle className="w-5 h-5" />
          <span>Stappenplan</span>
        </div>
        <h2 id="getting-started-heading" className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
          Hoe begin ik met dynamische prijzen?
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Volg deze 6 stappen om succesvol over te stappen naar een dynamisch energiecontract
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {steps.map((step, index) => (
          <div
            key={index}
            className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {step.number}
                </div>
              </div>
              
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                </div>
                
                <p className="text-gray-700 mb-3">{step.description}</p>
                
                <div className="bg-white rounded-lg p-3 border border-emerald-200 mb-2">
                  <p className="text-sm font-semibold text-emerald-900">
                    <span className="text-emerald-600">→</span> {step.action}
                  </p>
                </div>
                
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm text-amber-900">
                    <strong>💡 Tip:</strong> {step.tip}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-xl">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-3">Klaar om te starten?</h3>
          <p className="text-emerald-100 mb-4">
            Gebruik onze energievergelijker om de beste dynamische contracten te vergelijken
          </p>
          <a
            href="/"
            className="inline-block bg-white text-emerald-600 px-8 py-3 rounded-lg font-bold hover:bg-emerald-50 transition-colors shadow-lg"
          >
            Vergelijk Energiecontracten
          </a>
        </div>
      </div>
    </section>
  );
}

