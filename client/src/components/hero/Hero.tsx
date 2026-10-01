import { BRAND } from '../../content';
import { Icon } from '../Icon';
import { MagneticButton } from '../MagneticButton';
import { AICore } from './AICore';
import { FloatingCode } from './FloatingCode';
import { HeroBackground } from './HeroBackground';
import { NeuralCanvas } from './NeuralCanvas';

const HEADING_LINES = [
  { text: 'Review code.', gradient: false },
  { text: 'Fix bugs.', gradient: false },
  { text: 'Build better software.', gradient: true },
];

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 pb-20 pt-32 sm:px-8">
      <HeroBackground />
      <NeuralCanvas />
      <div className="absolute inset-0 opacity-[0.55] sm:opacity-70">
        <AICore />
      </div>
      <FloatingCode />

      {/* Legibility scrim behind the text only */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[70%] w-[90%] max-w-5xl -translate-x-1/2 -translate-y-1/2"
        style={{ background: 'radial-gradient(closest-side, rgba(5,5,5,0.55), transparent)' }}
      />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center text-center">
        <div
          className="fade-up mb-8 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-[11px] tracking-[0.22em] text-white/70 backdrop-blur-md"
          style={{ animationDelay: '0ms' }}
        >
          <span className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
          AI ENGINE ONLINE
        </div>

        <h1
          className="font-heading text-white"
          style={{ fontSize: 'clamp(48px, 8vw, 100px)', lineHeight: 0.95, letterSpacing: '-0.05em' }}
        >
          {HEADING_LINES.map((line, i) => (
            <span
              key={line.text}
              className={`hero-line block pb-[0.06em] ${line.gradient ? 'text-gradient' : ''}`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {line.text}
            </span>
          ))}
        </h1>

        <p
          className="fade-up mt-8 max-w-3xl text-white/60"
          style={{ fontSize: 'clamp(18px, 2vw, 24px)', lineHeight: 1.45, animationDelay: '550ms' }}
        >
          {BRAND.heroDescription}
        </p>

        <div className="fade-up mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-4" style={{ animationDelay: '700ms' }}>
          <MagneticButton href="/workspace?w=review">
            Start Reviewing
            <Icon name="arrowRight" className="h-4 w-4" />
          </MagneticButton>
          <MagneticButton href="/#workspace" variant="secondary">
            Explore Workspace
          </MagneticButton>
        </div>
      </div>

      <a
        href="#pipeline"
        aria-label="Scroll to content"
        className="fade-up absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] tracking-[0.3em] text-white/35 sm:flex"
        style={{ animationDelay: '1100ms' }}
      >
        SCROLL
        <span className="h-10 w-px bg-linear-to-b from-white/40 to-transparent" />
      </a>
    </section>
  );
}
