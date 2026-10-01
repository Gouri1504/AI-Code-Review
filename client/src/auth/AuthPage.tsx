import { useEffect, useState, type FormEvent } from 'react';
import { Icon } from '../components/Icon';
import { Logo } from '../components/Logo';
import { firebaseConfigured } from '../lib/firebase';
import { Link, Redirect, safeNext, useLocation } from '../router';
import { authErrorMessage, isCancelled, useAuth } from './AuthProvider';

type Mode = 'login' | 'signup';

const COPY = {
  login: { title: 'Welcome back', subtitle: 'Sign in to open your workspace.', submit: 'Sign in', busy: 'Signing in…' },
  signup: { title: 'Create your account', subtitle: 'Start reviewing, debugging and shipping better code.', submit: 'Create account', busy: 'Creating account…' },
};

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-[18px] w-[18px]" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

const inputClass =
  'w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3 text-[15px] text-white placeholder:text-white/25 outline-none transition-colors focus:border-indigo-300/50 focus:bg-white/[0.05]';

export function AuthPage({ mode }: { mode: Mode }) {
  const { user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } = useAuth();
  const { search } = useLocation();
  const next = safeNext(search, '/workspace');
  const copy = COPY[mode];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState<'email' | 'google' | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    document.title = `${mode === 'login' ? 'Sign in' : 'Sign up'} · AI Code Review Application`;
    setError('');
    setNotice('');
    return () => {
      document.title = 'AI Code Review Application';
    };
  }, [mode]);

  if (user) return <Redirect to={next} />;

  const withNext = (path: string) => (next === '/workspace' ? path : `${path}?next=${encodeURIComponent(next)}`);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError('');
    setNotice('');
    setBusy('email');
    try {
      if (mode === 'signup') await signUpWithEmail(name.trim(), email.trim(), password);
      else await signInWithEmail(email.trim(), password);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const google = async () => {
    if (busy) return;
    setError('');
    setNotice('');
    setBusy('google');
    try {
      await signInWithGoogle();
    } catch (err) {
      if (!isCancelled(err)) setError(authErrorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const forgot = async () => {
    setError('');
    setNotice('');
    if (!email.trim()) {
      setError('Enter your email above, then choose “Forgot password?” again.');
      return;
    }
    try {
      await resetPassword(email.trim());
      setNotice(`If an account exists for ${email.trim()}, a password reset link is on its way.`);
    } catch (err) {
      setError(authErrorMessage(err));
    }
  };

  const disabled = !firebaseConfigured || loading || busy !== null;

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[#050505]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(55% 45% at 50% 0%, rgba(99,102,241,0.16), transparent 70%)' }}
      />

      <header className="relative px-5 py-4 sm:px-8 sm:py-5">
        <Logo />
      </header>

      <main className="relative flex flex-1 items-center justify-center px-4 pb-16 pt-6">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 text-center">
            <h1 className="font-heading text-[32px] leading-tight tracking-tight sm:text-[36px]">{copy.title}</h1>
            <p className="mt-2 text-[15px] text-white/55">{copy.subtitle}</p>
          </div>

          <div className="card rounded-2xl p-5 sm:p-7">
            {!firebaseConfigured && (
              <div className="mb-5 rounded-xl border border-amber-300/25 bg-amber-300/[0.06] px-3.5 py-3 text-[13px] leading-relaxed text-amber-100/85">
                Firebase isn’t configured. Add the <span className="font-code">VITE_FIREBASE_*</span> values to the root{' '}
                <span className="font-code">.env</span> (see <span className="font-code">.env.example</span>) and restart the dev server.
              </div>
            )}

            <button
              type="button"
              onClick={google}
              disabled={disabled}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/12 bg-white px-4 py-3 text-[15px] font-medium text-black transition-[opacity,box-shadow] hover:shadow-[0_0_32px_-8px_rgba(167,139,250,0.6)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <GoogleMark />
              {busy === 'google' ? 'Connecting…' : 'Continue with Google'}
            </button>

            <div className="my-6 flex items-center gap-3 text-[11px] tracking-[0.2em] text-white/30">
              <span className="h-px flex-1 bg-white/10" />
              OR
              <span className="h-px flex-1 bg-white/10" />
            </div>

            <form onSubmit={submit} className="grid gap-4">
              {mode === 'signup' && (
                <label className="block">
                  <span className="mb-1.5 block text-[12px] tracking-[0.12em] text-white/45">NAME</span>
                  <input
                    className={inputClass}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    placeholder="Ada Lovelace"
                    disabled={disabled}
                  />
                </label>
              )}

              <label className="block">
                <span className="mb-1.5 block text-[12px] tracking-[0.12em] text-white/45">EMAIL</span>
                <input
                  className={inputClass}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                  disabled={disabled}
                />
              </label>

              <label className="block">
                <span className="mb-1.5 flex items-center justify-between text-[12px] tracking-[0.12em] text-white/45">
                  PASSWORD
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={forgot}
                      disabled={disabled}
                      className="text-[12px] tracking-normal text-indigo-200/80 transition-colors hover:text-indigo-100 disabled:opacity-50"
                    >
                      Forgot password?
                    </button>
                  )}
                </span>
                <span className="relative block">
                  <input
                    className={`${inputClass} pr-11`}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
                    minLength={mode === 'signup' ? 6 : undefined}
                    required
                    disabled={disabled}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-white/40 transition-colors hover:text-white/80"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <Icon name={showPassword ? 'eyeOff' : 'eye'} className="h-4 w-4" />
                  </button>
                </span>
              </label>

              {error && (
                <p role="alert" className="rounded-xl border border-rose-400/25 bg-rose-400/[0.06] px-3.5 py-2.5 text-[13px] text-rose-100/90">
                  {error}
                </p>
              )}
              {notice && (
                <p role="status" className="rounded-xl border border-emerald-400/25 bg-emerald-400/[0.06] px-3.5 py-2.5 text-[13px] text-emerald-100/90">
                  {notice}
                </p>
              )}

              <button
                type="submit"
                disabled={disabled}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 text-[15px] font-medium text-white transition-colors hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy === 'email' ? copy.busy : copy.submit}
                {busy !== 'email' && <Icon name="arrowRight" className="h-4 w-4" />}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-[14px] text-white/50">
            {mode === 'login' ? 'New here? ' : 'Already have an account? '}
            <Link href={withNext(mode === 'login' ? '/signup' : '/login')} className="text-white underline-offset-4 hover:underline">
              {mode === 'login' ? 'Create an account' : 'Sign in'}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
