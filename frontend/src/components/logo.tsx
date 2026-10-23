import Link from 'next/link';

export function LogoMark({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-900 text-amber-300 ${className}`}
    >
      <svg
        viewBox="0 0 32 32"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="size-5"
      >
        <rect x="7.5" y="7.5" width="17" height="17" rx="1.5" />
        <rect
          x="7.5"
          y="7.5"
          width="17"
          height="17"
          rx="1.5"
          transform="rotate(45 16 16)"
        />
      </svg>
    </span>
  );
}

export function Brand({
  href = '/',
  tone = 'light',
  showSubtitle = true,
}: {
  href?: string;
  tone?: 'light' | 'dark';
  showSubtitle?: boolean;
}) {
  const titleClass = tone === 'dark' ? 'text-white' : 'text-emerald-950';
  const subtitleClass =
    tone === 'dark' ? 'text-emerald-100/70' : 'text-emerald-800/70';

  return (
    <Link href={href} className="flex items-center gap-2.5">
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span
          className={`font-serif text-lg font-semibold tracking-tight ${titleClass}`}
        >
          Talenta
        </span>
        {showSubtitle && (
          <span
            className={`mt-1 text-[10px] uppercase tracking-[0.16em] ${subtitleClass}`}
          >
            Insan Nusantara
          </span>
        )}
      </span>
    </Link>
  );
}
