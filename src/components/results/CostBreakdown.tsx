'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BerekeningResult } from '@/types/calculations';

interface CostBreakdownProps {
  result: BerekeningResult;
}

export function CostBreakdown({ result }: CostBreakdownProps) {
  const { stroomKosten, gasKosten, pvOpbrengsten } = result;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Gedetailleerde Kostenopbouw</CardTitle>
        <p className="text-sm text-muted-foreground">
          Overzicht van alle kostencomponenten voor {result.contract.leverancier}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Stroomkosten */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            ⚡ Stroomkosten
          </h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Kale energie prijs</span>
              <span>€{stroomKosten.kaleEnergie.toFixed(2)}</span>
            </div>
            <div className="text-xs text-gray-500 ml-4">
              {result.contract.type === 'dynamisch' ? (
                <div>Verbruik × spotprijs = {result.userProfile?.jaarverbruikStroom || 0} kWh × €{result.contract.tarieven?.stroomKalePrijs?.toFixed(4) || '0.0000'} (gemiddelde spotprijs)</div>
              ) : (
                // Voor vaste contracten: toon piek/dal tarieven als beschikbaar
                result.contract.tarieven?.stroomKalePrijsPiek && result.contract.tarieven?.stroomKalePrijsDal ? (
                  <div className="space-y-1">
                    <div>Normaal: {result.userProfile?.jaarverbruikStroomPiek || 0} kWh × €{result.contract.tarieven.stroomKalePrijsPiek.toFixed(4)} = €{((result.userProfile?.jaarverbruikStroomPiek || 0) * result.contract.tarieven.stroomKalePrijsPiek).toFixed(2)}</div>
                    <div>Dal: {result.userProfile?.jaarverbruikStroomDal || 0} kWh × €{result.contract.tarieven.stroomKalePrijsDal.toFixed(4)} = €{((result.userProfile?.jaarverbruikStroomDal || 0) * result.contract.tarieven.stroomKalePrijsDal).toFixed(2)}</div>
                  </div>
                ) : (
                  <div>Verbruik × kale prijs = {result.userProfile?.jaarverbruikStroom || 0} kWh × €{result.contract.tarieven?.stroomKalePrijs?.toFixed(4) || '0.0000'}</div>
                )
              )}
            </div>
            
            <div className="flex justify-between">
              <span>Energiebelasting (incl. BTW)</span>
              <span>€{stroomKosten.energiebelasting.toFixed(2)}</span>
            </div>
            <div className="text-xs text-gray-500 ml-4">
              Verbruik × energiebelasting = {result.userProfile?.jaarverbruikStroom || 0} kWh × €0.1316
            </div>
            
            <div className="flex justify-between">
              <span>Netbeheerkosten</span>
              <span>€{stroomKosten.netbeheer.toFixed(2)}</span>
            </div>
            <div className="text-xs text-gray-500 ml-4">
              Vast bedrag per jaar (gemiddelde netbeheerders)
            </div>
            
            <div className="flex justify-between text-green-600 font-semibold">
              <span>Vermindering energiebelasting</span>
              <span>-€631.35</span>
            </div>
            <div className="text-xs text-gray-500 ml-4">
              Vaste heffingskorting per jaar
            </div>
            
            {/* Vaste leveringskosten (alleen voor vaste contracten) */}
            {result.contract.type === 'vast' && stroomKosten.vasteLeveringskosten && stroomKosten.vasteLeveringskosten > 0 && (
              <>
                <div className="flex justify-between">
                  <span>Vaste leveringskosten</span>
                  <span>€{stroomKosten.vasteLeveringskosten.toFixed(2)}</span>
                </div>
                <div className="text-xs text-gray-500 ml-4">
                  €{stroomKosten.vasteLeveringskostenTarief?.toFixed(2) || '0.00'}/maand × 12 maanden
                </div>
              </>
            )}
            
            {/* Dynamische contracten extra kosten */}
            {result.contract.type === 'dynamisch' && (
              <>
                {stroomKosten.maandelijkseVergoeding && stroomKosten.maandelijkseVergoeding > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span>Maandelijkse vergoeding</span>
                      <span>€{stroomKosten.maandelijkseVergoeding.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-gray-500 ml-4">
                      €{stroomKosten.maandelijkseVergoedingTarief?.toFixed(2) || '0.00'}/maand × 12 maanden
                    </div>
                  </>
                )}
                
                {stroomKosten.opslagPerKwh && stroomKosten.opslagPerKwh > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span>Opslag per kWh</span>
                      <span>€{stroomKosten.opslagPerKwh.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-gray-500 ml-4">
                      {result.userProfile?.jaarverbruikStroom || 0} kWh × €{stroomKosten.opslagPerKwhTarief?.toFixed(3) || '0.000'}/kWh
                    </div>
                  </>
                )}
              </>
            )}
            
            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>Totaal stroomkosten</span>
              <span>€{stroomKosten.totaal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Gaskosten (alleen als geenGas false is) */}
        {gasKosten.totaal > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              🔥 Gaskosten
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Kale gasprijs</span>
                <span>€{gasKosten.kaleEnergie.toFixed(2)}</span>
              </div>
              <div className="text-xs text-gray-500 ml-4">
                Verbruik × kale prijs = {result.userProfile?.jaarverbruikGas || 0} m³ × €{result.contract.tarieven?.gasKalePrijs.toFixed(2) || '0.00'}
              </div>
              
              <div className="flex justify-between">
                <span>Energiebelasting gas (incl. BTW)</span>
                <span>€{gasKosten.energiebelasting.toFixed(2)}</span>
              </div>
              <div className="text-xs text-gray-500 ml-4">
                Gestaffelde belasting volgens Nederlandse wetgeving
              </div>
              
              <div className="flex justify-between">
                <span>Netbeheerkosten gas</span>
                <span>€{gasKosten.netbeheer.toFixed(2)}</span>
              </div>
              <div className="text-xs text-gray-500 ml-4">
                Vast bedrag per jaar (gemiddelde netbeheerders)
              </div>
              
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Totaal gaskosten</span>
                <span>€{gasKosten.totaal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* PV Opbrengsten (alleen als zonnepanelen) */}
        {pvOpbrengsten && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              ☀️ Zonnepanelen Opbrengsten
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Saldering besparing</span>
                <span className="text-green-600">-€{pvOpbrengsten.salderingsBesparing.toFixed(2)}</span>
              </div>
              <div className="text-xs text-gray-500 ml-4">
                Gesaldeerde kWh × energiebelasting = {pvOpbrengsten.gesaldeerdKwh.toFixed(0)} kWh × €0.1316
              </div>
              
              <div className="flex justify-between">
                <span>Terugleververgoeding</span>
                <span className="text-green-600">-€{pvOpbrengsten.terugleververgoedingBedrag.toFixed(2)}</span>
              </div>
              <div className="text-xs text-gray-500 ml-4">
                Teruggeleverde kWh × terugleververgoeding = {(pvOpbrengsten.nettoTerugleveringKwh + pvOpbrengsten.gesaldeerdKwh).toFixed(0)} kWh × €{result.contract.type === 'dynamisch' ? `${result.contract.tarieven?.terugleververgoeding.toFixed(4) || '0.0000'} (gemiddelde spotprijs)` : '0.01'}
              </div>
              
              {result.contract.type === 'vast' && (
                <>
                  <div className="flex justify-between">
                    <span>Terugleverkosten</span>
                    <span className="text-red-600">€{pvOpbrengsten.terugleverkosten.toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-gray-500 ml-4">
                    Staffel op basis van {(pvOpbrengsten.nettoTerugleveringKwh + pvOpbrengsten.gesaldeerdKwh).toFixed(0)} kWh jaarlijkse teruglevering
                  </div>
                </>
              )}
              
              <div className="border-t pt-2 flex justify-between font-semibold text-green-600">
                <span>Totaal PV opbrengst</span>
                <span>-€{pvOpbrengsten.totaleOpbrengst.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Totaal */}
        <div className="space-y-3 pt-4 border-t-2 border-gray-300">
          <div className="flex justify-between text-lg font-bold">
            <span>Totaal jaarkosten</span>
            <span className="text-blue-600">€{result.totaleJaarkostenMetPv.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between text-sm text-gray-600">
            <span>Maandlasten gemiddeld</span>
            <span>€{result.maandlastenGemiddeld.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
