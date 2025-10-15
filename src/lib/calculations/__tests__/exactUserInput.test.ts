import { berekenEnergiekosten } from '../energyCalculator';
import { UserProfile } from '@/types/user';
import { ContractData } from '@/types/contracts';

describe('Exact User Input Test', () => {
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

  it('should use EXACT input values that user typed', () => {
    // Contract met EXACTE waarden zoals gebruiker zou invoeren
    const userTypedContract: ContractData = {
      leverancier: 'Test Provider',
      productNaam: 'Vast Contract',
      type: 'vast',
      looptijdMaanden: 12,
      vasteLeveringskosten: 8.99,
      kortingEenmalig: 0,
      duurzaamheidsScore: 7,
      klanttevredenheid: 8,
      tarieven: {
        // GEEN stroomKalePrijs - alleen piek/dal zoals gebruiker invult!
        stroomKalePrijsPiek: 0.28,              // ← Gebruiker types €0.28  
        stroomKalePrijsDal: 0.20,               // ← Gebruiker types €0.20
        gasKalePrijs: 1.20,
        terugleververgoeding: 0.01
      }
    };

    const result = berekenEnergiekosten(testUserProfile, userTypedContract);
    
    console.log('\n=== EXACT USER INPUT TEST ===');
    console.log('Gebruiker inputde:', {
      piekTarief: userTypedContract.tarieven.stroomKalePrijsPiek,
      dalTarief: userTypedContract.tarieven.stroomKalePrijsDal
    });
    console.log('Contract gebruikt:', result.contract.tarieven);
    console.log('Kale energie resultaat:', result.stroomKosten.kaleEnergie);

    // Bereken wat het ZOU moeten zijn met de ingevoerde waarden
    const expectedKale = (testUserProfile.jaarverbruikStroomPiek * userTypedContract.tarieven.stroomKalePrijsPiek!) +
                        (testUserProfile.jaarverbruikStroomDal * userTypedContract.tarieven.stroomKalePrijsDal!);
    console.log('Verwacht kale energie:', expectedKale);
    console.log('Werkelijk kale energie:', result.stroomKosten.kaleEnergie);

    // De berekening moet EXACT zijn zoals gebruiker invulde
    expect(result.stroomKosten.kaleEnergie).toBeCloseTo(expectedKale, 2);
    
    // Contract tarieven moeten exact hetzelfde zijn
    expect(result.contract.tarieven.stroomKalePrijsPiek).toBe(userTypedContract.tarieven.stroomKalePrijsPiek);
    expect(result.contract.tarieven.stroomKalePrijsDal).toBe(userTypedContract.tarieven.stroomKalePrijsDal);
    
    // Er mag GEEN stroomKalePrijs zijn als alleen piek/dal wordt gebruikt
    expect(result.contract.tarieven.stroomKalePrijs).toBeUndefined();
  });

  it('should handle single tariff correctly when user inputs that', () => {
    const singleTariffContract: ContractData = {
      leverancier: 'Test Provider',
      productNaam: 'Single Tariff Contract',
      type: 'vast',
      looptijdMaanden: 12,
      vasteLeveringskosten: 5.99,
      kortingEenmalig: 0,
      duurzaamheidsScore: 5,
      klanttevredenheid: 7,
      tarieven: {
        stroomKalePrijs: 0.25,                 // ← Gebruiker types alleen dit
        // Geen piek/dal tarieven
        gasKalePrijs: 1.20,
        terugleververgoeding: 0.01
      }
    };

    const result = berekenEnergiekosten(testUserProfile, singleTariffContract);
    
    console.log('\n=== SINGLE TARIFF TEST ===');
    console.log('Gebruiker inputde:', {
      enkelTarief: singleTariffContract.tarieven.stroomKalePrijs
    });
    console.log('Kale energie resultaat:', result.stroomKosten.kaleEnergie);

    // Voor enkel tarief: totaal verbruik × tarief
    const expectedKale = testUserProfile.jaarverbruikStroom * singleTariffContract.tarieven.stroomKalePrijs!;
    console.log('Verwacht kale energie:', expectedKale);
    
    expect(result.stroomKosten.kaleEnergie).toBeCloseTo(expectedKale, 2);
    expect(result.contract.tarieven.stroomKalePrijs).toBe(singleTariffContract.tarieven.stroomKalePrijs);
  });
});
