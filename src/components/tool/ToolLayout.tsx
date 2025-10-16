'use client';

import { ReactNode, memo } from 'react';
import { Header } from '@/components/home/Header';

interface ToolLayoutProps {
  children: ReactNode;
}

export const ToolLayout = memo(function ToolLayout({ children }: ToolLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50">
      <Header />

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
