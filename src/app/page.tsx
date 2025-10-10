'use client';

import { UserInputForm } from '@/components/forms/UserInputForm';
import { ResultsSection } from '@/components/results/ResultsSection';
import ArticlesSection from '@/components/articles/ArticlesSection';
import { FAQ } from '@/components/FAQ';
import { DynamicPricingHero } from '@/components/DynamicPricingHero';
import { EnergiecontractAdvies } from '@/components/EnergiecontractAdvies';

export default function Home() {
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
                <h1 className="text-2xl font-bold text-gray-900">Beste Energiecontract</h1>
                <p className="text-gray-600 text-sm font-medium">De specialist voor energiecontracten met zonnepanelen</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a 
                href="/tool"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-blue-50"
              >
                Zelf Vergelijken
              </a>
              <a 
                href="/dynamische-prijzen"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-blue-50"
              >
                Dynamische Prijzen
              </a>
              <button 
                onClick={() => {
                  const articlesSection = document.getElementById('articles-section');
                  if (articlesSection) {
                    articlesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-blue-50"
              >
                Artikelen
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
          {/* Enhanced Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse"></div>
            <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse animation-delay-2000"></div>
            <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-gradient-to-r from-pink-400 to-pink-600 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse animation-delay-4000"></div>
            <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-1000"></div>
            <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-3000"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left Column - Content */}
              <div className="space-y-6 lg:space-y-8">
                <div className="space-y-4 lg:space-y-6">
                  
                  <h2 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight">
                    Bespaar op je{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-4 p-6 bg-white/90 backdrop-blur-md rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-green-600 rounded-full animate-pulse shadow-lg"></div>
                    <span className="text-gray-700 font-semibold text-lg">Nauwkeurige zonnepanelen berekeningen</span>
                  </div>
                  <div className="flex items-center space-x-4 p-6 bg-white/90 backdrop-blur-md rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-pulse shadow-lg"></div>
                    <span className="text-gray-700 font-semibold text-lg">Teruglevering vergoedingen</span>
                  </div>
                  <div className="flex items-center space-x-4 p-6 bg-white/90 backdrop-blur-md rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <div className="w-4 h-4 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full animate-pulse shadow-lg"></div>
                    <span className="text-gray-700 font-semibold text-lg">Flexibele contracten</span>
                  </div>
                  <div className="flex items-center space-x-4 p-6 bg-white/90 backdrop-blur-md rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <div className="w-4 h-4 bg-gradient-to-r from-pink-400 to-pink-600 rounded-full animate-pulse shadow-lg"></div>
                    <span className="text-gray-700 font-semibold text-lg">Persoonlijke besparing</span>
                  </div>
                </div>

                {/* Enhanced Info Box */}
                <div className="bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 border border-green-200 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  <p className="text-green-800 font-semibold text-xl">
                    💡 <strong>Wist je dat?</strong> Het juiste energiecontract kan je honderden euro's per jaar besparen, 
                    vooral als je zonnepanelen, warmtepomp of elektrische auto hebt.
                  </p>
                </div>
              </div>
            
              {/* Right Column - Energiecontract Advies */}
              <div className="relative lg:sticky lg:top-24">
                <EnergiecontractAdvies />
              </div>
            </div>
          </div>
        </section>

        {/* Live Prijzen Section - Direct onder hero */}
        <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full text-sm font-bold mb-6 shadow-lg">
                <span>📊</span>
                <span>Live Prijzen</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Actuele Energieprijzen
              </h3>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Bekijk de huidige energieprijzen en krijg inzicht in de marktontwikkelingen
              </p>
            </div>
            
            <div className="max-w-6xl mx-auto">
              <DynamicPricingHero />
            </div>
          </div>
        </section>

        {/* Input Form Section - Hidden for now */}
        {/* 
        <section id="calculation-form" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <UserInputForm />
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ResultsSection />
          </div>
        </section>
        */}



            {/* Articles Section */}
            <ArticlesSection />

        {/* FAQ Section */}
        <FAQ />
      </main>


      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold mb-6">Beste Energiecontract</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                De specialistische energievergelijker voor zonnepanelen eigenaren. 
                Vergelijk energiecontracten met accurate salderingsberekeningen en vind de beste terugleververgoeding.
                <strong className="text-white"> Bespaar tot €800 per jaar!</strong>
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                <div className="bg-green-600 px-3 py-1 rounded-full text-sm">
                  🏠 Zonnepanelen Specialist
                </div>
                <div className="bg-blue-600 px-3 py-1 rounded-full text-sm">
                  ⚡ Gratis Vergelijking
                </div>
                <div className="bg-purple-600 px-3 py-1 rounded-full text-sm">
                  🔒 100% Veilig
                </div>
                <div className="bg-orange-600 px-3 py-1 rounded-full text-sm">
                  💯 Geen Kosten
                </div>
              </div>
              <div className="text-sm text-gray-400 space-y-1">
                <p>✓ Gratis vergelijking</p>
                <p>✓ Altijd de nieuwste tarieven</p>
                <p>✓ Geen verborgen kosten</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6">Voor Zonnepanelen Eigenaren</h4>
              <ul className="space-y-3 text-gray-300">
                <li>• Salderingsberekeningen</li>
                <li>• Terugleververgoedingen</li>
                <li>• Zelfverbruik optimalisatie</li>
                <li>• Jaarlijkse besparingen</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6">Energiecontracten</h4>
              <ul className="space-y-3 text-gray-300">
                <li>• Vaste contracten</li>
                <li>• Variabele contracten</li>
                <li>• Groene energie</li>
                <li>• Alle leveranciers</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                &copy; 2024 Beste Energiecontract. Alle prijzen zijn indicatief en kunnen afwijken van werkelijke tarieven.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy</a>
                <a href="mailto:info@besteenergiecontract.nl" className="text-gray-400 hover:text-white text-sm transition-colors">Contact</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}