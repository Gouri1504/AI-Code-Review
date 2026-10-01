import { useRef, type CSSProperties } from 'react';
import { FLOATING_SNIPPETS } from '../../content';
import { useMouseFrame } from '../../hooks/useMouse';

type Placement = {
  left: string;
  top: string;
  depth: number; // 0..1 — nearer snippets move more with the mouse and look sharper
  duration: number;
  delay: number;
  rot: number;
  mobile: boolean;
};

// Hand-placed around the AI Core so snippets frame the headline without covering it.
const PLACEMENTS: Placement[] = [
  { left: '12%', top: '24%', depth: 0.9, duration: 9, delay: 0, rot: -4, mobile: true },
  { left: '79%', top: '20%', depth: 0.6, duration: 11, delay: 1.2, rot: 3, mobile: true },
  { left: '6%', top: '58%', depth: 0.45, duration: 13, delay: 2.4, rot: 2, mobile: false },
  { left: '86%', top: '52%', depth: 0.85, duration: 10, delay: 0.6, rot: -3, mobile: false },
  { left: '20%', top: '82%', depth: 0.55, duration: 12, delay: 3.1, rot: 5, mobile: false },
  { left: '72%', top: '80%', depth: 0.75, duration: 9.5, delay: 1.8, rot: -5, mobile: false },
  { left: '30%', top: '12%', depth: 0.35, duration: 14, delay: 4, rot: 2, mobile: false },
  { left: '64%', top: '9%', depth: 0.5, duration: 12.5, delay: 2.8, rot: -2, mobile: false },
  { left: '91%', top: '76%', depth: 0.4, duration: 15, delay: 5, rot: 4, mobile: false },
];

export function FloatingCode() {
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useMouseFrame(({ current: { x, y } }) => {
    refs.current.forEach((el, i) => {
      if (!el) return;
      const d = PLACEMENTS[i].depth;
      el.style.transform = `translate3d(${(x * -34 * d).toFixed(2)}px, ${(y * -26 * d).toFixed(2)}px, 0)`;
    });
  });

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 select-none">
      {FLOATING_SNIPPETS.map((snippet, i) => {
        const p = PLACEMENTS[i];
        return (
          <div
            key={snippet}
            ref={(el) => {
              refs.current[i] = el;
            }}
            className={`absolute will-change-transform ${p.mobile ? '' : 'hidden md:block'}`}
            style={{ left: p.left, top: p.top }}
          >
            <span
              className="font-code block whitespace-nowrap rounded-lg border border-white/[0.08] bg-white/[0.025] px-2.5 py-1 text-[11px] text-indigo-100 backdrop-blur-sm sm:text-[13px]"
              style={
                {
                  '--rot': `${p.rot}deg`,
                  '--o-min': (0.18 + p.depth * 0.15).toFixed(2),
                  '--o-max': (0.4 + p.depth * 0.35).toFixed(2),
                  filter: p.depth < 0.5 ? 'blur(0.6px)' : undefined,
                  animation: `float-y ${p.duration}s ease-in-out ${p.delay}s infinite, fade-soft ${p.duration * 0.8}s ease-in-out ${p.delay}s infinite`,
                } as CSSProperties
              }
            >
              <span className="text-sky-300/80">{snippet.split('(')[0]}</span>
              <span className="text-white/50">()</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
