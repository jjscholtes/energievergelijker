'use client';

import { useState } from 'react';
import { BatteryCalculationResult, ChartDataPoint } from '@/types/battery';
import { Card } from '@/components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  Battery,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface BatteryResultsProps {
  result: BatteryCalculationResult;
}

export function BatteryResults({ result }: BatteryResultsProps) {
  const [showAssumptions, setShowAssumptions] = useState(false);
  
  const { scenarios, aanbeveling, eigenverbruikImpact, arbitrageStats, aannamen } = result;

  // Prepare chart data
  const cashflowData: ChartDataPoint[] = [];
  for (let i = 0; i <= 15; i++) {
    cashflowData.push({
      jaar: i,
      huidig: i === 0 ? 0 : scenarios.huidig.cashflowPerJaar[i - 1],
      na2027: i === 0 ? 0 : scenarios.na2027.cashflowPerJaar[i - 1],
      dynamisch: i === 0 ? 0 : scenarios.dynamischOptimaal.cashflowPerJaar[i - 1],
    });
  }

  // Prepare savings breakdown data
  const savingsData = [
    {
      naam: 'Huidig',
      eigenverbruik: scenarios.huidig.jaarlijkseBesparing.verhoogdEigenverbruik,
      terugleverkosten: scenarios.huidig.jaarlijkseBesparing.vermedenTerugleverkosten,
      arbitrage: scenarios.huidig.jaarlijkseBesparing.arbitrageVoordeel,
    },
    {
      naam: 'Na 2027',
      eigenverbruik: scenarios.na2027.jaarlijkseBesparing.verhoogdEigenverbruik,
      terugleverkosten: scenarios.na2027.jaarlijkseBesparing.vermedenTerugleverkosten,
      arbitrage: scenarios.na2027.jaarlijkseBesparing.arbitrageVoordeel,
    },
    {
      naam: 'Dynamisch',
      eigenverbruik: scenarios.dynamischOptimaal.jaarlijkseBesparing.verhoogdEigenverbruik,
      terugleverkosten: scenarios.dynamischOptimaal.jaarlijkseBesparing.vermedenTerugleverkosten,
      arbitrage: scenarios.dynamischOptimaal.jaarlijkseBesparing.arbitrageVoordeel,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Aanbeveling Header */}
      <Card className={`p-6 ${aanbeveling.isRendabel ? 'bg-emerald-50 border-emerald-200' : 'bg-orange-50 border-orange-200'}`}>
        <div className="flex items-start gap-4">
          {aanbeveling.isRendabel ? (
            <CheckCircle className="w-8 h-8 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-8 h-8 text-orange-600 flex-shrink-0" />
          )}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {aanbeveling.isRendabel ? 'Potentieel Interessant' : 'Beperkt Rendabel'}
            </h2>
            <p className="text-lg text-gray-700 mb-3">
              {aanbeveling.korteSamenvatting}
            </p>
            {aanbeveling.waarschuwingen.length > 0 && (
              <div className="space-y-1">
                {aanbeveling.waarschuwingen.map((waarschuwing, index) => (
                  <p key={index} className="text-sm text-gray-600 flex items-start gap-2">
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{waarschuwing}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Scenario Cards */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Scenario Vergelijking</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Scenario 1: Huidig */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">{scenarios.huidig.naam}</h3>
              {scenarios.huidig.badge && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                  {scenarios.huidig.badge}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-4">{scenarios.huidig.beschrijving}</p>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Jaarlijkse besparing</p>
                <p className="text-2xl font-bold text-emerald-600">
                  €{Math.round(scenarios.huidig.jaarlijkseBesparing.totaal)}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Terugverdientijd</p>
                <p className="text-2xl font-bold">
                  {scenarios.huidig.terugverdientijd === Infinity 
                    ? '> 30 jaar' 
                    : `${scenarios.huidig.terugverdientijd} jaar`}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Totaal over 15 jaar</p>
                <p className={`text-lg font-bold ${scenarios.huidig.totaleBesparingOver15Jaar > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {scenarios.huidig.totaleBesparingOver15Jaar > 0 ? '+' : ''}
                  €{Math.round(scenarios.huidig.totaleBesparingOver15Jaar)}
                </p>
              </div>
            </div>
          </Card>

          {/* Scenario 2: Na 2027 */}
          <Card className="p-6 hover:shadow-lg transition-shadow border-2 border-orange-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">{scenarios.na2027.naam}</h3>
              {scenarios.na2027.badge && (
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                  {scenarios.na2027.badge}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-4">{scenarios.na2027.beschrijving}</p>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Jaarlijkse besparing</p>
                <p className="text-2xl font-bold text-emerald-600">
                  €{Math.round(scenarios.na2027.jaarlijkseBesparing.totaal)}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Terugverdientijd</p>
                <p className="text-2xl font-bold">
                  {scenarios.na2027.terugverdientijd === Infinity 
                    ? '> 30 jaar' 
                    : `${scenarios.na2027.terugverdientijd} jaar`}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Totaal over 15 jaar</p>
                <p className={`text-lg font-bold ${scenarios.na2027.totaleBesparingOver15Jaar > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {scenarios.na2027.totaleBesparingOver15Jaar > 0 ? '+' : ''}
                  €{Math.round(scenarios.na2027.totaleBesparingOver15Jaar)}
                </p>
              </div>
            </div>
          </Card>

          {/* Scenario 3: Dynamisch */}
          <Card className="p-6 hover:shadow-lg transition-shadow border-2 border-emerald-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">{scenarios.dynamischOptimaal.naam}</h3>
              {scenarios.dynamischOptimaal.badge && (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                  {scenarios.dynamischOptimaal.badge}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-4">{scenarios.dynamischOptimaal.beschrijving}</p>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Jaarlijkse besparing</p>
                <p className="text-2xl font-bold text-emerald-600">
                  €{Math.round(scenarios.dynamischOptimaal.jaarlijkseBesparing.totaal)}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Terugverdientijd</p>
                <p className="text-2xl font-bold">
                  {scenarios.dynamischOptimaal.terugverdientijd === Infinity 
                    ? '> 30 jaar' 
                    : `${scenarios.dynamischOptimaal.terugverdientijd} jaar`}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Totaal over 15 jaar</p>
                <p className={`text-lg font-bold ${scenarios.dynamischOptimaal.totaleBesparingOver15Jaar > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {scenarios.dynamischOptimaal.totaleBesparingOver15Jaar > 0 ? '+' : ''}
                  €{Math.round(scenarios.dynamischOptimaal.totaleBesparingOver15Jaar)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Besparingen Breakdown */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Bronnen van Besparing</h2>
        
        <div className="space-y-4">
          {/* Tabel */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-semibold">Besparingsbron</th>
                  <th className="text-right py-2 font-semibold">Huidig</th>
                  <th className="text-right py-2 font-semibold">Na 2027</th>
                  <th className="text-right py-2 font-semibold">Dynamisch</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b">
                  <td className="py-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Verhoogd eigenverbruik
                  </td>
                  <td className="text-right">€{Math.round(scenarios.huidig.jaarlijkseBesparing.verhoogdEigenverbruik)}</td>
                  <td className="text-right">€{Math.round(scenarios.na2027.jaarlijkseBesparing.verhoogdEigenverbruik)}</td>
                  <td className="text-right">€{Math.round(scenarios.dynamischOptimaal.jaarlijkseBesparing.verhoogdEigenverbruik)}</td>
                </tr>
                {(
                  scenarios.huidig.jaarlijkseBesparing.vermedenTerugleverkosten > 0 ||
                  scenarios.na2027.jaarlijkseBesparing.vermedenTerugleverkosten > 0 ||
                  scenarios.dynamischOptimaal.jaarlijkseBesparing.vermedenTerugleverkosten > 0
                ) && (
                  <tr className="border-b">
                    <td className="py-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      Vermeden terugleverkosten
                    </td>
                    <td className="text-right">€{Math.round(scenarios.huidig.jaarlijkseBesparing.vermedenTerugleverkosten)}</td>
                    <td className="text-right">€{Math.round(scenarios.na2027.jaarlijkseBesparing.vermedenTerugleverkosten)}</td>
                    <td className="text-right">€{Math.round(scenarios.dynamischOptimaal.jaarlijkseBesparing.vermedenTerugleverkosten)}</td>
                  </tr>
                )}
                <tr className="border-b">
                  <td className="py-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Arbitrage voordeel
                  </td>
                  <td className="text-right">€{Math.round(scenarios.huidig.jaarlijkseBesparing.arbitrageVoordeel)}</td>
                  <td className="text-right">€{Math.round(scenarios.na2027.jaarlijkseBesparing.arbitrageVoordeel)}</td>
                  <td className="text-right">€{Math.round(scenarios.dynamischOptimaal.jaarlijkseBesparing.arbitrageVoordeel)}</td>
                </tr>
                <tr className="font-bold">
                  <td className="py-3">Totaal per jaar</td>
                  <td className="text-right text-emerald-600">€{Math.round(scenarios.huidig.jaarlijkseBesparing.totaal)}</td>
                  <td className="text-right text-emerald-600">€{Math.round(scenarios.na2027.jaarlijkseBesparing.totaal)}</td>
                  <td className="text-right text-emerald-600">€{Math.round(scenarios.dynamischOptimaal.jaarlijkseBesparing.totaal)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Grafieken */}
      <div className="space-y-6">
        {/* Cashflow Grafiek */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Cashflow over 15 jaar</h2>
          <p className="text-sm text-gray-600 mb-4">
            Cumulatieve kosten en besparing. Break-even punt geeft aan wanneer de investering is terugverdiend.
          </p>
          
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={cashflowData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="jaar" 
                label={{ value: 'Jaren', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                label={{ value: 'Cumulatieve cashflow (€)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value: number) => [`€${Math.round(value)}`, '']}
                labelFormatter={(label) => `Jaar ${label}`}
              />
              <Legend />
              <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
              <Line 
                type="monotone" 
                dataKey="huidig" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Huidig (met saldering)"
              />
              <Line 
                type="monotone" 
                dataKey="na2027" 
                stroke="#F97316" 
                strokeWidth={2}
                name="Na 2027 (geen saldering)"
              />
              <Line 
                type="monotone" 
                dataKey="dynamisch" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Dynamisch + Arbitrage"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Besparingen per Scenario */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Jaarlijkse Besparing per Bron</h2>
          <p className="text-sm text-gray-600 mb-4">
            Samenstelling van de jaarlijkse besparing per scenario.
          </p>
          
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={savingsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="naam" />
              <YAxis label={{ value: 'Besparing (€/jaar)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value: number) => `€${Math.round(value)}`} />
              <Legend />
              <Bar dataKey="eigenverbruik" stackId="a" fill="#10B981" name="Eigenverbruik" />
              <Bar dataKey="terugleverkosten" stackId="a" fill="#F59E0B" name="Terugleverkosten" />
              <Bar dataKey="arbitrage" stackId="a" fill="#3B82F6" name="Arbitrage" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Eigenverbruik Impact */}
      {eigenverbruikImpact && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Impact op Eigenverbruik</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-orange-600" />
                Zonder Accu
              </h3>
              <div className="space-y-1 text-sm">
                <p>Eigenverbruik: <span className="font-semibold">{Math.round(eigenverbruikImpact.zonderAccu.eigenverbruikKwh)} kWh</span></p>
                <p>Teruglevering: <span className="font-semibold">{Math.round(eigenverbruikImpact.zonderAccu.terugleveringKwh)} kWh</span></p>
                <p>Afname van net: <span className="font-semibold">{Math.round(eigenverbruikImpact.zonderAccu.afnameNetKwh)} kWh</span></p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Met Accu
              </h3>
              <div className="space-y-1 text-sm">
                <p>Eigenverbruik: <span className="font-semibold text-emerald-600">{Math.round(eigenverbruikImpact.metAccu.eigenverbruikKwh)} kWh (+{Math.round(eigenverbruikImpact.verbetering.extraEigenverbruikKwh)})</span></p>
                <p>Teruglevering: <span className="font-semibold text-emerald-600">{Math.round(eigenverbruikImpact.metAccu.terugleveringKwh)} kWh (-{Math.round(eigenverbruikImpact.verbetering.minderTerugleveringKwh)})</span></p>
                <p>Afname van net: <span className="font-semibold text-emerald-600">{Math.round(eigenverbruikImpact.metAccu.afnameNetKwh)} kWh (-{Math.round(eigenverbruikImpact.verbetering.minderAfnameKwh)})</span></p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-blue-300">
            <p className="font-semibold text-emerald-700">
              Financieel voordeel eigenverbruik: €{Math.round(eigenverbruikImpact.verbetering.financieelVoordeel)} per jaar
            </p>
          </div>
        </Card>
      )}

      {/* Arbitrage Stats */}
      {arbitrageStats && arbitrageStats.jaarlijkseWinst > 0 && (
        <Card className="p-6 bg-emerald-50 border-emerald-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Arbitrage Analyse</h2>
          
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Gemiddelde prijsspread</p>
              <p className="text-xl font-bold">€{arbitrageStats.gemiddeldeSpread.toFixed(3)}/kWh</p>
            </div>
            <div>
              <p className="text-gray-600">Geschat aantal cycli per jaar</p>
              <p className="text-xl font-bold">{arbitrageStats.aantalCycliPerJaar} cycli</p>
            </div>
            <div>
              <p className="text-gray-600">Negatieve prijs uren</p>
              <p className="text-xl font-bold">{arbitrageStats.negatievePrijsUren} uur</p>
            </div>
            <div>
              <p className="text-gray-600">Jaarlijkse arbitrage winst</p>
              <p className="text-xl font-bold text-emerald-600">€{Math.round(arbitrageStats.jaarlijkseWinst)}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Aannamen */}
      <Card className="p-6">
        <button
          onClick={() => setShowAssumptions(!showAssumptions)}
          className="w-full flex items-center justify-between text-left"
        >
          <h2 className="text-xl font-bold text-gray-900">Belangrijke Aannamen</h2>
          {showAssumptions ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>
        
        {showAssumptions && (
          <div className="mt-4 space-y-2 text-sm">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Round-trip efficiency</p>
                <p className="font-semibold">{(aannamen.roundTripEfficiency * 100).toFixed(0)}%</p>
              </div>
              <div>
                <p className="text-gray-600">Degradatie</p>
                <p className="font-semibold">{aannamen.degradatie}</p>
              </div>
              <div>
                <p className="text-gray-600">Energiebelasting</p>
                <p className="font-semibold">€{aannamen.energiebelasting.toFixed(4)}/kWh</p>
              </div>
              {aannamen.aantalCycli > 0 && (
                <div>
                  <p className="text-gray-600">Aantal cycli per jaar</p>
                  <p className="font-semibold">{aannamen.aantalCycli} cycli</p>
                </div>
              )}
              <div>
                <p className="text-gray-600">Saldering tot 2027</p>
                <p className="font-semibold">{aannamen.salderingTot2027 ? 'Ja, 100%' : 'Nee'}</p>
              </div>
              <div>
                <p className="text-gray-600">Minimale vergoeding vanaf 2027</p>
                <p className="font-semibold">{aannamen.minimaleVergoeding2027}</p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <p className="text-gray-600 text-xs">
                <strong>Let op:</strong> Deze berekeningen zijn gebaseerd op conservatieve aannames en historische data. 
                Werkelijke resultaten kunnen afwijken door veranderingen in energieprijzen, beleid, en persoonlijk gebruik.
                Prijsstijgingen zijn niet meegenomen in deze berekening.
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

