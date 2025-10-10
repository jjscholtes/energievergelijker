'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAlleNetbeheerders } from '@/lib/data/netbeheerders';

interface UserProfile {
  netbeheerder: string;
  jaarverbruikStroom: number;
  jaarverbruikStroomPiek: number;
  jaarverbruikStroomDal: number;
  jaarverbruikGas: number;
  geenGas: boolean;
  heeftZonnepanelen: boolean;
  pvOpwek: number;
  percentageZelfverbruik: number;
}

interface UserProfileFormProps {
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
}

export function UserProfileForm({ userProfile, setUserProfile }: UserProfileFormProps) {
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  // Helper functie voor input value
  const getInputValue = (key: string, defaultValue: number): string => {
    return inputValues[key] !== undefined ? inputValues[key] : defaultValue.toString();
  };

  // Helper functie voor input change
  const handleInputChange = (key: string, value: string, setter: (value: number) => void) => {
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

  return (
    <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm mb-6">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900 text-center">
          📊 Jouw Energieprofiel
        </CardTitle>
        <p className="text-gray-600 text-center mt-2">
          Vul je verbruik en apparaten in voor accurate berekeningen
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Netbeheerder */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              🏢 Netbeheerder
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="netbeheerder" className="text-sm font-medium text-gray-700">
                Netbeheerder *
              </Label>
              <Select
                value={userProfile.netbeheerder}
                onValueChange={(value: string) => setUserProfile({ ...userProfile, netbeheerder: value })}
              >
                <SelectTrigger className="h-12 border-gray-300">
                  <SelectValue placeholder="Selecteer jouw netbeheerder" />
                </SelectTrigger>
                <SelectContent>
                  {getAlleNetbeheerders().map((netbeheerder) => (
                    <SelectItem key={netbeheerder.naam} value={netbeheerder.naam}>
                      {netbeheerder.naam} (Stroom: €{netbeheerder.kostenStroom}/jaar, Gas: €{netbeheerder.kostenGas}/jaar)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Kies de netbeheerder die bij jouw regio hoort. Dit heeft invloed op de netbeheerkosten.
              </p>
            </div>
          </div>

          {/* Verbruik */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              ⚡ Energieverbruik
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="jaarverbruikStroom" className="text-sm font-medium text-gray-700">
                    Totaal Jaarverbruik Stroom (kWh)
                  </Label>
                  <div className="group relative">
                    <span className="text-blue-500 cursor-help text-sm">ℹ️</span>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                      Je totale jaarverbruik aan elektriciteit. Wordt automatisch verdeeld in 40% normaal en 60% dal verbruik.
                    </div>
                  </div>
                </div>
                <Input
                  id="jaarverbruikStroom"
                  type="number"
                  value={getInputValue('jaarverbruikStroom', userProfile.jaarverbruikStroom)}
                  onChange={(e) => {
                    const totaal = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                    const piek = Math.round(totaal * 0.4);
                    const dal = Math.round(totaal * 0.6);
                    handleInputChange('jaarverbruikStroom', e.target.value, () => {
                      setUserProfile({ 
                        ...userProfile, 
                        jaarverbruikStroom: totaal,
                        jaarverbruikStroomPiek: piek,
                        jaarverbruikStroomDal: dal
                      });
                    });
                  }}
                  className="h-12"
                  placeholder="Bijv. 2900"
                />
                <p className="text-xs text-gray-500">Automatisch verdeeld: {userProfile.jaarverbruikStroomPiek} kWh normaal, {userProfile.jaarverbruikStroomDal} kWh dal</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="jaarverbruikStroomPiek" className="text-sm font-medium text-gray-700">
                      Normaal Verbruik (kWh)
                    </Label>
                    <div className="group relative">
                      <span className="text-blue-500 cursor-help text-sm">ℹ️</span>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                        Verbruik tijdens normale uren (werkdagen 7:00-23:00). Meestal duurder dan dal tarief.
                      </div>
                    </div>
                  </div>
                  <Input
                    id="jaarverbruikStroomPiek"
                    type="number"
                    value={getInputValue('jaarverbruikStroomPiek', userProfile.jaarverbruikStroomPiek)}
                    onChange={(e) => {
                      const normaal = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                      const dal = userProfile.jaarverbruikStroomDal;
                      handleInputChange('jaarverbruikStroomPiek', e.target.value, () => {
                        setUserProfile({ 
                          ...userProfile, 
                          jaarverbruikStroomPiek: normaal,
                          jaarverbruikStroom: normaal + dal
                        });
                      });
                    }}
                    className="h-12"
                    placeholder="Bijv. 1160"
                    title="Verbruik tijdens normale uren (meestal werkdagen 7:00-23:00). Dit tarief is meestal hoger dan het dal tarief."
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="jaarverbruikStroomDal" className="text-sm font-medium text-gray-700">
                      Dal Verbruik (kWh)
                    </Label>
                    <div className="group relative">
                      <span className="text-blue-500 cursor-help text-sm">ℹ️</span>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                        Verbruik tijdens daluren (nacht 23:00-7:00 en weekenden). Meestal goedkoper dan normaal tarief.
                      </div>
                    </div>
                  </div>
                  <Input
                    id="jaarverbruikStroomDal"
                    type="number"
                    value={getInputValue('jaarverbruikStroomDal', userProfile.jaarverbruikStroomDal)}
                    onChange={(e) => {
                      const dal = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                      const piek = userProfile.jaarverbruikStroomPiek;
                      handleInputChange('jaarverbruikStroomDal', e.target.value, () => {
                        setUserProfile({ 
                          ...userProfile, 
                          jaarverbruikStroomDal: dal,
                          jaarverbruikStroom: piek + dal
                        });
                      });
                    }}
                    className="h-12"
                    placeholder="Bijv. 1740"
                    title="Verbruik tijdens daluren (meestal nacht 23:00-7:00 en weekenden). Dit tarief is meestal lager dan het normale tarief."
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="jaarverbruikGas" className="text-sm font-medium text-gray-700">
                      Jaarverbruik Gas (m³)
                    </Label>
                    <div className="group relative">
                      <span className="text-blue-500 cursor-help text-sm">ℹ️</span>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                        Jaarverbruik in kubieke meters voor verwarming, warm water en koken. Gemiddeld 1200-1500 m³/jaar.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="geenGas"
                      checked={userProfile.geenGas}
                      onChange={(e) => setUserProfile({ ...userProfile, geenGas: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <Label htmlFor="geenGas" className="text-sm text-gray-600 font-normal">
                      Geen gas
                    </Label>
                  </div>
                </div>
                
                {!userProfile.geenGas ? (
                  <Input
                    id="jaarverbruikGas"
                    type="number"
                    value={getInputValue('jaarverbruikGas', userProfile.jaarverbruikGas)}
                    onChange={(e) => handleInputChange('jaarverbruikGas', e.target.value, (value) => setUserProfile({ ...userProfile, jaarverbruikGas: value }))}
                    className="h-12"
                    placeholder="Bijv. 1450"
                    title="Je jaarverbruik aan gas in kubieke meters (m³). Gemiddeld verbruikt een huishouden 1200-1500 m³ per jaar. Gas wordt gebruikt voor verwarming, warm water en koken."
                  />
                ) : (
                  <div className="h-12 bg-gray-50 border border-gray-200 rounded-md flex items-center px-3 text-gray-500 text-sm">
                    Geen gas verbruik - alleen elektriciteit wordt berekend
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Zonnepanelen */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              ☀️ Zonnepanelen
            </h3>
            
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <input
                type="checkbox"
                id="heeftZonnepanelen"
                checked={userProfile.heeftZonnepanelen}
                onChange={(e) => setUserProfile({ ...userProfile, heeftZonnepanelen: e.target.checked })}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <Label htmlFor="heeftZonnepanelen" className="text-sm font-medium text-gray-700 cursor-pointer">
                ☀️ Ik heb zonnepanelen
              </Label>
            </div>

            {userProfile.heeftZonnepanelen && (
              <div className="space-y-4 p-6 bg-green-50 rounded-xl border border-green-200">
                <h4 className="font-semibold text-green-800">☀️ Zonnepanelen Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="pvOpwek" className="text-sm font-medium text-green-700">
                        Jaarproductie (kWh)
                      </Label>
                      <div className="group relative">
                        <span className="text-blue-500 cursor-help text-sm">ℹ️</span>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                          Totale kWh die je zonnepanelen per jaar opwekken. Gemiddeld 3000-4000 kWh voor 10 panelen.
                        </div>
                      </div>
                    </div>
                    <Input
                      id="pvOpwek"
                      type="number"
                      value={getInputValue('pvOpwek', userProfile.pvOpwek || 0)}
                      onChange={(e) => handleInputChange('pvOpwek', e.target.value, (value) => setUserProfile({ ...userProfile, pvOpwek: value }))}
                      className="h-12 border-green-300"
                      placeholder="Bijv. 3500"
                      title="De totale jaarproductie van je zonnepanelen in kWh. Een gemiddeld systeem van 10 panelen produceert ongeveer 3000-4000 kWh per jaar."
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="percentageZelfverbruik" className="text-sm font-medium text-green-700">
                        Zelfverbruik (%)
                      </Label>
                      <div className="group relative">
                        <span className="text-blue-500 cursor-help text-sm">ℹ️</span>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                          Percentage dat je direct zelf gebruikt. Gemiddeld 30-40%. Rest wordt teruggeleverd.
                        </div>
                      </div>
                    </div>
                    <Input
                      id="percentageZelfverbruik"
                      type="number"
                      min="0"
                      max="100"
                      value={getInputValue('percentageZelfverbruik', userProfile.percentageZelfverbruik || 0)}
                      onChange={(e) => handleInputChange('percentageZelfverbruik', e.target.value, (value) => setUserProfile({ ...userProfile, percentageZelfverbruik: value }))}
                      className="h-12 border-green-300"
                      placeholder="Bijv. 35"
                      title="Het percentage van je zonnepaneel productie dat je direct zelf gebruikt. Gemiddeld is dit 30-40%. De rest wordt teruggeleverd aan het net."
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
