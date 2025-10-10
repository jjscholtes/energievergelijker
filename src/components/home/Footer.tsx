'use client';

import Link from 'next/link';
import { memo } from 'react';

export const Footer = memo(function Footer() {
  return (
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
              <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy</Link>
              <a href="mailto:info@besteenergiecontract.nl" className="text-gray-400 hover:text-white text-sm transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
});
