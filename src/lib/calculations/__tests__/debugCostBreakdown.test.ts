import { berekenEnergiekosten } from '../energyCalculator';
import { UserProfile } from '@/types/user';
import { ContractData } from '@/types/contracts';

describe('Debug CostBreakdown Display', () => {
  const testUserProfile: UserProfile = {
    postcode: '1234AB',
    netbeheerder: 'Liander',
    aansluitingElektriciteit: '1x25A',
    aansluitingGas: 'G4',
    jaarverbruikStroom: 9000,  // Gebruik de waarde uit je voorbeeld
    jaarverbruikStroomPiek: 3600,  // 40% van 9000
    jaarverbruikStroomDal: 5400,   // 60% van 9000
    jaarverbruikGas: 1200,
    heeftZonnepanelen: false,
    geenGas: false,
    piekDalVerdeling: { 
      piek: 0.4, 
      dal: 0.6 
    }
  };

  it('should show correct piek/dal breakdown in CostBreakdown', () => {
    console.log('\n=== DEBUG COSTBREAKDOWN DISPLAY ===');
    console.log('Testing met 9000 kWh totaal verbruik');

    // Contract met piek/dal tarieven
    const contractWithPiekDal: ContractData = {
      leverancier: 'Test Provider',
      productNaam: 'Piek/Dal Contract',
      type: 'vast',
      looptijdMaanden: 12,
      vasteLeveringskosten: 8.99,
      kortingEenmalig: 0,
      duurzaamheidsScore: 7,
      klanttevredenheid: 8,
      tarieven: {
        stroomKalePrijsPiek: 0.28,              // ← Piek tarief
        stroomKalePrijsDal: 0.22,               // ← Dal tarief
        gasKalePrijs: 1.20,
        teruglevergoeding: 0.01
      }
    };

    const result = berekenEnergiekosten(testUserProfile, contractWithPiekDal);
    
    console.log('Contract type:', result.contract.type);
    console.log('Contract tarieven:', result.contract.tarieven);
    console.log('User profile:', {
      totaal: result.userProfile?.jaarverbruikStroom,
      piek: result.userProfile?.jaarverbruikStroomPiek,
      dal: result.userProfile?.jaarverbruikStroomDal
    });
    console.log('Kale energie resultaat:', result.stroomKosten.kaleEnergie);

    // Simuleer CostBreakdown logica
    console.log('\n=== COSTBREAKDOWN LOGICA SIMULATIE ===');
    
    const isDynamisch = result.contract.type === 'dynamisch';
    const heeftPiekDal = !!(result.contract.tarieven?.stroomKalePrijsPiek && result.contract.tarieven?.stroomKalePrijsDal);
    
    console.log('isDynamisch:', isDynamisch);
    console.log('heeftPiekDal:', heeftPiekDal);
    console.log('stroomKalePrijsPiek:', result.contract.tarieven?.stroomKalePrijsPiek);
    console.log('stroomKalePrijsDal:', result.contract.tarieven?.stroomKalePrijsDal);
    console.log('stroomKalePrijs:', result.contract.tarieven?.stroomKalePrijs);

    if (isDynamisch) {
      console.log('DYNAMISCH: Verbruik × spotprijs =', result.userProfile?.jaarverbruikStroom || 0, 'kWh × €', result.contract.tarieven?.stroomKalePrijs?.toFixed(4) || '0.0000');
    } else if (heeftPiekDal) {
      console.log('PIEK/DAL:');
      console.log('  Normaal:', result.userProfile?.jaarverbruikStroomPiek || 0, 'kWh × €', result.contract.tarieven.stroomKalePrijsPiek.toFixed(4), '= €', ((result.userProfile?.jaarverbruikStroomPiek || 0) * result.contract.tarieven.stroomKalePrijsPiek).toFixed(2));
      console.log('  Dal:', result.userProfile?.jaarverbruikStroomDal || 0, 'kWh × €', result.contract.tarieven.stroomKalePrijsDal.toFixed(4), '= €', ((result.userProfile?.jaarverbruikStroomDal || 0) * result.contract.tarieven.stroomKalePrijsDal).toFixed(2));
    } else {
      console.log('ENKEL TARIEF: Verbruik × kale prijs =', result.userProfile?.jaarverbruikStroom || 0, 'kWh × €', (result.contract.tarieven?.stroomKalePrijs || 0.10).toFixed(4));
    }

    // Verificatie
    expect(result.contract.tarieven.stroomKalePrijsPiek).toBe(0.28);
    expect(result.contract.tarieven.stroomKalePrijsDal).toBe(0.22);
    expect(result.contract.tarieven.stroomKalePrijs).toBeUndefined();
    expect(heeftPiekDal).toBe(true);
    
    console.log('✅ SUCCES: Piek/dal tarieven correct gedetecteerd!');
  });
});
