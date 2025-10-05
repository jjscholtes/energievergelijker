'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContractData } from '@/types/contracts';
import { DynamicContractData } from '@/types/dynamicContracts';
import { BerekeningResult } from '@/types/calculations';
import { berekenEnergiekosten } from '@/lib/calculations/energyCalculator';
import { berekenDynamischeEnergiekosten } from '@/lib/calculations/dynamicEnergyCalculator';
import { generateRealisticCSVData } from '@/lib/data/sampleDynamicData';
import { getAlleNetbeheerders } from '@/lib/data/netbeheerders';
import { CostBreakdown } from '@/components/results/CostBreakdown';
import { DetailedComparison } from '@/components/tool/DetailedComparison';

export default function ToolPage() {
  const [contracts, setContracts] = useState<ContractData[]>([]);
  const [dynamicContracts, setDynamicContracts] = useState<DynamicContractData[]>([]);
  const [results, setResults] = useState<BerekeningResult[]>([]);
  const [dynamicResults, setDynamicResults] = useState<BerekeningResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());

  // Gebruikersprofiel voor berekeningen
  const [userProfile, setUserProfile] = useState({
    netbeheerder: 'Liander',
    jaarverbruikStroom: 2900,
    jaarverbruikStroomPiek: 1160, // 40% van 2900
    jaarverbruikStroomDal: 1740, // 60% van 2900
    jaarverbruikGas: 1200,
    geenGas: false,
    heeftZonnepanelen: false,
    pvOpwek: 0,
    percentageZelfverbruik: 35
  });

  const [currentContract, setCurrentContract] = useState<Partial<ContractData>>({
    type: 'vast',
    looptijdMaanden: 12,
    vasteLeveringskosten: 0, // Wordt overschreven bij dynamische contracten
    kortingEenmalig: 0,
    duurzaamheidsScore: 5,
    klanttevredenheid: 5,
    tarieven: {
      stroomKalePrijs: 0.085,     // Default voor dynamische contracten
      stroomKalePrijsPiek: 0.10,  // Default voor vaste contracten
      stroomKalePrijsDal: 0.10,   // Default voor vaste contracten
      gasKalePrijs: 1.20,
      terugleververgoeding: 0.01, // Default voor vaste contracten (1 cent)
      vasteTerugleverkosten: 0
    }
  });

  const handleAddContract = () => {
    if (!currentContract.leverancier) {
      alert('Vul leverancier in');
      return;
    }

    const newContract: ContractData = {
      leverancier: currentContract.leverancier,
      productNaam: currentContract.productNaam || `${(currentContract.type || 'vast').charAt(0).toUpperCase() + (currentContract.type || 'vast').slice(1)} Contract`,
      type: currentContract.type as 'vast' | 'dynamisch',
      looptijdMaanden: currentContract.looptijdMaanden || 12,
      vasteLeveringskosten: currentContract.vasteLeveringskosten || (currentContract.type === 'dynamisch' ? 5.99 : 0),
      kortingEenmalig: currentContract.kortingEenmalig || 0,
      duurzaamheidsScore: currentContract.duurzaamheidsScore || 5,
      klanttevredenheid: currentContract.klanttevredenheid || 5,
      tarieven: {
        // Alleen enkel tarief als geen piek/dal tarieven zijn ingevuld
        stroomKalePrijs: currentContract.tarieven?.stroomKalePrijs,
        // Piek/dal tarieven (prioriteit)
        stroomKalePrijsPiek: currentContract.tarieven?.stroomKalePrijsPiek,
        stroomKalePrijsDal: currentContract.tarieven?.stroomKalePrijsDal,
        gasKalePrijs: currentContract.tarieven?.gasKalePrijs || 1.20,
        terugleververgoeding: currentContract.tarieven?.terugleververgoeding || (currentContract.type === 'dynamisch' ? 0.0595 : 0.01),
        vasteTerugleverkosten: currentContract.tarieven?.vasteTerugleverkosten || 0
      }
    };

    if (currentContract.type === 'dynamisch') {
      const dynamicContract: DynamicContractData = {
        ...newContract,
        type: 'dynamisch',
        csvData2024: '',
        csvData2025: '',
        terugleververgoeding: newContract.tarieven.terugleververgoeding,
        maandelijkseVergoeding: newContract.vasteLeveringskosten,
        opslagPerKwh: 0.023,
        opslagInvoeding: 0.023,
        tarieven: newContract.tarieven
      };
      
      const updatedDynamicContracts = [...dynamicContracts, dynamicContract];
      setDynamicContracts(updatedDynamicContracts);
    } else {
      const updatedContracts = [...contracts, newContract];
      setContracts(updatedContracts);
    }

    // Reset form
    setCurrentContract({
      type: 'vast',
      looptijdMaanden: 12,
      vasteLeveringskosten: 0,
      kortingEenmalig: 0,
      duurzaamheidsScore: 5,
      klanttevredenheid: 5,
      tarieven: {
        stroomKalePrijs: 0.085,     // Default voor dynamische contracten
        stroomKalePrijsPiek: 0.10,  // Nieuwe default
        stroomKalePrijsDal: 0.10,   // Nieuwe default
        gasKalePrijs: 1.20,
        terugleververgoeding: 0.01, // Default voor vaste contracten (1 cent)
        vasteTerugleverkosten: 0
      }
    });
  };

  const handleRemoveContract = (index: number, type: 'vast' | 'dynamisch') => {
    if (type === 'dynamisch') {
      const updatedDynamicContracts = dynamicContracts.filter((_, i) => i !== index);
      setDynamicContracts(updatedDynamicContracts);
    } else {
      const updatedContracts = contracts.filter((_, i) => i !== index);
      setContracts(updatedContracts);
    }
  };

  const toggleExpandedResult = (contractKey: string) => {
    setExpandedResults(prev => {
      const newSet = new Set(prev);
      if (newSet.has(contractKey)) {
        newSet.delete(contractKey);
      } else {
        newSet.add(contractKey);
      }
      return newSet;
    });
  };

  // Helper functie voor betere input handling
  const handleNumberInput = (value: string, setter: (value: number) => void) => {
    if (value === '' || value === '0') {
      setter(0);
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        setter(numValue);
      }
    }
  };

  // State voor input values om lege velden mogelijk te maken
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [dynamicInputValues, setDynamicInputValues] = useState<Record<string, string>>({});

  // Helper functie voor input value
  const getInputValue = (key: string, defaultValue: number, isDynamic: boolean = false): string => {
    const values = isDynamic ? dynamicInputValues : inputValues;
    return values[key] !== undefined ? values[key] : defaultValue.toString();
  };

  // Effect om terugleververgoeding aan te passen bij contract type wijziging
  useEffect(() => {
    if (currentContract.type === 'dynamisch' && currentContract.tarieven?.terugleververgoeding === 0.01) {
      setCurrentContract(prev => ({
        ...prev,
        tarieven: { ...prev.tarieven!, terugleververgoeding: 0.0595 }
      }));
    } else if (currentContract.type === 'vast' && currentContract.tarieven?.terugleververgoeding === 0.0595) {
      setCurrentContract(prev => ({
        ...prev,
        tarieven: { ...prev.tarieven!, terugleververgoeding: 0.01 }
      }));
    }
  }, [currentContract.type]);

  // Helper functie voor input change
  const handleInputChange = (key: string, value: string, setter: (value: number) => void, isDynamic: boolean = false) => {
    if (isDynamic) {
      setDynamicInputValues(prev => ({ ...prev, [key]: value }));
    } else {
      setInputValues(prev => ({ ...prev, [key]: value }));
    }
    
    if (value === '' || value === '0') {
      setter(0);
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        setter(numValue);
      }
    }
  };

  // Speciale helper voor contract tarieven
  const handleContractInputChange = (key: string, value: string, setter: (value: number) => void) => {
    // Update inputValues state
    setInputValues(prev => ({ ...prev, [key]: value }));
    
    if (value === '' || value === '0') {
      setter(0);
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        setter(numValue);
      }
    }
  };

  const handleCalculate = async () => {
    if (contracts.length === 0 && dynamicContracts.length === 0) {
      setError('Voeg minimaal één energiecontract toe om te berekenen');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Voor vaste contracten
      const fixedResults: BerekeningResult[] = [];
      for (const contract of contracts) {
        const fullUserProfile = {
          postcode: '1234AB', // Dummy postcode, netbeheerder wordt direct gebruikt
          netbeheerder: userProfile.netbeheerder,
          aansluitingElektriciteit: '1x25A' as const,
          aansluitingGas: 'G4' as const,
          jaarverbruikStroom: userProfile.jaarverbruikStroom,
          jaarverbruikStroomPiek: userProfile.jaarverbruikStroomPiek,
          jaarverbruikStroomDal: userProfile.jaarverbruikStroomDal,
          jaarverbruikGas: userProfile.jaarverbruikGas,
          heeftZonnepanelen: userProfile.heeftZonnepanelen,
          pvOpwek: userProfile.pvOpwek,
          percentageZelfverbruik: userProfile.percentageZelfverbruik,
          heeftWarmtepomp: false,
          heeftElektrischeAuto: false,
          geenGas: userProfile.geenGas,
          piekDalVerdeling: {
            piek: 0.4,
            dal: 0.6
          }
        };

        const result = berekenEnergiekosten(fullUserProfile, contract);
        fixedResults.push(result);
      }

      // Voor dynamische contracten
      const dynamicResults: BerekeningResult[] = [];
      if (dynamicContracts.length > 0) {
        const csv2024 = generateRealisticCSVData(2024, 0.15);
        const csv2025 = generateRealisticCSVData(2025, 0.15);
        
        for (const contract of dynamicContracts) {
          const fullUserProfile = {
            postcode: '1234AB', // Dummy postcode, netbeheerder wordt direct gebruikt
            netbeheerder: userProfile.netbeheerder,
            aansluitingElektriciteit: '1x25A' as const,
            aansluitingGas: 'G4' as const,
            jaarverbruikStroom: userProfile.jaarverbruikStroom,
            jaarverbruikStroomPiek: userProfile.jaarverbruikStroomPiek,
            jaarverbruikStroomDal: userProfile.jaarverbruikStroomDal,
            jaarverbruikGas: userProfile.jaarverbruikGas,
            heeftZonnepanelen: userProfile.heeftZonnepanelen,
            pvOpwek: userProfile.pvOpwek,
            percentageZelfverbruik: userProfile.percentageZelfverbruik,
            heeftWarmtepomp: false,
            heeftElektrischeAuto: false,
            geenGas: userProfile.geenGas,
            piekDalVerdeling: {
              piek: 0.4,
              dal: 0.6
            }
          };

          const dynamicContract: DynamicContractData = {
            ...contract,
            csvData2024: csv2024,
            csvData2025: csv2025,
          };

          const result = await berekenDynamischeEnergiekosten(
            fullUserProfile,
            dynamicContract,
            csv2024,
            csv2025,
            '2024'
          );
          dynamicResults.push(result);
        }
      }

      const sortedFixedResults = fixedResults.sort((a, b) => a.totaleJaarkostenMetPv - b.totaleJaarkostenMetPv);
      const sortedDynamicResults = dynamicResults.sort((a, b) => a.totaleJaarkostenMetPv - b.totaleJaarkostenMetPv);

      setResults(sortedFixedResults);
      setDynamicResults(sortedDynamicResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Onbekende fout bij berekening');
    } finally {
      setIsLoading(false);
    }
  };

  const allResults = [...results, ...dynamicResults];
  const sortedResults = allResults.sort((a, b) => a.totaleJaarkostenMetPv - b.totaleJaarkostenMetPv);
  const cheapestResult = sortedResults[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">⚡</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Energiecontract Calculator</h1>
                <p className="text-gray-600 text-sm font-medium">Vergelijk je eigen energiecontracten</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                href="/"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-blue-50"
              >
                Terug naar Vergelijker
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-full text-sm font-bold mb-6 shadow-lg">
            <span>🛠️</span>
            <span>Zelf Energiecontracten Vergelijken</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Energiecontract Calculator Tool
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Voeg je eigen energiecontracten toe en vergelijk de kosten. Perfect voor het vergelijken van verschillende tarieven en voorwaarden.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Forms */}
          <div className="space-y-6">
            {/* Gebruikersprofiel */}
            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm mb-6">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 text-center">
                  📊 Jouw Energieprofiel
                </CardTitle>
                <p className="text-gray-600 text-center mt-2">
                  Vul je verbruik en apparaten in voor accurate berekeningen
                </p>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-6">
                  {/* Netbeheerder */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      🏢 Netbeheerder
                    </h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="netbeheerder" className="text-sm font-medium text-gray-700">
                        Netbeheerder *
                      </Label>
                      <Select
                        value={userProfile.netbeheerder}
                        onValueChange={(value: string) => setUserProfile(prev => ({ ...prev, netbeheerder: value }))}
                      >
                        <SelectTrigger className="h-12 border-gray-300">
                          <SelectValue placeholder="Selecteer jouw netbeheerder" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAlleNetbeheerders().map((netbeheerder) => (
                            <SelectItem key={netbeheerder.naam} value={netbeheerder.naam}>
                              {netbeheerder.naam} (Stroom: €{netbeheerder.kostenStroom}/jaar, Gas: €{netbeheerder.kostenGas}/jaar)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">
                        Kies de netbeheerder die bij jouw regio hoort. Dit heeft invloed op de netbeheerkosten.
                      </p>
                    </div>
                  </div>

                  {/* Verbruik */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      ⚡ Energieverbruik
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="jaarverbruikStroom" className="text-sm font-medium text-gray-700">
                          Totaal Jaarverbruik Stroom (kWh)
                        </Label>
                        <Input
                          id="jaarverbruikStroom"
                          type="number"
                          value={getInputValue('jaarverbruikStroom', userProfile.jaarverbruikStroom)}
                          onChange={(e) => {
                            const totaal = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                            const piek = Math.round(totaal * 0.4);
                            const dal = Math.round(totaal * 0.6);
                            handleInputChange('jaarverbruikStroom', e.target.value, () => {
                              setUserProfile(prev => ({ 
                                ...prev, 
                                jaarverbruikStroom: totaal,
                                jaarverbruikStroomPiek: piek,
                                jaarverbruikStroomDal: dal
                              }));
                            });
                          }}
                          className="h-12"
                          placeholder="Bijv. 2900"
                        />
                        <p className="text-xs text-gray-500">Automatisch verdeeld: {userProfile.jaarverbruikStroomPiek} kWh normaal, {userProfile.jaarverbruikStroomDal} kWh dal</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="jaarverbruikStroomPiek" className="text-sm font-medium text-gray-700">
                            Normaal Verbruik (kWh)
                          </Label>
                          <Input
                            id="jaarverbruikStroomPiek"
                            type="number"
                            value={getInputValue('jaarverbruikStroomPiek', userProfile.jaarverbruikStroomPiek)}
                            onChange={(e) => {
                              const normaal = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                              const dal = userProfile.jaarverbruikStroomDal;
                              handleInputChange('jaarverbruikStroomPiek', e.target.value, () => {
                                setUserProfile(prev => ({ 
                                  ...prev, 
                                  jaarverbruikStroomPiek: normaal,
                                  jaarverbruikStroom: normaal + dal
                                }));
                              });
                            }}
                            className="h-12"
                            placeholder="Bijv. 1160"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="jaarverbruikStroomDal" className="text-sm font-medium text-gray-700">
                            Dal Verbruik (kWh)
                          </Label>
                          <Input
                            id="jaarverbruikStroomDal"
                            type="number"
                            value={getInputValue('jaarverbruikStroomDal', userProfile.jaarverbruikStroomDal)}
                            onChange={(e) => {
                              const dal = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                              const piek = userProfile.jaarverbruikStroomPiek;
                              handleInputChange('jaarverbruikStroomDal', e.target.value, () => {
                                setUserProfile(prev => ({ 
                                  ...prev, 
                                  jaarverbruikStroomDal: dal,
                                  jaarverbruikStroom: piek + dal
                                }));
                              });
                            }}
                            className="h-12"
                            placeholder="Bijv. 1740"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="jaarverbruikGas" className="text-sm font-medium text-gray-700">
                            Jaarverbruik Gas (m³)
                          </Label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="geenGas"
                              checked={userProfile.geenGas}
                              onChange={(e) => setUserProfile(prev => ({ ...prev, geenGas: e.target.checked }))}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <Label htmlFor="geenGas" className="text-sm text-gray-600 font-normal">
                              Geen gas
                            </Label>
                          </div>
                        </div>
                        
                        {!userProfile.geenGas ? (
                          <Input
                            id="jaarverbruikGas"
                            type="number"
                            value={getInputValue('jaarverbruikGas', userProfile.jaarverbruikGas)}
                            onChange={(e) => handleInputChange('jaarverbruikGas', e.target.value, (value) => setUserProfile(prev => ({ ...prev, jaarverbruikGas: value })))}
                            className="h-12"
                            placeholder="Bijv. 1450"
                          />
                        ) : (
                          <div className="h-12 bg-gray-50 border border-gray-200 rounded-md flex items-center px-3 text-gray-500 text-sm">
                            Geen gas verbruik - alleen elektriciteit wordt berekend
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Zonnepanelen */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      ☀️ Zonnepanelen
                    </h3>
                    
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <input
                        type="checkbox"
                        id="heeftZonnepanelen"
                        checked={userProfile.heeftZonnepanelen}
                        onChange={(e) => setUserProfile(prev => ({ ...prev, heeftZonnepanelen: e.target.checked }))}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <Label htmlFor="heeftZonnepanelen" className="text-sm font-medium text-gray-700 cursor-pointer">
                        ☀️ Ik heb zonnepanelen
                      </Label>
                    </div>

                    {userProfile.heeftZonnepanelen && (
                      <div className="space-y-4 p-6 bg-green-50 rounded-xl border border-green-200">
                        <h4 className="font-semibold text-green-800">☀️ Zonnepanelen Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="pvOpwek" className="text-sm font-medium text-green-700">
                              Jaarproductie (kWh)
                            </Label>
                            <Input
                              id="pvOpwek"
                              type="number"
                              value={getInputValue('pvOpwek', userProfile.pvOpwek || 0)}
                              onChange={(e) => handleInputChange('pvOpwek', e.target.value, (value) => setUserProfile(prev => ({ ...prev, pvOpwek: value })))}
                              className="h-12 border-green-300"
                              placeholder="Bijv. 3500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="percentageZelfverbruik" className="text-sm font-medium text-green-700">
                              Zelfverbruik (%)
                            </Label>
                            <Input
                              id="percentageZelfverbruik"
                              type="number"
                              min="0"
                              max="100"
                              value={getInputValue('percentageZelfverbruik', userProfile.percentageZelfverbruik || 0)}
                              onChange={(e) => handleInputChange('percentageZelfverbruik', e.target.value, (value) => setUserProfile(prev => ({ ...prev, percentageZelfverbruik: value })))}
                              className="h-12 border-green-300"
                              placeholder="Bijv. 35"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 text-center">
                  Voeg Energiecontract Toe
                </CardTitle>
                <p className="text-gray-600 text-center mt-2">
                  Vul de gegevens van je energiecontract in
                </p>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-6">
                  {/* Basis Contract Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      📋 Contract Informatie
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="leverancier" className="text-sm font-medium text-gray-700">
                          Leverancier *
                        </Label>
                        <Input
                          id="leverancier"
                          placeholder="Bijv. Essent, Vattenfall"
                          value={currentContract.leverancier || ''}
                          onChange={(e) => setCurrentContract(prev => ({ ...prev, leverancier: e.target.value }))}
                          className="h-12"
                        />
                      </div>


                      <div className="space-y-2">
                        <Label htmlFor="type" className="text-sm font-medium text-gray-700">
                          Contract Type
                        </Label>
                        <Select
                          value={currentContract.type}
                          onValueChange={(value: 'vast' | 'dynamisch') => 
                            setCurrentContract(prev => ({ ...prev, type: value }))
                          }
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Selecteer type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="vast">Vast Contract</SelectItem>
                            <SelectItem value="dynamisch">Dynamisch Contract</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="looptijd" className="text-sm font-medium text-gray-700">
                          Looptijd (maanden)
                        </Label>
                        <Input
                          id="looptijd"
                          type="number"
                          value={getInputValue('looptijd', currentContract.looptijdMaanden || 12)}
                          onChange={(e) => handleInputChange('looptijd', e.target.value, (value) => setCurrentContract(prev => ({ ...prev, looptijdMaanden: value })))}
                          className="h-12"
                          placeholder="Bijv. 12"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tarieven */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      💰 Tarieven
                    </h3>
                    
                    {currentContract.type === 'dynamisch' ? (
                      // Dynamische contracten - alleen relevante velden
                      <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-semibold text-blue-800 mb-2">⚡ Dynamisch Contract</h4>
                          <p className="text-sm text-blue-700">
                            Dynamische contracten gebruiken spotmarktprijzen als basis. Je kunt de basisprijs en terugleververgoeding aanpassen en opslagen toevoegen.
                          </p>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="basisprijs" className="text-sm font-medium text-gray-700">
                                Basisprijs per kWh (€/kWh)
                              </Label>
                              <Input
                                id="basisprijs"
                                type="number"
                                step="0.001"
                                value={getInputValue('basisprijs', currentContract.tarieven?.stroomKalePrijs || 0.085)}
                                onChange={(e) => handleContractInputChange('basisprijs', e.target.value, (value) => setCurrentContract(prev => ({
                                  ...prev,
                                  tarieven: { ...prev.tarieven!, stroomKalePrijs: value }
                                })))}
                                className="h-12"
                                placeholder="Bijv. 0.085"
                              />
                              <p className="text-xs text-gray-500">Gemiddelde spotmarktprijs</p>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="terugleververgoeding" className="text-sm font-medium text-gray-700">
                                Terugleververgoeding (€/kWh)
                              </Label>
                              <Input
                                id="terugleververgoeding"
                                type="number"
                                step="0.001"
                                value={getInputValue('terugleververgoeding', currentContract.tarieven?.terugleververgoeding || 0.0595, true)}
                                onChange={(e) => handleInputChange('terugleververgoeding', e.target.value, (value) => setCurrentContract(prev => ({
                                  ...prev,
                                  tarieven: { ...prev.tarieven!, terugleververgoeding: value }
                                })), true)}
                                className="h-12"
                                placeholder="Bijv. 0.0595"
                              />
                              <p className="text-xs text-gray-500">Gemiddelde terugleververgoeding</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="maandelijkseVergoeding" className="text-sm font-medium text-gray-700">
                              Maandelijkse Vergoeding (€/maand)
                            </Label>
                            <Input
                              id="maandelijkseVergoeding"
                              type="number"
                              step="0.01"
                              value={getInputValue('maandelijkseVergoeding', currentContract.vasteLeveringskosten || 5.99, true)}
                              onChange={(e) => handleInputChange('maandelijkseVergoeding', e.target.value, (value) => setCurrentContract(prev => ({ ...prev, vasteLeveringskosten: value })), true)}
                              className="h-12"
                              placeholder="Bijv. 5.99"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="opslagAfname" className="text-sm font-medium text-gray-700">
                              Opslag Afname (€/kWh)
                            </Label>
                            <Input
                              id="opslagAfname"
                              type="number"
                              step="0.001"
                              value={getInputValue('opslagAfname', currentContract.opslagPerKwh || (currentContract.type === 'dynamisch' ? 0.023 : 0.10))}
                              onChange={(e) => handleContractInputChange('opslagAfname', e.target.value, (value) => setCurrentContract(prev => ({
                                ...prev,
                                opslagPerKwh: value
                              })))}
                              className="h-12"
                              placeholder={currentContract.type === 'dynamisch' ? "Bijv. 0.023" : "Bijv. 0.100"}
                            />
                            <p className="text-xs text-gray-500">Opslag op afname van het net</p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="opslagInvoeding" className="text-sm font-medium text-gray-700">
                              Opslag Invoeding (€/kWh)
                            </Label>
                            <Input
                              id="opslagInvoeding"
                              type="number"
                              step="0.001"
                              value={getInputValue('opslagInvoeding', currentContract.opslagInvoeding || (currentContract.type === 'dynamisch' ? 0.023 : 0.10))}
                              onChange={(e) => handleContractInputChange('opslagInvoeding', e.target.value, (value) => setCurrentContract(prev => ({
                                ...prev,
                                opslagInvoeding: value
                              })))}
                              className="h-12"
                              placeholder={currentContract.type === 'dynamisch' ? "Bijv. 0.023" : "Bijv. 0.100"}
                            />
                            <p className="text-xs text-gray-500">Opslag op invoeding (meestal €0.00)</p>
                          </div>

                        </div>
                      </div>
                    </div>
                  ) : (
                    // Vaste contracten - alle tarieven
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-semibold text-green-800 mb-2">⚡ Vaste Contract Tarieven</h4>
                        <p className="text-sm text-green-700">
                          Vul de tarieven in voor normaal en dal verbruik. Meestal is dal goedkoper dan normaal.
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="stroomKalePrijsPiek" className="text-sm font-medium text-gray-700">
                            Stroom Normaal Tarief (€/kWh)
                          </Label>
                          <Input
                            id="stroomKalePrijsPiek"
                            type="number"
                            step="0.001"
                            value={getInputValue('stroomKalePrijsPiek', currentContract.tarieven?.stroomKalePrijsPiek || 0.10)}
                            onChange={(e) => handleContractInputChange('stroomKalePrijsPiek', e.target.value, (value) => setCurrentContract(prev => ({
                              ...prev,
                              tarieven: { ...prev.tarieven!, stroomKalePrijsPiek: value }
                            })))}
                            className="h-12"
                            placeholder="Bijv. 0.100"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="stroomKalePrijsDal" className="text-sm font-medium text-gray-700">
                            Stroom Dal Tarief (€/kWh)
                          </Label>
                          <Input
                            id="stroomKalePrijsDal"
                            type="number"
                            step="0.001"
                            value={getInputValue('stroomKalePrijsDal', currentContract.tarieven?.stroomKalePrijsDal || 0.10)}
                            onChange={(e) => handleContractInputChange('stroomKalePrijsDal', e.target.value, (value) => setCurrentContract(prev => ({
                              ...prev,
                              tarieven: { ...prev.tarieven!, stroomKalePrijsDal: value }
                            })))}
                            className="h-12"
                            placeholder="Bijv. 0.100"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="gasKalePrijs" className="text-sm font-medium text-gray-700">
                            Gas Kale Prijs (€/m³)
                          </Label>
                          <Input
                            id="gasKalePrijs"
                            type="number"
                            step="0.001"
                            value={getInputValue('gasKalePrijs', currentContract.tarieven?.gasKalePrijs || 1.20)}
                            onChange={(e) => handleInputChange('gasKalePrijs', e.target.value, (value) => setCurrentContract(prev => ({
                              ...prev,
                              tarieven: { ...prev.tarieven!, gasKalePrijs: value }
                            })))}
                            className="h-12"
                            placeholder="Bijv. 1.200"
                          />
                        </div>
                      </div>

                      {userProfile.heeftZonnepanelen && (
                        <div className="space-y-2">
                          <Label htmlFor="vasteTerugleverkosten" className="text-sm font-medium text-gray-700">
                            Vaste Terugleverkosten (€/jaar)
                          </Label>
                          <Input
                            id="vasteTerugleverkosten"
                            type="number"
                            value={getInputValue('vasteTerugleverkosten', currentContract.tarieven?.vasteTerugleverkosten || 0)}
                            onChange={(e) => handleInputChange('vasteTerugleverkosten', e.target.value, (value) => setCurrentContract(prev => ({
                              ...prev,
                              tarieven: { ...prev.tarieven!, vasteTerugleverkosten: value }
                            })))}
                            className="h-12"
                            placeholder="Bijv. 0"
                          />
                        </div>
                      )}
                      
                      {userProfile.heeftZonnepanelen && (
                        <div className="space-y-2">
                          <Label htmlFor="terugleververgoeding" className="text-sm font-medium text-gray-700">
                            Terugleververgoeding (€/kWh)
                          </Label>
                          <Input
                            id="terugleververgoeding"
                            type="number"
                            step="0.001"
                            value={getInputValue('terugleververgoeding', currentContract.tarieven?.terugleververgoeding || 0.01, false)}
                            onChange={(e) => handleInputChange('terugleververgoeding', e.target.value, (value) => setCurrentContract(prev => ({
                              ...prev,
                              tarieven: { ...prev.tarieven!, terugleververgoeding: value }
                            })), false)}
                            className="h-12"
                            placeholder="Bijv. 0.010"
                          />
                          <p className="text-xs text-gray-500">Terugleververgoeding voor vaste contracten</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                  {/* Kosten - alleen voor vaste contracten */}
                  {currentContract.type !== 'dynamisch' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                        💸 Kosten
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="vasteLeveringskosten" className="text-sm font-medium text-gray-700">
                            Vaste Leveringskosten (€/maand)
                          </Label>
                          <Input
                            id="vasteLeveringskosten"
                            type="number"
                            step="0.01"
                            value={getInputValue('vasteLeveringskosten', currentContract.vasteLeveringskosten || 0)}
                            onChange={(e) => handleInputChange('vasteLeveringskosten', e.target.value, (value) => setCurrentContract(prev => ({ ...prev, vasteLeveringskosten: value })))}
                            className="h-12"
                            placeholder="Bijv. 0.00"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="kortingEenmalig" className="text-sm font-medium text-gray-700">
                            Eenmalige Korting (€)
                          </Label>
                          <Input
                            id="kortingEenmalig"
                            type="number"
                            value={getInputValue('kortingEenmalig', currentContract.kortingEenmalig || 0)}
                            onChange={(e) => handleInputChange('kortingEenmalig', e.target.value, (value) => setCurrentContract(prev => ({ ...prev, kortingEenmalig: value })))}
                            className="h-12"
                            placeholder="Bijv. 0"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Eenmalige korting voor dynamische contracten */}
                  {currentContract.type === 'dynamisch' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                        💸 Kosten
                      </h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="kortingEenmalig" className="text-sm font-medium text-gray-700">
                          Eenmalige Korting (€)
                        </Label>
                        <Input
                          id="kortingEenmalig"
                          type="number"
                          value={getInputValue('kortingEenmalig', currentContract.kortingEenmalig || 0, true)}
                          onChange={(e) => handleInputChange('kortingEenmalig', e.target.value, (value) => setCurrentContract(prev => ({ ...prev, kortingEenmalig: value })), true)}
                          className="h-12"
                          placeholder="Bijv. 0"
                        />
                      </div>
                    </div>
                  )}

                  {/* Informatie over automatische kosten */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">ℹ️ Automatisch Meegenomen Kosten</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>• <strong>Netbeheerkosten:</strong> Automatisch berekend per netbeheerder (vaste kosten per jaar)</div>
                      <div>• <strong>Energiebelasting:</strong> Officiële tarieven €0.1316/kWh (inclusief 21% BTW)</div>
                      <div>• <strong>Vermindering Energiebelasting:</strong> €631.35 per jaar vermindering op energiebelasting</div>
                      {userProfile.geenGas && <div>• <strong>Gas:</strong> Uitgesloten van berekening</div>}
                    </div>
                  </div>

                  {/* Add Button */}
                  <Button
                    onClick={handleAddContract}
                    className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
                  >
                    <div className="flex items-center gap-3">
                      <span>➕</span>
                      <span>Contract Toevoegen</span>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Right Column - Results & Contract Lists */}
          <div className="space-y-6 lg:sticky lg:top-24 lg:max-h-screen lg:overflow-y-auto">
            {/* Contract Lists */}
            <div className="space-y-4">
              {/* Vaste Contracten */}
              {contracts.length > 0 && (
                <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-gray-900 text-center">
                      🔒 Vaste Contracten ({contracts.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {contracts.map((contract, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{contract.leverancier}</h4>
                              <p className="text-sm text-gray-600">{contract.productNaam || 'Vast Contract'}</p>
                              <div className="text-xs text-gray-500 mt-1">
                                <div>Stroom: €{(contract.tarieven.stroomKalePrijsPiek || 0.10).toFixed(3)}/kWh normaal, €{(contract.tarieven.stroomKalePrijsDal || 0.10).toFixed(3)}/kWh dal</div>
                                <div>Gas: €{contract.tarieven.gasKalePrijs.toFixed(3)}/m³</div>
                                <div>Teruglevering: €{contract.tarieven.terugleververgoeding.toFixed(3)}/kWh</div>
                              </div>
                            </div>
                            <Button
                              onClick={() => handleRemoveContract(index, 'vast')}
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              Verwijder
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Dynamische Contracten */}
              {dynamicContracts.length > 0 && (
                <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-gray-900 text-center">
                      ⚡ Dynamische Contracten ({dynamicContracts.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dynamicContracts.map((contract, index) => (
                        <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{contract.leverancier}</h4>
                              <p className="text-sm text-gray-600">{contract.productNaam || 'Dynamisch Contract'}</p>
                              <div className="text-xs text-gray-500 mt-1">
                                <div>Basisprijs: €{(contract.tarieven.stroomKalePrijs || 0.15).toFixed(3)}/kWh</div>
                                <div>Opslag afname: €{(contract.opslagPerKwh || 0.023).toFixed(3)}/kWh</div>
                                <div>Opslag invoeding: €{(contract.opslagInvoeding || 0.023).toFixed(3)}/kWh</div>
                                <div>Maandelijks: €{(contract.maandelijkseVergoeding || 5.99).toFixed(2)}/maand</div>
                              </div>
                            </div>
                            <Button
                              onClick={() => handleRemoveContract(index, 'dynamisch')}
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              Verwijder
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 text-center">
                  Berekeningsresultaten
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button
                    onClick={handleCalculate}
                    disabled={isLoading || (contracts.length === 0 && dynamicContracts.length === 0)}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Berekenen...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span>🚀</span>
                        <span>Bereken Contracten</span>
                      </div>
                    )}
                  </Button>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800">{error}</p>
                    </div>
                  )}

                  {sortedResults.length > 0 && (
                    <div className="space-y-6">
                      {/* Winner Banner */}
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-6 text-center">
                        <div className="flex items-center justify-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-2xl font-bold">🏆</span>
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-green-800">
                              Goedkoopste Contract: {cheapestResult.contract.leverancier}
                            </h3>
                            <p className="text-lg text-green-700">
                              {cheapestResult.contract.productNaam || `${cheapestResult.contract.type.charAt(0).toUpperCase() + cheapestResult.contract.type.slice(1)} Contract`}
                            </p>
                          </div>
                          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-2xl font-bold">💰</span>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 mb-4">
                          <div className="text-4xl font-bold text-green-600 mb-2">
                            €{cheapestResult.totaleJaarkostenMetPv.toFixed(0)}
                          </div>
                          <div className="text-lg text-green-700">
                            per jaar (€{cheapestResult.maandlastenGemiddeld.toFixed(0)}/maand)
                          </div>
                        </div>
                      </div>

                      {/* All Results */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold text-gray-900">Alle Contracten</h3>
                        
                        <div className="space-y-3">
                          {sortedResults.map((result, index) => {
                            const isCheapest = index === 0;
                            const isDynamic = result.contract.type === 'dynamisch';
                            
                            return (
                              <div key={`${result.contract.leverancier}-${index}`}>
                                <Card className={`shadow-lg ${isCheapest ? 'border-2 border-green-500 bg-green-50' : 'border border-gray-200'}`}>
                                  <CardContent className="p-4">
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                          <h4 className="font-semibold text-gray-900">{result.contract.leverancier}</h4>
                                          <span className={`px-2 py-1 text-xs rounded ${isDynamic ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                            {isDynamic ? 'Dynamisch' : 'Vast'}
                                          </span>
                                          {isCheapest && (
                                            <span className="px-2 py-1 bg-green-500 text-white text-xs rounded font-bold">
                                              GOEDKOOPST
                                            </span>
                                          )}
                                        </div>
                                        
                                        <p className="text-sm text-gray-600 mb-3">{result.contract.productNaam || `${result.contract.type.charAt(0).toUpperCase() + result.contract.type.slice(1)} Contract`}</p>
                                        
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                          <div>
                                            <div className="font-semibold text-gray-800">Jaarlijkse kosten:</div>
                                            <div className={`text-lg font-bold ${isCheapest ? 'text-green-600' : 'text-gray-900'}`}>
                                              €{result.totaleJaarkostenMetPv.toFixed(0)}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                              €{result.maandlastenGemiddeld.toFixed(0)}/maand
                                            </div>
                                          </div>
                                          
                                          <div>
                                            <div className="font-semibold text-gray-800">Kostenopbouw:</div>
                                            <div className="text-xs text-gray-500 space-y-1">
                                              <div>Stroom: €{result.stroomKosten.totaal.toFixed(0)}</div>
                                              <div>Gas: €{result.gasKosten.totaal.toFixed(0)}</div>
                                              {result.stroomKosten.vasteLeveringskosten && result.stroomKosten.vasteLeveringskosten > 0 && (
                                                <div>Vaste kosten: €{result.stroomKosten.vasteLeveringskosten.toFixed(0)}</div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="text-right">
                                        <div className="text-2xl font-bold text-gray-900 mb-1">
                                          #{index + 1}
                                        </div>
                                        {index > 0 && (
                                          <div className="text-sm text-red-600">
                                            +€{(result.totaleJaarkostenMetPv - cheapestResult.totaleJaarkostenMetPv).toFixed(0)}/jaar
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {/* Toggle Details Button */}
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => toggleExpandedResult(`${result.contract.leverancier}-${index}`)}
                                        className="w-full"
                                      >
                                        {expandedResults.has(`${result.contract.leverancier}-${index}`) ? 'Verberg Details' : 'Bekijk Details'}
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                                
                                {/* Detailed Cost Breakdown */}
                                {expandedResults.has(`${result.contract.leverancier}-${index}`) && (
                                  <div className="mt-4">
                                    <CostBreakdown result={result} />
                                  </div>
                                )}
                              </div>
                            );
                        })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Empty State */}
                  {contracts.length === 0 && dynamicContracts.length === 0 && (
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">📋</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Nog geen contracten toegevoegd</h3>
                      <p className="text-gray-600">
                        Voeg je eerste energiecontract toe om te beginnen met vergelijken
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Detailed Comparison */}
            {(results.length > 0 || dynamicResults.length > 0) && (
              <DetailedComparison results={results} dynamicResults={dynamicResults} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
