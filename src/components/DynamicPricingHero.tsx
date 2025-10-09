import { getMonthlyData } from '@/lib/data/monthlyPriceData';

interface DynamicPricingHeroProps {
  year?: number;
}

export function DynamicPricingHero({ year }: DynamicPricingHeroProps) {
  // Use current year if no year specified, fallback to 2024 if no data available
  const currentYear = new Date().getFullYear();
  const targetYear = year || currentYear;
  
  // Try to get data for current year, fallback to 2024 if not available
  let monthlyData = getMonthlyData(targetYear);
  if (!monthlyData || Object.keys(monthlyData).length === 0) {
    monthlyData = getMonthlyData(2024);
  }
  
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
  
  // Calculate all-in prices (kale prijs + energy tax + BTW)
  const energyTax = 0.1088; // €0.1088/kWh
  const btw = 0.21; // 21% BTW
  
  // Calculate total prices for each category
  const averageTotal = (weightedAverage + energyTax) * (1 + btw);
  const minTotal = (minPrice + energyTax) * (1 + btw);
  const maxTotal = (maxPrice + energyTax) * (1 + btw);

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 lg:p-8 shadow-2xl border border-white/40">
      <div className="text-center mb-6 lg:mb-8">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full text-sm font-bold mb-4 lg:mb-6 shadow-lg">
          <span>⚡</span>
          <span>Dynamische Prijzen</span>
        </div>
        <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3 lg:mb-4">
          Echte Marktdata {Object.keys(monthlyData).length > 0 ? targetYear : 2024}
        </h3>
        <p className="text-gray-600 mb-4 lg:mb-6 text-sm lg:text-base">
          Gemiddelde kale stroomprijs: {(weightedAverage * 100).toFixed(1)} cent per kWh
        </p>
      </div>
      
      <div className="space-y-4 lg:space-y-6">
        {/* Gemiddelde Prijs */}
        <div className="text-center p-4 lg:p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
          <h4 className="text-lg font-bold text-blue-800 mb-3">Gemiddelde Prijs</h4>
          <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">
            €{(weightedAverage).toFixed(3)}/kWh
          </div>
          <p className="text-blue-600 text-xs lg:text-sm mb-2">Exclusief energiebelasting</p>
          <p className="text-blue-800 font-semibold text-sm lg:text-base">
            Totaal: €{(averageTotal).toFixed(3)}/kWh
          </p>
        </div>

        {/* Laagste Prijs */}
        <div className="text-center p-4 lg:p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
          <h4 className="text-lg font-bold text-green-800 mb-3">Laagste Prijs</h4>
          <div className="text-3xl lg:text-4xl font-bold text-green-600 mb-2">
            €{(minPrice).toFixed(3)}/kWh
          </div>
          <p className="text-green-600 text-xs lg:text-sm mb-2">Exclusief energiebelasting</p>
          <p className="text-green-800 font-semibold text-sm lg:text-base">
            Totaal: €{(minTotal).toFixed(3)}/kWh
          </p>
        </div>

        {/* Hoogste Prijs */}
        <div className="text-center p-4 lg:p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
          <h4 className="text-lg font-bold text-purple-800 mb-3">Hoogste Prijs</h4>
          <div className="text-3xl lg:text-4xl font-bold text-purple-600 mb-2">
            €{(maxPrice).toFixed(3)}/kWh
          </div>
          <p className="text-purple-600 text-xs lg:text-sm mb-2">Exclusief energiebelasting</p>
          <p className="text-purple-800 font-semibold text-sm lg:text-base">
            Totaal: €{(maxTotal).toFixed(3)}/kWh
          </p>
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
