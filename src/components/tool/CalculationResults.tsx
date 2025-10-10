'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BerekeningResult } from '@/types/calculations';
import { ContractData } from '@/types/contracts';
import { DynamicContractData } from '@/types/dynamicContracts';
import { CostBreakdown } from '@/components/results/CostBreakdown';

interface CalculationResultsProps {
  results: BerekeningResult[];
  dynamicResults: BerekeningResult[];
  isLoading: boolean;
  error: string | null;
  onCalculate: () => void;
  contracts: ContractData[];
  dynamicContracts: DynamicContractData[];
}

export function CalculationResults({ 
  results, 
  dynamicResults, 
  isLoading, 
  error, 
  onCalculate,
  contracts,
  dynamicContracts
}: CalculationResultsProps) {
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());

  const allResults = [...results, ...dynamicResults];
  const sortedResults = allResults.sort((a, b) => a.totaleJaarkostenMetPv - b.totaleJaarkostenMetPv);
  const cheapestResult = sortedResults[0];

  const toggleExpandedResult = (contractKey: string) => {
    setExpandedResults(prev => {
      const newSet = new Set(prev);
      if (newSet.has(contractKey)) {
        newSet.delete(contractKey);
      } else {
        newSet.add(contractKey);
      }
      return newSet;
    });
  };

  return (
    <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900 text-center">
          Berekeningsresultaten
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button
            onClick={onCalculate}
            disabled={isLoading || (contracts.length === 0 && dynamicContracts.length === 0)}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Berekenen...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span>🚀</span>
                <span>Bereken Contracten</span>
              </div>
            )}
          </Button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {sortedResults.length > 0 && (
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
                      {cheapestResult.contract.productNaam || `${cheapestResult.contract.type.charAt(0).toUpperCase() + cheapestResult.contract.type.slice(1)} Contract`}
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
              </div>

              {/* All Results */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900">Alle Contracten</h3>
                
                <div className="space-y-3">
                  {sortedResults.map((result, index) => {
                    const isCheapest = index === 0;
                    const isDynamic = result.contract.type === 'dynamisch';
                    
                    return (
                      <div key={`${result.contract.leverancier}-${index}`}>
                        <Card className={`shadow-lg ${isCheapest ? 'border-2 border-green-500 bg-green-50' : 'border border-gray-200'}`}>
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
                                
                                <p className="text-sm text-gray-600 mb-3">{result.contract.productNaam || `${result.contract.type.charAt(0).toUpperCase() + result.contract.type.slice(1)} Contract`}</p>
                                
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
                            
                            {/* Toggle Details Button */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleExpandedResult(`${result.contract.leverancier}-${index}`)}
                                className="w-full"
                              >
                                {expandedResults.has(`${result.contract.leverancier}-${index}`) ? 'Verberg Details' : 'Bekijk Details'}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                        
                        {/* Detailed Cost Breakdown */}
                        {expandedResults.has(`${result.contract.leverancier}-${index}`) && (
                          <div className="mt-4">
                            <CostBreakdown result={result} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {allResults.length === 0 && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Nog geen contracten toegevoegd</h3>
              <p className="text-gray-600">
                Voeg je eerste energiecontract toe om te beginnen met vergelijken
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
