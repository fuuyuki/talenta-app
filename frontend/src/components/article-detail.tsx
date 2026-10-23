'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArticleContent } from './article-content';
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
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="h-4 w-40 animate-pulse rounded bg-emerald-900/10" />
        <div className="mt-6 h-12 w-full animate-pulse rounded bg-emerald-900/10" />
        <div className="mt-3 h-12 w-3/4 animate-pulse rounded bg-emerald-900/10" />
        <div className="mt-10 space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-4 animate-pulse rounded bg-emerald-900/10"
            />
          ))}
        </div>
      </div>
    );
  }

  if (status === 'error' || !article) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
          Artikel
        </p>
        <h1 className="mt-3 font-serif text-3xl font-semibold text-emerald-950">
          Artikel tidak ditemukan
        </h1>
        <p className="mt-3 text-stone-600">
          Artikel ini mungkin belum dipublikasikan atau sudah dipindahkan.
        </p>
        <Link
          href="/artikel"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-emerald-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-950"
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
        className="text-sm font-medium text-emerald-800 transition hover:text-emerald-950"
      >
        ← Semua artikel
      </Link>

      <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
        {formatArticleDate(article.published_at ?? article.created_at) ||
          'Artikel'}
      </p>
      <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight text-emerald-950 sm:text-5xl">
        {article.title}
      </h1>
      {article.excerpt && (
        <p className="mt-5 text-lg leading-relaxed text-stone-600">
          {article.excerpt}
        </p>
      )}

      <div className="mt-10 border-t border-emerald-900/10 pt-8">
        <ArticleContent markdown={article.body_md} />
      </div>
    </article>
  );
}
