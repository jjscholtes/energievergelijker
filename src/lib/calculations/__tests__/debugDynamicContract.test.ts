import { berekenDynamischeEnergiekosten } from '../dynamicEnergyCalculator';
import { UserProfile } from '@/types/user';
import { DynamicContractData } from '@/types/dynamicContracts';

describe('Debug Dynamic Contract', () => {
  it('should calculate correct gemiddelde spotprijs', async () => {
    console.log('\n=== DEBUG DYNAMIC CONTRACT ===');

    const userProfile: UserProfile = {
      postcode: '1234AB',
      netbeheerder: 'Liander',
      aansluitingElektriciteit: '1x25A',
      aansluitingGas: 'G4',
      jaarverbruikStroom: 7000, // Gebruik de waarde uit je voorbeeld
      jaarverbruikStroomPiek: 2800, // 40% van 7000
      jaarverbruikStroomDal: 4200,  // 60% van 7000
      jaarverbruikGas: 1200,
      heeftZonnepanelen: false,
      geenGas: false,
      piekDalVerdeling: { 
        piek: 0.4, 
        dal: 0.6 
      }
    };

    const contract: DynamicContractData = {
      leverancier: 'Test Provider',
      productNaam: 'Dynamisch Contract',
      type: 'dynamisch',
      looptijdMaanden: 12,
      vasteLeveringskosten: 5.99,
      kortingEenmalig: 0,
      duurzaamheidsScore: 7,
      klanttevredenheid: 8,
      tarieven: {
        stroomKalePrijs: 0.15, // Basisprijs
        gasKalePrijs: 1.20,
        terugleververgoeding: 0.15,
        vasteTerugleverkosten: 0
      },
      csvData2024: 'timestamp,price\n2024-01-01T00:00:00Z,0.12\n2024-01-01T01:00:00Z,0.14\n2024-01-01T02:00:00Z,0.16',
      csvData2025: 'timestamp,price\n2025-01-01T00:00:00Z,0.13\n2025-01-01T01:00:00Z,0.15\n2025-01-01T02:00:00Z,0.17',
      maandelijkseVergoeding: 5.99,
      opslagPerKwh: 0.02
    };

    console.log('1. User profile:', {
      totaal: userProfile.jaarverbruikStroom,
      piek: userProfile.jaarverbruikStroomPiek,
      dal: userProfile.jaarverbruikStroomDal
    });
    console.log('2. Contract tarieven:', contract.tarieven);

    const result = await berekenDynamischeEnergiekosten(userProfile, contract, contract.csvData2024, contract.csvData2025, '2024');

    console.log('3. Berekening resultaat:');
    console.log('   Kale energie:', result.stroomKosten.kaleEnergie);
    console.log('   Contract in result:', result.contract.tarieven);
    console.log('   User profile in result:', result.userProfile);

    // Verificatie
    const gemiddeldeSpotPrijs = result.contract.tarieven?.stroomKalePrijs;
    const verwachteKaleEnergie = userProfile.jaarverbruikStroom * gemiddeldeSpotPrijs!;
    
    console.log('4. Gemiddelde spotprijs:', gemiddeldeSpotPrijs);
    console.log('   Verwachte kale energie:', verwachteKaleEnergie);
    console.log('   Werkelijke kale energie:', result.stroomKosten.kaleEnergie);

    expect(result.stroomKosten.kaleEnergie).toBeCloseTo(verwachteKaleEnergie, 2);
    console.log('✅ SUCCES: Dynamische contract correct berekend!');
  });

  it('gooit een fout bij lege CSV-data', async () => {
    const profile: UserProfile = {
      postcode: '1234AB',
      netbeheerder: 'Liander',
      aansluitingElektriciteit: '1x25A',
      aansluitingGas: 'G4',
      jaarverbruikStroom: 3500,
      jaarverbruikStroomPiek: 1400,
      jaarverbruikStroomDal: 2100,
      jaarverbruikGas: 800,
      heeftZonnepanelen: false,
      geenGas: false,
      piekDalVerdeling: {
        piek: 0.4,
        dal: 0.6
      }
    };

    const contract: DynamicContractData = {
      leverancier: 'Test Provider',
      type: 'dynamisch',
      looptijdMaanden: 1,
      vasteLeveringskosten: 4,
      csvData2024: '',
      csvData2025: '',
      kortingEenmalig: 0,
      duurzaamheidsScore: 8,
      klanttevredenheid: 7,
      terugleververgoeding: 0,
      maandelijkseVergoeding: 5,
      opslagPerKwh: 0.02,
      tarieven: {
        gasKalePrijs: 0.6,
        terugleververgoeding: 0.05
      }
    };

    await expect(
      berekenDynamischeEnergiekosten(profile, contract, contract.csvData2024, contract.csvData2025, '2024')
    ).rejects.toThrow('Geen geldige prijsdata gevonden in CSV');
  });
});
