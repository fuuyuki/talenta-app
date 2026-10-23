import type { Metadata } from 'next';
import Link from 'next/link';
import { DashboardShell } from '@/components/dashboard-shell';

export const metadata: Metadata = {
  title: 'Dashboard Mentor',
};

const cardClass =
  'rounded-2xl border border-emerald-900/10 bg-white p-6 shadow-sm';

export default function MentorDashboardPage() {
  return (
    <DashboardShell requiredRole="mentor">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
          Mentor
        </p>
        <h1 className="mt-3 font-serif text-3xl font-semibold text-emerald-950 sm:text-4xl">
          Pendampingan yang terarah.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-600">
          Ruang kerja untuk mendampingi mentee, menyiapkan sesi, dan mencatat
          perkembangan.
        </p>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <section className={cardClass}>
            <h2 className="font-serif text-xl font-semibold text-emerald-950">
              Mentee saya
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">
              Belum ada mentee yang ditugaskan. Penugasan akan tampil di sini.
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
              Sumber daya
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">
              Gunakan artikel dan catatan untuk memperkaya diskusi dengan
              mentee.
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
