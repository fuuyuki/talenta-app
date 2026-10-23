'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetchWithAuth } from '@/lib/api';
import { clearSession } from '@/lib/auth';
import { DashboardShell } from '@/components/dashboard-shell';

type AdminRole = 'admin' | 'mentor' | 'mentee';

type MemberAccount = {
  id: string;
  email: string;
  is_active: boolean;
  roles: AdminRole[];
};

type Member = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  activity_status: string;
  mentorship_tier: string | null;
  created_at: string;
  group: { id: string; name: string } | null;
  account: MemberAccount | null;
};

type MemberListResponse = {
  items: Member[];
  total: number;
  take: number;
  skip: number;
};

const PAGE_SIZE = 25;

const ALL_STATUSES = ['active', 'inactive', 'mutated', 'lost contact'] as const;

const statusLabels: Record<string, string> = {
  active: 'Aktif',
  inactive: 'Tidak aktif',
  mutated: 'Pindah',
  'lost contact': 'Hilang kontak',
};

const statusStyles: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-800',
  inactive: 'bg-stone-100 text-stone-600',
  mutated: 'bg-amber-100 text-amber-800',
  'lost contact': 'bg-red-100 text-red-700',
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
  'rounded-full border border-emerald-900/15 px-3 py-1.5 text-xs font-semibold text-emerald-900 transition hover:border-emerald-900/40 hover:bg-[#fbf9f4] disabled:cursor-not-allowed disabled:opacity-60';

function friendlyMemberError(message: string) {
  if (!message || message === 'Failed to fetch') {
    return 'Tidak dapat terhubung ke server. Silakan coba lagi.';
  }
  if (message.includes('already has an account')) {
    return 'Anggota ini sudah memiliki akun.';
  }
  if (message.includes('with that email already exists')) {
    return 'Email tersebut sudah dipakai anggota lain.';
  }
  if (message.includes('already uses that email')) {
    return 'Email tersebut sudah dipakai anggota lain.';
  }
  if (message.includes('Email already exists')) {
    return 'Email sudah terdaftar sebagai akun.';
  }
  if (message.includes('Password must be at least 12')) {
    return 'Kata sandi minimal 12 karakter.';
  }
  if (message.includes('Invalid email')) {
    return 'Format email tidak valid.';
  }
  if (message.includes('At least one role')) {
    return 'Pilih minimal satu peran.';
  }
  if (message.includes('Invalid reference id')) {
    return 'Data referensi (sekolah/kota/pekerjaan) tidak valid.';
  }
  if (message.includes('full_name is required')) {
    return 'Nama lengkap wajib diisi.';
  }
  if (message.includes('403')) {
    return 'Anda tidak memiliki akses admin.';
  }
  return message;
}

export default function AdminMembersPage() {
  const router = useRouter();

  const [members, setMembers] = useState<Member[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [accountFilter, setAccountFilter] = useState<
    'all' | 'with' | 'without'
  >('all');

  const [loadError, setLoadError] = useState('');
  const [notice, setNotice] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('active');
  const [formError, setFormError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const [accountMemberId, setAccountMemberId] = useState<string | null>(null);
  const [accountEmail, setAccountEmail] = useState('');
  const [accountPassword, setAccountPassword] = useState('');
  const [accountRoles, setAccountRoles] = useState<AdminRole[]>(['mentee']);
  const [accountError, setAccountError] = useState('');
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  const [statusMemberId, setStatusMemberId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (accountFilter === 'with') params.set('has_account', 'true');
    if (accountFilter === 'without') params.set('has_account', 'false');
    params.set('take', String(PAGE_SIZE));
    params.set('skip', String(page * PAGE_SIZE));

    apiFetchWithAuth(`/admin/members?${params.toString()}`)
      .then((data) => {
        if (cancelled) return;
        const payload = data as MemberListResponse;
        setMembers(payload.items);
        setTotal(payload.total);
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

        setLoadError('Gagal memuat data anggota.');
      });

    return () => {
      cancelled = true;
    };
  }, [accountFilter, page, reloadToken, router, search]);

  const reload = () => {
    setLoadError('');
    setMembers(null);
    setReloadToken((token) => token + 1);
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(0);
    setSearch(searchInput.trim());
  };

  const toggleAccountRole = (value: AdminRole) => {
    setAccountRoles((current) =>
      current.includes(value)
        ? current.filter((role) => role !== value)
        : [...current, value],
    );
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    setNotice('');

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      setFormError('Nama lengkap wajib diisi.');
      return;
    }

    setIsCreating(true);

    try {
      await apiFetchWithAuth('/admin/members', {
        method: 'POST',
        body: JSON.stringify({
          full_name: trimmedName,
          email: trimmedEmail || undefined,
          phone: trimmedPhone || undefined,
          activity_status: status,
        }),
      });

      setFullName('');
      setEmail('');
      setPhone('');
      setStatus('active');
      setNotice('Data anggota berhasil disimpan.');
      setPage(0);
      setReloadToken((token) => token + 1);
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      setFormError(friendlyMemberError(message));
    } finally {
      setIsCreating(false);
    }
  };

  const openAccountForm = (member: Member) => {
    setAccountError('');
    setNotice('');
    setAccountPassword('');
    setAccountRoles(['mentee']);
    setAccountMemberId(accountMemberId === member.id ? null : member.id);
    setAccountEmail(member.email ?? '');
  };

  const handleCreateAccount = async (
    event: FormEvent<HTMLFormElement>,
    member: Member,
  ) => {
    event.preventDefault();
    setAccountError('');
    setNotice('');

    const trimmedEmail = accountEmail.trim();

    if (!trimmedEmail) {
      setAccountError('Email wajib diisi.');
      return;
    }
    if (accountPassword.length < 12) {
      setAccountError('Kata sandi minimal 12 karakter.');
      return;
    }
    if (accountRoles.length === 0) {
      setAccountError('Pilih minimal satu peran.');
      return;
    }

    setIsCreatingAccount(true);

    try {
      await apiFetchWithAuth(`/admin/members/${member.id}/account`, {
        method: 'POST',
        body: JSON.stringify({
          email: trimmedEmail,
          password: accountPassword,
          roles: accountRoles,
        }),
      });

      setAccountMemberId(null);
      setAccountPassword('');
      setNotice(`Akun untuk ${member.full_name} berhasil dibuat.`);
      setReloadToken((token) => token + 1);
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      setAccountError(friendlyMemberError(message));
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const updateStatus = async (member: Member, nextStatus: string) => {
    setLoadError('');
    setNotice('');
    setStatusMemberId(member.id);

    try {
      await apiFetchWithAuth(`/admin/members/${member.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ activity_status: nextStatus }),
      });

      setNotice(
        `${member.full_name} ditandai sebagai ${
          statusLabels[nextStatus] ?? nextStatus
        }.`,
      );
      setReloadToken((token) => token + 1);
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      setLoadError(friendlyMemberError(message));
    } finally {
      setStatusMemberId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <DashboardShell requiredRole="admin">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
            Administrasi
          </p>
          <h1 className="mt-3 font-serif text-3xl font-semibold text-emerald-950 sm:text-4xl">
            Data anggota
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-stone-600">
            Data anggota berdiri sendiri dari akun login. Simpan seluruh anggota
            lebih dulu, lalu buatkan akun hanya untuk mereka yang sudah aktif
            menggunakan platform.
          </p>
          <p className="mt-2 text-sm text-stone-500">
            Butuh mengatur peran atau kata sandi?{' '}
            <Link
              href="/admin/users"
              className="font-semibold text-emerald-800 underline-offset-4 hover:underline"
            >
              Buka kelola akun
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
          <section className="h-fit rounded-2xl border border-emerald-900/10 bg-white p-6 shadow-sm">
            <h2 className="font-serif text-xl font-semibold text-emerald-950">
              Tambah data anggota
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Belum perlu membuat akun. Akun bisa ditambahkan kapan saja.
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
                <label htmlFor="member_name" className={labelClass}>
                  Nama lengkap
                </label>
                <input
                  id="member_name"
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
                <label htmlFor="member_email" className={labelClass}>
                  Email{' '}
                  <span className="font-normal text-stone-400">(opsional)</span>
                </label>
                <input
                  id="member_email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="nama@contoh.com"
                  disabled={isCreating}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="member_phone" className={labelClass}>
                  Nomor HP{' '}
                  <span className="font-normal text-stone-400">(opsional)</span>
                </label>
                <input
                  id="member_phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="08xxxxxxxxxx"
                  disabled={isCreating}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="member_status" className={labelClass}>
                  Keaktifan
                </label>
                <select
                  id="member_status"
                  name="activity_status"
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  disabled={isCreating}
                  className={inputClass}
                >
                  {ALL_STATUSES.map((value) => (
                    <option key={value} value={value}>
                      {statusLabels[value]}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className={primaryButton}
              >
                {isCreating ? 'Menyimpan…' : 'Simpan anggota'}
              </button>
            </form>
          </section>

          <section className="rounded-2xl border border-emerald-900/10 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-serif text-xl font-semibold text-emerald-950">
                Daftar anggota
              </h2>
              <span className="text-xs font-medium text-stone-500">
                {total} anggota
              </span>
            </div>

            <form
              onSubmit={handleSearch}
              className="mt-4 flex flex-wrap items-center gap-2"
            >
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Cari nama, email, atau nomor HP"
                aria-label="Cari anggota"
                className={`${inputClass} flex-1`}
              />
              <select
                value={accountFilter}
                onChange={(event) => {
                  setPage(0);
                  setAccountFilter(
                    event.target.value as 'all' | 'with' | 'without',
                  );
                }}
                aria-label="Filter akun"
                className={`${inputClass} w-auto`}
              >
                <option value="all">Semua</option>
                <option value="with">Sudah punya akun</option>
                <option value="without">Belum punya akun</option>
              </select>
              <button type="submit" className={smallSecondary}>
                Cari
              </button>
            </form>

            {members === null && !loadError && (
              <p className="mt-6 text-sm text-stone-500">Memuat…</p>
            )}

            {members && members.length === 0 && (
              <p className="mt-6 text-sm text-stone-500">
                Belum ada anggota yang cocok. Tambahkan data melalui formulir di
                samping.
              </p>
            )}

            {members && members.length > 0 && (
              <ul className="mt-5 divide-y divide-emerald-900/10">
                {members.map((member) => (
                  <li key={member.id} className="py-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-emerald-950">
                          {member.full_name}
                        </p>
                        <p className="truncate text-sm text-stone-500">
                          {member.email ?? 'Belum ada email'}
                          {member.phone ? ` · ${member.phone}` : ''}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                          <span
                            className={`rounded-full px-2.5 py-1 font-medium ${
                              statusStyles[member.activity_status] ??
                              'bg-stone-100 text-stone-600'
                            }`}
                          >
                            {statusLabels[member.activity_status] ??
                              member.activity_status}
                          </span>

                          {member.group && (
                            <span className="rounded-full bg-emerald-900/5 px-2.5 py-1 font-medium text-emerald-800">
                              {member.group.name}
                            </span>
                          )}

                          {member.account ? (
                            <>
                              <span className="rounded-full border border-emerald-900/15 px-2.5 py-1 font-medium text-emerald-900">
                                Akun: {member.account.email}
                              </span>
                              {member.account.roles.map((role) => (
                                <span
                                  key={role}
                                  className="rounded-full bg-emerald-900/5 px-2.5 py-1 font-medium text-emerald-800"
                                >
                                  {roleLabels[role]}
                                </span>
                              ))}
                              {!member.account.is_active && (
                                <span className="rounded-full bg-stone-100 px-2.5 py-1 font-medium text-stone-600">
                                  Akun nonaktif
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="rounded-full bg-amber-50 px-2.5 py-1 font-medium text-amber-800">
                              Belum punya akun
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {member.account ? (
                          <Link
                            href="/admin/users"
                            className={smallSecondary}
                          >
                            Kelola akun
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openAccountForm(member)}
                            className={smallSecondary}
                          >
                            {accountMemberId === member.id
                              ? 'Tutup'
                              : 'Buat akun'}
                          </button>
                        )}

                        {member.activity_status === 'active' ? (
                          <button
                            type="button"
                            onClick={() => updateStatus(member, 'inactive')}
                            disabled={statusMemberId === member.id}
                            className={smallSecondary}
                          >
                            Nonaktifkan
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => updateStatus(member, 'active')}
                            disabled={statusMemberId === member.id}
                            className={smallSecondary}
                          >
                            Aktifkan
                          </button>
                        )}
                      </div>
                    </div>

                    {accountMemberId === member.id && (
                      <form
                        onSubmit={(event) =>
                          handleCreateAccount(event, member)
                        }
                        className="mt-4 rounded-xl border border-emerald-900/10 bg-[#fbf9f4] p-4"
                        noValidate
                      >
                        <p className="text-sm font-semibold text-emerald-950">
                          Buat akun login untuk {member.full_name}
                        </p>

                        {accountError && (
                          <div
                            role="alert"
                            className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"
                          >
                            {accountError}
                          </div>
                        )}

                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <div>
                            <label
                              htmlFor={`account_email_${member.id}`}
                              className={labelClass}
                            >
                              Email login
                            </label>
                            <input
                              id={`account_email_${member.id}`}
                              type="email"
                              autoComplete="off"
                              value={accountEmail}
                              onChange={(event) =>
                                setAccountEmail(event.target.value)
                              }
                              disabled={isCreatingAccount}
                              className={inputClass}
                            />
                          </div>

                          <div>
                            <label
                              htmlFor={`account_password_${member.id}`}
                              className={labelClass}
                            >
                              Kata sandi awal
                            </label>
                            <input
                              id={`account_password_${member.id}`}
                              type="password"
                              autoComplete="new-password"
                              value={accountPassword}
                              onChange={(event) =>
                                setAccountPassword(event.target.value)
                              }
                              placeholder="Minimal 12 karakter"
                              disabled={isCreatingAccount}
                              className={inputClass}
                            />
                          </div>
                        </div>

                        <fieldset className="mt-3">
                          <legend className={labelClass}>Peran</legend>
                          <div className="flex flex-wrap gap-4">
                            {ALL_ROLES.map((role) => (
                              <label
                                key={role}
                                className="flex items-center gap-2 text-sm text-emerald-950"
                              >
                                <input
                                  type="checkbox"
                                  checked={accountRoles.includes(role)}
                                  onChange={() => toggleAccountRole(role)}
                                  disabled={isCreatingAccount}
                                  className="h-4 w-4 rounded border-emerald-900/30 text-emerald-900 focus:ring-emerald-700"
                                />
                                {roleLabels[role]}
                              </label>
                            ))}
                          </div>
                        </fieldset>

                        <button
                          type="submit"
                          disabled={isCreatingAccount}
                          className={`${primaryButton} mt-4 sm:w-auto sm:px-5`}
                        >
                          {isCreatingAccount ? 'Membuat akun…' : 'Buat akun'}
                        </button>
                      </form>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {total > PAGE_SIZE && (
              <div className="mt-5 flex items-center justify-between gap-3 border-t border-emerald-900/10 pt-4">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(0, current - 1))}
                  disabled={page === 0}
                  className={smallSecondary}
                >
                  Sebelumnya
                </button>
                <span className="text-xs text-stone-500">
                  Halaman {page + 1} dari {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPage((current) =>
                      current + 1 < totalPages ? current + 1 : current,
                    )
                  }
                  disabled={page + 1 >= totalPages}
                  className={smallSecondary}
                >
                  Berikutnya
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </DashboardShell>
  );
}
