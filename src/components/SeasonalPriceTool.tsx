'use client';

import React, { useMemo, useState } from 'react';
import { Info, Snowflake, Sun, Leaf, Droplet, ClipboardList, BatteryCharging } from 'lucide-react';

import {
  calculateSeasonalRealisticPrice,
  ENERGY_TAX_EUR_PER_KWH,
  calculateSolarFeedIn,
  formatMonthName,
  formatPrice,
  HOUSEHOLD_PROFILES,
  HouseholdProfileKey,
  SeasonalPriceCalculation,
  SeasonalPriceBreakdownItem,
  SolarFeedInBreakdown
} from '@/lib/calculations/seasonalRealisticPrice';

const SEASON_ICONS: Record<string, React.ReactElement> = {
  winter: <Snowflake className="w-5 h-5" />,
  spring: <Droplet className="w-5 h-5" />,
  summer: <Sun className="w-5 h-5" />,
  autumn: <Leaf className="w-5 h-5" />
};

const SUPPLIER_MARKUP_EUR_PER_KWH = 0.023;

interface SeasonalPriceToolProps {
  year: number;
}

export function SeasonalPriceTool({ year }: SeasonalPriceToolProps) {
  const [profileKey, setProfileKey] = useState<HouseholdProfileKey>('allElectric');
  const [includeEV, setIncludeEV] = useState<boolean>(false);

  const calculation: SeasonalPriceCalculation = useMemo(
    () => calculateSeasonalRealisticPrice(year, profileKey, { includeEV }),
    [year, profileKey, includeEV]
  );

  const annualCoveragePercent = Math.round(calculation.annualCoverage * 100);
  const hasIncompleteData = annualCoveragePercent < 100;

  const totalAnnualKwh = Math.round(calculation.totalAnnualConsumptionKwh);
  const baseAnnualKwh = Math.round(calculation.baseAnnualConsumptionKwh);
  const evAnnualKwh = Math.round(calculation.evAnnualConsumptionKwh);
  const annualInclTax = calculation.annualAveragePriceInclTax;
  const annualWithMarkup = annualInclTax === null ? null : annualInclTax + SUPPLIER_MARKUP_EUR_PER_KWH;

  return (
    <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-5 py-2 rounded-full text-sm font-semibold shadow">
            <ClipboardList className="w-4 h-4" />
            <span>Realistische kWh-prijs per seizoen</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mt-4">Huishoudprofielen toegepast op marktdata</h2>
          <p className="text-gray-600 mt-2 max-w-2xl">
            We combineren een maandelijkse verbruiksverdeling met bijpassende uurprofielen (nacht-, ochtend- en avondpieken).
            Zo ontstaat een realistisch beeld van hoeveel stroom een huishouden in elk seizoen afneemt tijdens goedkope of dure uren.
          </p>
        </div>
        <div className="w-full md:w-80">
          <label htmlFor="profile" className="block text-sm font-semibold text-gray-700 mb-2">
            Kies een huishoudprofiel
          </label>
          <select
            id="profile"
            value={profileKey}
            onChange={(event) => setProfileKey(event.target.value as HouseholdProfileKey)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            {(Object.values(HOUSEHOLD_PROFILES) ?? []).map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            {HOUSEHOLD_PROFILES[profileKey]?.description}
          </p>
          <div className="mt-4 flex items-start gap-3">
            <input
              id="include-ev"
              type="checkbox"
              checked={includeEV}
              onChange={(event) => setIncludeEV(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="include-ev" className="text-sm text-gray-700 leading-6">
              Ik laad een elektrische auto (extra 2.500 kWh/jaar, gestuurd naar nacht- en daluren)
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-xl p-6">
          <h3 className="text-sm uppercase tracking-wide text-emerald-100 font-semibold">Jaarlijks gewogen gemiddelde</h3>
          <p className="text-4xl md:text-5xl font-extrabold mt-2">
            {formatPrice(calculation.annualAveragePriceExclTax)}
            <span className="text-lg font-semibold text-emerald-100">/kWh</span>
          </p>
          <p className="mt-2 text-sm text-emerald-100">
            Inclusief energiebelasting ({(ENERGY_TAX_EUR_PER_KWH * 100).toFixed(1)}¢): {formatPrice(annualInclTax)}
          </p>
          <p className="text-sm text-emerald-100">
            Inclusief belasting + leverancieropslag (2,3¢): {formatPrice(annualWithMarkup)}
          </p>
          <p className="mt-4 text-xs text-emerald-200 leading-5">
            Gewogen op basis van het elektriciteitsverbruik per maand en de uurverdeling binnen elk seizoen voor het geselecteerde profiel.
            {includeEV ? (
              <span> Totaal {totalAnnualKwh.toLocaleString()} kWh/jaar (huishouden {baseAnnualKwh.toLocaleString()} kWh + EV {evAnnualKwh.toLocaleString()} kWh).</span>
            ) : (
              <span> Totaal {baseAnnualKwh.toLocaleString()} kWh/jaar.</span>
            )}
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-600/10 to-emerald-600/10 border border-emerald-100 rounded-xl p-6">
          <h3 className="text-sm uppercase tracking-wide text-emerald-700 font-semibold">Data dekking {year}</h3>
          <p className="text-4xl font-extrabold text-emerald-700 mt-2">{annualCoveragePercent}%</p>
          <p className="mt-2 text-sm text-emerald-800">
            Beschikbare maanden met marktdata voor dit profiel in {year}.
          </p>
          {hasIncompleteData ? (
            <p className="mt-4 text-xs text-emerald-700">
              Let op: sommige maanden ontbreken. Voor seizoenen met ontbrekende data tonen we “n.v.t.” en verlagen we de weging.
            </p>
          ) : (
            <p className="mt-4 text-xs text-emerald-700">Alle maanden zijn aanwezig voor dit jaar.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {calculation.seasonalBreakdown.map((season) => (
          <SeasonCard key={season.id} season={season} includeEV={calculation.includeEV} />
        ))}
      </div>

      <div className="bg-gradient-to-r from-slate-50 to-emerald-50 border border-emerald-100 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-emerald-900 mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-emerald-600" />
          Hoe deze module werkt
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-emerald-900">
          <ul className="space-y-2 list-disc list-inside">
            <li>Maandverbruik wordt opgesplitst per seizoen en per uur, zodat piek- en daluren meetellen in het gemiddelde.</li>
            <li>We projecteren elk seizoen op een uurprofiel (nacht/ochtend/avondpieken) en matchen die uren met de markttarieven.</li>
            <li>We gebruiken de EPEX spotprijzen per maand zoals op deze pagina getoond.</li>
            <li>De seizoensprijs is gewogen naar het belang van elke maand én de uurverdeling binnen dat seizoen.</li>
          </ul>
          <ul className="space-y-2 list-disc list-inside">
            <li>Aanbevolen voor het inschatten van realistische dynamische contractkosten.</li>
            <li>Gebruik de verschillen tussen seizoenen om load shifting kansen te identificeren.</li>
            <li>De nachtprijs van EV-laden wordt apart meegenomen om slim laden door te rekenen.</li>
          </ul>
        </div>

        <div className="mt-6 text-sm text-emerald-900 space-y-3">
          <p>
            Elk profiel splitst het jaarverbruik eerst per maand (winter vs. zomer). Vervolgens verdelen we die maandkWh over 24 uur aan de hand van het bijbehorende dagpatroon. Het grootste deel van het all-electric winterverbruik valt bijvoorbeeld in de avonduren, terwijl de zomer vlakker is. Deze uurpunten worden daarna gekoppeld aan de daadwerkelijke spotprijzen in dezelfde maand. Voor EV-laden hanteren we het gemiddelde van de nachturen (00:00-06:00) om aanstuurbaar laden te simuleren.
          </p>
          <p>
            Door dit proces per seizoen te herhalen en samen te voegen naar een jaargemiddelde ontstaat een realistische indicatie van wat een huishouden betaalt onder dynamische tarieven, inclusief seizoensverschillen, energiebelasting en een typische leverancieropslag.
          </p>
        </div>

        <ExtraInsights
          breakdown={calculation.seasonalBreakdown}
          includeEV={calculation.includeEV}
          year={year}
        />

        <SolarFeedInInsights year={year} />
      </div>
    </section>
  );
}

function SeasonCard({ season, includeEV }: { season: SeasonalPriceBreakdownItem; includeEV: boolean }) {
  const icon = SEASON_ICONS[season.id] ?? <Leaf className="w-5 h-5" />;
  const seasonSharePercent = Math.round(season.expectedConsumptionShare * 100);
  const availableSharePercent = Math.round(season.availableConsumptionShare * 100);
  const hasEVShare = includeEV && season.evConsumptionKwh > 0;
  const inclTaxWithMarkup =
    season.averagePriceInclTax === null
      ? null
      : season.averagePriceInclTax + SUPPLIER_MARKUP_EUR_PER_KWH;

  return (
    <div className="bg-white/90 border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h4 className="text-lg font-semibold text-gray-900">{season.label}</h4>
          <p className="text-xs text-gray-500">
            {season.months.map((month) => formatMonthName(month)).join(', ')}
          </p>
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-700">
        <div className="flex items-center justify-between">
          <span className="font-medium">Prijs excl. belasting</span>
          <span className="font-semibold text-gray-900">{formatPrice(season.averagePriceExclTax)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Prijs incl. belasting</span>
          <span className="font-semibold text-emerald-700">
            {formatPrice(season.averagePriceInclTax)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Incl. belasting + opslag</span>
          <span className="font-semibold text-emerald-700">{formatPrice(inclTaxWithMarkup)}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Verbruik in seizoen</span>
          <span>{seasonSharePercent}%</span>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Dekking met data</span>
          <span>{availableSharePercent}%</span>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Totaal kWh</span>
          <span>{Math.round(season.totalConsumptionKwh).toLocaleString()} kWh</span>
        </div>
        {hasEVShare && (
          <div className="flex items-center justify-between text-xs text-emerald-600">
            <span className="flex items-center gap-1"><BatteryCharging className="w-3 h-3" />EV in nacht</span>
            <span>{Math.round(season.evConsumptionKwh).toLocaleString()} kWh</span>
          </div>
        )}
      </div>

      {season.missingMonths.length > 0 && (
        <p className="mt-4 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
          Geen marktdata voor {season.missingMonths.map((month) => formatMonthName(month)).join(', ')}.
        </p>
      )}
    </div>
  );
}

function ExtraInsights({
  breakdown,
  includeEV,
  year
}: {
  breakdown: SeasonalPriceBreakdownItem[];
  includeEV: boolean;
  year: number;
}) {
  const enrichSeason = (season: SeasonalPriceBreakdownItem) => {
    const averageInclTax = season.averagePriceInclTax ?? 0;
    const averageInclMarkup = averageInclTax + SUPPLIER_MARKUP_EUR_PER_KWH;
    const baseAverage = season.baseConsumptionKwh > 0 ? season.baseContributionExclTax / season.baseConsumptionKwh : null;
    const evAverage = includeEV && season.evConsumptionKwh > 0 ? season.evContributionExclTax / season.evConsumptionKwh : null;

    return {
      season,
      averageInclMarkup,
      baseAverage,
      evAverage
    };
  };

  const enrichedSeasons = breakdown
    .filter((season) => season.averagePriceInclTax !== null)
    .map(enrichSeason)
    .sort((a, b) => a.averageInclMarkup - b.averageInclMarkup);

  if (enrichedSeasons.length === 0) {
    return null;
  }

  const cheapest = enrichedSeasons[0];
  const priciest = enrichedSeasons[enrichedSeasons.length - 1];
  const diffMarkup = priciest.averageInclMarkup - cheapest.averageInclMarkup;
  const evInsight = includeEV
    ? enrichedSeasons.map((item) => ({
        id: item.season.id,
        label: item.season.label,
        value: item.evAverage !== null && item.baseAverage !== null ? item.evAverage - item.baseAverage : null
      }))
    : [];

  const seasonWithLowestEvPremium = evInsight
    .filter((entry) => entry.value !== null)
    .sort((a, b) => (a.value ?? 0) - (b.value ?? 0))[0];

  return (
    <div className="mt-8 bg-white border border-emerald-100 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-emerald-900 mb-4">Extra inzichten voor {year}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-emerald-900">
        <div className="rounded-lg border border-emerald-200 p-4 bg-emerald-50/50">
          <h4 className="font-semibold text-emerald-800 mb-1">Goedkoopste seizoen</h4>
          <p>
            {cheapest.season.label}: {formatPrice(cheapest.averageInclMarkup)} per kWh (incl. belasting & opslag).
          </p>
        </div>
        <div className="rounded-lg border border-emerald-200 p-4 bg-emerald-50/50">
          <h4 className="font-semibold text-emerald-800 mb-1">Duurste seizoen</h4>
          <p>
            {priciest.season.label}: {formatPrice(priciest.averageInclMarkup)} per kWh. Verschil met goedkoopste: {formatPrice(diffMarkup)}.
          </p>
        </div>
        <div className="rounded-lg border border-emerald-200 p-4 bg-emerald-50/50">
          <h4 className="font-semibold text-emerald-800 mb-1">Slim laden</h4>
          {includeEV && seasonWithLowestEvPremium ? (
            <p>
              EV-laden is relatief goedkoop in de {seasonWithLowestEvPremium.label.toLowerCase()} ({formatPrice((seasonWithLowestEvPremium.value ?? 0) + ENERGY_TAX_EUR_PER_KWH + SUPPLIER_MARKUP_EUR_PER_KWH)} totaal).
            </p>
          ) : (
            <p>
              Voeg een EV toe om te zien in welke seizoenen nachtelijk laden het voordeligst is.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function SolarFeedInInsights({ year }: { year: number }) {
  const [systemSize, setSystemSize] = useState<number>(4);
  const feedIn = useMemo(() => calculateSolarFeedIn(year, systemSize), [year, systemSize]);

  const averagePrice = feedIn.averageFeedInPrice;
  const totalRevenue = feedIn.annualRevenueEuro;
  const coveragePercent = Math.round(feedIn.coverage * 100);

  return (
    <div className="mt-12 bg-white border border-emerald-100 rounded-2xl p-8 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
        <div>
          <h3 className="text-2xl font-bold text-emerald-900">Wat levert terugleveren op?</h3>
          <p className="text-sm text-emerald-800 mt-2 max-w-2xl">
            We simuleren hoeveel een zonnepaneelsysteem in elk seizoen opwekt en tegen welke EPEX-spotprijzen deze stroom wordt teruggeleverd.
            De uurprofielen zijn gebaseerd op gemiddelde opwek per seizoen: piek rond de middag, nauwelijks productie in nachtelijke uren.
          </p>
        </div>
        <div className="lg:w-72">
          <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="pv-size">
            Systeemgrootte (kWp)
          </label>
          <input
            id="pv-size"
            type="number"
            min={1}
            max={15}
            step={0.1}
            value={systemSize}
            onChange={(event) => setSystemSize(Number(event.target.value))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <p className="text-xs text-gray-500 mt-2">Standaard: 4 kWp (ca. 10 panelen). Pas aan voor jouw dak.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-10">
        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-xl p-6">
          <h4 className="text-sm uppercase tracking-wide text-emerald-100 font-semibold">Gemiddelde feed-in prijs</h4>
          <p className="text-3xl font-bold mt-2">{formatPrice(averagePrice)}</p>
          <p className="text-xs text-emerald-100 mt-1">Exclusief belasting. In praktijk komt hier vaak een vaste vergoeding bovenop.</p>
        </div>
        <div className="bg-white border border-emerald-200 rounded-xl p-6">
          <h4 className="text-sm font-semibold text-emerald-800">Jaarlijkse opbrengst</h4>
          <p className="text-2xl font-bold text-emerald-900 mt-2">
            €{totalRevenue.toFixed(0)}
          </p>
          <p className="text-xs text-emerald-700 mt-1">
            Gebaseerd op {Math.round(feedIn.annualAnalyzedGenerationKwh).toLocaleString()} kWh teruglevering in {year}.
          </p>
        </div>
        <div className="bg-white border border-emerald-200 rounded-xl p-6">
          <h4 className="text-sm font-semibold text-emerald-800">Dekgraad analyse</h4>
          <p className="text-2xl font-bold text-emerald-900 mt-2">{coveragePercent}%</p>
          <p className="text-xs text-emerald-700 mt-1">Percentage van het verwachte seizoensprofiel waarvoor marktdatas beschikbaar zijn.</p>
        </div>
        <div className="bg-white border border-emerald-200 rounded-xl p-6">
          <h4 className="text-sm font-semibold text-emerald-800">Tip</h4>
          <p className="text-sm text-emerald-700 mt-2">
            Combineer deze inzichten met de verbruiksprofielen hierboven om te zien wanneer eigen opwek en verbruik elkaar overlappen.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {feedIn.breakdown.map((season) => (
          <SolarSeasonCard key={season.id} season={season} />
        ))}
      </div>
    </div>
  );
}

function SolarSeasonCard({ season }: { season: SolarFeedInBreakdown }) {
  const generation = Math.round(season.analyzedGenerationKwh).toLocaleString();
  const expected = Math.round(season.expectedGenerationKwh).toLocaleString();
  const revenue = season.revenueEuro.toFixed(0);
  const avgPrice = formatPrice(season.averagePrice);

  return (
    <div className="bg-white border border-emerald-100 rounded-xl p-6 shadow-sm">
      <h4 className="text-lg font-semibold text-emerald-900 mb-2">{season.label}</h4>
      <p className="text-xs text-gray-500 mb-4">{season.months.map((month) => formatMonthName(month)).join(', ')}</p>

      <div className="space-y-2 text-sm text-emerald-900">
        <div className="flex items-center justify-between">
          <span>Analyse dekking</span>
          <span>{Math.round((season.analyzedGenerationKwh / (season.expectedGenerationKwh || 1)) * 100)}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Opwek (verwacht → gemeten)</span>
          <span>
            {expected} → {generation} kWh
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Opbrengst</span>
          <span>€{revenue}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Gemiddelde prijs</span>
          <span>{avgPrice}/kWh</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Bandbreedte</span>
          <span>
            {season.minHourlyPrice !== null ? formatPrice(season.minHourlyPrice) : 'n.v.t.'} →{' '}
            {season.maxHourlyPrice !== null ? formatPrice(season.maxHourlyPrice) : 'n.v.t.'}
          </span>
        </div>
      </div>

      {season.missingMonths.length > 0 && (
        <p className="mt-4 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
          Geen uurdata voor: {season.missingMonths.map((month) => formatMonthName(month)).join(', ')}.
        </p>
      )}
    </div>
  );
}


