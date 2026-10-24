'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArticleContent } from './article-content';
import { ArticleSkeleton } from './article-skeleton';
import {
  fetchArticle,
  formatArticleDate,
} from '@/lib/articles';
import type { ArticleDetail } from '@/lib/articles';

export function ArticleDetailView({ slug }: { slug: string }) {
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(
    'loading',
  );

  useEffect(() => {
    let cancelled = false;

    fetchArticle(slug)
      .then((data) => {
        if (cancelled) return;
        setArticle(data);
        setStatus('ready');
      })
      .catch(() => {
        if (cancelled) return;
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (status === 'loading') {
    return <ArticleSkeleton />;
  }

  if (status === 'error' || !article) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl font-semibold text-ink">
          Artikel tidak ditemukan
        </h1>
        <p className="mt-3 text-ink-muted">
          Artikel ini mungkin belum dipublikasikan atau sudah dipindahkan.
        </p>
        <Link
          href="/artikel"
          className="mt-6 inline-flex items-center justify-center rounded-sm bg-navy-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-950"
        >
          Kembali ke daftar artikel
        </Link>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Link
        href="/artikel"
        className="text-sm font-medium text-ink-muted transition-colors hover:text-ink"
      >
        Semua artikel
      </Link>

      <p className="mt-8 text-sm text-ink-muted">
        {formatArticleDate(article.published_at ?? article.created_at) ||
          'Artikel'}
      </p>
      <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight text-ink sm:text-5xl">
        {article.title}
      </h1>
      {article.excerpt && (
        <p className="mt-5 text-lg leading-relaxed text-ink-muted">
          {article.excerpt}
        </p>
      )}

      <div className="mt-10 border-t border-rule pt-8">
        <ArticleContent markdown={article.body_md} />
      </div>
    </article>
  );
}
