import Papa from 'papaparse';
import { parseISO } from 'date-fns';
import { DynamicCalcParams, DynamicCostResult } from '@/types/dynamicContracts';

export async function computeAnnualCost({
  csvData2024,
  csvData2025,
  baseLoad,
  wpProfile = {},
  evProfile = {},
  fixedCosts = 0,
  year,
  monteCarlo = false,
  mcIterations = 500,
  mcBlockDays = 7
}: DynamicCalcParams): Promise<DynamicCostResult> {
  try {
    // 1. CSV → priceMaps: Record<timestamp, number>
    const priceMap2024 = parseCSV(csvData2024);
    const priceMap2025 = parseCSV(csvData2025);
    const priceMap = year === '2024' ? priceMap2024 : priceMap2025;

    if (Object.keys(priceMap).length === 0) {
      throw new Error('Geen geldige prijsdata gevonden in CSV');
    }

    // 2. Bereken per uur load & kosten
    const timestamps = Object.keys(priceMap).sort();
    const loads = timestamps.map(ts => 
      baseLoad + (wpProfile[ts] ?? 0) + (evProfile[ts] ?? 0)
    );
    const prices = timestamps.map(ts => priceMap[ts]);
    const hourlyCosts = loads.map((load, i) => load * prices[i]);

    async function singleYearCost(): Promise<number> {
      return hourlyCosts.reduce((sum, cost) => sum + cost, 0) + fixedCosts;
    }

    if (!monteCarlo) {
      const totalCost = await singleYearCost();
      return { totalCost };
    }

    // 3. Monte Carlo sampling over blokken
    const blockSize = mcBlockDays * 24;
    const blocks = [];
    for (let i = 0; i < hourlyCosts.length; i += blockSize) {
      blocks.push(hourlyCosts.slice(i, i + blockSize));
    }

    const results: number[] = [];
    for (let it = 0; it < mcIterations; it++) {
      let sum = 0;
      for (let b = 0; b < blocks.length; b++) {
        const rndBlock = blocks[Math.floor(Math.random() * blocks.length)];
        sum += rndBlock.reduce((a, c) => a + c, 0);
      }
      results.push(sum + fixedCosts);
    }

    results.sort((a, b) => a - b);
    const median = results[Math.floor(results.length * 0.5)];
    const P10 = results[Math.floor(results.length * 0.1)];
    const P90 = results[Math.floor(results.length * 0.9)];
    const mean = results.reduce((a, b) => a + b, 0) / results.length;
    const std = Math.sqrt(results.map(r => (r - mean)**2).reduce((a, b) => a + b, 0) / results.length);

    return { median, P10, P90, mean, std };
  } catch (error) {
    throw new Error(`Fout bij berekening: ${error instanceof Error ? error.message : 'Onbekende fout'}`);
  }
}

// Helper: CSV-string → Record<ISO, number>
function parseCSV(csv: string): Record<string, number> {
  const result: Record<string, number> = {};
  
  if (!csv || csv.trim().length === 0) {
    return result;
  }

  try {
    Papa.parse(csv, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data }) => {
        (data as Array<Record<string, string>>).forEach(row => {
          // Probeer verschillende timestamp kolommen
          const timestampKey = Object.keys(row).find(key => 
            key.toLowerCase().includes('timestamp') || 
            key.toLowerCase().includes('time') ||
            key.toLowerCase().includes('datetime')
          );
          
          const priceKey = Object.keys(row).find(key => 
            key.toLowerCase().includes('price') || 
            key.toLowerCase().includes('prijs') ||
            key.toLowerCase().includes('tarief')
          );

          if (timestampKey && priceKey) {
        try {
          const ts = parseISO(row[timestampKey]);
          const price = parseFloat(row[priceKey]);
          
          if (!isNaN(price) && ts instanceof Date && !isNaN(ts.getTime())) {
            result[ts.toISOString()] = price;
          }
        } catch {
          console.warn(`Fout bij parsen van rij: ${JSON.stringify(row)}`);
        }
          }
        });
      },
      error: (error) => {
        throw new Error(`CSV parse fout: ${error instanceof Error ? error.message : 'Onbekende fout'}`);
      }
    });
  } catch (error) {
    throw new Error(`CSV parsing gefaald: ${error instanceof Error ? error.message : 'Onbekende fout'}`);
  }

  return result;
}

// Helper functie om gemiddelde prijs te berekenen voor vergelijking
export function calculateAveragePrice(csvData: string): number {
  const priceMap = parseCSV(csvData);
  const prices = Object.values(priceMap);
  
  if (prices.length === 0) return 0;
  
  return prices.reduce((sum, price) => sum + price, 0) / prices.length;
}

// Helper functie om prijsstatistieken te berekenen
export function calculatePriceStats(csvData: string): {
  min: number;
  max: number;
  average: number;
  median: number;
} {
  const priceMap = parseCSV(csvData);
  const prices = Object.values(priceMap).sort((a, b) => a - b);
  
  if (prices.length === 0) {
    return { min: 0, max: 0, average: 0, median: 0 };
  }
  
  const min = prices[0];
  const max = prices[prices.length - 1];
  const average = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  const median = prices.length % 2 === 0 
    ? (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2
    : prices[Math.floor(prices.length / 2)];
  
  return { min, max, average, median };
}


