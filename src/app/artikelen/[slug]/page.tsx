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
    "datePublished": article.publishedAt,
    "dateModified": article.publishedAt,
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
      case 'nieuws': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'tips': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'analyse': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'trends': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('## ')) {
        return (
          <h2 key={index} className="text-2xl font-bold text-gray-900 mt-8 mb-4 first:mt-0">
            {line.replace('## ', '')}
          </h2>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <h3 key={index} className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            {line.replace('### ', '')}
          </h3>
        );
      }
      if (line.startsWith('- ')) {
        return (
          <li key={index} className="text-gray-700 mb-2 ml-4">
            {line.replace('- ', '')}
          </li>
        );
      }
      if (line.trim() === '') {
        return <br key={index} />;
      }
      return (
        <p key={index} className="text-gray-700 mb-4 leading-relaxed">
          {line}
        </p>
      );
    });
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/#articles-section"
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
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
