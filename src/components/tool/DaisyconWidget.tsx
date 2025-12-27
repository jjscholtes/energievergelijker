'use client';

import { useEffect, useState } from 'react';

// Add global type definition for window.daisycon
declare global {
  interface Window {
    daisycon: {
      energy: {
        init: () => void;
      };
    };
  }
}

interface DaisyconWidgetProps {
  consumption?: number;
  hasSolar?: boolean;
  solarProduction?: number;
  persons?: number;
}

export function DaisyconWidget({
  consumption = 4500,
  hasSolar = false,
  solarProduction = 0,
  persons = 3
}: DaisyconWidgetProps) {
  const [status, setStatus] = useState<'loading' | 'active' | 'error'>('loading');

  const config = {
    mediaId: 413683,
    locale: "nl-NL",
    buttonText: "Bekijken",
    filter: {
      household: {
        value: persons || 3
      },
      tariffType: {
        value: ["dynamic"]
      }
    }
  };

  // Create a stable key for the config
  const configKey = JSON.stringify(config);

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 20; // Try for 10 seconds (20 * 500ms)

    const initWidget = () => {
      // Check if the daisycon object is available
      if (window.daisycon && window.daisycon.energy) {
        try {
          // Initialize the widget
          window.daisycon.energy.init();
          setStatus('active');
          return true;
        } catch (e) {
          console.error('Daisycon: init failed', e);
          return false;
        }
      }
      return false;
    };

    // 1. Ensure Script is Loaded
    const scriptId = 'daisycon-energy-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://daisycon.tools/energy-nl/app.js';
      script.type = 'text/javascript';
      script.async = true;
      document.head.appendChild(script);
    }

    // 2. Poll for availability and init
    // We poll because the script load event might have passed, 
    // or the internal 'daisycon' object might take a moment to be attached to window.
    const intervalId = setInterval(() => {
      // If we are already active (from a previous effect run), we might still want to re-init if config changed
      // But 'init()' is idempotent-ish or handles re-scanning the DOM.
      const success = initWidget();
      if (success) {
        clearInterval(intervalId);
      } else {
        attempts++;
        if (attempts >= maxAttempts) {
          clearInterval(intervalId);
          // Only set error if we are still loading. 
          // If we were active, we stay active (though re-init failing is weird).
          setStatus((s) => s === 'loading' ? 'error' : s);
        }
      }
    }, 500);

    return () => clearInterval(intervalId);
  }, [configKey]); // Re-run when config changes

  return (
    <div className="w-full min-h-[600px] bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 relative">
      {/* 
        The 'key' prop forces React to destroy and recreate this div whenever the config changes.
        This provides a fresh, uninitialized DOM node for the Daisycon script to attach to.
      */}
      <div
        key={configKey}
        className="dc-tool dc-energy-tool"
        data-config={configKey}
      />

      {/* Loading State */}
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10 transition-opacity duration-300">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
            <div className="text-gray-500 font-medium">
              Vergelijker laden...
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-10 p-6 text-center">
          <p className="text-gray-700 font-medium mb-2">
            De vergelijker kon helaas niet worden geladen.
          </p>
          <p className="text-sm text-gray-500 mb-6 max-w-md">
            Dit kan komen door een ad-blocker of omdat de domeinnaam nog niet is goedgekeurd.
          </p>
          <a
            href={`https://daisycon.tools/energy-nl/comparison?mediaId=${config.mediaId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md flex items-center gap-2"
          >
            Open Vergelijker in Nieuw Venster
          </a>
        </div>
      )}
    </div>
  );
}
