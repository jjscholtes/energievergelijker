'use client';

import { Suspense, lazy } from 'react';
import { Header } from '@/components/home/Header';
import { HeroSectionWithResults } from '@/components/home/HeroSectionWithResults';
import { Footer } from '@/components/home/Footer';

// Lazy load components that are below the fold
const DayAheadPrices = lazy(() => import('@/components/DayAheadPrices').then(module => ({ default: module.DayAheadPrices })));
const DynamicPricingHero = lazy(() => import('@/components/DynamicPricingHero').then(module => ({ default: module.DynamicPricingHero })));
const BatteryPromotion = lazy(() => import('@/components/home/BatteryPromotion').then(module => ({ default: module.BatteryPromotion })));
const ArticlesSection = lazy(() => import('@/components/articles/ArticlesSection').then(module => ({ default: module.default })));
const FAQ = lazy(() => import('@/components/FAQ').then(module => ({ default: module.FAQ })));

// Loading component for lazy loaded sections
function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50">
      <Header />
      
      <main>
        <HeroSectionWithResults />
        
        {/* Day-Ahead Prijzen */}
        <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Actuele Stroomprijzen
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Live day-ahead prijzen van de EPEX spotmarkt. Elke dag automatisch bijgewerkt.
              </p>
            </div>
            <Suspense fallback={<LoadingSpinner />}>
              <DayAheadPrices />
            </Suspense>
          </div>
        </section>
        
        {/* Dynamische Contracten Info */}
        <section className="py-16 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Suspense fallback={<LoadingSpinner />}>
              <DynamicPricingHero />
            </Suspense>
          </div>
        </section>
        
        {/* Thuis Accu Promotie */}
        <Suspense fallback={<LoadingSpinner />}>
          <BatteryPromotion />
        </Suspense>
        
        {/* Lazy loaded sections */}
        <Suspense fallback={<LoadingSpinner />}>
          <ArticlesSection />
        </Suspense>
        
        <Suspense fallback={<LoadingSpinner />}>
          <FAQ />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}