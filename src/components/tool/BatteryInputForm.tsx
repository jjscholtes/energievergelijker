'use client';

import { useState } from 'react';
import { Battery, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { BatteryInput, BatteryProfile } from '@/types/battery';

interface BatteryInputFormProps {
  onCalculate: (input: BatteryInput) => void;
  isCalculating?: boolean;
}

export function BatteryInputForm({ onCalculate, isCalculating = false }: BatteryInputFormProps) {
  // Battery specs
  const [prijsEuro, setPrijsEuro] = useState<string>('5000');
  const [capaciteitKwh, setCapaciteitKwh] = useState<string>('10');
  
  // Zonnepanelen
  const [heeftZonnepanelen, setHeeftZonnepanelen] = useState<boolean>(true);
  const [pvOpwekKwh, setPvOpwekKwh] = useState<string>('4000');
  const [huidigEigenverbruik, setHuidigEigenverbruik] = useState<string>('30');
  const [eigenverbruikMetAccu, setEigenverbruikMetAccu] = useState<string>('60');
  
  // Verbruik en contract
  const [jaarverbruikStroom, setJaarverbruikStroom] = useState<string>('3500');
  const [contractType, setContractType] = useState<'vast' | 'dynamisch'>('vast');
  const [stroomKalePrijs, setStroomKalePrijs] = useState<string>('0.12');
  const [terugleververgoeding, setTerugleververgoeding] = useState<string>('0.05');
  
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors: string[] = [];
    
    // Validaties
    const prijs = parseFloat(prijsEuro);
    const capaciteit = parseFloat(capaciteitKwh);
    const verbruik = parseFloat(jaarverbruikStroom);
    const prijs_kwh = parseFloat(stroomKalePrijs);
    const vergoeding = parseFloat(terugleververgoeding);
    
    if (isNaN(prijs) || prijs < 1000 || prijs > 20000) {
      validationErrors.push('Prijs moet tussen €1.000 en €20.000 zijn');
    }
    
    if (isNaN(capaciteit) || capaciteit < 5 || capaciteit > 30) {
      validationErrors.push('Capaciteit moet tussen 5 en 30 kWh zijn');
    }
    
    if (isNaN(verbruik) || verbruik < 500 || verbruik > 15000) {
      validationErrors.push('Jaarverbruik moet tussen 500 en 15.000 kWh zijn');
    }
    
    if (isNaN(prijs_kwh) || prijs_kwh < 0.05 || prijs_kwh > 0.50) {
      validationErrors.push('Stroomprijs moet tussen €0,05 en €0,50 per kWh zijn');
    }
    
    if (heeftZonnepanelen) {
      const pvOpwek = parseFloat(pvOpwekKwh);
      const eigenverbruikOud = parseFloat(huidigEigenverbruik);
      const eigenverbruikNieuw = parseFloat(eigenverbruikMetAccu);
      
      if (isNaN(pvOpwek) || pvOpwek < 1000 || pvOpwek > 20000) {
        validationErrors.push('PV opwek moet tussen 1.000 en 20.000 kWh zijn');
      }
      
      if (isNaN(eigenverbruikOud) || eigenverbruikOud < 10 || eigenverbruikOud > 80) {
        validationErrors.push('Huidig eigenverbruik moet tussen 10% en 80% zijn');
      }
      
      if (isNaN(eigenverbruikNieuw) || eigenverbruikNieuw < 30 || eigenverbruikNieuw > 95) {
        validationErrors.push('Eigenverbruik met accu moet tussen 30% en 95% zijn');
      }
      
      if (eigenverbruikNieuw <= eigenverbruikOud) {
        validationErrors.push('Eigenverbruik met accu moet hoger zijn dan zonder');
      }
    }
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setErrors([]);
    
    // Maak battery profile
    const battery: BatteryProfile = {
      capaciteitKwh: capaciteit,
      prijsEuro: prijs,
      roundTripEfficiency: 0.90, // 90% standaard
      garantieJaren: 10,
      degradatiePerJaar: 0.02, // 2% per jaar
    };
    
    // Maak input object
    const input: BatteryInput = {
      battery,
      heeftZonnepanelen,
      pvOpwekKwh: heeftZonnepanelen ? parseFloat(pvOpwekKwh) : undefined,
      huidigEigenverbruikPercentage: heeftZonnepanelen ? parseFloat(huidigEigenverbruik) : undefined,
      eigenverbruikMetAccuPercentage: heeftZonnepanelen ? parseFloat(eigenverbruikMetAccu) : undefined,
      jaarverbruikStroom: verbruik,
      contractType,
      stroomKalePrijs: prijs_kwh,
      terugleververgoeding: vergoeding,
    };
    
    onCalculate(input);
  };

  const handleContractTypeChange = (value: 'vast' | 'dynamisch') => {
    setContractType(value);
    if (value === 'dynamisch') {
      setStroomKalePrijs((prev) => (prev === '' || prev === '0.12' ? '0.10' : prev));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Accu Specificaties */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Battery className="w-5 h-5 text-orange-600" />
          <h3 className="text-lg font-semibold">Accu Specificaties</h3>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="prijsEuro">Aanschafprijs (incl. installatie)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
              <Input
                id="prijsEuro"
                type="number"
                value={prijsEuro}
                onChange={(e) => setPrijsEuro(e.target.value)}
                className="pl-8"
                min="1000"
                max="20000"
                step="100"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">Gemiddeld: €4.000 - €6.000</p>
          </div>
          
          <div>
            <Label htmlFor="capaciteitKwh">Capaciteit</Label>
            <div className="relative">
              <Input
                id="capaciteitKwh"
                type="number"
                value={capaciteitKwh}
                onChange={(e) => setCapaciteitKwh(e.target.value)}
                className="pr-12"
                min="5"
                max="30"
                step="0.5"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">kWh</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Typisch: 10-15 kWh</p>
          </div>
        </div>
      </Card>

      {/* Zonnepanelen */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Zonnepanelen</h3>
        
        <div className="mb-4">
          <Label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={heeftZonnepanelen}
              onChange={(e) => setHeeftZonnepanelen(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <span>Ik heb zonnepanelen</span>
          </Label>
        </div>
        
        {heeftZonnepanelen && (
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="pvOpwekKwh">Jaarlijkse opbrengst</Label>
              <div className="relative">
                <Input
                  id="pvOpwekKwh"
                  type="number"
                  value={pvOpwekKwh}
                  onChange={(e) => setPvOpwekKwh(e.target.value)}
                  className="pr-12"
                  min="1000"
                  max="20000"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">kWh</span>
              </div>
            </div>
            
            <div>
              <Label htmlFor="huidigEigenverbruik">Huidig eigenverbruik</Label>
              <div className="relative">
                <Input
                  id="huidigEigenverbruik"
                  type="number"
                  value={huidigEigenverbruik}
                  onChange={(e) => setHuidigEigenverbruik(e.target.value)}
                  className="pr-8"
                  min="10"
                  max="80"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Zonder accu: ~30%</p>
            </div>
            
            <div>
              <Label htmlFor="eigenverbruikMetAccu">Met accu</Label>
              <div className="relative">
                <Input
                  id="eigenverbruikMetAccu"
                  type="number"
                  value={eigenverbruikMetAccu}
                  onChange={(e) => setEigenverbruikMetAccu(e.target.value)}
                  className="pr-8"
                  min="30"
                  max="95"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Met accu: ~60%</p>
            </div>
          </div>
        )}
      </Card>

      {/* Verbruik en Contract */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Verbruik en Contract</h3>
        
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="jaarverbruikStroom">Jaarverbruik stroom</Label>
            <div className="relative">
              <Input
                id="jaarverbruikStroom"
                type="number"
                value={jaarverbruikStroom}
                onChange={(e) => setJaarverbruikStroom(e.target.value)}
                className="pr-12"
                min="500"
                max="15000"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">kWh</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Gemiddeld: 2.500-4.000 kWh</p>
          </div>
          
          <div>
            <Label htmlFor="contractType">Contract type</Label>
            <select
              id="contractType"
              value={contractType}
              onChange={(e) => handleContractTypeChange(e.target.value as 'vast' | 'dynamisch')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="vast">Vast contract</option>
              <option value="dynamisch">Dynamisch contract</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">
              {contractType === 'dynamisch' ? 'Met arbitrage voordelen' : 'Geen arbitrage'}
            </p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="stroomKalePrijs">Stroomprijs (kale prijs)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
              <Input
                id="stroomKalePrijs"
                type="number"
                value={stroomKalePrijs}
                onChange={(e) => setStroomKalePrijs(e.target.value)}
                className="pl-8"
                min="0.05"
                max="0.50"
                step="0.01"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">/kWh</span>
            </div>
          </div>
          
          <div>
            <Label htmlFor="terugleververgoeding">Terugleververgoeding</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
              <Input
                id="terugleververgoeding"
                type="number"
                value={terugleververgoeding}
                onChange={(e) => setTerugleververgoeding(e.target.value)}
                className="pl-8"
                min="0.01"
                max="0.30"
                step="0.01"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">/kWh</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Errors */}
      {errors.length > 0 && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900 mb-1">Validatie fouten:</h4>
              <ul className="text-sm text-red-800 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isCalculating}
        className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white py-6 text-lg font-semibold"
      >
        {isCalculating ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
            Berekenen...
          </>
        ) : (
          <>
            <Battery className="w-5 h-5 mr-2" />
            Bereken Terugverdientijd
          </>
        )}
      </Button>
    </form>
  );
}

