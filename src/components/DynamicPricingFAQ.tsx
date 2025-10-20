'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import Link from 'next/link';

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: 'Wat zijn dynamische energieprijzen precies?',
    answer: 'Dynamische energieprijzen zijn tarieven die elk uur veranderen op basis van de actuele prijs op de EPEX spotmarkt (de Europese energiebeurs). De prijs wordt bepaald door vraag en aanbod: bij veel vraag en weinig aanbod stijgt de prijs, bij weinig vraag en veel aanbod (bijvoorbeeld door zon en wind) daalt de prijs. Je leverancier rekent een kleine opslag bovenop deze spotprijs voor hun diensten.'
  },
  {
    question: 'Hoe werken de uurprijzen in de praktijk?',
    answer: 'Elke dag worden de prijzen voor de volgende dag vastgesteld op de EPEX spotmarkt. Je energieleverancier publiceert deze prijzen meestal een dag van tevoren in hun app of op hun website. Zo kun je precies zien wanneer stroom goedkoop is en kun je je verbruik daarop aanpassen. De meeste leveranciers rekenen automatisch de juiste prijs per uur af op basis van je slimme meter.'
  },
  {
    question: 'Wanneer zijn de prijzen het laagst?',
    answer: 'Over het algemeen zijn de prijzen het laagst tussen 00:00 en 06:00 uur (nachtelijke daluren) en op zonnige middagen wanneer veel zonne-energie wordt opgewekt. Ook zijn weekenden vaak goedkoper dan werkdagen omdat bedrijven dan minder energie verbruiken. In de zomer zijn prijzen gemiddeld 30-40% lager dan in de winter vanwege meer zonne-energie en minder vraag naar verwarming.'
  },
  {
    question: 'Wat is het verschil tussen een dynamisch en vast contract?',
    answer: 'Bij een vast contract betaal je het hele jaar dezelfde prijs per kWh, ongeacht marktschommelingen. Dit biedt zekerheid maar je mist kansen om te besparen. Bij een dynamisch contract verandert de prijs elk uur. Dit is gemiddeld 10-20% goedkoper, maar vraagt wel actieve monitoring en flexibel verbruik. Met een dynamisch contract kun je slim laden en verbruiken, terwijl een vast contract vooral rust en voorspelbaarheid biedt.'
  },
  {
    question: 'Kan ik geld verliezen met dynamische prijzen?',
    answer: 'In theorie kun je soms meer betalen dan met een vast contract, vooral als je energie verbruikt tijdens piekuren en in dure maanden. Echter, historisch gezien zijn dynamische contracten gemiddeld 10-20% goedkoper. Het risico is het grootst als je weinig flexibiliteit hebt in je verbruik en altijd tijdens piekuren moet verbruiken. Door slim te laden en verbruiken kun je het risico minimaliseren en juist goed besparen.'
  },
  {
    question: 'Hoe monitor ik de prijzen?',
    answer: 'Alle energieleveranciers met dynamische contracten bieden een app of website waar je de actuele en toekomstige prijzen kunt zien. Populaire apps zijn die van Tibber, ANWB Energie, Zonneplan, en Frank Energie. Deze apps tonen meestal grafieken met prijzen per uur en sturen notificaties bij extreem lage of hoge prijzen. Je kunt ook externe apps zoals "Stroomprijzen.nl" gebruiken die prijzen van meerdere leveranciers vergelijken.'
  },
  {
    question: 'Wat gebeurt er bij negatieve prijzen?',
    answer: 'Negatieve prijzen komen voor wanneer er een overschot is aan duurzame energie (veel zon en wind) en weinig vraag. Op dat moment krijg je geld toe om stroom te verbruiken! Dit gebeurt enkele tientallen uren per jaar, vooral op zonnige en winderige dagen met weinig vraag. Het is het perfecte moment om je elektrische auto op te laden, de wasmachine te draaien of je huis te verwarmen met een warmtepomp. Let op: je betaalt nog steeds energiebelasting, ook bij negatieve prijzen.'
  },
  {
    question: 'Voor wie zijn dynamische prijzen het meest geschikt?',
    answer: 'Dynamische prijzen zijn ideaal voor huishoudens met flexibel verbruik: eigenaren van elektrische auto\'s die \'s nachts laden, huishoudens met zonnepanelen die terugleveren tegen hoge dagprijzen, mensen met warmtepompen die slim kunnen verwarmen, en iedereen die grote apparaten (wasmachine, droger, vaatwasser) buiten piekuren kan gebruiken. Ook geschikt voor tech-savvy mensen die actief hun verbruik willen optimaliseren via apps en slimme apparaten.'
  }
];

export function DynamicPricingFAQ() {
  const [openItems, setOpenItems] = useState<number[]>([0]); // First item open by default

  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  // FAQ Schema for search engines
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  };

  return (
    <section className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100" aria-labelledby="faq-heading">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full text-sm font-bold mb-4 shadow-lg">
          <HelpCircle className="w-5 h-5" />
          <span>Veelgestelde Vragen</span>
        </div>
        <h2 id="faq-heading" className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
          Veelgestelde vragen over dynamische prijzen
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Antwoorden op de belangrijkste vragen over dynamische energiecontracten
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        {faqItems.map((item, index) => {
          const isOpen = openItems.includes(index);
          return (
            <div
              key={index}
              className="border border-gray-200 rounded-xl overflow-hidden hover:border-emerald-300 transition-colors"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left bg-white hover:bg-emerald-50 transition-colors"
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${index}`}
              >
                <span className="font-semibold text-gray-900 pr-4">{item.question}</span>
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              {isOpen && (
                <div
                  id={`faq-answer-${index}`}
                  className="px-6 py-4 bg-emerald-50 border-t border-emerald-100"
                >
                  <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-emerald-50 border border-emerald-200 rounded-xl">
        <p className="text-center text-gray-700">
          <strong>Nog meer vragen?</strong> Bekijk onze <Link href="/" className="text-emerald-600 hover:text-emerald-700 font-semibold underline">energievergelijker</Link> om te zien welk contract het beste bij je past.
        </p>
      </div>
    </section>
  );
}

