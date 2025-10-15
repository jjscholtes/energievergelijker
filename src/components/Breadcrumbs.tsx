'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  // BreadcrumbList Schema for search engines
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://besteenergiecontract.nl/'
      },
      ...items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: item.label,
        ...(item.href && { item: `https://besteenergiecontract.nl${item.href}` })
      }))
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-2 text-sm text-gray-600">
          <li className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-1 hover:text-emerald-600 transition-colors">
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </li>
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-2">
              {item.href && index < items.length - 1 ? (
                <>
                  <Link href={item.href} className="hover:text-emerald-600 transition-colors">
                    {item.label}
                  </Link>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </>
              ) : (
                <span className="text-gray-900 font-semibold">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

