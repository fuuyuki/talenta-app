import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ArticleDetailView } from '@/components/article-detail';
import { ArticleSkeleton } from '@/components/article-skeleton';

export const metadata: Metadata = {
  title: 'Artikel',
};

export default function ArtikelDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<ArticleSkeleton />}>
      <ArticleRoute params={params} />
    </Suspense>
  );
}

async function ArticleRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return <ArticleDetailView key={slug} slug={slug} />;
}
