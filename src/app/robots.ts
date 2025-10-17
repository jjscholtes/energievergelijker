import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'CCBot', 'anthropic-ai', 'Claude-Web', 'Google-Extended'],
        allow: '/',
        crawlDelay: 1,
      },
    ],
    sitemap: 'https://besteenergiecontract.nl/sitemap.xml',
  };
}

