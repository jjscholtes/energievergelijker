import { z } from 'zod';

export const userProfileSchema = z.object({
  postcode: z.string()
    .min(4, 'Postcode moet minimaal 4 karakters zijn')
    .max(6, 'Postcode mag maximaal 6 karakters zijn')
    .regex(/^\d{4}[A-Z]{2}$/i, 'Ongeldige postcode format'),
  
  netbeheerder: z.string()
    .min(1, 'Netbeheerder is verplicht'),
  
  aansluitingElektriciteit: z.enum(['1x25A', '1x35A', '3x25A', '3x35A', '3x50A']),
  
  aansluitingGas: z.enum(['G4', 'G6', 'G10', 'G16', 'G25']),
  
  jaarverbruikStroom: z.number()
    .min(0, 'Jaarverbruik stroom moet positief zijn')
    .max(50000, 'Jaarverbruik stroom lijkt onrealistisch hoog'),
  
  jaarverbruikGas: z.number()
    .min(0, 'Jaarverbruik gas moet positief zijn')
    .max(10000, 'Jaarverbruik gas lijkt onrealistisch hoog'),
  
  heeftZonnepanelen: z.boolean(),
  
  pvOpwek: z.number()
    .min(0, 'PV opwek moet positief zijn')
    .max(20000, 'PV opwek lijkt onrealistisch hoog')
    .optional(),
  
  percentageZelfverbruik: z.number()
    .min(0, 'Percentage zelfverbruik moet tussen 0 en 100 zijn')
    .max(100, 'Percentage zelfverbruik moet tussen 0 en 100 zijn')
    .optional(),
  
  heeftWarmtepomp: z.boolean(),
  heeftElektrischeAuto: z.boolean(),
  geenGas: z.boolean(),
  
  piekDalVerdeling: z.object({
    piek: z.number().min(0).max(1),
    dal: z.number().min(0).max(1)
  }).optional()
}).refine((data) => {
  // Als er zonnepanelen zijn, moeten PV gegevens ook ingevuld zijn
  if (data.heeftZonnepanelen) {
    return data.pvOpwek !== undefined && data.percentageZelfverbruik !== undefined;
  }
  return true;
}, {
  message: 'Bij zonnepanelen moeten PV opwek en percentage zelfverbruik ingevuld worden',
  path: ['pvOpwek']
});

export type UserProfileInput = z.infer<typeof userProfileSchema>;
