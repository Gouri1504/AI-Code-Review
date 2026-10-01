import { onSpotlightMove, useReveal } from '../../hooks/useReveal';
import { SectionHeading } from './SectionHeading';

const STEPS = [
  { n: '01', title: 'Bring your code', body: 'Paste a snippet, or upload or drop a file into the editor. Choose the language.' },
  { n: '02', title: 'Pick a workflow', body: 'Review, debug, add a feature, refactor, test, secure, document. Some workflows take a short prompt or error message.' },
  { n: '03', title: 'Iterate in context', body: 'Answers stream live. Ask follow-ups in the chat bar; every turn keeps the same code as context.' },
];

const API = `POST /api/run
Content-Type: application/json

{
  "workflow": "review",
  "language": "TypeScript",
  "code": "export function add(a, b) { return a - b }",
  "prompt": "optional request, error or question"
}

→ text/event-stream
event: delta   data: {"text":"## Summary\\n…"}
event: done    data: {"finishReason":"stop","ms":1840}`;

export function Docs() {
  const ref = useReveal<HTMLElement>();
  return (
    <section id="docs" ref={ref} className="relative scroll-mt-24 px-5 py-28 sm:px-8 sm:py-36">
      <SectionHeading
        eyebrow="DOCUMENTATION"
        title="Three steps. Zero setup."
        description="The workspace runs in your browser and talks to a small API server that streams answers from the Groq API."
      />

      <div className="mx-auto mt-16 grid max-w-6xl gap-3 lg:grid-cols-[1fr_1.15fr]">
        <ol className="grid gap-3">
          {STEPS.map((s, i) => (
            <li
              key={s.n}
              onPointerMove={onSpotlightMove}
              className="spotlight card reveal rounded-2xl p-6"
              style={{ ['--delay' as string]: `${i * 90}ms` }}
            >
              <span className="font-code text-[12px] text-indigo-200/60">{s.n}</span>
              <h3 className="font-heading mt-2 text-[20px] tracking-tight">{s.title}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-white/55">{s.body}</p>
            </li>
          ))}
        </ol>
        <div className="card reveal overflow-hidden rounded-2xl" style={{ ['--delay' as string]: '150ms' }}>
          <div className="border-b border-white/[0.07] px-5 py-3 text-[12px] tracking-[0.18em] text-white/45">API</div>
          <pre className="font-code overflow-x-auto p-5 text-[12.5px] leading-6 text-white/75">{API}</pre>
        </div>
      </div>
    </section>
  );
}
