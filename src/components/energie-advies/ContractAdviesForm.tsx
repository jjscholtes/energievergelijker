'use client';

import { useState } from 'react';
import { Calculator, MapPin, Zap, Sun, Flame, ChevronDown } from 'lucide-react';

interface ContractAdviesFormProps {
  netbeheerder: string;
  setNetbeheerder: (value: string) => void;
  dalVerbruik: string;
  setDalVerbruik: (value: string) => void;
  normaalVerbruik: string;
  setNormaalVerbruik: (value: string) => void;
  gasVerbruik: string;
  setGasVerbruik: (value: string) => void;
  geenGas: boolean;
  setGeenGas: (value: boolean) => void;
  pvTeruglevering: string;
  setPvTeruglevering: (value: string) => void;
  isLoading: boolean;
  onCalculate: () => void;
  error: string | null;
}

export function ContractAdviesForm({
  netbeheerder,
  setNetbeheerder,
  dalVerbruik,
  setDalVerbruik,
  normaalVerbruik,
  setNormaalVerbruik,
  gasVerbruik,
  setGasVerbruik,
  geenGas,
  setGeenGas,
  pvTeruglevering,
  setPvTeruglevering,
  isLoading,
  onCalculate,
  error
}: ContractAdviesFormProps) {
  // Netbeheerder data
  const netbeheerders = [
    { naam: 'Liander', stroomKosten: 471, gasKosten: 248 },
    { naam: 'Stedin', stroomKosten: 490, gasKosten: 254 },
    { naam: 'Enexis', stroomKosten: 492, gasKosten: 267 }
  ];

  return (
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
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
            className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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

      {/* Calculate Button */}
      <button
        onClick={onCalculate}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isLoading ? 'Berekenen...' : 'Bereken Advies'}
      </button>
    </div>
  );
}
