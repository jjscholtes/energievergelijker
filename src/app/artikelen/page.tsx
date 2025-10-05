import { articles } from '@/lib/data/articles';
import { Calendar, Clock, User, ArrowLeft, TrendingUp, Lightbulb, BarChart3, Newspaper } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'Artikelen & Nieuws | Beste Energiecontract',
  description: 'Blijf op de hoogte van de laatste ontwikkelingen in de energiemarkt. Lees onze artikelen over energiecontracten, zonnepanelen, besparingstips en markttrends.',
  keywords: 'energie artikelen, energie nieuws, energiecontracten, zonnepanelen, besparingstips, energiemarkt, trends',
  openGraph: {
    title: 'Artikelen & Nieuws | Beste Energiecontract',
    description: 'Blijf op de hoogte van de laatste ontwikkelingen in de energiemarkt.',
    type: 'website',
  },
};

export default function ArtikelenPage() {
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

  // Sort articles by publish date (newest first)
  const sortedArticles = [...articles].sort((a, b) => 
    new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Terug naar homepage</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Artikelen & Nieuws
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Blijf op de hoogte van de laatste ontwikkelingen in de energiemarkt. 
            Lees onze artikelen over energiecontracten, zonnepanelen, besparingstips en markttrends.
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedArticles.map((article) => (
            <Link
              key={article.id}
              href={`/artikelen/${article.id}`}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 transform hover:-translate-y-1"
            >
              {/* Article Image */}
              <div className="h-48 relative overflow-hidden">
                {article.imageUrl ? (
                  <Image
                    src={article.imageUrl}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="h-full bg-gradient-to-br from-gray-100 to-gray-200"></div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border backdrop-blur-sm ${getCategoryColor(article.category)}`}>
                    {getCategoryIcon(article.category)}
                    <span>{article.category.charAt(0).toUpperCase() + article.category.slice(1)}</span>
                  </div>
                </div>

                {/* Featured Badge */}
                {article.featured && (
                  <div className="absolute top-4 right-4">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm font-bold backdrop-blur-sm">
                      Uitgelicht
                    </div>
                  </div>
                )}
              </div>

              {/* Article Content */}
              <div className="p-6">
                <h3 className="font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors leading-tight text-lg">
                  {article.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                  {article.summary}
                </p>

                {/* Metadata */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{article.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{article.readTime} min</span>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(article.publishDate)}</span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {article.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors">
                      #{tag}
                    </span>
                  ))}
                  {article.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                      +{article.tags.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Vind jouw perfecte energiecontract</h3>
            <p className="text-blue-100 mb-6 text-lg">
              Gebruik onze vergelijker om het beste energiecontract te vinden voor jouw situatie
            </p>
            <Link
              href="/#user-input-form"
              className="inline-flex items-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
            >
              <span>Start Vergelijking</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
