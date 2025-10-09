'use client';

import { useState } from 'react';
import { Calculator, MapPin, Zap, Sun, Car, Flame } from 'lucide-react';
import { berekenEnergiekosten } from '@/lib/calculations/energyCalculator';
import { berekenDynamischeEnergiekosten } from '@/lib/calculations/dynamicEnergyCalculator';
import { getNetbeheerderKosten } from '@/lib/calculations/netbeheerderKosten';
import { sampleCSV2024, sampleCSV2025 } from '@/lib/data/sampleDynamicData';
import { bepaalNetbeheerder } from '@/lib/data/netbeheerders';

interface ContractAdviesProps {
  className?: string;
}

interface NetbeheerderData {
  netbeheerder: string;
  stroomVastrecht: number;
  gasVastrecht: number;
  stroomVariabel: number;
  gasVariabel: number;
}

export function EnergiecontractAdvies({ className = '' }: ContractAdviesProps) {
  const [postcode, setPostcode] = useState('');
  const [dalVerbruik, setDalVerbruik] = useState('');
  const [normaalVerbruik, setNormaalVerbruik] = useState('');
  const [gasVerbruik, setGasVerbruik] = useState('');
  const [geenGas, setGeenGas] = useState(false);
  const [pvTeruglevering, setPvTeruglevering] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [netbeheerderData, setNetbeheerderData] = useState<NetbeheerderData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Prefilled contract data - exact zoals opgegeven
  const vastContract = {
    leverancier: 'Gemiddeld Vast Contract',
    productNaam: 'Standaard Vast',
    type: 'vast' as const,
    looptijdMaanden: 12,
    duurzaamheidsScore: 3,
    klanttevredenheid: 3,
    tarieven: {
      stroomKalePrijs: 0.10, // €0.10/kWh excl. belasting
      terugleververgoeding: 0.01, // €0.01/kWh
      gasKalePrijs: 0.63, // €0.63/m³ excl. belasting
      vasteTerugleverkosten: 389 // €389/jaar
    },
    vasteLeveringskosten: 10, // €10/maand per product
    kortingEenmalig: 200 // €200 korting
  };

  const dynamischContract = {
    leverancier: 'Gemiddeld Flexibel Contract',
    productNaam: 'Standaard Flexibel',
    type: 'dynamisch' as const,
    looptijdMaanden: 12,
    duurzaamheidsScore: 3,
    klanttevredenheid: 3,
    csvData2024: sampleCSV2024,
    csvData2025: sampleCSV2025,
    terugleververgoeding: 0.0595, // €0.0595/kWh (gemiddelde spotprijs)
    maandelijkseVergoeding: 0, // Geen maandelijkse vergoeding
    opslagPerKwh: 0.025, // €0.025/kWh opslag
    opslagInvoeding: 0.025, // €0.025/kWh opslag voor invoeding
    tarieven: {
      stroomKalePrijs: 0.085, // €0.085/kWh excl. belasting
      terugleververgoeding: 0.0595, // €0.0595/kWh (gemiddelde spotprijs)
      gasKalePrijs: 0.63, // €0.63/m³ excl. belasting
      vasteTerugleverkosten: 0 // Geen vaste terugleverkosten voor dynamisch
    },
    vasteLeveringskosten: 7, // €7/maand
    kortingEenmalig: 0 // Geen korting
  };

  const fetchNetbeheerder = async (postcode: string) => {
    console.log('Fetching netbeheerder for postcode:', postcode);
    
    // Gebruik direct de lokale database - veel betrouwbaarder dan externe API
    const netbeheerder = bepaalNetbeheerder(postcode);
    
    if (netbeheerder) {
      console.log('Found netbeheerder from local database:', netbeheerder.naam);
      return {
        netbeheerder: netbeheerder.naam,
        stroomVastrecht: netbeheerder.kostenStroom,
        gasVastrecht: netbeheerder.kostenGas,
        stroomVariabel: netbeheerder.kostenStroom,
        gasVariabel: netbeheerder.kostenGas
      };
    }
    
    console.log('No netbeheerder found for postcode, using Enexis fallback');
    // Fallback naar Enexis als geen netbeheerder gevonden
    return { 
      netbeheerder: 'Enexis', 
      stroomVastrecht: 492, 
      gasVastrecht: 254, 
      stroomVariabel: 492, 
      gasVariabel: 254 
    };
  };

  const calculateCosts = async () => {
    if (!postcode || !dalVerbruik || !normaalVerbruik || (!gasVerbruik && !geenGas) || !pvTeruglevering) {
      setError('Vul alle verplichte velden in');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch netbeheerder data
      const netbeheerder = await fetchNetbeheerder(postcode);
      setNetbeheerderData(netbeheerder);

      // Parse inputs
      const dal = parseFloat(dalVerbruik);
      const normaal = parseFloat(normaalVerbruik);
      const gas = geenGas ? 0 : parseFloat(gasVerbruik);
      const pv = parseFloat(pvTeruglevering);

      // Validate inputs
      if (isNaN(dal) || isNaN(normaal) || isNaN(gas) || isNaN(pv)) {
        throw new Error('Ongeldige invoer. Controleer of alle velden correct zijn ingevuld.');
      }

      if (dal < 0 || normaal < 0 || gas < 0 || pv < 0) {
        throw new Error('Alle waarden moeten positief zijn.');
      }

      const totaalStroomVerbruik = dal + normaal;

      // Create user profile exactly like in zelf vergelijken tool
      const userProfile = {
        postcode: postcode,
        netbeheerder: netbeheerder.netbeheerder,
        aansluitingElektriciteit: '1x25A' as const,
        aansluitingGas: 'G4' as const,
        jaarverbruikStroom: totaalStroomVerbruik,
        jaarverbruikStroomPiek: normaal,
        jaarverbruikStroomDal: dal,
        jaarverbruikGas: gas,
        heeftZonnepanelen: pv > 0,
        pvOpwek: pv, // Dit is nu alleen teruglevering
        percentageZelfverbruik: 0, // Geen zelfverbruik, alles wordt teruggeleverd
        heeftWarmtepomp: false,
        heeftElektrischeAuto: false,
        geenGas: geenGas,
        piekDalVerdeling: {
          piek: normaal / totaalStroomVerbruik,
          dal: dal / totaalStroomVerbruik
        }
      };

      // Calculate vast contract using exact same logic
      console.log('Calculating vast contract...');
      let vastResult;
      try {
        vastResult = berekenEnergiekosten(userProfile, vastContract);
        console.log('Vast result:', vastResult);
      } catch (calcError) {
        console.error('Error calculating vast contract:', calcError);
        throw new Error(`Vast contract berekening mislukt: ${calcError instanceof Error ? calcError.message : 'Onbekende fout'}`);
      }

      // Calculate dynamisch contract using exact same logic
      console.log('Calculating dynamisch contract...');
      let dynamischResult;
      try {
        dynamischResult = await berekenDynamischeEnergiekosten(userProfile, dynamischContract, sampleCSV2024, sampleCSV2025, '2025');
        console.log('Dynamisch result:', dynamischResult);
      } catch (calcError) {
        console.error('Error calculating dynamisch contract:', calcError);
        throw new Error(`Dynamisch contract berekening mislukt: ${calcError instanceof Error ? calcError.message : 'Onbekende fout'}`);
      }

      const besparing = Math.abs(vastResult.totaleJaarkostenMetPv - dynamischResult.totaleJaarkostenMetPv);
      const goedkoopsteContract = vastResult.totaleJaarkostenMetPv < dynamischResult.totaleJaarkostenMetPv ? 'vast' : 'dynamisch';

      setResult({
        vast: {
          totaal: vastResult.totaleJaarkostenMetPv,
          stroomKosten: vastResult.stroomKosten,
          gasKosten: vastResult.gasKosten,
          pvOpbrengsten: vastResult.pvOpbrengsten,
          korting: vastContract.kortingEenmalig
        },
        dynamisch: {
          totaal: dynamischResult.totaleJaarkostenMetPv,
          stroomKosten: dynamischResult.stroomKosten,
          gasKosten: dynamischResult.gasKosten,
          pvOpbrengsten: dynamischResult.pvOpbrengsten,
          opslagPerKwh: dynamischContract.opslagPerKwh
        },
        besparing,
        goedkoopsteContract,
        netbeheerder: netbeheerder.netbeheerder,
        userProfile: {
          jaarverbruikStroom: totaalStroomVerbruik,
          jaarverbruikGas: gas,
          pvOpwek: pv, // Dit is nu alleen teruglevering
          percentageZelfverbruik: 0, // Geen zelfverbruik, alles wordt teruggeleverd
          geenGas: gas === 0
        }
      });

    } catch (error) {
      console.error('Calculation error:', error);
      
      // More specific error handling
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          setError('Netwerkfout: Kan netbeheerder niet ophalen. Probeer het opnieuw.');
        } else if (error.message.includes('parse')) {
          setError('Datafout: Ongeldige gegevens ontvangen. Controleer je invoer.');
        } else {
          setError(`Berekening fout: ${error.message}`);
        }
      } else {
        setError('Er is een onverwachte fout opgetreden. Controleer je invoer en probeer opnieuw.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`bg-white/90 backdrop-blur-sm rounded-3xl p-6 lg:p-8 shadow-2xl border border-white/40 ${className}`}>
      <div className="text-center mb-6 lg:mb-8">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full text-sm font-bold mb-4 lg:mb-6 shadow-lg">
          <Calculator className="w-5 h-5" />
          <span>Energiecontract Advies</span>
        </div>
        <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3 lg:mb-4">
          Ontdek welk contract voor jou voordeliger is
        </h3>
        <p className="text-gray-600 mb-4 lg:mb-6 text-sm lg:text-base">
          Vul je gegevens in en krijg direct advies over het beste energiecontract
        </p>
      </div>

      {!result ? (
        <div className="space-y-4 lg:space-y-6">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <span className="text-red-600 text-xl">⚠️</span>
                <p className="text-red-800 font-semibold">{error}</p>
              </div>
            </div>
          )}
          {/* Postcode */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              Postcode *
            </label>
            <input
              type="text"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value.toUpperCase())}
              placeholder="1234AB"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Stroomverbruik */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Zap className="w-4 h-4 inline mr-2" />
                Dal verbruik (kWh/jaar) *
              </label>
              <input
                type="number"
                value={dalVerbruik}
                onChange={(e) => setDalVerbruik(e.target.value)}
                placeholder="1500"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Zap className="w-4 h-4 inline mr-2" />
                Normaal verbruik (kWh/jaar) *
              </label>
              <input
                type="number"
                value={normaalVerbruik}
                onChange={(e) => setNormaalVerbruik(e.target.value)}
                placeholder="2000"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Gasverbruik met checkbox */}
          <div>
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="geenGas"
                checked={geenGas}
                onChange={(e) => setGeenGas(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="geenGas" className="ml-2 text-sm font-semibold text-gray-700">
                <Flame className="w-4 h-4 inline mr-2" />
                Geen gasverbruik
              </label>
            </div>
            {!geenGas && (
              <input
                type="number"
                value={gasVerbruik}
                onChange={(e) => setGasVerbruik(e.target.value)}
                placeholder="1200"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
          </div>

          {/* PV Teruglevering */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Sun className="w-4 h-4 inline mr-2" />
              Zonnepanelen teruglevering (kWh/jaar) *
            </label>
            <input
              type="number"
              value={pvTeruglevering}
              onChange={(e) => setPvTeruglevering(e.target.value)}
              placeholder="2500"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Hoeveel kWh lever je jaarlijks terug aan het net?</p>
          </div>

          {/* Percentage zelfverbruik */}

          {/* Calculate Button */}
          <button
            onClick={calculateCosts}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? 'Berekenen...' : 'Bereken Advies'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Result Header */}
          <div className="text-center">
            <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full text-sm font-bold mb-4 shadow-lg ${
              result.goedkoopsteContract === 'vast' 
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
            }`}>
              <span>{result.goedkoopsteContract === 'vast' ? '🏠' : '⚡'}</span>
              <span>
                {result.goedkoopsteContract === 'vast' ? 'Vast Contract' : 'Flexibel Contract'} 
                {' '}is voordeliger
              </span>
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-2">
              Je bespaart €{result.besparing.toFixed(0)} per jaar
            </h4>
            <p className="text-gray-600">
              Netbeheerder: {result.netbeheerder}
            </p>
          </div>

          {/* Detailed Cost Breakdown */}
          <div className="space-y-6">
            {/* Vast Contract Details */}
            <div className={`p-6 rounded-xl border-2 ${
              result.goedkoopsteContract === 'vast' 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200 bg-gray-50'
            }`}>
              <h5 className="font-bold text-xl mb-4 flex items-center gap-2">
                <span>🏠</span>
                Vast Contract - €{result.vast.totaal.toFixed(0)}/jaar
              </h5>
              
              {/* Stroomkosten Breakdown */}
              <div className="space-y-3 mb-4">
                <h6 className="font-semibold text-gray-800">⚡ Stroomkosten</h6>
                <div className="space-y-1 text-sm ml-4">
                  <div className="flex justify-between">
                    <span>Kale energie:</span>
                    <span>€{result.vast.stroomKosten.kaleEnergie.toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {result.userProfile.totaalStroomVerbruik} kWh × €{vastContract.tarieven.stroomKalePrijs.toFixed(3)}
                  </div>
                  <div className="flex justify-between">
                    <span>Energiebelasting:</span>
                    <span>€{result.vast.stroomKosten.energiebelasting.toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {result.userProfile?.jaarverbruikStroom || 0} kWh × €0.1316
                  </div>
                  <div className="flex justify-between">
                    <span>Netbeheerder:</span>
                    <span>€{result.vast.stroomKosten.netbeheer.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vaste leveringskosten:</span>
                    <span>€{result.vast.stroomKosten.vasteLeveringskosten.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Heffingskorting:</span>
                    <span>-€631.35</span>
                  </div>
                </div>
              </div>

              {/* Gaskosten Breakdown */}
              {!result.userProfile.geenGas && result.userProfile.jaarverbruikGas > 0 && (
                <div className="space-y-3 mb-4">
                  <h6 className="font-semibold text-gray-800">🔥 Gaskosten</h6>
                  <div className="space-y-1 text-sm ml-4">
                    <div className="flex justify-between">
                      <span>Kale energie:</span>
                      <span>€{result.vast.gasKosten.kaleEnergie.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {result.userProfile.gasVerbruik} m³ × €{vastContract.tarieven.gasKalePrijs.toFixed(3)}
                    </div>
                    <div className="flex justify-between">
                      <span>Energiebelasting:</span>
                      <span>€{result.vast.gasKosten.energiebelasting.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Netbeheerder:</span>
                      <span>€{result.vast.gasKosten.netbeheer.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* PV Opbrengsten */}
              {result.vast.pvOpbrengsten && (
                <div className="space-y-3 mb-4">
                  <h6 className="font-semibold text-gray-800">☀️ Zonnepanelen Opbrengsten</h6>
                  <div className="space-y-1 text-sm ml-4">
                    <div className="flex justify-between text-green-600">
                      <span>Saldering besparing:</span>
                      <span>-€{result.vast.pvOpbrengsten.salderingsBesparing.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {result.vast.pvOpbrengsten.gesaldeerdKwh.toFixed(0)} kWh × €0.1316
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Terugleververgoeding:</span>
                      <span>-€{result.vast.pvOpbrengsten.terugleververgoedingBedrag.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {(result.vast.pvOpbrengsten.nettoTerugleveringKwh + result.vast.pvOpbrengsten.gesaldeerdKwh).toFixed(0)} kWh × €{vastContract.tarieven.terugleververgoeding.toFixed(4)}
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Terugleverkosten:</span>
                      <span>€{result.vast.pvOpbrengsten.terugleverkosten.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Staffel op basis van {(result.vast.pvOpbrengsten.nettoTerugleveringKwh + result.vast.pvOpbrengsten.gesaldeerdKwh).toFixed(0)} kWh jaarlijkse teruglevering
                    </div>
                  </div>
                </div>
              )}

              {/* Korting */}
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-green-600">
                  <span>Eenmalige korting:</span>
                  <span>-€{result.vast.korting}</span>
                </div>
              </div>
            </div>

            {/* Dynamisch Contract Details */}
            <div className={`p-6 rounded-xl border-2 ${
              result.goedkoopsteContract === 'dynamisch' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 bg-gray-50'
            }`}>
              <h5 className="font-bold text-xl mb-4 flex items-center gap-2">
                <span>⚡</span>
                Flexibel Contract - €{result.dynamisch.totaal.toFixed(0)}/jaar
              </h5>
              
              {/* Stroomkosten Breakdown */}
              <div className="space-y-3 mb-4">
                <h6 className="font-semibold text-gray-800">⚡ Stroomkosten</h6>
                <div className="space-y-1 text-sm ml-4">
                  <div className="flex justify-between">
                    <span>Kale energie:</span>
                    <span>€{result.dynamisch.stroomKosten.kaleEnergie.toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {result.userProfile?.jaarverbruikStroom || 0} kWh × €{dynamischContract.tarieven.stroomKalePrijs.toFixed(3)}
                  </div>
                  <div className="flex justify-between">
                    <span>Energiebelasting:</span>
                    <span>€{result.dynamisch.stroomKosten.energiebelasting.toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {result.userProfile?.jaarverbruikStroom || 0} kWh × €0.1316
                  </div>
                  <div className="flex justify-between">
                    <span>Netbeheerder:</span>
                    <span>€{result.dynamisch.stroomKosten.netbeheer.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vaste leveringskosten:</span>
                    <span>€{(result.dynamisch.stroomKosten.vasteLeveringskosten || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Maandelijkse vergoeding:</span>
                    <span>€{(result.dynamisch.stroomKosten.maandelijkseVergoeding || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Opslag per kWh:</span>
                    <span>€{(() => {
                      const verbruik = result.userProfile?.jaarverbruikStroom || 0;
                      const tarief = result.dynamisch?.stroomKosten?.opslagPerKwhTarief || dynamischContract.opslagPerKwh || 0;
                      return (verbruik * tarief).toFixed(2);
                    })()}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {result.userProfile?.jaarverbruikStroom || 0} kWh × €{(result.dynamisch?.stroomKosten?.opslagPerKwhTarief || dynamischContract.opslagPerKwh || 0).toFixed(3)}
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Heffingskorting:</span>
                    <span>-€631.35</span>
                  </div>
                </div>
              </div>

              {/* Gaskosten Breakdown */}
              {!result.userProfile.geenGas && result.userProfile.jaarverbruikGas > 0 && (
                <div className="space-y-3 mb-4">
                  <h6 className="font-semibold text-gray-800">🔥 Gaskosten</h6>
                  <div className="space-y-1 text-sm ml-4">
                    <div className="flex justify-between">
                      <span>Kale energie:</span>
                      <span>€{result.dynamisch.gasKosten.kaleEnergie.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {result.userProfile?.jaarverbruikGas || 0} m³ × €{dynamischContract.tarieven.gasKalePrijs.toFixed(3)}
                    </div>
                    <div className="flex justify-between">
                      <span>Energiebelasting:</span>
                      <span>€{result.dynamisch.gasKosten.energiebelasting.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Netbeheerder:</span>
                      <span>€{result.dynamisch.gasKosten.netbeheer.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* PV Opbrengsten */}
              {result.dynamisch.pvOpbrengsten && (
                <div className="space-y-3 mb-4">
                  <h6 className="font-semibold text-gray-800">☀️ Zonnepanelen Opbrengsten</h6>
                  <div className="space-y-1 text-sm ml-4">
                    <div className="flex justify-between text-green-600">
                      <span>Saldering besparing:</span>
                      <span>-€{result.dynamisch.pvOpbrengsten.salderingsBesparing.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {result.dynamisch.pvOpbrengsten.gesaldeerdKwh.toFixed(0)} kWh × €0.1316
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Terugleververgoeding:</span>
                      <span>-€{result.dynamisch.pvOpbrengsten.terugleververgoedingBedrag.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {(result.dynamisch.pvOpbrengsten.nettoTerugleveringKwh + result.dynamisch.pvOpbrengsten.gesaldeerdKwh).toFixed(0)} kWh × €{dynamischContract.tarieven.terugleververgoeding.toFixed(4)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Explanation */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
            <h6 className="font-bold text-blue-800 mb-2">💡 Waarom is dit contract voordeliger?</h6>
            <p className="text-sm text-blue-700">
              {result.goedkoopsteContract === 'vast' 
                ? 'Een vast contract biedt zekerheid en vaak eenmalige kortingen. Met jouw verbruik en zonnepanelen profiel is dit het meest voordelige contract.'
                : 'Een flexibel contract volgt de marktprijzen. Met jouw verbruik en zonnepanelen profiel profiteer je van lagere basisprijzen en hogere terugleververgoedingen.'
              }
            </p>
          </div>

          {/* Reset Button */}
          <button
            onClick={() => {
              setResult(null);
              setNetbeheerderData(null);
              setError(null);
            }}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
          >
            Nieuwe Berekenen
          </button>
        </div>
      )}
    </div>
  );
}