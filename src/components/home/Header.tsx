'use client';

import Link from 'next/link';
import { memo } from 'react';

export const Header = memo(function Header() {
  return (
    <header className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">⚡</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Beste Energiecontract</h1>
              <p className="text-gray-600 text-sm font-medium">De specialist voor energiecontracten met zonnepanelen</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/tool"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-blue-50"
            >
              Zelf Vergelijken
            </Link>
            <Link 
              href="/dynamische-prijzen"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-blue-50"
            >
              Dynamische Prijzen
            </Link>
            <button 
              onClick={() => {
                const articlesSection = document.getElementById('articles-section');
                if (articlesSection) {
                  articlesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-blue-50"
            >
              Artikelen
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
});
