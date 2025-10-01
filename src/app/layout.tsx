import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

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
  keywords: "energievergelijker, zonnepanelen, energiecontract, saldering, teruglevering, energie besparen, groene energie, Nederlandse energieleveranciers, warmtepomp energiecontract, elektrische auto energie, dynamisch energiecontract, vast energiecontract, terugleververgoeding vergelijking, energiebelasting besparen, netbeheerkosten, beste energieleverancier zonnepanelen, energiecontract vergelijking 2024, salderingsberekening, teruglevering stroom, energieprijzen vergelijken",
  authors: [{ name: "Energievergelijker" }],
  creator: "Energievergelijker",
  publisher: "Energievergelijker",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://besteenergiecontract.nl'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Energievergelijker voor Zonnepanelen | Vergelijk Energiecontracten 2024",
    description: "De specialistische energievergelijker voor zonnepanelen eigenaren. Vergelijk energiecontracten met accurate salderingsberekeningen.",
    url: 'https://besteenergiecontract.nl',
    siteName: 'Beste Energiecontract',
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
    "description": "De specialistische energievergelijker voor zonnepanelen eigenaren. Vergelijk energiecontracten met accurate salderingsberekeningen en vind de beste terugleververgoeding. Bespaar tot €800 per jaar!",
    "url": "https://besteenergiecontract.nl",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR",
      "description": "Gratis energiecontract vergelijking"
    },
    "featureList": [
      "Energiecontracten vergelijken",
      "Salderingsberekeningen voor zonnepanelen",
      "Terugleververgoeding vergelijking",
      "Warmtepomp energie berekeningen",
      "Elektrische auto ondersteuning",
      "Dynamische energiecontracten",
      "Vaste energiecontracten",
      "Netbeheerkosten berekening",
      "Energiebelasting berekening",
      "BTW berekening energie"
    ],
    "keywords": "energievergelijker, zonnepanelen, energiecontract, saldering, teruglevering, energie besparen, groene energie, Nederlandse energieleveranciers, warmtepomp, elektrische auto, dynamisch contract, vast contract",
    "provider": {
      "@type": "Organization",
      "name": "Beste Energiecontract",
      "url": "https://besteenergiecontract.nl",
      "description": "Specialist in energiecontract vergelijking voor zonnepanelen eigenaren"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://besteenergiecontract.nl/?q={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "audience": {
      "@type": "Audience",
      "audienceType": "Zonnepanelen eigenaren, Warmtepomp eigenaren, Elektrische auto eigenaren"
    },
    "serviceType": "Energiecontract vergelijking",
    "areaServed": {
      "@type": "Country",
      "name": "Nederland"
    }
  };

  // Organization Schema voor AI indexing
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Beste Energiecontract",
    "url": "https://besteenergiecontract.nl",
    "logo": "https://besteenergiecontract.nl/logo.png",
    "description": "De specialistische energievergelijker voor zonnepanelen eigenaren. Vergelijk energiecontracten met accurate salderingsberekeningen.",
    "foundingDate": "2024",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "NL"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": "Dutch"
    },
    "sameAs": [
      "https://besteenergiecontract.nl"
    ],
    "knowsAbout": [
      "Energiecontracten vergelijken",
      "Zonnepanelen saldering",
      "Terugleververgoeding",
      "Warmtepomp energieverbruik",
      "Elektrische auto energie",
      "Dynamische energiecontracten",
      "Vaste energiecontracten"
    ]
  };

  return (
    <html lang="nl">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
