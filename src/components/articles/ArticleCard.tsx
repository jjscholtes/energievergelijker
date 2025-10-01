import { ArticleCardProps } from '@/types/articles';
import { Calendar, Clock, User, ArrowRight, TrendingUp, Lightbulb, BarChart3, Newspaper } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function ArticleCard({ article }: ArticleCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'nieuws': return <Newspaper className="w-4 h-4" />;
      case 'tips': return <Lightbulb className="w-4 h-4" />;
      case 'analyse': return <BarChart3 className="w-4 h-4" />;
      case 'trends': return <TrendingUp className="w-4 h-4" />;
      default: return <Newspaper className="w-4 h-4" />;
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

  return (
    <article className="group relative bg-white rounded-3xl shadow-xl hover:shadow-3xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:scale-105 hover:-translate-y-2">

      {/* Article Image */}
      <div className="h-56 relative overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
        <div className="absolute bottom-6 left-6 right-6">
          <div className={`inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold border backdrop-blur-md shadow-lg ${getCategoryColor(article.category)}`}>
            {getCategoryIcon(article.category)}
            <span>{article.category.charAt(0).toUpperCase() + article.category.slice(1)}</span>
          </div>
        </div>
      </div>
      
      <div className="p-10">
        <h3 className="font-bold text-gray-900 mb-6 group-hover:text-blue-600 transition-colors leading-tight text-2xl">
          {article.title}
        </h3>

        <p className="text-gray-600 mb-8 line-clamp-3 leading-relaxed text-lg">
          {article.summary}
        </p>

        {/* Metadata */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="font-medium">{article.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(article.publishDate)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-full">
            <Clock className="w-4 h-4" />
            <span className="font-medium">{article.readTime} min</span>
          </div>
        </div>

        {/* Enhanced Tags */}
        <div className="flex flex-wrap gap-3 mb-10">
          {article.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:from-blue-100 hover:to-purple-100 hover:text-blue-700 transition-all duration-300 transform hover:scale-105 shadow-sm">
              #{tag}
            </span>
          ))}
        </div>

        {/* Enhanced CTA Button */}
        <Link 
          href={`/artikelen/${article.id}`}
          className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white py-5 px-8 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center justify-center gap-4 group"
        >
          <span>Lees Artikel</span>
          <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
        </Link>
      </div>
    </article>
  );
}