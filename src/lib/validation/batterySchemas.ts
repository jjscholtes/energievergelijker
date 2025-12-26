/**
 * Validation schemas for battery calculator form
 * Separated from UI components for better testability and reusability
 */

import { z } from 'zod';

/**
 * Schema for basic user information step
 */
export const basicsSchema = z
  .object({
    jaarverbruikStroomPiek: z.coerce
      .number()
      .min(0, 'Minimaal 0 kWh')
      .max(25000, 'Maximaal 25.000 kWh'),
    jaarverbruikStroomDal: z.coerce
      .number()
      .min(0, 'Minimaal 0 kWh')
      .max(25000, 'Maximaal 25.000 kWh'),
    jaarverbruikGas: z
      .union([z.literal(''), z.coerce.number()])
      .optional(),
    heeftZonnepanelen: z.boolean(),
  })
  .superRefine((data, ctx) => {
    const totaal = data.jaarverbruikStroomPiek + data.jaarverbruikStroomDal;

    if (totaal < 500) {
      ctx.addIssue({
        path: ['jaarverbruikStroomPiek'],
        code: z.ZodIssueCode.custom,
        message: 'Totaal verbruik moet minimaal 500 kWh zijn',
      });
    }

    if (totaal > 25000) {
      ctx.addIssue({
        path: ['jaarverbruikStroomDal'],
        code: z.ZodIssueCode.custom,
        message: 'Totaal verbruik mag maximaal 25.000 kWh zijn',
      });
    }
  });

/**
 * Schema for solar panel configuration step
 * Includes custom validation to ensure eigenverbruikMet > eigenverbruikZonder
 */
export const solarSchema = z
  .object({
    pvOpwekKwh: z.coerce
      .number()
      .min(0, 'Minimaal 0 kWh')
      .max(30000, 'Maximaal 30.000 kWh'),
    eigenverbruikZonder: z
      .number()
      .min(10, 'Minimaal 10%')
      .max(80, 'Maximaal 80%'),
    eigenverbruikMet: z
      .number()
      .min(30, 'Minimaal 30%')
      .max(98, 'Maximaal 98%'),
    evFlexPct: z.number().min(0).max(100),
    wpFlexPct: z.number().min(0).max(100),
    maxFlexvermogen: z.coerce
      .number()
      .min(0, 'Minimaal 0 kW')
      .max(25, 'Maximaal 25 kW'),
  })
  .superRefine((data, ctx) => {
    if (data.eigenverbruikMet <= data.eigenverbruikZonder) {
      ctx.addIssue({
        path: ['eigenverbruikMet'],
        code: z.ZodIssueCode.custom,
        message: 'Eigenverbruik mét accu moet hoger zijn dan zonder accu',
      });
    }
  });

/**
 * Schema for battery specifications step
 */
export const batterySchema = z.object({
  capaciteitKwh: z.coerce
    .number()
    .min(0.1, 'Minimaal 0,1 kWh')
    .max(30, 'Maximaal 30 kWh'),
  prijsEuro: z.coerce
    .number()
    .min(500, 'Minimaal €500')
    .max(25000, 'Maximaal €25.000'),
  roundTripEfficiency: z
    .number()
    .min(70, 'Minimaal 70%')
    .max(98, 'Maximaal 98%'),
  degradatie: z
    .number()
    .min(0.5, 'Minimaal 0,5%')
    .max(5, 'Maximaal 5%'),
  degradatieStartJaar: z.coerce
    .number()
    .min(1, 'Minimaal jaar 1')
    .max(15, 'Maximaal jaar 15'),
  garantieJaren: z.coerce
    .number()
    .min(5, 'Minimaal 5 jaar')
    .max(25, 'Maximaal 25 jaar'),
  maxLaadvermogen: z.coerce
    .number()
    .min(0.1, 'Minimaal 0,1 kW')
    .max(15, 'Maximaal 15 kW'),
});

/**
 * Schema for dynamic contract and pricing step
 */
export const dynamicSchema = z.object({
  contractType: z.enum(['vast', 'dynamisch']),
  stroomPrijsCent: z.coerce
    .number()
    .min(5, 'Minimaal 5 ct/kWh')
    .max(60, 'Maximaal 60 ct/kWh'),
  terugleververgoedingCent: z.coerce
    .number()
    .min(0, 'Minimaal 0 ct/kWh')
    .max(50, 'Maximaal 50 ct/kWh'),
  opslagAfnameCent: z.coerce
    .number()
    .min(0)
    .max(20),
  opslagInvoedingCent: z.coerce
    .number()
    .min(0)
    .max(20),
  vasteKostenMaand: z.coerce
    .number()
    .min(0)
    .max(40),
  maandelijkseVergoeding: z.coerce
    .number()
    .min(0)
    .max(40),
  laadDrempelCent: z.coerce
    .number()
    .min(-5, 'Minimaal -5 ct/kWh')
    .max(20, 'Maximaal 20 ct/kWh'),
  ontlaadDrempelCent: z.coerce
    .number()
    .min(5, 'Minimaal 5 ct/kWh')
    .max(60, 'Maximaal 60 ct/kWh'),
});

/**
 * Type inference from schemas
 */
export type BasicsFormData = z.infer<typeof basicsSchema>;
export type SolarFormData = z.infer<typeof solarSchema>;
export type BatterySpecFormData = z.infer<typeof batterySchema>;
export type DynamicFormData = z.infer<typeof dynamicSchema>;

/**
 * Complete form data type
 */
export interface CompleteBatteryFormData {
  basics: BasicsFormData;
  solar: SolarFormData;
  battery: BatterySpecFormData;
  dynamic: DynamicFormData;
}

/**
 * Schema map for easy lookup
 */
export const schemaMap = {
  basics: basicsSchema,
  solar: solarSchema,
  battery: batterySchema,
  dynamic: dynamicSchema,
} as const;

export type StepKey = keyof typeof schemaMap;
