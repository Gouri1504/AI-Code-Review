import { BRAND } from '../content';
import { Link } from '../router';

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className="font-heading group inline-flex items-center gap-2 text-[20px] tracking-tight text-white sm:text-[25px]"
      aria-label={`${BRAND.name} home`}
    >
      <span className="animate-sparkle text-gradient text-[0.85em] leading-none">✦</span>
      {compact ? (
        <span className="truncate">{BRAND.short}</span>
      ) : (
        <>
          <span className="truncate md:hidden xl:inline">{BRAND.name}</span>
          <span className="hidden truncate md:inline xl:hidden">{BRAND.short}</span>
        </>
      )}
    </Link>
  );
}
