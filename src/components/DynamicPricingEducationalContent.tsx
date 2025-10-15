'use client';

import React from 'react';
import { Wind, Sun, TrendingUp, Shield } from 'lucide-react';

export function DynamicPricingEducationalContent() {
  return (
    <div className="space-y-8 mb-8">
      {/* Waarom fluctueren energieprijzen? */}
      <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100" aria-labelledby="fluctuation-heading">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-8 h-8 text-emerald-600" />
          <h2 id="fluctuation-heading" className="text-2xl font-bold text-gray-900">Waarom fluctueren energieprijzen?</h2>
        </div>
        <div className="prose max-w-none text-gray-700">
          <p className="mb-4">
            De prijs van elektriciteit op de spotmarkt wordt elk uur opnieuw bepaald door vraag en aanbod op de EPEX (European Power Exchange). 
            Dit is vergelijkbaar met de manier waarop de prijzen van aandelen op de beurs veranderen. Wanneer veel mensen tegelijk stroom 
            gebruiken (bijvoorbeeld op een koude winteravond), stijgt de vraag en dus de prijs. Wanneer er weinig vraag is (zoals &#39;s nachts) 
            of veel aanbod (zonnige dagen met veel zonne-energie), daalt de prijs.
          </p>
          <p className="mb-4">
            Enkele factoren die de prijs beïnvloeden:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>Tijd van de dag:</strong> Piekuren (ochtend en avond) zijn duurder dan daluren (nacht)</li>
            <li><strong>Seizoen:</strong> Winter is duurder door verwarming, zomer goedkoper door meer zon</li>
            <li><strong>Weer:</strong> Zon en wind verhogen het aanbod en verlagen de prijs</li>
            <li><strong>Economische activiteit:</strong> Werkdagen zijn duurder dan weekenden</li>
            <li><strong>Internationale markt:</strong> Prijzen in buurlanden beïnvloeden Nederlandse prijzen</li>
          </ul>
          <p>
            Deze dynamiek maakt het mogelijk om te besparen door slim te verbruiken: laad je elektrische auto &#39;s nachts op, 
            draai je wasmachine in het weekend, en vermijd grootverbruikers tijdens piekuren. Met een dynamisch contract profiteer 
            je direct van deze prijsverschillen.
          </p>
        </div>
      </section>

      {/* De invloed van zon en wind */}
      <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100" aria-labelledby="renewable-heading">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex gap-2">
            <Sun className="w-8 h-8 text-yellow-500" />
            <Wind className="w-8 h-8 text-blue-500" />
          </div>
          <h2 id="renewable-heading" className="text-2xl font-bold text-gray-900">De invloed van zon en wind op prijzen</h2>
        </div>
        <div className="prose max-w-none text-gray-700">
          <p className="mb-4">
            Duurzame energiebronnen zoals zon en wind hebben een revolutionair effect op energieprijzen. In tegenstelling tot 
            traditionele centrales die constante brandstofkosten hebben, produceren zonnepanelen en windmolens elektriciteit 
            zonder brandstofkosten zodra ze eenmaal geïnstalleerd zijn. Dit leidt tot interessante prijseffecten:
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5">
              <h3 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
                <Sun className="w-5 h-5" />
                Zonne-energie Effect
              </h3>
              <ul className="space-y-2 text-sm text-yellow-900">
                <li>• Zonnige middagen: prijzen kunnen zakken tot €0,03-0,05/kWh</li>
                <li>• Voorjaar/zomer: 30-40% lagere gemiddelde prijzen</li>
                <li>• Piek productie rond 12:00-14:00 uur</li>
                <li>• Zonnige weekenden: vaak negatieve prijzen</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
              <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                <Wind className="w-5 h-5" />
                Wind-energie Effect
              </h3>
              <ul className="space-y-2 text-sm text-blue-900">
                <li>• Winderige dagen: stabiel lage prijzen hele dag</li>
                <li>• Herfst/winter: meer wind, lagere prijzen dan verwacht</li>
                <li>• 24/7 productie mogelijk (ook &#39;s nachts)</li>
                <li>• Combinatie zon + wind: hoogste prijsdalingen</li>
              </ul>
            </div>
          </div>

          <p className="mb-4">
            <strong>Negatieve prijzen:</strong> Op dagen met extreem veel duurzame energie en weinig vraag kunnen prijzen zelfs 
            negatief worden. Dit gebeurt 20-40 uur per jaar. Je krijgt dan letterlijk geld toe om stroom te verbruiken! Dit is het 
            perfecte moment voor energie-intensieve activiteiten zoals EV laden, warmtepomp draaien, of het verwarmen van je boiler.
          </p>
          
          <p>
            Met de groeiende capaciteit aan zonne- en windenergie in Nederland (van 15 GW in 2020 naar verwachte 35 GW in 2030) 
            zullen deze prijsdalingen steeds vaker voorkomen. Dit maakt dynamische contracten alleen maar aantrekkelijker voor 
            consumenten die hier slim op kunnen inspelen.
          </p>
        </div>
      </section>

      {/* Slim energie verbruiken */}
      <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100" aria-labelledby="smart-usage-heading">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-8 h-8 text-emerald-600" />
          <h2 id="smart-usage-heading" className="text-2xl font-bold text-gray-900">Slim energie verbruiken: praktische tips</h2>
        </div>
        <div className="prose max-w-none text-gray-700">
          <p className="mb-4">
            Om optimaal te profiteren van dynamische prijzen is het belangrijk je energieverbruik actief te sturen. 
            Hier zijn concrete tips om je energiekosten te minimaliseren:
          </p>

          <div className="space-y-4">
            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4">
              <h3 className="font-bold text-emerald-900 mb-2">🔋 Elektrische Auto Laden</h3>
              <p className="text-emerald-800 mb-2">
                De grootste besparingskans voor EV-eigenaren. Gemiddeld verbruik: 2.500-3.500 kWh/jaar.
              </p>
              <ul className="text-sm text-emerald-800 space-y-1">
                <li>• Programmeer je laadpaal voor 23:00-07:00 uur (daluren)</li>
                <li>• Gebruik een slimme laadpaal die stopt bij prijzen boven €0,15/kWh</li>
                <li>• Besparing: €200-400/jaar t.o.v. laden tijdens piekuren</li>
                <li>• Apps: ANWB Energie, Mijn Frank, Tibber</li>
              </ul>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <h3 className="font-bold text-blue-900 mb-2">🏠 Warmtepomp Optimalisatie</h3>
              <p className="text-blue-800 mb-2">
                Warmtepompen verbruiken veel stroom maar zijn zeer flexibel in te zetten.
              </p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Gebruik een slimme thermostaat (Toon, Nest, Homey)</li>
                <li>• Verwarm je huis vóór de avondpiek (14:00-17:00)</li>
                <li>• Gebruik nachttarieven voor boiler-verwarming</li>
                <li>• Profiteer van negatieve prijzen om extra te verwarmen</li>
                <li>• Besparing: €100-250/jaar met slim schema</li>
              </ul>
            </div>

            <div className="bg-purple-50 border-l-4 border-purple-500 p-4">
              <h3 className="font-bold text-purple-900 mb-2">🔆 Huishoudelijke Apparaten</h3>
              <p className="text-purple-800 mb-2">
                Wasmachine, droger en vaatwasser zijn eenvoudig te verschuiven naar goedkope uren.
              </p>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Draai wasmachine/droger tussen 00:00-06:00 of in weekend-middagen</li>
                <li>• Gebruik timerfunctie om automatisch te starten</li>
                <li>• Vaatwasser: draai volledig gevuld tijdens daluren</li>
                <li>• Stofzuigen, strijken: vermijd 17:00-21:00</li>
                <li>• Besparing: €50-100/jaar voor gemiddeld gezin</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <h3 className="font-bold text-yellow-900 mb-2">☀️ Zonnepanelen Optimalisatie</h3>
              <p className="text-yellow-800 mb-2">
                Maximaliseer de waarde van je teruggeleverde stroom met dynamische prijzen.
              </p>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Teruglevering heeft hogere waarde tijdens piekuren (vaak middagpiek)</li>
                <li>• Vermijd eigen verbruik tijdens zonnige middagen als prijzen laag zijn</li>
                <li>• Verschuif verbruik naar avond als je zonnepanelen niets opwekken</li>
                <li>• Overweeg batterij voor opslag (ROI verbetert met dynamische prijzen)</li>
                <li>• Extra opbrengst: €100-200/jaar t.o.v. vast contract</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-5">
            <h3 className="font-bold text-emerald-900 mb-3">🎯 Samengevat: De Perfecte Dag</h3>
            <div className="space-y-2 text-sm text-emerald-800">
              <p><strong>00:00-06:00:</strong> EV laden, wasmachine/droger, boiler verwarmen</p>
              <p><strong>06:00-09:00:</strong> Vermijd grootverbruikers (duur!)</p>
              <p><strong>09:00-16:00:</strong> Redelijke prijzen, goed voor normaal gebruik</p>
              <p><strong>16:00-21:00:</strong> Duurste uren - minimaliseer verbruik</p>
              <p><strong>21:00-00:00:</strong> Prijzen dalen weer, geschikt voor laatste was</p>
            </div>
          </div>
        </div>
      </section>

      {/* Risico's en hoe je deze beperkt */}
      <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100" aria-labelledby="risks-heading">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-8 h-8 text-blue-600" />
          <h2 id="risks-heading" className="text-2xl font-bold text-gray-900">Risico&apos;s en hoe je deze beperkt</h2>
        </div>
        <div className="prose max-w-none text-gray-700">
          <p className="mb-4">
            Hoewel dynamische prijzen gemiddeld voordeliger zijn, brengen ze wel risico&#39;s met zich mee. 
            Hier lees je welke risico&#39;s er zijn en hoe je deze kunt minimaliseren:
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-red-900 mb-3">⚠️ Risico&#39;s</h3>
              <div className="space-y-3">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 mb-1">Prijspieken</h4>
                  <p className="text-sm text-red-800">
                    Extreme prijzen tijdens koude dagen of energiecrises. In 2022 piekte de prijs tot €0,70/kWh tijdens enkele uren.
                  </p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 mb-1">Onvoorspelbaarheid</h4>
                  <p className="text-sm text-red-800">
                    Je energierekening varieert per maand. Budgetteren is lastiger dan met een vast contract.
                  </p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 mb-1">Gedragsverandering</h4>
                  <p className="text-sm text-red-800">
                    Zonder actieve aanpassing van je verbruik mis je de voordelen en kun je zelfs duurder uit zijn.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-green-900 mb-3">✅ Hoe te Beperken</h3>
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-1">Prijslimieten Instellen</h4>
                  <p className="text-sm text-green-800">
                    Veel slimme apparaten laten je een maximale prijs instellen. Laad je EV bijvoorbeeld alleen onder €0,18/kWh.
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-1">Buffer Aanhouden</h4>
                  <p className="text-sm text-green-800">
                    Houd een financiële buffer van €50-100 voor dure maanden. Gemiddeld blijf je alsnog goedkoper uit.
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-1">Hybride Strategie</h4>
                  <p className="text-sm text-green-800">
                    Sommige leveranciers bieden prijsplafonds aan. Je profiteert van lage prijzen maar bent beschermd tegen extreme pieken.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-5">
          <p className="text-blue-900">
            <strong>💡 Tip:</strong> Start met een kort contract (3-6 maanden) om te ervaren of dynamische prijzen bij je passen. 
            Monitor je eerste maand actief en pas je gedrag aan. Met slim verbruik kun je onder de gemiddelde vaste prijs van €0,25/kWh komen.
          </p>
          </div>
        </div>
      </section>
    </div>
  );
}

