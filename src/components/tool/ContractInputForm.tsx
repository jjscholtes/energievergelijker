'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContractData } from '@/types/contracts';
import { DynamicContractData } from '@/types/dynamicContracts';

interface UserProfile {
  heeftZonnepanelen: boolean;
  geenGas: boolean;
}

interface ContractInputFormProps {
  userProfile: UserProfile;
  onAddContract: (contract: ContractData | DynamicContractData) => void;
}

export function ContractInputForm({ userProfile, onAddContract }: ContractInputFormProps) {
  const [currentContract, setCurrentContract] = useState<Partial<ContractData>>({
    type: 'vast',
    looptijdMaanden: 12,
    vasteLeveringskosten: 7,
    kortingEenmalig: 200,
    duurzaamheidsScore: 5,
    klanttevredenheid: 5,
    tarieven: {
      stroomKalePrijs: 0.085,
      stroomKalePrijsPiek: 0.10,
      stroomKalePrijsDal: 0.10,
      gasKalePrijs: 0.63,
      terugleververgoeding: 0.01
    }
  });

  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [dynamicInputValues, setDynamicInputValues] = useState<Record<string, string>>({});

  // Helper functie voor input value
  const getInputValue = (key: string, defaultValue: number, isDynamic: boolean = false): string => {
    const values = isDynamic ? dynamicInputValues : inputValues;
    return values[key] !== undefined ? values[key] : defaultValue.toString();
  };

  // Helper functie voor input change
  const handleInputChange = (key: string, value: string, setter: (value: number) => void, isDynamic: boolean = false) => {
    if (isDynamic) {
      setDynamicInputValues(prev => ({ ...prev, [key]: value }));
    } else {
      setInputValues(prev => ({ ...prev, [key]: value }));
    }
    
    if (value === '' || value === '0') {
      setter(0);
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        setter(numValue);
      }
    }
  };

  // Speciale helper voor contract tarieven
  const handleContractInputChange = (key: string, value: string, setter: (value: number) => void) => {
    setInputValues(prev => ({ ...prev, [key]: value }));
    
    if (value === '' || value === '0') {
      setter(0);
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        setter(numValue);
      }
    }
  };

  // Effect om terugleververgoeding aan te passen bij contract type wijziging
  useEffect(() => {
    if (currentContract.type === 'dynamisch' && currentContract.tarieven?.terugleververgoeding === 0.01) {
      setCurrentContract(prev => ({
        ...prev,
        tarieven: { ...prev.tarieven!, terugleververgoeding: 0.0595 }
      }));
    } else if (currentContract.type === 'vast' && currentContract.tarieven?.terugleververgoeding === 0.0595) {
      setCurrentContract(prev => ({
        ...prev,
        tarieven: { ...prev.tarieven!, terugleververgoeding: 0.01 }
      }));
    }
  }, [currentContract.type]);

  const handleAddContract = () => {
    if (!currentContract.leverancier) {
      alert('Vul leverancier in');
      return;
    }

    const newContract: ContractData = {
      leverancier: currentContract.leverancier,
      productNaam: currentContract.productNaam || `${(currentContract.type || 'vast').charAt(0).toUpperCase() + (currentContract.type || 'vast').slice(1)} Contract`,
      type: currentContract.type as 'vast' | 'dynamisch',
      looptijdMaanden: currentContract.looptijdMaanden || 12,
      vasteLeveringskosten: currentContract.vasteLeveringskosten || (currentContract.type === 'dynamisch' ? 7 : 7),
      kortingEenmalig: currentContract.kortingEenmalig || (currentContract.type === 'vast' ? 200 : 0),
      duurzaamheidsScore: currentContract.duurzaamheidsScore || 5,
      klanttevredenheid: currentContract.klanttevredenheid || 5,
      tarieven: {
        stroomKalePrijs: currentContract.tarieven?.stroomKalePrijs,
        stroomKalePrijsPiek: currentContract.tarieven?.stroomKalePrijsPiek,
        stroomKalePrijsDal: currentContract.tarieven?.stroomKalePrijsDal,
        gasKalePrijs: currentContract.tarieven?.gasKalePrijs || 1.20,
        terugleververgoeding: currentContract.tarieven?.terugleververgoeding || (currentContract.type === 'dynamisch' ? 0.0595 : 0.01)
      }
    };

    if (currentContract.type === 'dynamisch') {
      const dynamicContract: DynamicContractData = {
        ...newContract,
        type: 'dynamisch',
        csvData2024: '',
        csvData2025: '',
        terugleververgoeding: newContract.tarieven.terugleververgoeding,
        maandelijkseVergoeding: newContract.vasteLeveringskosten,
        opslagPerKwh: 0.023,
        opslagInvoeding: 0.023,
        tarieven: newContract.tarieven
      };
      
      onAddContract(dynamicContract);
    } else {
      onAddContract(newContract);
    }

    // Reset form
    setCurrentContract({
      type: 'vast',
      looptijdMaanden: 12,
      vasteLeveringskosten: 7,
      kortingEenmalig: 200,
      duurzaamheidsScore: 5,
      klanttevredenheid: 5,
      tarieven: {
        stroomKalePrijs: 0.085,
        stroomKalePrijsPiek: 0.10,
        stroomKalePrijsDal: 0.10,
        gasKalePrijs: 0.63,
        terugleververgoeding: 0.01
      }
    });
  };

  return (
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
                <Label htmlFor="type" className="text-sm font-medium text-gray-700">
                  Contract Type
                </Label>
                <Select
                  value={currentContract.type}
                  onValueChange={(value: 'vast' | 'dynamisch') => 
                    setCurrentContract(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Selecteer type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vast">Vast Contract</SelectItem>
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
                  value={getInputValue('looptijd', currentContract.looptijdMaanden || 12)}
                  onChange={(e) => handleInputChange('looptijd', e.target.value, (value) => setCurrentContract(prev => ({ ...prev, looptijdMaanden: value })))}
                  className="h-12"
                  placeholder="Bijv. 12"
                />
              </div>
            </div>
          </div>

          {/* Tarieven */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              💰 Tarieven
            </h3>
            
            {currentContract.type === 'dynamisch' ? (
              // Dynamische contracten - alleen relevante velden
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <h4 className="font-semibold text-emerald-800 mb-2">⚡ Dynamisch Contract</h4>
                  <p className="text-sm text-emerald-700">
                    Dynamische contracten gebruiken spotmarktprijzen als basis. De 8,5 cent (afname) en 5,95 cent (invoeding) zijn berekende gemiddelden die je kunt aanpassen, plus opslagen.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="basisprijs" className="text-sm font-medium text-gray-700">
                          Gemiddelde prijs kWh afname (€/kWh)
                        </Label>
                        <div className="group relative">
                          <span className="text-emerald-500 cursor-help text-sm">ℹ️</span>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                            Berekend gemiddelde van spotmarktprijzen voor afname. 8,5 cent is een goed uitgangspunt.
                          </div>
                        </div>
                      </div>
                      <Input
                        id="basisprijs"
                        type="number"
                        step="0.001"
                        value={getInputValue('basisprijs', currentContract.tarieven?.stroomKalePrijs || 0.085)}
                        onChange={(e) => handleContractInputChange('basisprijs', e.target.value, (value) => setCurrentContract(prev => ({
                          ...prev,
                          tarieven: { ...prev.tarieven!, stroomKalePrijs: value }
                        })))}
                        className="h-12"
                        placeholder="Bijv. 0.085"
                        title="De 8,5 cent is een berekend gemiddelde van de spotmarktprijzen voor afname van het net. Dit vormt het beste uitgangspunt voor dynamische contracten."
                      />
                      <p className="text-xs text-gray-500">Gemiddelde spotmarktprijs voor afname</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="terugleververgoeding" className="text-sm font-medium text-gray-700">
                          Gemiddelde prijs kWh invoeding (€/kWh)
                        </Label>
                        <div className="group relative">
                          <span className="text-emerald-500 cursor-help text-sm">ℹ️</span>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                            Berekend gemiddelde van terugleververgoeding. 5,95 cent is een goed uitgangspunt.
                          </div>
                        </div>
                      </div>
                      <Input
                        id="terugleververgoeding"
                        type="number"
                        step="0.001"
                        value={getInputValue('terugleververgoeding', currentContract.tarieven?.terugleververgoeding || 0.0595, true)}
                        onChange={(e) => handleInputChange('terugleververgoeding', e.target.value, (value) => setCurrentContract(prev => ({
                          ...prev,
                          tarieven: { ...prev.tarieven!, terugleververgoeding: value }
                        })), true)}
                        className="h-12"
                        placeholder="Bijv. 0.0595"
                        title="De 5,95 cent is een berekend gemiddelde van de terugleververgoeding voor invoeding op het net. Dit vormt het beste uitgangspunt voor dynamische contracten."
                      />
                      <p className="text-xs text-gray-500">Gemiddelde terugleververgoeding voor invoeding</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="maandelijkseVergoeding" className="text-sm font-medium text-gray-700">
                        Maandelijkse Vergoeding (€/maand)
                      </Label>
                      <Input
                        id="maandelijkseVergoeding"
                        type="number"
                        step="0.01"
                        value={getInputValue('maandelijkseVergoeding', currentContract.vasteLeveringskosten || 5.99, true)}
                        onChange={(e) => handleInputChange('maandelijkseVergoeding', e.target.value, (value) => setCurrentContract(prev => ({ ...prev, vasteLeveringskosten: value })), true)}
                        className="h-12"
                        placeholder="Bijv. 5.99"
                        title="Vaste maandelijkse vergoeding voor dynamische contracten. Dit is vergelijkbaar met vaste leveringskosten bij vaste contracten."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="opslagAfname" className="text-sm font-medium text-gray-700">
                        Opslag Afname (€/kWh)
                      </Label>
                      <Input
                        id="opslagAfname"
                        type="number"
                        step="0.001"
                        value={getInputValue('opslagAfname', currentContract.opslagPerKwh || (currentContract.type === 'dynamisch' ? 0.023 : 0.10))}
                        onChange={(e) => handleContractInputChange('opslagAfname', e.target.value, (value) => setCurrentContract(prev => ({
                          ...prev,
                          opslagPerKwh: value
                        })))}
                        className="h-12"
                        placeholder={currentContract.type === 'dynamisch' ? "Bijv. 0.023" : "Bijv. 0.100"}
                        title="Opslag die de energieleverancier rekent bovenop de spotmarktprijs voor afname van het net. Dit is de winstmarge van de leverancier."
                      />
                      <p className="text-xs text-gray-500">Opslag op afname van het net</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="opslagInvoeding" className="text-sm font-medium text-gray-700">
                        Opslag Invoeding (€/kWh)
                      </Label>
                      <Input
                        id="opslagInvoeding"
                        type="number"
                        step="0.001"
                        value={getInputValue('opslagInvoeding', currentContract.opslagInvoeding || (currentContract.type === 'dynamisch' ? 0.023 : 0.10))}
                        onChange={(e) => handleContractInputChange('opslagInvoeding', e.target.value, (value) => setCurrentContract(prev => ({
                          ...prev,
                          opslagInvoeding: value
                        })))}
                        className="h-12"
                        placeholder={currentContract.type === 'dynamisch' ? "Bijv. 0.023" : "Bijv. 0.100"}
                        title="Opslag die de energieleverancier rekent op de terugleververgoeding voor invoeding op het net. Meestal €0.00 omdat dit de winstmarge van de leverancier zou verminderen."
                      />
                      <p className="text-xs text-gray-500">Opslag op invoeding (meestal €0.00)</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Vaste contracten - alle tarieven
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">⚡ Vaste Contract Tarieven</h4>
                  <p className="text-sm text-green-700">
                    Vul de tarieven in voor normaal en dal verbruik. Meestal is dal goedkoper dan normaal.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="stroomKalePrijsPiek" className="text-sm font-medium text-gray-700">
                        Stroom Normaal Tarief (€/kWh)
                      </Label>
                      <div className="group relative">
                        <span className="text-emerald-500 cursor-help text-sm">ℹ️</span>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                          Kale energieprijs voor normaal verbruik (excl. energiebelasting en BTW). Werkdagen 7:00-23:00.
                        </div>
                      </div>
                    </div>
                    <Input
                      id="stroomKalePrijsPiek"
                      type="number"
                      step="0.001"
                      value={getInputValue('stroomKalePrijsPiek', currentContract.tarieven?.stroomKalePrijsPiek || 0.10)}
                      onChange={(e) => handleContractInputChange('stroomKalePrijsPiek', e.target.value, (value) => setCurrentContract(prev => ({
                        ...prev,
                        tarieven: { ...prev.tarieven!, stroomKalePrijsPiek: value }
                      })))}
                      className="h-12"
                      placeholder="Bijv. 0.100"
                      title="De kale energieprijs voor normaal verbruik (excl. energiebelasting en BTW). Dit is de basisprijs die de energieleverancier rekent voor elektriciteit tijdens normale uren (7:00-23:00)."
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="stroomKalePrijsDal" className="text-sm font-medium text-gray-700">
                        Stroom Dal Tarief (€/kWh)
                      </Label>
                      <div className="group relative">
                        <span className="text-emerald-500 cursor-help text-sm">ℹ️</span>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                          Kale energieprijs voor dal verbruik (excl. energiebelasting en BTW). Laat leeg voor enkeltarief contract.
                        </div>
                      </div>
                    </div>
                    <Input
                      id="stroomKalePrijsDal"
                      type="number"
                      step="0.001"
                      value={getInputValue('stroomKalePrijsDal', currentContract.tarieven?.stroomKalePrijsDal || 0.10)}
                      onChange={(e) => handleContractInputChange('stroomKalePrijsDal', e.target.value, (value) => setCurrentContract(prev => ({
                        ...prev,
                        tarieven: { ...prev.tarieven!, stroomKalePrijsDal: value }
                      })))}
                      className="h-12"
                      placeholder="Bijv. 0.100 (laat leeg voor enkeltarief)"
                      title="De kale energieprijs voor dal verbruik (excl. energiebelasting en BTW). Dit is de basisprijs voor elektriciteit tijdens daluren (23:00-7:00 en weekenden). Meestal goedkoper dan normaal tarief."
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
                      value={getInputValue('gasKalePrijs', currentContract.tarieven?.gasKalePrijs || 1.20)}
                      onChange={(e) => handleInputChange('gasKalePrijs', e.target.value, (value) => setCurrentContract(prev => ({
                        ...prev,
                        tarieven: { ...prev.tarieven!, gasKalePrijs: value }
                      })))}
                      className="h-12"
                      placeholder="Bijv. 1.200"
                      title="De kale gasprijs per kubieke meter (excl. energiebelasting en BTW). Dit is de basisprijs die de energieleverancier rekent voor aardgas."
                    />
                  </div>
                </div>

                {userProfile.heeftZonnepanelen && (
                  <div className="space-y-2">
                    <Label htmlFor="terugleververgoeding" className="text-sm font-medium text-gray-700">
                      Terugleververgoeding (€/kWh)
                    </Label>
                    <Input
                      id="terugleververgoeding"
                      type="number"
                      step="0.001"
                      value={getInputValue('terugleververgoeding', currentContract.tarieven?.terugleververgoeding || 0.01, false)}
                      onChange={(e) => handleInputChange('terugleververgoeding', e.target.value, (value) => setCurrentContract(prev => ({
                        ...prev,
                        tarieven: { ...prev.tarieven!, terugleververgoeding: value }
                      })), false)}
                      className="h-12"
                      placeholder="Bijv. 0.010"
                      title="De vergoeding die je krijgt voor stroom die je teruglevert aan het net (bij vaste contracten). Meestal lager dan de kale energieprijs. Voor dynamische contracten is dit meestal gelijk aan de spotmarktprijs."
                    />
                    <p className="text-xs text-gray-500">Terugleververgoeding voor vaste contracten</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Kosten - alleen voor vaste contracten */}
          {currentContract.type !== 'dynamisch' && (
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
                    value={getInputValue('vasteLeveringskosten', currentContract.vasteLeveringskosten || 0)}
                    onChange={(e) => handleInputChange('vasteLeveringskosten', e.target.value, (value) => setCurrentContract(prev => ({ ...prev, vasteLeveringskosten: value })))}
                    className="h-12"
                    placeholder="Bijv. 0.00"
                    title="Vaste kosten per maand die de energieleverancier rekent, onafhankelijk van je verbruik. Dit zijn kosten voor meterhuur, administratie en service."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kortingEenmalig" className="text-sm font-medium text-gray-700">
                    Eenmalige Korting (€)
                  </Label>
                  <Input
                    id="kortingEenmalig"
                    type="number"
                    value={getInputValue('kortingEenmalig', currentContract.kortingEenmalig || 0)}
                    onChange={(e) => handleInputChange('kortingEenmalig', e.target.value, (value) => setCurrentContract(prev => ({ ...prev, kortingEenmalig: value })))}
                    className="h-12"
                    placeholder="Bijv. 0"
                    title="Eenmalige korting die je krijgt bij het afsluiten van het contract. Dit bedrag wordt eenmalig afgetrokken van je jaarlijkse kosten."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Eenmalige korting voor dynamische contracten */}
          {currentContract.type === 'dynamisch' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                💸 Kosten
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="kortingEenmalig" className="text-sm font-medium text-gray-700">
                  Eenmalige Korting (€)
                </Label>
                <Input
                  id="kortingEenmalig"
                  type="number"
                  value={getInputValue('kortingEenmalig', currentContract.kortingEenmalig || 0, true)}
                  onChange={(e) => handleInputChange('kortingEenmalig', e.target.value, (value) => setCurrentContract(prev => ({ ...prev, kortingEenmalig: value })), true)}
                  className="h-12"
                  placeholder="Bijv. 0"
                />
              </div>
            </div>
          )}

          {/* Informatie over automatische kosten */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">ℹ️ Automatisch Meegenomen Kosten</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div>• <strong>Netbeheerkosten:</strong> Automatisch berekend per netbeheerder (vaste kosten per jaar)</div>
              <div>• <strong>Energiebelasting:</strong> Officiële tarieven €0.1316/kWh (inclusief 21% BTW)</div>
              <div>• <strong>Vermindering Energiebelasting:</strong> €631.35 per jaar vermindering op energiebelasting</div>
              {userProfile.geenGas && <div>• <strong>Gas:</strong> Uitgesloten van berekening</div>}
            </div>
          </div>

          {/* Add Button */}
          <Button
            onClick={handleAddContract}
            className="w-full h-12 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <span>➕</span>
              <span>Contract Toevoegen</span>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
