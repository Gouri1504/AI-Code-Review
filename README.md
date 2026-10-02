# AI Code Review Application

AI Code Review Application is a full-stack web app for AI-assisted code understanding and improvement. It provides a developer workspace where users can paste code, choose a workflow, and ask an AI model to review code, debug errors, refactor logic, add features, explain code, generate tests, scan for security issues, optimize performance, or create documentation.

The app combines a React + Vite front end, an Express API, Firebase authentication, and the Groq API for streaming AI responses. The project is designed around a single interactive workspace and a landing page that explains the available workflows.

## 1) Project Overview

### What it does
The application acts as a guided AI coding workspace. Users can:

- review code for bugs and issues
- debug with an error or symptom
- add features from a natural-language request
- enhance or refactor existing implementations
- explain code in plain language
- generate comments and tests
- scan for security and performance issues
- generate documentation
- chat with the AI about the current code

### Business purpose
The project is positioned as an AI-assisted developer productivity tool. The landing page describes it as a single intelligent workspace to review, debug, build, refactor, test, secure, and document software.

### Target users
The project is primarily aimed at developers and engineering teams who want fast, code-aware assistance in a browser-based workspace.

### Key features
- workflow-based AI assistants for different software engineering tasks
- code editor with language selection and sample code
- follow-up chat on the same code context
- SSE streaming responses from the AI backend
- Firebase-based sign-in and protected workspace access
- server-side Groq model integration
- Vercel deployment configuration for frontend and API services

## 2) Architecture

The architecture is split into a React client and an Express server.

- Client (`client/`): Vite + React + TypeScript app. Includes the landing page, auth pages, and the protected workspace UI.
- Server (`server/`): Express + TypeScript API. It validates incoming requests, enforces simple rate limiting, verifies Firebase ID tokens, and streams responses from Groq.
- AI layer: `groq-sdk` is used to call the Groq chat completions API.
- Auth layer: Firebase Authentication is used on the client and verified by Firebase Admin on the server.
- Hosting: The repo is configured for Vercel using `vercel.json`, with separate `client` and `server` services.

### Request flow
1. User signs in with Firebase on the front end.
2. The client fetches a Firebase ID token and sends it with `POST /api/run`.
3. The server validates the request body using Zod.
4. The Express route streams the Groq completion as server-sent events.
5. The browser updates the workspace UI as chunks arrive and renders the final answer.

## 3) Project Structure

| Path | Purpose |
|---|---|
| `client/` | Front-end application built with React, TypeScript, Vite, and Tailwind CSS. |
| `client/src/` | Client code, auth pages, workspace UI, routing, and application logic. |
| `client/src/auth/` | Firebase auth flow, sign-in pages, protected routing, user menu. |
| `client/src/workspace/` | Editor, result panel, conversation state, and workspace interactions. |
| `client/src/lib/` | API client, Firebase config, markdown/highlighting helpers. |
| `server/` | Express server and backend logic. |
| `server/src/` | Route handlers, auth checks, rate limiting, prompt builders, and model setup. |
| `server/src/routes/` | API endpoint definitions. |
| `.env.example` | Example environment variables for local development. |
| `vercel.json` | Vercel project configuration for frontend + API services. |
| `package.json` | Root workspace scripts and shared dev tooling. |
| `package-lock.json` | Lockfile for the JavaScript dependencies. |
| `.gitignore` | Ignores dependencies, build output, environment files, local Vercel files. |

### Important source files
- `client/src/App.tsx`: app shell and route selection.
- `client/src/workspace/Workspace.tsx`: main workspace UI and workflow handling.
- `client/src/content.ts`: workflow definitions, branding text, language list, and sample code.
- `client/src/lib/api.ts`: streaming client helper for `/api/run`.
- `client/src/auth/AuthProvider.tsx`: sign-in, sign-up, reset-password, and token handling.
- `server/src/app.ts`: Express app setup and `/api/health` route.
- `server/src/routes/run.ts`: streaming AI run endpoint.
- `server/src/auth.ts`: Firebase token verification middleware.
- `server/src/schema.ts`: Zod validation for the request body.
- `server/src/groq.ts`: Groq client setup and model validation.
- `server/src/prompts.ts`: workflow-specific system prompts.
- `server/src/rateLimit.ts`: in-memory token-bucket rate limiter.

## 4) Tech Stack

| Layer | Technology | Role |
|---|---|---|
| Front end | React 19 | UI framework |
| Front end | TypeScript 5.9 | Static typing for the client |
| Front end | Vite 6 | Local dev server and build tool |
| Front end | Tailwind CSS 4 | Styling |
| Auth | Firebase Authentication | Email/password, Google sign-in, ID tokens |
| API | Express 5 | HTTP server and route handling |
| AI API | Groq SDK | Calls Groq chat models |
| Validation | Zod | Request validation |
| Runtime | Node.js / npm workspaces | Root workspace orchestration |
| Hosting | Vercel | Deployment platform |
| Environment | dotenv | Loads local `.env` files |

### Not found in the codebase
- No database layer was found in the repository.
- No test framework or CI pipeline was found in the project files.
- No explicit Node.js version pin was found in `package.json`.

## 5) Prerequisites

The repository requires the following tools to run locally:

- Node.js and npm
- Git
- A Groq API key from the Groq Console
- Firebase project configuration for sign-in, if you want authenticated workspace access

### Not explicitly pinned in the repo
- Node.js version: Not found in the codebase.
- Package manager version: Not found in the codebase.

## 6) Installation & Setup

1. Clone the repository.
2. Install dependencies:

```bash
npm install
```

3. Copy the example environment file:

```bash
cp .env.example .env
```

4. Fill in the required values in `.env`.
5. Start the app in development mode:

```bash
npm run dev
```

## 7) Configuration

The project uses the root `.env` file. The example values are in `.env.example`.

| Variable | Required | Purpose |
|---|---|---|
| `GROQ_API_KEY` | Yes | API key used by the server to access Groq. |
| `GROQ_MODEL` | Optional | Overrides the default Groq model. Default is `llama-3.3-70b-versatile`. |
| `PORT` | Optional | Port used by the Express server. Default is `8787`. |
| `VITE_FIREBASE_API_KEY` | Optional | Firebase web app API key used by the client. |
| `VITE_FIREBASE_AUTH_DOMAIN` | Optional | Firebase auth domain used by the client. |
| `VITE_FIREBASE_PROJECT_ID` | Optional | Firebase project ID used by the client and backend token verification. |
| `VITE_FIREBASE_APP_ID` | Optional | Firebase app ID used by the client. |

### Important notes
- Do not commit real secrets or production credentials.
- The app expects the Firebase config to be present for authenticated access.
- If `VITE_FIREBASE_PROJECT_ID` is not set, the server logs a warning and leaves `/api/run` open to anyone.

## 8) Running the Project

### Development
From the repo root:

```bash
npm run dev
```

This starts:
- server via `npm run dev -w server`
- client via `npm run dev -w client`

The app is served at:
- client: `http://localhost:5173`
- API: `http://localhost:8787`

### Production build

```bash
npm run build
```

Then start the server:

```bash
npm start
```

### Production server behavior
`server/src/index.ts` serves the built client from `client/dist` when present and also serves API routes. The final server listens on `PORT` or port `8787`.

## 9) Scripts & Commands

### Root workspace scripts

| Command | What it does |
|---|---|
| `npm run dev` | Starts the server and client concurrently. |
| `npm run build` | Builds the server then the client. |
| `npm start` | Starts the production server. |

### Server scripts

| Command | What it does |
|---|---|
| `npm run dev -w server` | Runs `tsx watch src/index.ts` for hot-reload development. |
| `npm run build -w server` | Type-checks with `tsc`, then bundles `src/app.ts` and `src/index.ts` into self-contained CommonJS files in `dist/` with esbuild (needed on Vercel, whose runtime cannot `require()` ESM-only dependencies). |
| `npm run start -w server` | Runs `node dist/index.js`. |

### Client scripts

| Command | What it does |
|---|---|
| `npm run dev -w client` | Runs Vite on the client app. |
| `npm run build -w client` | Runs TypeScript checks and Vite production build. |
| `npm run preview -w client` | Starts a preview server for the built client. |

## 10) API Documentation

### Base URL
The app is served locally at:

- client: `http://localhost:5173`
- API: `http://localhost:8787`

In production on Vercel, the API lives under the same domain and is routed by `vercel.json`.

### Endpoint: `GET /api/health`
Checks whether the API is running.

**Method:** `GET`

**Response example:**

```json
{
  "ok": true,
  "model": "llama-3.3-70b-versatile"
}
```

### Endpoint: `POST /api/run`
Streams AI output using server-sent events (SSE).

**Method:** `POST`

**Authentication:**
- If Firebase is configured, the client sends `Authorization: Bearer <Firebase ID token>`.
- The server verifies the token with Firebase Admin before allowing the request.
- If Firebase is not configured, the server allows the request without auth.

**Request body schema:**

```json
{
  "workflow": "review",
  "language": "TypeScript",
  "code": "const x = 1;",
  "prompt": "Review this code for issues",
  "history": [
    { "role": "user", "content": "Explain this file" },
    { "role": "assistant", "content": "This file exports a helper." }
  ],
  "followUp": "Can you improve the naming?"
}
```

**Supported workflow values:**
- `review`
- `debug`
- `feature`
- `enhance`
- `refactor`
- `explain`
- `comments`
- `tests`
- `security`
- `performance`
- `docs`
- `chat`

**Server response format:**
- `event: delta` with `data: { "text": "..." }`
- `event: done` with final metadata
- `event: error` with a message when the backend fails

**Example `done` event:**

```json
{
  "model": "llama-3.3-70b-versatile",
  "finishReason": "stop",
  "truncated": false,
  "usage": {
    "prompt_tokens": 123,
    "completion_tokens": 456,
    "total_tokens": 579
  },
  "ms": 982
}
```

### Common validation behavior
- `workflow` must be one of the supported workflow IDs.
- `language` must be a non-empty string up to 40 characters.
- `code` must be a string and is limited to `120000` characters.
- `prompt`, `history`, and `followUp` are optional but are bounded by server-side validation.

## 11) Authentication & Authorization

### Front-end auth
The client uses Firebase Authentication to sign users in with:
- email/password
- Google sign-in
- password reset email flow

Relevant files:
- `client/src/lib/firebase.ts`
- `client/src/auth/AuthProvider.tsx`
- `client/src/auth/AuthPage.tsx`
- `client/src/auth/ProtectedRoute.tsx`

### Back-end auth
The server uses Firebase Admin to verify ID tokens:
- `server/src/auth.ts` creates an admin app with the Firebase project ID.
- `requireUser` checks the `Authorization` header.
- If a bearer token is present, it is validated using `auth.verifyIdToken(token)`.
- On failure, the server responds with `401`.

### Behavior when Firebase is not configured
The code explicitly handles the missing config case:
- `client/src/lib/firebase.ts` sets `auth` to `null` when required Firebase env vars are missing.
- `server/src/auth.ts` sets `authEnabled` based on the Firebase project ID.
- When auth is disabled, `requireUser` becomes a no-op and `/api/run` is effectively open.

This behavior is also logged by the server at startup.

## 12) Deployment

### Vercel deployment
The repo is configured for Vercel in `vercel.json`.

```json
{
  "services": {
    "client": {
      "root": "client",
      "framework": "vite",
      "outputDirectory": "dist"
    },
    "server": {
      "root": "server",
      "framework": "express",
      "entrypoint": "src/app.ts"
    }
  }
}
```

The deployment model is:
- `client` serves the React app and static assets
- `server` serves Express routes under `/api/*`
- the browser calls the API on the same domain

### Required environment variables for deployment
Set the following values in the Vercel project settings or environment configuration:
- `GROQ_API_KEY`
- `GROQ_MODEL` (optional)
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_APP_ID`

### Firebase production notes
The project comments and configuration assume that you add your deployed domain to the Firebase Authentication authorized domains list.

### Local Vercel-style run

```bash
vercel dev
```

This is the project’s expected local approach to matching Vercel’s service split.

## 13) Contribution Guide

The repository does not define a formal contribution policy or branch naming convention in code. The project does include a standard TypeScript/React code structure and uses npm workspaces.

Recommended contribution flow based on the project layout:

1. Create a feature branch for your change.
2. Keep changes focused to a single concern.
3. Run the project build before opening a PR:

```bash
npm run build
```

4. Keep the README and environment setup current when changing config or runtime behavior.
5. Open a pull request with a clear summary of what changed and why.

### Coding conventions seen in the repo
- TypeScript is used throughout the app.
- React functional components are used with hooks.
- Comments are present only where the code needs intent or a non-obvious decision.
- The codebase prefers descriptive names and small, single-purpose modules.

### Commit style
Not enforced in the repository. Use concise, descriptive commit messages that explain the change.

## 14) Security

The project has several relevant security practices and constraints in the code:

- environment variables are stored in `.env` and ignored by git (`.gitignore`)
- Firebase ID tokens are validated on the server before allowing AI access
- the server uses a rate limiter to reduce abuse
- the backend validates request payloads with Zod before calling Groq
- the app does not include hard-coded secrets in the repo

### Important security caveat
The rate limiter is in-memory only (`server/src/rateLimit.ts`), so limits reset when the process restarts and are not shared across multiple server instances.

### Security-sensitive behavior
- `server/src/auth.ts` verifies the ID token using Firebase Admin.
- `server/src/app.ts` warns when Firebase is not configured and leaves `/api/run` open.
- `server/src/routes/run.ts` handles Groq API errors and passes them back to the client.

## 15) Known Limitations & Future Improvements

The following limitations are either explicitly visible in the code or strongly implied by the project structure:

- Not implemented: any persistence layer or database.
- Not found in the codebase: automated tests, CI checks, or a formal release process.
- Not found in the codebase: explicit Node.js version or package manager pinning.
- Inferred from the code: `rateLimit.ts` uses a local in-memory map, so the limiter is per-process and not shared across multiple instances.
- Inferred from the code: if Firebase is not configured, `/api/run` is effectively public; this is intentional in the code but should be treated carefully in production.
- Inferred from the code: the app is designed around a single developer workspace, not multi-user collaboration or team project persistence.

## 16) Quick Start

```bash
npm install
cp .env.example .env
# set GROQ_API_KEY and, if desired, Firebase values
npm run dev
```

Then open:
- `http://localhost:5173` for the client
- `http://localhost:8787/api/health` to confirm the API is alive

## 17) 2-Minute Explanation

This project is a browser-based AI coding assistant for developers. The front end is a React app with a landing page and a protected workspace where you can paste code and run AI workflows like review, debug, refactor, explain, test, security scan, and docs generation.

The architecture is simple: the browser sends code and a workflow to an Express API, which validates the payload and streams the AI response from Groq back to the user in real time. Firebase Authentication protects the workspace when configured, while the server verifies the user’s ID token before accepting requests. The app is designed to feel like a coding assistant in a single interface rather than a full SaaS platform with a database backend.

The key technical decision here is a clean split between the UI and the AI service: the client handles the developer experience, while the server handles validation, auth, rate limiting, and the Groq API integration. This keeps the app easy to run locally and deployable in a Vercel project with separate front-end and API services.

---

## Summary

This repository is a compact, full-stack AI coding workspace built with React, Express, Firebase, and Groq. It is ready for local development and Vercel deployment, but it does not include a database, a formal testing suite, or a branch/PR policy in the codebase. The docs above reflect only what is present in the actual project files.
