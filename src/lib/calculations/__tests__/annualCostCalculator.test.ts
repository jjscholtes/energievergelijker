import { computeAnnualCost } from '../annualCostCalculator';

const csvData2024 = `timestamp,price\n2024-01-01T00:00:00Z,0.12\n2024-01-01T01:00:00Z,0.15\n2024-01-01T02:00:00Z,0.18`;
const csvData2025 = `timestamp,price\n2025-01-01T00:00:00Z,0.10\n2025-01-01T01:00:00Z,0.11\n2025-01-01T02:00:00Z,0.12`;

describe('annualCostCalculator', () => {
  it('returns Monte Carlo statistieken wanneer aangevraagd', async () => {
    const result = await computeAnnualCost({
      csvData2024,
      csvData2025,
      baseLoad: 1.2,
      fixedCosts: 100,
      year: '2024',
      monteCarlo: true,
      mcIterations: 20,
      mcBlockDays: 1
    });

    expect(result.median).toBeDefined();
    expect(result.P10).toBeDefined();
    expect(result.P90).toBeDefined();
    expect(result.mean).toBeDefined();
    expect(result.std).toBeGreaterThanOrEqual(0);
  });

  it('gooit een fout bij onbruikbare CSV-data', async () => {
    await expect(
      computeAnnualCost({
        csvData2024: '',
        csvData2025: '',
        baseLoad: 1,
        fixedCosts: 0,
        year: '2024'
      })
    ).rejects.toThrow('Geen geldige prijsdata gevonden in CSV');
  });
});

