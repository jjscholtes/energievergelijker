import { berekenSaldering } from '../saldering';

describe('Saldering Calculations', () => {
  describe('Basic Saldering', () => {
    it('should calculate correct saldering for standard case', () => {
      const result = berekenSaldering(
        4000, // pvOpwek
        3000, // jaarverbruik
        35,   // percentageZelfverbruik
        0.25, // stroomKalePrijs
        0.01, // terugleververgoeding
        'vast'
      );

      expect(result.zelfVerbruikKwh).toBe(1400); // 4000 * 0.35
      expect(result.terugleveringKwh).toBe(2600); // 4000 - 1400
      expect(result.afnameVanNetKwh).toBe(1600); // 3000 - 1400
      expect(result.gesaldeerdKwh).toBe(1600); // min(1600, 2600)
      expect(result.nettoTerugleveringKwh).toBe(1000); // 2600 - 1600
    });

    it('should handle zero PV production', () => {
      const result = berekenSaldering(0, 3000, 35, 0.25, 0.01, 'vast');

      expect(result.zelfVerbruikKwh).toBe(0);
      expect(result.terugleveringKwh).toBe(0);
      expect(result.afnameVanNetKwh).toBe(3000);
      expect(result.gesaldeerdKwh).toBe(0);
      expect(result.nettoTerugleveringKwh).toBe(0);
    });

    it('should handle zero consumption', () => {
      const result = berekenSaldering(4000, 0, 35, 0.25, 0.01, 'vast');

      expect(result.zelfVerbruikKwh).toBe(1400);
      expect(result.terugleveringKwh).toBe(2600);
      expect(result.afnameVanNetKwh).toBe(0);
      expect(result.gesaldeerdKwh).toBe(0);
      expect(result.nettoTerugleveringKwh).toBe(2600);
    });
  });

  describe('Self-Consumption Scenarios', () => {
    it('should handle 100% self-consumption', () => {
      const result = berekenSaldering(3000, 3000, 100, 0.25, 0.01, 'vast');

      expect(result.zelfVerbruikKwh).toBe(3000);
      expect(result.terugleveringKwh).toBe(0);
      expect(result.afnameVanNetKwh).toBe(0);
      expect(result.gesaldeerdKwh).toBe(0);
      expect(result.nettoTerugleveringKwh).toBe(0);
    });

    it('should handle 0% self-consumption', () => {
      const result = berekenSaldering(4000, 3000, 0, 0.25, 0.01, 'vast');

      expect(result.zelfVerbruikKwh).toBe(0);
      expect(result.terugleveringKwh).toBe(4000);
      expect(result.afnameVanNetKwh).toBe(3000);
      expect(result.gesaldeerdKwh).toBe(3000);
      expect(result.nettoTerugleveringKwh).toBe(1000);
    });
  });

  describe('Contract Type Differences', () => {
    it('should calculate different terugleververgoeding for fixed vs dynamic', () => {
      const fixedResult = berekenSaldering(4000, 3000, 35, 0.25, 0.01, 'vast');
      const dynamicResult = berekenSaldering(4000, 3000, 35, 0.25, 0.15, 'dynamisch');

      // Fixed contracts use €0.01/kWh, dynamic use actual spot price
      expect(fixedResult.terugleververgoedingBedrag).toBeLessThan(dynamicResult.terugleververgoedingBedrag);
    });

    it('should apply terugleverkosten only for fixed contracts', () => {
      const fixedResult = berekenSaldering(4000, 3000, 35, 0.25, 0.01, 'vast', 1.0);
      const dynamicResult = berekenSaldering(4000, 3000, 35, 0.25, 0.15, 'dynamisch', 1.0);

      // Fixed contracts now calculate terugleverkosten dynamically based on terugleveringKwh (2600 kWh)
      // According to new staffel: 2000-2500 kWh = €276/year, 2500-3000 kWh = €348/year
      // 2600 kWh falls in the 2500-3000 range, so €348/year
      expect(fixedResult.terugleverkosten).toBe(348);
      expect(dynamicResult.terugleverkosten).toBe(0);
    });
  });

  describe('Energy Tax Saldering', () => {
    it('should calculate saldering besparing correctly', () => {
      const result = berekenSaldering(4000, 3000, 35, 0.25, 0.01, 'vast');

      // Saldering besparing = gesaldeerdKwh * 0.13163
      const expectedBesparing = 1600 * 0.13163; // gesaldeerdKwh * energiebelasting
      expect(result.salderingsBesparing).toBeCloseTo(expectedBesparing, 2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle PV production equal to consumption', () => {
      const result = berekenSaldering(3000, 3000, 35, 0.25, 0.01, 'vast');

      expect(result.zelfVerbruikKwh).toBe(1050); // 3000 * 0.35
      expect(result.terugleveringKwh).toBe(1950); // 3000 - 1050
      expect(result.afnameVanNetKwh).toBe(1950); // 3000 - 1050
      expect(result.gesaldeerdKwh).toBe(1950); // min(1950, 1950)
      expect(result.nettoTerugleveringKwh).toBe(0); // 1950 - 1950
    });

    it('should handle very high PV production', () => {
      const result = berekenSaldering(10000, 3000, 35, 0.25, 0.01, 'vast');

      expect(result.zelfVerbruikKwh).toBe(3500); // 10000 * 0.35
      expect(result.terugleveringKwh).toBe(6500); // 10000 - 3500
      expect(result.afnameVanNetKwh).toBe(0); // max(0, 3000 - 3500)
      expect(result.gesaldeerdKwh).toBe(0); // min(0, 6500)
      expect(result.nettoTerugleveringKwh).toBe(6500); // 6500 - 0
    });
  });
});
