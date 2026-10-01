import { useRef } from 'react';
import { usePointerFx } from '../hooks/useMedia';
import { useMouseFrame } from '../hooks/useMouse';

const INTERACTIVE = 'a, button, [data-interactive], input, textarea, select';

/** A soft radial light that trails the cursor and swells over interactive elements. */
export function CursorGlow() {
  const enabled = usePointerFx();
  const ref = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -1000, y: -1000, scale: 1, opacity: 0 });

  useMouseFrame((state) => {
    const el = ref.current;
    if (!el) return;
    const p = pos.current;
    const { x, y } = state.client;
    if (x < -1000) return;
    const target = document.elementFromPoint(x, y);
    const hot = Boolean(target?.closest(INTERACTIVE));
    const lag = 0.14;
    p.x += (x - p.x) * lag;
    p.y += (y - p.y) * lag;
    p.scale += ((hot ? 1.6 : 1) - p.scale) * 0.12;
    p.opacity += ((hot ? 1 : 0.6) - p.opacity) * 0.12;
    el.style.transform = `translate3d(${p.x - 300}px, ${p.y - 300}px, 0) scale(${p.scale.toFixed(3)})`;
    el.style.opacity = p.opacity.toFixed(3);
  });

  if (!enabled) return null;
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[60] h-[600px] w-[600px] rounded-full opacity-0 mix-blend-screen will-change-transform"
      style={{
        background: 'radial-gradient(circle, rgba(129,140,248,0.10) 0%, rgba(96,165,250,0.05) 28%, transparent 60%)',
      }}
    />
  );
}
