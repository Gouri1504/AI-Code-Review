import express from 'express';

// The Express app without listen() or static files, so it can run under `npm start` (index.ts)
// and as the Vercel `server` service (entrypoint in vercel.json). Env vars must be loaded before importing this.
if (!process.env.GROQ_API_KEY) {
  throw new Error('GROQ_API_KEY is not set. Add a key from https://console.groq.com/keys to .env (or your Vercel project settings).');
}

// Imported after the env check so the Groq client is created with the key present.
const { model } = await import('./groq.js');
const { runRouter } = await import('./routes/run.js');
const { rateLimit } = await import('./rateLimit.js');
const { authEnabled, requireUser } = await import('./auth.js');

if (!authEnabled) {
  console.warn('[server] Firebase is not configured (VITE_FIREBASE_PROJECT_ID), so /api/run is open to anyone.');
}

const app = express();
app.disable('x-powered-by');
// Vercel and other proxies put the client IP in X-Forwarded-For; the rate limiter falls back to it.
app.set('trust proxy', true);
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, model });
});
app.use('/api/run', requireUser, rateLimit, runRouter);

export default app;
