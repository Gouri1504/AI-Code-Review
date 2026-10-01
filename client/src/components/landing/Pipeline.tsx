import { PIPELINE } from '../../content';
import { useReveal } from '../../hooks/useReveal';
import { SectionHeading } from './SectionHeading';

export function Pipeline() {
  const ref = useReveal<HTMLElement>();
  return (
    <section id="pipeline" ref={ref} className="relative scroll-mt-24 px-5 py-28 sm:px-8 sm:py-36">
      <SectionHeading
        eyebrow="ONE CONTINUOUS FLOW"
        title={
          <>
            From first line <span className="text-white/40">to shipped.</span>
          </>
        }
        description="Every workflow shares the same code context, so understanding feeds review, review feeds fixes, and fixes feed tests — without copy-pasting between tools."
      />

      <div className="mx-auto mt-16 max-w-6xl">
        <ol className="relative flex flex-wrap items-center justify-center gap-x-2 gap-y-4">
          {PIPELINE.map((step, i) => (
            <li
              key={step}
              className="reveal flex items-center gap-2"
              style={{ ['--delay' as string]: `${i * 70}ms` }}
            >
              <span
                className={`rounded-full border px-4 py-2 text-[13px] tracking-[0.12em] sm:text-[14px] ${
                  i === 0 || i === PIPELINE.length - 1
                    ? 'border-indigo-300/40 bg-indigo-400/10 text-white'
                    : 'border-white/10 bg-white/[0.035] text-white/70'
                }`}
              >
                {step.toUpperCase()}
              </span>
              {i < PIPELINE.length - 1 && (
                <svg viewBox="0 0 24 8" className="h-2 w-6 text-white/25" aria-hidden="true">
                  <path d="M0 4h20m-4-3l4 3-4 3" fill="none" stroke="currentColor" strokeWidth="1.2" />
                </svg>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
