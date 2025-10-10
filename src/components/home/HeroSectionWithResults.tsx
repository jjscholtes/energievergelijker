'use client';

import { useState, useEffect, useRef } from 'react';
import { HeroSection } from './HeroSection';
import { ContractAdviesResults } from '@/components/energie-advies/ContractAdviesResults';
import { ContractAdviesResult } from '@/components/EnergiecontractAdvies';

export function HeroSectionWithResults() {
  const [result, setResult] = useState<ContractAdviesResult | null>(null);
  const resultsRef = useRef<HTMLElement>(null);

  // Scroll to results when they appear
  useEffect(() => {
    if (result && resultsRef.current) {
      // Small delay to ensure the element is rendered
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  }, [result]);

  return (
    <>
      {/* Hero Section with form - completely unchanged */}
      <HeroSection onResultChange={setResult} />
      
      {/* Results Section - Full width below hero */}
      {result && (
        <section 
          ref={resultsRef}
          className="relative bg-gradient-to-br from-gray-50 via-white to-blue-50 py-12"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ContractAdviesResults result={result} />
          </div>
        </section>
      )}
    </>
  );
}

