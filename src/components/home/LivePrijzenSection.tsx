'use client';

import { DynamicPricingHero } from '@/components/DynamicPricingHero';

export function LivePrijzenSection() {
  return (
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
  );
}
