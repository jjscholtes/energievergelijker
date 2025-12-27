'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useBatteryPrices, BatteryPriceData } from '@/hooks/useBatteryPrices';

interface BatteryProductShowcaseProps {
  className?: string;
}

// Fallback static data in case API fails
const fallbackProducts = {
  'homewizard-plug-in-battery': {
    brand: 'HomeWizard',
    title: 'Plug-In Battery',
    priceFormatted: '€1.395',
    capacity: '2,7 kWh',
    image: 'https://www.homewizard.com/wp-content/uploads/2024/04/homewizard-battery-front-shop.webp',
    specs: [
      '800W laden/ontladen',
      '6000+ cycli garantie',
      'LiFePO4 technologie',
      'Uitbreidbaar tot 10,8 kWh',
    ],
    benefits: [
      'Plug & Play - geen installatie',
      '0% kobalt en mangaan',
      'HomeWizard Energy app',
      'Directe meterkoppeling',
    ],
    affiliateLink: 'https://partner.homewizard.com/c/?si=18407&li=1796617&wi=413683&pid=077737e0c2bdb1b4a9a089aa6c853bf2&dl=nl%2Fshop%2Fplug-in-battery%2F&ws=',
  },
  'zendure-solarflow-hyper-2000': {
    brand: 'Zendure',
    title: 'SolarFlow Hyper 2000',
    priceFormatted: '€959',
    capacity: '1,92 kWh',
    image: 'https://cdn.shopify.com/s/files/1/0643/8568/3256/files/Untitleddesign_21_1296x.png',
    specs: [
      '800W output',
      '90% round-trip efficiency',
      'LiFePO4 batterij',
      'Uitbreidbaar tot 7,68 kWh',
    ],
    benefits: [
      'Modulair systeem',
      'Slimme P1 meter integratie',
      'Balkonkraftwerk geschikt',
      'Bifaciale panelen support',
    ],
    affiliateLink: 'https://zendure.nl/collections/solarflow-series/products/solarflow-hyper-2000?utm_source=energievergelijker&utm_medium=referral&utm_campaign=thuisaccu-tool',
  },
};

function ProductCard({ 
  product, 
  isLoading, 
  variant 
}: { 
  product: BatteryPriceData | typeof fallbackProducts['homewizard-plug-in-battery']; 
  isLoading: boolean;
  variant: 'homewizard' | 'zendure';
}) {
  const isHomeWizard = variant === 'homewizard';
  
  return (
    <Card className={`p-8 bg-white shadow-xl border-2 ${isHomeWizard ? 'border-blue-200' : 'border-slate-200'} hover:shadow-2xl transition-all`}>
      <div className="flex items-center justify-between mb-6">
        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${
          isHomeWizard 
            ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
            : 'bg-slate-900'
        } text-white uppercase tracking-wide`}>
          {product.brand}
        </span>
        <span className={`text-3xl font-bold text-green-600 ${isLoading ? 'animate-pulse' : ''}`}>
          {product.priceFormatted}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 mb-6">
        <div className="sm:w-32 flex items-center justify-center">
          <Image
            src={product.image}
            alt={`${product.brand} ${product.title}`}
            width={128}
            height={160}
            className="rounded-lg shadow-lg object-contain"
          />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{product.title}</h3>
          <p className={`${isHomeWizard ? 'text-blue-600' : 'text-slate-600'} font-semibold text-lg mb-4`}>
            Capaciteit: {product.capacity}
          </p>
          
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Specificaties:</h4>
              <ul className="space-y-1">
                {product.specs.map((spec, idx) => (
                  <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                    <span className={isHomeWizard ? 'text-blue-500' : 'text-slate-500'}>•</span>
                    {spec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Voordelen:</h4>
        <div className="grid grid-cols-2 gap-3">
          {product.benefits.map((benefit, idx) => (
            <div key={idx} className={`flex items-start gap-2 ${isHomeWizard ? 'bg-blue-50' : 'bg-slate-50'} rounded-lg px-3 py-2`}>
              <span className={`${isHomeWizard ? 'text-blue-600' : 'text-emerald-600'} text-sm`}>✓</span>
              <span className="text-sm text-gray-700 leading-tight">{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      <Button
        asChild
        className={`w-full ${
          isHomeWizard 
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
            : 'bg-slate-900 hover:bg-slate-800'
        } text-white font-semibold py-3`}
      >
        <a href={product.affiliateLink} target="_blank" rel="noopener noreferrer">
          Bekijk {product.brand} {product.title}
        </a>
      </Button>
    </Card>
  );
}

export function BatteryProductShowcase({ className = '' }: BatteryProductShowcaseProps) {
  const { products, isLoading } = useBatteryPrices();

  // Get dynamic products or use fallback
  const homeWizardProduct = products.find(p => p.id === 'homewizard-plug-in-battery') || fallbackProducts['homewizard-plug-in-battery'];
  const zendureProduct = products.find(p => p.id === 'zendure-solarflow-hyper-2000') || fallbackProducts['zendure-solarflow-hyper-2000'];

  return (
    <section className={`py-16 bg-gradient-to-br from-slate-50 via-white to-blue-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Kies de juiste{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
              thuisbatterij
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Beide systemen helpen je zelfconsumptie verhogen en kosten besparen. Kies op basis van je situatie en budget.
          </p>
        </div>

        {/* Product Cards */}
        <div className="grid lg:grid-cols-2 gap-8">
          <ProductCard 
            product={homeWizardProduct as BatteryPriceData} 
            isLoading={isLoading} 
            variant="homewizard" 
          />
          <ProductCard 
            product={zendureProduct as BatteryPriceData} 
            isLoading={isLoading} 
            variant="zendure" 
          />
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 max-w-3xl mx-auto">
            <strong>Let op:</strong> Dit is geen directe vergelijking. Beide systemen hebben hun eigen sterke punten. 
            De HomeWizard heeft meer capaciteit per module, terwijl de Zendure modulairder is en een lager instapbedrag heeft.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Prijzen worden automatisch bijgewerkt vanuit de webshops.
          </p>
        </div>
      </div>
    </section>
  );
}
