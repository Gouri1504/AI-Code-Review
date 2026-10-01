import { useSyncExternalStore } from 'react';

function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
  );
}

/** True on touch-first devices (phones, tablets), where parallax and cursor effects are disabled. */
export function useIsTouch(): boolean {
  return useMediaQuery('(hover: none), (pointer: coarse)');
}

export function useReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/** Pointer-driven effects are enabled only for fine pointers without reduced motion. */
export function usePointerFx(): boolean {
  const touch = useIsTouch();
  const reduced = useReducedMotion();
  return !touch && !reduced;
}
