import { z } from 'zod';

export const userProfileSchema = z.object({
  postcode: z.string().min(1, 'Postcode is verplicht'),
  netbeheerder: z.string().min(1, 'Netbeheerder is verplicht'),
  aansluitingElektriciteit: z.enum(['1x25A', '1x35A', '3x25A', '3x35A', '3x50A']),
  aansluitingGas: z.enum(['G4', 'G6', 'G10', 'G16', 'G25']).optional(),
  jaarverbruikStroom: z.number().min(0, 'Verbruik moet positief zijn'),
  jaarverbruikStroomPiek: z.number().min(0).optional(),
  jaarverbruikStroomDal: z.number().min(0).optional(),
  jaarverbruikGas: z.number().min(0, 'Verbruik moet positief zijn'),
  heeftZonnepanelen: z.boolean(),
  pvOpwek: z.number().min(0).optional(),
  percentageZelfverbruik: z.number().min(0).max(100).optional(),
  heeftWarmtepomp: z.boolean(),
  heeftElektrischeAuto: z.boolean(),
  geenGas: z.boolean(),
  piekDalVerdeling: z.object({
    piek: z.number().min(0).max(1),
    dal: z.number().min(0).max(1),
  }).optional(),
});

export type UserProfileInput = z.infer<typeof userProfileSchema>;
