'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetchWithAuth } from '@/lib/api';
import { clearSession } from '@/lib/auth';
import { DashboardShell } from '@/components/dashboard-shell';

type AdminRole = 'admin' | 'mentor' | 'mentee';

type AdminUser = {
  id: string;
  email: string;
  roles: AdminRole[];
  is_active: boolean;
  created_at: string;
  member: { id: string; full_name: string } | null;
};

const ALL_ROLES: AdminRole[] = ['mentee', 'mentor', 'admin'];

const roleLabels: Record<AdminRole, string> = {
  admin: 'Admin',
  mentor: 'Mentor',
  mentee: 'Mentee',
};

const inputClass =
  'w-full rounded-xl border border-emerald-900/15 bg-white px-3.5 py-2.5 text-sm text-emerald-950 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 disabled:cursor-not-allowed disabled:opacity-60';

const labelClass = 'mb-1.5 block text-sm font-medium text-emerald-950';

const primaryButton =
  'inline-flex w-full items-center justify-center rounded-xl bg-emerald-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70';

const smallSecondary =
  'rounded-full border border-emerald-900/15 px-3 py-1.5 text-xs font-semibold text-emerald-900 transition hover:border-emerald-900/40 hover:bg-paper disabled:cursor-not-allowed disabled:opacity-60';

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
  if (message.includes('At least one role')) {
    return 'Pilih minimal satu peran.';
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
  const [roles, setRoles] = useState<AdminRole[]>(['mentee']);
  const [formError, setFormError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const [rolesUserId, setRolesUserId] = useState<string | null>(null);
  const [editRoles, setEditRoles] = useState<AdminRole[]>([]);
  const [isUpdatingRoles, setIsUpdatingRoles] = useState(false);

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

  const toggleRole = (value: AdminRole) => {
    setRoles((current) =>
      current.includes(value)
        ? current.filter((role) => role !== value)
        : [...current, value],
    );
  };

  const toggleEditRole = (value: AdminRole) => {
    setEditRoles((current) =>
      current.includes(value)
        ? current.filter((role) => role !== value)
        : [...current, value],
    );
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
    if (roles.length === 0) {
      setFormError('Pilih minimal satu peran.');
      return;
    }

    setIsCreating(true);

    try {
      await apiFetchWithAuth('/admin/users', {
        method: 'POST',
        body: JSON.stringify({
          email: trimmedEmail,
          password,
          roles,
          full_name: trimmedName || undefined,
        }),
      });

      setFullName('');
      setEmail('');
      setPassword('');
      setRoles(['mentee']);
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

  const handleUpdateRoles = async (user: AdminUser) => {
    setLoadError('');
    setNotice('');

    if (editRoles.length === 0) {
      setLoadError('Pilih minimal satu peran.');
      return;
    }

    setIsUpdatingRoles(true);

    try {
      await apiFetchWithAuth(`/admin/users/${user.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ roles: editRoles }),
      });

      setNotice(`Peran ${user.email} berhasil diperbarui.`);
      setRolesUserId(null);
      setEditRoles([]);
      setReloadToken((token) => token + 1);
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      setLoadError(friendlyAdminError(message));
    } finally {
      setIsUpdatingRoles(false);
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

  return (
    <DashboardShell requiredRole="admin">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-amber-700">
            Administrasi
          </p>
          <h1 className="mt-3 font-serif text-3xl font-semibold text-emerald-950 sm:text-4xl">
            Kelola akun
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-stone-600">
            Buat akun login, atur peran, dan kelola status akses. Akun baru
            langsung dapat masuk dengan kata sandi awal yang Anda tetapkan.
            Untuk menyimpan anggota yang belum punya akun, gunakan{' '}
            <Link
              href="/admin/members"
              className="font-semibold text-emerald-800 underline-offset-4 hover:underline"
            >
              data anggota
            </Link>
            .
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

              <fieldset>
                <legend className={labelClass}>Peran</legend>
                <div className="mt-2 flex flex-wrap gap-4">
                  {ALL_ROLES.map((value) => (
                    <label
                      key={value}
                      className="flex items-center gap-2 text-sm text-stone-600"
                    >
                      <input
                        type="checkbox"
                        checked={roles.includes(value)}
                        onChange={() => toggleRole(value)}
                        disabled={isCreating}
                        className="size-4 rounded border-emerald-900/20 text-emerald-900 focus:ring-emerald-700"
                      />
                      {roleLabels[value]}
                    </label>
                  ))}
                </div>
              </fieldset>

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
                    className="h-24 animate-pulse rounded-xl border border-emerald-900/10 bg-paper"
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
                          {user.member?.full_name ?? user.email}
                        </p>
                        {user.member?.full_name && (
                          <p className="truncate text-sm text-stone-500">
                            {user.email}
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                          {user.roles.map((role) => (
                            <span
                              key={role}
                              className="rounded-full bg-emerald-900/5 px-2.5 py-1 font-medium text-emerald-800"
                            >
                              {roleLabels[role]}
                            </span>
                          ))}
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
                            setRolesUserId(
                              rolesUserId === user.id ? null : user.id,
                            );
                            setEditRoles(user.roles);
                            setResetUserId(null);
                            setNewPassword('');
                          }}
                          className={smallSecondary}
                        >
                          Atur peran
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setResetUserId(
                              resetUserId === user.id ? null : user.id,
                            );
                            setNewPassword('');
                            setRolesUserId(null);
                            setEditRoles([]);
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

                    {rolesUserId === user.id && (
                      <div className="mt-3 rounded-xl border border-emerald-900/10 bg-paper p-3">
                        <p className="text-xs font-medium text-stone-600">
                          Peran untuk {user.email}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-4">
                          {ALL_ROLES.map((value) => (
                            <label
                              key={value}
                              className="flex items-center gap-2 text-sm text-stone-600"
                            >
                              <input
                                type="checkbox"
                                checked={editRoles.includes(value)}
                                onChange={() => toggleEditRole(value)}
                                disabled={isUpdatingRoles}
                                className="size-4 rounded border-emerald-900/20 text-emerald-900 focus:ring-emerald-700"
                              />
                              {roleLabels[value]}
                            </label>
                          ))}
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateRoles(user)}
                            disabled={isUpdatingRoles}
                            className={smallSecondary}
                          >
                            {isUpdatingRoles ? 'Menyimpan…' : 'Simpan peran'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRolesUserId(null);
                              setEditRoles([]);
                            }}
                            className={smallSecondary}
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    )}

                    {resetUserId === user.id && (
                      <div className="mt-3 flex flex-col gap-2 rounded-xl border border-emerald-900/10 bg-paper p-3 sm:flex-row sm:items-center">
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
      </div>
    </DashboardShell>
  );
}
