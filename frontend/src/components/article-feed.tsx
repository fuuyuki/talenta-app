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
            className="h-64 animate-pulse rounded-2xl border border-emerald-900/10 bg-white"
          />
        ))}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-emerald-900/20 bg-white/60 p-10 text-center">
        <p className="font-serif text-xl font-semibold text-emerald-950">
          Artikel segera hadir
        </p>
        <p className="mt-2 text-sm text-stone-600">
          Kami sedang menyiapkan tulisan dan panduan untuk talenta muda.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-3">
      {articles.map((article) => (
        <article
          key={article.id}
          className="group flex flex-col rounded-2xl border border-emerald-900/10 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
            {formatArticleDate(article.published_at ?? article.created_at) ||
              'Artikel'}
          </p>
          <h3 className="mt-3 font-serif text-xl font-semibold leading-snug text-emerald-950">
            <Link
              href={`/artikel/${article.slug}`}
              className="transition group-hover:text-emerald-700"
            >
              {article.title}
            </Link>
          </h3>
          {article.excerpt && (
            <p className="mt-3 flex-1 text-sm leading-relaxed text-stone-600">
              {article.excerpt}
            </p>
          )}
          <Link
            href={`/artikel/${article.slug}`}
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800 transition hover:text-emerald-950"
          >
            Baca selengkapnya <span aria-hidden="true">→</span>
          </Link>
        </article>
      ))}
    </div>
  );
}
