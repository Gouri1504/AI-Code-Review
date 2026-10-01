# AI Code Review Application

**Review code. Fix bugs. Build features. Ship better software.**

One AI workspace for everything you do with code: review, debugging, adding features, enhancing, refactoring, explaining code, writing comments, generating tests, security scans, performance tuning, docs, and an AI coding chat.

- `client/`: React + TypeScript + Vite + Tailwind CSS (no UI libraries). Contains the landing page, sign-in at `/login` and `/signup`, and the workspace at `/workspace` (signed-in users only).
- `server/`: Express + TypeScript. Streams answers from the [Groq API](https://console.groq.com) over server-sent events.

## Setup

```bash
npm install
cp .env.example .env      # then set GROQ_API_KEY (and optionally GROQ_MODEL)
npm run dev               # API on :8787, web on http://localhost:5173
```

### Firebase Authentication

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com) and add a **Web app**.
2. In **Authentication → Sign-in method**, enable **Email/Password** and **Google**.
3. Copy the web app config into `.env` as `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID` and `VITE_FIREBASE_APP_ID`.
4. For production, add your domain under **Authentication → Settings → Authorized domains** (`localhost` is allowed by default).

The server verifies the Firebase ID token on every `/api/run` request using the project ID, so no service-account key is needed. If the Firebase variables are unset, the server logs a warning and leaves the API open.

On startup the server checks that `GROQ_MODEL` is available to your key. If it isn't, it logs the models you can use.

## Production

```bash
npm run build
npm start                 # serves the built client and the API on :8787
```

## Deploy to Vercel

The repo is set up for Vercel: `vercel.json` builds both workspaces, serves `client/dist` as static files, and routes `/api/*` to `api/index.js`, a serverless function that runs the same Express app as `npm start`.

1. Push the repo to GitHub and import it at [vercel.com/new](https://vercel.com/new). Leave **Root Directory** as the repo root; the build settings come from `vercel.json`.
2. Under **Settings → Environment Variables**, add `GROQ_API_KEY`, `GROQ_MODEL` and the four `VITE_FIREBASE_*` values. The `VITE_*` values are baked into the client at build time, so redeploy after changing them.
3. In Firebase, add your Vercel domain (e.g. `your-app.vercel.app`) under **Authentication → Settings → Authorized domains**, or Google sign-in will fail.

Streams are capped at 60 seconds (`maxDuration` in `vercel.json`). The rate limiter keeps its counts in memory, so on Vercel each function instance counts separately.

## API

`POST /api/run` requires `Authorization: Bearer <Firebase ID token>`, accepts `{ workflow, language, code, prompt?, history?, followUp? }` and streams back `delta`, `done` and `error` events. `GET /api/health` reports the server status and the configured model.
