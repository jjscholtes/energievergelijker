import { berekenEnergiekosten } from '../energyCalculator';
import { UserProfile } from '@/types/user';
import { ContractData } from '@/types/contracts';

describe('Debug Real Application Flow', () => {
  it('should simulate exact tool page flow', () => {
    console.log('\n=== REAL APPLICATION FLOW TEST ===');
    console.log('Simulating exact flow from tool page to CostBreakdown');

    // Simuleer userProfile zoals in tool page
    const userProfile: UserProfile = {
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

    // Simuleer contract zoals het zou worden aangemaakt door handleAddContract
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
        stroomKalePrijsPiek: 0.28,              // ← Gebruiker input
        stroomKalePrijsDal: 0.22,               // ← Gebruiker input
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

    // Simuleer handleCalculate functie
    const fullUserProfile = {
      postcode: '1234AB',
      netbeheerder: userProfile.netbeheerder,
      aansluitingElektriciteit: '1x25A' as const,
      aansluitingGas: 'G4' as const,
      jaarverbruikStroom: userProfile.jaarverbruikStroom,
      jaarverbruikStroomPiek: userProfile.jaarverbruikStroomPiek,
      jaarverbruikStroomDal: userProfile.jaarverbruikStroomDal,
      jaarverbruikGas: userProfile.jaarverbruikGas,
      heeftZonnepanelen: userProfile.heeftZonnepanelen,
      pvOpwek: 0,
      percentageZelfverbruik: 35,
      heeftWarmtepomp: false,
      heeftElektrischeAuto: false,
      geenGas: userProfile.geenGas,
      piekDalVerdeling: {
        piek: 0.4,
        dal: 0.6
      }
    };

    console.log('3. Full user profile voor berekening:', {
      totaal: fullUserProfile.jaarverbruikStroom,
      piek: fullUserProfile.jaarverbruikStroomPiek,
      dal: fullUserProfile.jaarverbruikStroomDal
    });

    const result = berekenEnergiekosten(fullUserProfile, contract);
    
    console.log('4. Berekening resultaat:');
    console.log('   Kale energie:', result.stroomKosten.kaleEnergie);
    console.log('   Contract in result:', result.contract.tarieven);
    console.log('   User profile in result:', result.userProfile);

    // Simuleer CostBreakdown logica
    console.log('\n5. CostBreakdown logica:');
    const isDynamisch = result.contract.type === 'dynamisch';
    const heeftPiekDal = !!(result.contract.tarieven?.stroomKalePrijsPiek && result.contract.tarieven?.stroomKalePrijsDal);
    
    console.log('   isDynamisch:', isDynamisch);
    console.log('   heeftPiekDal:', heeftPiekDal);
    console.log('   stroomKalePrijsPiek:', result.contract.tarieven?.stroomKalePrijsPiek);
    console.log('   stroomKalePrijsDal:', result.contract.tarieven?.stroomKalePrijsDal);
    console.log('   stroomKalePrijs:', result.contract.tarieven?.stroomKalePrijs);

    if (isDynamisch) {
      console.log('   DYNAMISCH tak gebruikt');
    } else if (heeftPiekDal) {
      console.log('   PIEK/DAL tak gebruikt (CORRECT!)');
      console.log('     Normaal:', result.userProfile?.jaarverbruikStroomPiek || 0, 'kWh × €', result.contract.tarieven.stroomKalePrijsPiek.toFixed(4), '= €', ((result.userProfile?.jaarverbruikStroomPiek || 0) * result.contract.tarieven.stroomKalePrijsPiek).toFixed(2));
      console.log('     Dal:', result.userProfile?.jaarverbruikStroomDal || 0, 'kWh × €', result.contract.tarieven.stroomKalePrijsDal.toFixed(4), '= €', ((result.userProfile?.jaarverbruikStroomDal || 0) * result.contract.tarieven.stroomKalePrijsDal).toFixed(2));
    } else {
      console.log('   ENKEL TARIEF tak gebruikt (FOUT!)');
      console.log('     Verbruik × kale prijs =', result.userProfile?.jaarverbruikStroom || 0, 'kWh × €', (result.contract.tarieven?.stroomKalePrijs || 0.10).toFixed(4));
    }

    // Verificatie
    expect(result.contract.tarieven.stroomKalePrijsPiek).toBe(0.28);
    expect(result.contract.tarieven.stroomKalePrijsDal).toBe(0.22);
    expect(result.contract.tarieven.stroomKalePrijs).toBeUndefined();
    expect(heeftPiekDal).toBe(true);
    expect(result.stroomKosten.kaleEnergie).toBeCloseTo(2196, 2);
    
    console.log('\n✅ SUCCES: Alles correct!');
  });
});
