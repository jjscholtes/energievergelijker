import { CheckCircle, ArrowRight } from 'lucide-react';

interface Step {
  name: string;
  text: string;
  url?: string;
}

const howToSteps: Step[] = [
  {
    name: "Vul je energieprofiel in",
    text: "Geef je jaarlijkse verbruik, zonnepanelen opbrengst, en eventuele warmtepomp of elektrische auto door.",
    url: "https://besteenergiecontract.nl/#calculator"
  },
  {
    name: "Kies je netbeheerder",
    text: "Selecteer je netbeheerder op basis van je postcode voor accurate netbeheerkosten berekening.",
    url: "https://besteenergiecontract.nl/#calculator"
  },
  {
    name: "Vergelijk contracten",
    text: "Bekijk de vergelijking tussen vaste en dynamische contracten met alle kosten en besparingen.",
    url: "https://besteenergiecontract.nl/#results"
  },
  {
    name: "Kies het beste contract",
    text: "Selecteer het contract dat het beste bij jouw situatie past en bespaar tot €800 per jaar.",
    url: "https://besteenergiecontract.nl/#comparison"
  }
];

export function HowToGuide() {
  // HowTo Schema voor AI indexing
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "Hoe vind je het beste energiecontract voor zonnepanelen eigenaren",
    "description": "Stap-voor-stap gids om het beste energiecontract te vinden voor zonnepanelen eigenaren met accurate salderingsberekeningen.",
    "image": "https://besteenergiecontract.nl/images/energiecontract-vergelijking.jpg",
    "totalTime": "PT5M",
    "estimatedCost": {
      "@type": "MonetaryAmount",
      "currency": "EUR",
      "value": "0"
    },
    "supply": [
      {
        "@type": "HowToSupply",
        "name": "Energieverbruik gegevens"
      },
      {
        "@type": "HowToSupply", 
        "name": "Zonnepanelen opbrengst informatie"
      },
      {
        "@type": "HowToSupply",
        "name": "Postcode voor netbeheerder"
      }
    ],
    "tool": [
      {
        "@type": "HowToTool",
        "name": "Beste Energiecontract Vergelijker"
      }
    ],
    "step": howToSteps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.text,
      "url": step.url
    }))
  };

  return (
    <>
      {/* HowTo Schema voor AI */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <section className="py-20 bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-full text-sm font-bold mb-6 shadow-lg">
              <span>📋</span>
              <span>Stappenplan</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Hoe vind je het
              <span className="animated-gradient bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}beste energiecontract
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Volg deze 4 eenvoudige stappen om het perfecte energiecontract te vinden voor jouw zonnepanelen situatie.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {howToSteps.map((step, index) => (
                <div
                  key={index}
                  className="flex items-start gap-6 p-8 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {index + 1}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {step.name}
                    </h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {step.text}
                    </p>
                    {step.url && (
                      <a
                        href={step.url}
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200"
                      >
                        Ga naar stap
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  
                  {index < howToSteps.length - 1 && (
                    <div className="flex-shrink-0 mt-6">
                      <ArrowRight className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 border border-green-200">
              <div className="flex items-center justify-center gap-3 mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <h3 className="text-2xl font-bold text-gray-900">
                  Klaar om te beginnen?
                </h3>
              </div>
              <p className="text-gray-600 mb-6">
                Start direct met onze gratis energievergelijker en vind het beste contract voor jouw situatie.
              </p>
              <button className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 hover:from-green-700 hover:via-blue-700 hover:to-purple-700 text-white py-4 px-8 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
                Start Gratis Vergelijking
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
