'use client';

import { useEffect, useMemo, useState, lazy, Suspense, type ReactNode } from 'react';
import { BatteryCalculationResult, ChartDataPoint } from '@/types/battery';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

type ScenarioKey = keyof BatteryCalculationResult['scenarios'];

const euroFormatter = new Intl.NumberFormat('nl-NL', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

const euroFormatterPrecise = new Intl.NumberFormat('nl-NL', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 2,
});

const lastValue = (values: number[]) => (values.length ? values[values.length - 1] : 0);

const getCashflowValue = (values: number[], index: number) =>
  index >= 0 && index < values.length ? values[index] : lastValue(values);

// Lazy load Recharts
const LineChart = lazy(() => import('recharts').then(mod => ({ default: mod.LineChart })));
const Line = lazy(() => import('recharts').then(mod => ({ default: mod.Line })));
const BarChart = lazy(() => import('recharts').then(mod => ({ default: mod.BarChart })));
const Bar = lazy(() => import('recharts').then(mod => ({ default: mod.Bar })));
const XAxis = lazy(() => import('recharts').then(mod => ({ default: mod.XAxis })));
const YAxis = lazy(() => import('recharts').then(mod => ({ default: mod.YAxis })));
const CartesianGrid = lazy(() => import('recharts').then(mod => ({ default: mod.CartesianGrid })));
const Tooltip = lazy(() => import('recharts').then(mod => ({ default: mod.Tooltip })));
const Legend = lazy(() => import('recharts').then(mod => ({ default: mod.Legend })));
const ResponsiveContainer = lazy(() => import('recharts').then(mod => ({ default: mod.ResponsiveContainer })));
const ReferenceLine = lazy(() => import('recharts').then(mod => ({ default: mod.ReferenceLine })));

interface BatteryResultsProps {
  result: BatteryCalculationResult;
}

export function BatteryResults({ result }: BatteryResultsProps) {
  const [showAssumptions, setShowAssumptions] = useState(false);
  const [activeScenarioKey, setActiveScenarioKey] = useState<ScenarioKey>(result.aanbeveling.besteScenario);

  useEffect(() => {
    setActiveScenarioKey(result.aanbeveling.besteScenario);
  }, [result.aanbeveling.besteScenario]);

  const { scenarios, aanbeveling, eigenverbruikImpact, arbitrageStats, aannamen } = result;

  const scenarioMap = useMemo(
    () =>
      ({
        huidig: scenarios.huidig,
        na2027: scenarios.na2027,
        dynamischOptimaal: scenarios.dynamischOptimaal,
      }) as const,
    [scenarios]
  );

  const scenarioEntries = useMemo(
    () => (Object.keys(scenarioMap) as ScenarioKey[]).map(key => ({ key, data: scenarioMap[key] })),
    [scenarioMap]
  );

  const activeScenario = scenarioMap[activeScenarioKey];
  const besteScenario = scenarioMap[result.aanbeveling.besteScenario];

  const cashflowData: ChartDataPoint[] = [];
  for (let i = 0; i <= 15; i++) {
    cashflowData.push({
      jaar: i,
      huidig: i === 0 ? 0 : getCashflowValue(scenarios.huidig.cashflowPerJaar, i - 1),
      na2027: i === 0 ? 0 : getCashflowValue(scenarios.na2027.cashflowPerJaar, i - 1),
      dynamisch: i === 0 ? 0 : getCashflowValue(scenarios.dynamischOptimaal.cashflowPerJaar, i - 1),
    });
  }

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

  const cashflowYearFive =
    activeScenario.cashflowPerJaar[Math.min(4, activeScenario.cashflowPerJaar.length - 1)] ?? 0;

  const kpiCards = [
    {
      title: 'Jaarlijkse besparing',
      value: euroFormatter.format(Math.round(activeScenario.jaarlijkseBesparing.totaal)),
      subtitle: `Verhoogd eigenverbruik + arbitrage (${activeScenario.naam})`,
      tone: activeScenario.jaarlijkseBesparing.totaal >= 0 ? 'positive' : 'negative',
    },
    {
      title: 'Terugverdientijd',
      value: formatYears(activeScenario.terugverdientijd),
      subtitle: activeScenario.rendabel ? 'Binnen 15 jaar levensduur' : 'Let op: buiten economische levensduur',
      tone: activeScenario.rendabel ? 'positive' : 'warning',
    },
    {
      title: 'Cashflow jaar 5',
      value: euroFormatter.format(Math.round(cashflowYearFive)),
      subtitle: 'Cumulatieve cashflow in jaar 5',
      tone: cashflowYearFive >= 0 ? 'positive' : 'neutral',
    },
    {
      title: 'Totale impact (15 jaar)',
      value: euroFormatter.format(Math.round(activeScenario.totaleBesparingOver15Jaar)),
      subtitle: 'Na investering + degradatie',
      tone: activeScenario.totaleBesparingOver15Jaar >= 0 ? 'positive' : 'negative',
    },
  ] as const;

  return (
    <div className="space-y-8">
      <RecommendationBanner
        aanbeveling={aanbeveling}
        besteScenario={besteScenario}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map(card => (
          <KpiCard key={card.title} {...card} />
        ))}
      </div>

      <Card className="border border-slate-200">
        <CardHeader className="pb-0">
          <CardTitle className="text-xl">Vergelijk scenario’s</CardTitle>
          <p className="text-sm text-muted-foreground">
            Kies een scenario om details, cashflow en besparingen door te rekenen.
          </p>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex flex-wrap gap-3">
            {scenarioEntries.map(({ key, data }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveScenarioKey(key)}
                className={cn(
                  'flex flex-1 min-w-[200px] items-start justify-between rounded-xl border px-4 py-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500',
                  activeScenarioKey === key
                    ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-orange-300'
                )}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{data.naam}</span>
                    {data.badge && (
                      <Badge variant="secondary" className="bg-white/70 text-xs uppercase">
                        {data.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{data.beschrijving}</p>
                </div>
                <div className="ml-4 text-right">
                  <div className="text-sm font-semibold text-emerald-600">
                    {euroFormatter.format(Math.round(data.jaarlijkseBesparing.totaal))}
                  </div>
                  <div className="text-xs text-muted-foreground">{formatYears(data.terugverdientijd)}</div>
                </div>
              </button>
            ))}
          </div>

          <ScenarioOverview scenario={activeScenario} />
        </CardContent>
      </Card>

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
                  <th className={cn('text-right py-2 font-semibold', activeScenarioKey === 'huidig' && 'text-orange-600')}>
                    Huidig
                  </th>
                  <th className={cn('text-right py-2 font-semibold', activeScenarioKey === 'na2027' && 'text-orange-600')}>
                    Na 2027
                  </th>
                  <th
                    className={cn(
                      'text-right py-2 font-semibold',
                      activeScenarioKey === 'dynamischOptimaal' && 'text-orange-600'
                    )}
                  >
                    Dynamisch
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b">
                  <td className="py-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Verhoogd eigenverbruik
                  </td>
                  <td className={valueCellClass('huidig', activeScenarioKey)}>
                    {euroFormatter.format(Math.round(scenarios.huidig.jaarlijkseBesparing.verhoogdEigenverbruik))}
                  </td>
                  <td className={valueCellClass('na2027', activeScenarioKey)}>
                    {euroFormatter.format(Math.round(scenarios.na2027.jaarlijkseBesparing.verhoogdEigenverbruik))}
                  </td>
                  <td className={valueCellClass('dynamischOptimaal', activeScenarioKey)}>
                    {euroFormatter.format(
                      Math.round(scenarios.dynamischOptimaal.jaarlijkseBesparing.verhoogdEigenverbruik)
                    )}
                  </td>
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
                    <td className={valueCellClass('huidig', activeScenarioKey)}>
                      {euroFormatter.format(Math.round(scenarios.huidig.jaarlijkseBesparing.vermedenTerugleverkosten))}
                    </td>
                    <td className={valueCellClass('na2027', activeScenarioKey)}>
                      {euroFormatter.format(Math.round(scenarios.na2027.jaarlijkseBesparing.vermedenTerugleverkosten))}
                    </td>
                    <td className={valueCellClass('dynamischOptimaal', activeScenarioKey)}>
                      {euroFormatter.format(
                        Math.round(scenarios.dynamischOptimaal.jaarlijkseBesparing.vermedenTerugleverkosten)
                      )}
                    </td>
                  </tr>
                )}
                <tr className="border-b">
                  <td className="py-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Arbitrage voordeel
                  </td>
                  <td className={valueCellClass('huidig', activeScenarioKey)}>
                    {euroFormatter.format(Math.round(scenarios.huidig.jaarlijkseBesparing.arbitrageVoordeel))}
                  </td>
                  <td className={valueCellClass('na2027', activeScenarioKey)}>
                    {euroFormatter.format(Math.round(scenarios.na2027.jaarlijkseBesparing.arbitrageVoordeel))}
                  </td>
                  <td className={valueCellClass('dynamischOptimaal', activeScenarioKey)}>
                    {euroFormatter.format(Math.round(scenarios.dynamischOptimaal.jaarlijkseBesparing.arbitrageVoordeel))}
                  </td>
                </tr>
                <tr className="font-bold">
                  <td className="py-3">Totaal per jaar</td>
                  <td className={totalCellClass('huidig', activeScenarioKey)}>
                    {euroFormatter.format(Math.round(scenarios.huidig.jaarlijkseBesparing.totaal))}
                  </td>
                  <td className={totalCellClass('na2027', activeScenarioKey)}>
                    {euroFormatter.format(Math.round(scenarios.na2027.jaarlijkseBesparing.totaal))}
                  </td>
                  <td className={totalCellClass('dynamischOptimaal', activeScenarioKey)}>
                    {euroFormatter.format(Math.round(scenarios.dynamischOptimaal.jaarlijkseBesparing.totaal))}
                  </td>
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
          
          <Suspense fallback={<div className="flex justify-center items-center h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div></div>}>
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
                  formatter={(value) => [`€${Math.round(Number(value))}`, '']}
                  labelFormatter={(label) => `Jaar ${label}`}
                />
                <Legend />
                <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                <Line 
                  type="monotone" 
                  dataKey="huidig" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  strokeOpacity={activeScenarioKey === 'huidig' ? 1 : 0.35}
                  name="Huidig (met saldering)"
                />
                <Line 
                  type="monotone" 
                  dataKey="na2027" 
                  stroke="#F97316" 
                  strokeWidth={2}
                  strokeOpacity={activeScenarioKey === 'na2027' ? 1 : 0.35}
                  name="Na 2027 (geen saldering)"
                />
                <Line 
                  type="monotone" 
                  dataKey="dynamisch" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  strokeOpacity={activeScenarioKey === 'dynamischOptimaal' ? 1 : 0.35}
                  name="Dynamisch + Arbitrage"
                />
              </LineChart>
            </ResponsiveContainer>
          </Suspense>
        </Card>

        {/* Besparingen per Scenario */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Jaarlijkse Besparing per Bron</h2>
          <p className="text-sm text-gray-600 mb-4">
            Samenstelling van de jaarlijkse besparing per scenario.
          </p>
          
          <Suspense fallback={<div className="flex justify-center items-center h-[350px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div></div>}>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={savingsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="naam" />
                <YAxis label={{ value: 'Besparing (€/jaar)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => `€${Math.round(Number(value))}`} />
                <Legend />
                <Bar dataKey="eigenverbruik" stackId="a" fill="#10B981" name="Eigenverbruik" />
                <Bar dataKey="terugleverkosten" stackId="a" fill="#F59E0B" name="Terugleverkosten" />
                <Bar dataKey="arbitrage" stackId="a" fill="#3B82F6" name="Arbitrage" />
              </BarChart>
            </ResponsiveContainer>
          </Suspense>
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

function valueCellClass(column: ScenarioKey, active: ScenarioKey) {
  return cn(
    'text-right',
    column === active && 'font-semibold text-orange-600'
  );
}

function totalCellClass(column: ScenarioKey, active: ScenarioKey) {
  return cn(
    'text-right text-emerald-600',
    column === active && 'text-orange-600'
  );
}

function formatYears(years: number) {
  if (years === Infinity) {
    return '> 30 jaar';
  }
  return `${years} jaar`;
}

interface RecommendationBannerProps {
  aanbeveling: BatteryCalculationResult['aanbeveling'];
  besteScenario: BatteryCalculationResult['scenarios'][ScenarioKey];
}

function RecommendationBanner({ aanbeveling, besteScenario }: RecommendationBannerProps) {
  return (
    <Card
      className={cn(
        'p-6',
        aanbeveling.isRendabel ? 'bg-emerald-50 border-emerald-200' : 'bg-orange-50 border-orange-200'
      )}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-1 items-start gap-4">
          {aanbeveling.isRendabel ? (
            <CheckCircle className="w-8 h-8 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-8 h-8 text-orange-600 flex-shrink-0" />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-gray-900">
                {aanbeveling.isRendabel ? 'Potentieel interessant' : 'Beperkt rendabel'}
              </h2>
              <Badge variant="secondary" className="bg-white/80 text-xs uppercase tracking-wide">
                Beste: {besteScenario.naam}
              </Badge>
            </div>
            <p className="text-lg text-gray-700 mt-2">{aanbeveling.korteSamenvatting}</p>
            {aanbeveling.waarschuwingen.length > 0 && (
              <div className="mt-3 space-y-1">
                {aanbeveling.waarschuwingen.map((waarschuwing, index) => (
                  <p key={index} className="flex items-start gap-2 text-sm text-gray-600">
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{waarschuwing}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="rounded-lg border border-white/40 bg-white/70 px-4 py-3 text-sm text-slate-700 shadow-sm">
          <div className="font-semibold text-slate-800">Samenvatting beste scenario</div>
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between">
              <span>Jaarlijkse besparing</span>
              <span className="font-semibold text-emerald-600">
                {euroFormatter.format(Math.round(besteScenario.jaarlijkseBesparing.totaal))}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Terugverdientijd</span>
              <span className="font-semibold">{formatYears(besteScenario.terugverdientijd)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Totaal over 15 jaar</span>
              <span className="font-semibold text-emerald-600">
                {euroFormatter.format(Math.round(besteScenario.totaleBesparingOver15Jaar))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  tone?: 'positive' | 'negative' | 'warning' | 'neutral';
}

function KpiCard({ title, value, subtitle, tone = 'neutral' }: KpiCardProps) {
  const toneClass =
    tone === 'positive'
      ? 'text-emerald-600'
      : tone === 'negative'
      ? 'text-red-600'
      : tone === 'warning'
      ? 'text-orange-600'
      : 'text-slate-800';

  return (
    <Card className="border border-slate-200 bg-white">
      <div className="space-y-2 p-5">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className={cn('text-3xl font-semibold', toneClass)}>{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </Card>
  );
}

function ScenarioOverview({
  scenario,
}: {
  scenario: BatteryCalculationResult['scenarios'][ScenarioKey];
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold text-slate-900">{scenario.naam}</h3>
            {scenario.badge && (
              <Badge variant="outline" className="border-orange-300 text-orange-600">
                {scenario.badge}
              </Badge>
            )}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{scenario.beschrijving}</p>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <ScenarioDetail
              label="Jaarlijkse besparing"
              value={euroFormatterPrecise.format(scenario.jaarlijkseBesparing.totaal)}
              icon={<TrendingUp className="h-4 w-4 text-emerald-600" />}
            />
            <ScenarioDetail
              label="Terugverdientijd"
              value={formatYears(scenario.terugverdientijd)}
              icon={<ClockIcon />}
            />
            <ScenarioDetail
              label="Totale cashflow (15 jaar)"
              value={euroFormatterPrecise.format(scenario.totaleBesparingOver15Jaar)}
              icon={<WalletIcon />}
            />
            <ScenarioDetail
              label="Rendabel binnen 15 jaar"
              value={scenario.rendabel ? 'Ja' : 'Nee'}
              icon={scenario.rendabel ? <CheckCircle className="h-4 w-4 text-emerald-600" /> : <AlertTriangle className="h-4 w-4 text-orange-500" />}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ScenarioDetail({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function ClockIcon() {
  return (
    <svg
      className="h-4 w-4 text-slate-500"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg
      className="h-4 w-4 text-emerald-600"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 7H4a2 2 0 0 0-2 2v8c0 1.1.9 2 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z" />
      <path d="M16 3H4a2 2 0 0 0-2 2v2h18" />
      <path d="M18 12h2" />
    </svg>
  );
}

