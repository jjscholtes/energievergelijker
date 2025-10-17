import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Energie Tools | Contract Vergelijker & Dynamische Prijzen | Beste Energiecontract',
  description: 'Gebruik onze gratis energie tools om contracten te vergelijken, dynamische prijzen te checken en de terugverdientijd van een thuisaccu te berekenen. Snel en nauwkeurig.',
  keywords: 'energie tools, contract vergelijker, dynamische prijzen, thuisaccu calculator, energiecontract vergelijken, energie besparen',
  openGraph: {
    title: 'Energie Tools | Beste Energiecontract',
    description: 'Gratis tools om energiecontracten te vergelijken en kosten te berekenen.',
    url: 'https://besteenergiecontract.nl/tool',
    siteName: 'Beste Energiecontract',
    locale: 'nl_NL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Energie Tools | Beste Energiecontract',
    description: 'Gratis tools om energiecontracten te vergelijken en kosten te berekenen.',
  },
  alternates: {
    canonical: 'https://besteenergiecontract.nl/tool',
  },
};

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

