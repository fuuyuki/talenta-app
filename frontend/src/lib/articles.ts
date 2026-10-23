import { apiFetch } from './api';

export type ArticleSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  published_at: string | null;
  created_at: string;
};

export type ArticleDetail = ArticleSummary & {
  body_md: string;
};

export function fetchArticles(): Promise<ArticleSummary[]> {
  return apiFetch('/articles') as Promise<ArticleSummary[]>;
}

export function fetchArticle(slug: string): Promise<ArticleDetail> {
  return apiFetch(
    `/articles/${encodeURIComponent(slug)}`,
  ) as Promise<ArticleDetail>;
}

export function formatArticleDate(value: string | null): string {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}
