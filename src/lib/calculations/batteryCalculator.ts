/**
 * Thuisaccu terugverdientijd calculator
 * - Gebruikt vaste en dynamische contract aannames uit bestaande modules (2025)
 * - Waardeert eigenverbruik per scenario met saldering, terugleververgoeding en staffelkosten
 * - Houdt rekening met dynamische contract opslag en arbitrage
 */

import {
  BatteryInput,
  BatteryCalculationResult,
  BatteryScenario,
  SavingsBreakdown,
  ArbitrageStats,
  EigenverbruikImpact,
} from '@/types/battery';
import {
  berekenTerugleverkosten,
} from './terugleverkosten';
import {
  BATTERY_DYNAMIC_2025,
  BATTERY_DEFAULTS,
  BATTERY_FIXED_2025,
  ENERGY_CONSTANTS,
} from '@/lib/constants';

const ENERGIEBELASTING_STROOM = ENERGY_CONSTANTS.ENERGY_TAX_STROOM_PER_KWH;
const BTW = 0.21;
const DEGRADATIE_START_JAAR = 10;

interface TariefContext {
  contractType: 'vast' | 'dynamisch';
  stroomKalePrijs: number;
  terugleververgoeding: number;
  salderingsPercentage: number;
  opslagAfname: number;
  opslagInvoeding: number;
  vasteLeveringskostenMaand: number;
  maandelijkseVergoeding: number;
}

function bepaalTariefContext(
  scenario: 'vast_met_saldering' | 'vast_zonder_saldering' | 'dynamisch',
  input: BatteryInput
): TariefContext {
  if (scenario === 'dynamisch') {
    return {
      contractType: 'dynamisch',
      stroomKalePrijs: BATTERY_DYNAMIC_2025.SPOT_PRICE_AVG,
      terugleververgoeding: BATTERY_DYNAMIC_2025.SPOT_PRICE_AVG - BATTERY_DYNAMIC_2025.OPSLAG_INVOEDING,
      salderingsPercentage: 0,
      opslagAfname: BATTERY_DYNAMIC_2025.OPSLAG_AFNAME,
      opslagInvoeding: BATTERY_DYNAMIC_2025.OPSLAG_INVOEDING,
      vasteLeveringskostenMaand: 0,
      maandelijkseVergoeding: BATTERY_DYNAMIC_2025.MAANDELIJKSE_VERGOEDING,
    };
  }

  const basisPrijs = input.stroomKalePrijs || BATTERY_FIXED_2025.STROOM_KALE_PRIJS;
  const tlv = input.terugleververgoeding || BATTERY_FIXED_2025.TERUGLEVERVERGOEDING;

  return {
    contractType: 'vast',
    stroomKalePrijs: basisPrijs,
    terugleververgoeding:
      scenario === 'vast_zonder_saldering'
        ? Math.max(tlv, BATTERY_FIXED_2025.TERUGLEVER_VERGOEDING_MIN_2027)
        : tlv,
    salderingsPercentage: scenario === 'vast_met_saldering' ? 1 : 0,
    opslagAfname: 0,
    opslagInvoeding: 0,
    vasteLeveringskostenMaand: BATTERY_FIXED_2025.VASTE_LEVERINGSKOSTEN,
    maandelijkseVergoeding: 0,
  };
}

function berekenMarginaleTerugleverkosten(
  zonderAccuTeruglevering: number,
  metAccuTeruglevering: number
): number {
  if (zonderAccuTeruglevering <= metAccuTeruglevering) {
    return 0;
  }

  const kostenZonder = berekenTerugleverkosten(zonderAccuTeruglevering);
  const kostenMet = berekenTerugleverkosten(metAccuTeruglevering);
  const deltaKosten = kostenZonder - kostenMet;
  const deltaKwh = zonderAccuTeruglevering - metAccuTeruglevering;

  return deltaKwh > 0 ? deltaKosten / deltaKwh : 0;
}

function waardeerExtraEigenverbruik(
  extraKwh: number,
  tarief: TariefContext,
  marginaleTerugleverkostenPerKwh: number
): number {
  const volleAfnamePrijs = (tarief.stroomKalePrijs + ENERGIEBELASTING_STROOM) * (1 + BTW);
  const vergoedingBijTeruglevering =
    tarief.terugleververgoeding + tarief.salderingsPercentage * ENERGIEBELASTING_STROOM;

  const waardeVerschil =
    volleAfnamePrijs - vergoedingBijTeruglevering + marginaleTerugleverkostenPerKwh;

  return extraKwh * waardeVerschil;
}

function berekenTerugleverkostenReduction(
  terugleveringZonderAccuKwh: number,
  terugleveringMetAccuKwh: number
): number {
  const kostenZonder = berekenTerugleverkosten(terugleveringZonderAccuKwh);
  const kostenMet = berekenTerugleverkosten(terugleveringMetAccuKwh);
  return Math.max(0, kostenZonder - kostenMet);
}

function analyseerEigenverbruik(
  tarief: TariefContext,
  pvOpwekKwh: number,
  jaarverbruikStroom: number,
  oudEigenverbruikPercentage: number,
  nieuwEigenverbruikPercentage: number
): EigenverbruikImpact {
  const zonderAccuEigenverbruikKwh = pvOpwekKwh * (oudEigenverbruikPercentage / 100);
  const zonderAccuTerugleveringKwh = Math.max(0, pvOpwekKwh - zonderAccuEigenverbruikKwh);
  const zonderAccuAfnameNetKwh = Math.max(0, jaarverbruikStroom - zonderAccuEigenverbruikKwh);

  const metAccuEigenverbruikKwh = pvOpwekKwh * (nieuwEigenverbruikPercentage / 100);
  const metAccuTerugleveringKwh = Math.max(0, pvOpwekKwh - metAccuEigenverbruikKwh);
  const metAccuAfnameNetKwh = Math.max(0, jaarverbruikStroom - metAccuEigenverbruikKwh);

  const extraEigenverbruikKwh = metAccuEigenverbruikKwh - zonderAccuEigenverbruikKwh;
  const minderTerugleveringKwh = zonderAccuTerugleveringKwh - metAccuTerugleveringKwh;
  const minderAfnameKwh = zonderAccuAfnameNetKwh - metAccuAfnameNetKwh;

  const marginaleTk = berekenMarginaleTerugleverkosten(
    zonderAccuTerugleveringKwh,
    metAccuTerugleveringKwh
  );

  const financieelVoordeel = waardeerExtraEigenverbruik(
    extraEigenverbruikKwh,
    tarief,
    marginaleTk
  );

  return {
    zonderAccu: {
      eigenverbruikKwh: zonderAccuEigenverbruikKwh,
      terugleveringKwh: zonderAccuTerugleveringKwh,
      afnameNetKwh: zonderAccuAfnameNetKwh,
    },
    metAccu: {
      eigenverbruikKwh: metAccuEigenverbruikKwh,
      terugleveringKwh: metAccuTerugleveringKwh,
      afnameNetKwh: metAccuAfnameNetKwh,
    },
    verbetering: {
      extraEigenverbruikKwh,
      minderTerugleveringKwh,
      minderAfnameKwh,
      financieelVoordeel,
    },
  };
}

function berekenArbitrageVoordeel(
  arbitrageStats: ArbitrageStats,
  tarief: TariefContext
): number {
  // De bruto arbitrage winst is al berekend in jaarlijkseWinst
  // We hoeven hier alleen de dynamische contract specifieke kosten af te trekken
  // die NIET al in de eigenverbruik berekening zitten
  
  // Voor een dynamisch contract betaal je een maandelijkse vergoeding
  const vasteKosten = tarief.maandelijkseVergoeding * 12;
  
  // De opslag op afname en teruglevering zit al verwerkt in de tarieven
  // die we gebruiken voor eigenverbruik berekening, dus die trekken we hier niet af
  
  return Math.max(0, arbitrageStats.jaarlijkseWinst - vasteKosten);
}

function calculateCashflow(
  aanschafprijs: number,
  jaarlijkseBesparing: number,
  degradatiePerJaar: number,
  jaren: number = 15
): number[] {
  const cashflow: number[] = [];
  let cumulatief = -aanschafprijs;

  for (let jaar = 1; jaar <= jaren; jaar++) {
    let besparingDitJaar = jaarlijkseBesparing;

    if (jaar > DEGRADATIE_START_JAAR) {
      const jarenMetDegradatie = jaar - DEGRADATIE_START_JAAR;
      const degradatieFactor = Math.pow(1 - degradatiePerJaar, jarenMetDegradatie);
      besparingDitJaar = jaarlijkseBesparing * degradatieFactor;
    }

    cumulatief += besparingDitJaar;
    cashflow.push(Math.round(cumulatief));
  }

  return cashflow;
}

function calculatePaybackPeriod(
  aanschafprijs: number,
  jaarlijkseBesparing: number,
  degradatiePerJaar: number
): number {
  if (jaarlijkseBesparing <= 0) return Infinity;

  let cumulatief = -aanschafprijs;
  let jaar = 0;

  while (cumulatief < 0 && jaar < 30) {
    jaar++;
    let besparingDitJaar = jaarlijkseBesparing;

    if (jaar > DEGRADATIE_START_JAAR) {
      const jarenMetDegradatie = jaar - DEGRADATIE_START_JAAR;
      const degradatieFactor = Math.pow(1 - degradatiePerJaar, jarenMetDegradatie);
      besparingDitJaar = jaarlijkseBesparing * degradatieFactor;
    }

    cumulatief += besparingDitJaar;
  }

  return cumulatief >= 0 ? jaar : Infinity;
}

function createScenario(
  naam: string,
  beschrijving: string,
  scenarioType: 'vast_met_saldering' | 'vast_zonder_saldering' | 'dynamisch',
  input: BatteryInput,
  arbitrageStats: ArbitrageStats
): BatteryScenario {
  const tarief = bepaalTariefContext(scenarioType, input);

  let eigenverbruikVoordeel = 0;
  let terugleverkostenReductie = 0;
  let eigenverbruikImpact: EigenverbruikImpact | undefined;

  if (input.heeftZonnepanelen && input.pvOpwekKwh) {
    eigenverbruikImpact = analyseerEigenverbruik(
      tarief,
      input.pvOpwekKwh,
      input.jaarverbruikStroom,
      input.huidigEigenverbruikPercentage || 30,
      input.eigenverbruikMetAccuPercentage || 60
    );

    eigenverbruikVoordeel = eigenverbruikImpact.verbetering.financieelVoordeel;

    if (scenarioType !== 'dynamisch') {
      terugleverkostenReductie = berekenTerugleverkostenReduction(
        eigenverbruikImpact.zonderAccu.terugleveringKwh,
        eigenverbruikImpact.metAccu.terugleveringKwh
      );
    }
  }

  let arbitrageVoordeel = 0;
  if (scenarioType === 'dynamisch') {
    arbitrageVoordeel = berekenArbitrageVoordeel(arbitrageStats, tarief);
  }

  const savings: SavingsBreakdown = {
    verhoogdEigenverbruik: eigenverbruikVoordeel,
    vermedenTerugleverkosten: terugleverkostenReductie,
    arbitrageVoordeel,
    salderingsBesparing: 0,
    totaal: 0,
  };

  savings.totaal =
    savings.verhoogdEigenverbruik +
    savings.vermedenTerugleverkosten +
    savings.arbitrageVoordeel;

  const terugverdientijd = calculatePaybackPeriod(
    input.battery.prijsEuro,
    savings.totaal,
    input.battery.degradatiePerJaar
  );

  const cashflow = calculateCashflow(
    input.battery.prijsEuro,
    savings.totaal,
    input.battery.degradatiePerJaar,
    15
  );

  const totaleBesparingOver15Jaar = cashflow[cashflow.length - 1] + input.battery.prijsEuro;

  return {
    naam,
    beschrijving,
    salderingsPercentage: tarief.salderingsPercentage,
    heeftArbitrage: scenarioType === 'dynamisch',
    badge:
      scenarioType === 'vast_met_saldering'
        ? 'Nu (met salderen)'
        : scenarioType === 'vast_zonder_saldering'
        ? 'Vanaf 2027'
        : 'Optimaal',
    jaarlijkseBesparing: savings,
    terugverdientijd,
    totaleBesparingOver15Jaar,
    cashflowPerJaar: cashflow,
    rendabel: terugverdientijd < 15,
  };
}

function berekenArbitrageValue(
  capaciteitKwh: number,
  roundTripEfficiency: number,
  csvData2024: string,
  csvData2025: string,
  heeftZonnepanelen: boolean
): ArbitrageStats {
  const prijzen: number[] = [];

  function parse(csv: string) {
    const lines = csv.split('\n');
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split(';');
      if (parts.length < 3) continue;
      const prijs = parseFloat(parts[2].replace(',', '.'));
      if (!Number.isNaN(prijs)) {
        prijzen.push(prijs);
      }
    }
  }

  parse(csvData2024);
  parse(csvData2025);

  if (prijzen.length === 0) {
    return {
      gemiddeldeSpread: 0,
      aantalCycliPerJaar: 0,
      jaarlijkseWinst: 0,
      negatievePrijsUren: 0,
      percentielPrijzen: { p20Laag: 0, p20Hoog: 0 },
    };
  }

  const gesorteerd = [...prijzen].sort((a, b) => a - b);
  const negatievePrijsUren = prijzen.filter(p => p < 0).length;

  const index20Laag = Math.floor(gesorteerd.length * 0.2);
  const index20Hoog = Math.floor(gesorteerd.length * 0.8);

  const p20Laag =
    gesorteerd.slice(0, index20Laag).reduce((sum, p) => sum + p, 0) /
    Math.max(1, index20Laag);
  const p20Hoog =
    gesorteerd.slice(index20Hoog).reduce((sum, p) => sum + p, 0) /
    Math.max(1, gesorteerd.length - index20Hoog);

  const gemiddeldeSpread = p20Hoog - p20Laag;

  let aantalCycliPerJaar = heeftZonnepanelen ? 220 : 260;
  if (negatievePrijsUren > 500) {
    aantalCycliPerJaar += 20;
  }
  aantalCycliPerJaar = Math.min(aantalCycliPerJaar, 300);

  const winstPerCyclus = capaciteitKwh * gemiddeldeSpread * roundTripEfficiency;
  const jaarlijkseWinst = winstPerCyclus * aantalCycliPerJaar;

  return {
    gemiddeldeSpread,
    aantalCycliPerJaar,
    jaarlijkseWinst,
    negatievePrijsUren,
    percentielPrijzen: {
      p20Laag,
      p20Hoog,
    },
  };
}

export async function calculateBatteryScenarios(
  input: BatteryInput,
  csvData2024: string,
  csvData2025: string
): Promise<BatteryCalculationResult> {
  const normalizedInput: BatteryInput = {
    ...input,
    battery: {
      ...input.battery,
      roundTripEfficiency:
        input.battery.roundTripEfficiency ?? BATTERY_DEFAULTS.ROUND_TRIP_EFFICIENCY,
      degradatiePerJaar:
        input.battery.degradatiePerJaar ?? BATTERY_DEFAULTS.DEGRADATIE_PER_JAAR,
    },
  };

  // Bereken arbitrage stats altijd, want we willen het dynamische scenario altijd laten zien
  const arbitrageStats = berekenArbitrageValue(
    normalizedInput.battery.capaciteitKwh,
    normalizedInput.battery.roundTripEfficiency,
    csvData2024,
    csvData2025,
    normalizedInput.heeftZonnepanelen
  );

  let scenarioVastNu: BatteryScenario;
  let scenarioVastNa2027: BatteryScenario;
  let scenarioDynamisch: BatteryScenario;

  if (normalizedInput.contractType === 'dynamisch') {
    scenarioVastNu = createScenario(
      'Vast contract (2024-2026)',
      'Referentie met vaste tarieven en saldering tot en met 2026',
      'vast_met_saldering',
      normalizedInput,
      arbitrageStats
    );

    scenarioVastNa2027 = createScenario(
      'Vast contract (2027+)',
      'Referentie zonder saldering, met wettelijke minimale vergoeding en staffelkosten',
      'vast_zonder_saldering',
      normalizedInput,
      arbitrageStats
    );

    scenarioDynamisch = createScenario(
      'Dynamisch contract + accu',
      'Jouw dynamische profiel met arbitrage en 2025 dynamische tarieven',
      'dynamisch',
      normalizedInput,
      arbitrageStats
    );
  } else {
    scenarioVastNu = createScenario(
      'Vast contract (2024-2026)',
      'Jouw vaste contract met huidige saldering',
      'vast_met_saldering',
      normalizedInput,
      arbitrageStats
    );

    scenarioVastNa2027 = createScenario(
      'Vast contract (2027+)',
      'Jouw vaste contract zonder saldering (min. 50% vergoeding)',
      'vast_zonder_saldering',
      normalizedInput,
      arbitrageStats
    );

    scenarioDynamisch = createScenario(
      'Dynamisch referentiescenario',
      'Referentie met dynamische tarieven (2025) voor vergelijking',
      'dynamisch',
      normalizedInput,
      arbitrageStats
    );
  }

  const scenarios = [
    { key: 'huidig' as const, scenario: scenarioVastNu },
    { key: 'na2027' as const, scenario: scenarioVastNa2027 },
    { key: 'dynamischOptimaal' as const, scenario: scenarioDynamisch },
  ];

  const besteScenario = scenarios.reduce((beste, huidige) =>
    huidige.scenario.terugverdientijd < beste.scenario.terugverdientijd ? huidige : beste
  ).key;

  const bestTvt = scenarios.find(s => s.key === besteScenario)!.scenario.terugverdientijd;

  let korteSamenvatting = '';
  const waarschuwingen: string[] = [];

  if (bestTvt < 8) {
    korteSamenvatting = 'Kansrijk! De terugverdientijd is gunstig, vooral na 2027 zonder saldering.';
  } else if (bestTvt < 12) {
    korteSamenvatting = 'Marginaal rendabel. Resultaat hangt sterk af van prijsontwikkeling.';
    waarschuwingen.push('Businesscase is gevoelig voor aannames en gedrag.');
  } else if (bestTvt < 15) {
    korteSamenvatting = 'Beperkt rendabel binnen levensduur. Goed monitoren na 2027.';
    waarschuwingen.push('Weinig buffer bij tegenslag of lagere spreads.');
  } else {
    korteSamenvatting = 'Waarschijnlijk niet terugverdiend binnen 15 jaar levensduur.';
    waarschuwingen.push('Overweeg kleinere accu of uitstel tot prijzen veranderen.');
  }

  if (!input.heeftZonnepanelen) {
    waarschuwingen.push('Zonder zonnepanelen zijn arbitragewinsten beperkt door dubbele energiebelasting.');
  }

  if (input.contractType === 'vast') {
    waarschuwingen.push('Met een vast contract profiteer je niet van dynamische arbitragevoordelen.');
  }

  let eigenverbruikImpact: EigenverbruikImpact | undefined;
  if (input.heeftZonnepanelen && input.pvOpwekKwh) {
    eigenverbruikImpact = analyseerEigenverbruik(
      bepaalTariefContext('vast_zonder_saldering', input),
      input.pvOpwekKwh,
      input.jaarverbruikStroom,
      input.huidigEigenverbruikPercentage || 30,
      input.eigenverbruikMetAccuPercentage || 60
    );
  }

  return {
    input,
    scenarios: {
      huidig: scenarioVastNu,
      na2027: scenarioVastNa2027,
      dynamischOptimaal: scenarioDynamisch,
    },
    eigenverbruikImpact,
    arbitrageStats,
    aanbeveling: {
      korteSamenvatting,
      isRendabel: bestTvt < 15,
      besteScenario,
      waarschuwingen,
    },
    aannamen: {
      roundTripEfficiency: normalizedInput.battery.roundTripEfficiency,
      aantalCycli: arbitrageStats?.aantalCycliPerJaar || 0,
      degradatie: `${(normalizedInput.battery.degradatiePerJaar * 100).toFixed(1)}% per jaar na ${DEGRADATIE_START_JAAR} jaar`,
      energiebelasting: ENERGIEBELASTING_STROOM,
      salderingTot2027: true,
      minimaleVergoeding2027: 'Minimaal 50% van leveringsprijs volgens wetgeving',
    },
  };
}