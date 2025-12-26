import { Metadata } from 'next';
import { DynamischInzichtTool } from '@/components/tool/DynamischInzichtTool';

export const metadata: Metadata = {
  title: "Dynamische Energie Inzicht Tool | Bereken Je Echte Kosten | Energievergelijker",
  description: "Bereken je werkelijke kosten met een dynamisch energiecontract. Geen gemiddelden, maar echte uurprijzen gecombineerd met jouw verbruiksprofiel. Speciaal voor warmtepompen en all-electric woningen.",
  keywords: "dynamisch energiecontract berekenen, warmtepomp stroomkosten, all-electric kosten, NEDU profiel, uurprijzen berekening, dynamische energie simulator, spotprijs calculator, energiekosten warmtepomp",
  openGraph: {
    title: "Dynamische Energie Inzicht Tool | Echte Kostenberekening",
    description: "Bereken je werkelijke kosten met een dynamisch contract. Gebruik historische uurprijzen en jouw specifieke verbruiksprofiel.",
    url: 'https://besteenergiecontract.nl/tool/dynamisch-inzicht',
    siteName: 'Beste Energiecontract',
    locale: 'nl_NL',
    type: 'website',
  },
  alternates: {
    canonical: 'https://besteenergiecontract.nl/tool/dynamisch-inzicht',
  },
};

export default function DynamischInzichtPage() {
  return <DynamischInzichtTool />;
}

