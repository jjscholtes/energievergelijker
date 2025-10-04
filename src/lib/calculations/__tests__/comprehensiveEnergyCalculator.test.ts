import { berekenEnergiekosten } from '../energyCalculator';
import { berekenDynamischeEnergiekosten } from '../dynamicEnergyCalculator';
import { UserProfile } from '@/types/user';
import { ContractData } from '@/types/contracts';
import { DynamicContractData } from '@/types/dynamicContracts';

describe('Comprehensive Energy Calculator Tests', () => {
  // Test data voor verschillende scenario's
  const baseUserProfile: UserProfile = {
    postcode: '1000AA',
    netbeheerder: 'Liander',
    aansluitingElektriciteit: '1x25A',
    aansluitingGas: 'G4',
    jaarverbruikStroom: 3000,
    jaarverbruikStroomPiek: 1200, // 40% van 3000
    jaarverbruikStroomDal: 1800, // 60% van 3000
    jaarverbruikGas: 1200,
    heeftZonnepanelen: false,
    geenGas: false,
    piekDalVerdeling: {
      piek: 0.4,
      dal: 0.6
    }
  };

  const baseContract: ContractData = {
    leverancier: 'Test Leverancier',
    productNaam: 'Test Product',
    type: 'vast',
    looptijdMaanden: 12,
    vasteLeveringskosten: 8.99,
    tarieven: {
      stroomKalePrijs: 0.25,
      gasKalePrijs: 1.20,
      terugleververgoeding: 0.01,
      vasteTerugleverkosten: 0
    },
    kortingEenmalig: 0,
    duurzaamheidsScore: 7,
    klanttevredenheid: 8
  };

  describe('Fixed Contract Calculations - Basic Scenarios', () => {
    it('should calculate correct basic energy costs', () => {
      const result = berekenEnergiekosten(baseUserProfile, baseContract);
      
      console.log('Basic calculation result:', {
        totaleJaarkosten: result.totaleJaarkosten,
        stroomKosten: result.stroomKosten,
        gasKosten: result.gasKosten,
        maandlastenGemiddeld: result.maandlastenGemiddeld
      });

      // Kale energie stroom: 3000 * 0.25 = 750
      expect(result.stroomKosten.kaleEnergie).toBe(750);
      
      // Energiebelasting stroom: 3000 * 0.1316 = 394.8
      expect(result.stroomKosten.energiebelasting).toBeCloseTo(394.8, 1);
      
      // Netbeheer stroom: Liander = 471
      expect(result.stroomKosten.netbeheer).toBe(471);
      
      // Vaste leveringskosten: 8.99 * 12 = 107.88
      expect(result.stroomKosten.vasteLeveringskosten).toBeCloseTo(107.88, 1);
      
      // Heffingskorting: 631.35
      const expectedStroomTotaal = 750 + 394.8 + 471 + 107.88 - 631.35;
      expect(result.stroomKosten.totaal).toBeCloseTo(expectedStroomTotaal, 1);
      
      // Gas kosten
      expect(result.gasKosten.kaleEnergie).toBe(1440); // 1200 * 1.20
      expect(result.gasKosten.netbeheer).toBe(248); // Liander gas kosten
      
      // Totale kosten zonder korting
      const expectedTotal = result.stroomKosten.totaal + result.gasKosten.totaal;
      expect(result.totaleJaarkosten).toBeCloseTo(expectedTotal, 1);
    });

    it('should handle peak/dal tariffs correctly', () => {
      const contractWithPeakDal: ContractData = {
        ...baseContract,
        tarieven: {
          ...baseContract.tarieven,
          stroomKalePrijsPiek: 0.28,
          stroomKalePrijsDal: 0.22,
          stroomKalePrijs: undefined // Geen enkel tarief
        }
      };

      const result = berekenEnergiekosten(baseUserProfile, contractWithPeakDal);
      
      console.log('Peak/Dal calculation result:', {
        totaleJaarkosten: result.totaleJaarkosten,
        stroomKosten: result.stroomKosten
      });

      // Kale energie: (1200 * 0.28) + (1800 * 0.22) = 336 + 396 = 732
      const expectedKaleEnergie = (1200 * 0.28) + (1800 * 0.22);
      expect(result.stroomKosten.kaleEnergie).toBeCloseTo(expectedKaleEnergie, 1);
    });

    it('should handle contracts with both single and peak/dal tariffs', () => {
      const contractWithBoth: ContractData = {
        ...baseContract,
        tarieven: {
          ...baseContract.tarieven,
          stroomKalePrijs: 0.25,
          stroomKalePrijsPiek: 0.28,
          stroomKalePrijsDal: 0.22
        }
      };

      const result = berekenEnergiekosten(baseUserProfile, contractWithBoth);
      
      console.log('Both tariffs calculation result:', {
        totaleJaarkosten: result.totaleJaarkosten,
        stroomKosten: result.stroomKosten
      });

      // Should prioritize peak/dal over single tariff
      const expectedKaleEnergie = (1200 * 0.28) + (1800 * 0.22);
      expect(result.stroomKosten.kaleEnergie).toBeCloseTo(expectedKaleEnergie, 1);
    });

    it('should handle contracts with only single tariff', () => {
      const contractSingleOnly: ContractData = {
        ...baseContract,
        tarieven: {
          ...baseContract.tarieven,
          stroomKalePrijs: 0.25,
          stroomKalePrijsPiek: undefined,
          stroomKalePrijsDal: undefined
        }
      };

      const result = berekenEnergiekosten(baseUserProfile, contractSingleOnly);
      
      console.log('Single tariff calculation result:', {
        totaleJaarkosten: result.totaleJaarkosten,
        stroomKosten: result.stroomKosten
      });

      // Should use single tariff: 3000 * 0.25 = 750
      expect(result.stroomKosten.kaleEnergie).toBe(750);
    });
  });

  describe('Fixed Contract Calculations - PV Scenarios', () => {
    const pvUserProfile: UserProfile = {
      ...baseUserProfile,
      heeftZonnepanelen: true,
      pvOpwek: 4000,
      percentageZelfverbruik: 35
    };

    it('should calculate PV benefits correctly', () => {
      const result = berekenEnergiekosten(pvUserProfile, baseContract);
      
      console.log('PV calculation result:', {
        totaleJaarkosten: result.totaleJaarkosten,
        totaleJaarkostenMetPv: result.totaleJaarkostenMetPv,
        pvOpbrengsten: result.pvOpbrengsten
      });

      expect(result.pvOpbrengsten).toBeDefined();
      expect(result.pvOpbrengsten?.zelfVerbruikKwh).toBe(1400); // 4000 * 0.35
      expect(result.pvOpbrengsten?.terugleveringKwh).toBe(2600); // 4000 - 1400
      expect(result.totaleJaarkostenMetPv).toBeLessThan(result.totaleJaarkosten);
    });

    it('should handle PV with terugleverkosten', () => {
      const contractWithTerugleverkosten: ContractData = {
        ...baseContract,
        tarieven: {
          ...baseContract.tarieven,
          vasteTerugleverkosten: 100
        }
      };

      const result = berekenEnergiekosten(pvUserProfile, contractWithTerugleverkosten);
      
      console.log('PV with terugleverkosten result:', {
        pvOpbrengsten: result.pvOpbrengsten
      });

      expect(result.pvOpbrengsten?.terugleverkosten).toBe(100);
    });
  });

  describe('Dynamic Contract Calculations', () => {
    const dynamicContract: DynamicContractData = {
      leverancier: 'Tibber',
      productNaam: 'Tibber Dynamic',
      type: 'dynamisch',
      looptijdMaanden: 1,
      vasteLeveringskosten: 3.95,
      csvData2024: 'timestamp,price\n2024-01-01T00:00:00Z,0.15\n2024-01-01T01:00:00Z,0.16',
      csvData2025: 'timestamp,price\n2025-01-01T00:00:00Z,0.15\n2025-01-01T01:00:00Z,0.16',
      kortingEenmalig: 0,
      duurzaamheidsScore: 9.0,
      klanttevredenheid: 8.5,
      terugleververgoeding: 0.0,
      maandelijkseVergoeding: 5.99,
      opslagPerKwh: 0.02,
      tarieven: {
        stroomKalePrijs: 0.15,
        gasKalePrijs: 0.30,
        terugleververgoeding: 0.15
      }
    };

    it('should calculate dynamic contract costs correctly', async () => {
      const result = await berekenDynamischeEnergiekosten(
        baseUserProfile,
        dynamicContract,
        dynamicContract.csvData2024,
        dynamicContract.csvData2025,
        '2024'
      );
      
      console.log('Dynamic calculation result:', {
        totaleJaarkosten: result.totaleJaarkosten,
        stroomKosten: result.stroomKosten,
        gasKosten: result.gasKosten
      });

      expect(result.totaleJaarkosten).toBeGreaterThan(0);
      expect(result.stroomKosten.kaleEnergie).toBeGreaterThan(0);
      expect(result.stroomKosten.maandelijkseVergoeding).toBeCloseTo(71.88, 1); // 5.99 * 12
      expect(result.stroomKosten.opslagPerKwh).toBeCloseTo(60, 1); // 3000 * 0.02
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle zero consumption', () => {
      const zeroProfile = { ...baseUserProfile, jaarverbruikStroom: 0, jaarverbruikGas: 0 };
      const result = berekenEnergiekosten(zeroProfile, baseContract);

      expect(result.stroomKosten.kaleEnergie).toBe(0);
      expect(result.gasKosten.kaleEnergie).toBe(0);
      expect(result.totaleJaarkosten).toBeGreaterThan(0); // Should still have fixed costs
    });

    it('should handle geenGas profile', () => {
      const geenGasProfile = { ...baseUserProfile, geenGas: true };
      const result = berekenEnergiekosten(geenGasProfile, baseContract);

      expect(result.gasKosten.totaal).toBe(0);
      expect(result.gasKosten.kaleEnergie).toBe(0);
    });

    it('should handle different netbeheerders', () => {
      const stedinProfile = { ...baseUserProfile, netbeheerder: 'Stedin' };
      const result = berekenEnergiekosten(stedinProfile, baseContract);

      expect(result.stroomKosten.netbeheer).toBe(490); // Stedin stroom kosten
      expect(result.gasKosten.netbeheer).toBe(268); // Stedin gas kosten
    });
  });

  describe('Calculation Consistency Tests', () => {
    it('should produce consistent results for same inputs', () => {
      const result1 = berekenEnergiekosten(baseUserProfile, baseContract);
      const result2 = berekenEnergiekosten(baseUserProfile, baseContract);

      expect(result1.totaleJaarkosten).toBeCloseTo(result2.totaleJaarkosten, 2);
      expect(result1.stroomKosten.totaal).toBeCloseTo(result2.stroomKosten.totaal, 2);
      expect(result1.gasKosten.totaal).toBeCloseTo(result2.gasKosten.totaal, 2);
    });

    it('should handle missing optional fields gracefully', () => {
      const incompleteProfile: UserProfile = {
        postcode: '1000AA',
        netbeheerder: 'Liander',
        aansluitingElektriciteit: '1x25A',
        aansluitingGas: 'G4',
        jaarverbruikStroom: 3000,
        jaarverbruikGas: 1200,
        heeftZonnepanelen: false,
        geenGas: false
      };

      const result = berekenEnergiekosten(incompleteProfile, baseContract);
      expect(result.totaleJaarkosten).toBeGreaterThan(0);
    });
  });
});
