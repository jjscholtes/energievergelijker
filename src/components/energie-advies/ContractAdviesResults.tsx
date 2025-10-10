'use client';

interface ContractAdviesResult {
  vast: {
    totaal: number;
    stroomKosten: any;
    gasKosten: any;
    pvOpbrengsten: any;
    korting: number;
  };
  dynamisch: {
    totaal: number;
    stroomKosten: any;
    gasKosten: any;
    pvOpbrengsten: any;
    opslagPerKwh: number;
  };
  besparing: number;
  goedkoopsteContract: 'vast' | 'dynamisch';
  netbeheerder: string;
  userProfile: {
    jaarverbruikStroom: number;
    jaarverbruikGas: number;
    pvOpwek: number;
    percentageZelfverbruik: number;
    geenGas: boolean;
  };
}

interface ContractAdviesResultsProps {
  result: ContractAdviesResult;
}

export function ContractAdviesResults({ result }: ContractAdviesResultsProps) {
  return (
    <div className="mt-8 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200">
      {/* Simple Results Header */}
      <div className="text-center mb-6">
        <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full text-sm font-bold mb-4 shadow-lg ${
          result.goedkoopsteContract === 'vast' 
            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
            : 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white'
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
            ? 'border-teal-500 bg-teal-50' 
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
    </div>
  );
}
