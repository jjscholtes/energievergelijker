/**
 * Type-safe transformers for converting between form state and calculation input
 */

import { BatteryInput, BatteryProfile } from '@/types/battery';
import {
  BasicsFormData,
  SolarFormData,
  BatterySpecFormData,
  DynamicFormData,
} from '@/lib/validation/batterySchemas';

/**
 * Transform validated form data into BatteryInput for calculations
 * 
 * @param basics - Validated basic information
 * @param solar - Validated solar information (null if no solar panels)
 * @param battery - Validated battery specifications
 * @param dynamic - Validated contract and pricing information
 * @returns BatteryInput ready for calculation
 */
export function transformFormToBatteryInput(
  basics: BasicsFormData,
  solar: SolarFormData | null,
  battery: BatterySpecFormData,
  dynamic: DynamicFormData
): BatteryInput {
  const totaalVerbruik = basics.jaarverbruikStroomPiek + basics.jaarverbruikStroomDal;

  const batteryProfile: BatteryProfile = {
    capaciteitKwh: battery.capaciteitKwh,
    prijsEuro: battery.prijsEuro,
    roundTripEfficiency: battery.roundTripEfficiency / 100, // Convert percentage to decimal
    garantieJaren: battery.garantieJaren,
    degradatiePerJaar: battery.degradatie / 100, // Convert percentage to decimal
  };

  // Calculate effective electricity price based on contract type
  const stroomKalePrijs =
    dynamic.contractType === 'dynamisch'
      ? (dynamic.stroomPrijsCent + dynamic.opslagAfnameCent) / 100
      : dynamic.stroomPrijsCent / 100;

  // Calculate feed-in tariff based on contract type
  const terugleververgoeding =
    dynamic.contractType === 'dynamisch'
      ? Math.max(0, dynamic.stroomPrijsCent - dynamic.opslagInvoedingCent) / 100
      : dynamic.terugleververgoedingCent / 100;

  return {
    battery: batteryProfile,
    heeftZonnepanelen: basics.heeftZonnepanelen,
    pvOpwekKwh: basics.heeftZonnepanelen && solar ? solar.pvOpwekKwh : undefined,
    huidigEigenverbruikPercentage: basics.heeftZonnepanelen && solar ? solar.eigenverbruikZonder : undefined,
    eigenverbruikMetAccuPercentage: basics.heeftZonnepanelen && solar ? solar.eigenverbruikMet : undefined,
    jaarverbruikStroom: totaalVerbruik,
    contractType: dynamic.contractType,
    stroomKalePrijs,
    terugleververgoeding,
  };
}

/**
 * Wizard state type matching the form structure
 */
export interface WizardState {
  basics: {
    jaarverbruikStroomPiek: string;
    jaarverbruikStroomDal: string;
    jaarverbruikGas: string;
    heeftZonnepanelen: boolean;
  };
  solar: {
    pvOpwekKwh: string;
    eigenverbruikZonder: number;
    eigenverbruikMet: number;
    evFlexPct: number;
    wpFlexPct: number;
    maxFlexvermogen: string;
  };
  battery: {
    capaciteitKwh: string;
    prijsEuro: string;
    roundTripEfficiency: number;
    degradatie: number;
    degradatieStartJaar: string;
    garantieJaren: string;
    maxLaadvermogen: string;
  };
  dynamic: {
    contractType: 'vast' | 'dynamisch';
    stroomPrijsCent: string;
    terugleververgoedingCent: string;
    opslagAfnameCent: string;
    opslagInvoedingCent: string;
    vasteKostenMaand: string;
    maandelijkseVergoeding: string;
    laadDrempelCent: string;
    ontlaadDrempelCent: string;
  };
}

/**
 * Default wizard state with sensible defaults
 */
export const defaultWizardState: WizardState = {
  basics: {
    jaarverbruikStroomPiek: '4000',
    jaarverbruikStroomDal: '6000',
    jaarverbruikGas: '0',
    heeftZonnepanelen: true,
  },
  solar: {
    pvOpwekKwh: '4500',
    eigenverbruikZonder: 35,
    eigenverbruikMet: 65,
    evFlexPct: 60,
    wpFlexPct: 20,
    maxFlexvermogen: '8',
  },
  battery: {
    capaciteitKwh: '10',
    prijsEuro: '5000',
    roundTripEfficiency: 80,
    degradatie: 2,
    degradatieStartJaar: '1',
    garantieJaren: '10',
    maxLaadvermogen: '5',
  },
  dynamic: {
    contractType: 'dynamisch',
    stroomPrijsCent: '10.5',
    terugleververgoedingCent: '6.5',
    opslagAfnameCent: '2.5',
    opslagInvoedingCent: '2.3',
    vasteKostenMaand: '8.5',
    maandelijkseVergoeding: '5.99',
    laadDrempelCent: '6.5',
    ontlaadDrempelCent: '18',
  },
};

/**
 * Field definitions for each step (used for error clearing)
 */
export const stepFields = {
  basics: [
    'jaarverbruikStroomPiek',
    'jaarverbruikStroomDal',
    'jaarverbruikGas',
    'heeftZonnepanelen',
  ],
  solar: [
    'pvOpwekKwh',
    'eigenverbruikZonder',
    'eigenverbruikMet',
    'evFlexPct',
    'wpFlexPct',
    'maxFlexvermogen',
  ],
  battery: [
    'capaciteitKwh',
    'prijsEuro',
    'roundTripEfficiency',
    'degradatie',
    'degradatieStartJaar',
    'garantieJaren',
    'maxLaadvermogen',
  ],
  dynamic: [
    'contractType',
    'stroomPrijsCent',
    'terugleververgoedingCent',
    'opslagAfnameCent',
    'opslagInvoedingCent',
    'vasteKostenMaand',
    'maandelijkseVergoeding',
    'laadDrempelCent',
    'ontlaadDrempelCent',
  ],
} as const;

