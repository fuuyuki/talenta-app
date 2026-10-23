'use client';

import { useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clearSession, getSession, type AuthUser } from '@/lib/auth';

function subscribeToStorage(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange);
  return () => window.removeEventListener('storage', onStoreChange);
}

function getStoredUser() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('user');
}

function getServerUser() {
  return null;
}

function parseUser(raw: string | null): AuthUser | null {
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const storedUser = useSyncExternalStore(
    subscribeToStorage,
    getStoredUser,
    getServerUser,
  );
  const user = parseUser(storedUser);

  useEffect(() => {
    if (!getSession()) {
      router.replace('/login');
    }
  }, [router]);

  if (!user) {
    return <p className="p-8">Loading...</p>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">
        Welcome to your Dashboard, {user.email}
      </h1>
      <p className="text-gray-600">Role: {user.role}</p>

      <div className="mt-8 flex flex-wrap gap-3">
        {user.role === 'admin' && (
          <Link
            href="/admin/users"
            className="rounded bg-emerald-900 px-4 py-2 text-white transition hover:bg-emerald-950"
          >
            Kelola Anggota
          </Link>
        )}
        <Link
          href="/"
          className="rounded bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800"
        >
          Kembali ke beranda
        </Link>
        <button
          type="button"
          onClick={() => {
            clearSession();
            router.replace('/login');
          }}
          className="rounded bg-red-500 px-4 py-2 text-white transition hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
