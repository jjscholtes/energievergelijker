// Centrale product data voor thuisaccu's
// Prijzen worden dynamisch opgehaald via API's

export interface BatteryProduct {
  id: string;
  brand: string;
  title: string;
  slug: string;
  capacity: string;
  power: string;
  cycles: string;
  image: string;
  specs: string[];
  benefits: string[];
  affiliateLink: string;
  // Prijs wordt dynamisch opgehaald
  fallbackPrice: number; // Fallback als API faalt
  apiSource: 'shopify' | 'woocommerce';
  apiUrl: string;
}

export const batteryProducts: Record<string, BatteryProduct> = {
  'homewizard-plug-in-battery': {
    id: 'homewizard-plug-in-battery',
    brand: 'HomeWizard',
    title: 'Plug-In Battery',
    slug: 'plug-in-battery',
    capacity: '2,7 kWh',
    power: '800W',
    cycles: '6000+',
    image: 'https://www.homewizard.com/wp-content/uploads/2024/04/homewizard-battery-front-shop.webp',
    specs: [
      '800W laden/ontladen',
      '6000+ cycli garantie',
      'LiFePO4 technologie',
      'Uitbreidbaar tot 10,8 kWh',
    ],
    benefits: [
      'Plug & Play - geen installatie',
      '0% kobalt en mangaan',
      'HomeWizard Energy app',
      'Directe meterkoppeling',
    ],
    affiliateLink: 'https://partner.homewizard.com/c/?si=18407&li=1796617&wi=413683&pid=077737e0c2bdb1b4a9a089aa6c853bf2&dl=nl%2Fshop%2Fplug-in-battery%2F&ws=',
    fallbackPrice: 1395,
    apiSource: 'woocommerce',
    apiUrl: 'https://www.homewizard.com/wp-json/wc/store/v1/products?slug=plug-in-battery',
  },
  'zendure-solarflow-hyper-2000': {
    id: 'zendure-solarflow-hyper-2000',
    brand: 'Zendure',
    title: 'SolarFlow Hyper 2000',
    slug: 'solarflow-hyper-2000',
    capacity: '1,92 kWh',
    power: '800W',
    cycles: '6000+',
    image: 'https://cdn.shopify.com/s/files/1/0643/8568/3256/files/Untitleddesign_21_1296x.png',
    specs: [
      '800W output',
      '90% round-trip efficiency',
      'LiFePO4 batterij',
      'Uitbreidbaar tot 7,68 kWh',
    ],
    benefits: [
      'Modulair systeem',
      'Slimme P1 meter integratie',
      'Balkonkraftwerk geschikt',
      'Bifaciale panelen support',
    ],
    affiliateLink: 'https://zendure.nl/collections/solarflow-series/products/solarflow-hyper-2000?utm_source=energievergelijker&utm_medium=referral&utm_campaign=thuisaccu-tool',
    fallbackPrice: 959,
    apiSource: 'shopify',
    apiUrl: 'https://eu.zendure.com/products/solarflow-hyper-2000.json',
  },
};

export type BatteryProductId = keyof typeof batteryProducts;

