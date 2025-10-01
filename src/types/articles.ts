export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  publishDate: string;
  category: 'nieuws' | 'tips' | 'analyse' | 'trends';
  readTime: number; // in minutes
  featured: boolean;
  imageUrl?: string;
  tags: string[];
}

export interface ArticleCardProps {
  article: Article;
}


