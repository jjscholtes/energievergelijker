/**
 * Tests for battery validation schemas
 */

import { basicsSchema, solarSchema, batterySchema, dynamicSchema } from '../batterySchemas';

describe('Battery Validation Schemas', () => {
  describe('basicsSchema', () => {
    it('should validate correct basic data', () => {
      const validData = {
        jaarverbruikStroomPiek: 4000,
        jaarverbruikStroomDal: 6000,
        jaarverbruikGas: 1200,
        heeftZonnepanelen: true,
      };

      const result = basicsSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should coerce string numbers to numbers', () => {
      const data = {
        jaarverbruikStroomPiek: '4000',
        jaarverbruikStroomDal: '6000',
        jaarverbruikGas: '1200',
        heeftZonnepanelen: true,
      };

      const result = basicsSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data.jaarverbruikStroomPiek).toBe('number');
        expect(typeof result.data.jaarverbruikStroomDal).toBe('number');
        expect(result.data.jaarverbruikStroomPiek).toBe(4000);
        expect(result.data.jaarverbruikStroomDal).toBe(6000);
      }
    });

    it('should reject total consumption below minimum', () => {
      const data = {
        jaarverbruikStroomPiek: 100,
        jaarverbruikStroomDal: 200,
        heeftZonnepanelen: false,
      };

      const result = basicsSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.message.includes('minimaal 500 kWh'))).toBe(true);
      }
    });

    it('should reject total consumption above maximum', () => {
      const data = {
        jaarverbruikStroomPiek: 14000,
        jaarverbruikStroomDal: 13000,
        heeftZonnepanelen: false,
      };

      const result = basicsSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some(issue => issue.message.toLowerCase().includes('maximaal 25.000 kwh'))
        ).toBe(true);
      }
    });

    it('should allow empty gas consumption', () => {
      const data = {
        jaarverbruikStroomPiek: 4000,
        jaarverbruikStroomDal: 6000,
        jaarverbruikGas: '',
        heeftZonnepanelen: false,
      };

      const result = basicsSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('solarSchema', () => {
    it('should validate correct solar data', () => {
      const validData = {
        pvOpwekKwh: 4500,
        eigenverbruikZonder: 35,
        eigenverbruikMet: 65,
        evFlexPct: 60,
        wpFlexPct: 20,
        maxFlexvermogen: 8,
        pvProfiel: 'profiles/pv_standaard.csv',
      };

      const result = solarSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should coerce string pvOpwekKwh to number', () => {
      const data = {
        pvOpwekKwh: '4500',
        eigenverbruikZonder: 35,
        eigenverbruikMet: 65,
        evFlexPct: 60,
        wpFlexPct: 20,
        maxFlexvermogen: '8',
      };

      const result = solarSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data.pvOpwekKwh).toBe('number');
        expect(result.data.pvOpwekKwh).toBe(4500);
      }
    });

    it('should reject eigenverbruikMet <= eigenverbruikZonder', () => {
      const data = {
        pvOpwekKwh: 4500,
        eigenverbruikZonder: 50,
        eigenverbruikMet: 40, // Less than zonder
        evFlexPct: 60,
        wpFlexPct: 20,
        maxFlexvermogen: 8,
      };

      const result = solarSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('hoger zijn dan zonder accu');
      }
    });

    it('should accept eigenverbruikMet > eigenverbruikZonder', () => {
      const data = {
        pvOpwekKwh: 4500,
        eigenverbruikZonder: 35,
        eigenverbruikMet: 65,
        evFlexPct: 60,
        wpFlexPct: 20,
        maxFlexvermogen: 8,
      };

      const result = solarSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject eigenverbruikZonder below minimum', () => {
      const data = {
        pvOpwekKwh: 4500,
        eigenverbruikZonder: 5, // Too low
        eigenverbruikMet: 65,
        evFlexPct: 60,
        wpFlexPct: 20,
        maxFlexvermogen: 8,
      };

      const result = solarSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Minimaal 10%');
      }
    });

    it('should reject eigenverbruikMet above maximum', () => {
      const data = {
        pvOpwekKwh: 4500,
        eigenverbruikZonder: 35,
        eigenverbruikMet: 99, // Too high
        evFlexPct: 60,
        wpFlexPct: 20,
        maxFlexvermogen: 8,
      };

      const result = solarSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Maximaal 98%');
      }
    });
  });

  describe('batterySchema', () => {
    it('should validate correct battery data', () => {
      const validData = {
        capaciteitKwh: 10,
        prijsEuro: 5000,
        roundTripEfficiency: 90,
        degradatie: 2,
        degradatieStartJaar: 10,
        garantieJaren: 10,
        maxLaadvermogen: 5,
      };

      const result = batterySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should coerce string values to numbers', () => {
      const data = {
        capaciteitKwh: '10',
        prijsEuro: '5000',
        roundTripEfficiency: 90,
        degradatie: 2,
        degradatieStartJaar: '10',
        garantieJaren: '10',
        maxLaadvermogen: '5',
      };

      const result = batterySchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data.capaciteitKwh).toBe('number');
        expect(typeof result.data.prijsEuro).toBe('number');
      }
    });

    it('should reject capacity below minimum', () => {
      const data = {
        capaciteitKwh: 0.05, // Too low for plug-in battery threshold
        prijsEuro: 5000,
        roundTripEfficiency: 90,
        degradatie: 2,
        degradatieStartJaar: 10,
        garantieJaren: 10,
        maxLaadvermogen: 5,
      };

      const result = batterySchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Minimaal 0,1 kWh');
      }
    });

    it('should reject price below minimum', () => {
      const data = {
        capaciteitKwh: 10,
        prijsEuro: 400, // Too low
        roundTripEfficiency: 90,
        degradatie: 2,
        degradatieStartJaar: 10,
        garantieJaren: 10,
        maxLaadvermogen: 5,
      };

      const result = batterySchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Minimaal €500');
      }
    });

    it('should reject efficiency below minimum', () => {
      const data = {
        capaciteitKwh: 10,
        prijsEuro: 5000,
        roundTripEfficiency: 65, // Too low
        degradatie: 2,
        degradatieStartJaar: 10,
        garantieJaren: 10,
        maxLaadvermogen: 5,
      };

      const result = batterySchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Minimaal 70%');
      }
    });

    it('should reject degradatie above maximum', () => {
      const data = {
        capaciteitKwh: 10,
        prijsEuro: 5000,
        roundTripEfficiency: 90,
        degradatie: 6, // Too high
        degradatieStartJaar: 10,
        garantieJaren: 10,
        maxLaadvermogen: 5,
      };

      const result = batterySchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Maximaal 5%');
      }
    });
  });

  describe('dynamicSchema', () => {
    it('should validate correct dynamic data', () => {
      const validData = {
        contractType: 'dynamisch' as const,
        stroomPrijsCent: 10.5,
        terugleververgoedingCent: 6.5,
        opslagAfnameCent: 2.5,
        opslagInvoedingCent: 2.3,
        vasteKostenMaand: 8.5,
        maandelijkseVergoeding: 5.99,
        laadDrempelCent: 6.5,
        ontlaadDrempelCent: 18,
        prijsbestand: 'data/spotprijzen_2024.csv',
      };

      const result = dynamicSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept vast contract type', () => {
      const data = {
        contractType: 'vast' as const,
        stroomPrijsCent: 21,
        terugleververgoedingCent: 7,
        opslagAfnameCent: 0,
        opslagInvoedingCent: 0,
        vasteKostenMaand: 8.5,
        maandelijkseVergoeding: 0,
        laadDrempelCent: 6.5,
        ontlaadDrempelCent: 18,
        prijsbestand: 'data/spotprijzen_2024.csv',
      };

      const result = dynamicSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid contract type', () => {
      const data = {
        contractType: 'invalid',
        stroomPrijsCent: 10.5,
        terugleververgoedingCent: 6.5,
        opslagAfnameCent: 2.5,
        opslagInvoedingCent: 2.3,
        vasteKostenMaand: 8.5,
        maandelijkseVergoeding: 5.99,
        laadDrempelCent: 6.5,
        ontlaadDrempelCent: 18,
        prijsbestand: 'data/spotprijzen_2024.csv',
      };

      const result = dynamicSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should coerce string prices to numbers', () => {
      const data = {
        contractType: 'dynamisch' as const,
        stroomPrijsCent: '10.5',
        terugleververgoedingCent: '6.5',
        opslagAfnameCent: '2.5',
        opslagInvoedingCent: '2.3',
        vasteKostenMaand: '8.5',
        maandelijkseVergoeding: '5.99',
        laadDrempelCent: '6.5',
        ontlaadDrempelCent: '18',
        prijsbestand: 'data/spotprijzen_2024.csv',
      };

      const result = dynamicSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data.stroomPrijsCent).toBe('number');
        expect(result.data.stroomPrijsCent).toBe(10.5);
      }
    });

    it('should reject price below minimum', () => {
      const data = {
        contractType: 'dynamisch' as const,
        stroomPrijsCent: 3, // Too low
        terugleververgoedingCent: 6.5,
        opslagAfnameCent: 2.5,
        opslagInvoedingCent: 2.3,
        vasteKostenMaand: 8.5,
        maandelijkseVergoeding: 5.99,
        laadDrempelCent: 6.5,
        ontlaadDrempelCent: 18,
        prijsbestand: 'data/spotprijzen_2024.csv',
      };

      const result = dynamicSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Minimaal 5 ct/kWh');
      }
    });

    it('should reject negative laadDrempel below minimum', () => {
      const data = {
        contractType: 'dynamisch' as const,
        stroomPrijsCent: 10.5,
        terugleververgoedingCent: 6.5,
        opslagAfnameCent: 2.5,
        opslagInvoedingCent: 2.3,
        vasteKostenMaand: 8.5,
        maandelijkseVergoeding: 5.99,
        laadDrempelCent: -10, // Too low
        ontlaadDrempelCent: 18,
        prijsbestand: 'data/spotprijzen_2024.csv',
      };

      const result = dynamicSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Minimaal -5 ct/kWh');
      }
    });

    it('should accept valid dynamic contract data', () => {
      const data = {
        contractType: 'dynamisch' as const,
        stroomPrijsCent: 10.5,
        terugleververgoedingCent: 6.5,
        opslagAfnameCent: 2.5,
        opslagInvoedingCent: 2.3,
        vasteKostenMaand: 8.5,
        maandelijkseVergoeding: 5.99,
        laadDrempelCent: 6.5,
        ontlaadDrempelCent: 18,
      };

      const result = dynamicSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('Error Messages', () => {
    it('should provide helpful error message for invalid type', () => {
      const data = {
        postcode: '3812',
        jaarverbruikStroom: 'not a number',
        heeftZonnepanelen: false,
      };

      const result = basicsSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        // Zod coerce will produce NaN which fails validation
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    it('should provide helpful error message for range violation', () => {
      const data = {
        capaciteitKwh: 50,
        prijsEuro: 5000,
        roundTripEfficiency: 90,
        degradatie: 2,
        degradatieStartJaar: 10,
        garantieJaren: 10,
        maxLaadvermogen: 5,
      };

      const result = batterySchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Maximaal 30 kWh');
      }
    });
  });
});

