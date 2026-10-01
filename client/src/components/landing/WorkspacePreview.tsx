import { useReveal } from '../../hooks/useReveal';
import { Icon } from '../Icon';
import { MagneticButton } from '../MagneticButton';
import { SectionHeading } from './SectionHeading';

const CODE = [
  ['kw', 'export async function'],
  ['fn', ' getUserOrders'],
  ['p', '(userId, page) {'],
];

const FINDINGS = [
  { sev: 'CRITICAL', color: 'text-rose-300 border-rose-400/30 bg-rose-400/10', title: 'SQL injection via string concatenation', line: 'L4' },
  { sev: 'HIGH', color: 'text-orange-300 border-orange-400/30 bg-orange-400/10', title: 'Off-by-one: loop reads orders[length]', line: 'L8' },
  { sev: 'MEDIUM', color: 'text-amber-200 border-amber-300/30 bg-amber-300/10', title: 'Division by zero when no orders', line: 'L17' },
];

export function WorkspacePreview() {
  const ref = useReveal<HTMLElement>();
  return (
    <section id="workspace" ref={ref} className="relative scroll-mt-24 px-5 py-28 sm:px-8 sm:py-36">
      <SectionHeading
        eyebrow="THE WORKSPACE"
        title={
          <>
            An IDE-grade canvas <span className="text-white/40">for AI.</span>
          </>
        }
        description="Paste a file, drop a diff, or describe a feature. Pick a workflow and watch the answer stream in, then keep the conversation going on the same code."
      />

      <div className="reveal relative mx-auto mt-16 max-w-6xl" style={{ ['--delay' as string]: '120ms' }}>
        <div
          aria-hidden="true"
          className="absolute -inset-x-10 -inset-y-16 -z-10 opacity-60 blur-3xl"
          style={{ background: 'radial-gradient(50% 50% at 50% 50%, rgba(99,102,241,0.25), transparent 70%)' }}
        />
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#090909]/90 shadow-[0_40px_120px_-40px_rgba(79,70,229,0.45)] backdrop-blur">
          {/* Title bar */}
          <div className="flex items-center gap-2 border-b border-white/[0.07] px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="font-code ml-3 text-[12px] text-white/40">orders.ts — AI Code Review</span>
          </div>

          <div className="grid md:grid-cols-[180px_1fr_1fr]">
            {/* Rail */}
            <div className="hidden border-r border-white/[0.07] p-3 md:block">
              {(['review', 'bug', 'plus', 'shield', 'flask'] as const).map((icon, i) => (
                <div
                  key={icon}
                  className={`mb-1 flex items-center gap-2 rounded-lg px-2.5 py-2 text-[12px] ${
                    i === 0 ? 'bg-white/[0.07] text-white' : 'text-white/45'
                  }`}
                >
                  <Icon name={icon} className="h-3.5 w-3.5" />
                  {['Review', 'Debug', 'Add Feature', 'Security', 'Tests'][i]}
                </div>
              ))}
            </div>

            {/* Code */}
            <div className="font-code border-b border-white/[0.07] p-5 text-[12.5px] leading-6 md:border-b-0 md:border-r">
              {[
                <>
                  {CODE.map(([k, t]) => (
                    <span key={t} className={k === 'kw' ? 'text-violet-300' : k === 'fn' ? 'text-sky-300' : 'text-white/70'}>
                      {t}
                    </span>
                  ))}
                </>,
                <>
                  <span className="text-violet-300">  const</span>
                  <span className="text-white/70"> query = </span>
                  <span className="rounded bg-rose-400/15 text-emerald-200">"SELECT * FROM orders WHERE id = " + userId</span>
                </>,
                <span className="text-white/70">  const orders = await db.query(query);</span>,
                <span className="text-white/30">  </span>,
                <>
                  <span className="text-violet-300">  for</span>
                  <span className="text-white/70"> (let i = 0; </span>
                  <span className="rounded bg-orange-400/15 text-white/80">i &lt;= orders.length</span>
                  <span className="text-white/70">; i++) {'{'}</span>
                </>,
                <span className="text-white/70">    total += orders[i].amount;</span>,
                <span className="text-white/70">  {'}'}</span>,
              ].map((line, i) => (
                <div key={i} className="flex gap-4 whitespace-pre">
                  <span className="w-4 shrink-0 select-none text-right text-white/20">{i + 1}</span>
                  <span className="min-w-0 truncate">{line}</span>
                </div>
              ))}
            </div>

            {/* Result */}
            <div className="p-5">
              <div className="mb-4 flex items-center gap-2 text-[12px] text-white/50">
                <span className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Review complete · 3 findings
              </div>
              <ul className="space-y-2.5">
                {FINDINGS.map((f) => (
                  <li key={f.title} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-md border px-1.5 py-0.5 text-[10px] tracking-wider ${f.color}`}>{f.sev}</span>
                      <span className="font-code text-[11px] text-white/35">{f.line}</span>
                    </div>
                    <p className="mt-1.5 text-[13.5px] text-white/85">{f.title}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <MagneticButton href="/workspace">
            Open Workspace
            <Icon name="arrowRight" className="h-4 w-4" />
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
