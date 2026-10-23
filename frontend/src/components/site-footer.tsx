import Link from 'next/link';
import { Brand } from './logo';

const footerLinks = [
  { href: '/tentang', label: 'Tentang Yayasan' },
  { href: '/#program', label: 'Program' },
  { href: '/artikel', label: 'Artikel' },
  { href: '/login', label: 'Masuk Dashboard' },
];

export function SiteFooter() {
  return (
    <footer className="bg-emerald-950 text-emerald-100">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <Brand tone="dark" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-emerald-100/70">
            Menumbuhkan talenta muslim yang berilmu, berakhlak, dan siap
            memberi manfaat bagi masyarakat.
          </p>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
            Jelajahi
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            {footerLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-emerald-100/70 transition hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
            Kontak
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-emerald-100/70">
            <li>
              <a
                href="mailto:halo@talenta-in.digital"
                className="transition hover:text-white"
              >
                halo@talenta-in.digital
              </a>
            </li>
            <li>Indonesia</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-emerald-100/50 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© Yayasan Talenta Insan Nusantara.</p>
          <p>Menumbuhkan talenta, menebar manfaat.</p>
        </div>
      </div>
    </footer>
  );
}
