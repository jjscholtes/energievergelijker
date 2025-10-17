import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Thuisaccu Terugverdientijd Calculator | Batterij Rendement Berekenen 2025',
  description: 'Bereken wanneer een thuisbatterij zich terugverdient met en zonder saldering. Inclusief eigenverbruik berekening, arbitrage analyse en cashflow visualisatie.',
  keywords: 'thuisaccu, thuisbatterij, terugverdientijd, rendement, saldering 2027, eigenverbruik, arbitrage, batterij calculator',
  openGraph: {
    title: 'Thuisaccu Terugverdientijd Calculator | Beste Energiecontract',
    description: 'Bereken of een thuisbatterij voor jou rendabel is, met en zonder saldering.',
    url: 'https://besteenergiecontract.nl/tool/batterij',
    siteName: 'Beste Energiecontract',
    locale: 'nl_NL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Thuisaccu Terugverdientijd Calculator',
    description: 'Bereken of een thuisbatterij voor jou rendabel is.',
  },
  alternates: {
    canonical: 'https://besteenergiecontract.nl/tool/batterij',
  },
};

export default function BatterijLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

