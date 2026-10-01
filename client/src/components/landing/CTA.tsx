import { BRAND } from '../../content';
import { useReveal } from '../../hooks/useReveal';
import { Icon } from '../Icon';
import { Logo } from '../Logo';
import { MagneticButton } from '../MagneticButton';

export function CTA() {
  const ref = useReveal<HTMLElement>();
  return (
    <section ref={ref} className="relative overflow-hidden px-5 py-32 sm:px-8 sm:py-44">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: 'radial-gradient(50% 60% at 50% 100%, rgba(79,70,229,0.22), transparent 70%)' }}
      />
      <div className="reveal relative mx-auto max-w-4xl text-center">
        <h2
          className="font-heading"
          style={{ fontSize: 'clamp(40px, 6.5vw, 88px)', lineHeight: 0.95, letterSpacing: '-0.05em' }}
        >
          Ship better software,
          <br />
          <span className="text-gradient">starting now.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-[18px] text-white/60">{BRAND.supporting}</p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <MagneticButton href="/workspace?w=review">
            Start Reviewing
            <Icon name="arrowRight" className="h-4 w-4" />
          </MagneticButton>
          <MagneticButton href="/#features" variant="secondary">
            See all features
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-white/[0.07] px-5 py-10 sm:px-8">
      <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div>
          <Logo />
          <p className="mt-2 text-[14px] text-white/40">{BRAND.tagline}</p>
        </div>
        <p className="text-[13px] text-white/35">© {new Date().getFullYear()} {BRAND.name}</p>
      </div>
    </footer>
  );
}
