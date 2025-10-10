'use client';

import Link from 'next/link';
import { ReactNode, memo } from 'react';

interface ToolLayoutProps {
  children: ReactNode;
}

export const ToolLayout = memo(function ToolLayout({ children }: ToolLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">⚡</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Energiecontract Calculator</h1>
                <p className="text-gray-600 text-sm font-medium">Vergelijk je eigen energiecontracten</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                href="/"
                className="text-gray-700 hover:text-emerald-600 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-emerald-50"
              >
                Terug naar Vergelijker
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-full text-sm font-bold mb-6 shadow-lg">
            <span>🛠️</span>
            <span>Zelf Energiecontracten Vergelijken</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Energiecontract Calculator Tool
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Voeg je eigen energiecontracten toe en vergelijk de kosten. Perfect voor het vergelijken van verschillende tarieven en voorwaarden.
          </p>
        </div>

        {children}
      </main>
    </div>
  );
});
