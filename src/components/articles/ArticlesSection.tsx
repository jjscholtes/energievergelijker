import { articles } from '@/lib/data/articles';
import ArticleCard from './ArticleCard';
import { ArrowRight, BookOpen, TrendingUp, Shield, Clock } from 'lucide-react';
import Link from 'next/link';

export default function ArticlesSection() {

  return (
    <section id="articles-section" className="py-32 bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-gradient-to-r from-pink-400 to-pink-600 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
        <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-1000"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-3000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Enhanced Header */}
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-3 bg-white/95 backdrop-blur-md text-blue-700 px-8 py-4 rounded-full text-sm font-bold mb-10 shadow-xl border border-blue-200 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <BookOpen className="w-6 h-6" />
            <span>Artikelen & Nieuws</span>
          </div>
          <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-10 leading-tight">
            Blijf op de hoogte van de{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
              laatste ontwikkelingen
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Ontdek de nieuwste trends, tips en analyses in de energiewereld. 
            Van terugleververgoedingen tot dynamische contracten - wij houden je op de hoogte met{' '}
            <span className="font-semibold text-blue-600">data-gedreven inzichten</span> en{' '}
            <span className="font-semibold text-purple-600">praktische tips</span>.
          </p>
        </div>

        {/* Featured Articles */}
        <div className="mb-20">
          {/* Enhanced Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
            {articles.slice(0, 3).map((article) => (
              <ArticleCard 
                key={article.id}
                article={article} 
              />
            ))}
          </div>

          {/* View All Articles Button */}
          <div className="text-center mb-16">
            <Link
              href="/artikelen"
              className="inline-flex items-center gap-3 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl group"
            >
              <span>Alle artikelen bekijken ({articles.length})</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-white/40">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full text-sm font-bold mb-8 shadow-lg">
                <TrendingUp className="w-5 h-5" />
                <span>Meer Inzichten</span>
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-6">
                Blijf op de hoogte van de laatste ontwikkelingen
              </h4>
              <p className="text-gray-600 mb-8 text-lg max-w-2xl mx-auto leading-relaxed">
                Schrijf je in voor onze nieuwsbrief en krijg de nieuwste artikelen direct in je inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/#user-input-form"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center gap-3 group"
                >
                  <BookOpen className="w-5 h-5" />
                  <span>Start Energievergelijking</span>
                </Link>
                <button className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-xl font-bold transition-all duration-300 flex items-center gap-3 group">
                  <span>Nieuwsbrief</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center group">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h4 className="font-bold text-gray-900 mb-4 text-xl">Data-gedreven</h4>
            <p className="text-gray-600 leading-relaxed text-lg">
              Alle analyses gebaseerd op actuele marktdata en trends uit de Nederlandse energiemarkt
            </p>
          </div>
          <div className="text-center group">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <TrendingUp className="w-10 h-10 text-white" />
            </div>
            <h4 className="font-bold text-gray-900 mb-4 text-xl">Expert kennis</h4>
            <p className="text-gray-600 leading-relaxed text-lg">
              Geschreven door energie-experts met jarenlange ervaring in de Nederlandse energiemarkt
            </p>
          </div>
          <div className="text-center group">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Clock className="w-10 h-10 text-white" />
            </div>
            <h4 className="font-bold text-gray-900 mb-4 text-xl">Actueel</h4>
            <p className="text-gray-600 leading-relaxed text-lg">
              Regelmatig bijgewerkt met de nieuwste ontwikkelingen en marktveranderingen
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}