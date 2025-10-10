'use client';

import { Suspense, lazy } from 'react';
import { Header } from '@/components/home/Header';
import { HeroSectionWithResults } from '@/components/home/HeroSectionWithResults';
import { LivePrijzenSection } from '@/components/home/LivePrijzenSection';
import { Footer } from '@/components/home/Footer';

// Lazy load components that are below the fold
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
        <LivePrijzenSection />
        
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