'use client';

import Link from 'next/link';
import { DashboardShell } from '@/components/dashboard-shell';
import type { UserRole } from '@/lib/auth';
import { useAuthUser } from '@/lib/use-auth-user';

const roleCards: Record<
  UserRole,
  { title: string; description: string; href: string; cta: string }
> = {
  admin: {
    title: 'Dashboard Admin',
    description:
      'Kelola akun anggota, atur peran, dan jaga akses platform.',
    href: '/admin',
    cta: 'Buka admin',
  },
  mentor: {
    title: 'Dashboard Mentor',
    description:
      'Pendampingan, sesi, dan catatan perkembangan mentee dalam satu tempat.',
    href: '/mentor',
    cta: 'Buka mentor',
  },
  mentee: {
    title: 'Dashboard Mentee',
    description:
      'Mentor, sesi, dan sumber belajar untuk mendukung perkembangan Anda.',
    href: '/mentee',
    cta: 'Buka mentee',
  },
};

export default function DashboardPage() {
  const user = useAuthUser();
  const roles = user?.roles ?? [];

  return (
    <DashboardShell>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-sm font-medium text-amber-700">
          Ruang Kerja
        </p>
        <h1 className="mt-3 font-serif text-3xl font-semibold text-emerald-950 sm:text-4xl">
          Selamat datang{user ? `, ${user.email}` : ''}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-600">
          Pilih ruang yang sesuai dengan peran Anda. Anda dapat memiliki lebih
          dari satu peran.
        </p>

        {roles.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-emerald-900/20 bg-white/60 p-8 text-sm text-stone-600">
            Akun Anda belum memiliki peran. Hubungi administrator.
          </div>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {roles.map((role) => {
              const card = roleCards[role];

              return (
                <Link
                  key={role}
                  href={card.href}
                  className="group flex flex-col rounded-2xl border border-emerald-900/10 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <h2 className="font-serif text-xl font-semibold text-emerald-950">
                    {card.title}
                  </h2>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-stone-600">
                    {card.description}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800 transition group-hover:text-emerald-950">
                    {card.cta} <span aria-hidden="true">→</span>
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
