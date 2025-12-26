/**
 * Comprehensive unit tests for battery calculator
 */

import { calculateBatteryScenarios } from '../batteryCalculator';
import { BatteryInput } from '@/types/battery';

// Mock CSV data for testing
const mockCSV2024 = `datum;uur;prijs_ct_kwh
2024-01-01;00:00;8.5
2024-01-01;01:00;7.2
2024-01-01;02:00;6.8
2024-01-01;03:00;6.5
2024-01-01;04:00;6.3
2024-01-01;05:00;7.1
2024-01-01;06:00;9.2
2024-01-01;07:00;12.5
2024-01-01;08:00;15.8
2024-01-01;09:00;14.2
2024-01-01;10:00;13.1
2024-01-01;11:00;12.8
2024-01-01;12:00;11.5
2024-01-01;13:00;10.8
2024-01-01;14:00;11.2
2024-01-01;15:00;12.5
2024-01-01;16:00;14.8
2024-01-01;17:00;18.5
2024-01-01;18:00;22.3
2024-01-01;19:00;20.1
2024-01-01;20:00;17.5
2024-01-01;21:00;15.2
2024-01-01;22:00;12.8
2024-01-01;23:00;10.5`;

const mockCSV2025 = mockCSV2024; // Use same data for simplicity

describe('Battery Calculator', () => {
  const createMockInput = (overrides?: Partial<BatteryInput>): BatteryInput => ({
    battery: {
      capaciteitKwh: 10,
      prijsEuro: 5000,
      roundTripEfficiency: 0.9,
      garantieJaren: 10,
      degradatiePerJaar: 0.02,
    },
    heeftZonnepanelen: true,
    pvOpwekKwh: 4500,
    huidigEigenverbruikPercentage: 35,
    eigenverbruikMetAccuPercentage: 65,
    jaarverbruikStroom: 3500,
    contractType: 'dynamisch',
    stroomKalePrijs: 0.105,
    terugleververgoeding: 0.065,
    postcode: '3812',
    ...overrides,
  });

  describe('Basic Calculation', () => {
    it('should calculate scenarios for input with solar panels', async () => {
      const input = createMockInput();
      const result = await calculateBatteryScenarios(input, mockCSV2024, mockCSV2025);

      expect(result).toBeDefined();
      expect(result.scenarios).toBeDefined();
      expect(result.scenarios.huidig).toBeDefined();
      expect(result.scenarios.na2027).toBeDefined();
      expect(result.scenarios.dynamischOptimaal).toBeDefined();
    });

    it('should calculate scenarios for input without solar panels', async () => {
      const input = createMockInput({
        heeftZonnepanelen: false,
        pvOpwekKwh: undefined,
        huidigEigenverbruikPercentage: undefined,
        eigenverbruikMetAccuPercentage: undefined,
      });
      const result = await calculateBatteryScenarios(input, mockCSV2024, mockCSV2025);

      expect(result).toBeDefined();
      expect(result.eigenverbruikImpact).toBeUndefined();
      expect(result.scenarios.huidig.jaarlijkseBesparing.verhoogdEigenverbruik).toBe(0);
    });

    it('should return valid payback periods', async () => {
      const input = createMockInput();
      const result = await calculateBatteryScenarios(input, mockCSV2024, mockCSV2025);

      expect(result.scenarios.huidig.terugverdientijd).toBeGreaterThan(0);
      expect(result.scenarios.na2027.terugverdientijd).toBeGreaterThan(0);
      expect(result.scenarios.dynamischOptimaal.terugverdientijd).toBeGreaterThan(0);
    });

    it('should calculate cashflow for 15 years', async () => {
      const input = createMockInput();
      const result = await calculateBatteryScenarios(input, mockCSV2024, mockCSV2025);

      expect(result.scenarios.huidig.cashflowPerJaar).toHaveLength(15);
      expect(result.scenarios.na2027.cashflowPerJaar).toHaveLength(15);
      expect(result.scenarios.dynamischOptimaal.cashflowPerJaar).toHaveLength(15);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero consumption', async () => {
      const input = createMockInput({
        jaarverbruikStroom: 0,
        heeftZonnepanelen: false,
        pvOpwekKwh: undefined,
      });
      const result = await calculateBatteryScenarios(input, mockCSV2024, mockCSV2025);

      expect(result).toBeDefined();
      expect(result.scenarios.huidig.jaarlijkseBesparing.totaal).toBeGreaterThanOrEqual(0);
    });

    it('should handle very high battery capacity', async () => {
      const input = createMockInput({
        battery: {
          capaciteitKwh: 30,
          prijsEuro: 15000,
          roundTripEfficiency: 0.9,
          garantieJaren: 10,
          degradatiePerJaar: 0.02,
        },
      });
      const result = await calculateBatteryScenarios(input, mockCSV2024, mockCSV2025);

      expect(result).toBeDefined();
      expect(result.scenarios.huidig.terugverdientijd).toBeGreaterThan(0);
    });

    it('should handle low efficiency battery', async () => {
      const input = createMockInput({
        battery: {
          capaciteitKwh: 10,
          prijsEuro: 5000,
          roundTripEfficiency: 0.7,
          garantieJaren: 10,
          degradatiePerJaar: 0.02,
        },
      });
      const result = await calculateBatteryScenarios(input, mockCSV2024, mockCSV2025);

      expect(result).toBeDefined();
      expect(result.arbitrageStats?.jaarlijkseWinst).toBeLessThan(
        result.arbitrageStats?.gemiddeldeSpread * 10 * 260
      );
    });

    it('should handle empty CSV data gracefully', async () => {
      const input = createMockInput();
      const result = await calculateBatteryScenarios(input, '', '');

      expect(result).toBeDefined();
      expect(result.arbitrageStats?.jaarlijkseWinst).toBe(0);
      expect(result.arbitrageStats?.gemiddeldeSpread).toBe(0);
    });

    it('should handle malformed CSV data', async () => {
      const input = createMockInput();
      const badCSV = 'invalid;csv;data\n1;2;not_a_number';
      const result = await calculateBatteryScenarios(input, badCSV, badCSV);

      expect(result).toBeDefined();
      expect(result.arbitrageStats?.jaarlijkseWinst).toBe(0);
    });
  });

  describe('Scenario Comparison', () => {
    it('should show different payback periods for different scenarios', async () => {
      const input = createMockInput();
      const result = await calculateBatteryScenarios(input, mockCSV2024, mockCSV2025);

      const tvtHuidig = result.scenarios.huidig.terugverdientijd;
      const tvtNa2027 = result.scenarios.na2027.terugverdientijd;
      const tvtDynamisch = result.scenarios.dynamischOptimaal.terugverdientijd;

      // At least one should be different
      expect(
        tvtHuidig !== tvtNa2027 || tvtNa2027 !== tvtDynamisch || tvtHuidig !== tvtDynamisch
      ).toBe(true);
    });

    it('should recommend best scenario', async () => {
      const input = createMockInput();
      const result = await calculateBatteryScenarios(input, mockCSV2024, mockCSV2025);

      expect(result.aanbeveling.besteScenario).toBeDefined();
      expect(['huidig', 'na2027', 'dynamischOptimaal']).toContain(
        result.aanbeveling.besteScenario
      );
    });

    it('should mark as rendabel if payback < 15 years', async () => {
      const input = createMockInput({
        battery: {
          capaciteitKwh: 10,
          prijsEuro: 2000, // Low price for better payback
          roundTripEfficiency: 0.95,
          garantieJaren: 15,
          degradatiePerJaar: 0.01,
        },
      });
      const result = await calculateBatteryScenarios(input, mockCSV2024, mockCSV2025);

      const besteScenario = result.scenarios[result.aanbeveling.besteScenario];
      if (besteScenario.terugverdientijd < 15) {
        expect(result.aanbeveling.isRendabel).toBe(true);
      }
    });
  });

  describe('Arbitrage Calculation', () => {
    it('should calculate arbitrage stats from CSV data', async () => {
      const input = createMockInput();
      const result = await calculateBatteryScenarios(input, mockCSV2024, mockCSV2025);

      expect(result.arbitrageStats).toBeDefined();
      expect(result.arbitrageStats?.gemiddeldeSpread).toBeGreaterThan(0);
      expect(result.arbitrageStats?.aantalCycliPerJaar).toBeGreaterThan(0);
      expect(result.arbitrageStats?.jaarlijkseWinst).toBeGreaterThanOrEqual(0);
    });

    it('should calculate different cycles for with/without solar', async () => {
      const inputWithSolar = createMockInput({ heeftZonnepanelen: true });
      const inputWithoutSolar = createMockInput({
        heeftZonnepanelen: false,
        pvOpwekKwh: undefined,
        huidigEigenverbruikPercentage: undefined,
        eigenverbruikMetAccuPercentage: undefined,
      });

      const resultWith = await calculateBatteryScenarios(
        inputWithSolar,
        mockCSV2024,
        mockCSV2025
      );
      const resultWithout = await calculateBatteryScenarios(
        inputWithoutSolar,
        mockCSV2024,
        mockCSV2025
      );

      // Without solar should have more cycles (less constrained)
      expect(resultWithout.arbitrageStats?.aantalCycliPerJaar).toBeGreaterThanOrEqual(
        resultWith.arbitrageStats?.aantalCycliPerJaar || 0
      );
    });

    it('should calculate price percentiles correctly', async () => {
      const input = createMockInput();
      const result = await calculateBatteryScenarios(input, mockCSV2024, mockCSV2025);

      expect(result.arbitrageStats?.percentielPrijzen.p20Laag).toBeLessThan(
        result.arbitrageStats?.percentielPrijzen.p20Hoog || 0
      );
    });
  });

  describe('Eigenverbruik Impact', () => {
    it('should calculate eigenverbruik impact with solar panels', async () => {
      const input = createMockInput();
      const result = await calculateBatteryScenarios(input, mockCSV2024, mockCSV2025);

      expect(result.eigenverbruikImpact).toBeDefined();
      expect(result.eigenverbruikImpact?.verbetering.extraEigenverbruikKwh).toBeGreaterThan(0);
      expect(result.eigenverbruikImpact?.verbetering.minderTerugleveringKwh).toBeGreaterThan(0);
    });

    it('should show increased eigenverbruik with battery', async () => {
      const input = createMockInput();
      const result = await calculateBatteryScenarios(input, mockCSV2024, mockCSV2025);

      const impact = result.eigenverbruikImpact;
      expect(impact?.metAccu.eigenverbruikKwh).toBeGreaterThan(
        impact?.zonderAccu.eigenverbruikKwh || 0
      );
    });

    it('should calculate financial benefit from eigenverbruik', async () => {
      const input = createMockInput();
      const result = await calculateBatteryScenarios(input, mockCSV2024, mockCSV2025);

      expect(result.eigenverbruikImpact?.verbetering.financieelVoordeel).toBeGreaterThan(0);
    });
  });

  describe('Degradation Model', () => {
    it('should apply degradation after start year', async () => {
      const input = createMockInput();
      const result = await calculateBatteryScenarios(input, mockCSV2024, mockCSV2025);

      const cashflow = result.scenarios.huidig.cashflowPerJaar;
      
      // Cashflow growth should slow down after degradation starts (year 10)
      if (cashflow.length >= 12) {
        const growthYear9 = cashflow[9] - cashflow[8];
        const growthYear11 = cashflow[11] - cashflow[10];
        
        // Growth should be less after degradation starts
        expect(growthYear11).toBeLessThanOrEqual(growthYear9);
      }
    });

    it('should handle high degradation rate', async () => {
      const input = createMockInput({
        battery: {
          capaciteitKwh: 10,
          prijsEuro: 5000,
          roundTripEfficiency: 0.9,
          garantieJaren: 10,
          degradatiePerJaar: 0.05, // 5% per year
        },
      });
      const result = await calculateBatteryScenarios(input, mockCSV2024, mockCSV2025);

      expect(result).toBeDefined();
      expect(result.scenarios.huidig.terugverdientijd).toBeGreaterThan(0);
    });
  });

  describe('Warnings and Recommendations', () => {
    it('should warn when no solar panels', async () => {
      const input = createMockInput({
        heeftZonnepanelen: false,
        pvOpwekKwh: undefined,
        huidigEigenverbruikPercentage: undefined,
        eigenverbruikMetAccuPercentage: undefined,
      });
      const result = await calculateBatteryScenarios(input, mockCSV2024, mockCSV2025);

      expect(result.aanbeveling.waarschuwingen.some(w => w.includes('Zonder zonnepanelen'))).toBe(true);
    });

    it('should warn when using fixed contract', async () => {
      const input = createMockInput({ contractType: 'vast' });
      const result = await calculateBatteryScenarios(input, mockCSV2024, mockCSV2025);

      expect(result.aanbeveling.waarschuwingen.some(w => w.includes('vast contract'))).toBe(true);
    });

    it('should provide appropriate summary for good payback', async () => {
      const input = createMockInput({
        battery: {
          capaciteitKwh: 10,
          prijsEuro: 2000,
          roundTripEfficiency: 0.95,
          garantieJaren: 15,
          degradatiePerJaar: 0.01,
        },
      });
      const result = await calculateBatteryScenarios(input, mockCSV2024, mockCSV2025);

      if (result.scenarios[result.aanbeveling.besteScenario].terugverdientijd < 8) {
        expect(result.aanbeveling.korteSamenvatting).toContain('Kansrijk');
      }
    });
  });

  describe('Contract Type Handling', () => {
    it('should calculate differently for vast vs dynamisch', async () => {
      const inputVast = createMockInput({ contractType: 'vast' });
      const inputDynamisch = createMockInput({ contractType: 'dynamisch' });

      const resultVast = await calculateBatteryScenarios(inputVast, mockCSV2024, mockCSV2025);
      const resultDynamisch = await calculateBatteryScenarios(
        inputDynamisch,
        mockCSV2024,
        mockCSV2025
      );

      // Dynamisch should have arbitrage advantage
      expect(resultDynamisch.scenarios.dynamischOptimaal.jaarlijkseBesparing.arbitrageVoordeel).toBeGreaterThan(0);
      expect(resultVast.scenarios.huidig.jaarlijkseBesparing.arbitrageVoordeel).toBe(0);
    });

    it('should use correct tariffs for vast contract', async () => {
      const input = createMockInput({
        contractType: 'vast',
        stroomKalePrijs: 0.21,
        terugleververgoeding: 0.07,
      });
      const result = await calculateBatteryScenarios(input, mockCSV2024, mockCSV2025);

      expect(result.input.contractType).toBe('vast');
      expect(result.input.stroomKalePrijs).toBe(0.21);
    });
  });

  describe('Assumptions', () => {
    it('should include all required assumptions', async () => {
      const input = createMockInput();
      const result = await calculateBatteryScenarios(input, mockCSV2024, mockCSV2025);

      expect(result.aannamen).toBeDefined();
      expect(result.aannamen.roundTripEfficiency).toBeDefined();
      expect(result.aannamen.aantalCycli).toBeDefined();
      expect(result.aannamen.degradatie).toBeDefined();
      expect(result.aannamen.energiebelasting).toBeDefined();
      expect(result.aannamen.salderingTot2027).toBeDefined();
      expect(result.aannamen.minimaleVergoeding2027).toBeDefined();
    });

    it('should use default values when not provided', async () => {
      const input = createMockInput({
        battery: {
          capaciteitKwh: 10,
          prijsEuro: 5000,
          roundTripEfficiency: undefined as unknown as number,
          garantieJaren: 10,
          degradatiePerJaar: undefined as unknown as number,
        },
      });
      const result = await calculateBatteryScenarios(input, mockCSV2024, mockCSV2025);

      expect(result.aannamen.roundTripEfficiency).toBe(0.9);
      expect(result.aannamen.degradatie).toContain('2.0%');
    });
  });
});

