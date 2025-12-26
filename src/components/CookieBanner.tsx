'use client';

import React, { useState, useEffect } from 'react';
import { Cookie, Settings, Check, X } from 'lucide-react';

// Type declaration for gtag
declare global {
  interface Window {
    gtag?: (command: string, action: string, params?: Record<string, string>) => void;
  }
}

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Altijd true, kan niet uitgeschakeld
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Controleer of gebruiker al toestemming heeft gegeven
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptAll = () => {
    const allConsent = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('cookie-consent', JSON.stringify(allConsent));
    setShowBanner(false);
    setShowSettings(false);
    
    // Enable Vercel Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'granted',
      });
    }
  };

  const acceptSelected = () => {
    const consent = {
      ...preferences,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('cookie-consent', JSON.stringify(consent));
    setShowBanner(false);
    setShowSettings(false);
    
    // Update analytics consent
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: preferences.analytics ? 'granted' : 'denied',
        ad_storage: preferences.marketing ? 'granted' : 'denied',
      });
    }
  };

  const rejectAll = () => {
    const consent = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('cookie-consent', JSON.stringify(consent));
    setShowBanner(false);
    setShowSettings(false);
  };

  const togglePreference = (key: keyof typeof preferences) => {
    if (key === 'necessary') return; // Kan niet uitgeschakeld
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            {/* Cookie Icon & Text */}
            <div className="flex items-start gap-4 flex-1">
              <div className="bg-emerald-100 p-3 rounded-full">
                <Cookie className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Wij gebruiken cookies
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  We gebruiken cookies om onze website te verbeteren, verkeer te analyseren en gepersonaliseerde content te tonen. 
                  Je kunt je voorkeuren aanpassen of alles accepteren.
                </p>
                <div className="mt-3 text-xs text-gray-500">
                  <a href="/privacy" className="text-emerald-600 hover:underline">
                    Privacybeleid
                  </a>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Instellingen</span>
              </button>
              <button
                onClick={rejectAll}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Alleen noodzakelijk
              </button>
              <button
                onClick={acceptAll}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
              >
                Alles accepteren
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cookie Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Cookie-instellingen
                </h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cookie Categories */}
              <div className="space-y-6">
                {/* Noodzakelijke Cookies */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Noodzakelijke cookies</h3>
                    <div className="flex items-center gap-2 text-green-600">
                      <Check className="w-4 h-4" />
                      <span className="text-sm font-medium">Altijd actief</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Deze cookies zijn essentieel voor het functioneren van de website en kunnen niet worden uitgeschakeld.
                  </p>
                </div>

                {/* Analytics Cookies */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Analytische cookies</h3>
                    <button
                      onClick={() => togglePreference('analytics')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        preferences.analytics ? 'bg-emerald-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          preferences.analytics ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Deze cookies helpen ons begrijpen hoe bezoekers onze website gebruiken door informatie anoniem te verzamelen en te rapporteren.
                  </p>
                </div>

                {/* Marketing Cookies */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Marketing cookies</h3>
                    <button
                      onClick={() => togglePreference('marketing')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        preferences.marketing ? 'bg-emerald-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          preferences.marketing ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Deze cookies worden gebruikt om bezoekers te volgen op verschillende websites om relevante advertenties te tonen.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <button
                  onClick={rejectAll}
                  className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Alleen noodzakelijk
                </button>
                <button
                  onClick={acceptSelected}
                  className="flex-1 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  Geselecteerde voorkeuren opslaan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
