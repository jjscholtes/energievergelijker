'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ContractData } from '@/types/contracts';
import { DynamicContractData } from '@/types/dynamicContracts';
import { memo } from 'react';

interface ContractListProps {
  contracts: ContractData[];
  dynamicContracts: DynamicContractData[];
  onRemoveContract: (index: number, type: 'vast' | 'dynamisch') => void;
}

export const ContractList = memo(function ContractList({ contracts, dynamicContracts, onRemoveContract }: ContractListProps) {
  return (
    <div className="space-y-4">
      {/* Vaste Contracten */}
      {contracts.length > 0 && (
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900 text-center">
              🔒 Vaste Contracten ({contracts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {contracts.map((contract, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{contract.leverancier}</h4>
                      <p className="text-sm text-gray-600">{contract.productNaam || 'Vast Contract'}</p>
                      <div className="text-xs text-gray-500 mt-1">
                        <div>Stroom: €{(contract.tarieven.stroomKalePrijsPiek || 0.10).toFixed(3)}/kWh normaal, €{(contract.tarieven.stroomKalePrijsDal || 0.10).toFixed(3)}/kWh dal</div>
                        <div>Gas: €{contract.tarieven.gasKalePrijs.toFixed(3)}/m³</div>
                        <div>Teruglevering: €{contract.tarieven.terugleververgoeding.toFixed(3)}/kWh</div>
                      </div>
                    </div>
                    <Button
                      onClick={() => onRemoveContract(index, 'vast')}
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Verwijder
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dynamische Contracten */}
      {dynamicContracts.length > 0 && (
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900 text-center">
              ⚡ Dynamische Contracten ({dynamicContracts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dynamicContracts.map((contract, index) => (
                <div key={index} className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{contract.leverancier}</h4>
                      <p className="text-sm text-gray-600">{contract.productNaam || 'Dynamisch Contract'}</p>
                      <div className="text-xs text-gray-500 mt-1">
                        <div>Basisprijs: €{(contract.tarieven.stroomKalePrijs || 0.15).toFixed(3)}/kWh</div>
                        <div>Opslag afname: €{(contract.opslagPerKwh || 0.023).toFixed(3)}/kWh</div>
                        <div>Opslag invoeding: €{(contract.opslagInvoeding || 0.023).toFixed(3)}/kWh</div>
                        <div>Maandelijks: €{(contract.maandelijkseVergoeding || 5.99).toFixed(2)}/maand</div>
                      </div>
                    </div>
                    <Button
                      onClick={() => onRemoveContract(index, 'dynamisch')}
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Verwijder
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});
