"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getSession, saveSession, type LoginResponse } from "@/lib/auth";
import { Brand } from "@/components/logo";
import { GeometricPattern } from "@/components/geometric-pattern";

const featureList = [
  "Terhubung dengan mentor berpengalaman",
  "Pantau sesi dan perkembangan",
  "Dibangun untuk pengembangan kader",
];

function friendlyError(message: string) {
  if (!message || message === "Failed to fetch") {
    return "Tidak dapat terhubung ke server. Silakan coba lagi.";
  }
  if (message === "Invalid credentials") {
    return "Email atau kata sandi salah.";
  }
  if (message === "Account is inactive") {
    return "Akun Anda tidak aktif. Hubungi administrator.";
  }
  if (message === "Account has no role assigned") {
    return "Akun Anda belum memiliki peran. Hubungi administrator.";
  }
  if (message.includes("429")) {
    return "Terlalu banyak percobaan masuk. Silakan coba lagi beberapa saat.";
  }
  if (message.startsWith("Request failed with status")) {
    return "Tidak dapat terhubung ke server. Silakan coba lagi.";
  }
  return message;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (getSession()) router.replace("/dashboard");
  }, [router]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!event.currentTarget.checkValidity()) {
      event.currentTarget.reportValidity();
      return;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError("Masukkan email dan kata sandi Anda.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const data = (await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: trimmedEmail, password }),
      })) as LoginResponse;

      saveSession(data);
      router.replace("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      setError(friendlyError(message));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <aside className="relative hidden overflow-hidden bg-emerald-950 px-12 py-10 text-white lg:flex lg:w-1/2 lg:flex-col lg:justify-between">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 text-white"
        >
          <GeometricPattern className="opacity-[0.06]" />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-32 size-96 rounded-full bg-amber-300/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 -left-24 size-96 rounded-full bg-emerald-500/20 blur-3xl"
        />

        <div className="relative">
          <Brand tone="dark" />
        </div>

        <div className="relative max-w-md">
          <h1 className="font-serif text-4xl font-semibold leading-tight">
            Tumbuh bersama mentor yang tepat.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-on-dark-muted">
            Talenta mempertemukan mentor dan mentee dalam satu ruang, agar
            setiap sesi membawa Anda lebih dekat ke tujuan.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-on-dark-muted">
            {featureList.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center justify-between gap-4 text-xs text-emerald-100/50">
          <span>Yayasan Talenta Insan Nusantara</span>
          <Link
            href="/"
            className="font-medium text-emerald-100/70 transition hover:text-white"
          >
            Beranda
          </Link>
        </div>
      </aside>

      <main className="flex flex-1 items-center justify-center bg-paper px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-between gap-4 lg:hidden">
            <Brand />
            <Link
              href="/"
              className="text-sm font-medium text-emerald-800 transition hover:text-emerald-950"
            >
              Beranda
            </Link>
          </div>

          <div className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-xl shadow-emerald-950/5 sm:p-8">
            <div className="mb-6">
              <h1 className="font-serif text-2xl font-semibold tracking-tight text-emerald-950">
                Selamat datang kembali
              </h1>
              <p className="mt-1.5 text-sm text-stone-500">
                Masuk untuk melanjutkan ke dashboard.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5" noValidate>
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-emerald-950"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoFocus
                  spellCheck={false}
                  required
                  disabled={isSubmitting}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="nama@email.com"
                  className="w-full rounded-xl border border-emerald-900/15 bg-white px-3.5 py-2.5 text-sm text-emerald-950 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-emerald-950"
                >
                  Kata sandi
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    disabled={isSubmitting}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Masukkan kata sandi"
                    className="w-full rounded-xl border border-emerald-900/15 bg-white px-3.5 py-2.5 pr-11 text-sm text-emerald-950 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={
                      showPassword
                        ? "Sembunyikan kata sandi"
                        : "Tampilkan kata sandi"
                    }
                    aria-pressed={showPassword}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-stone-400 transition hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting && (
                  <span
                    aria-hidden="true"
                    className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                  />
                )}
                {isSubmitting ? "Memproses…" : "Masuk"}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-stone-500">
            Hubungi administrator jika Anda tidak dapat mengakses akun.
          </p>
        </div>
      </main>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden="true"
      className="size-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden="true"
      className="size-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.774 3.162 10.066 7.5a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243"
      />
    </svg>
  );
}
