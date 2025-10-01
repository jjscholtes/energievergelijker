# Briefing voor Cursor: Module “annualCostCalculator” in Next.js/TypeScript

## Doel  
Ontwikkel een herbruikbare TS-module (en API-route) voor een Next.js-applicatie, die op basis van dynamische uurtarieven (CSV‐bestanden 2024 & 2025), gebruikersprofielen (baseload, warmtepomp, EV) en vaste kosten de geschatte jaarkosten berekent—optioneel met Monte Carlo-sampling voor risicometrieken.

---

## Functionaliteiten  

- **CSV-inlezen & normaliseren**  
  • Parseur voor spotprijs‐CSV’s (`papaparse` of `fast-csv`)  
  • Tijdstempel naar `Date` of `dayjs`/`luxon`, correctie zomertijd/jaarverschillen  

- **Verbruiksprofielen**  
  • `baseLoad` (kWh/uur, constant of upload)  
  • `wpProfile` (array/Map<`Date`,`number`>)—placeholder of gekoppeld aan KNMI API + COP‐curve  
  • `evProfile` (Map<`Date`,`number`>)—dagelijkse afstand, arrival/departure, laadvermogen  

- **Kostencalculatie**  
  • uurkosten = `(baseLoad + wp + ev) × prijs`  
  • jaarlijkse optelsom + `fixedCosts`  

- **Monte Carlo sampling (optie)**  
  • Her-sample blokken van `mcBlockDays` over `mcIterations` loops  
  • Genereer verdeling → `median`, `P10`, `P90`, `mean`, `std`  

- **API & UI**  
  • Next.js API‐route `/api/calculate‐cost`  
  • Tailwind‐gebaseerde React-component voor input (CSV‐upload, profielen, parameters) én weergave resultaten  

---

## Specificatie: TypeScript API-module

```ts
// pages/api/calculate-cost.ts

import type { NextApiRequest, NextApiResponse } from 'next'

export type CostResult = {
  median?: number
  P10?: number
  P90?: number
  mean?: number
  std?: number
  totalCost?: number
}

export type CalcParams = {
  csvData2024: string    // raw CSV-tekst
  csvData2025: string
  baseLoad: number       // kWh/uur
  wpProfile?: Record<string, number>  // ISO timestamp → kWh
  evProfile?: Record<string, number>
  fixedCosts?: number
  year: '2024' | '2025'
  monteCarlo?: boolean
  mcIterations?: number
  mcBlockDays?: number
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CostResult | { error: string }>
) {
  try {
    const params: CalcParams = req.body
    const result = await computeAnnualCost(params)
    res.status(200).json(result)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}
```

```ts
// lib/annualCostCalculator.ts

import Papa from 'papaparse'
import { parseISO, addDays } from 'date-fns'

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
}: CalcParams): Promise<CostResult> {
  // 1. CSV → priceMaps: Record<timestamp, number>
  const priceMap2024 = parseCSV(csvData2024)
  const priceMap2025 = parseCSV(csvData2025)
  const priceMap = year === '2024' ? priceMap2024 : priceMap2025

  // 2. Bereken per uur load & kosten
  const timestamps = Object.keys(priceMap).sort()
  const loads = timestamps.map(ts => 
    baseLoad + (wpProfile[ts] ?? 0.5) + (evProfile[ts] ?? 0.3)
  )
  const prices = timestamps.map(ts => priceMap[ts])
  const hourlyCosts = loads.map((ld, i) => ld * prices[i])

  async function singleYearCost(): Promise<number> {
    return hourlyCosts.reduce((sum, c) => sum + c, 0) + fixedCosts
  }

  if (!monteCarlo) {
    return { totalCost: await singleYearCost() }
  }

  // 3. Monte Carlo sampling over blokken
  const blockSize = mcBlockDays * 24
  const blocks = []
  for (let i = 0; i < hourlyCosts.length; i += blockSize) {
    blocks.push(hourlyCosts.slice(i, i + blockSize))
  }

  const results: number[] = []
  for (let it = 0; it < mcIterations; it++) {
    let sum = 0
    for (let b = 0; b < blocks.length; b++) {
      const rndBlock = blocks[Math.floor(Math.random() * blocks.length)]
      sum += rndBlock.reduce((a, c) => a + c, 0)
    }
    results.push(sum + fixedCosts)
  }

  results.sort((a, b) => a - b)
  const median = results[Math.floor(results.length * 0.5)]
  const P10 = results[Math.floor(results.length * 0.1)]
  const P90 = results[Math.floor(results.length * 0.9)]
  const mean = results.reduce((a, b) => a + b, 0) / results.length
  const std = Math.sqrt(results.map(r => (r - mean)**2).reduce((a, b) => a + b, 0) / results.length)

  return { median, P10, P90, mean, std }
}

// Helper: CSV-string → Record<ISO, number>
function parseCSV(csv: string): Record<string, number> {
  const result: Record<string, number> = {}
  Papa.parse(csv, {
    header: true,
    skipEmptyLines: true,
    complete: ({ data }) => {
      (data as any[]).forEach(row => {
        const ts = parseISO(row['timestamp'])
        result[ts.toISOString()] = parseFloat(row['price'])
      })
    }
  })
  return result
}
```

---

## Implementatiestappen

1. **Installeer dependencies**  
   `npm install papaparse date-fns`

2. **API‐route**  
   Voeg `pages/api/calculate-cost.ts` toe (zoals specificatie).

3. **Module in `lib/annualCostCalculator.ts`**  
   Implementeer `computeAnnualCost` en `parseCSV` helpers.

4. **Frontend React‐component**  
   - Uploadformulier voor beide CSV’s  
   - Inputs: baseLoad, fixedCosts, jaar, toggle Monte Carlo, iteraties, blokgrootte  
   - Call `/api/calculate-cost` via `fetch`  
   - Toon grafiek (bijv. met `chart.js` of `recharts`) en kerncijfers  

5. **Styling**  
   Gebruik Tailwind voor formulier en resultaten:  
   ```jsx
   <div className="max-w-xl mx-auto p-4">
     {/* form elements */}
     <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
       Bereken kosten
     </button>
   </div>
   ```

6. **Testing & Validatie**  
   - Unit tests voor CSV‐parsing, kostenberekening (Jest)  
   - E2E test via Cypress voor volledige flow  

---

## Voorbeeldcurl

```bash
curl -X POST /api/calculate-cost \
  -H 'Content-Type: application/json' \
  --data @- <<EOF
{
  "csvData2024": "<inhoud_prijzen_2024.csv>",
  "csvData2025": "<inhoud_prijzen_2025.csv>",
  "baseLoad": 1.2,
  "fixedCosts": 75,
  "year": "2025",
  "monteCarlo": true,
  "mcIterations": 1000,
  "mcBlockDays": 7
}
EOF
```

**Response**  
```json
{ "median": 1280.5, "P10": 980.2, "P90": 1500.1, "mean": 1275.0, "std": 120.3 }
```

---

## Extra uitbreidingen
- Temperatuur‐API (Next.js server‐side fetch KNMI) voor `wpProfile`  
- EV‐oplaadsoptimalisatie met `js‐lpsolve` of `glpk.js`  
- Integratie PV‐data + thuisbatterij   
- Score-dashboard & fan-chart met Tailwind-UI  

---

Lever deze briefing in aan Cursor om direct te starten met de Next.js/TypeScript-implementatie van de kostencalculator.