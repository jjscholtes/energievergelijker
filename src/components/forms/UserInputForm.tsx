'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCalculationStore } from '@/stores/calculationStore';
import { userProfileSchema, UserProfileInput } from '@/lib/utils/validation';
import { getAlleNetbeheerders } from '@/lib/data/netbeheerders';

export function UserInputForm() {
  const { setUserProfile, isLoading } = useCalculationStore();
  const [formData, setFormData] = useState<UserProfileInput>({
    postcode: '',
    netbeheerder: '',
    aansluitingElektriciteit: '1x25A',
    aansluitingGas: 'G4',
    jaarverbruikStroom: 2900,
    jaarverbruikGas: 1200,
    heeftZonnepanelen: false,
    pvOpwek: 0,
    percentageZelfverbruik: 35,
    heeftWarmtepomp: false,
    heeftElektrischeAuto: false,
    geenGas: false,
    piekDalVerdeling: {
      piek: 0.4,
      dal: 0.6
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});


  const handleInputChange = <Field extends keyof UserProfileInput>(field: Field, value: UserProfileInput[Field]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = userProfileSchema.parse(formData);
      setUserProfile(validatedData);
    } catch (error) {
      const newErrors: Record<string, string> = {};
      if (error instanceof Error) {
        const issues = (error as { errors?: Array<{ path: [keyof UserProfileInput]; message: string }> }).errors;
        if (Array.isArray(issues)) {
          issues.forEach((err) => {
            newErrors[err.path[0]] = err.message;
          });
        }
      }
      setErrors(newErrors);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-full text-sm font-bold mb-6 shadow-lg">
          <span>🎯</span>
          <span>Vergelijk nu en bespaar tot €800 per jaar</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Vul je gegevens in voor een persoonlijke vergelijking
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Dit duurt slechts 2 minuten en helpt ons om de beste energiecontracten voor jou te vinden.
        </p>
      </div>

      <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl font-bold text-gray-900 text-center">
            Energieprofiel
          </CardTitle>
          <p className="text-gray-600 text-center mt-2">
            Vul je gegevens in om de beste energiecontracten te vinden
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basisgegevens */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                📍 Basisgegevens
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="postcode" className="text-sm font-medium text-gray-700">
                    Postcode
                  </Label>
                  <Input
                    id="postcode"
                    placeholder="1234AB"
                    value={formData.postcode}
                    onChange={(e) => handleInputChange('postcode', e.target.value)}
                    className={`h-12 ${errors.postcode ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.postcode && <p className="text-sm text-red-500">{errors.postcode}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="netbeheerder" className="text-sm font-medium text-gray-700">
                    Netbeheerder *
                  </Label>
                  <Select
                    value={formData.netbeheerder}
                    onValueChange={(value: string) => handleInputChange('netbeheerder', value)}
                  >
                    <SelectTrigger className={`h-12 ${errors.netbeheerder ? 'border-red-500' : 'border-gray-300'}`}>
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
                  {errors.netbeheerder && <p className="text-sm text-red-500">{errors.netbeheerder}</p>}
                  <p className="text-xs text-gray-500">
                    Kies de netbeheerder die bij jouw postcode hoort. Dit heeft invloed op de netbeheerkosten.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="jaarverbruikStroom" className="text-sm font-medium text-gray-700">
                    Jaarverbruik Stroom (kWh)
                  </Label>
                  <Input
                    id="jaarverbruikStroom"
                    type="number"
                    value={formData.jaarverbruikStroom}
                    onChange={(e) => handleInputChange('jaarverbruikStroom', Number(e.target.value))}
                    className={`h-12 ${errors.jaarverbruikStroom ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.jaarverbruikStroom && <p className="text-sm text-red-500">{errors.jaarverbruikStroom}</p>}
                </div>
              </div>

              {/* Gas verbruik met checkbox */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="jaarverbruikGas" className="text-sm font-medium text-gray-700">
                    Jaarverbruik Gas (m³)
                  </Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="geenGas"
                      checked={formData.geenGas}
                      onChange={(e) => handleInputChange('geenGas', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <Label htmlFor="geenGas" className="text-sm text-gray-600 font-normal">
                      Geen gas
                    </Label>
                  </div>
                </div>
                
                {!formData.geenGas ? (
                  <Input
                    id="jaarverbruikGas"
                    type="number"
                    value={formData.jaarverbruikGas}
                    onChange={(e) => handleInputChange('jaarverbruikGas', Number(e.target.value))}
                    className={`h-12 ${errors.jaarverbruikGas ? 'border-red-500' : 'border-gray-300'}`}
                  />
                ) : (
                  <div className="h-12 bg-gray-50 border border-gray-200 rounded-md flex items-center px-3 text-gray-500 text-sm">
                    Geen gas verbruik - alleen elektriciteit wordt berekend
                  </div>
                )}
                {errors.jaarverbruikGas && <p className="text-sm text-red-500">{errors.jaarverbruikGas}</p>}
              </div>
            </div>

            {/* Aansluiting */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                🔌 Aansluiting
              </h3>
              
              <div className={`grid gap-6 ${formData.geenGas ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                <div className="space-y-2">
                  <Label htmlFor="aansluitingElektriciteit" className="text-sm font-medium text-gray-700">
                    Elektriciteit
                  </Label>
                  <select
                    id="aansluitingElektriciteit"
                    value={formData.aansluitingElektriciteit}
                    onChange={(e) => handleInputChange('aansluitingElektriciteit', e.target.value)}
                    className="w-full h-12 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="1x25A">1x25A</option>
                    <option value="1x35A">1x35A</option>
                    <option value="3x25A">3x25A</option>
                    <option value="3x35A">3x35A</option>
                    <option value="3x50A">3x50A</option>
                  </select>
                </div>

                {!formData.geenGas && (
                  <div className="space-y-2">
                    <Label htmlFor="aansluitingGas" className="text-sm font-medium text-gray-700">
                      Gas
                    </Label>
                    <select
                      id="aansluitingGas"
                      value={formData.aansluitingGas}
                      onChange={(e) => handleInputChange('aansluitingGas', e.target.value)}
                      className="w-full h-12 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="G4">G4</option>
                      <option value="G6">G6</option>
                      <option value="G10">G10</option>
                      <option value="G16">G16</option>
                      <option value="G25">G25</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Apparaten */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                🏠 Apparaten
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <input
                    type="checkbox"
                    id="heeftZonnepanelen"
                    checked={formData.heeftZonnepanelen}
                    onChange={(e) => handleInputChange('heeftZonnepanelen', e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <Label htmlFor="heeftZonnepanelen" className="text-sm font-medium text-gray-700 cursor-pointer">
                    ☀️ Zonnepanelen
                  </Label>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <input
                    type="checkbox"
                    id="heeftWarmtepomp"
                    checked={formData.heeftWarmtepomp}
                    onChange={(e) => handleInputChange('heeftWarmtepomp', e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <Label htmlFor="heeftWarmtepomp" className="text-sm font-medium text-gray-700 cursor-pointer">
                    🔥 Warmtepomp
                  </Label>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <input
                    type="checkbox"
                    id="heeftElektrischeAuto"
                    checked={formData.heeftElektrischeAuto}
                    onChange={(e) => handleInputChange('heeftElektrischeAuto', e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <Label htmlFor="heeftElektrischeAuto" className="text-sm font-medium text-gray-700 cursor-pointer">
                    🚗 Elektrische Auto
                  </Label>
                </div>
              </div>

              {/* Zonnepanelen details */}
              {formData.heeftZonnepanelen && (
                <div className="space-y-4 p-6 bg-green-50 rounded-xl border border-green-200">
                  <h4 className="font-semibold text-green-800">☀️ Zonnepanelen Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pvOpwek" className="text-sm font-medium text-green-700">
                        Jaarproductie (kWh)
                      </Label>
                      <Input
                        id="pvOpwek"
                        type="number"
                        value={formData.pvOpwek}
                        onChange={(e) => handleInputChange('pvOpwek', Number(e.target.value))}
                        className="h-12 border-green-300"
                        placeholder="Bijv. 3500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="percentageZelfverbruik" className="text-sm font-medium text-green-700">
                        Zelfverbruik (%)
                      </Label>
                      <Input
                        id="percentageZelfverbruik"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.percentageZelfverbruik}
                        onChange={(e) => handleInputChange('percentageZelfverbruik', Number(e.target.value))}
                        className="h-12 border-green-300"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="space-y-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Berekenen...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span>🚀</span>
                    <span>Vergelijk Contracten</span>
                  </div>
                )}
              </Button>
              
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  ⚡ Vergelijking duurt minder dan 10 seconden
                </p>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}