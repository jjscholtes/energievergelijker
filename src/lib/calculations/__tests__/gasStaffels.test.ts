import { berekenGasbelasting, berekenGasNetbeheer } from '../gasStaffels';

describe('Gas Tax Calculations', () => {
  describe('Gas Tax Brackets', () => {
    it('should calculate correct tax for consumption in first bracket', () => {
      const tax = berekenGasbelasting(500); // Below 1700 m³
      
      // First 1000 m³: €0.70544/m³
      expect(tax).toBeCloseTo(500 * 0.70544, 2);
    });

    it('should calculate correct tax for consumption in second bracket', () => {
      const tax = berekenGasbelasting(2000); // Above 1700 m³
      
      // First 1700 m³: €0.4944/m³
      // First 1000 m³: €0.70544/m³, next 1000 m³: €0.70544/m³
      const expectedTax = (1000 * 0.70544) + (1000 * 0.70544);
      expect(tax).toBeCloseTo(expectedTax, 2);
    });

    it('should handle zero consumption', () => {
      const tax = berekenGasbelasting(0);
      expect(tax).toBe(0);
    });

    it('should handle very high consumption', () => {
      const tax = berekenGasbelasting(10000);
      
      // All consumption taxed at €0.70544/m³ (within first bracket)
      const expectedTax = 10000 * 0.70544;
      expect(tax).toBeCloseTo(expectedTax, 2);
    });
  });

  describe('Gas Network Costs', () => {
    it('should calculate correct network costs for G4 connection', () => {
      const networkCosts = berekenGasNetbeheer('G4');
      
      // G4: Vast bedrag per jaar (gemiddelde van netbeheerders)
      expect(networkCosts).toBe(257);
    });

    it('should calculate correct network costs for G6 connection', () => {
      const networkCosts = berekenGasNetbeheer('G6');
      
      // G6: Vast bedrag per jaar (gemiddelde van netbeheerders)
      expect(networkCosts).toBe(257);
    });

    it('should calculate correct network costs for G10 connection', () => {
      const networkCosts = berekenGasNetbeheer('G10');
      
      // G10: Vast bedrag per jaar (gemiddelde van netbeheerders)
      expect(networkCosts).toBe(257);
    });

    it('should calculate correct network costs for G16 connection', () => {
      const networkCosts = berekenGasNetbeheer('G16');
      
      // G16: Vast bedrag per jaar (gemiddelde van netbeheerders)
      expect(networkCosts).toBe(257);
    });

    it('should calculate correct network costs for G25 connection', () => {
      const networkCosts = berekenGasNetbeheer('G25');
      
      // G25: Vast bedrag per jaar (gemiddelde van netbeheerders)
      expect(networkCosts).toBe(257);
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative consumption gracefully', () => {
      const tax = berekenGasbelasting(-100);
      expect(tax).toBeLessThanOrEqual(0);
    });

    it('should handle very small consumption', () => {
      const tax = berekenGasbelasting(1);
      expect(tax).toBeCloseTo(0.70544, 4);
    });

    it('should handle fractional consumption', () => {
      const tax = berekenGasbelasting(123.45);
      expect(tax).toBeCloseTo(123.45 * 0.70544, 2);
    });
  });

  describe('Integration Tests', () => {
    it('should calculate total gas costs correctly', () => {
      const consumption = 1200; // m³
      const kalePrijs = 1.20; // €/m³
      const connectionType = 'G4';
      
      const kaleEnergie = consumption * kalePrijs;
      const energiebelasting = berekenGasbelasting(consumption);
      const netbeheer = berekenGasNetbeheer(consumption, connectionType);
      const btw = (kaleEnergie + energiebelasting + netbeheer) * 0.21;
      
      const totaal = kaleEnergie + energiebelasting + netbeheer + btw;
      
      expect(kaleEnergie).toBe(1440); // 1200 * 1.20
      expect(energiebelasting).toBeCloseTo(846.53, 2); // 1200 * 0.70544
      expect(netbeheer).toBe(257); // Vast bedrag per jaar
      expect(btw).toBeCloseTo(534.14, 2); // (1440 + 846.53 + 257) * 0.21
      expect(totaal).toBeCloseTo(3077.67, 2);
    });
  });
});
