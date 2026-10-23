import type { Metadata } from 'next';
import Link from 'next/link';
import { GeometricPattern } from '@/components/geometric-pattern';
import { ProgramsGrid } from '@/components/programs-grid';
import { ValuesGrid } from '@/components/values-grid';

export const metadata: Metadata = {
  title: 'Tentang Kami',
  description:
    'Yayasan Talenta Insan Nusantara mendampingi mahasiswa dan talenta muda melalui pembinaan karakter, penguatan ilmu, dan mentorship profesional.',
};

const missions = [
  'Menyelenggarakan pembinaan karakter dan ilmu yang berlandaskan nilai Islam.',
  'Meningkatkan kompetensi teknis dan soft skill talenta muda.',
  'Menghubungkan peserta dengan mentor dan profesional yang berpengalaman.',
  'Mendorong lahirnya karya dan kontribusi yang bermanfaat bagi masyarakat.',
];

const steps = [
  {
    number: '01',
    title: 'Belajar',
    description:
      'Membangun fondasi ilmu, wawasan, dan pemahaman nilai yang menjadi dasar setiap langkah.',
  },
  {
    number: '02',
    title: 'Bertumbuh',
    description:
      'Mengasah keterampilan, kebiasaan, dan kesiapan profesional melalui latihan dan pendampingan.',
  },
  {
    number: '03',
    title: 'Berkhidmah',
    description:
      'Mengarahkan kemampuan untuk memberi manfaat bagi keluarga, masyarakat, dan bangsa.',
  },
];

export default function TentangPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-emerald-900/10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 text-emerald-900"
        >
          <GeometricPattern className="opacity-[0.055]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
            Profil Yayasan
          </p>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl font-semibold leading-tight text-emerald-950 sm:text-5xl">
            Menumbuhkan talenta, menebar manfaat.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-stone-600 sm:text-lg">
            Yayasan Talenta Insan Nusantara adalah rumah tumbuh bagi mahasiswa
            dan talenta muda yang ingin mengembangkan diri secara utuh: kuat
            dalam nilai, siap dalam kompetensi, dan tergerak untuk berkontribusi.
          </p>
        </div>
      </section>

      <section className="bg-white/70">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
              Cerita Kami
            </p>
            <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight text-emerald-950 sm:text-4xl">
              Berangkat dari kepedulian, tumbuh bersama.
            </h2>
          </div>
          <div className="space-y-4 text-base leading-relaxed text-stone-600">
            <p>
              Kami melihat banyak mahasiswa dan talenta muda memiliki potensi
              besar, tetapi belum mendapatkan arah, pendampingan, dan ruang
              untuk mengasah kemampuan secara terpadu.
            </p>
            <p>
              Dari kepedulian itu, Yayasan Talenta Insan Nusantara membangun
              program yang memadukan pembinaan karakter, penguatan ilmu, dan
              pengalaman profesional. Kami percaya bahwa talenta yang baik
              lahir dari lingkungan yang mendukung, mentor yang peduli, dan
              kebiasaan yang terus dilatih.
            </p>
            <p>
              Fokus kami sederhana: membantu generasi muda muslim tumbuh
              menjadi pribadi yang berilmu, berakhlak, dan siap menghadapi
              dunia kerja tanpa kehilangan jati diri.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-emerald-900/10">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-emerald-900/10 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                Visi
              </p>
              <p className="mt-3 font-serif text-2xl font-semibold leading-snug text-emerald-950">
                Menjadi rumah tumbuh talenta muslim Indonesia yang unggul,
                berakhlak, dan memberi manfaat.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-900/10 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                Misi
              </p>
              <ul className="mt-3 space-y-3 text-sm leading-relaxed text-stone-600">
                {missions.map((mission) => (
                  <li key={mission} className="flex gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-1.5 size-1.5 shrink-0 rounded-full bg-amber-500"
                    />
                    {mission}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-emerald-950 text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
              Nilai Kami
            </p>
            <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight sm:text-4xl">
              Fondasi karakter, arah profesional.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-emerald-100/70">
              Empat nilai ini menjadi pegangan dalam setiap program, interaksi,
              dan keputusan kami.
            </p>
          </div>
          <ValuesGrid tone="dark" />
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
              Pendekatan
            </p>
            <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight text-emerald-950 sm:text-4xl">
              Belajar, bertumbuh, berkhidmah.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-stone-600">
              Kami tidak berhenti pada pengetahuan. Setiap tahap diarahkan agar
              peserta mampu mengubah ilmu menjadi keterampilan, dan
              keterampilan menjadi manfaat.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className="rounded-2xl border border-emerald-900/10 bg-white p-6 shadow-sm"
              >
                <span className="font-serif text-sm font-semibold text-amber-600">
                  {step.number}
                </span>
                <h3 className="mt-4 font-serif text-xl font-semibold text-emerald-950">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-stone-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-emerald-900/10 bg-white/70">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
              Program
            </p>
            <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight text-emerald-950 sm:text-4xl">
              Tiga pilar pembinaan.
            </h2>
          </div>
          <div className="mt-10">
            <ProgramsGrid />
          </div>
        </div>
      </section>

      <section className="bg-emerald-900 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="max-w-xl">
            <h2 className="font-serif text-3xl font-semibold leading-tight">
              Ingin bertumbuh bersama kami?
            </h2>
            <p className="mt-3 text-emerald-100/80">
              Hubungi kami untuk informasi program, kolaborasi, atau peran
              sebagai mentor.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="mailto:halo@talenta-in.digital"
              className="inline-flex items-center justify-center rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-amber-300"
            >
              Hubungi Kami
            </a>
            <Link
              href="/artikel"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Baca Artikel
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
