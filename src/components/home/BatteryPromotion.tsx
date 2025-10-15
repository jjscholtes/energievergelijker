'use client';

import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface BatteryPromotionProps {
  className?: string;
}

export function BatteryPromotion({ className = '' }: BatteryPromotionProps) {
  const batteryData = {
    title: "HomeWizard Plug-In Battery",
    price: "€1.395",
    capacity: "2,7 kWh",
    power: "800W",
    cycles: "6000+",
    features: [
      "Eenvoudige installatie - steek de stekker in",
      "Uitbreidbaar tot 10,8 kWh (4 batterijen)",
      "Lithium-fosfaatcellen (LFP) - veilig en duurzaam",
      "0% kobalt en 0% mangaan",
      "Werkt met HomeWizard Energy app"
    ],
    link: "https://partner.homewizard.com/c/?si=18407&li=1796617&wi=413683&pid=077737e0c2bdb1b4a9a089aa6c853bf2&dl=nl%2Fshop%2Fplug-in-battery%2F&ws=",
    image: "https://www.homewizard.com/wp-content/uploads/2024/04/homewizard-battery-front-shop.webp"
  };

  return (
    <section className={`py-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Verhoog je{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
              zelfconsumptie
            </span>{' '}
            met een thuisbatterij
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Sla je zonne-energie op voor later gebruik en bespaar nog meer op je energierekening. 
            De HomeWizard Plug-In Battery is de perfecte aanvulling op je zonnepanelen.
          </p>
        </div>

        {/* Main Promotion Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Product Info */}
          <div className="space-y-6">
            <Card className="p-8 bg-white/90 backdrop-blur-md border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-6">
                <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="w-20 h-auto">
                        <Image
                          src={batteryData.image}
                          alt={batteryData.title}
                          width={160}
                          height={200}
                          className="w-20 h-auto rounded-lg shadow-lg"
                        />
                      </div>
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                      HomeWizard
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{batteryData.title}</h3>
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl font-bold text-green-600">{batteryData.price}</span>
                    <span className="text-sm text-gray-500">Plug &amp; play thuisbatterij</span>
                  </div>
                </div>
              </div>

              {/* Specifications */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-700">{batteryData.capacity}</div>
                  <div className="text-sm text-blue-600">Opslagcapaciteit</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-lg font-bold text-purple-700">{batteryData.power}</div>
                  <div className="text-sm text-purple-600">Laad/ontlaad</div>
                </div>
                <div className="text-center p-3 bg-indigo-50 rounded-lg">
                  <div className="text-lg font-bold text-indigo-700">{batteryData.cycles}</div>
                  <div className="text-sm text-indigo-600">Cycli</div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6">
                <h4 className="font-semibold text-gray-900">Belangrijkste voordelen:</h4>
                <ul className="space-y-2">
                  {batteryData.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <Button 
                asChild
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <a 
                  href={batteryData.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block"
                >
                  Bekijk HomeWizard Plug-In Battery
                </a>
              </Button>
            </Card>
          </div>

          {/* Benefits Section */}
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">💰</span>
                </div>
                <h4 className="text-xl font-bold text-green-800">Meer besparen</h4>
              </div>
              <p className="text-green-700">
                Verhoog je zelfconsumptie van zonne-energie tot wel 80% en bespaar honderden euro&apos;s per jaar 
                op je energierekening.
              </p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">🌱</span>
                </div>
                <h4 className="text-xl font-bold text-blue-800">Duurzaam</h4>
              </div>
              <p className="text-blue-700">
                Lithium-fosfaatcellen zonder kobalt en mangaan. Veilig, duurzaam en met een levensduur 
                van meer dan 6000 cycli.
              </p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">⚡</span>
                </div>
                <h4 className="text-xl font-bold text-purple-800">Eenvoudig</h4>
              </div>
              <p className="text-purple-700">
                Steek de stekker in het stopcontact en installeer via de app. Geen complexe installatie 
                of professionele hulp nodig.
              </p>
            </Card>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 text-lg">
            <strong>Perfect voor:</strong> Huishoudens met zonnepanelen die hun zelfconsumptie willen verhogen 
            en minder afhankelijk willen zijn van de salderingsregeling.
          </p>
        </div>
      </div>
    </section>
  );
}
