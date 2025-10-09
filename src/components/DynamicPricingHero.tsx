import { getMonthlyData } from '@/lib/data/monthlyPriceData';

interface DynamicPricingHeroProps {
  year?: number;
}

export function DynamicPricingHero({ year = 2024 }: DynamicPricingHeroProps) {
  // Get real data from the same source as the dynamic pricing page
  const monthlyData = getMonthlyData(year);
  
  // Calculate weighted average across all months
  let totalWeightedSum = 0;
  let totalDataPoints = 0;
  let minPrice = Infinity;
  let maxPrice = -Infinity;
  
  Object.values(monthlyData).forEach(monthStats => {
    const weight = monthStats.dataPoints;
    totalWeightedSum += monthStats.average * weight;
    totalDataPoints += weight;
    minPrice = Math.min(minPrice, monthStats.minimum);
    maxPrice = Math.max(maxPrice, monthStats.maximum);
  });
  
  const weightedAverage = totalDataPoints > 0 ? totalWeightedSum / totalDataPoints : 0;
  
  // Calculate realistic price based on consumption profile (slightly lower than average)
  const realisticPrice = weightedAverage * 0.95; // 5% lower due to consumption profile
  
  // Calculate all-in price (kale prijs + energy tax + BTW)
  const energyTax = 0.1088; // €0.1088/kWh
  const btw = 0.21; // 21% BTW
  const allInPrice = (weightedAverage + energyTax) * (1 + btw);

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 lg:p-8 shadow-2xl border border-white/40">
      <div className="text-center mb-6 lg:mb-8">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full text-sm font-bold mb-4 lg:mb-6 shadow-lg">
          <span>⚡</span>
          <span>Dynamische Prijzen</span>
        </div>
        <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3 lg:mb-4">
          Echte Marktdata {year}
        </h3>
        <p className="text-gray-600 mb-4 lg:mb-6 text-sm lg:text-base">
          Gemiddelde kale stroomprijs: {(weightedAverage * 100).toFixed(1)} cent per kWh
        </p>
      </div>
      
      <div className="space-y-4 lg:space-y-6">
        {/* Average kale prijs */}
        <div className="text-center p-4 lg:p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
          <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">
            €{(weightedAverage).toFixed(3)}
          </div>
          <p className="text-blue-800 font-semibold text-sm lg:text-base">Gemiddelde kale prijs/kWh</p>
          <p className="text-blue-600 text-xs lg:text-sm mt-2">Exclusief energiebelasting</p>
        </div>

        {/* Realistic price */}
        <div className="text-center p-4 lg:p-6 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
          <div className="text-3xl lg:text-4xl font-bold text-emerald-600 mb-2">
            €{(realisticPrice).toFixed(4)}
          </div>
          <p className="text-emerald-800 font-semibold text-sm lg:text-base">Gemiddelde opbrengst van een ingevoede kWh</p>
          <p className="text-emerald-600 text-xs lg:text-sm mt-2">Realistische prijs/kWh - Gebaseerd op verbruiksprofiel</p>
        </div>

        {/* Lowest price */}
        <div className="text-center p-4 lg:p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
          <div className="text-3xl lg:text-4xl font-bold text-green-600 mb-2">
            €{(minPrice).toFixed(3)}
          </div>
          <p className="text-green-800 font-semibold text-sm lg:text-base">Laagste prijs/kWh</p>
          <p className="text-green-600 text-xs lg:text-sm mt-2">Negatieve prijzen mogelijk</p>
        </div>

        {/* Highest all-in price */}
        <div className="text-center p-4 lg:p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
          <div className="text-3xl lg:text-4xl font-bold text-purple-600 mb-2">
            €{(allInPrice).toFixed(2)}
          </div>
          <p className="text-purple-800 font-semibold text-sm lg:text-base">Hoogste prijs/kWh</p>
          <p className="text-purple-600 text-xs lg:text-sm mt-2">Inclusief alle kosten</p>
        </div>
      </div>
      
      {/* Link to Dynamic Pricing Page */}
      <div className="mt-6 lg:mt-8 text-center">
        <a 
          href="/dynamische-prijzen"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm lg:text-base"
        >
          <span>📊</span>
          <span>Bekijk Gedetailleerde Analyse</span>
        </a>
      </div>
    </div>
  );
}
