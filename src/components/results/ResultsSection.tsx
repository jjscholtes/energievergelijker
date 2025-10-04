'use client';

import { useCalculationStore } from '@/stores/calculationStore';
import { ResultCard } from './ResultCard';
import { PVBreakdownChart } from './PVBreakdownChart';

export function ResultsSection() {
  const { results, dynamicResults, isLoading, error } = useCalculationStore();

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Berekenen van de beste contracten...</p>
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-green-800">
              💡 <strong>Tip:</strong> We vergelijken alle beschikbare contracten en berekenen je exacte besparing!
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="text-center text-red-600">
          <p>Er is een fout opgetreden: {error}</p>
        </div>
      </div>
    );
  }

  if (results.length === 0 && dynamicResults.length === 0) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="text-center text-muted-foreground">
          <p>Vul je gegevens in om contracten te vergelijken</p>
        </div>
      </div>
    );
  }

  const top3Results = results.slice(0, 3);
  const top3DynamicResults = dynamicResults.slice(0, 3);
  const hasPV = results[0]?.pvOpbrengsten;
  
  // Check if dynamic contracts are cheaper
  const cheapestFixed = results[0];
  const cheapestDynamic = dynamicResults[0];
  const isDynamicCheaper = cheapestFixed && cheapestDynamic && 
    cheapestDynamic.totaleJaarkostenMetPv < cheapestFixed.totaleJaarkostenMetPv;
  
  const savings = cheapestFixed && cheapestDynamic ? 
    cheapestFixed.totaleJaarkostenMetPv - cheapestDynamic.totaleJaarkostenMetPv : 0;


  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-8">
      {/* Success Message */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="text-green-600 text-4xl mb-2">🎉</div>
        <h2 className="text-xl font-bold text-green-800 mb-2">Vergelijking Voltooid!</h2>
        <p className="text-green-700">
          We hebben {results.length + dynamicResults.length} energiecontracten voor je vergeleken. 
          Hieronder vind je de beste opties voor jouw situatie.
        </p>
      </div>

      {/* Contract Comparison Alert */}
      {cheapestFixed && cheapestDynamic && (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200 rounded-xl p-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="text-4xl">⚡</div>
            <div>
              <h3 className="text-2xl font-bold text-blue-800">
                {isDynamicCheaper ? 'Dynamische Contracten zijn Goedkoper!' : 'Vaste Contracten zijn Goedkoper!'}
              </h3>
              <p className="text-blue-700 text-lg">
                {isDynamicCheaper 
                  ? `Je kunt €${savings.toFixed(0)} per jaar besparen met een dynamisch contract`
                  : `Je kunt €${Math.abs(savings).toFixed(0)} per jaar besparen met een vast contract`
                }
              </p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-gray-600">Goedkoopste Vast Contract</div>
                <div className="text-xl font-bold text-gray-800">€{cheapestFixed?.totaleJaarkostenMetPv.toFixed(0)}</div>
                <div className="text-gray-600">{cheapestFixed?.contract.leverancier}</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-600">Goedkoopste Dynamisch Contract</div>
                <div className="text-xl font-bold text-blue-600">€{cheapestDynamic?.totaleJaarkostenMetPv.toFixed(0)}</div>
                <div className="text-gray-600">{cheapestDynamic?.contract.leverancier}</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              const detailedSection = document.getElementById('detailed-comparison');
              if (detailedSection) {
                detailedSection.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start'
                });
              }
            }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-5 rounded-xl font-bold text-xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📊</span>
              <div className="text-left">
                <div>Bekijk Gedetailleerde Vergelijking</div>
                <div className="text-sm font-normal opacity-90">
                  {isDynamicCheaper 
                    ? `Ontdek waarom je €${savings.toFixed(0)} bespaart`
                    : `Ontdek waarom je €${Math.abs(savings).toFixed(0)} bespaart`
                  }
                </div>
              </div>
            </div>
          </button>
          
          <p className="text-sm text-gray-600 mt-3">
            Ontdek waarom het dynamische contract goedkoper is en wat de voor- en nadelen zijn
          </p>
        </div>
      )}

      {/* Top 3 Vaste Contracten */}
      {results.length > 0 && (
        <div>
          {/* Vaste Contracten Banner */}
          <div className={`rounded-xl p-4 shadow-lg border-2 mb-6 ${!isDynamicCheaper ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-500' : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300'}`}>
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${!isDynamicCheaper ? 'bg-green-500' : 'bg-gray-400'}`}>
                <span className="text-white text-lg font-bold">🔒</span>
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${!isDynamicCheaper ? 'text-green-800' : 'text-gray-700'}`}>
                  Beste Vaste Energiecontracten
                </h2>
                <p className={`text-sm ${!isDynamicCheaper ? 'text-green-600' : 'text-gray-600'}`}>
                  {!isDynamicCheaper 
                    ? '🏆 Deze contracten zijn het goedkoopst voor jouw situatie!'
                    : 'Voorspelbare kosten en vaste tarieven'
                  }
                </p>
              </div>
              {!isDynamicCheaper && (
                <div className="ml-auto">
                  <span className="px-3 py-1 bg-green-500 text-white text-sm rounded-full font-bold">
                    GOEDKOOPST
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {top3Results.map((result, index) => (
              <ResultCard key={result.contract.leverancier} result={result} rank={index + 1} />
            ))}
          </div>
        </div>
      )}

      {/* Top 3 Dynamische Contracten */}
      {dynamicResults.length > 0 && (
        <div>
          {/* Dynamische Contracten Banner */}
          <div className={`rounded-xl p-4 shadow-lg border-2 mb-6 ${isDynamicCheaper ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-500' : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300'}`}>
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDynamicCheaper ? 'bg-blue-500' : 'bg-gray-400'}`}>
                <span className="text-white text-lg font-bold">⚡</span>
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${isDynamicCheaper ? 'text-blue-800' : 'text-gray-700'}`}>
                  Beste Dynamische Energiecontracten
                </h2>
                <p className={`text-sm ${isDynamicCheaper ? 'text-blue-600' : 'text-gray-600'}`}>
                  {isDynamicCheaper 
                    ? '🏆 Deze contracten zijn het goedkoopst voor jouw situatie!'
                    : 'Flexibele tarieven gebaseerd op spotmarktprijzen'
                  }
                </p>
              </div>
              {isDynamicCheaper && (
                <div className="ml-auto">
                  <span className="px-3 py-1 bg-blue-500 text-white text-sm rounded-full font-bold">
                    GOEDKOOPST
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {top3DynamicResults.map((result, index) => (
              <ResultCard key={`dynamic-${result.contract.leverancier}`} result={result} rank={index + 1} />
            ))}
          </div>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Dynamische contracten</strong> volgen de spotmarktprijzen en kunnen voordelig zijn 
              als je flexibel bent met je energieverbruik. Warmtepomp en EV verbruik zijn meegenomen in de berekening.
            </p>
          </div>
        </div>
      )}

      {/* Detailed Comparison Section - MOVED HERE */}
      {cheapestFixed && cheapestDynamic && (
        <div id="detailed-comparison" className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border-2 border-blue-200">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Gedetailleerde Kostenvergelijking</h2>
            <p className="text-lg text-gray-600">
              {isDynamicCheaper 
                ? `Ontdek waarom het dynamische contract ${((savings / cheapestFixed.totaleJaarkostenMetPv) * 100).toFixed(1)}% goedkoper is`
                : `Ontdek waarom het vaste contract ${((Math.abs(savings) / cheapestDynamic.totaleJaarkostenMetPv) * 100).toFixed(1)}% goedkoper is`
              }
            </p>
          </div>

          {/* Savings Highlight */}
          <div className="bg-white rounded-xl p-6 mb-8 shadow-lg">
            <div className="text-center">
              <div className="text-5xl font-bold text-green-600 mb-2">
                €{Math.abs(savings).toFixed(0)} besparing per jaar
              </div>
              <div className="text-xl text-green-700">
                Dat is €{(Math.abs(savings) / 12).toFixed(0)} per maand!
              </div>
            </div>
          </div>

          {/* Contract Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Fixed Contract */}
            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">Vast Contract</span>
                  <span className="font-bold text-lg">{cheapestFixed.contract.leverancier}</span>
                </div>
                <p className="text-sm text-gray-600">{cheapestFixed.contract.productNaam}</p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Jaarlijkse kosten:</span>
                  <span className="font-bold text-xl">€{cheapestFixed.totaleJaarkostenMetPv.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Maandlasten:</span>
                  <span className="font-medium">€{cheapestFixed.maandlastenGemiddeld.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Stroom tarief:</span>
                  <span className="font-medium">€{((cheapestFixed.stroomKosten.kaleEnergie + cheapestFixed.stroomKosten.energiebelasting) / (cheapestFixed.userProfile?.jaarverbruikStroom || 2900)).toFixed(3)}/kWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gas tarief:</span>
                  <span className="font-medium">€{(cheapestFixed.gasKosten.kaleEnergie / (cheapestFixed.userProfile?.jaarverbruikGas || 1200)).toFixed(3)}/m³</span>
                </div>
                {hasPV && cheapestFixed.pvOpbrengsten && (
                  <div className="flex justify-between text-green-600">
                    <span>PV opbrengst:</span>
                    <span>-€{cheapestFixed.pvOpbrengsten.totaleOpbrengst.toFixed(0)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Dynamic Contract */}
            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-blue-200">
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">Dynamisch Contract</span>
                  <span className="font-bold text-lg">{cheapestDynamic.contract.leverancier}</span>
                </div>
                <p className="text-sm text-gray-600">{cheapestDynamic.contract.productNaam}</p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Jaarlijkse kosten:</span>
                  <span className="font-bold text-xl text-blue-600">€{cheapestDynamic.totaleJaarkostenMetPv.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Maandlasten:</span>
                  <span className="font-medium text-blue-600">€{cheapestDynamic.maandlastenGemiddeld.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Stroom tarief:</span>
                  <span className="font-medium text-blue-600">€{((cheapestDynamic.stroomKosten.kaleEnergie + cheapestDynamic.stroomKosten.energiebelasting) / (cheapestDynamic.userProfile?.jaarverbruikStroom || 2900)).toFixed(3)}/kWh gemiddeld</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gas tarief:</span>
                  <span className="font-medium text-gray-400">-</span>
                </div>
                {hasPV && cheapestDynamic.pvOpbrengsten && (
                  <div className="flex justify-between text-green-600">
                    <span>PV opbrengst:</span>
                    <span>-€{cheapestDynamic.pvOpbrengsten.totaleOpbrengst.toFixed(0)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Key Differences Analysis */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 text-center">Waar zit het verschil?</h3>
            
            {/* Biggest Differences */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border-2 border-yellow-200">
              <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                🔍 Grootste Prijsverschillen
              </h4>
              
              <div className="space-y-4">
                {/* Energieprijs verschil */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-800">⚡ Energieprijs per kWh</span>
                    <span className={`font-bold ${cheapestDynamic.stroomKosten.kaleEnergie < cheapestFixed.stroomKosten.kaleEnergie ? 'text-green-600' : 'text-red-600'}`}>
                      {cheapestDynamic.stroomKosten.kaleEnergie < cheapestFixed.stroomKosten.kaleEnergie ? 'Voordeel' : 'Nadeel'}: €{Math.abs(cheapestDynamic.stroomKosten.kaleEnergie - cheapestFixed.stroomKosten.kaleEnergie).toFixed(0)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Vast:</span>
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>Kale: €{(cheapestFixed.stroomKosten.kaleEnergie / (cheapestFixed.userProfile?.jaarverbruikStroom || 2900)).toFixed(3)}/kWh</div>
                        <div>Belasting: €{(cheapestFixed.stroomKosten.energiebelasting / (cheapestFixed.userProfile?.jaarverbruikStroom || 2900)).toFixed(3)}/kWh</div>
                        <div><strong>Totaal: €{((cheapestFixed.stroomKosten.kaleEnergie + cheapestFixed.stroomKosten.energiebelasting) / (cheapestFixed.userProfile?.jaarverbruikStroom || 2900)).toFixed(3)}/kWh</strong></div>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Dynamisch:</span>
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>Kale: €{(cheapestDynamic.stroomKosten.kaleEnergie / (cheapestDynamic.userProfile?.jaarverbruikStroom || 2900)).toFixed(3)}/kWh</div>
                        <div>Belasting: €{(cheapestDynamic.stroomKosten.energiebelasting / (cheapestDynamic.userProfile?.jaarverbruikStroom || 2900)).toFixed(3)}/kWh</div>
                        {cheapestDynamic.stroomKosten.opslagPerKwh && cheapestDynamic.stroomKosten.opslagPerKwh > 0 && (
                          <div>Opslag: €{(cheapestDynamic.stroomKosten.opslagPerKwh / (cheapestDynamic.userProfile?.jaarverbruikStroom || 2900)).toFixed(3)}/kWh</div>
                        )}
                        <div><strong>Totaal: €{((cheapestDynamic.stroomKosten.kaleEnergie + cheapestDynamic.stroomKosten.energiebelasting + (cheapestDynamic.stroomKosten.opslagPerKwh || 0)) / (cheapestDynamic.userProfile?.jaarverbruikStroom || 2900)).toFixed(3)}/kWh</strong></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Leverancier kosten verschil */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-800">💰 Vaste Leverancier Kosten</span>
                    <span className={`font-bold ${(cheapestDynamic.stroomKosten.maandelijkseVergoeding || 0) < (cheapestFixed.stroomKosten.vasteLeveringskosten || 0) ? 'text-green-600' : 'text-red-600'}`}>
                      {(cheapestDynamic.stroomKosten.maandelijkseVergoeding || 0) < (cheapestFixed.stroomKosten.vasteLeveringskosten || 0) ? 'Voordeel' : 'Nadeel'}: €{Math.abs((cheapestDynamic.stroomKosten.maandelijkseVergoeding || 0) - (cheapestFixed.stroomKosten.vasteLeveringskosten || 0)).toFixed(0)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Vast:</span>
                      <div className="space-y-1">
                        {cheapestFixed.stroomKosten.vasteLeveringskosten && cheapestFixed.stroomKosten.vasteLeveringskosten > 0 && (
                          <div className="text-xs text-gray-500">
                            Leveringskosten: €{cheapestFixed.stroomKosten.vasteLeveringskosten.toFixed(0)}/jaar
                          </div>
                        )}
                        {(!cheapestFixed.stroomKosten.vasteLeveringskosten || cheapestFixed.stroomKosten.vasteLeveringskosten === 0) && (
                          <div className="text-xs text-gray-400">Geen extra vaste kosten</div>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Dynamisch:</span>
                      <div className="space-y-1">
                        {cheapestDynamic.stroomKosten.maandelijkseVergoeding && cheapestDynamic.stroomKosten.maandelijkseVergoeding > 0 && (
                          <div className="text-xs text-gray-500">
                            Maandelijkse vergoeding: €{cheapestDynamic.stroomKosten.maandelijkseVergoeding.toFixed(0)}/jaar
                          </div>
                        )}
                        {(!cheapestDynamic.stroomKosten.maandelijkseVergoeding || cheapestDynamic.stroomKosten.maandelijkseVergoeding === 0) && (
                          <div className="text-xs text-gray-400">Geen extra vaste kosten</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* PV Opbrengsten verschil */}
                {hasPV && cheapestFixed.pvOpbrengsten && cheapestDynamic.pvOpbrengsten && (
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-800">☀️ PV Opbrengsten</span>
                      <span className={`font-bold ${cheapestDynamic.pvOpbrengsten.totaleOpbrengst > cheapestFixed.pvOpbrengsten.totaleOpbrengst ? 'text-green-600' : 'text-red-600'}`}>
                        {cheapestDynamic.pvOpbrengsten.totaleOpbrengst > cheapestFixed.pvOpbrengsten.totaleOpbrengst ? 'Voordeel' : 'Nadeel'}: €{Math.abs(cheapestDynamic.pvOpbrengsten.totaleOpbrengst - cheapestFixed.pvOpbrengsten.totaleOpbrengst).toFixed(0)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Vast:</span>
                        <span className="font-medium ml-2 text-green-600">€{cheapestFixed.pvOpbrengsten.totaleOpbrengst.toFixed(0)}</span>
                        <div className="text-xs text-gray-500 space-y-1">
                          <div>Terugleververgoeding: €{cheapestFixed.pvOpbrengsten.terugleververgoedingBedrag.toFixed(0)} (€0.01/kWh)</div>
                          <div>Terugleverkosten: €{cheapestFixed.pvOpbrengsten.terugleverkosten.toFixed(0)}/jaar</div>
                          <div>Saldering: €{cheapestFixed.pvOpbrengsten.salderingsBesparing.toFixed(0)}/jaar</div>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Dynamisch:</span>
                        <span className="font-medium ml-2 text-green-600">€{cheapestDynamic.pvOpbrengsten.totaleOpbrengst.toFixed(0)}</span>
                        <div className="text-xs text-gray-500 space-y-1">
                          <div>Terugleververgoeding: €{cheapestDynamic.pvOpbrengsten.terugleververgoedingBedrag.toFixed(0)} (€{(cheapestDynamic.contract.tarieven?.terugleververgoeding || 0).toFixed(3)}/kWh)</div>
                          <div>Terugleverkosten: €0/jaar (geen kosten)</div>
                          <div>Saldering: €{cheapestDynamic.pvOpbrengsten.salderingsBesparing.toFixed(0)}/jaar</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Gas kosten verschil */}
                {!cheapestFixed.userProfile?.jaarverbruikGas || cheapestFixed.userProfile.jaarverbruikGas > 0 ? (
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-800">🔥 Gaskosten</span>
                      <span className={`font-bold ${cheapestDynamic.gasKosten.totaal < cheapestFixed.gasKosten.totaal ? 'text-green-600' : 'text-red-600'}`}>
                        {cheapestDynamic.gasKosten.totaal < cheapestFixed.gasKosten.totaal ? 'Voordeel' : 'Nadeel'}: €{Math.abs(cheapestDynamic.gasKosten.totaal - cheapestFixed.gasKosten.totaal).toFixed(0)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Vast:</span>
                        <span className="font-medium ml-2">€{cheapestFixed.gasKosten.totaal.toFixed(0)}</span>
                        <div className="text-xs text-gray-500">€{(cheapestFixed.gasKosten.kaleEnergie / 1200).toFixed(3)}/m³</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Dynamisch:</span>
                        <span className="font-medium ml-2">€{cheapestDynamic.gasKosten.totaal.toFixed(0)}</span>
                        <div className="text-xs text-gray-500">€0.30/m³ gemiddeld</div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

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
                      <span><strong>Dynamisch is goedkoper</strong> omdat je profiteert van lagere spotprijzen</span>
                    </div>
                    {hasPV && cheapestDynamic.pvOpbrengsten && cheapestFixed.pvOpbrengsten && cheapestDynamic.pvOpbrengsten.totaleOpbrengst > cheapestFixed.pvOpbrengsten.totaleOpbrengst && (
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
                      <span>Opslag per kWh:</span>
                      <span>€{cheapestDynamic.stroomKosten.opslagPerKwh.toFixed(0)} (€{cheapestDynamic.stroomKosten.opslagPerKwhTarief?.toFixed(3) || '0.020'}/kWh)</span>
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
                      <strong>Geen winstmarge:</strong> Leveranciers van dynamische contracten nemen geen grote winstmarge 
                      omdat ze de spotmarktprijzen doorgeven zonder opslag.
                    </p>
                    <p>
                      <strong>Flexibiliteit:</strong> Als je slim bent met je energieverbruik (bijvoorbeeld 's nachts 
                      of in het weekend), kun je flink besparen op je energierekening.
                    </p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                      <p className="text-yellow-800">
                        <strong>Let op:</strong> Dynamische contracten zijn alleen voordelig als je flexibel bent met je verbruik. 
                        Als je altijd op piekmomenten verbruikt, kan een vast contract goedkoper zijn.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <p>
                      <strong>Vaste prijzen:</strong> Vaste contracten bieden prijszekerheid en bescherming tegen 
                      marktvolatiliteit. Je betaalt altijd hetzelfde tarief, ongeacht de marktprijzen.
                    </p>
                    <p>
                      <strong>Geen verrassingen:</strong> Je weet precies wat je maandelijks betaalt, wat helpt 
                      bij budgettering en financiële planning.
                    </p>
                    <p>
                      <strong>Bescherming tegen pieken:</strong> Als de spotmarktprijzen hoog zijn, betaal je 
                      nog steeds je vaste tarief.
                    </p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                      <p className="text-yellow-800">
                        <strong>Let op:</strong> Vaste contracten kunnen duurder zijn als de spotmarktprijzen laag zijn. 
                        Je mist dan de voordelen van goedkope uurtarieven.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PV Breakdown Chart */}
      {hasPV && (
        <PVBreakdownChart pvData={results[0].pvOpbrengsten!} />
      )}

      {/* PV Comparison: Dynamisch vs Vast */}
      {hasPV && dynamicResults.length > 0 && (
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-green-50 border border-gray-200 rounded-lg">
          <h3 className="text-xl font-bold mb-4 text-gray-800">💡 Zonnepanelen: Dynamisch vs Vast</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">🏠 Vaste Contracten</h4>
              <ul className="text-sm space-y-1">
                <li>• <strong>Terugleververgoeding:</strong> €0.01/kWh</li>
                <li>• <strong>Terugleverkosten:</strong> Staffel op basis van teruglevering</li>
                <li>• <strong>Saldering:</strong> Alleen over energiebelasting</li>
                <li>• <strong>Voordeel:</strong> Voorspelbare kosten</li>
              </ul>
            </div>
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">⚡ Dynamische Contracten</h4>
              <ul className="text-sm space-y-1">
                <li>• <strong>Terugleververgoeding:</strong> Gemiddelde spotprijs</li>
                <li>• <strong>Terugleverkosten:</strong> Geen extra kosten</li>
                <li>• <strong>Saldering:</strong> Alleen over energiebelasting</li>
                <li>• <strong>Voordeel:</strong> Hogere vergoeding bij hoge prijzen</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              <strong>💡 Tip:</strong> Bij dynamische contracten krijg je de werkelijke marktprijs voor teruglevering, 
              wat vaak hoger is dan de vaste €0.01/kWh. Dit kan een groot verschil maken bij zonnepanelen!
            </p>
          </div>
        </div>
      )}

      {/* Full Comparison Table */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Volledige Vergelijking</h2>
        
        {/* Winner Banner */}
        {cheapestFixed && cheapestDynamic && (
          <div className={`rounded-xl p-6 shadow-lg border-2 ${isDynamicCheaper ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-500' : 'bg-gradient-to-r from-green-50 to-green-100 border-green-500'}`}>
            <div className="flex items-center justify-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDynamicCheaper ? 'bg-blue-500' : 'bg-green-500'}`}>
                <span className="text-white text-2xl font-bold">🏆</span>
              </div>
              <div className="text-center">
                <h3 className={`text-2xl font-bold ${isDynamicCheaper ? 'text-blue-800' : 'text-green-800'}`}>
                  {isDynamicCheaper ? 'Dynamisch Contract' : 'Vast Contract'} is GOEDKOOPST!
                </h3>
                <p className={`text-lg ${isDynamicCheaper ? 'text-blue-600' : 'text-green-600'}`}>
                  Bespaar €{Math.abs(savings).toFixed(0)} per jaar ten opzichte van het alternatief
                </p>
                <div className="mt-2">
                  <span className={`px-4 py-2 rounded-full text-white font-bold ${isDynamicCheaper ? 'bg-blue-500' : 'bg-green-500'}`}>
                    {isDynamicCheaper ? 'Dynamisch' : 'Vast'} Contract Wint!
                  </span>
                </div>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDynamicCheaper ? 'bg-blue-500' : 'bg-green-500'}`}>
                <span className="text-white text-2xl font-bold">💰</span>
              </div>
            </div>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 p-3 text-left">Type</th>
                <th className="border border-gray-300 p-3 text-left">Leverancier</th>
                <th className="border border-gray-300 p-3 text-left">Product</th>
                <th className="border border-gray-300 p-3 text-right">Jaarkosten</th>
                <th className="border border-gray-300 p-3 text-right">Maandlasten</th>
                {hasPV && (
                  <th className="border border-gray-300 p-3 text-right">PV Opbrengst</th>
                )}
                <th className="border border-gray-300 p-3 text-right">Stroom Tarief</th>
                <th className="border border-gray-300 p-3 text-right">Gas Tarief</th>
              </tr>
            </thead>
            <tbody>
              {/* Vaste contracten */}
              {results.map((result, index) => {
                const isCheapest = result === cheapestFixed;
                const isBetterThanDynamic = !isDynamicCheaper;
                return (
                  <tr key={result.contract.leverancier} className={`${isCheapest && isBetterThanDynamic ? 'bg-green-100 border-2 border-green-500' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="border border-gray-300 p-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Vast</span>
                        {isCheapest && isBetterThanDynamic && (
                          <span className="px-2 py-1 bg-green-500 text-white text-xs rounded font-bold">GOEDKOOPST</span>
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-300 p-3 font-medium">{result.contract.leverancier}</td>
                    <td className="border border-gray-300 p-3">{result.contract.productNaam}</td>
                    <td className="border border-gray-300 p-3 text-right font-bold">
                      €{result.totaleJaarkostenMetPv.toFixed(0)}
                    </td>
                    <td className="border border-gray-300 p-3 text-right">
                      €{result.maandlastenGemiddeld.toFixed(0)}
                    </td>
                    {hasPV && (
                      <td className="border border-gray-300 p-3 text-right text-green-600">
                        -€{result.pvOpbrengsten?.totaleOpbrengst.toFixed(0)}
                      </td>
                    )}
                    <td className="border border-gray-300 p-3 text-right">
                      €{(result.stroomKosten.kaleEnergie / 2900).toFixed(3)}
                    </td>
                    <td className="border border-gray-300 p-3 text-right">
                      €{(result.gasKosten.kaleEnergie / 1200).toFixed(3)}
                    </td>
                  </tr>
                );
              })}
              
              {/* Dynamische contracten */}
              {dynamicResults.map((result, index) => {
                const isCheapest = result === cheapestDynamic;
                const isBetterThanFixed = isDynamicCheaper;
                return (
                  <tr key={`dynamic-${result.contract.leverancier}`} className={`${isCheapest && isBetterThanFixed ? 'bg-blue-100 border-2 border-blue-500' : 'bg-blue-50'}`}>
                    <td className="border border-gray-300 p-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Dynamisch</span>
                        {isCheapest && isBetterThanFixed && (
                          <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded font-bold">GOEDKOOPST</span>
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-300 p-3 font-medium">{result.contract.leverancier}</td>
                    <td className="border border-gray-300 p-3">{result.contract.productNaam}</td>
                    <td className="border border-gray-300 p-3 text-right font-bold">
                      €{result.totaleJaarkostenMetPv.toFixed(0)}
                    </td>
                    <td className="border border-gray-300 p-3 text-right">
                      €{result.maandlastenGemiddeld.toFixed(0)}
                    </td>
                    {hasPV && (
                      <td className="border border-gray-300 p-3 text-right text-green-600">
                        -€{result.pvOpbrengsten?.totaleOpbrengst.toFixed(0)}
                      </td>
                    )}
                    <td className="border border-gray-300 p-3 text-right text-blue-600">
                      Uurtarieven
                    </td>
                    <td className="border border-gray-300 p-3 text-right">
                      -
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
