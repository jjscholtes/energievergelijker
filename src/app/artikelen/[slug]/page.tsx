import { notFound } from 'next/navigation';
import { getArticleById, articles } from '@/lib/data/articles';
import { Calendar, Clock, User, ArrowLeft, Share2, BookOpen, TrendingUp, Lightbulb, BarChart3, Newspaper } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface ArticlePageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  return articles.map((article) => ({
    slug: article.id,
  }));
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const resolvedParams = await params;
  const article = getArticleById(resolvedParams.slug);
  
  if (!article) {
    return {
      title: 'Artikel niet gevonden',
    };
  }

  return {
    title: `${article.title} | Energievergelijker`,
    description: article.summary,
    keywords: article.tags.join(', '),
    openGraph: {
      title: article.title,
      description: article.summary,
      type: 'article',
      publishedTime: article.publishDate,
      authors: [article.author],
      tags: article.tags,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const resolvedParams = await params;
  const article = getArticleById(resolvedParams.slug);

  if (!article) {
    notFound();
  }

  // BreadcrumbList Schema voor AI indexing
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://besteenergiecontract.nl"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Artikelen",
        "item": "https://besteenergiecontract.nl/#artikelen"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": article.title,
        "item": `https://besteenergiecontract.nl/artikelen/${article.id}`
      }
    ]
  };

  // Article Schema voor AI indexing
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.summary,
    "image": article.imageUrl,
    "author": {
      "@type": "Organization",
      "name": "Beste Energiecontract",
      "url": "https://besteenergiecontract.nl"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Beste Energiecontract",
      "url": "https://besteenergiecontract.nl",
      "logo": {
        "@type": "ImageObject",
        "url": "https://besteenergiecontract.nl/logo.png"
      }
    },
    "datePublished": article.publishDate,
    "dateModified": article.publishDate,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://besteenergiecontract.nl/artikelen/${article.id}`
    },
    "keywords": article.tags.join(", "),
    "articleSection": article.category,
    "wordCount": article.content.split(' ').length,
    "inLanguage": "nl-NL"
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'nieuws': return <Newspaper className="w-5 h-5" />;
      case 'tips': return <Lightbulb className="w-5 h-5" />;
      case 'analyse': return <BarChart3 className="w-5 h-5" />;
      case 'trends': return <TrendingUp className="w-5 h-5" />;
      default: return <Newspaper className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'nieuws': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'tips': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'analyse': return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'trends': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactElement[] = [];
    let currentList: string[] = [];
    let currentTable: string[][] = [];
    let tableHeaders: string[] = [];
    let inTable = false;
    let inQuote = false;
    let quoteContent: string[] = [];

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="space-y-3 mb-6">
            {currentList.map((item, idx) => {
              // Process bold text in list items
              let processedItem = item;
              processedItem = processedItem.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');
              processedItem = processedItem.replace(/\*(.*?)\*/g, '<em class="italic text-gray-800">$1</em>');
              
              return (
                <li key={idx} className="flex items-start gap-3 text-gray-700 leading-relaxed">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-3 flex-shrink-0"></div>
                  <span dangerouslySetInnerHTML={{ __html: processedItem }} />
                </li>
              );
            })}
          </ul>
        );
        currentList = [];
      }
    };

    const flushTable = () => {
      if (currentTable.length > 0) {
        elements.push(
          <div key={`table-${elements.length}`} className="overflow-x-auto mb-8">
            <table className="w-full border-collapse bg-white rounded-xl shadow-lg overflow-hidden">
              <thead className="bg-gradient-to-r from-emerald-50 to-teal-50">
                <tr>
                  {tableHeaders.map((header, idx) => {
                    const processedHeader = header
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-800">$1</em>');

                    return (
                      <th key={idx} className="px-6 py-4 text-left font-semibold text-gray-800 border-b border-gray-200">
                        <span dangerouslySetInnerHTML={{ __html: processedHeader }} />
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {currentTable.map((row, rowIdx) => (
                  <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {row.map((cell, cellIdx) => {
                      const processedCell = cell
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em class="italic text-gray-800">$1</em>');

                      return (
                        <td key={cellIdx} className="px-6 py-4 text-gray-700 border-b border-gray-100">
                          <span dangerouslySetInnerHTML={{ __html: processedCell }} />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        currentTable = [];
        tableHeaders = [];
        inTable = false;
      }
    };

    const flushQuote = () => {
      if (quoteContent.length > 0) {
        elements.push(
          <div key={`quote-${elements.length}`} className="bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-emerald-500 p-6 mb-8 rounded-r-xl">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white font-bold text-sm">&quot;</span>
              </div>
              <div className="space-y-2">
                {quoteContent.map((line, idx) => {
                  // Process bold text in quotes
                  let processedLine = line;
                  processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');
                  processedLine = processedLine.replace(/\*(.*?)\*/g, '<em class="italic text-gray-800">$1</em>');
                  
                  return (
                    <p key={idx} className="text-gray-800 font-medium leading-relaxed">
                      <span dangerouslySetInnerHTML={{ __html: processedLine }} />
                    </p>
                  );
                })}
              </div>
            </div>
          </div>
        );
        quoteContent = [];
        inQuote = false;
      }
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // Handle horizontal dividers
      if (trimmedLine === '---') {
        flushList();
        flushTable();
        flushQuote();
        elements.push(
          <div key={`divider-${index}`} className="my-12 flex items-center">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <div className="mx-4 w-3 h-3 bg-emerald-500 rounded-full"></div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>
        );
        return;
      }

      // Handle H1 titles
      if (trimmedLine.startsWith('# ')) {
        flushList();
        flushTable();
        flushQuote();
        elements.push(
          <h1 key={`h1-${index}`} className="text-4xl font-bold text-gray-900 mb-6 mt-12 first:mt-0 leading-tight">
            {trimmedLine.replace('# ', '')}
          </h1>
        );
        return;
      }

      // Handle H2 titles
      if (trimmedLine.startsWith('## ')) {
        flushList();
        flushTable();
        flushQuote();
        elements.push(
          <h2 key={`h2-${index}`} className="text-3xl font-bold text-gray-900 mb-6 mt-12 first:mt-0 leading-tight">
            {trimmedLine.replace('## ', '')}
          </h2>
        );
        return;
      }

      // Handle H3 titles
      if (trimmedLine.startsWith('### ')) {
        flushList();
        flushTable();
        flushQuote();
        elements.push(
          <h3 key={`h3-${index}`} className="text-2xl font-semibold text-gray-800 mb-4 mt-8 leading-tight">
            {trimmedLine.replace('### ', '')}
          </h3>
        );
        return;
      }

      // Handle H4 titles
      if (trimmedLine.startsWith('#### ')) {
        flushList();
        flushTable();
        flushQuote();
        elements.push(
          <h4 key={`h4-${index}`} className="text-xl font-semibold text-gray-800 mb-3 mt-6 leading-tight">
            {trimmedLine.replace('#### ', '')}
          </h4>
        );
        return;
      }

      // Handle blockquotes
      if (trimmedLine.startsWith('> ')) {
        if (!inQuote) {
          flushList();
          flushTable();
          flushQuote();
          inQuote = true;
        }
        quoteContent.push(trimmedLine.replace('> ', ''));
        return;
      }

      // Handle table headers
      if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|') && trimmedLine.includes('|')) {
        if (!inTable) {
          flushList();
          flushQuote();
          inTable = true;
        }

        const cells = trimmedLine.split('|').slice(1, -1).map(cell => cell.trim());

        // Skip separator rows like | --- |
        if (cells.some(cell => cell.includes('---'))) {
          return;
        }

        if (tableHeaders.length === 0) {
          tableHeaders = cells;
        } else {
          currentTable.push(cells);
        }
        return;
      }

      // Handle list items
      if (trimmedLine.startsWith('- ')) {
        if (inTable) {
          flushTable();
        }
        if (inQuote) {
          flushQuote();
        }
        currentList.push(trimmedLine.replace('- ', ''));
        return;
      }

      // Handle regular paragraphs
      if (trimmedLine !== '') {
        flushList();
        flushTable();
        flushQuote();
        
        // Process bold text and other formatting
        let processedLine = trimmedLine;
        
        // Handle bold text (**text**)
        processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');
        
        // Handle italic text (*text*)
        processedLine = processedLine.replace(/\*(.*?)\*/g, '<em class="italic text-gray-800">$1</em>');
        
        elements.push(
          <p key={`p-${index}`} className="text-gray-700 mb-6 leading-relaxed text-lg">
            <span dangerouslySetInnerHTML={{ __html: processedLine }} />
          </p>
        );
        return;
      }

      // Handle empty lines
      if (trimmedLine === '') {
        flushList();
        flushTable();
        flushQuote();
        return;
      }
    });

    // Flush any remaining content
    flushList();
    flushTable();
    flushQuote();

    return elements;
  };

  return (
    <>
      {/* Breadcrumb Schema voor AI */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {/* Article Schema voor AI */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/#articles-section"
              className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Terug naar artikelen</span>
            </Link>
            <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
              <Share2 className="w-5 h-5" />
              <span>Delen</span>
            </button>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Article Header */}
        <header className="mb-12">
          {/* Article Image */}
          {article.imageUrl && (
            <div className="mb-8">
              <div className="relative h-64 md:h-80 lg:h-96 rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src={article.imageUrl}
                  alt={article.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </div>
          )}

          {/* Category */}
          <div className="mb-6">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${getCategoryColor(article.category)}`}>
              {getCategoryIcon(article.category)}
              <span>{article.category.charAt(0).toUpperCase() + article.category.slice(1)}</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {article.title}
          </h1>

          {/* Summary */}
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            {article.summary}
          </p>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-8">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="font-medium">{article.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(article.publishDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="font-medium">{article.readTime} min lezen</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {article.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                #{tag}
              </span>
            ))}
          </div>
        </header>

        {/* Article Body */}
        <div className="prose prose-lg max-w-none">
          <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12">
            {formatContent(article.content)}
          </div>
        </div>

        {/* Related Articles */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Gerelateerde artikelen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles
              .filter(a => a.id !== article.id && a.category === article.category)
              .slice(0, 2)
              .map((relatedArticle) => (
                <Link
                  key={relatedArticle.id}
                  href={`/artikelen/${relatedArticle.id}`}
                  className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                >
                  <div className="h-48 relative overflow-hidden">
                    {relatedArticle.imageUrl ? (
                      <Image
                        src={relatedArticle.imageUrl}
                        alt={relatedArticle.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="h-full bg-gradient-to-br from-gray-100 to-gray-200"></div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border backdrop-blur-sm ${getCategoryColor(relatedArticle.category)}`}>
                        {getCategoryIcon(relatedArticle.category)}
                        <span>{relatedArticle.category.charAt(0).toUpperCase() + relatedArticle.category.slice(1)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors leading-tight">
                      {relatedArticle.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                      {relatedArticle.summary}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{formatDate(relatedArticle.publishDate)}</span>
                      <span className="font-medium">{relatedArticle.readTime} min</span>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Vind jouw perfecte energiecontract</h3>
            <p className="text-blue-100 mb-6 text-lg">
              Gebruik onze vergelijker om het beste energiecontract te vinden voor jouw situatie
            </p>
            <Link
              href="/#user-input-form"
              className="inline-flex items-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
            >
              <BookOpen className="w-5 h-5" />
              <span>Start Vergelijking</span>
            </Link>
          </div>
        </section>
      </article>
    </div>
    </>
  );
}
