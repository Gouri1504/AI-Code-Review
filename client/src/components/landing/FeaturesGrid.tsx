import { WORKFLOWS } from '../../content';
import { onSpotlightMove, useReveal } from '../../hooks/useReveal';
import { Link } from '../../router';
import { Icon } from '../Icon';
import { SectionHeading } from './SectionHeading';

export function FeaturesGrid() {
  const ref = useReveal<HTMLElement>();
  const primary = WORKFLOWS.filter((w) => w.primary);
  const more = WORKFLOWS.filter((w) => !w.primary);

  return (
    <section id="features" ref={ref} className="relative scroll-mt-24 px-5 py-28 sm:px-8 sm:py-36">
      <SectionHeading
        eyebrow="FEATURES"
        title={
          <>
            Everything you do with code.
            <br />
            <span className="text-gradient">Under one roof.</span>
          </>
        }
        description="Eleven core AI workflows, plus an AI coding chat for anything else about your code."
      />

      <div className="mx-auto mt-16 grid max-w-6xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {primary.map((w, i) => (
          <Link
            key={w.id}
            href={`/workspace?w=${w.id}`}
            onPointerMove={onSpotlightMove}
            className="spotlight card reveal group rounded-2xl p-6 transition-[border-color,transform] duration-300 hover:-translate-y-0.5"
            style={{ ['--delay' as string]: `${(i % 3) * 80}ms` }}
          >
            <div className="flex items-start justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-indigo-200 transition-colors group-hover:text-white">
                <Icon name={w.icon} />
              </span>
              <span className="font-code text-[11px] text-white/25">{String(i + 1).padStart(2, '0')}</span>
            </div>
            <h3 className="font-heading mt-6 text-[21px] tracking-tight text-white">{w.title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-white/55">{w.description}</p>
            <span className="mt-6 inline-flex items-center gap-1.5 text-[13px] text-white/40 transition-colors group-hover:text-white/80">
              Open in workspace
              <Icon name="arrowRight" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}

        {/* Twelfth tile: the remaining workspace tools */}
        <div
          onPointerMove={onSpotlightMove}
          className="spotlight card reveal rounded-2xl p-6 sm:col-span-2 lg:col-span-1"
          style={{ ['--delay' as string]: '160ms' }}
        >
          <p className="text-[12px] tracking-[0.2em] text-white/40">ALSO IN THE WORKSPACE</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {more.map((w) => (
              <li key={w.id}>
                <Link
                  href={`/workspace?w=${w.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[13px] text-white/70 transition-colors hover:border-white/25 hover:text-white"
                >
                  <Icon name={w.icon} className="h-3.5 w-3.5" />
                  {w.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
