import { berekenEnergiekosten } from '../energyCalculator';
import { UserProfile } from '@/types/user';
import { ContractData } from '@/types/contracts';

describe('Debug €0.25 Issue', () => {
  const testUserProfile: UserProfile = {
    postcode: '1234AB',
    netbeheerder: 'Liander',
    aansluitingElektriciteit: '1x25A',
    aansluitingGas: 'G4',
    jaarverbruikStroom: 2900,
    jaarverbruikStroomPiek: 1160,           // 40% van 2900
    jaarverbruikStroomDal: 1740,            // 60% van 2900
    jaarverbruikGas: 1200,
    heeftZonnepanelen: false,
    geenGas: false,
    piekDalVerdeling: { 
      piek: 0.4, 
      dal: 0.6 
    }
  };

  it('should NOT use €0.25 when user inputs €0.10 and €0.10', () => {
    console.log('\n=== DEBUG €0.25 ISSUE TEST ===');
    console.log('Testing met gebruiker input: €0.10 normaal, €0.10 dal');

    // Contract zoals het zou worden aangemaakt door de tool na de fix
    const fixedContract: ContractData = {
      leverancier: 'Test Provider',
      productNaam: 'Fixed Contract',
      type: 'vast',
      looptijdMaanden: 12,
      vasteLeveringskosten: 8.99,
      kortingEenmalig: 0,
      duurzaamheidsScore: 7,
      klanttevredenheid: 8,
      tarieven: {
        // GEEN stroomKalePrijs meer!
        stroomKalePrijsPiek: 0.10,              // ← Gebruiker input €0.10  
        stroomKalePrijsDal: 0.10,               // ← Gebruiker input €0.10
        gasKalePrijs: 1.20,
        terugleververgoeding: 0.01
      }
    };

    console.log('Contract tarieven:', fixedContract.tarieven);
    console.log('stroomKalePrijs:', fixedContract.tarieven.stroomKalePrijs);
    console.log('stroomKalePrijsPiek:', fixedContract.tarieven.stroomKalePrijsPiek);
    console.log('stroomKalePrijsDal:', fixedContract.tarieven.stroomKalePrijsDal);

    const result = berekenEnergiekosten(testUserProfile, fixedContract);
    
    console.log('\n=== BEREKENINGSRESULTAAT ===');
    console.log('Kale energie:', result.stroomKosten.kaleEnergie, '€');
    console.log('Contract tarieven in result:', result.contract.tarieven);
    
    // Verificatie - moet €290 zijn (1160 × €0.10 + 1740 × €0.10)
    const expectedKale = (testUserProfile.jaarverbruikStroomPiek * 0.10) + 
                        (testUserProfile.jaarverbruikStroomDal * 0.10);
    console.log('\nVERIFICATIE:');
    console.log('Verwacht kale energie:', expectedKale, '€');
    console.log('Werkelijk kale energie:', result.stroomKosten.kaleEnergie, '€');
    
    // Test dat het NIET €0.25 gebruikt
    expect(result.stroomKosten.kaleEnergie).toBeCloseTo(expectedKale, 2);
    expect(result.stroomKosten.kaleEnergie).not.toBeCloseTo(725, 2); // 2900 × 0.25
    
    // Test dat de contract tarieven correct zijn
    expect(result.contract.tarieven.stroomKalePrijsPiek).toBe(0.10);
    expect(result.contract.tarieven.stroomKalePrijsDal).toBe(0.10);
    
    // Er mag GEEN stroomKalePrijs zijn
    expect(result.contract.tarieven.stroomKalePrijs).toBeUndefined();
    
    console.log('✅ SUCCES: Geen €0.25 gebruikt, correcte berekening!');
  });

  it('should handle different values correctly', () => {
    console.log('\n=== DIFFERENT VALUES TEST ===');
    console.log('Testing met €0.12 normaal, €0.08 dal');

    const differentContract: ContractData = {
      leverancier: 'Test Provider',
      productNaam: 'Different Contract',
      type: 'vast',
      looptijdMaanden: 12,
      vasteLeveringskosten: 5.99,
      kortingEenmalig: 0,
      duurzaamheidsScore: 5,
      klanttevredenheid: 7,
      tarieven: {
        stroomKalePrijsPiek: 0.12,              // ← Andere waarden
        stroomKalePrijsDal: 0.08,              
        gasKalePrijs: 1.15,
        terugleververgoeding: 0.008
      }
    };

    const result = berekenEnergiekosten(testUserProfile, differentContract);
    
    console.log('Kale energie resultaat:', result.stroomKosten.kaleEnergie, '€');
    
    const expectedDifferent = (testUserProfile.jaarverbruikStroomPiek * 0.12) + 
                             (testUserProfile.jaarverbruikStroomDal * 0.08);
    console.log('Verwacht kale energie:', expectedDifferent, '€');
    
    expect(result.stroomKosten.kaleEnergie).toBeCloseTo(expectedDifferent, 2);
    expect(result.contract.tarieven.stroomKalePrijsPiek).toBe(0.12);
    expect(result.contract.tarieven.stroomKalePrijsDal).toBe(0.08);
    
    console.log('✅ SUCCES: Verschillende waarden ook correct!');
  });
});
