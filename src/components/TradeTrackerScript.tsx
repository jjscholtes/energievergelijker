'use client';

import { useEffect } from 'react';

export function TradeTrackerScript() {
  useEffect(() => {
    // TradeTracker SuperTag Code - alleen op client-side
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.innerHTML = `
      var _TradeTrackerTagOptions = {
        t: 'a',
        s: '496928',
        chk: '23e07d1fcad6a064ade95056582d48e5',
        overrideOptions: {}
      };

      (function() {
        var tt = document.createElement('script'), 
            s = document.getElementsByTagName('script')[0]; 
        tt.setAttribute('type', 'text/javascript'); 
        tt.setAttribute('src', (document.location.protocol == 'https:' ? 'https' : 'http') + '://tm.tradetracker.net/tag?t=' + _TradeTrackerTagOptions.t + '&s=' + _TradeTrackerTagOptions.s + '&chk=' + _TradeTrackerTagOptions.chk); 
        s.parentNode.insertBefore(tt, s);
      })();
    `;
    
    document.head.appendChild(script);
    
    return () => {
      // Cleanup bij unmount
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return null; // Dit component rendert niets visueel
}
