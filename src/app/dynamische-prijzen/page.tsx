import { Metadata } from 'next';
import { DynamicPricingPage } from '@/components/DynamicPricingPage';

export const metadata: Metadata = {
  title: "Dynamische Energieprijzen | Beste Energiecontract",
  description: "Ontdek de werkelijke dynamische energieprijzen per maand. Bekijk gemiddelde, hoogste en laagste prijzen per maand en per dag van de week.",
  keywords: "dynamische energieprijzen, spotmarkt prijzen, energieprijzen per maand, energieprijzen per dag, energieprijzen 2024, energieprijzen 2025",
};

export default function DynamicPricingPageRoute() {
  return <DynamicPricingPage />;
}
