import { Metadata } from 'next';
import { DynamicPricingPage } from '@/components/DynamicPricingPage';

export const metadata: Metadata = {
  title: "Dynamische Energieprijzen | Actuele Uurprijzen, Kosten & Besparen | Energievergelijker",
  description: "Ontdek actuele dynamische energieprijzen per uur en seizoen. Zie wanneer stroom het goedkoopst is en bespaar tot €300/jaar. Compleet overzicht met historische data.",
  keywords: "dynamische energieprijzen, uurprijzen stroom, spotmarkt prijzen vandaag, wanneer is stroom goedkoop, dynamisch energiecontract kosten, besparen dynamische prijzen, negatieve stroomprijzen, energieprijzen per uur, EPEX spotprijzen Nederland, beste tijdstip stroom verbruiken, load shifting energie",
  openGraph: {
    title: "Dynamische Energieprijzen | Complete Gids & Actuele Uurprijzen",
    description: "Ontdek wanneer stroom het goedkoopst is en bespaar tot €300/jaar met dynamische energieprijzen. Inclusief historische trends en praktijkvoorbeelden.",
    url: 'https://besteenergiecontract.nl/dynamische-prijzen',
    siteName: 'Beste Energiecontract',
    locale: 'nl_NL',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Dynamische Energieprijzen | Actuele Uurprijzen & Besparing",
    description: "Zie wanneer stroom het goedkoopst is. Bespaar tot €300/jaar met onze complete prijsanalyse.",
  },
  alternates: {
    canonical: 'https://besteenergiecontract.nl/dynamische-prijzen',
  },
};

export default function DynamicPricingPageRoute() {
  return <DynamicPricingPage />;
}
