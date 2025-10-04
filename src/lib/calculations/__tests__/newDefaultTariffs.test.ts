import { berekenEnergiekosten } from '../energyCalculator';
import { UserProfile } from '@/types/user';
import { ContractData } from '@/types/contracts';

describe('New Default Tariffs Test (€0.10 en €0.11)', () => {
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

  it('should use EXACT €0.10 and €0.11 values that user typed', () => {
    console.log('\n=== NEW DEFAULT TARIFFS TEST ===');
    console.log('Testing met nieuwe default waarden: €0.10 normaal, €0.11 dal');

    // Contract met EXACTE nieuwe default waarden
    const newDefaultContract: ContractData = {
      leverancier: 'Test Provider',
      productNaam: 'New Default Contract',
      type: 'vast',
      looptijdMaanden: 12,
      vasteLeveringskosten: 8.99,
      kortingEenmalig: 0,
      duurzaamheidsScore: 7,
      klanttevredenheid: 8,
      tarieven: {
        // GEEN stroomKalePrijs - alleen piek/dal zoals gebruiker invult!
        stroomKalePrijsPiek: 0.10,              // ← NIEUWE default €0.10  
        stroomKalePrijsDal: 0.11,               // ← NIEUWE default €0.11
        gasKalePrijs: 1.20,
        terugleververgoeding: 0.01,
        vasteTerugleverkosten: 0
      }
    };

    const result = berekenEnergiekosten(testUserProfile, newDefaultContract);
    
    console.log('Gebruiker inputde:', {
      piekTarief: newDefaultContract.tarieven.stroomKalePrijsPiek,
      dalTarief: newDefaultContract.tarieven.stroomKalePrijsDal
    });
    console.log('Contract gebruikt:', result.contract.tarieven);
    console.log('Kale energie resultaat:', result.stroomKosten.kaleEnergie);

    // Bereken wat het ZOU moeten zijn met de ingevoerdë waarden
    const verwachtKale = (testUserProfile.jaarverbruikStroomPiek * newDefaultContract.tarieven.stroomKalePrijsPiek!) +
                        (testUserProfile.jaarverbruikStroomDal * newDefaultContract.tarieven.stroomKalePrijsDal!);
    
    console.log('Handmatige berekening:');
    console.log('  Normaal:', testUserProfile.jaarverbruikStroomPiek, 'kWh × €', newDefaultContract.tarieven.stroomKalePrijsPiek, '= €', testUserProfile.jaarverbruikStroomPiek * newDefaultContract.tarieven.stroomKalePrijsPiek!);
    console.log('  Dal:', testUserProfile.jaarverbruikStroomDal, 'kWh × €', newDefaultContract.tarieven.stroomKalePrijsDal, '= €', testUserProfile.jaarverbruikStroomDal * newDefaultContract.tarieven.stroomKalePrijsDal!);
    console.log('Verwacht kale energie:', verwachtKale);
    console.log('Werkelijk kale energie:', result.stroomKosten.kaleEnergie);

    // De berekening moet EXACT zijn zoals gebruiker invulde
    expect(result.stroomKosten.kaleEnergie).toBeCloseTo(verwachtKale, 2);
    
    // Contract tarieven moeten exact hetzelfde zijn
    expect(result.contract.tarieven.stroomKalePrijsPiek).toBe(newDefaultContract.tarieven.stroomKalePrijsPiek);
    expect(result.contract.tarieven.stroomKalePrijsDal).toBe(newDefaultContract.tarieven.stroomKalePrijsDal);
    
    // Er mag GEEN stroomKalePrijs zijn als alleen piek/dal wordt gebruikt
    expect(result.contract.tarieven.stroomKalePrijs).toBeUndefined();

    console.log('✅ SUCCES: €0.10 en €0.11 worden exact gebruikt!');
  });

  it('should test variation with €0.12 and €0.09', () => {
    console.log('\n=== VARIATION TEST ===');
    console.log('Testing met andere waarden: €0.12 normaal, €0.09 dal');

    const variationContract: ContractData = {
      leverancier: 'Test Provider',
      productNaam: 'Variation Contract',
      type: 'vast',
      looptijdMaanden: 12,
      vasteLeveringskosten: 5.99,
      kortingEenmalig: 100,
      duurzaamheidsScore: 8,
      klanttevredenheid: 9,
      tarieven: {
        stroomKalePrijsPiek: 0.12,              // ← Andere waarden
        stroomKalePrijsDal: 0.09,              
        gasKalePrijs: 1.15,
        terugleververgoeding: 0.008,
        vasteTerugleverkosten: 0
      }
    };

    const result = berekenEnergiekosten(testUserProfile, variationContract);
    
    console.log('Gebruiker inputde:', {
      piekTarief: variationContract.tarieven.stroomKalePrijsPiek,
      dalTarief: variationContract.tarieven.stroomKalePrijsDal
    });
    
    const verwachtVariatie = (testUserProfile.jaarverbruikStroomPiek * variationContract.tarieven.stroomKalePrijsPiek!) +
                            (testUserProfile.jaarverbruikStroomDal * variationContract.tarieven.stroomKalePrijsDal!);
    
    console.log('Verwacht kale energie:', verwachtVariatie);
    console.log('Werkelijk kale energie:', result.stroomKosten.kaleEnergie);

    // Test exacte waarden
    expect(result.stroomKosten.kaleEnergie).toBeCloseTo(verwachtVariatie, 2);
    expect(result.contract.tarieven.stroomKalePrijsPiek).toBe(0.12);
    expect(result.contract.tarieven.stroomKalePrijsDal).toBe(0.09);
    
    console.log('✅ SUCCES: €0.12 en €0.09 ook exact gebruikt!');
  });
});
