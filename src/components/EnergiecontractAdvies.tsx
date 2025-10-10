'use client';

import { useState } from 'react';
import { Calculator, MapPin, Zap, Sun, Flame, ChevronDown } from 'lucide-react';
import { berekenEnergiekosten } from '@/lib/calculations/energyCalculator';
import { berekenDynamischeEnergiekosten } from '@/lib/calculations/dynamicEnergyCalculator';
import { sampleCSV2024, sampleCSV2025 } from '@/lib/data/sampleDynamicData';

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
  const [netbeheerder, setNetbeheerder] = useState('');
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
      terugleververgoeding: 0.01, // €0.01/kWh voor vaste contracten (1 cent per kWh)
      gasKalePrijs: 0.63, // €0.63/m³ excl. belasting (realistische marktprijs)
      vasteTerugleverkosten: 0 // Terugleverkosten worden nu dynamisch berekend op basis van staffel
    },
    vasteLeveringskosten: 7, // €7/maand (realistische marktprijs)
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
    opslagInvoeding: 0.023, // €0.023/kWh opslag voor invoeding
    vasteLeveringskosten: 7, // €7/maand
    kortingEenmalig: 0, // Geen korting voor dynamische contracten
    tarieven: {
      stroomKalePrijs: 0.085, // €0.085/kWh excl. belasting
      terugleververgoeding: 0.0595, // €0.0595/kWh (gemiddelde spotprijs)
      gasKalePrijs: 0.63, // €0.63/m³ excl. belasting
      vasteTerugleverkosten: 0 // Geen vaste terugleverkosten voor dynamisch
    }
  };

  // Netbeheerder data
  const netbeheerders = [
    { naam: 'Liander', stroomKosten: 471, gasKosten: 248 },
    { naam: 'Stedin', stroomKosten: 490, gasKosten: 254 },
    { naam: 'Enexis', stroomKosten: 492, gasKosten: 267 }
  ];

  const getNetbeheerderData = (naam: string) => {
    const netbeheerder = netbeheerders.find(n => n.naam === naam);
    if (!netbeheerder) {
      return { 
        netbeheerder: 'Enexis', 
        stroomVastrecht: 492, 
        gasVastrecht: 267, 
        stroomVariabel: 492, 
        gasVariabel: 267 
      };
    }
    return {
      netbeheerder: netbeheerder.naam,
      stroomVastrecht: netbeheerder.stroomKosten,
      gasVastrecht: netbeheerder.gasKosten,
      stroomVariabel: netbeheerder.stroomKosten,
      gasVariabel: netbeheerder.gasKosten
    };
  };

  const calculateCosts = async () => {
    if (!netbeheerder || !dalVerbruik || !normaalVerbruik || (!gasVerbruik && !geenGas) || !pvTeruglevering) {
      setError('Vul alle verplichte velden in');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get netbeheerder data
      const netbeheerderData = getNetbeheerderData(netbeheerder);
      setNetbeheerderData(netbeheerderData);

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
        postcode: '0000AA', // Placeholder since we're not using postcode anymore
        netbeheerder: netbeheerderData.netbeheerder,
        aansluitingElektriciteit: '1x25A' as const,
        aansluitingGas: geenGas ? undefined : 'G4' as const, // Alleen instellen als er gas wordt gebruikt
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
        netbeheerder: netbeheerderData.netbeheerder,
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
          {/* Netbeheerder Dropdown */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              Netbeheerder *
            </label>
            <div className="relative">
              <select
                value={netbeheerder}
                onChange={(e) => setNetbeheerder(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">Selecteer je netbeheerder</option>
                {netbeheerders.map((nb) => (
                  <option key={nb.naam} value={nb.naam}>
                    {nb.naam} (€{nb.stroomKosten}/jaar stroom, €{nb.gasKosten}/jaar gas)
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
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

        {/* Results Section - Always show below form */}
        {result && (
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
            {/* Simple Results Header */}
            <div className="text-center mb-6">
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
                Je bespaart €{result.besparing.toFixed(0)} per jaar!
              </h4>
            </div>

            {/* Simple Cost Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Vast Contract */}
              <div className={`p-6 rounded-xl border-2 ${
                result.goedkoopsteContract === 'vast' 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200 bg-white'
              }`}>
                <h5 className="font-bold text-xl mb-4 flex items-center gap-2">
                  <span>🏠</span>
                  Vast Contract
                </h5>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-gray-900">
                    €{(result.vast.totaal / 12).toFixed(0)} per maand
                  </div>
                  <div className="text-lg text-gray-600">
                    €{result.vast.totaal.toFixed(0)} per jaar
                  </div>
                </div>
              </div>

              {/* Dynamisch Contract */}
              <div className={`p-6 rounded-xl border-2 ${
                result.goedkoopsteContract === 'dynamisch' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 bg-white'
              }`}>
                <h5 className="font-bold text-xl mb-4 flex items-center gap-2">
                  <span>⚡</span>
                  Flexibel Contract
                </h5>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-gray-900">
                    €{(result.dynamisch.totaal / 12).toFixed(0)} per maand
                  </div>
                  <div className="text-lg text-gray-600">
                    €{result.dynamisch.totaal.toFixed(0)} per jaar
                  </div>
                </div>
              </div>
            </div>

            {/* Simple Explanation */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <h6 className="font-bold text-gray-800 mb-2">💡 Waarom is dit contract voordeliger?</h6>
              <p className="text-sm text-gray-700 mb-3">
                {result.goedkoopsteContract === 'vast' 
                  ? 'Het vaste contract is goedkoper vooral door de €200 welkomstkorting en lagere basisprijzen. Met jouw verbruik profiteer je van de zekerheid van een vast tarief.'
                  : 'Het flexibele contract is voordeliger door lagere basisprijzen en hogere terugleververgoedingen. Met jouw verbruik profiteer je van de marktprijzen.'
                }
              </p>
              <p className="text-xs text-gray-500 italic">
                * Deze berekening gebruikt gemiddelde marktprijzen voor zowel vaste als dynamische contracten. Werkelijke tarieven kunnen per leverancier verschillen.
              </p>
            </div>

            {/* Reset Button */}
            <div className="text-center mt-6">
              <button
                onClick={() => {
                  setResult(null);
                  setNetbeheerderData(null);
                  setError(null);
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
              >
                Nieuwe Berekenen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}