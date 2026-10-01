import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import { usePointerFx } from './useMedia';

/**
 * Shared pointer state. `target` is the raw normalized position (-1..1), `current`
 * eases toward it every frame. Consumers subscribe to the frame tick and write
 * transforms directly to DOM nodes, so React never re-renders on mouse move.
 */
export type MouseState = {
  target: { x: number; y: number };
  current: { x: number; y: number };
  client: { x: number; y: number };
  enabled: boolean;
};

type Tick = (state: MouseState, dt: number) => void;

type Ctx = { state: MouseState; subscribe: (fn: Tick) => () => void };

const MouseContext = createContext<Ctx | null>(null);

const EASE = 0.06;

export function MouseProvider({ children }: { children: ReactNode }) {
  const enabled = usePointerFx();
  const stateRef = useRef<MouseState>({
    target: { x: 0, y: 0 },
    current: { x: 0, y: 0 },
    client: { x: -9999, y: -9999 },
    enabled,
  });
  const subs = useRef(new Set<Tick>());
  stateRef.current.enabled = enabled;

  useEffect(() => {
    const state = stateRef.current;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      state.client.x = e.clientX;
      state.client.y = e.clientY;
      state.target.x = (e.clientX / window.innerWidth) * 2 - 1;
      state.target.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      if (!state.enabled) {
        state.target.x = state.target.y = 0;
      }
      // Frame-rate independent lerp.
      const k = 1 - Math.pow(1 - EASE, dt / 16.67);
      state.current.x += (state.target.x - state.current.x) * k;
      state.current.y += (state.target.y - state.current.y) * k;
      subs.current.forEach((fn) => fn(state, dt));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  const ctx = useRef<Ctx>({
    state: stateRef.current,
    subscribe: (fn) => {
      subs.current.add(fn);
      return () => subs.current.delete(fn);
    },
  });

  return <MouseContext.Provider value={ctx.current}>{children}</MouseContext.Provider>;
}

/** Run `fn` every animation frame with the smoothed mouse state. */
export function useMouseFrame(fn: Tick) {
  const ctx = useContext(MouseContext);
  const fnRef = useRef(fn);
  fnRef.current = fn;
  useEffect(() => {
    if (!ctx) return;
    return ctx.subscribe((s, dt) => fnRef.current(s, dt));
  }, [ctx]);
}
