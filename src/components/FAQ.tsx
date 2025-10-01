import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  keywords: string[];
}

const faqData: FAQItem[] = [
  {
    question: "Wat is het beste energiecontract voor zonnepanelen eigenaren?",
    answer: "Het beste energiecontract voor zonnepanelen eigenaren heeft een hoge terugleververgoeding en lage terugleverkosten. Dynamische contracten zijn vaak voordeliger omdat je de werkelijke spotmarktprijs krijgt voor je teruggeleverde stroom. Vaste contracten bieden meer zekerheid maar hebben vaak lagere terugleververgoedingen.",
    keywords: ["beste energiecontract zonnepanelen", "terugleververgoeding", "dynamisch contract zonnepanelen"]
  },
  {
    question: "Hoe werkt saldering bij zonnepanelen?",
    answer: "Saldering betekent dat je teruggeleverde stroom wordt verrekend met je verbruikte stroom. Je betaalt alleen energiebelasting over het netto verbruik. Bij een jaarverbruik van 3000 kWh en 2500 kWh teruglevering betaal je energiebelasting over slechts 500 kWh. Dit kan je honderden euro's per jaar besparen.",
    keywords: ["saldering zonnepanelen", "energiebelasting besparen", "teruglevering stroom"]
  },
  {
    question: "Wat zijn de kosten van een warmtepomp per jaar?",
    answer: "Een warmtepomp verbruikt ongeveer 2000-4000 kWh per jaar voor verwarming. Met de huidige energieprijzen kost dit €400-800 per jaar aan stroom. Een warmtepomp is echter veel efficiënter dan gasverwarming en kan je tot €1000 per jaar besparen op je energierekening.",
    keywords: ["warmtepomp kosten", "warmtepomp energieverbruik", "warmtepomp besparing"]
  },
  {
    question: "Is een dynamisch energiecontract voordeliger dan een vast contract?",
    answer: "Dynamische contracten kunnen voordeliger zijn omdat je de werkelijke spotmarktprijzen betaalt. Gemiddeld zijn ze 10-20% goedkoper dan vaste contracten. Voor zonnepanelen eigenaren zijn ze extra interessant omdat je ook de werkelijke prijs krijgt voor je teruggeleverde stroom.",
    keywords: ["dynamisch vs vast contract", "spotmarktprijzen", "energiecontract vergelijking"]
  },
  {
    question: "Wat zijn netbeheerkosten en kan ik deze besparen?",
    answer: "Netbeheerkosten zijn vaste kosten voor het gebruik van het energienetwerk. Deze kosten zijn wettelijk vastgesteld en kun je niet besparen door van leverancier te wisselen. Ze bedragen ongeveer €490 per jaar voor een gemiddeld huishouden. Alleen door minder energie te verbruiken kun je deze kosten verlagen.",
    keywords: ["netbeheerkosten", "energienetwerk kosten", "netbeheerder"]
  },
  {
    question: "Hoeveel kan ik besparen met zonnepanelen en het juiste energiecontract?",
    answer: "Met zonnepanelen en het juiste energiecontract kun je tot €800 per jaar besparen. Dit komt door lagere energiekosten, saldering van energiebelasting, en een goede terugleververgoeding. De besparing hangt af van je zonnepanelen opbrengst, energieverbruik, en gekozen contract.",
    keywords: ["besparen zonnepanelen", "energiecontract besparing", "terugleververgoeding"]
  },
  {
    question: "Wat is energiebelasting en hoe wordt dit berekend?",
    answer: "Energiebelasting is een belasting op elektriciteit en gas. Voor stroom bedraagt dit €0,1088 per kWh (exclusief BTW). Met 21% BTW wordt dit €0,1316 per kWh. Je betaalt energiebelasting over je netto verbruik na saldering. Dit kan je honderden euro's per jaar kosten.",
    keywords: ["energiebelasting", "energiebelasting berekening", "BTW energie"]
  },
  {
    question: "Welke energieleveranciers bieden de beste contracten voor zonnepanelen?",
    answer: "De beste energieleveranciers voor zonnepanelen eigenaren bieden hoge terugleververgoedingen en lage terugleverkosten. Dit zijn vaak kleinere, duurzame leveranciers zoals Vandebron, Pure Energie, of Frank Energie. Grote leveranciers hebben vaak lagere terugleververgoedingen maar meer zekerheid.",
    keywords: ["beste energieleveranciers zonnepanelen", "terugleververgoeding vergelijking", "duurzame energieleveranciers"]
  }
];

export function FAQ() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  // FAQPage Schema voor AI indexing
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqData.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };

  return (
    <>
      {/* FAQ Schema voor AI */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full text-sm font-bold mb-6 shadow-lg">
            <span>❓</span>
            <span>Veelgestelde Vragen</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Veelgestelde Vragen over
            <span className="animated-gradient bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {" "}Energiecontracten
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Vind antwoorden op de meest gestelde vragen over energiecontracten, zonnepanelen, en besparen op je energierekening.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {faqData.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">
                    {item.question}
                  </h3>
                  {openItems.includes(index) ? (
                    <ChevronUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  )}
                </button>
                
                {openItems.includes(index) && (
                  <div className="px-8 pb-6">
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-gray-700 leading-relaxed mb-4">
                        {item.answer}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {item.keywords.map((keyword, keywordIndex) => (
                          <span
                            key={keywordIndex}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 border border-green-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Nog meer vragen?
            </h3>
            <p className="text-gray-600 mb-6">
              Gebruik onze gratis energievergelijker om direct te zien welk contract het beste bij jouw situatie past.
            </p>
            <button className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white py-4 px-8 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
              Start Gratis Vergelijking
            </button>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
