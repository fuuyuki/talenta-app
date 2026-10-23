import type { Metadata } from 'next';
import { ArticleFeed } from '@/components/article-feed';

export const metadata: Metadata = {
  title: 'Artikel',
  description:
    'Catatan, panduan karier, dan gagasan untuk mahasiswa dan talenta muda dari Yayasan Talenta Insan Nusantara.',
};

export default function ArtikelPage() {
  return (
    <>
      <section className="border-b border-emerald-900/10 bg-white/70">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
            Artikel
          </p>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl font-semibold leading-tight text-emerald-950 sm:text-5xl">
            Catatan dan panduan untuk talenta muda.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-stone-600 sm:text-lg">
            Refleksi, wawasan karier, dan gagasan seputar pengembangan diri,
            kompetensi, dan kehidupan profesional.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <ArticleFeed />
      </section>
    </>
  );
}
