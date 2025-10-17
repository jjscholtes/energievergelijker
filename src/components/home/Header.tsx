'use client';

import Link from 'next/link';
import { memo, useState } from 'react';

export const Header = memo(function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-4 hover:opacity-90 transition-opacity">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">⚡</span>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Beste Energiecontract</h1>
              <p className="hidden sm:block text-gray-600 text-sm font-medium">De specialist voor energiecontracten met zonnepanelen</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/"
              className="text-gray-700 hover:text-emerald-600 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-emerald-50"
            >
              Home
            </Link>
            <Link 
              href="/tool"
              className="text-gray-700 hover:text-emerald-600 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-emerald-50"
            >
              Tools
            </Link>
            <Link 
              href="/dynamische-prijzen"
              className="text-gray-700 hover:text-emerald-600 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-emerald-50"
            >
              Dynamische Prijzen
            </Link>
            <Link 
              href="/artikelen"
              className="text-gray-700 hover:text-emerald-600 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-emerald-50"
            >
              Artikelen
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
          >
            <span className="sr-only">Open menu</span>
            {/* Hamburger icon */}
            {!mobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link 
                href="/"
                className="block text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 font-medium px-3 py-2 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/tool"
                className="block text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 font-medium px-3 py-2 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Tools
              </Link>
              <Link 
                href="/dynamische-prijzen"
                className="block text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 font-medium px-3 py-2 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dynamische Prijzen
              </Link>
              <Link 
                href="/artikelen"
                className="block text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 font-medium px-3 py-2 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Artikelen
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
});
