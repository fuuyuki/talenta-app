'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetchWithAuth } from '@/lib/api';
import { clearSession, getSession } from '@/lib/auth';
import { Brand } from '@/components/logo';

type AdminRole = 'admin' | 'mentor' | 'mentee';

type AdminUser = {
  id: string;
  email: string;
  role: AdminRole;
  is_active: boolean;
  created_at: string;
  member_profiles: { full_name: string } | null;
};

const roleLabels: Record<AdminRole, string> = {
  admin: 'Admin',
  mentor: 'Mentor',
  mentee: 'Mentee',
};

const inputClass =
  'w-full rounded-xl border border-emerald-900/15 bg-white px-3.5 py-2.5 text-sm text-emerald-950 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 disabled:cursor-not-allowed disabled:opacity-60';

const labelClass =
  'mb-1.5 block text-sm font-medium text-emerald-950';

const primaryButton =
  'inline-flex w-full items-center justify-center rounded-xl bg-emerald-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70';

const smallSecondary =
  'rounded-full border border-emerald-900/15 px-3 py-1.5 text-xs font-semibold text-emerald-900 transition hover:border-emerald-900/40 hover:bg-[#fbf9f4] disabled:cursor-not-allowed disabled:opacity-60';

function friendlyAdminError(message: string) {
  if (!message || message === 'Failed to fetch') {
    return 'Tidak dapat terhubung ke server. Silakan coba lagi.';
  }
  if (message.includes('Email already exists')) {
    return 'Email sudah terdaftar.';
  }
  if (message.includes('Password must be at least 12')) {
    return 'Kata sandi minimal 12 karakter.';
  }
  if (message.includes('Invalid email')) {
    return 'Format email tidak valid.';
  }
  if (message.includes('Cannot remove the last active admin')) {
    return 'Tidak dapat menonaktifkan admin terakhir yang aktif.';
  }
  if (message.includes('Insufficient role')) {
    return 'Anda tidak memiliki akses admin.';
  }
  if (message.includes('429')) {
    return 'Terlalu banyak permintaan. Silakan coba lagi nanti.';
  }
  if (message.startsWith('Request failed with status')) {
    return 'Permintaan gagal. Silakan coba lagi.';
  }
  return message;
}

export default function AdminUsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [notice, setNotice] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<AdminRole>('mentee');
  const [formError, setFormError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace('/login');
      return;
    }
    if (session.user.role !== 'admin') {
      router.replace('/dashboard');
    }
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    apiFetchWithAuth('/admin/users')
      .then((data) => {
        if (cancelled) return;
        setUsers(data as AdminUser[]);
        setLoadError('');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : '';

        if (message.includes('401')) {
          clearSession();
          router.replace('/login');
          return;
        }
        if (message.includes('403')) {
          router.replace('/dashboard');
          return;
        }

        setLoadError('Gagal memuat daftar anggota.');
      });

    return () => {
      cancelled = true;
    };
  }, [reloadToken, router]);

  const reload = () => {
    setLoadError('');
    setUsers(null);
    setReloadToken((token) => token + 1);
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    setNotice('');

    const trimmedEmail = email.trim();
    const trimmedName = fullName.trim();

    if (!trimmedEmail) {
      setFormError('Email wajib diisi.');
      return;
    }
    if (password.length < 12) {
      setFormError('Kata sandi minimal 12 karakter.');
      return;
    }

    setIsCreating(true);

    try {
      await apiFetchWithAuth('/admin/users', {
        method: 'POST',
        body: JSON.stringify({
          email: trimmedEmail,
          password,
          role,
          full_name: trimmedName || undefined,
        }),
      });

      setFullName('');
      setEmail('');
      setPassword('');
      setRole('mentee');
      setNotice('Anggota berhasil dibuat.');
      setReloadToken((token) => token + 1);
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      setFormError(friendlyAdminError(message));
    } finally {
      setIsCreating(false);
    }
  };

  const toggleActive = async (user: AdminUser) => {
    setLoadError('');
    setNotice('');

    try {
      await apiFetchWithAuth(`/admin/users/${user.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: !user.is_active }),
      });

      setNotice(
        `Status ${user.email} ${user.is_active ? 'dinonaktifkan' : 'diaktifkan'}.`,
      );
      setReloadToken((token) => token + 1);
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      setLoadError(friendlyAdminError(message));
    }
  };

  const handleReset = async (user: AdminUser) => {
    setLoadError('');
    setNotice('');

    if (newPassword.length < 12) {
      setLoadError('Kata sandi baru minimal 12 karakter.');
      return;
    }

    setIsResetting(true);

    try {
      await apiFetchWithAuth(`/admin/users/${user.id}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ password: newPassword }),
      });

      setNotice(`Kata sandi ${user.email} berhasil diperbarui.`);
      setResetUserId(null);
      setNewPassword('');
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      setLoadError(friendlyAdminError(message));
    } finally {
      setIsResetting(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    router.replace('/login');
  };

  return (
    <div className="min-h-full bg-[#fbf9f4] text-emerald-950">
      <header className="border-b border-emerald-900/10 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Brand />

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="hidden text-sm font-medium text-stone-600 transition hover:text-emerald-900 sm:block"
            >
              Dashboard
            </Link>
            <Link
              href="/"
              className="hidden text-sm font-medium text-stone-600 transition hover:text-emerald-900 sm:block"
            >
              Beranda
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-emerald-900/15 px-4 py-2 text-sm font-semibold text-emerald-900 transition hover:border-emerald-900/40 hover:bg-white"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
            Administrasi
          </p>
          <h1 className="mt-3 font-serif text-3xl font-semibold text-emerald-950 sm:text-4xl">
            Kelola anggota
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-stone-600">
            Buat akun anggota, atur peran, dan kelola status akses. Akun baru
            langsung dapat masuk dengan kata sandi awal yang Anda tetapkan.
          </p>
        </div>

        {loadError && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <p>{loadError}</p>
            <button
              type="button"
              onClick={reload}
              className="mt-2 rounded-full border border-red-300 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-100"
            >
              Coba lagi
            </button>
          </div>
        )}

        {notice && (
          <div
            aria-live="polite"
            className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          >
            {notice}
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.85fr_1.4fr]">
          <section className="rounded-2xl border border-emerald-900/10 bg-white p-6 shadow-sm">
            <h2 className="font-serif text-xl font-semibold text-emerald-950">
              Tambah anggota
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Kata sandi minimal 12 karakter.
            </p>

            {formError && (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleCreate} className="mt-5 space-y-4" noValidate>
              <div>
                <label htmlFor="full_name" className={labelClass}>
                  Nama lengkap{' '}
                  <span className="font-normal text-stone-400">(opsional)</span>
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Nama lengkap anggota"
                  disabled={isCreating}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="email" className={labelClass}>
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  spellCheck={false}
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="nama@email.com"
                  disabled={isCreating}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="password" className={labelClass}>
                  Kata sandi awal
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Minimal 12 karakter"
                  disabled={isCreating}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="role" className={labelClass}>
                  Peran
                </label>
                <select
                  id="role"
                  name="role"
                  value={role}
                  onChange={(event) => setRole(event.target.value as AdminRole)}
                  disabled={isCreating}
                  className={inputClass}
                >
                  <option value="mentee">Mentee</option>
                  <option value="mentor">Mentor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className={primaryButton}
              >
                {isCreating ? 'Membuat…' : 'Buat akun'}
              </button>
            </form>
          </section>

          <section className="rounded-2xl border border-emerald-900/10 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-xl font-semibold text-emerald-950">
                  Daftar anggota
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  {users
                    ? `${users.length} akun`
                    : loadError
                      ? 'Tidak dapat dimuat'
                      : 'Memuat data…'}
                </p>
              </div>
              <button
                type="button"
                onClick={reload}
                className="text-sm font-medium text-emerald-800 transition hover:text-emerald-950"
              >
                Muat ulang
              </button>
            </div>

            {users === null && !loadError && (
              <div className="mt-5 space-y-3" aria-busy="true">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-20 animate-pulse rounded-xl border border-emerald-900/10 bg-[#fbf9f4]"
                  />
                ))}
              </div>
            )}

            {users && users.length === 0 && (
              <p className="mt-6 text-sm text-stone-500">
                Belum ada anggota. Buat akun pertama melalui formulir di
                samping.
              </p>
            )}

            {users && users.length > 0 && (
              <ul className="mt-5 divide-y divide-emerald-900/10">
                {users.map((user) => (
                  <li key={user.id} className="py-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-emerald-950">
                          {user.member_profiles?.full_name ?? user.email}
                        </p>
                        {user.member_profiles?.full_name && (
                          <p className="truncate text-sm text-stone-500">
                            {user.email}
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                          <span className="rounded-full bg-emerald-900/5 px-2.5 py-1 font-medium text-emerald-800">
                            {roleLabels[user.role]}
                          </span>
                          <span
                            className={
                              user.is_active
                                ? 'rounded-full bg-emerald-100 px-2.5 py-1 font-medium text-emerald-800'
                                : 'rounded-full bg-stone-100 px-2.5 py-1 font-medium text-stone-600'
                            }
                          >
                            {user.is_active ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setResetUserId(
                              resetUserId === user.id ? null : user.id,
                            );
                            setNewPassword('');
                          }}
                          className={smallSecondary}
                        >
                          Reset kata sandi
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleActive(user)}
                          className={smallSecondary}
                        >
                          {user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                      </div>
                    </div>

                    {resetUserId === user.id && (
                      <div className="mt-3 flex flex-col gap-2 rounded-xl border border-emerald-900/10 bg-[#fbf9f4] p-3 sm:flex-row sm:items-center">
                        <input
                          type="password"
                          autoComplete="new-password"
                          value={newPassword}
                          onChange={(event) =>
                            setNewPassword(event.target.value)
                          }
                          placeholder="Kata sandi baru (min. 12 karakter)"
                          disabled={isResetting}
                          className={inputClass}
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleReset(user)}
                            disabled={isResetting}
                            className={smallSecondary}
                          >
                            {isResetting ? 'Menyimpan…' : 'Simpan'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setResetUserId(null);
                              setNewPassword('');
                            }}
                            className={smallSecondary}
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
