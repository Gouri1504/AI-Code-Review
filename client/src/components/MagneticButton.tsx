import type { ReactNode } from 'react';
import { useMagnetic } from '../hooks/useMagnetic';
import { Link } from '../router';

type Props = {
  href: string;
  variant?: 'primary' | 'secondary';
  children: ReactNode;
  className?: string;
};

const VARIANTS = {
  primary: 'bg-white text-black hover:shadow-[0_0_40px_-6px_rgba(167,139,250,0.55)]',
  secondary: 'bg-white/5 border border-white/15 text-white backdrop-blur-md hover:bg-white/[0.09] hover:border-white/30',
};

export function MagneticButton({ href, variant = 'primary', children, className = '' }: Props) {
  const { ref, labelRef } = useMagnetic<HTMLAnchorElement, HTMLSpanElement>();
  return (
    <Link
      ref={ref}
      href={href}
      data-interactive
      className={`relative inline-flex items-center justify-center rounded-full px-6 py-3 text-[15px] font-medium will-change-transform transition-[background-color,border-color,box-shadow] duration-300 ${VARIANTS[variant]} ${className}`}
    >
      <span ref={labelRef} className="inline-flex items-center gap-2 will-change-transform">
        {children}
      </span>
    </Link>
  );
}
