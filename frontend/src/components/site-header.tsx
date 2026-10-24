import Link from 'next/link';
import { Brand } from './logo';

const navItems = [
  { href: '/tentang', label: 'Tentang' },
  { href: '/#program', label: 'Program' },
  { href: '/artikel', label: 'Artikel' },
  { href: '/#kontak', label: 'Kontak' },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-rule bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Brand />

        <nav
          aria-label="Navigasi utama"
          className="hidden items-center gap-7 md:flex"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-ink-muted transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-sm bg-navy-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-navy-950"
        >
          Masuk
        </Link>
      </div>

      <nav
        aria-label="Navigasi utama seluler"
        className="flex gap-5 overflow-x-auto border-t border-rule px-4 py-2 text-sm md:hidden"
      >
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="whitespace-nowrap text-ink-muted transition-colors hover:text-ink"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
