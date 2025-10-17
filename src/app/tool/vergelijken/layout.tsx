import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Energiecontract Vergelijker | Vergelijk Vaste & Dynamische Contracten 2025',
  description: 'Vergelijk energiecontracten en bereken je exacte jaarkosten. Inclusief zonnepanelen, saldering, netbeheerkosten en belastingen. Vind het beste contract voor jouw situatie.',
  keywords: 'energiecontract vergelijken, contract vergelijker, energiekosten berekenen, vaste contracten, dynamische contracten, zonnepanelen, saldering',
  openGraph: {
    title: 'Energiecontract Vergelijker | Beste Energiecontract',
    description: 'Vergelijk energiecontracten en zie direct welk contract het beste bij jouw situatie past.',
    url: 'https://besteenergiecontract.nl/tool/vergelijken',
    siteName: 'Beste Energiecontract',
    locale: 'nl_NL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Energiecontract Vergelijker',
    description: 'Vergelijk energiecontracten en zie direct welk contract het beste past.',
  },
  alternates: {
    canonical: 'https://besteenergiecontract.nl/tool/vergelijken',
  },
};

export default function VergelijkenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

