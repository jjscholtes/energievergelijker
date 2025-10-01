'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BerekeningResult } from '@/types/calculations';
import { CostBreakdown } from './CostBreakdown';

interface ResultCardProps {
  result: BerekeningResult;
  rank: number;
}

export function ResultCard({ result, rank }: ResultCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const isBestDeal = rank === 1;
  
  return (
    <div className="space-y-4">
      <Card className={`${isBestDeal ? 'ring-2 ring-green-500' : ''} relative`}>
        {isBestDeal && (
          <Badge className="absolute -top-2 left-4 bg-green-500">
            Beste Deal
          </Badge>
        )}
        
        <CardHeader>
          <div className="flex justify-between">
            <div>
              <CardTitle className="text-lg">{result.contract.leverancier}</CardTitle>
              <p className="text-sm text-muted-foreground">{result.contract.productNaam}</p>
              <p className="text-xs text-muted-foreground capitalize">{result.contract.type}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                €{result.totaleJaarkostenMetPv.toFixed(0)}
              </div>
              <div className="text-sm text-muted-foreground">per jaar</div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Maandlasten</span>
              <span className="text-sm font-medium">€{result.maandlastenGemiddeld.toFixed(0)}</span>
            </div>
            
            {result.pvOpbrengsten && (
              <div className="flex justify-between text-green-600">
                <span className="text-sm">PV Opbrengst</span>
                <span className="text-sm font-medium">-€{result.pvOpbrengsten.totaleOpbrengst.toFixed(0)}</span>
              </div>
            )}
            
            {rank > 1 && (
              <div className="flex justify-between text-red-600">
                <span className="text-sm">Duurder dan beste</span>
                <span className="text-sm font-medium">+€{result.verschilMetGoedkoopste.toFixed(0)}</span>
              </div>
            )}
          </div>
          
          <Button 
            className="w-full mt-4" 
            variant="outline"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Verberg Details' : 'Bekijk Details'}
          </Button>
        </CardContent>
      </Card>

      {showDetails && (
        <CostBreakdown result={result} />
      )}
    </div>
  );
}

