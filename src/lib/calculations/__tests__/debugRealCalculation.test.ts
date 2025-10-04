import { berekenEnergiekosten } from '../energyCalculator';
import { UserProfile } from '@/types/user';
import { ContractData } from '@/types/contracts';

describe('Debug Real Calculation', () => {
  it('should calculate correct kale energie with piek/dal tarieven', () => {
    console.log('\n=== DEBUG REAL CALCULATION ===');

    const userProfile: UserProfile = {
      postcode: '1234AB',
      netbeheerder: 'Liander',
      aansluitingElektriciteit: '1x25A',
      aansluitingGas: 'G4',
      jaarverbruikStroom: 2900,
      jaarverbruikStroomPiek: 1160,
      jaarverbruikStroomDal: 1740,
      jaarverbruikGas: 1200,
      heeftZonnepanelen: false,
      geenGas: false,
      piekDalVerdeling: { 
        piek: 0.4, 
        dal: 0.6 
      }
    };

    const contract: ContractData = {
      leverancier: 'Test Provider',
      productNaam: 'Test Contract',
      type: 'vast',
      looptijdMaanden: 12,
      vasteLeveringskosten: 8.99,
      kortingEenmalig: 0,
      duurzaamheidsScore: 7,
      klanttevredenheid: 8,
      tarieven: {
        // Alleen piek/dal tarieven, geen enkel tarief
        stroomKalePrijsPiek: 0.28,
        stroomKalePrijsDal: 0.22,
        gasKalePrijs: 1.20,
        terugleververgoeding: 0.01,
        vasteTerugleverkosten: 0
      }
    };

    console.log('1. User profile:', {
      totaal: userProfile.jaarverbruikStroom,
      piek: userProfile.jaarverbruikStroomPiek,
      dal: userProfile.jaarverbruikStroomDal
    });
    console.log('2. Contract tarieven:', contract.tarieven);

    const result = berekenEnergiekosten(userProfile, contract);

    console.log('3. Berekening resultaat:');
    console.log('   Kale energie:', result.stroomKosten.kaleEnergie);
    console.log('   Contract in result:', result.contract.tarieven);
    console.log('   User profile in result:', result.userProfile);

    // Verificatie
    const expectedKaleEnergie = (userProfile.jaarverbruikStroomPiek! * contract.tarieven.stroomKalePrijsPiek!) + 
                               (userProfile.jaarverbruikStroomDal! * contract.tarieven.stroomKalePrijsDal!);
    
    console.log('4. Verwachte kale energie:', expectedKaleEnergie);
    console.log('   Normaal:', userProfile.jaarverbruikStroomPiek, '×', contract.tarieven.stroomKalePrijsPiek, '=', userProfile.jaarverbruikStroomPiek! * contract.tarieven.stroomKalePrijsPiek!);
    console.log('   Dal:', userProfile.jaarverbruikStroomDal, '×', contract.tarieven.stroomKalePrijsDal, '=', userProfile.jaarverbruikStroomDal! * contract.tarieven.stroomKalePrijsDal!);

    expect(result.stroomKosten.kaleEnergie).toBeCloseTo(expectedKaleEnergie, 2);
    console.log('✅ SUCCES: Kale energie correct berekend!');
  });
});
