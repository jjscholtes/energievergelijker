import { Metadata } from 'next';
import { DayAheadPrijzenPage } from '@/components/DayAheadPrijzenPage';

export const metadata: Metadata = {
  title: "Day-Ahead Stroomprijzen | Live EPEX Spotprijzen Vandaag & Morgen | Energievergelijker",
  description: "Bekijk de actuele day-ahead stroomprijzen per uur. Live EPEX spotmarkt prijzen voor vandaag en morgen. Historische data tot 1 jaar terug. Ontdek wanneer stroom het goedkoopst is.",
  keywords: "day ahead prijzen, stroomprijzen vandaag, EPEX spotprijzen, dynamische energieprijzen per uur, spotmarkt elektriciteit, uurprijzen stroom, energieprijzen morgen, goedkoopste uur stroom, negatieve stroomprijzen, energiezero prijzen",
  openGraph: {
    title: "Day-Ahead Stroomprijzen | Live EPEX Spotprijzen",
    description: "Bekijk de actuele day-ahead stroomprijzen per uur. Live EPEX spotmarkt prijzen met historische data tot 1 jaar terug.",
    url: 'https://besteenergiecontract.nl/dayaheadprijzen',
    siteName: 'Beste Energiecontract',
    locale: 'nl_NL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Day-Ahead Stroomprijzen | Live EPEX Spotprijzen",
    description: "Actuele day-ahead stroomprijzen per uur. Zie wanneer stroom het goedkoopst is.",
  },
  alternates: {
    canonical: 'https://besteenergiecontract.nl/dayaheadprijzen',
  },
};

export default function DayAheadPrijzenRoute() {
  return <DayAheadPrijzenPage />;
}

