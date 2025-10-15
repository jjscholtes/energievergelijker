'use client';

import { EnergiecontractAdvies, ContractAdviesResult } from '@/components/EnergiecontractAdvies';

interface HeroSectionProps {
  onResultChange?: (result: ContractAdviesResult | null) => void;
}

export function HeroSection({ onResultChange }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-gradient-to-r from-green-400 to-green-600 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse animation-delay-4000"></div>
        <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-1000"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gradient-to-r from-emerald-300 to-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-3000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-stretch">
          {/* Left Column - Content */}
          <div className="space-y-3 lg:space-y-4 flex flex-col justify-between">
            <div className="space-y-3 lg:space-y-4">
              
              <h2 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight">
                Bespaar op je{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-800 via-emerald-700 via-teal-600 to-green-500 animate-gradient">
                  energierekening
                </span>
              </h2>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                Heb je zonnepanelen, warmtepomp of elektrische auto? Dan verdien je een energiecontract 
                dat perfect aansluit bij jouw situatie. Onze vergelijker berekent exact hoeveel je bespaart 
                met zowel vaste als dynamische contracten.
              </p>
            </div>

            {/* Enhanced Feature Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-4 p-6 bg-white/90 backdrop-blur-md rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-green-600 rounded-full animate-pulse shadow-lg"></div>
                <span className="text-gray-700 font-semibold text-lg">Nauwkeurige zonnepanelen berekeningen</span>
              </div>
              <div className="flex items-center space-x-4 p-6 bg-white/90 backdrop-blur-md rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="w-4 h-4 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full animate-pulse shadow-lg"></div>
                <span className="text-gray-700 font-semibold text-lg">Teruglevering vergoedingen</span>
              </div>
              <div className="flex items-center space-x-4 p-6 bg-white/90 backdrop-blur-md rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="w-4 h-4 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full animate-pulse shadow-lg"></div>
                <span className="text-gray-700 font-semibold text-lg">Flexibele contracten</span>
              </div>
              <div className="flex items-center space-x-4 p-6 bg-white/90 backdrop-blur-md rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="w-4 h-4 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full animate-pulse shadow-lg"></div>
                <span className="text-gray-700 font-semibold text-lg">Persoonlijke besparing</span>
              </div>
            </div>

            {/* Enhanced Info Box - moved to bottom */}
            <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border border-emerald-200 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <p className="text-green-800 font-semibold text-xl">
                💡 <strong>Wist je dat?</strong> Het juiste energiecontract kan je honderden euro&apos;s per jaar besparen, 
                vooral als je zonnepanelen, warmtepomp of elektrische auto hebt.
              </p>
            </div>
          </div>
        
          {/* Right Column - Energiecontract Advies */}
          <div className="relative lg:sticky lg:top-24">
            <EnergiecontractAdvies onResultChange={onResultChange} />
          </div>
        </div>
      </div>
    </section>
  );
}
