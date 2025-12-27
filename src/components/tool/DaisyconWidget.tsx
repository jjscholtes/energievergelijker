'use client';

import { useEffect, useRef, useState } from 'react';

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
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Construct config object
  // We strictly follow the working example structure provided previously
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

  // Create a stable string key for the config to force re-mounts when it changes
  const configKey = JSON.stringify(config);

  useEffect(() => {
    // 1. Load the Daisycon script
    const scriptId = 'daisycon-energy-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const initWidget = () => {
      if (window.daisycon && window.daisycon.energy) {
        // Run init with a small delay to ensure DOM is ready
        setTimeout(() => {
          try {
            window.daisycon.energy.init();
            setScriptLoaded(true);
          } catch (e) {
            console.error('Daisycon init error:', e);
          }
        }, 100);
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://daisycon.tools/energy-nl/app.js';
      script.type = 'text/javascript';
      script.async = true;
      document.head.appendChild(script);

      script.addEventListener('load', () => {
        script.dataset.loaded = 'true';
        initWidget();
      });
    } else {
      // Script already exists
      if (script.dataset.loaded === 'true') {
        initWidget();
      } else {
        script.addEventListener('load', () => {
          script.dataset.loaded = 'true';
          initWidget();
        });
      }
    }
  }, []); // Only run script loader once on mount

  // 2. Re-initialize when config changes or script loads
  useEffect(() => {
    if (scriptLoaded && window.daisycon && window.daisycon.energy) {
      // When config changes, the div below updates due to the 'key' prop.
      // We need to tell the widget to scan the DOM again.
      // A small timeout helps ensure the new DOM node is in place.
      const timer = setTimeout(() => {
        window.daisycon.energy.init();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [scriptLoaded, configKey]);

  return (
    <div className="w-full min-h-[600px] bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
      {/* 
        The 'key' prop forces React to destroy and recreate this div whenever the config changes.
        This provides a fresh, uninitialized DOM node for the Daisycon script to attach to,
        preventing issues with re-initialization on dirty nodes.
      */}
      <div
        key={configKey}
        className="dc-tool dc-energy-tool"
        data-config={configKey}
      />
    </div>
  );
}
