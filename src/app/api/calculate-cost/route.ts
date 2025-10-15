import { NextRequest, NextResponse } from 'next/server';
import { computeAnnualCost } from '@/lib/calculations/annualCostCalculator';
import { DynamicCalcParams, DynamicCostResult } from '@/types/dynamicContracts';

export async function POST(request: NextRequest) {
  try {
    const params: DynamicCalcParams = await request.json();
    
    // Validatie van input parameters
    if (!params.csvData2024 || !params.csvData2025) {
      return NextResponse.json(
        { error: 'CSV data voor beide jaren is vereist' },
        { status: 400 }
      );
    }
    
    if (params.baseLoad < 0) {
      return NextResponse.json(
        { error: 'BaseLoad moet positief zijn' },
        { status: 400 }
      );
    }
    
    if (params.monteCarlo && (params.mcIterations || 0) < 10) {
      return NextResponse.json(
        { error: 'Monte Carlo iteraties moeten minimaal 10 zijn' },
        { status: 400 }
      );
    }
    
    const result: DynamicCostResult = await computeAnnualCost(params);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Onbekende fout bij berekening' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      message: 'Dynamic Cost Calculator API',
      endpoints: {
        POST: '/api/calculate-cost',
        description: 'Bereken jaarlijkse kosten voor dynamische contracten'
      }
    },
    { status: 200 }
  );
}


