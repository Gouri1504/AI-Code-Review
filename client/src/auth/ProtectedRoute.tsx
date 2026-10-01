import type { ReactNode } from 'react';
import { Redirect, useLocation } from '../router';
import { useAuth } from './AuthProvider';

/** Renders children only for signed-in users; everyone else is sent to /login and brought back afterwards. */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const { pathname, search } = useLocation();

  if (loading) {
    return (
      <div className="flex h-dvh items-center justify-center bg-[#050505]" role="status" aria-label="Checking your session">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/15 border-t-white/70" />
      </div>
    );
  }
  if (!user) return <Redirect to={`/login?next=${encodeURIComponent(pathname + search)}`} />;
  return <>{children}</>;
}
