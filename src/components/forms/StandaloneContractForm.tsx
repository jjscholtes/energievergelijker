'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContractData } from '@/types/contracts';
import { DynamicContractData } from '@/types/dynamicContracts';

interface StandaloneContractFormProps {
  onContractsChange: (contracts: ContractData[]) => void;
  onDynamicContractsChange: (contracts: DynamicContractData[]) => void;
}

export function StandaloneContractForm({ onContractsChange, onDynamicContractsChange }: StandaloneContractFormProps) {
  const [contracts, setContracts] = useState<ContractData[]>([]);
  const [dynamicContracts, setDynamicContracts] = useState<DynamicContractData[]>([]);
  const [currentContract, setCurrentContract] = useState<Partial<ContractData>>({
    type: 'vast',
    looptijdMaanden: 12,
    vasteLeveringskosten: 0,
    kortingEenmalig: 0,
    duurzaamheidsScore: 5,
    klanttevredenheid: 5,
    tarieven: {
      stroomKalePrijs: 0.25,
      gasKalePrijs: 1.20,
      terugleververgoeding: 0.01
    }
  });

  const handleAddContract = () => {
    if (!currentContract.leverancier || !currentContract.productNaam) {
      alert('Vul leverancier en productnaam in');
      return;
    }

    const newContract: ContractData = {
      leverancier: currentContract.leverancier,
      productNaam: currentContract.productNaam,
      type: currentContract.type as 'vast' | 'variabel' | 'dynamisch',
      looptijdMaanden: currentContract.looptijdMaanden || 12,
      vasteLeveringskosten: currentContract.vasteLeveringskosten || 0,
      kortingEenmalig: currentContract.kortingEenmalig || 0,
      duurzaamheidsScore: currentContract.duurzaamheidsScore || 5,
      klanttevredenheid: currentContract.klanttevredenheid || 5,
      tarieven: {
        stroomKalePrijs: currentContract.tarieven?.stroomKalePrijs || 0.25,
        gasKalePrijs: currentContract.tarieven?.gasKalePrijs || 1.20,
        terugleververgoeding: currentContract.tarieven?.terugleververgoeding || 0.01
      }
    };

    if (currentContract.type === 'dynamisch') {
      // Converteer naar DynamicContractData
      const dynamicContract: DynamicContractData = {
        ...newContract,
        type: 'dynamisch',
        csvData2024: '', // Wordt later ingevuld in de berekening
        csvData2025: '', // Wordt later ingevuld in de berekening
        terugleververgoeding: newContract.tarieven.terugleververgoeding,
        maandelijkseVergoeding: newContract.vasteLeveringskosten,
        opslagPerKwh: 0.02, // Default opslag
        tarieven: newContract.tarieven
      };
      
      const updatedDynamicContracts = [...dynamicContracts, dynamicContract];
      setDynamicContracts(updatedDynamicContracts);
      onDynamicContractsChange(updatedDynamicContracts);
    } else {
      const updatedContracts = [...contracts, newContract];
      setContracts(updatedContracts);
      onContractsChange(updatedContracts);
    }

    // Reset form
    setCurrentContract({
      type: 'vast',
      looptijdMaanden: 12,
      vasteLeveringskosten: 0,
      kortingEenmalig: 0,
      duurzaamheidsScore: 5,
      klanttevredenheid: 5,
      tarieven: {
        stroomKalePrijs: 0.25,
        gasKalePrijs: 1.20,
        terugleververgoeding: 0.01
      }
    });
  };

  const handleRemoveContract = (index: number, type: 'vast' | 'dynamisch') => {
    if (type === 'dynamisch') {
      const updatedDynamicContracts = dynamicContracts.filter((_, i) => i !== index);
      setDynamicContracts(updatedDynamicContracts);
      onDynamicContractsChange(updatedDynamicContracts);
    } else {
      const updatedContracts = contracts.filter((_, i) => i !== index);
      setContracts(updatedContracts);
      onContractsChange(updatedContracts);
    }
  };

  return (
    <div className="space-y-6">
      {/* Contract Input Form */}
      <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900 text-center">
            Voeg Energiecontract Toe
          </CardTitle>
          <p className="text-gray-600 text-center mt-2">
            Vul de gegevens van je energiecontract in
          </p>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            {/* Basis Contract Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                📋 Contract Informatie
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="leverancier" className="text-sm font-medium text-gray-700">
                    Leverancier *
                  </Label>
                  <Input
                    id="leverancier"
                    placeholder="Bijv. Essent, Vattenfall"
                    value={currentContract.leverancier || ''}
                    onChange={(e) => setCurrentContract(prev => ({ ...prev, leverancier: e.target.value }))}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productNaam" className="text-sm font-medium text-gray-700">
                    Product Naam *
                  </Label>
                  <Input
                    id="productNaam"
                    placeholder="Bijv. Groene Stroom & Gas"
                    value={currentContract.productNaam || ''}
                    onChange={(e) => setCurrentContract(prev => ({ ...prev, productNaam: e.target.value }))}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type" className="text-sm font-medium text-gray-700">
                    Contract Type
                  </Label>
                  <Select
                    value={currentContract.type}
                    onValueChange={(value: 'vast' | 'variabel' | 'dynamisch') => 
                      setCurrentContract(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Selecteer type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vast">Vast Contract</SelectItem>
                      <SelectItem value="variabel">Variabel Contract</SelectItem>
                      <SelectItem value="dynamisch">Dynamisch Contract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="looptijd" className="text-sm font-medium text-gray-700">
                    Looptijd (maanden)
                  </Label>
                  <Input
                    id="looptijd"
                    type="number"
                    value={currentContract.looptijdMaanden || 12}
                    onChange={(e) => setCurrentContract(prev => ({ ...prev, looptijdMaanden: Number(e.target.value) }))}
                    className="h-12"
                  />
                </div>
              </div>
            </div>

            {/* Tarieven */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                💰 Tarieven
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stroomKalePrijs" className="text-sm font-medium text-gray-700">
                    Stroom Kale Prijs (€/kWh)
                  </Label>
                  <Input
                    id="stroomKalePrijs"
                    type="number"
                    step="0.001"
                    value={currentContract.tarieven?.stroomKalePrijs || 0.25}
                    onChange={(e) => setCurrentContract(prev => ({
                      ...prev,
                      tarieven: { ...prev.tarieven!, stroomKalePrijs: Number(e.target.value) }
                    }))}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gasKalePrijs" className="text-sm font-medium text-gray-700">
                    Gas Kale Prijs (€/m³)
                  </Label>
                  <Input
                    id="gasKalePrijs"
                    type="number"
                    step="0.001"
                    value={currentContract.tarieven?.gasKalePrijs || 1.20}
                    onChange={(e) => setCurrentContract(prev => ({
                      ...prev,
                      tarieven: { ...prev.tarieven!, gasKalePrijs: Number(e.target.value) }
                    }))}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="terugleververgoeding" className="text-sm font-medium text-gray-700">
                    Terugleververgoeding (€/kWh)
                  </Label>
                  <Input
                    id="terugleververgoeding"
                    type="number"
                    step="0.001"
                    value={currentContract.tarieven?.terugleververgoeding || 0.01}
                    onChange={(e) => setCurrentContract(prev => ({
                      ...prev,
                      tarieven: { ...prev.tarieven!, terugleververgoeding: Number(e.target.value) }
                    }))}
                    className="h-12"
                  />
                </div>
              </div>
            </div>

            {/* Kosten */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                💸 Kosten
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vasteLeveringskosten" className="text-sm font-medium text-gray-700">
                    Vaste Leveringskosten (€/maand)
                  </Label>
                  <Input
                    id="vasteLeveringskosten"
                    type="number"
                    step="0.01"
                    value={currentContract.vasteLeveringskosten || 0}
                    onChange={(e) => setCurrentContract(prev => ({ ...prev, vasteLeveringskosten: Number(e.target.value) }))}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kortingEenmalig" className="text-sm font-medium text-gray-700">
                    Eenmalige Korting (€)
                  </Label>
                  <Input
                    id="kortingEenmalig"
                    type="number"
                    value={currentContract.kortingEenmalig || 0}
                    onChange={(e) => setCurrentContract(prev => ({ ...prev, kortingEenmalig: Number(e.target.value) }))}
                    className="h-12"
                  />
                </div>
              </div>
            </div>

            {/* Add Button */}
            <Button
              onClick={handleAddContract}
              className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <span>➕</span>
                <span>Contract Toevoegen</span>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contract Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <p className="text-sm text-gray-600">{contract.productNaam}</p>
                        <div className="text-xs text-gray-500 mt-1">
                          <div>Stroom: €{contract.tarieven.stroomKalePrijs.toFixed(3)}/kWh</div>
                          <div>Gas: €{contract.tarieven.gasKalePrijs.toFixed(3)}/m³</div>
                          <div>Teruglevering: €{contract.tarieven.terugleververgoeding.toFixed(3)}/kWh</div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleRemoveContract(index, 'vast')}
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
                  <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{contract.leverancier}</h4>
                        <p className="text-sm text-gray-600">{contract.productNaam}</p>
                        <div className="text-xs text-gray-500 mt-1">
                          <div>Teruglevering: €{contract.tarieven.terugleververgoeding.toFixed(3)}/kWh</div>
                          <div>Type: Dynamisch</div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleRemoveContract(index, 'dynamisch')}
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

      {/* Empty State */}
      {contracts.length === 0 && dynamicContracts.length === 0 && (
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nog geen contracten toegevoegd</h3>
            <p className="text-gray-600">
              Voeg je eerste energiecontract toe om te beginnen met vergelijken
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
