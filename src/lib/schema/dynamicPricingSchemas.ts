export function generateArticleSchema(year: number) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Dynamische Energieprijzen: Complete Gids & Actuele Uurprijzen',
    description: 'Ontdek actuele dynamische energieprijzen per uur en seizoen. Zie wanneer stroom het goedkoopst is en bespaar tot €300/jaar. Compleet overzicht met historische data.',
    author: {
      '@type': 'Organization',
      name: 'Beste Energiecontract',
      url: 'https://besteenergiecontract.nl'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Beste Energiecontract',
      url: 'https://besteenergiecontract.nl',
      logo: {
        '@type': 'ImageObject',
        url: 'https://besteenergiecontract.nl/logo.png'
      }
    },
    datePublished: `${year}-01-01`,
    dateModified: new Date().toISOString().split('T')[0],
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': 'https://besteenergiecontract.nl/dynamische-prijzen'
    },
    keywords: [
      'dynamische energieprijzen',
      'uurprijzen stroom',
      'spotmarkt prijzen',
      'EPEX prijzen Nederland',
      'energiekosten besparen',
      'dynamisch energiecontract',
      'stroomprijzen per uur',
      'goedkoopste tijdstip stroom'
    ].join(', '),
    articleSection: 'Energie & Besparen',
    inLanguage: 'nl-NL'
  };
}

export function generateDatasetSchema(year: number, dataPoints: number) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'Dynamische Energieprijzen Nederland - Actuele Data',
    description: `Historische uurprijzen van elektriciteit op de EPEX spotmarkt voor Nederland. Inclusief gemiddelde prijzen per uur, dag, en seizoen.`,
    url: 'https://besteenergiecontract.nl/dynamische-prijzen',
    keywords: [
      'energieprijzen',
      'EPEX spotmarkt',
      'uurprijzen elektriciteit',
      'stroomprijzen Nederland',
      'actuele prijzen'
    ],
    creator: {
      '@type': 'Organization',
      name: 'Beste Energiecontract',
      url: 'https://besteenergiecontract.nl'
    },
    distribution: {
      '@type': 'DataDownload',
      encodingFormat: 'text/html',
      contentUrl: 'https://besteenergiecontract.nl/dynamische-prijzen'
    },
    temporalCoverage: `${year}`,
    spatialCoverage: {
      '@type': 'Place',
      name: 'Nederland'
    },
    variableMeasured: [
      {
        '@type': 'PropertyValue',
        name: 'Spotprijs Elektriciteit',
        description: 'Prijs per kilowattuur op de EPEX spotmarkt',
        unitText: 'EUR per kWh'
      }
    ],
    measurementTechnique: 'EPEX Day-Ahead Market Data',
    datePublished: `${year}-01-01`,
    dateModified: new Date().toISOString().split('T')[0],
    license: 'https://creativecommons.org/licenses/by-nc/4.0/',
    citation: 'EPEX SPOT SE',
    isAccessibleForFree: true,
    size: `${dataPoints} datapunten`,
    inLanguage: 'nl-NL'
  };
}

export function generateWebPageSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Dynamische Energieprijzen - Actuele Uurprijzen & Analyse',
    description: 'Ontdek actuele dynamische energieprijzen per uur en seizoen. Zie wanneer stroom het goedkoopst is en bespaar tot €300/jaar met onze complete prijsanalyse.',
    url: 'https://besteenergiecontract.nl/dynamische-prijzen',
    inLanguage: 'nl-NL',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Beste Energiecontract',
      url: 'https://besteenergiecontract.nl'
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://besteenergiecontract.nl/'
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Dynamische Prijzen'
        }
      ]
    },
    mainEntity: {
      '@type': 'Thing',
      name: 'Dynamische Energieprijzen Nederland',
      description: 'Historische en actuele dynamische energieprijzen op de EPEX spotmarkt'
    },
    about: [
      {
        '@type': 'Thing',
        name: 'Energieprijzen'
      },
      {
        '@type': 'Thing',
        name: 'Dynamisch Energiecontract'
      },
      {
        '@type': 'Thing',
        name: 'EPEX Spotmarkt'
      }
    ],
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['#intro-heading', '#comparison-heading', '#faq-heading']
    }
  };
}

