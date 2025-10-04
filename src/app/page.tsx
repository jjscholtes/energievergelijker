'use client';

import { UserInputForm } from '@/components/forms/UserInputForm';
import { ResultsSection } from '@/components/results/ResultsSection';
import ArticlesSection from '@/components/articles/ArticlesSection';
import { FAQ } from '@/components/FAQ';
import { HowToGuide } from '@/components/HowToGuide';
import { DynamicPricingInsight } from '@/components/DynamicPricingInsight';

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
              <button 
                onClick={() => {
                  const formSection = document.getElementById('user-input-form');
                  if (formSection) {
                    formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-blue-50"
              >
                Vergelijken
              </button>
              <a 
                href="/tool"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-blue-50"
              >
                Calculator Tool
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
              <button 
                onClick={() => {
                  const trustSection = document.querySelector('[class*="py-20"][class*="bg-gradient-to-br"]');
                  if (trustSection) {
                    trustSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-blue-50"
              >
                Voordelen
              </button>
              <button 
                onClick={() => {
                  const formSection = document.getElementById('user-input-form');
                  if (formSection) {
                    formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Start Nu
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left Column - Content */}
              <div className="space-y-8">
                <div className="space-y-6">
                  
                  <h2 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight">
                    Bespaar tot{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient">
                      €800
                    </span>{' '}
                    per jaar op je energierekening
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
                    <span className="text-gray-700 font-semibold text-lg">Accurate salderingsberekeningen</span>
                  </div>
                  <div className="flex items-center space-x-4 p-6 bg-white/90 backdrop-blur-md rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-pulse shadow-lg"></div>
                    <span className="text-gray-700 font-semibold text-lg">Terugleververgoedingen vergelijken</span>
                  </div>
                  <div className="flex items-center space-x-4 p-6 bg-white/90 backdrop-blur-md rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <div className="w-4 h-4 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full animate-pulse shadow-lg"></div>
                    <span className="text-gray-700 font-semibold text-lg">Dynamische contracten</span>
                  </div>
                  <div className="flex items-center space-x-4 p-6 bg-white/90 backdrop-blur-md rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <div className="w-4 h-4 bg-gradient-to-r from-pink-400 to-pink-600 rounded-full animate-pulse shadow-lg"></div>
                    <span className="text-gray-700 font-semibold text-lg">Persoonlijke berekening</span>
                  </div>
                </div>

                {/* Enhanced Info Box */}
                <div className="bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 border border-green-200 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  <p className="text-green-800 font-semibold text-xl">
                    💡 <strong>Wist je dat?</strong> Zonnepanelen eigenaren kunnen tot €800 per jaar besparen 
                    met het juiste energiecontract en optimale saldering.
                  </p>
                </div>
                
                {/* Enhanced CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-6">
                  <button 
                    onClick={() => document.getElementById('user-input-form')?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white px-10 py-5 rounded-3xl font-bold text-xl transition-all duration-300 transform hover:scale-110 shadow-2xl hover:shadow-3xl flex items-center gap-4 group"
                  >
                    <span>🚀 Start Gratis Vergelijking</span>
                    <span className="group-hover:translate-x-2 transition-transform text-2xl">→</span>
                  </button>
                  <a 
                    href="/tool"
                    className="bg-white/95 backdrop-blur-md border-2 border-green-600 text-green-600 hover:bg-green-50 px-10 py-5 rounded-3xl font-bold text-xl transition-all duration-300 transform hover:scale-110 shadow-xl hover:shadow-2xl text-center"
                  >
                    🛠️ Calculator Tool
                  </a>
                  <button 
                    onClick={() => document.getElementById('benefits-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-white/95 backdrop-blur-md border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-10 py-5 rounded-3xl font-bold text-xl transition-all duration-300 transform hover:scale-110 shadow-xl hover:shadow-2xl"
                  >
                    📊 Bekijk Voordelen
                  </button>
                </div>
              </div>
            
              {/* Right Column - Visual */}
              <div className="relative">
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/40">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-full text-sm font-bold mb-6 shadow-lg">
                      <span>🏆</span>
                      <span>Gratis Vergelijking</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Bespaar tot €800 per jaar</h3>
                    <p className="text-gray-600 mb-6">Met het juiste energiecontract voor jouw situatie</p>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="text-center p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                      <div className="text-4xl font-bold text-green-600 mb-2">€800</div>
                      <p className="text-green-800 font-semibold">Maximale besparing mogelijk</p>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                      <div className="text-4xl font-bold text-blue-600 mb-2">100%</div>
                      <p className="text-blue-800 font-semibold">Gratis vergelijking</p>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                      <div className="text-4xl font-bold text-purple-600 mb-2">2 min</div>
                      <p className="text-purple-800 font-semibold">Gemiddelde invultijd</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* Dynamic Pricing Insight Section */}
        <DynamicPricingInsight />

        {/* Input Form Section */}
        <section id="calculation-form" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <UserInputForm />
          </div>
        </section>

        {/* Results Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ResultsSection />
          </div>
        </section>


        {/* Trust Section */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Waarom Vertrouwen Gebruikers Ons?
              </h3>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Wij zijn de specialistische energievergelijker voor zonnepanelen eigenaren. 
                Onze gebruikers besparen gemiddeld €400 per jaar op hun energierekening.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <span className="text-blue-600 font-bold text-2xl">🔒</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-3 text-lg">100% Veilig</h4>
                <p className="text-sm text-gray-600">Je gegevens worden veilig opgeslagen en niet gedeeld</p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <span className="text-green-600 font-bold text-2xl">⚡</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-3 text-lg">Real-time Data</h4>
                <p className="text-sm text-gray-600">Altijd de nieuwste tarieven en contracten</p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <span className="text-purple-600 font-bold text-2xl">🎯</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-3 text-lg">Accurate Berekeningen</h4>
                <p className="text-sm text-gray-600">Gebaseerd op officiële Nederlandse wetgeving</p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <span className="text-orange-600 font-bold text-2xl">💯</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-3 text-lg">Geen Verborgen Kosten</h4>
                <p className="text-sm text-gray-600">Volledig gratis, geen commissies of kosten</p>
              </div>
            </div>
          </div>
        </section>

        {/* Calculator Tool Section */}
        <section className="py-20 bg-gradient-to-br from-green-50 via-white to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-full text-sm font-bold mb-6 shadow-lg">
                <span>🛠️</span>
                <span>Nieuwe Tool</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Energiecontract Calculator Tool
              </h3>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Wil je je eigen energiecontracten vergelijken? Gebruik onze nieuwe calculator tool 
                om zelf contracten toe te voegen en de kosten te berekenen.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="text-2xl font-bold text-gray-900">Wat kun je doen?</h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-lg">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                      <div>
                        <h5 className="font-semibold text-gray-900">Contracten Toevoegen</h5>
                        <p className="text-gray-600 text-sm">Voeg je eigen energiecontracten toe met alle tarieven en voorwaarden</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-lg">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                      <div>
                        <h5 className="font-semibold text-gray-900">Automatisch Berekenen</h5>
                        <p className="text-gray-600 text-sm">Onze calculator berekent automatisch alle kosten inclusief belastingen en netbeheerkosten</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-lg">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                      <div>
                        <h5 className="font-semibold text-gray-900">Vergelijken</h5>
                        <p className="text-gray-600 text-sm">Zie direct welk contract het goedkoopst is en hoeveel je kunt besparen</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
                  <h5 className="font-bold text-green-800 mb-2">💡 Perfect voor:</h5>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Het vergelijken van verschillende tarieven</li>
                    <li>• Het testen van verschillende scenario's</li>
                    <li>• Het berekenen van de impact van zonnepanelen</li>
                    <li>• Het vergelijken van vaste vs dynamische contracten</li>
                  </ul>
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/40">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-white text-3xl">🛠️</span>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Calculator Tool</h4>
                    <p className="text-gray-600">Vergelijk je eigen energiecontracten</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                      <div className="text-2xl font-bold text-green-600 mb-1">100%</div>
                      <p className="text-green-800 font-semibold text-sm">Gratis te gebruiken</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                      <div className="text-2xl font-bold text-blue-600 mb-1">∞</div>
                      <p className="text-blue-800 font-semibold text-sm">Onbeperkt contracten</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                      <div className="text-2xl font-bold text-purple-600 mb-1">⚡</div>
                      <p className="text-purple-800 font-semibold text-sm">Real-time berekening</p>
                    </div>
                  </div>
                  
                  <a 
                    href="/tool"
                    className="w-full mt-6 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center justify-center gap-3"
                  >
                    <span>🚀</span>
                    <span>Start Calculator Tool</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Articles Section */}
        <ArticlesSection />

        {/* HowTo Guide Section */}
        <HowToGuide />

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