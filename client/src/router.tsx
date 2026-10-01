import { useEffect, useSyncExternalStore, type ComponentProps, type MouseEvent } from 'react';

type Location = { pathname: string; search: string; hash: string };

const listeners = new Set<() => void>();
let snapshot: Location = read();

function read(): Location {
  return { pathname: window.location.pathname, search: window.location.search, hash: window.location.hash };
}

function emit() {
  snapshot = read();
  listeners.forEach((l) => l());
}

window.addEventListener('popstate', emit);

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useLocation(): Location {
  return useSyncExternalStore(subscribe, () => snapshot);
}

function scrollToHash(hash: string) {
  if (!hash) return;
  // Wait a frame so a freshly mounted page has its sections in the DOM.
  requestAnimationFrame(() => {
    document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

export function navigate(href: string, { replace = false }: { replace?: boolean } = {}) {
  const url = new URL(href, window.location.origin);
  const samePage = url.pathname === window.location.pathname;
  if (url.href !== window.location.href) window.history[replace ? 'replaceState' : 'pushState'](null, '', url);
  emit();
  if (url.hash) scrollToHash(url.hash);
  else if (!samePage || url.search !== snapshot.search) window.scrollTo({ top: 0 });
}

/** Scroll to the hash on first load (e.g. opening /#features directly). */
export function useInitialHashScroll() {
  useEffect(() => {
    if (window.location.hash) setTimeout(() => scrollToHash(window.location.hash), 300);
  }, []);
}

/** Redirect on render, replacing the current history entry. */
export function Redirect({ to }: { to: string }) {
  useEffect(() => navigate(to, { replace: true }), [to]);
  return null;
}

/** A same-origin path from a `?next=` param, or the fallback (guards against open redirects). */
export function safeNext(search: string, fallback: string) {
  const next = new URLSearchParams(search).get('next');
  return next && next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\') ? next : fallback;
}

type LinkProps =ComponentProps<'a'> & { href: string };

export function Link({ href, onClick, ...rest }: LinkProps) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (!href.startsWith('/')) return;
    e.preventDefault();
    navigate(href);
  };
  return <a href={href} onClick={handle} {...rest} />;
}
