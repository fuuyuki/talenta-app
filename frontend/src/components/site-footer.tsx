import Link from 'next/link';
import { Brand } from './logo';

const footerLinks = [
  { href: '/tentang', label: 'Tentang yayasan' },
  { href: '/#program', label: 'Program' },
  { href: '/artikel', label: 'Artikel' },
  { href: '/login', label: 'Masuk dashboard' },
];

export function SiteFooter() {
  return (
    <footer className="bg-navy-950 text-on-dark">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.6fr_1fr_1fr] lg:px-8">
        <div>
          <Brand tone="dark" />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-on-dark-muted">
            Menumbuhkan talenta muslim yang berilmu, berakhlak, dan siap
            memberi manfaat bagi masyarakat.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-medium text-on-dark">Jelajahi</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {footerLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-on-dark-muted transition-colors hover:text-on-dark"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-medium text-on-dark">Kontak</h2>
          <ul className="mt-3 space-y-2 text-sm text-on-dark-muted">
            <li>
              <a
                href="mailto:halo@talenta-in.digital"
                className="transition-colors hover:text-on-dark"
              >
                halo@talenta-in.digital
              </a>
            </li>
            <li>Indonesia</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-rule-dark">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-on-dark-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© Yayasan Talenta Insan Nusantara.</p>
          <p>Menumbuhkan talenta, menebar manfaat.</p>
        </div>
      </div>
    </footer>
  );
}
