'use client';

import { BerekeningResult } from '@/types/calculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StandaloneResultsSectionProps {
  results: BerekeningResult[];
  dynamicResults: BerekeningResult[];
}

export function StandaloneResultsSection({ results, dynamicResults }: StandaloneResultsSectionProps) {
  const allResults = [...results, ...dynamicResults];
  
  if (allResults.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>Voeg contracten toe en klik op berekenen om resultaten te zien</p>
      </div>
    );
  }

  // Sorteer alle resultaten op totale kosten
  const sortedResults = allResults.sort((a, b) => a.totaleJaarkostenMetPv - b.totaleJaarkostenMetPv);
  const cheapestResult = sortedResults[0];

  return (
    <div className="space-y-6">
      {/* Winner Banner */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-6 text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">🏆</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-green-800">
              Goedkoopste Contract: {cheapestResult.contract.leverancier}
            </h3>
            <p className="text-lg text-green-700">
              {cheapestResult.contract.productNaam}
            </p>
          </div>
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">💰</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 mb-4">
          <div className="text-4xl font-bold text-green-600 mb-2">
            €{cheapestResult.totaleJaarkostenMetPv.toFixed(0)}
          </div>
          <div className="text-lg text-green-700">
            per jaar (€{cheapestResult.maandlastenGemiddeld.toFixed(0)}/maand)
          </div>
        </div>

        <div className="text-sm text-gray-600">
          <div className="grid grid-cols-2 gap-4 text-left">
            <div>
              <span className="font-semibold">Stroom tarief:</span>
              <div className="text-xs text-gray-500">
                €{((cheapestResult.stroomKosten.kaleEnergie + cheapestResult.stroomKosten.energiebelasting) / (cheapestResult.userProfile?.jaarverbruikStroom || 2900)).toFixed(3)}/kWh
              </div>
            </div>
            <div>
              <span className="font-semibold">Gas tarief:</span>
              <div className="text-xs text-gray-500">
                €{(cheapestResult.gasKosten.kaleEnergie / (cheapestResult.userProfile?.jaarverbruikGas || 1200)).toFixed(3)}/m³
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Results */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900">Alle Contracten</h3>
        
        <div className="space-y-3">
          {sortedResults.map((result, index) => {
            const isCheapest = index === 0;
            const isDynamic = result.contract.type === 'dynamisch';
            
            return (
              <Card key={`${result.contract.leverancier}-${index}`} className={`shadow-lg ${isCheapest ? 'border-2 border-green-500 bg-green-50' : 'border border-gray-200'}`}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900">{result.contract.leverancier}</h4>
                        <span className={`px-2 py-1 text-xs rounded ${isDynamic ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                          {isDynamic ? 'Dynamisch' : 'Vast'}
                        </span>
                        {isCheapest && (
                          <span className="px-2 py-1 bg-green-500 text-white text-xs rounded font-bold">
                            GOEDKOOPST
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{result.contract.productNaam}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="font-semibold text-gray-800">Jaarlijkse kosten:</div>
                          <div className={`text-lg font-bold ${isCheapest ? 'text-green-600' : 'text-gray-900'}`}>
                            €{result.totaleJaarkostenMetPv.toFixed(0)}
                          </div>
                          <div className="text-xs text-gray-500">
                            €{result.maandlastenGemiddeld.toFixed(0)}/maand
                          </div>
                        </div>
                        
                        <div>
                          <div className="font-semibold text-gray-800">Kostenopbouw:</div>
                          <div className="text-xs text-gray-500 space-y-1">
                            <div>Stroom: €{result.stroomKosten.totaal.toFixed(0)}</div>
                            <div>Gas: €{result.gasKosten.totaal.toFixed(0)}</div>
                            {result.stroomKosten.vasteLeveringskosten && result.stroomKosten.vasteLeveringskosten > 0 && (
                              <div>Vaste kosten: €{result.stroomKosten.vasteLeveringskosten.toFixed(0)}</div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {result.pvOpbrengsten && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="text-sm font-semibold text-green-800 mb-1">☀️ Zonnepanelen Opbrengst:</div>
                          <div className="text-lg font-bold text-green-600">
                            €{result.pvOpbrengsten.totaleOpbrengst.toFixed(0)}
                          </div>
                          <div className="text-xs text-green-700 space-y-1">
                            <div>Saldering: €{result.pvOpbrengsten.salderingsBesparing.toFixed(0)}</div>
                            <div>Teruglevering: €{result.pvOpbrengsten.terugleververgoedingBedrag.toFixed(0)}</div>
                            {result.pvOpbrengsten.terugleverkosten > 0 && (
                              <div>Terugleverkosten: €{result.pvOpbrengsten.terugleverkosten.toFixed(0)}</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        #{index + 1}
                      </div>
                      {index > 0 && (
                        <div className="text-sm text-red-600">
                          +€{(result.totaleJaarkostenMetPv - cheapestResult.totaleJaarkostenMetPv).toFixed(0)}/jaar
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <Card className="shadow-xl border-0 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-900 text-center">
            📊 Vergelijkingssamenvatting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-blue-600">{results.length}</div>
              <div className="text-sm text-gray-600">Vaste Contracten</div>
            </div>
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-purple-600">{dynamicResults.length}</div>
              <div className="text-sm text-gray-600">Dynamische Contracten</div>
            </div>
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-green-600">
                €{(sortedResults[sortedResults.length - 1]?.totaleJaarkostenMetPv - cheapestResult.totaleJaarkostenMetPv).toFixed(0)}
              </div>
              <div className="text-sm text-gray-600">Maximale Besparing</div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              💡 <strong>Tip:</strong> Deze berekening is gebaseerd op een standaard verbruik van 2900 kWh stroom en 1200 m³ gas. 
              Je kunt de tarieven aanpassen om verschillende scenario&apos;s te vergelijken.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
