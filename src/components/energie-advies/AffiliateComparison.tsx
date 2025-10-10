'use client';

export function AffiliateComparison() {
  return (
    <section className="py-12 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Vergelijk direct bij energieleveranciers
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Bekijk actuele aanbiedingen van energieleveranciers en sluit direct online af. 
            Vergelijk prijzen, voorwaarden en duurzaamheidsscores.
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Energievergelijker
            </h3>
            <p className="text-gray-600 text-sm">
              Vul je gegevens in en vergelijk direct de beste energiedeals
            </p>
          </div>
          
          <div className="relative w-full" style={{ minHeight: '1200px' }}>
            <iframe
              src="https://daisycon.tools/energy-nl/?mediaId=413683&locale=nl-NL"
              width="100%"
              height="1200"
              style={{ border: 'none' }}
              title="Energievergelijker"
              loading="lazy"
            />
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            * Deze vergelijker wordt aangeboden door onze partner
          </p>
        </div>
      </div>
    </section>
  );
}
