import { berekenEnergiekosten } from '../energyCalculator';
import { UserProfile } from '@/types/user';
import { ContractData } from '@/types/contracts';

describe('Energy Calculator', () => {
  const mockUserProfile: UserProfile = {
    postcode: '1000AA',
    aansluitingElektriciteit: '1x25A',
    aansluitingGas: 'G4',
    jaarverbruikStroom: 3000,
    jaarverbruikGas: 1200,
    heeftZonnepanelen: false,
    geenGas: false,
    netbeheerder: 'Liander',
    piekDalVerdeling: {
      piek: 0.4,
      dal: 0.6
    }
  };

  const mockContract: ContractData = {
    leverancier: 'Test Leverancier',
    productNaam: 'Test Product',
    type: 'vast',
    looptijdMaanden: 12,
    vasteLeveringskosten: 8.99,
    tarieven: {
      stroomKalePrijs: 0.25,
      gasKalePrijs: 1.20,
      terugleververgoeding: 0.01
    },
    kortingEenmalig: 0,
    duurzaamheidsScore: 7,
    klanttevredenheid: 8
  };

  describe('Basic Energy Calculation', () => {
    it('should calculate correct energy costs without PV', () => {
      const result = berekenEnergiekosten(mockUserProfile, mockContract);

      expect(result.totaleJaarkosten).toBeGreaterThan(0);
      expect(result.stroomKosten.kaleEnergie).toBe(750); // 3000 * 0.25
      expect(result.stroomKosten.energiebelasting).toBeCloseTo(394.8, 1); // 3000 * 0.1316
      expect(result.gasKosten.kaleEnergie).toBe(1440); // 1200 * 1.20
    });

    it('should handle zero consumption', () => {
      const zeroProfile = { ...mockUserProfile, jaarverbruikStroom: 0, jaarverbruikGas: 0 };
      const result = berekenEnergiekosten(zeroProfile, mockContract);

      expect(result.stroomKosten.kaleEnergie).toBe(0);
      expect(result.gasKosten.kaleEnergie).toBe(0);
      expect(result.totaleJaarkosten).toBeGreaterThan(0); // Should still have fixed costs
    });

    it('should handle extreme consumption values', () => {
      const extremeProfile = { ...mockUserProfile, jaarverbruikStroom: 50000, jaarverbruikGas: 10000 };
      const result = berekenEnergiekosten(extremeProfile, mockContract);

      expect(result.stroomKosten.kaleEnergie).toBe(12500); // 50000 * 0.25
      expect(result.gasKosten.kaleEnergie).toBe(12000); // 10000 * 1.20
      expect(result.totaleJaarkosten).toBeGreaterThan(0);
    });
  });

  describe('PV Calculations', () => {
    const pvProfile: UserProfile = {
      ...mockUserProfile,
      heeftZonnepanelen: true,
      pvOpwek: 4000,
      percentageZelfverbruik: 35
    };

    it('should calculate PV benefits correctly', () => {
      const result = berekenEnergiekosten(pvProfile, mockContract);

      expect(result.pvOpbrengsten).toBeDefined();
      expect(result.pvOpbrengsten?.zelfVerbruikKwh).toBe(1400); // 4000 * 0.35
      expect(result.pvOpbrengsten?.terugleveringKwh).toBe(2600); // 4000 - 1400
      expect(result.totaleJaarkostenMetPv).toBeLessThan(result.totaleJaarkosten);
    });

    it('should handle zero PV production', () => {
      const zeroPvProfile = { ...pvProfile, pvOpwek: 0 };
      const result = berekenEnergiekosten(zeroPvProfile, mockContract);

      expect(result.pvOpbrengsten?.totaleOpbrengst).toBe(0);
      expect(result.totaleJaarkostenMetPv).toBe(result.totaleJaarkosten);
    });

    it('should handle 100% self-consumption', () => {
      const fullSelfConsumptionProfile = { ...pvProfile, percentageZelfverbruik: 100 };
      const result = berekenEnergiekosten(fullSelfConsumptionProfile, mockContract);

      expect(result.pvOpbrengsten?.terugleveringKwh).toBe(0);
      expect(result.pvOpbrengsten?.gesaldeerdKwh).toBe(0);
    });
  });

  describe('Gas-free Profile', () => {
    it('should handle geenGas profile correctly', () => {
      const geenGasProfile = { ...mockUserProfile, geenGas: true };
      const result = berekenEnergiekosten(geenGasProfile, mockContract);

      expect(result.gasKosten.totaal).toBe(0);
      expect(result.gasKosten.kaleEnergie).toBe(0);
      expect(result.gasKosten.energiebelasting).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative consumption gracefully', () => {
      const negativeProfile = { ...mockUserProfile, jaarverbruikStroom: -100 };
      const result = berekenEnergiekosten(negativeProfile, mockContract);

      // Should not crash and should handle gracefully
      expect(result.stroomKosten.kaleEnergie).toBeLessThanOrEqual(0);
    });

    it('should handle very small consumption', () => {
      const smallProfile = { ...mockUserProfile, jaarverbruikStroom: 1, jaarverbruikGas: 1 };
      const result = berekenEnergiekosten(smallProfile, mockContract);

      expect(result.stroomKosten.kaleEnergie).toBe(0.25); // 1 * 0.25
      expect(result.gasKosten.kaleEnergie).toBe(1.20); // 1 * 1.20
    });
  });
});
