'use client';

import { useState } from 'react';
import { Calculator, MapPin, Zap, Sun, Car, Flame } from 'lucide-react';

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
  const [pvTeruglevering, setPvTeruglevering] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [netbeheerderData, setNetbeheerderData] = useState<NetbeheerderData | null>(null);

  // Prefilled contract data
  const vastContract = {
    stroomPrijs: 0.10, // €0.10/kWh excl. belasting
    terugleverVergoeding: 0.01, // €0.01/kWh
    vasteKosten: 10, // €10/maand per product
    gasPrijs: 0.63, // €0.63/m³ excl. belasting
    terugleverkosten: 389, // €389/jaar
    eenmaligeKorting: 200 // €200 korting
  };

  const dynamischContract = {
    stroomPrijs: 0.085, // €0.085/kWh excl. belasting
    terugleverVergoeding: 0.0595, // €0.0595/kWh (gemiddelde spotprijs)
    vasteKosten: 7, // €7/maand
    opslag: 0.025, // €0.025/kWh opslag
    gasPrijs: 0.63, // €0.63/m³ excl. belasting
    eenmaligeKorting: 0 // Geen korting
  };

  const fetchNetbeheerder = async (postcode: string) => {
    try {
      const response = await fetch(`https://opendata.polygonentool.nl/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=netbeheerders&cql_filter=postcode='${postcode}'`);
      const data = await response.text();
      
      // Parse XML response (simplified)
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data, 'text/xml');
      const netbeheerderElement = xmlDoc.querySelector('netbeheerder');
      
      if (netbeheerderElement) {
        const netbeheerder = netbeheerderElement.textContent || '';
        
        // Map netbeheerder to known data (using existing netbeheerder data)
        const netbeheerderMap: { [key: string]: NetbeheerderData } = {
          'Enexis': { netbeheerder: 'Enexis', stroomVastrecht: 0.1024, gasVastrecht: 0.1024, stroomVariabel: 0.1024, gasVariabel: 0.1024 },
          'Liander': { netbeheerder: 'Liander', stroomVastrecht: 0.1024, gasVastrecht: 0.1024, stroomVariabel: 0.1024, gasVariabel: 0.1024 },
          'Stedin': { netbeheerder: 'Stedin', stroomVastrecht: 0.1024, gasVastrecht: 0.1024, stroomVariabel: 0.1024, gasVariabel: 0.1024 },
          'Westland Infra': { netbeheerder: 'Westland Infra', stroomVastrecht: 0.1024, gasVastrecht: 0.1024, stroomVariabel: 0.1024, gasVariabel: 0.1024 }
        };
        
        return netbeheerderMap[netbeheerder] || netbeheerderMap['Enexis'];
      }
    } catch (error) {
      console.error('Error fetching netbeheerder:', error);
    }
    
    // Fallback to Enexis
    return { netbeheerder: 'Enexis', stroomVastrecht: 0.1024, gasVastrecht: 0.1024, stroomVariabel: 0.1024, gasVariabel: 0.1024 };
  };

  const calculateCosts = async () => {
    if (!postcode || !dalVerbruik || !normaalVerbruik || !gasVerbruik || !pvTeruglevering) {
      alert('Vul alle velden in');
      return;
    }

    setIsLoading(true);

    try {
      // Fetch netbeheerder data
      const netbeheerder = await fetchNetbeheerder(postcode);
      setNetbeheerderData(netbeheerder);

      // Parse inputs
      const dal = parseFloat(dalVerbruik);
      const normaal = parseFloat(normaalVerbruik);
      const gas = parseFloat(gasVerbruik);
      const pv = parseFloat(pvTeruglevering);

      const totaalStroomVerbruik = dal + normaal;
      const energiebelasting = 0.1316; // €0.1316/kWh incl. BTW
      const gasBelasting = 0.45; // €0.45/m³ incl. BTW
      const btw = 0.21;

      // Calculate netbeheerder costs
      const netbeheerderStroomKosten = (totaalStroomVerbruik * netbeheerder.stroomVariabel) + netbeheerder.stroomVastrecht;
      const netbeheerderGasKosten = (gas * netbeheerder.gasVariabel) + netbeheerder.gasVastrecht;

      // Calculate vast contract costs
      const vastStroomKosten = totaalStroomVerbruik * vastContract.stroomPrijs;
      const vastStroomBelasting = totaalStroomVerbruik * energiebelasting;
      const vastGasKosten = gas * vastContract.gasPrijs;
      const vastGasBelasting = gas * gasBelasting;
      const vastVasteKosten = vastContract.vasteKosten * 12; // Per jaar
      const vastTeruglevering = Math.min(pv, totaalStroomVerbruik) * vastContract.terugleverVergoeding;
      const vastTerugleverkosten = vastContract.terugleverkosten;
      const vastTotaal = vastStroomKosten + vastStroomBelasting + vastGasKosten + vastGasBelasting + vastVasteKosten + netbeheerderStroomKosten + netbeheerderGasKosten - vastTeruglevering + vastTerugleverkosten - vastContract.eenmaligeKorting;

      // Calculate dynamisch contract costs
      const dynamischStroomKosten = totaalStroomVerbruik * (dynamischContract.stroomPrijs + dynamischContract.opslag);
      const dynamischStroomBelasting = totaalStroomVerbruik * energiebelasting;
      const dynamischGasKosten = gas * dynamischContract.gasPrijs;
      const dynamischGasBelasting = gas * gasBelasting;
      const dynamischVasteKosten = dynamischContract.vasteKosten * 12; // Per jaar
      const dynamischTeruglevering = Math.min(pv, totaalStroomVerbruik) * dynamischContract.terugleverVergoeding;
      const dynamischTotaal = dynamischStroomKosten + dynamischStroomBelasting + dynamischGasKosten + dynamischGasBelasting + dynamischVasteKosten + netbeheerderStroomKosten + netbeheerderGasKosten - dynamischTeruglevering;

      const besparing = Math.abs(vastTotaal - dynamischTotaal);
      const goedkoopsteContract = vastTotaal < dynamischTotaal ? 'vast' : 'dynamisch';

      setResult({
        vast: {
          totaal: vastTotaal,
          stroomKosten: vastStroomKosten,
          stroomBelasting: vastStroomBelasting,
          gasKosten: vastGasKosten,
          gasBelasting: vastGasBelasting,
          vasteKosten: vastVasteKosten,
          netbeheerderKosten: netbeheerderStroomKosten + netbeheerderGasKosten,
          teruglevering: vastTeruglevering,
          terugleverkosten: vastTerugleverkosten,
          korting: vastContract.eenmaligeKorting
        },
        dynamisch: {
          totaal: dynamischTotaal,
          stroomKosten: dynamischStroomKosten,
          stroomBelasting: dynamischStroomBelasting,
          gasKosten: dynamischGasKosten,
          gasBelasting: dynamischGasBelasting,
          vasteKosten: dynamischVasteKosten,
          netbeheerderKosten: netbeheerderStroomKosten + netbeheerderGasKosten,
          teruglevering: dynamischTeruglevering,
          opslag: dynamischContract.opslag
        },
        besparing,
        goedkoopsteContract,
        netbeheerder: netbeheerder.netbeheerder
      });

    } catch (error) {
      console.error('Calculation error:', error);
      alert('Er is een fout opgetreden bij de berekening');
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
          {/* Postcode */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              Postcode
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
                Dal verbruik (kWh/jaar)
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
                Normaal verbruik (kWh/jaar)
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

          {/* Gasverbruik */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Flame className="w-4 h-4 inline mr-2" />
              Gasverbruik (m³/jaar)
            </label>
            <input
              type="number"
              value={gasVerbruik}
              onChange={(e) => setGasVerbruik(e.target.value)}
              placeholder="1200"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* PV Teruglevering */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Sun className="w-4 h-4 inline mr-2" />
              Zonnepanelen teruglevering (kWh/jaar)
            </label>
            <input
              type="number"
              value={pvTeruglevering}
              onChange={(e) => setPvTeruglevering(e.target.value)}
              placeholder="2500"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

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

          {/* Cost Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vast Contract */}
            <div className={`p-4 rounded-xl border-2 ${
              result.goedkoopsteContract === 'vast' 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200 bg-gray-50'
            }`}>
              <h5 className="font-bold text-lg mb-3">Vast Contract</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Jaarlijkse kosten:</span>
                  <span className="font-semibold">€{result.vast.totaal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Teruglevering:</span>
                  <span>€{result.vast.teruglevering.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Korting:</span>
                  <span>€{result.vast.korting}</span>
                </div>
              </div>
            </div>

            {/* Dynamisch Contract */}
            <div className={`p-4 rounded-xl border-2 ${
              result.goedkoopsteContract === 'dynamisch' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 bg-gray-50'
            }`}>
              <h5 className="font-bold text-lg mb-3">Flexibel Contract</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Jaarlijkse kosten:</span>
                  <span className="font-semibold">€{result.dynamisch.totaal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Teruglevering:</span>
                  <span>€{result.dynamisch.teruglevering.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Opslag:</span>
                  <span>€{((result.dynamisch.stroomKosten / (parseFloat(dalVerbruik) + parseFloat(normaalVerbruik))) * result.dynamisch.opslag).toFixed(0)}</span>
                </div>
              </div>
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
