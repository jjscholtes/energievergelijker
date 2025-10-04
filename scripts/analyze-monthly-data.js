const fs = require('fs');

// Analyze CSV data per month and generate simplified data
function analyzeMonthlyData() {
  const csv2024 = fs.readFileSync('jeroen_punt_nl_dynamische_stroomprijzen_jaar_2024.csv', 'utf8');
  const csv2025 = fs.readFileSync('jeroen_punt_nl_dynamische_stroomprijzen_jaar_2025.csv', 'utf8');
  
  function parseCSV(csvContent, year) {
    const lines = csvContent.split('\n');
    const monthlyData = {};
    
    // Skip header
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const parts = line.split(';');
      if (parts.length < 3) continue;
      
      const dateStr = parts[0].replace(/"/g, '');
      const priceStr = parts[2].replace(/"/g, '').replace(',', '.');
      
      const date = new Date(dateStr);
      const month = date.getMonth() + 1;
      const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const hour = date.getHours();
      const price = parseFloat(priceStr);
      
      // Only include positive prices
      if (price > 0) {
        if (!monthlyData[month]) {
          monthlyData[month] = {
            allPrices: [],
            hourlyPrices: {},
            dailyPrices: {}
          };
        }
        
        // Store all prices for this month
        monthlyData[month].allPrices.push(price);
        
        // Store hourly prices
        if (!monthlyData[month].hourlyPrices[hour]) {
          monthlyData[month].hourlyPrices[hour] = [];
        }
        monthlyData[month].hourlyPrices[hour].push(price);
        
        // Store daily prices (0 = Sunday, 1 = Monday, etc.)
        if (!monthlyData[month].dailyPrices[dayOfWeek]) {
          monthlyData[month].dailyPrices[dayOfWeek] = [];
        }
        monthlyData[month].dailyPrices[dayOfWeek].push(price);
      }
    }
    
    return monthlyData;
  }
  
  const data2024 = parseCSV(csv2024, 2024);
  const data2025 = parseCSV(csv2025, 2025);
  
  function generateMonthlyStats(monthlyData, year) {
    const result = {};
    
    Object.keys(monthlyData).forEach(month => {
      const monthData = monthlyData[month];
      const allPrices = monthData.allPrices;
      
      if (allPrices.length === 0) return;
      
      // Calculate monthly stats
      const avgPrice = allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length;
      const minPrice = Math.min(...allPrices);
      const maxPrice = Math.max(...allPrices);
      
      // Calculate hourly averages for this month
      const hourlyAverages = {};
      Object.keys(monthData.hourlyPrices).forEach(hour => {
        const hourPrices = monthData.hourlyPrices[hour];
        hourlyAverages[hour] = hourPrices.reduce((sum, price) => sum + price, 0) / hourPrices.length;
      });
      
      // Calculate daily averages for this month (Monday to Sunday)
      const dailyAverages = {};
      Object.keys(monthData.dailyPrices).forEach(dayOfWeek => {
        const dayPrices = monthData.dailyPrices[dayOfWeek];
        dailyAverages[dayOfWeek] = dayPrices.reduce((sum, price) => sum + price, 0) / dayPrices.length;
      });
      
      result[month] = {
        month: parseInt(month),
        monthName: getMonthName(parseInt(month)),
        average: Math.round(avgPrice * 1000) / 1000,
        minimum: Math.round(minPrice * 1000) / 1000,
        maximum: Math.round(maxPrice * 1000) / 1000,
        hourlyAverages: hourlyAverages,
        dailyAverages: dailyAverages,
        dataPoints: allPrices.length
      };
    });
    
    return result;
  }
  
  function getMonthName(month) {
    const names = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 
                   'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
    return names[month - 1];
  }
  
  const stats2024 = generateMonthlyStats(data2024, 2024);
  const stats2025 = generateMonthlyStats(data2025, 2025);
  
  // Generate TypeScript code
  const tsCode = `// Generated from real CSV data analysis - Monthly statistics
export interface MonthlyStats {
  month: number;
  monthName: string;
  average: number;
  minimum: number;
  maximum: number;
  hourlyAverages: { [hour: number]: number };
  dailyAverages: { [dayOfWeek: number]: number };
  dataPoints: number;
}

export interface YearlyData {
  [month: number]: MonthlyStats;
}

// Real market data from 2024 CSV analysis
export const MONTHLY_DATA_2024: YearlyData = {
${Object.keys(stats2024).map(month => {
  const stats = stats2024[month];
  return `  ${month}: {
    month: ${stats.month},
    monthName: "${stats.monthName}",
    average: ${stats.average},
    minimum: ${stats.minimum},
    maximum: ${stats.maximum},
    hourlyAverages: {
${Object.keys(stats.hourlyAverages).map(hour => 
      `      ${hour}: ${stats.hourlyAverages[hour].toFixed(6)}`
    ).join(',\n')}
    },
    dailyAverages: {
${Object.keys(stats.dailyAverages).map(day => 
      `      ${day}: ${stats.dailyAverages[day].toFixed(6)}`
    ).join(',\n')}
    },
    dataPoints: ${stats.dataPoints}
  }`;
}).join(',\n')}
};

// Real market data from 2025 CSV analysis
export const MONTHLY_DATA_2025: YearlyData = {
${Object.keys(stats2025).map(month => {
  const stats = stats2025[month];
  return `  ${month}: {
    month: ${stats.month},
    monthName: "${stats.monthName}",
    average: ${stats.average},
    minimum: ${stats.minimum},
    maximum: ${stats.maximum},
    hourlyAverages: {
${Object.keys(stats.hourlyAverages).map(hour => 
      `      ${hour}: ${stats.hourlyAverages[hour].toFixed(6)}`
    ).join(',\n')}
    },
    dailyAverages: {
${Object.keys(stats.dailyAverages).map(day => 
      `      ${day}: ${stats.dailyAverages[day].toFixed(6)}`
    ).join(',\n')}
    },
    dataPoints: ${stats.dataPoints}
  }`;
}).join(',\n')}
};

export function getMonthlyData(year: number): YearlyData {
  return year === 2025 ? MONTHLY_DATA_2025 : MONTHLY_DATA_2024;
}

export function getMonthStats(year: number, month: number): MonthlyStats | null {
  const data = getMonthlyData(year);
  return data[month] || null;
}

export function getHourlyDataForMonth(year: number, month: number): { hour: number; price: number }[] {
  const monthStats = getMonthStats(year, month);
  if (!monthStats) return [];
  
  return Object.keys(monthStats.hourlyAverages).map(hour => ({
    hour: parseInt(hour),
    price: monthStats.hourlyAverages[parseInt(hour)]
  })).sort((a, b) => a.hour - b.hour);
}

export function getDailyDataForMonth(year: number, month: number): { dayOfWeek: number; dayName: string; price: number }[] {
  const monthStats = getMonthStats(year, month);
  if (!monthStats) return [];
  
  const dayNames = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
  
  return Object.keys(monthStats.dailyAverages).map(dayOfWeek => ({
    dayOfWeek: parseInt(dayOfWeek),
    dayName: dayNames[parseInt(dayOfWeek)],
    price: monthStats.dailyAverages[parseInt(dayOfWeek)]
  })).sort((a, b) => a.dayOfWeek - b.dayOfWeek);
}`;

  fs.writeFileSync('src/lib/data/monthlyPriceData.ts', tsCode);
  
  console.log('✅ Generated monthly price data analysis!');
  console.log(`📊 2024 data: ${Object.keys(stats2024).length} months analyzed`);
  console.log(`📊 2025 data: ${Object.keys(stats2025).length} months analyzed`);
  
  // Print some sample stats
  console.log('\n📈 Sample 2024 data:');
  Object.keys(stats2024).slice(0, 3).forEach(month => {
    const stats = stats2024[month];
    console.log(`${stats.monthName}: avg €${stats.average.toFixed(3)}, min €${stats.minimum.toFixed(3)}, max €${stats.maximum.toFixed(3)}`);
  });
}

analyzeMonthlyData();
