import { berekenGasbelasting, berekenGasNetbeheer } from '../gasStaffels';

describe('Gas Tax Calculations', () => {
  describe('Gas Tax Brackets', () => {
    it('should calculate correct tax for consumption in first bracket', () => {
      const tax = berekenGasbelasting(500); // Below 1700 m³
      
      // First 1700 m³: €0.4944/m³
      expect(tax).toBeCloseTo(500 * 0.4944, 2);
    });

    it('should calculate correct tax for consumption in second bracket', () => {
      const tax = berekenGasbelasting(2000); // Above 1700 m³
      
      // First 1700 m³: €0.4944/m³
      // Next 300 m³: €0.4944/m³
      const expectedTax = (1700 * 0.4944) + (300 * 0.4944);
      expect(tax).toBeCloseTo(expectedTax, 2);
    });

    it('should handle zero consumption', () => {
      const tax = berekenGasbelasting(0);
      expect(tax).toBe(0);
    });

    it('should handle very high consumption', () => {
      const tax = berekenGasbelasting(10000);
      
      // All consumption taxed at €0.4944/m³
      const expectedTax = 10000 * 0.4944;
      expect(tax).toBeCloseTo(expectedTax, 2);
    });
  });

  describe('Gas Network Costs', () => {
    it('should calculate correct network costs for G4 connection', () => {
      const networkCosts = berekenGasNetbeheer('G4');
      
      // G4: €0.2313/m³
      expect(networkCosts).toBeCloseTo(0.2313, 4);
    });

    it('should calculate correct network costs for G6 connection', () => {
      const networkCosts = berekenGasNetbeheer('G6');
      
      // G6: €0.2313/m³
      expect(networkCosts).toBeCloseTo(0.2313, 4);
    });

    it('should calculate correct network costs for G10 connection', () => {
      const networkCosts = berekenGasNetbeheer('G10');
      
      // G10: €0.2313/m³
      expect(networkCosts).toBeCloseTo(0.2313, 4);
    });

    it('should calculate correct network costs for G16 connection', () => {
      const networkCosts = berekenGasNetbeheer('G16');
      
      // G16: €0.2313/m³
      expect(networkCosts).toBeCloseTo(0.2313, 4);
    });

    it('should calculate correct network costs for G25 connection', () => {
      const networkCosts = berekenGasNetbeheer('G25');
      
      // G25: €0.2313/m³
      expect(networkCosts).toBeCloseTo(0.2313, 4);
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative consumption gracefully', () => {
      const tax = berekenGasbelasting(-100);
      expect(tax).toBeLessThanOrEqual(0);
    });

    it('should handle very small consumption', () => {
      const tax = berekenGasbelasting(1);
      expect(tax).toBeCloseTo(0.4944, 4);
    });

    it('should handle fractional consumption', () => {
      const tax = berekenGasbelasting(123.45);
      expect(tax).toBeCloseTo(123.45 * 0.4944, 2);
    });
  });

  describe('Integration Tests', () => {
    it('should calculate total gas costs correctly', () => {
      const consumption = 1200; // m³
      const kalePrijs = 1.20; // €/m³
      const connectionType = 'G4';
      
      const kaleEnergie = consumption * kalePrijs;
      const energiebelasting = berekenGasbelasting(consumption);
      const netbeheer = consumption * berekenGasNetbeheer(connectionType);
      const btw = (kaleEnergie + energiebelasting + netbeheer) * 0.21;
      
      const totaal = kaleEnergie + energiebelasting + netbeheer + btw;
      
      expect(kaleEnergie).toBe(1440); // 1200 * 1.20
      expect(energiebelasting).toBeCloseTo(593.28, 2); // 1200 * 0.4944
      expect(netbeheer).toBeCloseTo(277.56, 2); // 1200 * 0.2313
      expect(btw).toBeCloseTo(485.28, 2); // (1440 + 593.28 + 277.56) * 0.21
      expect(totaal).toBeCloseTo(2796.12, 2);
    });
  });
});
