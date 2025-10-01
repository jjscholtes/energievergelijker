import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Energievergelijker voor Zonnepanelen | Vergelijk Energiecontracten 2024",
  description: "De specialistische energievergelijker voor zonnepanelen eigenaren. Vergelijk energiecontracten met accurate salderingsberekeningen en vind de beste terugleververgoeding. Bespaar tot €800 per jaar!",
  keywords: "energievergelijker, zonnepanelen, energiecontract, saldering, teruglevering, energie besparen, groene energie, Nederlandse energieleveranciers",
  authors: [{ name: "Energievergelijker" }],
  creator: "Energievergelijker",
  publisher: "Energievergelijker",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://energievergelijker.nl'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Energievergelijker voor Zonnepanelen | Vergelijk Energiecontracten 2024",
    description: "De specialistische energievergelijker voor zonnepanelen eigenaren. Vergelijk energiecontracten met accurate salderingsberekeningen.",
    url: 'https://energievergelijker.nl',
    siteName: 'Energievergelijker',
    locale: 'nl_NL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Energievergelijker voor Zonnepanelen | Vergelijk Energiecontracten 2024",
    description: "De specialistische energievergelijker voor zonnepanelen eigenaren. Vergelijk energiecontracten met accurate salderingsberekeningen.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  category: 'energy comparison',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Energievergelijker voor Zonnepanelen",
    "description": "De specialistische energievergelijker voor zonnepanelen eigenaren. Vergelijk energiecontracten met accurate salderingsberekeningen.",
    "url": "https://energievergelijker.nl",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR"
    },
    "featureList": [
      "Energiecontracten vergelijken",
      "Salderingsberekeningen",
      "Zonnepanelen ondersteuning",
      "Warmtepomp berekeningen",
      "Elektrische auto ondersteuning",
      "Dynamische contracten"
    ],
    "provider": {
      "@type": "Organization",
      "name": "Energievergelijker",
      "url": "https://energievergelijker.nl"
    }
  };

  return (
    <html lang="nl">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
