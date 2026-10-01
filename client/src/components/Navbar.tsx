import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { UserMenu } from '../auth/UserMenu';
import { NAV_DESKTOP } from '../content';
import { Link } from '../router';
import { Logo } from './Logo';
import { MagneticButton } from './MagneticButton';
import { MobileMenu } from './MobileMenu';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed left-0 right-0 top-0 z-50 px-5 py-4 transition-[background-color,border-color,backdrop-filter] duration-500 sm:px-8 sm:py-5 ${
          scrolled && !open ? 'border-b border-white/[0.07] bg-[#050505]/70 backdrop-blur-xl' : 'border-b border-transparent'
        }`}
      >
        <nav className="mx-auto flex max-w-[1400px] items-center justify-between gap-6">
          <div className="relative z-[70] min-w-0">
            <Logo />
          </div>

          <ul className="hidden items-center gap-0.5 md:flex">
            {NAV_DESKTOP.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="rounded-full px-2.5 py-2 text-[14px] lg:px-3.5 text-white/60 transition-colors duration-200 hover:bg-white/[0.05] hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-3 md:flex">
            {!loading && !user && (
              <Link
                href="/login"
                className="rounded-full px-3.5 py-2 text-[14px] text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white"
              >
                Sign in
              </Link>
            )}
            <MagneticButton href="/workspace" className="px-5! py-2.5! text-[14px]!">
              Open Workspace
            </MagneticButton>
            <UserMenu />
          </div>

          <button
            type="button"
            className="relative z-[70] -mr-2 flex h-10 w-10 items-center justify-center rounded-full md:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <span className="relative block h-3.5 w-5">
              <span
                className={`absolute left-0 top-0 h-[1.5px] w-5 rounded bg-white transition-transform duration-300 ${
                  open ? 'translate-y-[6px] rotate-45' : ''
                }`}
              />
              <span
                className={`absolute left-0 top-[6px] h-[1.5px] w-5 rounded bg-white transition-opacity duration-200 ${open ? 'opacity-0' : ''}`}
              />
              <span
                className={`absolute left-0 top-3 h-[1.5px] w-5 rounded bg-white transition-transform duration-300 ${
                  open ? '-translate-y-[6px] -rotate-45' : ''
                }`}
              />
            </span>
          </button>
        </nav>
      </header>
      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </>
  );
}
