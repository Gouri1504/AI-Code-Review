import { useRef } from 'react';
import { useMouseFrame } from './useMouse';

const MAX_PULL = 12; // px
const TEXT_FACTOR = 0.45; // the label moves less than the button, giving a subtle parallax
const RADIUS = 90; // px beyond the button edge where attraction starts

/**
 * Magnetic hover: when the cursor comes near, the element drifts toward it
 * (max 12px) and its inner label drifts a smaller amount. Eases back on leave.
 */
export function useMagnetic<T extends HTMLElement, L extends HTMLElement>() {
  const ref = useRef<T>(null);
  const labelRef = useRef<L>(null);
  const pos = useRef({ x: 0, y: 0 });

  useMouseFrame((state) => {
    const el = ref.current;
    if (!el) return;
    let tx = 0;
    let ty = 0;
    if (state.enabled) {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = state.client.x - cx;
      const dy = state.client.y - cy;
      const reach = Math.max(r.width, r.height) / 2 + RADIUS;
      const dist = Math.hypot(dx, dy);
      if (dist < reach) {
        const strength = 1 - dist / reach;
        const norm = Math.max(dist, 1);
        const pull = Math.min(MAX_PULL, (dist / 4) * strength + MAX_PULL * strength * 0.5);
        tx = (dx / norm) * pull;
        ty = (dy / norm) * pull;
      }
    }
    const p = pos.current;
    p.x += (tx - p.x) * 0.18;
    p.y += (ty - p.y) * 0.18;
    if (Math.abs(p.x) < 0.01 && Math.abs(p.y) < 0.01 && tx === 0 && ty === 0) {
      if (el.style.transform) {
        el.style.transform = '';
        if (labelRef.current) labelRef.current.style.transform = '';
      }
      return;
    }
    el.style.transform = `translate3d(${p.x.toFixed(2)}px, ${p.y.toFixed(2)}px, 0)`;
    if (labelRef.current) {
      labelRef.current.style.transform = `translate3d(${(p.x * TEXT_FACTOR).toFixed(2)}px, ${(p.y * TEXT_FACTOR).toFixed(2)}px, 0)`;
    }
  });

  return { ref, labelRef };
}
