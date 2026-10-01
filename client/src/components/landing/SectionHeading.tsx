import type { ReactNode } from 'react';

type Props = { eyebrow: string; title: ReactNode; description?: string; align?: 'center' | 'left' };

export function SectionHeading({ eyebrow, title, description, align = 'center' }: Props) {
  const center = align === 'center';
  return (
    <div className={`reveal ${center ? 'mx-auto text-center' : ''} max-w-3xl`}>
      <p className="mb-4 text-[12px] tracking-[0.24em] text-indigo-200/70">{eyebrow}</p>
      <h2
        className="font-heading text-white"
        style={{ fontSize: 'clamp(34px, 5vw, 64px)', lineHeight: 1, letterSpacing: '-0.04em' }}
      >
        {title}
      </h2>
      {description && (
        <p className={`mt-5 text-[17px] leading-relaxed text-white/60 sm:text-[19px] ${center ? 'mx-auto max-w-2xl' : 'max-w-xl'}`}>
          {description}
        </p>
      )}
    </div>
  );
}
