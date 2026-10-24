'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  fetchArticles,
  formatArticleDate,
  type ArticleSummary,
} from '@/lib/articles';

export function ArticleFeed({ limit }: { limit?: number }) {
  const [articles, setArticles] = useState<ArticleSummary[] | null>(null);
  const [error, setError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    fetchArticles()
      .then((data) => {
        if (cancelled) return;
        setArticles(limit ? data.slice(0, limit) : data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(
          err instanceof Error && err.message
            ? err.message
            : 'Gagal memuat artikel.',
        );
      });

    return () => {
      cancelled = true;
    };
  }, [limit, reloadToken]);

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        <p>Gagal memuat artikel. Silakan coba lagi.</p>
        <button
          type="button"
          onClick={() => {
            setError('');
            setArticles(null);
            setReloadToken((token) => token + 1);
          }}
          className="mt-3 rounded-full border border-red-300 px-4 py-1.5 font-semibold text-red-700 transition hover:bg-red-100"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  if (articles === null) {
    return (
      <div
        className="grid gap-5 md:grid-cols-3"
        aria-busy="true"
        aria-label="Memuat artikel"
      >
        {Array.from({ length: limit ?? 3 }).map((_, index) => (
          <div
            key={index}
            className="h-64 animate-pulse rounded-sm border border-rule bg-surface"
          />
        ))}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="border-t border-rule-strong pt-5">
        <p className="font-serif text-xl font-semibold text-ink">
          Artikel segera hadir
        </p>
        <p className="mt-2 text-sm text-ink-muted">
          Kami sedang menyiapkan tulisan dan panduan untuk talenta muda.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-x-10 gap-y-10 md:grid-cols-3">
      {articles.map((article) => (
        <article
          key={article.id}
          className="flex flex-col border-t border-rule-strong pt-5"
        >
          <p className="text-sm text-ink-muted">
            {formatArticleDate(article.published_at ?? article.created_at) ||
              'Artikel'}
          </p>
          <h3 className="mt-2 font-serif text-xl font-semibold leading-snug text-ink">
            <Link
              href={`/artikel/${article.slug}`}
              className="transition-colors hover:text-azure-700"
            >
              {article.title}
            </Link>
          </h3>
          {article.excerpt && (
            <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-muted">
              {article.excerpt}
            </p>
          )}
          <Link
            href={`/artikel/${article.slug}`}
            className="mt-5 text-sm font-medium text-azure-700 underline-offset-4 hover:underline"
          >
            Baca selengkapnya
          </Link>
        </article>
      ))}
    </div>
  );
}
