'use client';

import { useEffect, useRef } from 'react';

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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add the Daisycon script to the document if it doesn't exist
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

    // Function to initialize/re-initialize the widget
    const initWidget = () => {
      // @ts-ignore - The Daisycon script adds global objects/methods
      if (window.daisycon && window.daisycon.energy) {
        // @ts-ignore
        window.daisycon.energy.init();
      }
    };

    // If script is already loaded, init; otherwise init when script loads
    if (script.dataset.loaded === 'true') {
      initWidget();
    } else {
      script.addEventListener('load', () => {
        script.dataset.loaded = 'true';
        initWidget();
      });
    }

    // Cleanup isn't strictly necessary for the script itself but good practice
    // if we wanted to remove the script when the component unmounts.
    // In this case, we prefer keeping it loaded.
  }, []);

  // Construct the config based on props
  // Standard config provided by user: {"mediaId":413683,"locale":"nl-NL","buttonText":"Bekijken","filter":{"household":{"value":3},"tariffType":{"value":["dynamic"]}}}
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
      },
      // Optional: attempt to pass consumption if supported by widget
      // consumption: { value: consumption } 
    }
  };

  return (
    <div className="w-full min-h-[600px] bg-white rounded-xl overflow-hidden shadow-sm">
      <div 
        ref={containerRef}
        className="dc-tool dc-energy-tool" 
        data-config={JSON.stringify(config)}
      />
    </div>
  );
}
