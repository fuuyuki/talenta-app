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
      <section className="border-b border-rule">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <h1 className="max-w-3xl font-serif text-[clamp(2.4rem,5vw,3.6rem)] font-semibold leading-[1.05] tracking-tight text-ink">
            Catatan dan panduan untuk talenta muda.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-muted">
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
