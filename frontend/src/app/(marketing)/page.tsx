import Image from 'next/image';
import Link from 'next/link';
import { ArticleFeed } from '@/components/article-feed';
import { GeometricPattern } from '@/components/geometric-pattern';
import { ProgramsGrid } from '@/components/programs-grid';
import { ValuesGrid } from '@/components/values-grid';

const primaryButton =
  'inline-flex items-center justify-center rounded-sm bg-navy-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-navy-950';

const secondaryButton =
  'inline-flex items-center justify-center rounded-sm border border-rule-strong px-5 py-3 text-sm font-medium text-ink transition-colors hover:border-navy-900 hover:bg-navy-50';

const heroFacts = [
  { term: 'Pilar pembinaan', detail: 'Tiga program utama' },
  { term: 'Pendekatan', detail: 'Nilai dan kompetensi' },
  { term: 'Pendampingan', detail: 'Personal dan terarah' },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-rule">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 text-azure-500"
        >
          <GeometricPattern className="opacity-[0.06]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pt-12 sm:px-6 sm:pt-16 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.52fr)] lg:gap-16">
            <div className="min-w-0">
              <h1 className="font-serif text-[clamp(2.5rem,5.6vw,4.5rem)] font-semibold leading-[1.03] tracking-tight text-ink [overflow-wrap:break-word]">
                Talenta muslim yang siap berkarya.
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted">
                Pembinaan karakter, keterampilan, dan mentorship bagi mahasiswa
                Indonesia.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="#program" className={primaryButton}>
                  Lihat program
                </Link>
                <Link href="/login" className={secondaryButton}>
                  Masuk
                </Link>
              </div>
            </div>

            <div className="justify-self-center lg:justify-self-end">
              <Image
                src="/brand/tin-logo.svg"
                alt=""
                width={640}
                height={985}
                unoptimized
                priority
                className="h-[clamp(15rem,28vw,23rem)] w-auto"
              />
            </div>
          </div>

          <dl className="mt-12 grid gap-px border-t border-rule bg-rule sm:grid-cols-3 sm:mt-16">
            {heroFacts.map((fact) => (
              <div key={fact.term} className="bg-paper py-4 sm:px-5 sm:first:pl-0">
                <dt className="text-sm text-ink-muted">{fact.term}</dt>
                <dd className="mt-1 font-serif text-lg font-semibold text-ink">
                  {fact.detail}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="program" className="scroll-mt-20 border-b border-rule">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <h2 className="font-serif text-3xl font-semibold leading-tight text-ink sm:text-4xl">
              Tiga pilar untuk bertumbuh.
            </h2>
            <p className="max-w-xl text-base leading-relaxed text-ink-muted">
              Setiap program menjawab kebutuhan mahasiswa: arah yang jelas,
              keterampilan yang relevan, dan pendampingan yang personal.
            </p>
          </div>

          <div className="mt-12">
            <ProgramsGrid />
          </div>
        </div>
      </section>

      <section className="border-b border-rule bg-navy-950 text-on-dark">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:px-8">
          <div>
            <h2 className="font-serif text-3xl font-semibold leading-tight sm:text-4xl">
              Iman dan profesionalisme berjalan seiring.
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-on-dark-muted">
              Kompetensi terbaik lahir dari karakter yang kuat. Nilai Islam
              menjadi fondasi setiap proses pembinaan.
            </p>
          </div>

          <ValuesGrid tone="dark" />
        </div>
      </section>

      <section id="artikel" className="scroll-mt-20 border-b border-rule">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-3xl font-semibold leading-tight text-ink sm:text-4xl">
                Catatan untuk bertumbuh.
              </h2>
              <p className="mt-3 max-w-lg text-base leading-relaxed text-ink-muted">
                Refleksi, panduan karier, dan gagasan untuk talenta muda.
              </p>
            </div>
            <Link
              href="/artikel"
              className="text-sm font-medium text-azure-700 underline-offset-4 hover:underline"
            >
              Semua artikel
            </Link>
          </div>

          <div className="mt-10">
            <ArticleFeed limit={3} />
          </div>
        </div>
      </section>

      <section id="kontak" className="scroll-mt-20">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1fr_1fr] lg:gap-16 lg:px-8">
          <div>
            <h2 className="font-serif text-3xl font-semibold leading-tight text-ink sm:text-4xl">
              Mari bertumbuh bersama.
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-ink-muted">
              Ingin berkolaborasi, menjadi mentor, atau mengenal program kami
              lebih jauh?
            </p>
          </div>

          <div className="flex flex-col items-start gap-5 lg:justify-center">
            <a
              href="mailto:halo@talenta-in.digital"
              className="font-serif text-2xl text-ink underline decoration-azure-500 decoration-2 underline-offset-8 transition-colors hover:text-azure-700"
            >
              halo@talenta-in.digital
            </a>
            <Link href="/login" className={secondaryButton}>
              Masuk dashboard
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
