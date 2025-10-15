'use client';

import { BerekeningResult } from '@/types/calculations';

interface DetailedComparisonProps {
  results: BerekeningResult[];
  dynamicResults: BerekeningResult[];
}

export const DetailedComparison: React.FC<DetailedComparisonProps> = ({ results, dynamicResults }) => {
  if (results.length === 0 && dynamicResults.length === 0) {
    return null;
  }

  // Vind de goedkoopste contracten
  const cheapestFixed = results.length > 0 ? results.reduce((cheapest, current) => 
    current.totaleJaarkostenMetPv < cheapest.totaleJaarkostenMetPv ? current : cheapest
  ) : null;

  const cheapestDynamic = dynamicResults.length > 0 ? dynamicResults.reduce((cheapest, current) => 
    current.totaleJaarkostenMetPv < cheapest.totaleJaarkostenMetPv ? current : cheapest
  ) : null;

  // Bepaal welke goedkoper is
  const isDynamicCheaper = cheapestFixed && cheapestDynamic ? 
    cheapestDynamic.totaleJaarkostenMetPv < cheapestFixed.totaleJaarkostenMetPv : 
    cheapestDynamic !== null;

  const hasPV = cheapestFixed?.pvOpbrengsten || cheapestDynamic?.pvOpbrengsten;

  return (
    <div className="space-y-6">
      {/* Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
        <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
          💡 Wat betekent dit voor jou?
        </h4>
        
        <div className="space-y-3 text-sm">
          {isDynamicCheaper ? (
            <>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>Dynamisch is goedkoper</strong> omdat je profiteert van lagere spotprijzen en hogere terugleververgoeding</span>
              </div>
              {hasPV && cheapestDynamic?.pvOpbrengsten && cheapestFixed?.pvOpbrengsten && cheapestDynamic.pvOpbrengsten.totaleOpbrengst > cheapestFixed.pvOpbrengsten.totaleOpbrengst && (
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span><strong>Zonnepanelen</strong> leveren meer op bij dynamische contracten (spotprijs vs €0.01/kWh)</span>
                </div>
              )}
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">ℹ</span>
                <span><strong>Risico:</strong> Prijzen kunnen stijgen bij hoge vraag of koude winters</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <span><strong>Vast is goedkoper</strong> omdat je beschermd bent tegen prijsstijgingen</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>Voorspelbaarheid:</strong> Je weet precies wat je betaalt, ongeacht marktontwikkelingen</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">ℹ</span>
                <span><strong>Kans:</strong> Je mist mogelijk lagere prijzen bij gunstige marktomstandigheden</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Vast Contract Details */}
        {cheapestFixed && (
          <div className={`rounded-xl p-6 shadow-lg ${!isDynamicCheaper ? 'bg-green-50 border-2 border-green-500' : 'bg-white'}`}>
            <div className="flex items-center gap-3 mb-4">
              <h4 className="font-bold text-lg text-gray-900">Vast Contract Details</h4>
              {!isDynamicCheaper && (
                <span className="px-3 py-1 bg-green-500 text-white text-sm rounded-full font-bold">GOEDKOOPST</span>
              )}
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Kale energie stroom:</span>
                <span>€{cheapestFixed.stroomKosten.kaleEnergie.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Energiebelasting (incl. BTW):</span>
                <span>€{cheapestFixed.stroomKosten.energiebelasting.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Netbeheerkosten:</span>
                <span>€{cheapestFixed.stroomKosten.netbeheer.toFixed(0)}</span>
              </div>
              {cheapestFixed.stroomKosten.vasteLeveringskosten && cheapestFixed.stroomKosten.vasteLeveringskosten > 0 && (
                <div className="flex justify-between">
                  <span>Vaste leveringskosten:</span>
                  <span>€{cheapestFixed.stroomKosten.vasteLeveringskosten.toFixed(0)} (€{cheapestFixed.stroomKosten.vasteLeveringskostenTarief?.toFixed(2) || '8.99'}/maand)</span>
                </div>
              )}
              <div className="flex justify-between text-green-600">
                <span>Vermindering energiebelasting:</span>
                <span>-€631.35</span>
              </div>
              {cheapestFixed.gasKosten.totaal > 0 && (
                <>
                  <div className="flex justify-between">
                    <span>Kale energie gas:</span>
                    <span>€{cheapestFixed.gasKosten.kaleEnergie.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Energiebelasting gas:</span>
                    <span>€{cheapestFixed.gasKosten.energiebelasting.toFixed(0)}</span>
                  </div>
                </>
              )}
              {cheapestFixed.pvOpbrengsten && (
                <>
                  <div className="flex justify-between text-green-600">
                    <span>PV opbrengsten:</span>
                    <span>-€{cheapestFixed.pvOpbrengsten.totaleOpbrengst.toFixed(0)}</span>
                  </div>
                  {cheapestFixed.pvOpbrengsten.terugleverkosten > 0 && (
                    <div className="flex justify-between">
                      <span>Terugleverkosten:</span>
                      <span>€{cheapestFixed.pvOpbrengsten.terugleverkosten.toFixed(0)}</span>
                    </div>
                  )}
                </>
              )}
              <div className="flex justify-between border-t pt-3 font-bold text-lg">
                <span>Totaal:</span>
                <span>€{cheapestFixed.totaleJaarkostenMetPv.toFixed(0)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Dynamisch Contract Details */}
        {cheapestDynamic && (
          <div className={`rounded-xl p-6 shadow-lg ${isDynamicCheaper ? 'bg-blue-50 border-2 border-blue-500' : 'bg-white'}`}>
            <div className="flex items-center gap-3 mb-4">
              <h4 className="font-bold text-lg text-gray-900">Dynamisch Contract</h4>
              {isDynamicCheaper && (
                <span className="px-3 py-1 bg-blue-500 text-white text-sm rounded-full font-bold">GOEDKOOPST</span>
              )}
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Spotmarkt energie:</span>
                <span>€{cheapestDynamic.stroomKosten.kaleEnergie.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Energiebelasting (incl. BTW):</span>
                <span>€{cheapestDynamic.stroomKosten.energiebelasting.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Netbeheerkosten:</span>
                <span>€{cheapestDynamic.stroomKosten.netbeheer.toFixed(0)}</span>
              </div>
              {cheapestDynamic.stroomKosten.maandelijkseVergoeding && cheapestDynamic.stroomKosten.maandelijkseVergoeding > 0 && (
                <div className="flex justify-between">
                  <span>Maandelijkse vergoeding:</span>
                  <span>€{cheapestDynamic.stroomKosten.maandelijkseVergoeding.toFixed(0)} (€{cheapestDynamic.stroomKosten.maandelijkseVergoedingTarief?.toFixed(2) || '5.99'}/maand)</span>
                </div>
              )}
              {cheapestDynamic.stroomKosten.opslagPerKwh && cheapestDynamic.stroomKosten.opslagPerKwh > 0 && (
                <div className="flex justify-between">
                  <span>Opslag afname per kWh:</span>
                  <span>€{cheapestDynamic.stroomKosten.opslagPerKwh.toFixed(0)} (€{cheapestDynamic.stroomKosten.opslagPerKwhTarief?.toFixed(3) || '0.020'}/kWh)</span>
                </div>
              )}
              {cheapestDynamic.contract.type === 'dynamisch' && cheapestDynamic.contract.opslagInvoeding && cheapestDynamic.contract.opslagInvoeding > 0 && (
                <div className="flex justify-between">
                  <span>Opslag invoeding per kWh:</span>
                  <span>€{cheapestDynamic.contract.opslagInvoeding.toFixed(3)}/kWh</span>
                </div>
              )}
              <div className="flex justify-between text-green-600">
                <span>Vermindering energiebelasting:</span>
                <span>-€631.35</span>
              </div>
              {cheapestDynamic.gasKosten.totaal > 0 && (
                <>
                  <div className="flex justify-between">
                    <span>Gas kosten:</span>
                    <span>€{cheapestDynamic.gasKosten.totaal.toFixed(0)}</span>
                  </div>
                </>
              )}
              {cheapestDynamic.pvOpbrengsten && (
                <div className="flex justify-between text-green-600">
                  <span>PV opbrengsten:</span>
                  <span>-€{cheapestDynamic.pvOpbrengsten.totaleOpbrengst.toFixed(0)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-3 font-bold text-lg">
                <span>Totaal:</span>
                <span className="text-blue-600">€{cheapestDynamic.totaleJaarkostenMetPv.toFixed(0)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Explanation */}
      <div className="bg-white rounded-xl p-8 shadow-lg border-l-4 border-blue-500">
        <h4 className="font-bold text-blue-900 mb-4 text-lg">
          💡 {isDynamicCheaper ? 'Waarom is het dynamische contract goedkoper?' : 'Waarom is het vaste contract goedkoper?'}
        </h4>
        <div className="space-y-4 text-blue-800">
          {isDynamicCheaper ? (
            <>
              <p>
                <strong>Spotmarktprijzen:</strong> Dynamische contracten volgen de werkelijke marktprijzen per uur. 
                Dit betekent dat je profiteert van goedkope nachttarieven en weekendprijzen.
              </p>
              <p>
                <strong>Hogere terugleververgoeding:</strong> Bij dynamische contracten krijg je de spotprijs terug 
                voor je teruggeleverde stroom, wat veel meer oplevert dan de vaste €0.01/kWh bij vaste contracten.
              </p>
              <p>
                <strong>Flexibiliteit:</strong> Als je slim bent met je energieverbruik (bijvoorbeeld &apos;s nachts 
                of in het weekend), kun je flink besparen op je energierekening.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <p className="text-yellow-800">
                  <strong>Let op:</strong> Dynamische contracten zijn vooral voordelig met zonnepanelen (hoge terugleververgoeding) 
                  en als je flexibel bent met je verbruik. Zonder zonnepanelen kan een vast contract goedkoper zijn.
                </p>
              </div>
            </>
          ) : (
            <>
              <p>
                <strong>Prijszekerheid:</strong> Vaste contracten bieden prijszekerheid voor de hele contractperiode. 
                Je weet precies wat je betaalt, ongeacht marktontwikkelingen.
              </p>
              <p>
                <strong>Bescherming tegen stijgingen:</strong> Als de energieprijzen stijgen, blijft jouw tarief 
                ongewijzigd. Dit beschermt je tegen onverwachte kostenstijgingen.
              </p>
              <p>
                <strong>Voorspelbaarheid:</strong> Je kunt je budget beter plannen omdat je energiekosten 
                vooraf bekend zijn.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <p className="text-yellow-800">
                  <strong>Let op:</strong> Vaste contracten kunnen duurder zijn als de marktprijzen dalen. 
                  Je mist dan de voordelen van lagere spotprijzen.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
