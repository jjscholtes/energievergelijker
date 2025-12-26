// Voorbeeld dynamische contracten met CSV data
import { DynamicContractData } from '@/types/dynamicContracts';

// Voorbeeld CSV data voor 2024 (eerste week januari) - €0.15/kWh gemiddeld
export const sampleCSV2024 = `timestamp,price
2024-01-01T00:00:00Z,0.08
2024-01-01T01:00:00Z,0.07
2024-01-01T02:00:00Z,0.06
2024-01-01T03:00:00Z,0.05
2024-01-01T04:00:00Z,0.04
2024-01-01T05:00:00Z,0.05
2024-01-01T06:00:00Z,0.08
2024-01-01T07:00:00Z,0.12
2024-01-01T08:00:00Z,0.14
2024-01-01T09:00:00Z,0.15
2024-01-01T10:00:00Z,0.16
2024-01-01T11:00:00Z,0.17
2024-01-01T12:00:00Z,0.18
2024-01-01T13:00:00Z,0.19
2024-01-01T14:00:00Z,0.20
2024-01-01T15:00:00Z,0.21
2024-01-01T16:00:00Z,0.22
2024-01-01T17:00:00Z,0.23
2024-01-01T18:00:00Z,0.24
2024-01-01T19:00:00Z,0.25
2024-01-01T20:00:00Z,0.24
2024-01-01T21:00:00Z,0.23
2024-01-01T22:00:00Z,0.21
2024-01-01T23:00:00Z,0.18`;

// Voorbeeld CSV data voor 2025 (eerste week januari) - €0.15/kWh gemiddeld
export const sampleCSV2025 = `timestamp,price
2025-01-01T00:00:00Z,0.085
2025-01-01T01:00:00Z,0.075
2025-01-01T02:00:00Z,0.065
2025-01-01T03:00:00Z,0.055
2025-01-01T04:00:00Z,0.045
2025-01-01T05:00:00Z,0.055
2025-01-01T06:00:00Z,0.085
2025-01-01T07:00:00Z,0.125
2025-01-01T08:00:00Z,0.145
2025-01-01T09:00:00Z,0.155
2025-01-01T10:00:00Z,0.165
2025-01-01T11:00:00Z,0.175
2025-01-01T12:00:00Z,0.185
2025-01-01T13:00:00Z,0.195
2025-01-01T14:00:00Z,0.205
2025-01-01T15:00:00Z,0.215
2025-01-01T16:00:00Z,0.225
2025-01-01T17:00:00Z,0.235
2025-01-01T18:00:00Z,0.245
2025-01-01T19:00:00Z,0.255
2025-01-01T20:00:00Z,0.245
2025-01-01T21:00:00Z,0.235
2025-01-01T22:00:00Z,0.215
2025-01-01T23:00:00Z,0.185`;

export const dynamicContracts: DynamicContractData[] = [
  {
    leverancier: "Tibber",
    productNaam: "Tibber Dynamic",
    type: "dynamisch",
    looptijdMaanden: 1,
    vasteLeveringskosten: 3.95,
    csvData2024: sampleCSV2024,
    csvData2025: sampleCSV2025,
    kortingEenmalig: 0,
    duurzaamheidsScore: 9.0,
    klanttevredenheid: 8.5,
    terugleververgoeding: 0.0, // Dynamische contracten gebruiken spotprijs
    maandelijkseVergoeding: 5.99, // €/maand
    opslagPerKwh: 0.02, // €/kWh voor afname
    opslagInvoeding: 0.023, // €/kWh voor invoeding
    tarieven: {
      gasKalePrijs: 0.63,
      terugleververgoeding: 0.0
    }
  },
  {
    leverancier: "Zonneplan",
    productNaam: "Zonneplan Dynamic",
    type: "dynamisch",
    looptijdMaanden: 1,
    vasteLeveringskosten: 4.50,
    csvData2024: sampleCSV2024,
    csvData2025: sampleCSV2025,
    kortingEenmalig: 0,
    duurzaamheidsScore: 8.8,
    klanttevredenheid: 8.2,
    terugleververgoeding: 0.0, // Dynamische contracten gebruiken spotprijs
    maandelijkseVergoeding: 4.99, // €/maand
    opslagPerKwh: 0.015, // €/kWh voor afname
    opslagInvoeding: 0.02, // €/kWh voor invoeding
    tarieven: {
      gasKalePrijs: 0.60,
      terugleververgoeding: 0.0
    }
  },
  {
    leverancier: "Frank Energie",
    productNaam: "Frank Dynamic",
    type: "dynamisch",
    looptijdMaanden: 1,
    vasteLeveringskosten: 3.50,
    csvData2024: sampleCSV2024,
    csvData2025: sampleCSV2025,
    kortingEenmalig: 0,
    duurzaamheidsScore: 8.5,
    klanttevredenheid: 8.0,
    terugleververgoeding: 0.0, // Dynamische contracten gebruiken spotprijs
    maandelijkseVergoeding: 6.99, // €/maand
    opslagPerKwh: 0.025, // €/kWh voor afname
    opslagInvoeding: 0.025, // €/kWh voor invoeding
    tarieven: {
      gasKalePrijs: 0.65,
      terugleververgoeding: 0.0
    }
  }
];

// Helper functie om meer realistische CSV data te genereren
export function generateRealisticCSVData(year: number, basePrice: number = 0.08): string {
  const hours = [];
  const startDate = new Date(year, 0, 1); // 1 januari
  
  // Genereer data voor het hele jaar (365 dagen)
  for (let day = 0; day < 365; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + day);
      date.setHours(hour, 0, 0, 0);
      
      // Simuleer dag/nacht tarieven en weekend effecten
      let priceMultiplier = 1.0;
      
      // Nacht tarief (00:00-06:00)
      if (hour >= 0 && hour < 6) {
        priceMultiplier = 0.6;
      }
      // Ochtend piek (07:00-09:00)
      else if (hour >= 7 && hour < 9) {
        priceMultiplier = 1.4;
      }
      // Avond piek (17:00-20:00)
      else if (hour >= 17 && hour < 20) {
        priceMultiplier = 1.3;
      }
      
      // Weekend lagere tarieven
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) { // Zondag of zaterdag
        priceMultiplier *= 0.8;
      }
      
      // Seizoenseffecten
      const month = date.getMonth();
      if (month >= 10 || month <= 2) { // Winter (nov-feb)
        priceMultiplier *= 1.1;
      } else if (month >= 6 && month <= 8) { // Zomer (jul-aug)
        priceMultiplier *= 0.9;
      }
      
      // Voeg consistente variatie toe (gebaseerd op dag en uur voor reproduceerbaarheid)
      const dayHourSeed = day * 24 + hour;
      const randomVariation = 0.95 + (Math.sin(dayHourSeed * 0.1) * 0.05); // 0.95 tot 1.05, maar consistent
      const finalPrice = basePrice * priceMultiplier * randomVariation;
      
      hours.push({
        timestamp: date.toISOString(),
        price: finalPrice.toFixed(3)
      });
    }
  }
  
  // Converteer naar CSV string
  const csvHeader = 'timestamp,price\n';
  const csvRows = hours.map(h => `${h.timestamp},${h.price}`).join('\n');
  
  return csvHeader + csvRows;
}
