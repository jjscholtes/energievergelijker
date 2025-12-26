'use client';

import { lazy, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DynamicCostResult } from '@/types/dynamicContracts';

// Lazy load Recharts
const BarChart = lazy(() => import('recharts').then(mod => ({ default: mod.BarChart })));
const Bar = lazy(() => import('recharts').then(mod => ({ default: mod.Bar })));
const XAxis = lazy(() => import('recharts').then(mod => ({ default: mod.XAxis })));
const YAxis = lazy(() => import('recharts').then(mod => ({ default: mod.YAxis })));
const CartesianGrid = lazy(() => import('recharts').then(mod => ({ default: mod.CartesianGrid })));
const Tooltip = lazy(() => import('recharts').then(mod => ({ default: mod.Tooltip })));
const ResponsiveContainer = lazy(() => import('recharts').then(mod => ({ default: mod.ResponsiveContainer })));

interface DynamicResultsProps {
  result: DynamicCostResult;
  isLoading: boolean;
}

export function DynamicResults({ result, isLoading }: DynamicResultsProps) {
  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Berekenen van dynamische kosten...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return null;
  }

  // Voor Monte Carlo resultaten
  if (result.median !== undefined) {
    const monteCarloData = [
      { name: 'P10', value: result.P10 || 0, color: '#10b981' },
      { name: 'Mediaan', value: result.median, color: '#3b82f6' },
      { name: 'Gemiddelde', value: result.mean || 0, color: '#8b5cf6' },
      { name: 'P90', value: result.P90 || 0, color: '#f59e0b' }
    ];

    return (
      <div className="w-full max-w-6xl mx-auto space-y-6">
        {/* Monte Carlo Resultaten */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Monte Carlo Risicoanalyse
              <Badge variant="outline">Geavanceerd</Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Statistische analyse van mogelijke kosten op basis van historische prijsvariatie
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">€{result.P10?.toFixed(0)}</div>
                <div className="text-sm text-muted-foreground">P10 (10% kans)</div>
                <div className="text-xs text-gray-500">Optimistisch scenario</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">€{result.median?.toFixed(0)}</div>
                <div className="text-sm text-muted-foreground">Mediaan (50% kans)</div>
                <div className="text-xs text-gray-500">Meest waarschijnlijk</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">€{result.mean?.toFixed(0)}</div>
                <div className="text-sm text-muted-foreground">Gemiddelde</div>
                <div className="text-xs text-gray-500">Verwacht gemiddelde</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">€{result.P90?.toFixed(0)}</div>
                <div className="text-sm text-muted-foreground">P90 (90% kans)</div>
                <div className="text-xs text-gray-500">Pessimistisch scenario</div>
              </div>
            </div>

            {/* Variatie grafiek */}
            <div className="h-64">
              <Suspense fallback={<div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monteCarloData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`€${Number(value).toFixed(0)}`, 'Kosten']} />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </Suspense>
            </div>

            {/* Risico informatie */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Risico Analyse</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Standaarddeviatie:</span> €{result.std?.toFixed(0)}
                </div>
                <div>
                  <span className="font-medium">Variatiecoëfficiënt:</span> {result.std && result.mean ? ((result.std / result.mean) * 100).toFixed(1) : 0}%
                </div>
                <div>
                  <span className="font-medium">Risico bandbreedte:</span> €{((result.P90 || 0) - (result.P10 || 0)).toFixed(0)}
                </div>
                <div>
                  <span className="font-medium">95% betrouwbaarheidsinterval:</span> €{((result.mean || 0) - 2 * (result.std || 0)).toFixed(0)} - €{((result.mean || 0) + 2 * (result.std || 0)).toFixed(0)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interpretatie */}
        <Card>
          <CardHeader>
            <CardTitle>Wat betekenen deze resultaten?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-gray-600">
              <p>
                <strong>P10 (€{result.P10?.toFixed(0)}):</strong> In 10% van de gevallen zullen je kosten lager zijn dan dit bedrag. 
                Dit is een optimistisch scenario met lage energieprijzen.
              </p>
              <p>
                <strong>Mediaan (€{result.median?.toFixed(0)}):</strong> In 50% van de gevallen zullen je kosten lager zijn dan dit bedrag. 
                Dit is de meest waarschijnlijke uitkomst.
              </p>
              <p>
                <strong>P90 (€{result.P90?.toFixed(0)}):</strong> In 90% van de gevallen zullen je kosten lager zijn dan dit bedrag. 
                Dit is een pessimistisch scenario met hoge energieprijzen.
              </p>
              <p>
                <strong>Standaarddeviatie (€{result.std?.toFixed(0)}):</strong> Dit geeft aan hoe veel de kosten kunnen variëren. 
                Een hogere waarde betekent meer onzekerheid in de kosten.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Voor eenvoudige berekening
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Dynamische Kosten Berekening</CardTitle>
        <p className="text-sm text-muted-foreground">
          Geschatte jaarlijkse kosten op basis van uurtarieven
        </p>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div className="text-4xl font-bold text-green-600 mb-2">
            €{result.totalCost?.toFixed(0)}
          </div>
          <div className="text-lg text-muted-foreground mb-4">per jaar</div>
          <div className="text-sm text-gray-500">
            Gebaseerd op dynamische uurtarieven en jouw verbruiksprofiel
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">💡 Dynamische Contracten</h4>
          <p className="text-sm text-blue-700">
            Dynamische contracten volgen de spotmarktprijzen en kunnen voordelig zijn als je flexibel bent 
            met je energieverbruik. Je betaalt de werkelijke marktprijs per uur.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}


