'use client';

import { lazy, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PvOpbrengsten } from '@/types/calculations';

// Lazy load Recharts
const PieChart = lazy(() => import('recharts').then(mod => ({ default: mod.PieChart })));
const Pie = lazy(() => import('recharts').then(mod => ({ default: mod.Pie })));
const Cell = lazy(() => import('recharts').then(mod => ({ default: mod.Cell })));
const ResponsiveContainer = lazy(() => import('recharts').then(mod => ({ default: mod.ResponsiveContainer })));
const BarChart = lazy(() => import('recharts').then(mod => ({ default: mod.BarChart })));
const Bar = lazy(() => import('recharts').then(mod => ({ default: mod.Bar })));
const XAxis = lazy(() => import('recharts').then(mod => ({ default: mod.XAxis })));
const YAxis = lazy(() => import('recharts').then(mod => ({ default: mod.YAxis })));
const CartesianGrid = lazy(() => import('recharts').then(mod => ({ default: mod.CartesianGrid })));
const Tooltip = lazy(() => import('recharts').then(mod => ({ default: mod.Tooltip })));
const Legend = lazy(() => import('recharts').then(mod => ({ default: mod.Legend })));

interface PVBreakdownChartProps {
  pvData: PvOpbrengsten;
}

export function PVBreakdownChart({ pvData }: PVBreakdownChartProps) {
  // Data voor pie chart
  const pieData = [
    { 
      name: 'Zelf verbruikt', 
      value: pvData.zelfVerbruikKwh, 
      fill: '#3b82f6',
      euro: pvData.zelfVerbruikWaarde
    },
    { 
      name: 'Gesaldeerd', 
      value: pvData.gesaldeerdKwh, 
      fill: '#10b981',
      euro: pvData.salderingsBesparing
    },
    { 
      name: 'Teruggeleverd', 
      value: pvData.nettoTerugleveringKwh, 
      fill: '#f59e0b',
      euro: pvData.terugleververgoedingBedrag
    }
  ];

  // Data voor bar chart (kWh en €)
  const barData = [
    {
      categorie: 'Zelf verbruikt',
      kwh: pvData.zelfVerbruikKwh,
      euro: pvData.zelfVerbruikWaarde,
      color: '#3b82f6'
    },
    {
      categorie: 'Gesaldeerd',
      kwh: pvData.gesaldeerdKwh,
      euro: pvData.salderingsBesparing,
      color: '#10b981'
    },
    {
      categorie: 'Teruggeleverd',
      kwh: pvData.nettoTerugleveringKwh,
      euro: pvData.terugleververgoedingBedrag,
      color: '#f59e0b'
    }
  ];

  const totalKwh = pvData.zelfVerbruikKwh + pvData.gesaldeerdKwh + pvData.nettoTerugleveringKwh;
  const totalEuro = pvData.zelfVerbruikWaarde + pvData.salderingsBesparing + pvData.terugleververgoedingBedrag;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">☀️ Je Zonnepanelen Opbrengsten</h2>
        <p className="text-lg text-gray-600">
          Bekijk precies hoe je zonneproductie wordt verdeeld en wat het je oplevert
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6 text-center">
            <div className="text-3xl mb-2">⚡</div>
            <h3 className="font-bold text-blue-900 text-lg mb-2">Zelf Verbruikt</h3>
            <div className="text-2xl font-bold text-blue-800 mb-1">
              {pvData.zelfVerbruikKwh.toFixed(0)} kWh
            </div>
            <div className="text-sm text-blue-700">
              €{pvData.zelfVerbruikWaarde.toFixed(0)} waarde
            </div>
            <div className="text-xs text-blue-600 mt-2">
              {((pvData.zelfVerbruikKwh / totalKwh) * 100).toFixed(1)}% van totaal
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6 text-center">
            <div className="text-3xl mb-2">💰</div>
            <h3 className="font-bold text-green-900 text-lg mb-2">Gesaldeerd</h3>
            <div className="text-2xl font-bold text-green-800 mb-1">
              {pvData.gesaldeerdKwh.toFixed(0)} kWh
            </div>
            <div className="text-sm text-green-700">
              €{pvData.salderingsBesparing.toFixed(0)} bespaard
            </div>
            <div className="text-xs text-green-600 mt-2">
              {((pvData.gesaldeerdKwh / totalKwh) * 100).toFixed(1)}% van totaal
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6 text-center">
            <div className="text-3xl mb-2">📤</div>
            <h3 className="font-bold text-orange-900 text-lg mb-2">Teruggeleverd</h3>
            <div className="text-2xl font-bold text-orange-800 mb-1">
              {pvData.nettoTerugleveringKwh.toFixed(0)} kWh
            </div>
            <div className="text-sm text-orange-700">
              €{pvData.terugleververgoedingBedrag.toFixed(0)} vergoeding
            </div>
            <div className="text-xs text-orange-600 mt-2">
              {((pvData.nettoTerugleveringKwh / totalKwh) * 100).toFixed(1)}% van totaal
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Total Savings Highlight */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-6 text-center">
          <div className="text-4xl mb-3">🎉</div>
          <h3 className="text-2xl font-bold text-green-800 mb-2">Totale PV Opbrengst</h3>
          <div className="text-4xl font-bold text-green-700 mb-2">
            €{totalEuro.toFixed(0)}
          </div>
          <p className="text-green-600">
            Dat is €{(totalEuro / 12).toFixed(0)} per maand extra in je portemonnee!
          </p>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Verdeling van Zonneproductie</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="flex justify-center items-center h-[300px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }: any) => `${name}: ${value.toFixed(0)} kWh`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any, name: any, props: any) => [
                      `${value.toFixed(0)} kWh (€${props.payload.euro.toFixed(0)})`,
                      name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Suspense>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Opbrengsten per Categorie</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="flex justify-center items-center h-[300px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="categorie" />
                  <YAxis yAxisId="kwh" orientation="left" />
                  <YAxis yAxisId="euro" orientation="right" />
                  <Tooltip 
                    formatter={(value: any, name: any) => [
                      name === 'kwh' ? `${value.toFixed(0)} kWh` : `€${value.toFixed(0)}`,
                      name === 'kwh' ? 'kWh' : 'Euro'
                    ]}
                  />
                  <Legend />
                  <Bar 
                    yAxisId="kwh" 
                    dataKey="kwh" 
                    fill="#8884d8" 
                    name="kWh"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    yAxisId="euro" 
                    dataKey="euro" 
                    fill="#82ca9d" 
                    name="Euro"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Suspense>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-center">Gedetailleerde Uitleg</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                Zelf Verbruikt
              </h4>
              <p className="text-sm text-gray-600">
                De energie die je direct in huis gebruikt wanneer je zonnepanelen produceren. 
                Dit bespaart je de volledige energiekosten inclusief belastingen.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-green-800 flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                Gesaldeerd
              </h4>
              <p className="text-sm text-gray-600">
                De energie die je teruglevert aan het net en later weer afneemt. 
                Je krijgt de volledige energiekosten terug via de salderingsregeling.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-orange-800 flex items-center gap-2">
                <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                Teruggeleverd
              </h4>
              <p className="text-sm text-gray-600">
                De energie die je meer produceert dan je verbruikt. 
                Je krijgt hiervoor een terugleververgoeding van je energieleverancier.
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <p className="text-blue-800 text-sm">
              <strong>💡 Tip:</strong> Door je zelfverbruik te verhogen (bijvoorbeeld door een thuisbatterij 
              of slimme apparaten) kun je nog meer besparen op je energierekening!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

