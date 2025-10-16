'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface BatteryProductShowcaseProps {
  className?: string;
}

const homeWizardProduct = {
  brand: 'HomeWizard',
  title: 'Plug-In Battery',
  price: '€1.395',
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
  link: 'https://partner.homewizard.com/c/?si=18407&li=1796617&wi=413683&pid=077737e0c2bdb1b4a9a089aa6c853bf2&dl=nl%2Fshop%2Fplug-in-battery%2F&ws=',
};

const zendureProduct = {
  brand: 'Zendure',
  title: 'SolarFlow Hyper 2000',
  price: '€969',
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
  link: 'https://zendure.nl/collections/solarflow-series/products/solarflow-hyper-2000?utm_source=energievergelijker&utm_medium=referral&utm_campaign=thuisaccu-tool',
};

export function BatteryProductShowcase({ className = '' }: BatteryProductShowcaseProps) {
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
          {/* HomeWizard Card */}
          <Card className="p-8 bg-white shadow-xl border-2 border-blue-200 hover:shadow-2xl transition-all">
            <div className="flex items-center justify-between mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-white uppercase tracking-wide">
                {homeWizardProduct.brand}
              </span>
              <span className="text-3xl font-bold text-green-600">{homeWizardProduct.price}</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 mb-6">
              <div className="sm:w-32 flex items-center justify-center">
                <Image
                  src={homeWizardProduct.image}
                  alt={`${homeWizardProduct.brand} ${homeWizardProduct.title}`}
                  width={128}
                  height={160}
                  className="rounded-lg shadow-lg object-contain"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{homeWizardProduct.title}</h3>
                <p className="text-blue-600 font-semibold text-lg mb-4">Capaciteit: {homeWizardProduct.capacity}</p>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Specificaties:</h4>
                    <ul className="space-y-1">
                      {homeWizardProduct.specs.map((spec, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                          <span className="text-blue-500">•</span>
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
                {homeWizardProduct.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-blue-50 rounded-lg px-3 py-2">
                    <span className="text-blue-600 text-sm">✓</span>
                    <span className="text-sm text-gray-700 leading-tight">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              asChild
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3"
            >
              <a href={homeWizardProduct.link} target="_blank" rel="noopener noreferrer">
                Bekijk {homeWizardProduct.brand} {homeWizardProduct.title}
              </a>
            </Button>
          </Card>

          {/* Zendure Card */}
          <Card className="p-8 bg-white shadow-xl border-2 border-slate-200 hover:shadow-2xl transition-all">
            <div className="flex items-center justify-between mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-slate-900 text-white uppercase tracking-wide">
                {zendureProduct.brand}
              </span>
              <span className="text-3xl font-bold text-green-600">{zendureProduct.price}</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 mb-6">
              <div className="sm:w-32 flex items-center justify-center">
                <Image
                  src={zendureProduct.image}
                  alt={`${zendureProduct.brand} ${zendureProduct.title}`}
                  width={128}
                  height={160}
                  className="rounded-lg shadow-lg object-contain"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{zendureProduct.title}</h3>
                <p className="text-slate-600 font-semibold text-lg mb-4">Capaciteit: {zendureProduct.capacity}</p>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Specificaties:</h4>
                    <ul className="space-y-1">
                      {zendureProduct.specs.map((spec, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                          <span className="text-slate-500">•</span>
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
                {zendureProduct.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-slate-50 rounded-lg px-3 py-2">
                    <span className="text-emerald-600 text-sm">✓</span>
                    <span className="text-sm text-gray-700 leading-tight">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              asChild
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3"
            >
              <a href={zendureProduct.link} target="_blank" rel="noopener noreferrer">
                Bekijk {zendureProduct.brand} {zendureProduct.title}
              </a>
            </Button>
          </Card>
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 max-w-3xl mx-auto">
            <strong>Let op:</strong> Dit is geen directe vergelijking. Beide systemen hebben hun eigen sterke punten. 
            De HomeWizard heeft meer capaciteit per module, terwijl de Zendure modulairder is en een lager instapbedrag heeft. 
            Productdetails afkomstig uit officiële datafeed partners (HomeWizard Partner Programma en Zendure Nederland via Daisycon).
          </p>
        </div>
      </div>
    </section>
  );
}

