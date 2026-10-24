'use client';

import { useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Brand } from './logo';
import { clearSession, getSession, type UserRole } from '@/lib/auth';
import { useAuthUser } from '@/lib/use-auth-user';

const roleLinks: Array<{ role: UserRole; href: string; label: string }> = [
  { role: 'mentor', href: '/mentor', label: 'Mentor' },
  { role: 'mentee', href: '/mentee', label: 'Mentee' },
  { role: 'admin', href: '/admin', label: 'Admin' },
];

const navLinkClass =
  'rounded-full px-3 py-1.5 font-medium text-stone-600 transition hover:bg-emerald-900/5 hover:text-emerald-900';

export function DashboardShell({
  requiredRole,
  children,
}: {
  requiredRole?: UserRole;
  children: ReactNode;
}) {
  const router = useRouter();
  const user = useAuthUser();

  useEffect(() => {
    const session = getSession();

    if (!session) {
      router.replace('/login');
      return;
    }

    if (requiredRole && !session.user.roles.includes(requiredRole)) {
      router.replace('/dashboard');
    }
  }, [requiredRole, router]);

  const handleLogout = () => {
    clearSession();
    router.replace('/login');
  };

  const links = roleLinks.filter((link) => user?.roles.includes(link.role));

  return (
    <div className="flex min-h-full flex-1 flex-col bg-paper text-emerald-950">
      <header className="border-b border-emerald-900/10 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Brand />

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Link href="/dashboard" className={navLinkClass}>
              Dashboard
            </Link>
            {links.map((link) => (
              <Link key={link.role} href={link.href} className={navLinkClass}>
                {link.label}
              </Link>
            ))}
            <Link href="/" className={navLinkClass}>
              Beranda
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-emerald-900/15 px-3 py-1.5 font-semibold text-emerald-900 transition hover:border-emerald-900/40 hover:bg-white"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {user ? (
          children
        ) : (
          <div className="mx-auto max-w-6xl px-4 py-16 text-sm text-stone-500 sm:px-6 lg:px-8">
            Memuat…
          </div>
        )}
      </main>
    </div>
  );
}
