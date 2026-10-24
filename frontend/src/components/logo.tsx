import Image from 'next/image';
import Link from 'next/link';

/**
 * The yayasan mark, cropped to the artwork (`viewBox` set on the source file).
 * Rendered unoptimized so the SVG is served as an image, not through the
 * raster optimizer.
 */
export function LogoMark({
  className = '',
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/brand/tin-logo.svg"
      alt=""
      width={640}
      height={985}
      unoptimized
      priority={priority}
      className={`h-10 w-auto ${className}`}
    />
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
  const titleClass = tone === 'dark' ? 'text-on-dark' : 'text-ink';
  const subtitleClass =
    tone === 'dark' ? 'text-on-dark-muted' : 'text-ink-muted';

  return (
    <Link href={href} className="flex items-center gap-3">
      {tone === 'dark' ? (
        <span className="grid place-items-center rounded-sm bg-paper p-1">
          <LogoMark className="h-8" />
        </span>
      ) : (
        <LogoMark priority />
      )}

      <span className="flex flex-col leading-none">
        <span
          className={`font-serif text-lg font-semibold tracking-tight ${titleClass}`}
        >
          Talenta
        </span>
        {showSubtitle && (
          <span className={`mt-1 text-[11px] font-medium ${subtitleClass}`}>
            Insan Nusantara
          </span>
        )}
      </span>
    </Link>
  );
}
