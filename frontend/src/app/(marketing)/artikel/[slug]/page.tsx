import type { Metadata } from 'next';
import { ArticleDetailView } from '@/components/article-detail';

export const metadata: Metadata = {
  title: 'Artikel',
};

export default async function ArtikelDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <ArticleDetailView key={slug} slug={slug} />;
}
