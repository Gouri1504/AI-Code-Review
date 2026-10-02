import dotenv from 'dotenv';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';

// Both server/src and server/dist sit two levels below the repo root, where .env lives.
const rootDir = path.resolve(__dirname, '../..');
dotenv.config({ path: path.join(rootDir, '.env'), quiet: true });

async function start(): Promise<void> {
  if (!process.env.GROQ_API_KEY) {
    console.error('\n[server] GROQ_API_KEY is not set. Copy .env.example to .env and add a key from https://console.groq.com/keys\n');
    process.exit(1);
  }

  // Import after dotenv so the app modules see the environment variables.
  const { default: app } = await import('./app.js');
  const { checkModel, model } = await import('./groq.js');

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
}

void start();
