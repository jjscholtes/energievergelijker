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
  onReset: () => void;
}

export function ContractAdviesResults({ result, onReset }: ContractAdviesResultsProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Simple Results Header */}
      <div className="text-center mb-6">
        <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-full text-sm font-bold mb-4 shadow-lg ${
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
        <h4 className="text-xl font-bold text-gray-900 mb-2">
          Je bespaart €{result.besparing.toFixed(0)} per jaar!
        </h4>
      </div>

      {/* Simple Cost Comparison */}
      <div className="grid grid-cols-1 gap-4 mb-6 flex-1">
        {/* Vast Contract */}
        <div className={`p-4 rounded-xl border-2 ${
          result.goedkoopsteContract === 'vast' 
            ? 'border-green-500 bg-green-50' 
            : 'border-gray-200 bg-white'
        }`}>
          <h5 className="font-bold text-lg mb-3 flex items-center gap-2">
            <span>🏠</span>
            Vast Contract
          </h5>
          <div className="space-y-1">
            <div className="text-xl font-bold text-gray-900">
              €{(result.vast.totaal / 12).toFixed(0)} per maand
            </div>
            <div className="text-sm text-gray-600">
              €{result.vast.totaal.toFixed(0)} per jaar
            </div>
          </div>
        </div>

        {/* Dynamisch Contract */}
        <div className={`p-4 rounded-xl border-2 ${
          result.goedkoopsteContract === 'dynamisch' 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-200 bg-white'
        }`}>
          <h5 className="font-bold text-lg mb-3 flex items-center gap-2">
            <span>⚡</span>
            Flexibel Contract
          </h5>
          <div className="space-y-1">
            <div className="text-xl font-bold text-gray-900">
              €{(result.dynamisch.totaal / 12).toFixed(0)} per maand
            </div>
            <div className="text-sm text-gray-600">
              €{result.dynamisch.totaal.toFixed(0)} per jaar
            </div>
          </div>
        </div>
      </div>

      {/* Simple Explanation */}
      <div className="bg-white rounded-xl p-3 border border-gray-200 mb-4">
        <h6 className="font-bold text-gray-800 mb-2 text-sm">💡 Waarom is dit contract voordeliger?</h6>
        <p className="text-xs text-gray-700 mb-2">
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
      <div className="text-center">
        <button
          onClick={onReset}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 text-sm"
        >
          Nieuwe Berekenen
        </button>
      </div>
    </div>
  );
}
