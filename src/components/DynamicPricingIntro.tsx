'use client';

import React from 'react';
import { Zap, TrendingDown, Clock, AlertCircle, CheckCircle, Battery, Sun } from 'lucide-react';
import { Tooltip } from './ui/tooltip';

export function DynamicPricingIntro() {
  return (
    <section className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100" aria-labelledby="intro-heading">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-6 py-3 rounded-full text-sm font-bold mb-4 shadow-lg">
          <Zap className="w-5 h-5" />
          <span>Dynamische Energieprijzen Uitgelegd</span>
        </div>
        <h2 id="intro-heading" className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
          Wat zijn dynamische energieprijzen?
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Bij dynamische prijzen betaal je elk uur een andere prijs voor elektriciteit, gebaseerd op vraag en aanbod op de energiemarkt.
        </p>
      </div>

      {/* Visuele Vergelijking */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Vast Contract</h3>
          </div>
            <div className="space-y-3 text-gray-700">
              <p className="text-sm">
                <strong>Vaste prijs:</strong> €0,25/kWh (incl. belasting)
              </p>
              <p className="text-sm">Altijd dezelfde prijs, ongeacht het tijdstip of de markt</p>
            <div className="h-24 bg-white rounded-lg p-4 flex items-center justify-center border-2 border-orange-300">
              <div className="w-full h-8 bg-orange-400 rounded flex items-center justify-center text-white font-bold text-sm">
                Vlakke prijs
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Dynamisch Contract</h3>
          </div>
          <div className="space-y-3 text-gray-700">
            <p className="text-sm">
              <strong>Variabele prijs:</strong> €0,04 - €0,35/kWh
            </p>
            <p className="text-sm">Prijs verandert elk uur op basis van de <Tooltip content="EPEX is de Europese energiebeurs waar elektriciteit wordt verhandeld" term="EPEX spotmarkt" /></p>
            <div className="h-24 bg-white rounded-lg p-4 flex items-end justify-between border-2 border-emerald-300 gap-1">
              <div className="w-1/6 bg-green-400 rounded-t" style={{height: '30%'}}></div>
              <div className="w-1/6 bg-green-500 rounded-t" style={{height: '40%'}}></div>
              <div className="w-1/6 bg-yellow-400 rounded-t" style={{height: '60%'}}></div>
              <div className="w-1/6 bg-orange-400 rounded-t" style={{height: '80%'}}></div>
              <div className="w-1/6 bg-red-400 rounded-t" style={{height: '95%'}}></div>
              <div className="w-1/6 bg-green-400 rounded-t" style={{height: '35%'}}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Voordelen en Nadelen van Dynamische Prijzen */}
      <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Voor- en nadelen van dynamische energieprijzen
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h4 className="text-lg font-bold text-gray-900">Voordelen</h4>
            </div>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-0.5">✓</span>
                <span><strong>Vaak goedkoper:</strong> Gemiddeld lager dan vast (€0,25/kWh), vooral met slim verbruik</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-0.5">✓</span>
                <span><strong>Profiteer van pieken:</strong> Extreem lage prijzen (soms negatief) bij veel zon/wind</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-0.5">✓</span>
                <span><strong>Transparant:</strong> Zie precies wat de stroom elk uur kost</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-0.5">✓</span>
                <span><strong>Goede terugleververgoeding:</strong> Hogere vergoeding voor zonnepanelen dan vast</span>
              </li>
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-6 h-6 text-orange-600" />
              <h4 className="text-lg font-bold text-gray-900">Nadelen</h4>
            </div>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold mt-0.5">✗</span>
                <span><strong>Geen prijsgarantie:</strong> Kan tijdelijk duurder zijn dan vast contract</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold mt-0.5">✗</span>
                <span><strong>Actieve monitoring:</strong> Vereist app en regelmatige controle</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold mt-0.5">✗</span>
                <span><strong>Gedragsverandering:</strong> Alleen voordeliger als je verbruik kunt verschuiven</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold mt-0.5">✗</span>
                <span><strong>Wisselende kosten:</strong> Energierekening varieert per maand (budget lastig)</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-gray-800">
            <strong>💡 Realistisch beeld:</strong> Dynamische prijzen zijn <em>gemiddeld</em> voordeliger, maar niet per definitie. 
            Je hebt een slimme meter nodig en moet actief je verbruik kunnen aanpassen. Heb je weinig flexibiliteit in je 
            dagritme? Dan kan een vast contract zekerder en soms zelfs goedkoper zijn.
          </p>
        </div>
      </div>

      {/* Voor wie geschikt? */}
      <div className="bg-gradient-to-r from-blue-50 to-emerald-50 border-2 border-emerald-200 rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-6 h-6 text-emerald-600" />
          Voor wie zijn dynamische prijzen geschikt?
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-emerald-100">
            <div className="flex items-center gap-2 mb-2">
              <Battery className="w-5 h-5 text-emerald-600" />
              <h4 className="font-bold text-gray-900">EV-eigenaren</h4>
            </div>
            <p className="text-sm text-gray-700">Laad je auto s nachts tijdens daluren en bespaar €200-400 per jaar</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-emerald-100">
            <div className="flex items-center gap-2 mb-2">
              <Sun className="w-5 h-5 text-emerald-600" />
              <h4 className="font-bold text-gray-900">Zonnepanelen</h4>
            </div>
            <p className="text-sm text-gray-700">Krijg hogere vergoeding voor teruggeleverde stroom tijdens piekuren</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-emerald-100">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-emerald-600" />
              <h4 className="font-bold text-gray-900">Flexibel verbruik</h4>
            </div>
            <p className="text-sm text-gray-700">Kun je wasmachine, droger of warmtepomp slim inzetten? Dan is dit ideaal</p>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-900">
            <strong>Let op:</strong> Heb je weinig flexibiliteit in je verbruik of vind je prijszekerheid belangrijk? 
            Dan is een vast contract mogelijk een betere keuze.
          </p>
        </div>
      </div>
    </section>
  );
}

