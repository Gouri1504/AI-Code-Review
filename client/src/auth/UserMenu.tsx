import { useEffect, useRef, useState } from 'react';
import { Icon } from '../components/Icon';
import { Link, navigate } from '../router';
import { useAuth } from './AuthProvider';

export const EDITOR_STORAGE_KEY = 'aicr.editor';

export function Avatar({ className = 'h-8 w-8' }: { className?: string }) {
  const { user } = useAuth();
  const [broken, setBroken] = useState(false);
  const label = user?.displayName || user?.email || '?';
  if (user?.photoURL && !broken) {
    return (
      <img
        src={user.photoURL}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setBroken(true)}
        className={`${className} rounded-full object-cover`}
      />
    );
  }
  return (
    <span
      className={`${className} flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-400/70 to-violet-500/70 text-[13px] font-medium uppercase text-white`}
    >
      {label.charAt(0)}
    </span>
  );
}

/** Leave protected pages first, then sign out, and drop the saved editor draft so the next user starts clean. */
export function useSignOut() {
  const { signOut } = useAuth();
  return async () => {
    navigate('/');
    try {
      localStorage.removeItem(EDITOR_STORAGE_KEY);
    } catch {
      /* storage unavailable */
    }
    await signOut();
  };
}

export function UserMenu({ showWorkspaceLink = false }: { showWorkspaceLink?: boolean }) {
  const { user } = useAuth();
  const signOut = useSignOut();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex rounded-full ring-1 ring-white/15 transition-shadow hover:ring-white/35"
      >
        <Avatar />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-[80] w-64 overflow-hidden rounded-xl border border-white/10 bg-[#0c0c0f]/95 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex items-center gap-3 border-b border-white/[0.07] px-4 py-3.5">
            <Avatar className="h-9 w-9 shrink-0" />
            <div className="min-w-0">
              {user.displayName && <p className="truncate text-[14px] text-white">{user.displayName}</p>}
              <p className="truncate text-[12.5px] text-white/50">{user.email}</p>
            </div>
          </div>
          <div className="p-1.5">
            {showWorkspaceLink && (
              <Link
                href="/workspace"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                <Icon name="terminal" className="h-4 w-4" />
                Open workspace
              </Link>
            )}
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                void signOut();
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13.5px] text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <Icon name="logout" className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
