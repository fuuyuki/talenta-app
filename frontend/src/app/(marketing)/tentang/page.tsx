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

const ghostOnDark =
  'inline-flex items-center justify-center rounded-sm border border-rule-dark px-5 py-3 text-sm font-medium text-on-dark transition-colors hover:border-on-dark';

export default function TentangPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-rule">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 text-azure-500"
        >
          <GeometricPattern className="opacity-[0.06]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <h1 className="max-w-3xl font-serif text-[clamp(2.4rem,5vw,3.9rem)] font-semibold leading-[1.05] tracking-tight text-ink">
            Menumbuhkan talenta, menebar manfaat.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted">
            Yayasan Talenta Insan Nusantara adalah rumah tumbuh bagi mahasiswa
            dan talenta muda yang ingin mengembangkan diri secara utuh: kuat
            dalam nilai, siap dalam kompetensi, dan tergerak untuk
            berkontribusi.
          </p>
        </div>
      </section>

      <section className="border-b border-rule">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:px-8">
          <h2 className="font-serif text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            Berangkat dari kepedulian, tumbuh bersama.
          </h2>
          <div className="max-w-2xl space-y-4 text-base leading-relaxed text-ink-muted">
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

      <section className="border-b border-rule">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <div className="border-t border-rule-strong pt-5">
            <h2 className="font-serif text-xl font-semibold text-ink">Visi</h2>
            <p className="mt-3 font-serif text-2xl leading-snug text-ink">
              Menjadi rumah tumbuh talenta muslim Indonesia yang unggul,
              berakhlak, dan memberi manfaat.
            </p>
          </div>

          <div className="border-t border-rule-strong pt-5">
            <h2 className="font-serif text-xl font-semibold text-ink">Misi</h2>
            <ul className="mt-3 space-y-3 text-sm leading-relaxed text-ink-muted">
              {missions.map((mission) => (
                <li key={mission}>{mission}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-b border-rule bg-navy-950 text-on-dark">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:px-8">
          <div>
            <h2 className="font-serif text-3xl font-semibold leading-tight sm:text-4xl">
              Fondasi karakter, arah profesional.
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-on-dark-muted">
              Empat nilai ini menjadi pegangan dalam setiap program, interaksi,
              dan keputusan kami.
            </p>
          </div>
          <ValuesGrid tone="dark" />
        </div>
      </section>

      <section className="border-b border-rule">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <h2 className="font-serif text-3xl font-semibold leading-tight text-ink sm:text-4xl">
              Belajar, bertumbuh, berkhidmah.
            </h2>
            <p className="max-w-xl text-base leading-relaxed text-ink-muted">
              Kami tidak berhenti pada pengetahuan. Setiap tahap diarahkan agar
              peserta mampu mengubah ilmu menjadi keterampilan, dan
              keterampilan menjadi manfaat.
            </p>
          </div>

          <div className="mt-12 grid gap-x-10 gap-y-10 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="border-t border-rule-strong pt-5">
                <span className="font-serif text-sm text-azure-600">
                  {step.number}
                </span>
                <h3 className="mt-2 font-serif text-2xl font-semibold leading-snug text-ink">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-rule">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <h2 className="font-serif text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            Tiga pilar pembinaan.
          </h2>
          <div className="mt-12">
            <ProgramsGrid />
          </div>
        </div>
      </section>

      <section className="bg-navy-900 text-on-dark">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="max-w-xl">
            <h2 className="font-serif text-3xl font-semibold leading-tight">
              Ingin bertumbuh bersama kami?
            </h2>
            <p className="mt-3 text-on-dark-muted">
              Hubungi kami untuk informasi program, kolaborasi, atau peran
              sebagai mentor.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="mailto:halo@talenta-in.digital"
              className="inline-flex items-center justify-center rounded-sm bg-paper px-5 py-3 text-sm font-medium text-navy-950 transition-colors hover:bg-azure-100"
            >
              Hubungi kami
            </a>
            <Link href="/artikel" className={ghostOnDark}>
              Baca artikel
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
