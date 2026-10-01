import dotenv from 'dotenv';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Both server/src and server/dist sit two levels below the repo root, where .env lives.
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
dotenv.config({ path: path.join(rootDir, '.env'), quiet: true });

if (!process.env.GROQ_API_KEY) {
  console.error('\n[server] GROQ_API_KEY is not set. Copy .env.example to .env and add a key from https://console.groq.com/keys\n');
  process.exit(1);
}

// Imported after the env check so the Groq client is created with the key present.
const { checkModel, model } = await import('./groq.js');
const { runRouter } = await import('./routes/run.js');
const { rateLimit } = await import('./rateLimit.js');
const { authEnabled, requireUser } = await import('./auth.js');

if (!authEnabled) {
  console.warn('[server] Firebase is not configured (VITE_FIREBASE_PROJECT_ID), so /api/run is open to anyone.');
}

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, model });
});
app.use('/api/run', requireUser, rateLimit, runRouter);

const clientDist = path.join(rootDir, 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

const port = Number(process.env.PORT) || 8787;
app.listen(port, () => {
  console.log(`[server] AI Code Review Application API on http://localhost:${port} (model: ${model})`);
  void checkModel();
});
