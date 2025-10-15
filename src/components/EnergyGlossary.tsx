'use client';

import React, { useState } from 'react';
import { BookOpen, X } from 'lucide-react';

interface GlossaryTerm {
  term: string;
  definition: string;
  example?: string;
}

const glossaryTerms: GlossaryTerm[] = [
  {
    term: 'kWh (Kilowattuur)',
    definition: 'Een kilowattuur is de eenheid waarmee elektriciteitsverbruik wordt gemeten. Als je een apparaat van 1000 watt (1 kilowatt) een uur lang gebruikt, verbruik je 1 kWh.',
    example: 'Een wasmachine gebruikt ongeveer 1 kWh per wasbeurt.'
  },
  {
    term: 'kWp (Kilowatt-piek)',
    definition: 'De piekproductie van zonnepanelen onder ideale omstandigheden. Een systeem van 4 kWp kan op een zonnige dag maximaal 4 kilowatt produceren.',
    example: 'Een gemiddeld huishouden heeft een systeem van 8-12 zonnepanelen (3-4 kWp).'
  },
  {
    term: 'Spotprijs',
    definition: 'De prijs voor elektriciteit op de groothandelsmarkt (EPEX) die elk uur verandert op basis van vraag en aanbod.',
    example: 'Op een zonnige middag kan de spotprijs dalen tot €0,03/kWh, terwijl het op een koude avond €0,25/kWh kan zijn.'
  },
  {
    term: 'EPEX',
    definition: 'European Power Exchange - de Europese energiebeurs waar elektriciteit wordt verhandeld. Nederlandse energieprijzen worden hier bepaald.',
    example: 'Leveranciers met dynamische contracten baseren hun prijzen op de EPEX spotmarkt.'
  },
  {
    term: 'Dynamisch contract',
    definition: 'Een energiecontract waarbij de prijs per uur verandert op basis van de spotmarktprijzen. Dit biedt kansen om te besparen door slim te verbruiken.',
    example: 'Met een dynamisch contract betaal je s nachts vaak minder dan overdag.'
  },
  {
    term: 'Vast contract',
    definition: 'Een energiecontract met een vaste prijs per kWh voor de hele contractperiode, meestal 1-3 jaar. Dit biedt prijszekerheid.',
    example: 'Een vast contract van €0,25/kWh betekent dat je dit hele jaar deze prijs betaalt, ongeacht marktschommelingen.'
  },
  {
    term: 'Saldering',
    definition: 'De mogelijkheid om teruggeleverde zonne-energie te verrekenen met verbruikte energie. Je betaalt alleen energiebelasting over het nettoverbruik.',
    example: 'Als je 4000 kWh gebruikt en 3000 kWh terugleverd, betaal je energiebelasting over 1000 kWh.'
  },
  {
    term: 'Energiebelasting',
    definition: 'Een door de overheid geheven belasting op energieverbruik. Voor elektriciteit is dit €0,1316/kWh (inclusief BTW).',
    example: 'Bij 3000 kWh verbruik betaal je ongeveer €395 aan energiebelasting per jaar.'
  },
  {
    term: 'Leverancieropslag',
    definition: 'Het bedrag dat een energieleverancier bovenop de spotprijs rekent voor hun diensten, kosten en marge.',
    example: 'Bij een spotprijs van €0,08/kWh en een opslag van €0,023/kWh betaal je €0,103/kWh aan je leverancier (excl. belasting).'
  },
  {
    term: 'Terugleververgoeding',
    definition: 'Het bedrag dat je krijgt voor elektriciteit die je terugleverd aan het net, meestal van zonnepanelen.',
    example: 'Met een dynamisch contract krijg je vaak €0,05-0,10/kWh voor teruggeleverde stroom, afhankelijk van het tijdstip.'
  },
  {
    term: 'Netbeheerkosten',
    definition: 'Vaste kosten voor het gebruik van het elektriciteitsnetwerk. Deze zijn wettelijk vastgesteld en verschillen per netbeheerder.',
    example: 'Netbeheerkosten zijn ongeveer €470-490 per jaar en zijn bij elke leverancier gelijk.'
  },
  {
    term: 'Piek- en daluren',
    definition: 'Tijdsblokken waarbij de stroomprijs verschilt. Piekuren (overdag) zijn meestal duurder dan daluren (s nachts).',
    example: 'Daluren zijn vaak 23:00-07:00, ideaal voor het opladen van een elektrische auto.'
  },
  {
    term: 'Load shifting',
    definition: 'Het verschuiven van energieverbruik naar goedkopere momenten, zoals het s nachts opladen van een EV of draaien van de wasmachine.',
    example: 'Door je EV s nachts te laden in plaats van s avonds, bespaar je €100-200 per jaar.'
  }
];

export function EnergyGlossary() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors text-sm font-medium border border-emerald-200"
        aria-label="Open energiebegrippenlijst"
      >
        <BookOpen className="w-4 h-4" />
        <span>Begrippenlijst</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Energiebegrippenlijst</h2>
                <p className="text-sm text-gray-600 mt-1">Uitleg van veelgebruikte energietermen</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white rounded-lg transition-colors"
                aria-label="Sluit begrippenlijst"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="overflow-y-auto p-6">
              <dl className="space-y-6">
                {glossaryTerms.map((item, index) => (
                  <div key={index} className="border-l-4 border-emerald-500 pl-4">
                    <dt className="text-lg font-bold text-gray-900 mb-2">{item.term}</dt>
                    <dd className="text-gray-700 mb-2">{item.definition}</dd>
                    {item.example && (
                      <dd className="text-sm text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                        <strong>Voorbeeld:</strong> {item.example}
                      </dd>
                    )}
                  </div>
                ))}
              </dl>
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium"
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

