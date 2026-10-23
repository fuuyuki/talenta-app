import type { Metadata } from 'next';
import Link from 'next/link';
import { DashboardShell } from '@/components/dashboard-shell';

export const metadata: Metadata = {
  title: 'Dashboard Mentee',
};

const cardClass =
  'rounded-2xl border border-emerald-900/10 bg-white p-6 shadow-sm';

export default function MenteeDashboardPage() {
  return (
    <DashboardShell requiredRole="mentee">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
          Mentee
        </p>
        <h1 className="mt-3 font-serif text-3xl font-semibold text-emerald-950 sm:text-4xl">
          Tumbuh dengan pendampingan.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-600">
          Ruang kerja untuk mengikuti sesi, berdiskusi dengan mentor, dan
          memantau perkembangan Anda.
        </p>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <section className={cardClass}>
            <h2 className="font-serif text-xl font-semibold text-emerald-950">
              Mentor saya
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">
              Belum ada mentor yang ditugaskan. Informasi mentor akan tampil di
              sini.
            </p>
          </section>

          <section className={cardClass}>
            <h2 className="font-serif text-xl font-semibold text-emerald-950">
              Sesi mendatang
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">
              Belum ada sesi terjadwal. Jadwal pendampingan akan tampil di sini.
            </p>
          </section>

          <section className={cardClass}>
            <h2 className="font-serif text-xl font-semibold text-emerald-950">
              Sumber belajar
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">
              Baca artikel dan panduan untuk mendukung proses belajar Anda.
            </p>
            <Link
              href="/artikel"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800 transition hover:text-emerald-950"
            >
              Lihat artikel <span aria-hidden="true">→</span>
            </Link>
          </section>
        </div>
      </div>
    </DashboardShell>
  );
}
