'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DynamicCalcParams, DynamicCostResult } from '@/types/dynamicContracts';
import { calculatePriceStats } from '@/lib/calculations/annualCostCalculator';
import { sampleCSV2024, sampleCSV2025, generateRealisticCSVData } from '@/lib/data/sampleDynamicData';

interface DynamicContractFormProps {
  onCalculate: (params: DynamicCalcParams) => Promise<DynamicCostResult>;
  isLoading: boolean;
}

export function DynamicContractForm({ onCalculate, isLoading }: DynamicContractFormProps) {
  const [formData, setFormData] = useState<DynamicCalcParams>({
    csvData2024: '',
    csvData2025: '',
    baseLoad: 0.5,
    fixedCosts: 0,
    year: '2024',
    monteCarlo: false,
    mcIterations: 500,
    mcBlockDays: 7
  });

  const [csvStats, setCsvStats] = useState<{
    2024: ReturnType<typeof calculatePriceStats> | null;
    2025: ReturnType<typeof calculatePriceStats> | null;
  }>({ 2024: null, 2025: null });

  const [error, setError] = useState<string | null>(null);

  // Laad vooraf gedefinieerde CSV data bij component mount
  useEffect(() => {
    const loadPredefinedData = () => {
      // Gebruik realistischere data voor een volledig jaar
      const csv2024 = generateRealisticCSVData(2024, 0.15);
      const csv2025 = generateRealisticCSVData(2025, 0.15);
      
      setFormData(prev => ({
        ...prev,
        csvData2024: csv2024,
        csvData2025: csv2025
      }));

      // Bereken statistieken
      try {
        const stats2024 = calculatePriceStats(csv2024);
        const stats2025 = calculatePriceStats(csv2025);
        setCsvStats({ 2024: stats2024, 2025: stats2025 });
      } catch (err) {
        console.warn('Fout bij berekenen statistieken:', err);
      }
    };

    loadPredefinedData();
  }, []);

  const handleInputChange = (field: keyof DynamicCalcParams, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await onCalculate(formData);
    } catch (err: any) {
      setError(err.message || 'Er is een fout opgetreden bij de berekening');
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Dynamische Contracten Calculator</span>
          <Badge variant="secondary">Nieuw</Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Bereken kosten voor dynamische energiecontracten met uurtarieven
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Prijsdata Informatie */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Dynamische Uurtarieven</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-green-600 font-semibold">2024 Data</span>
                  <Badge variant="secondary" className="text-xs">Geladen</Badge>
                </div>
                {csvStats[2024] && (
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Gemiddelde: <span className="font-medium">€{csvStats[2024].average.toFixed(3)}/kWh</span></div>
                    <div>Min: €{csvStats[2024].min.toFixed(3)} | Max: €{csvStats[2024].max.toFixed(3)}</div>
                    <div>Mediaan: €{csvStats[2024].median.toFixed(3)}</div>
                  </div>
                )}
              </div>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-blue-600 font-semibold">2025 Data</span>
                  <Badge variant="secondary" className="text-xs">Geladen</Badge>
                </div>
                {csvStats[2025] && (
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Gemiddelde: <span className="font-medium">€{csvStats[2025].average.toFixed(3)}/kWh</span></div>
                    <div>Min: €{csvStats[2025].min.toFixed(3)} | Max: €{csvStats[2025].max.toFixed(3)}</div>
                    <div>Mediaan: €{csvStats[2025].median.toFixed(3)}</div>
                  </div>
                )}
              </div>
            </div>
            <div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded">
              💡 <strong>Tip:</strong> De uurtarieven zijn gebaseerd op historische spotmarktdata en simuleren realistische dag/nacht variaties, weekend effecten en seizoenspatronen.
            </div>
          </div>

          {/* Verbruiksprofielen */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Verbruiksprofielen</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="baseLoad">Basisverbruik (kWh/uur)</Label>
                <Input
                  id="baseLoad"
                  type="number"
                  step="0.1"
                  value={formData.baseLoad}
                  onChange={(e) => handleInputChange('baseLoad', Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Constant basisverbruik van apparaten
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fixedCosts">Vaste Kosten (€/jaar)</Label>
                <Input
                  id="fixedCosts"
                  type="number"
                  value={formData.fixedCosts}
                  onChange={(e) => handleInputChange('fixedCosts', Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Vaste leveringskosten en andere kosten
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Jaar</Label>
                <select
                  id="year"
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                </select>
              </div>
            </div>
          </div>

          {/* Monte Carlo Opties */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="monteCarlo"
                checked={formData.monteCarlo}
                onChange={(e) => handleInputChange('monteCarlo', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="monteCarlo">Monte Carlo Risicoanalyse</Label>
            </div>

            {formData.monteCarlo && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="mcIterations">Aantal Iteraties</Label>
                  <Input
                    id="mcIterations"
                    type="number"
                    min="10"
                    max="10000"
                    value={formData.mcIterations}
                    onChange={(e) => handleInputChange('mcIterations', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mcBlockDays">Blokgrootte (dagen)</Label>
                  <Input
                    id="mcBlockDays"
                    type="number"
                    min="1"
                    max="30"
                    value={formData.mcBlockDays}
                    onChange={(e) => handleInputChange('mcBlockDays', Number(e.target.value))}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Berekenen...' : 'Bereken Dynamische Kosten'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
