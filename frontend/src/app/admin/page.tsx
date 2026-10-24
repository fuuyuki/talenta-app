import type { Metadata } from 'next';
import Link from 'next/link';
import { DashboardShell } from '@/components/dashboard-shell';

export const metadata: Metadata = {
  title: 'Dashboard Admin',
};

const cardClass =
  'flex flex-col rounded-2xl border border-emerald-900/10 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md';

export default function AdminDashboardPage() {
  return (
    <DashboardShell requiredRole="admin">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-sm font-medium text-amber-700">
          Admin
        </p>
        <h1 className="mt-3 font-serif text-3xl font-semibold text-emerald-950 sm:text-4xl">
          Administrasi platform.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-600">
          Kelola anggota, peran, dan konten publik Yayasan Talenta Insan
          Nusantara.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <Link href="/admin/members" className={cardClass}>
            <h2 className="font-serif text-xl font-semibold text-emerald-950">
              Data anggota
            </h2>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-stone-600">
              Kelola daftar anggota yayasan — termasuk yang belum memiliki akun
              login — lalu buatkan akun saat mereka mulai aktif.
            </p>
            <span className="mt-5 text-sm font-semibold text-emerald-800">
              Buka <span aria-hidden="true">→</span>
            </span>
          </Link>

          <Link href="/admin/users" className={cardClass}>
            <h2 className="font-serif text-xl font-semibold text-emerald-950">
              Kelola akun
            </h2>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-stone-600">
              Atur peran, aktifkan atau nonaktifkan akses, dan reset kata sandi
              akun anggota.
            </p>
            <span className="mt-5 text-sm font-semibold text-emerald-800">
              Buka <span aria-hidden="true">→</span>
            </span>
          </Link>

          <Link href="/artikel" className={cardClass}>
            <h2 className="font-serif text-xl font-semibold text-emerald-950">
              Artikel
            </h2>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-stone-600">
              Lihat artikel yang sudah dipublikasikan di situs publik.
            </p>
            <span className="mt-5 text-sm font-semibold text-emerald-800">
              Lihat <span aria-hidden="true">→</span>
            </span>
          </Link>

          <Link href="/" className={cardClass}>
            <h2 className="font-serif text-xl font-semibold text-emerald-950">
              Situs publik
            </h2>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-stone-600">
              Kembali ke landing page dan profil yayasan.
            </p>
            <span className="mt-5 text-sm font-semibold text-emerald-800">
              Buka <span aria-hidden="true">→</span>
            </span>
          </Link>
        </div>
      </div>
    </DashboardShell>
  );
}
