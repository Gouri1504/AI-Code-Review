import { useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useSignOut } from '../auth/UserMenu';
import { NAV_MOBILE } from '../content';
import { Link } from '../router';

type Props = { open: boolean; onClose: () => void };

export function MobileMenu({ open, onClose }: Props) {
  const { user, loading } = useAuth();
  const signOut = useSignOut();
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-[55] bg-black/90 backdrop-blur-2xl transition-[opacity,visibility] duration-500 md:hidden ${
        open ? 'visible opacity-100' : 'invisible opacity-0'
      }`}
      aria-hidden={!open}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{ background: 'radial-gradient(60% 40% at 50% 30%, rgba(99,102,241,0.18), transparent 70%)' }}
      />
      <nav className="relative flex h-full flex-col justify-center px-8 pb-10 pt-24">
        <ul className="flex flex-col gap-1">
          {NAV_MOBILE.map((item, i) => (
            <li
              key={item.label}
              className="transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                transitionDelay: open ? `${120 + i * 55}ms` : '0ms',
                opacity: open ? 1 : 0,
                transform: open ? 'none' : 'translateY(24px)',
              }}
            >
              <Link
                href={item.href}
                onClick={onClose}
                tabIndex={open ? 0 : -1}
                className="font-heading block py-2 text-[40px] leading-tight tracking-tight text-white/85 transition-colors hover:text-white"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div
          className="mt-10 transition-[opacity,transform] duration-500"
          style={{
            transitionDelay: open ? `${120 + NAV_MOBILE.length * 55}ms` : '0ms',
            opacity: open ? 1 : 0,
            transform: open ? 'none' : 'translateY(24px)',
          }}
        >
          <Link
            href="/workspace"
            onClick={onClose}
            tabIndex={open ? 0 : -1}
            className="inline-flex w-full items-center justify-center rounded-full bg-white px-6 py-4 text-[16px] font-medium text-black"
          >
            Open Workspace
          </Link>
          {!loading &&
            (user ? (
              <div className="mt-4 flex items-center justify-between gap-3 text-[14px]">
                <span className="min-w-0 truncate text-white/50">{user.displayName || user.email}</span>
                <button
                  type="button"
                  tabIndex={open ? 0 : -1}
                  onClick={() => {
                    onClose();
                    void signOut();
                  }}
                  className="shrink-0 rounded-full border border-white/15 px-4 py-2 text-white/80 transition-colors hover:border-white/30 hover:text-white"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={onClose}
                tabIndex={open ? 0 : -1}
                className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-white/15 px-6 py-4 text-[16px] text-white/85"
              >
                Sign in
              </Link>
            ))}
        </div>
      </nav>
    </div>
  );
}
