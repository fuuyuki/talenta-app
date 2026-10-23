import Link from 'next/link';
import { ArticleFeed } from '@/components/article-feed';
import { GeometricPattern } from '@/components/geometric-pattern';
import { ProgramsGrid } from '@/components/programs-grid';
import { ValuesGrid } from '@/components/values-grid';

const primaryButton =
  'inline-flex items-center justify-center rounded-full bg-emerald-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2';

const secondaryButton =
  'inline-flex items-center justify-center rounded-full border border-emerald-900/20 bg-white/80 px-5 py-3 text-sm font-semibold text-emerald-900 transition hover:border-emerald-900/40 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2';

const heroFacts = [
  { term: 'Pilar pembinaan', detail: '3 program utama' },
  { term: 'Pendekatan', detail: 'Nilai dan kompetensi' },
  { term: 'Pendampingan', detail: 'Personal dan terarah' },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 text-emerald-900"
        >
          <GeometricPattern className="opacity-[0.055]" />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-32 size-112 rounded-full bg-amber-200/50 blur-3xl"
        />

        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24 lg:px-8">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-900/15 bg-white/80 px-3 py-1 text-xs font-medium text-emerald-800 shadow-sm">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-amber-500"
              />
              Yayasan Talenta Insan Nusantara
            </p>

            <h1 className="mt-6 font-serif text-4xl font-semibold leading-[1.08] tracking-tight text-emerald-950 sm:text-6xl">
              Talenta muslim yang berilmu, berakhlak, dan siap berkarya.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-stone-600 sm:text-lg">
              Kami mendampingi mahasiswa dan talenta muda untuk tumbuh dalam
              ilmu, karakter, dan kompetensi profesional melalui pembinaan,
              pelatihan, dan mentorship.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="#program" className={primaryButton}>
                Lihat Program
              </Link>
              <Link href="/login" className={secondaryButton}>
                Masuk Dashboard
              </Link>
            </div>

            <dl className="mt-12 grid max-w-2xl gap-3 sm:grid-cols-3">
              {heroFacts.map((fact) => (
                <div
                  key={fact.term}
                  className="rounded-xl border border-emerald-900/10 bg-white/70 p-4 backdrop-blur-sm"
                >
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-800/70">
                    {fact.term}
                  </dt>
                  <dd className="mt-1 font-serif text-base font-semibold text-emerald-950">
                    {fact.detail}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="border-y border-emerald-900/10 bg-white/70">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
              Tentang Yayasan
            </p>
            <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight text-emerald-950 sm:text-4xl">
              Rumah tumbuh talenta yang berakar pada nilai.
            </h2>
          </div>
          <div className="space-y-4 text-base leading-relaxed text-stone-600">
            <p>
              Yayasan Talenta Insan Nusantara hadir untuk mendampingi generasi
              muda muslim mengembangkan potensi, memperluas wawasan, dan
              menyiapkan diri menghadapi dunia kerja.
            </p>
            <p>
              Kami memadukan pembinaan karakter, penguatan ilmu, dan pengalaman
              profesional agar setiap peserta tumbuh menjadi pribadi yang
              kompeten sekaligus memberi manfaat.
            </p>
            <Link
              href="/tentang"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800 transition hover:text-emerald-950"
            >
              Kenali Yayasan <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section id="program" className="scroll-mt-24">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
              Program
            </p>
            <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight text-emerald-950 sm:text-4xl">
              Tiga pilar untuk bertumbuh.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-stone-600">
              Setiap program dirancang untuk menjawab kebutuhan mahasiswa dan
              talenta muda: arah yang jelas, keterampilan yang relevan, dan
              pendampingan yang personal.
            </p>
          </div>

          <div className="mt-10">
            <ProgramsGrid />
          </div>
        </div>
      </section>

      <section className="bg-emerald-950 text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
              Nilai
            </p>
            <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight sm:text-4xl">
              Iman dan profesionalisme berjalan seiring.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-emerald-100/70">
              Kami percaya bahwa kompetensi terbaik lahir dari karakter yang
              kuat. Nilai-nilai Islam menjadi fondasi dalam setiap proses
              pembinaan.
            </p>
          </div>

          <ValuesGrid tone="dark" />
        </div>
      </section>

      <section id="artikel" className="scroll-mt-24">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                Artikel
              </p>
              <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight text-emerald-950 sm:text-4xl">
                Catatan untuk bertumbuh.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-stone-600">
                Refleksi, panduan karier, dan gagasan untuk talenta muda.
              </p>
            </div>
            <Link
              href="/artikel"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800 transition hover:text-emerald-950"
            >
              Semua artikel <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="mt-10">
            <ArticleFeed limit={3} />
          </div>
        </div>
      </section>

      <section
        id="kontak"
        className="scroll-mt-24 border-t border-emerald-900/10 bg-white/70"
      >
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-emerald-900 px-6 py-12 text-white sm:px-12">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-amber-300/20 blur-3xl"
            />
            <div className="relative max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
                Kontak
              </p>
              <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight sm:text-4xl">
                Mari bertumbuh bersama.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-emerald-100/80">
                Jika Anda ingin berkolaborasi, menjadi mentor, atau mengetahui
                program kami lebih lanjut, silakan hubungi kami.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href="mailto:halo@talenta-in.digital"
                  className="inline-flex items-center justify-center rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-amber-300"
                >
                  Hubungi Kami
                </a>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Masuk Dashboard
                </Link>
              </div>

              <p className="mt-6 text-sm text-emerald-100/60">
                halo@talenta-in.digital · Indonesia
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
