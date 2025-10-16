import { Metadata } from 'next';
import Link from 'next/link';
import { Calculator, TrendingUp, Zap, BarChart3, ArrowRight, Lightbulb } from 'lucide-react';

export const metadata: Metadata = {
  title: "Energie Tools | Contract Vergelijker & Prijzen Checker | Energievergelijker",
  description: "Vergelijk energiecontracten, bereken je energiekosten en ontdek de beste deal. Gratis tools om direct te zien wat je kan besparen op je energierekening.",
  keywords: "energiecontract vergelijken, energiekosten berekenen, dynamische prijzen checker, energie besparen tool, contract calculator, stroomprijzen vergelijken",
  openGraph: {
    title: "Energie Tools | Vergelijk & Bereken je Energiekosten",
    description: "Gebruik onze gratis tools om energiecontracten te vergelijken en te berekenen wat het beste bij jou past.",
    url: 'https://besteenergiecontract.nl/tool',
    siteName: 'Beste Energiecontract',
    locale: 'nl_NL',
    type: 'website',
  },
};

interface ToolCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  href: string;
  badge?: string;
  color: 'blue' | 'emerald' | 'purple' | 'orange';
}

function ToolCard({ icon, title, description, features, href, badge, color }: ToolCardProps) {
  const colorClasses = {
    blue: {
      gradient: 'from-blue-600 to-indigo-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-600',
      hoverBg: 'hover:bg-blue-100',
      iconBg: 'bg-blue-600',
    },
    emerald: {
      gradient: 'from-emerald-600 to-teal-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-600',
      hoverBg: 'hover:bg-emerald-100',
      iconBg: 'bg-emerald-600',
    },
    purple: {
      gradient: 'from-purple-600 to-pink-600',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-600',
      hoverBg: 'hover:bg-purple-100',
      iconBg: 'bg-purple-600',
    },
    orange: {
      gradient: 'from-orange-600 to-red-600',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-600',
      hoverBg: 'hover:bg-orange-100',
      iconBg: 'bg-orange-600',
    },
  };

  const colors = colorClasses[color];

  return (
    <Link href={href}>
      <div className={`group relative bg-white rounded-2xl shadow-lg border-2 ${colors.border} p-8 transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer h-full`}>
        {badge && (
          <div className={`absolute top-4 right-4 bg-gradient-to-r ${colors.gradient} text-white px-3 py-1 rounded-full text-xs font-bold`}>
            {badge}
          </div>
        )}
        
        <div className={`w-16 h-16 ${colors.iconBg} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
          <div className="text-white">
            {icon}
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {title}
        </h2>

        <p className="text-gray-600 mb-6 leading-relaxed">
          {description}
        </p>

        <ul className="space-y-2 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
              <span className={`${colors.text} font-bold mt-0.5`}>✓</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <div className={`flex items-center gap-2 ${colors.text} font-semibold group-hover:gap-4 transition-all`}>
          <span>Start tool</span>
          <ArrowRight className="w-5 h-5" />
        </div>
      </div>
    </Link>
  );
}

export default function ToolsPage() {
  const tools: ToolCardProps[] = [
    {
      icon: <Calculator className="w-8 h-8" />,
      title: "Contract Vergelijker",
      description: "Vergelijk verschillende energiecontracten en zie direct welk contract het beste bij jouw situatie past.",
      features: [
        "Vergelijk vaste én dynamische contracten",
        "Bereken je exacte jaarkosten",
        "Inclusief netbeheerkosten en belastingen",
        "Neem zonnepanelen en teruglevering mee",
        "Directe besparingsinzichten",
      ],
      href: "/tool/vergelijken",
      badge: "Populair",
      color: "blue",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Dynamische Prijzen Checker",
      description: "Bekijk actuele dynamische energieprijzen per uur en seizoen. Ontdek wanneer stroom het goedkoopst is.",
      features: [
        "Live uurprijzen en trends",
        "Seizoensvergelijkingen",
        "Realistische huishoudprofielen",
        "EV-laden optimalisatie",
        "Zonnepanelen teruglevering",
      ],
      href: "/dynamische-prijzen",
      color: "emerald",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm font-bold mb-6 shadow-lg">
              <Zap className="w-5 h-5" />
              <span>Gratis Energie Tools</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Vergelijk & Bespaar op je Energierekening
            </h1>
            
            <p className="text-xl lg:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Gebruik onze gratis tools om de beste energiedeal te vinden en direct te zien hoeveel je kunt besparen
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-6 h-6" />
                  <div className="text-left">
                    <div className="text-2xl font-bold">100% Gratis</div>
                    <div className="text-sm text-blue-100">Geen verborgen kosten</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <Lightbulb className="w-6 h-6" />
                  <div className="text-left">
                    <div className="text-2xl font-bold">Direct Inzicht</div>
                    <div className="text-sm text-blue-100">Zie je besparing meteen</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Kies een tool
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Selecteer de tool die bij jouw situatie past en ontdek direct je besparingsmogelijkheden
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {tools.map((tool, index) => (
              <ToolCard key={index} {...tool} />
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl shadow-2xl p-8 lg:p-12 text-white text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Klaar om te besparen?
            </h2>
            <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
              Start met één van onze tools en ontdek direct hoeveel je kunt besparen op je energierekening
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/tool/vergelijken"
                className="bg-white text-emerald-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-50 transition-all shadow-lg hover:scale-105 inline-flex items-center justify-center gap-2"
              >
                <Calculator className="w-6 h-6" />
                Start Contract Vergelijker
              </Link>
              <Link
                href="/dynamische-prijzen"
                className="bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-400 transition-all shadow-lg hover:scale-105 inline-flex items-center justify-center gap-2 border-2 border-white/20"
              >
                <TrendingUp className="w-6 h-6" />
                Bekijk Dynamische Prijzen
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Waarom onze tools gebruiken?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Nauwkeurig</h3>
                <p className="text-gray-600">
                  Onze berekeningen zijn gebaseerd op actuele tarieven en nemen alle kosten mee
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Snel & Eenvoudig</h3>
                <p className="text-gray-600">
                  Binnen enkele minuten weet je welk contract het beste bij je past
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Lightbulb className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Onafhankelijk</h3>
                <p className="text-gray-600">
                  Eerlijke vergelijkingen zonder commerciële belangen
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
