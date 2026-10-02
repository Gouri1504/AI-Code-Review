# AI Code Review Application

**Review code. Fix bugs. Build features. Ship better software.**

A web app where you paste your code, pick a task (review it, debug it, write tests for it, and so on), and an AI explains the answer to you, streaming it word by word, like a chat. You can then ask follow-up questions about the same code.

---

## Table of contents

1. [Project overview](#1-project-overview)
2. [Features](#2-features)
3. [Tech stack](#3-tech-stack)
4. [Project structure](#4-project-structure)
5. [How the main parts work](#5-how-the-main-parts-work)
6. [Setup and installation](#6-setup-and-installation)
7. [Environment variables](#7-environment-variables)
8. [Running locally](#8-running-locally)
9. [Backend details](#9-backend-details)
10. [API documentation](#10-api-documentation)
11. [Deployment (Vercel)](#11-deployment-vercel)
12. [Limitations and good to know](#12-limitations-and-good-to-know)

---

## 1. Project overview

This project has **two parts** that live in one repository:

| Part | Folder | What it is |
|---|---|---|
| **Client** (front end) | `client/` | The website you see in the browser: a landing page, a sign-in page, and the **workspace** where you work with code. |
| **Server** (back end) | `server/` | A small API. The browser sends it your code; it asks the AI and streams the answer back. |

Three outside services do the heavy lifting:

- **Groq** runs the AI model (by default `llama-3.3-70b-versatile`). Only the server talks to Groq, so your Groq API key never reaches the browser.
- **Firebase Authentication** handles accounts: sign up, sign in with email/password or Google, and password reset.
- **Vercel** hosts the app in production.

### What happens when you use it

1. You sign in.
2. In the workspace, you paste code (or drop a file) and choose a workflow, for example **AI Code Review**.
3. The browser sends your code, the workflow name, and your sign-in token to the server.
4. The server checks that you are signed in, checks the request, and asks Groq for an answer using a prompt written for that workflow.
5. The answer streams back and appears in the right-hand panel as it is written.
6. You ask follow-up questions in the chat bar; the AI remembers the same code and the conversation so far.

There is **no database**. Your code is not stored on the server. The browser keeps your current editor contents in local storage so they survive a page refresh, and clears them when you sign out.

---

## 2. Features

### AI workflows

Each workflow sends the AI a different set of instructions, so the answer comes back in a consistent shape.

| Workflow | What it does | Extra input |
|---|---|---|
| **AI Code Review** | Finds bugs, edge cases, bad practices; lists findings with severity tags (`[CRITICAL]` … `[INFO]`) and line numbers, plus improved code. | None |
| **Debug** | Finds the root cause and gives a fix and a way to verify it. | Error or symptom (optional) |
| **Add Feature** | Implements a new feature in the style of your code. | Feature request (**required**) |
| **Enhance Code** | Improves an existing implementation. | None |
| **Refactor** | Cleans up and simplifies code without changing what it does. | None |
| **Code Explanation** | Explains the code in plain language. | None |
| **Smart Comments** | Adds useful comments to the code. | None |
| **Test Generation** | Writes unit, integration and edge-case tests. | None |
| **Security Scan** | Looks for vulnerabilities and unsafe patterns. | None |
| **Performance Optimization** | Finds bottlenecks and suggests faster code. | None |
| **Documentation** | Writes README, API and function docs. | None |
| **AI Coding Chat** | Answers any question about your code. | Question (**required**) |

### Workspace

- **Code editor** with lightweight syntax highlighting, Tab / Shift+Tab to indent and outdent, and a language picker (TypeScript, JavaScript, Python, Go, Rust, Java, C#, C++, PHP, Ruby, Kotlin, Swift, SQL, Other).
- **Bring code in three ways:** paste it, click **Upload**, or drag and drop a file (up to 500 KB). The **Sample** button loads example code with deliberate bugs to try things out.
- **Streaming answers** rendered as Markdown with headings, lists, tables, highlighted code blocks and colored severity badges.
- **Follow-up chat:** keep asking questions on the same code; every turn keeps the earlier conversation as context.
- **Answer controls:** Stop (cancels the AI mid-answer), Regenerate, Copy, and Clear.
- **Status details** under each answer: model name, time taken, token count, and a warning if the answer was cut off by the length limit.
- **Server status light** in the header (online/offline and which model is in use).
- **Keyboard shortcuts:** `Ctrl/⌘ + Enter` runs the workflow; `Enter` sends a chat message (`Shift + Enter` for a new line).
- **Auto-save:** the editor contents are saved in your browser and restored on reload.
- Works on phones and tablets (the workflow list becomes a horizontal strip).

### Accounts and security

- **Sign up / sign in** with email and password, or **Continue with Google**.
- **Forgot password** sends a reset email.
- **Protected workspace:** if you open `/workspace` while signed out, you are sent to `/login` and then returned to exactly where you were going.
- **Sign out** from the avatar menu (navbar and workspace) or the mobile menu.
- The **server also checks your sign-in** on every AI request, so nobody can use your Groq key by calling the API directly.
- **Rate limiting:** each user can send 20 requests in a burst, refilling at 20 per minute.
- **Input validation:** request size and shape are checked before anything is sent to the AI.

### Landing page

An animated home page with a hero section (particle network, 3D "AI core", floating code snippets), a pipeline graphic, a feature grid linking straight into each workflow, a workspace preview, and a short docs section. Animations are reduced automatically for users who prefer reduced motion, and cursor effects are turned off on touch devices.

---

## 3. Tech stack

| Area | Technology | Used for |
|---|---|---|
| Language | **TypeScript** | Both client and server |
| Front end | **React 19** | Building the user interface |
| Front end | **Vite 6** | Dev server with hot reload, and production builds |
| Styling | **Tailwind CSS 4** | All styling (no UI component library) |
| Auth (browser) | **Firebase JS SDK** | Sign up, sign in, Google sign-in, password reset, ID tokens |
| Back end | **Node.js + Express 5** | The API server |
| AI | **Groq SDK** | Calling the Groq chat model with streaming |
| Auth (server) | **Firebase Admin SDK** | Checking that sign-in tokens are real |
| Validation | **Zod** | Checking request bodies |
| Config | **dotenv** | Loading `.env` locally |
| Server build | **esbuild** | Bundling the server into single files for deployment |
| Dev tools | **tsx**, **concurrently** | Running the server with auto-restart; running client and server together |
| Hosting | **Vercel** (Services) | Hosting the client and the API under one domain |
| Repo setup | **npm workspaces** | One `npm install` for both `client/` and `server/` |

Small things are hand-written instead of using libraries: the router, the Markdown renderer, the syntax highlighter and the code editor.

---

## 4. Project structure

```
code-reviewer/
├── package.json            # Root: npm workspaces + scripts (dev, build, start)
├── vercel.json             # Vercel deployment config (two services)
├── .env.example            # Template for your .env file
│
├── client/                 # FRONT END (React + Vite)
│   ├── index.html          # The single HTML page
│   ├── vite.config.ts      # Vite config: /api proxy, reads .env from the repo root
│   ├── public/favicon.svg
│   └── src/
│       ├── main.tsx        # Starts React
│       ├── App.tsx         # Picks the page for the current URL
│       ├── router.tsx      # Tiny router: links, navigation, redirects
│       ├── content.ts      # Text, workflow list, languages, sample code
│       ├── index.css       # Tailwind + animations
│       ├── auth/           # Everything about accounts
│       │   ├── AuthProvider.tsx    # Keeps track of the signed-in user
│       │   ├── AuthPage.tsx        # /login and /signup page
│       │   ├── ProtectedRoute.tsx  # Sends signed-out users to /login
│       │   └── UserMenu.tsx        # Avatar menu with "Sign out"
│       ├── workspace/      # The main app screen
│       │   ├── Workspace.tsx       # Layout: workflow list, editor, answer panel, chat bar
│       │   ├── CodeEditor.tsx      # Editor, file upload, drag & drop
│       │   ├── ResultPanel.tsx     # Shows the streaming answer
│       │   └── useConversation.ts  # Run / follow-up / regenerate / stop logic
│       ├── lib/
│       │   ├── api.ts        # Calls the server and reads the streamed answer
│       │   ├── firebase.ts   # Firebase setup from env variables
│       │   ├── markdown.tsx  # Turns the AI's Markdown into React elements
│       │   └── highlight.ts  # Simple syntax highlighting
│       ├── components/     # Navbar, logo, icons, buttons, landing & hero sections
│       └── hooks/          # Small helpers (scroll reveal, mouse, media queries)
│
└── server/                 # BACK END (Express)
    ├── package.json        # Server scripts and dependencies
    ├── tsconfig.json
    └── src/
        ├── index.ts        # Local/production start: loads .env, serves the built site, listens on PORT
        ├── app.ts          # The Express app and its routes (also the Vercel entry point)
        ├── auth.ts         # Checks Firebase sign-in tokens
        ├── rateLimit.ts    # Limits how often each user can call the AI
        ├── schema.ts       # Rules for a valid request (Zod)
        ├── workflows.ts    # The list of allowed workflow names
        ├── prompts.ts      # The AI instructions for each workflow
        ├── groq.ts         # Groq client, model choice, message building
        └── routes/run.ts   # POST /api/run: streams the AI answer
```

---

## 5. How the main parts work

### The big picture

```
 Browser (React)                         Server (Express)                    Groq
 ───────────────                         ────────────────                    ────
 1. Sign in with Firebase ──► Firebase gives the browser an ID token
 2. POST /api/run  ─────────► requireUser: is the token valid?   (401 if not)
    + Authorization: Bearer     rateLimit:  too many requests?    (429 if so)
    + { workflow, code, ... }   schema:     is the body valid?    (400 if not)
                                prompts:    build the instructions
                                groq ─────────────────────────────────────► stream
 3. Read the stream  ◄─────── event: delta  (a piece of text)  ◄──────────── chunks
    and show it live          event: done   (model, time, tokens)
```

### Client

- **Pages and routing.** `App.tsx` looks at the URL. `/workspace` is wrapped in `ProtectedRoute`, `/login` and `/signup` show `AuthPage`, and anything else shows the landing page. `router.tsx` is a tiny home-made router that changes the URL without reloading the page.
- **Sign-in.** `lib/firebase.ts` sets up Firebase from the `VITE_FIREBASE_*` variables. `AuthProvider.tsx` listens for sign-in changes and shares the current user with the whole app. It also turns Firebase error codes into friendly messages.
- **Protecting the workspace.** While Firebase is still restoring your session, `ProtectedRoute` shows a spinner. If you are signed out, it redirects to `/login?next=<where you were going>`. After you sign in, `AuthPage` sends you to that `next` address (only addresses on this site are allowed, so the link can't redirect you elsewhere).
- **Running a workflow.** `Workspace.tsx` checks your input (code is required for every workflow except chat; some workflows need extra text), then calls `useConversation`. That hook keeps the whole conversation, sends it to the server through `lib/api.ts`, and adds each piece of streamed text to the answer. It batches updates once per screen frame so typing stays smooth.
- **Reading the stream.** `lib/api.ts` attaches your Firebase ID token, sends the request, and reads the reply as server-sent events, calling back for every `delta` and finishing on `done` or `error`.
- **Showing the answer.** `ResultPanel.tsx` renders the Markdown with `lib/markdown.tsx` and keeps the view scrolled to the bottom while text arrives, unless you scroll up to read.

### Server

- **`app.ts`** creates the Express app and connects everything: `GET /api/health`, and `POST /api/run` behind `requireUser` → `rateLimit` → the run route. If `GROQ_API_KEY` is missing it stops immediately with a clear error.
- **`auth.ts`** uses Firebase Admin to verify the `Authorization: Bearer <token>` header. It only needs your Firebase **project ID**, not a secret service-account key, because it checks the token against Google's public keys. If no project ID is configured, the check is skipped and the server prints a warning.
- **`rateLimit.ts`** is a token bucket kept in memory: each signed-in user (or IP address) starts with 20 requests and gets 20 more per minute.
- **`schema.ts`** uses Zod to reject bad requests, for example an unknown workflow or code longer than 120,000 characters.
- **`prompts.ts`** holds the instructions for each workflow. Every prompt starts with shared rules (be precise, reference line numbers, answer in Markdown, never invent APIs) and adds a task-specific structure.
- **`groq.ts`** builds the message list: the instructions, then your code and request, then any earlier conversation and the follow-up. The code always comes first and stays identical between turns, so the AI keeps the same context.
- **`routes/run.ts`** calls Groq with streaming on (temperature 0.2, up to 8,192 output tokens) and forwards each chunk to the browser. If you press **Stop** or close the tab, it cancels the Groq request too.
- **`index.ts`** is only used when running the server yourself (`npm run dev` / `npm start`). It loads `.env`, serves the built website from `client/dist` if it exists, starts listening, and checks that your chosen Groq model is available to your key.

---

## 6. Setup and installation

### What you need

- **Node.js 20 or newer** (the project is developed on Node 24) and **npm**
- **Git**
- A free **Groq API key**: [console.groq.com/keys](https://console.groq.com/keys)
- A free **Firebase project** for sign-in: [console.firebase.google.com](https://console.firebase.google.com)

### Step 1: Get the code and install packages

```bash
git clone https://github.com/Gouri1504/AI-Code-Review.git
cd AI-Code-Review
npm install
```

`npm install` at the root installs everything for both `client/` and `server/` (npm workspaces).

### Step 2: Create your `.env` file

```bash
cp .env.example .env
```

Then fill in the values (see [Environment variables](#7-environment-variables)).

### Step 3: Set up Firebase sign-in

1. In the Firebase console, create a project, then add a **Web app** (the `</>` icon).
2. Copy the config values it shows (`apiKey`, `authDomain`, `projectId`, `appId`) into `.env`.
3. Go to **Authentication → Sign-in method** and enable **Email/Password** and **Google**.
4. `localhost` is allowed by default. When you deploy, add your live domain under **Authentication → Settings → Authorized domains**.

---

## 7. Environment variables

All variables live in **one `.env` file at the repo root**. Both the client and the server read it. Never commit `.env`; it is already in `.gitignore`.

| Variable | Required | Used by | What it is |
|---|---|---|---|
| `GROQ_API_KEY` | **Yes** | Server | Your Groq API key. The server will not start without it. |
| `GROQ_MODEL` | No | Server | The Groq model to use. Default: `llama-3.3-70b-versatile`. At startup the server warns you if your key can't use the model and lists the ones it can. |
| `PORT` | No | Server | Port for the API server locally. Default: `8787`. |
| `VITE_FIREBASE_API_KEY` | Yes, for sign-in | Client | Firebase web config `apiKey`. |
| `VITE_FIREBASE_AUTH_DOMAIN` | Yes, for sign-in | Client | Firebase web config `authDomain`, e.g. `your-project.firebaseapp.com`. |
| `VITE_FIREBASE_PROJECT_ID` | Yes, for sign-in | Client **and** server | Firebase project ID. The server uses it to verify tokens. |
| `VITE_FIREBASE_APP_ID` | Yes, for sign-in | Client | Firebase web config `appId`. |
| `FIREBASE_PROJECT_ID` | No | Server | Optional override for the project ID the server checks against. Falls back to `VITE_FIREBASE_PROJECT_ID`. |

Good to know:

- Variables starting with **`VITE_`** are built into the website and are visible to anyone who opens it. That is normal and safe for Firebase web config. **Never** put a secret in a `VITE_` variable.
- If the Firebase variables are missing, the login page shows a "Firebase isn't configured" notice and the server **lets anyone call the AI**. Always set them before deploying.

Example `.env`:

```env
GROQ_API_KEY=gsk_your_key_here
GROQ_MODEL=llama-3.3-70b-versatile
PORT=8787

VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_APP_ID=1:1234567890:web:abc123
```

---

## 8. Running locally

### Development (recommended)

```bash
npm run dev
```

This starts both parts together:

- **Website:** [http://localhost:5173](http://localhost:5173), the address to open
- **API:** `http://localhost:8787`; the website forwards every `/api/...` request here (configured in `client/vite.config.ts`)

Both reload automatically when you change code.

### Production build on your machine

```bash
npm run build
npm start
```

`npm start` runs one server on [http://localhost:8787](http://localhost:8787) that serves both the built website and the API.

### All scripts

| Command (run at the repo root) | What it does |
|---|---|
| `npm run dev` | Starts the server and the client together in development mode. |
| `npm run build` | Builds the server, then the client. |
| `npm start` | Runs the built app (website + API) on `PORT`. |
| `npm run dev -w server` | Server only, restarting on changes (`tsx watch`). |
| `npm run build -w server` | Type-checks the server, then bundles `src/app.ts` and `src/index.ts` into `server/dist/` with esbuild. |
| `npm run dev -w client` | Website only (Vite). |
| `npm run build -w client` | Type-checks the client and builds it into `client/dist/`. |
| `npm run preview -w client` | Previews the built website. |

### Quick check

Open [http://localhost:8787/api/health](http://localhost:8787/api/health). You should see `{"ok":true,"model":"..."}`.

---

## 9. Backend details

| Topic | Detail |
|---|---|
| Framework | Express 5 on Node.js |
| Entry for local / `npm start` | `server/src/index.ts` |
| Entry for Vercel | `server/src/app.ts` (exports the Express app; Vercel starts it) |
| Module format | CommonJS, bundled with esbuild so every dependency is inside the bundle |
| Request size limit | 1 MB JSON body |
| AI settings | Streaming, temperature `0.2`, max `8192` output tokens |
| Rate limit | 20 requests burst, +20 per minute, per signed-in user (or per IP if auth is off); kept in memory |
| Auth | Firebase ID token in the `Authorization` header, checked with Firebase Admin |
| Storage | None; nothing is saved on the server |

**Why the server is bundled:** some dependencies, such as `jose` (used inside Firebase Admin), are published only as ES modules. Vercel's Node runtime can't `require()` those, so the build bundles everything into self-contained CommonJS files. Keep the server on CommonJS and keep the esbuild step, or the deployed API will crash on start.

---

## 10. API documentation

**Base URL:** the same address as the website.

- Local dev: `http://localhost:5173/api/...` (forwarded to port 8787), or `http://localhost:8787/api/...` directly
- Production: `https://<your-domain>/api/...`

All responses are JSON, except the AI answer, which is a stream of server-sent events.

### `GET /api/health`

Checks that the server is running and shows which AI model it uses.

- **Authentication:** none
- **Request body:** none

**Response `200 OK`:**

```json
{
  "ok": true,
  "model": "llama-3.3-70b-versatile"
}
```

### `POST /api/run`

Runs a workflow on your code and streams the AI's answer.

- **Authentication:** required when Firebase is configured. Send a Firebase ID token:
  ```
  Authorization: Bearer <Firebase ID token>
  ```
  The website does this automatically. To test with `curl`, sign in on the website, open the browser's DevTools → **Network** tab, run a workflow, and copy the token from the `Authorization` header of the `/api/run` request. Tokens expire after one hour.
- **Content-Type:** `application/json`

#### Request body

| Field | Type | Required | Rules | Meaning |
|---|---|---|---|---|
| `workflow` | string | Yes | One of: `review`, `debug`, `feature`, `enhance`, `refactor`, `explain`, `comments`, `tests`, `security`, `performance`, `docs`, `chat` | Which task to run |
| `language` | string | Yes | 1–40 characters | Programming language of the code |
| `code` | string | Yes | Up to 120,000 characters (may be empty for `chat`) | The code to work on |
| `prompt` | string | No | Up to 20,000 characters | The workflow's extra input: error message, feature request, or question |
| `history` | array | No | Up to 40 items, each `{ "role": "user" \| "assistant", "content": string }` (content up to 60,000 characters) | Earlier turns of the conversation, after the first answer |
| `followUp` | string | No | Up to 20,000 characters | A new follow-up question on the same code |

**Example: first request**

```bash
curl -N http://localhost:8787/api/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "workflow": "debug",
    "language": "JavaScript",
    "code": "for (let i = 0; i <= arr.length; i++) total += arr[i].amount;",
    "prompt": "TypeError: Cannot read properties of undefined (reading \"amount\")"
  }'
```

**Example: follow-up request**

```json
{
  "workflow": "debug",
  "language": "JavaScript",
  "code": "for (let i = 0; i <= arr.length; i++) total += arr[i].amount;",
  "prompt": "TypeError: Cannot read properties of undefined (reading \"amount\")",
  "history": [
    { "role": "assistant", "content": "## Root Cause\nThe loop uses <= ..." }
  ],
  "followUp": "Can you rewrite it with reduce()?"
}
```

#### Successful response: a stream

Status `200`, `Content-Type: text/event-stream`. The body arrives in small pieces like this:

```
event: delta
data: {"text":"## Root Cause\n"}

event: delta
data: {"text":"The loop condition `i <= arr.length` reads one item past the end"}

event: done
data: {"model":"llama-3.3-70b-versatile","finishReason":"stop","truncated":false,"usage":{"prompt_tokens":312,"completion_tokens":405,"total_tokens":717},"ms":1840}
```

| Event | Data | Meaning |
|---|---|---|
| `delta` | `{ "text": string }` | The next piece of the answer. Join them all to get the full Markdown answer. |
| `done` | `{ model, finishReason, truncated, usage, ms }` | The answer is complete. `truncated: true` means it hit the length limit. `ms` is how long it took. |
| `error` | `{ "message": string }` | Something went wrong while the AI was answering (sent inside the stream, after the 200 status). |

Possible `error` messages:

- `The AI engine is rate limited right now. Please retry in a few seconds.` (Groq's own rate limit)
- `The server's GROQ_API_KEY was rejected. Check the key in .env.`
- `Could not reach the Groq API. Check the network connection.`
- `Groq API error (<status>): <details>`
- `Something went wrong while contacting the AI engine.`

#### Error responses (before streaming starts)

| Status | When | Body |
|---|---|---|
| `400` | The body breaks a rule above | `{ "error": "Invalid request", "issues": [ ...Zod details... ] }` |
| `401` | No `Authorization` header | `{ "error": "Please sign in to use the workspace." }` |
| `401` | Token is invalid or expired | `{ "error": "Your session has expired. Please sign in again." }` |
| `429` | More than the rate limit allows | `{ "error": "Too many requests. Please wait a moment and try again." }` |

Any other path under `/api/` returns `404`.

---

## 11. Deployment (Vercel)

The app is deployed to Vercel as **one project with two [services](https://vercel.com/docs/services)** that share one domain. This is set up in `vercel.json`:

```json
{
  "services": {
    "client": {
      "root": "client",
      "framework": "vite",
      "outputDirectory": "dist",
      "rewrites": [{ "source": "/((?!@|src/|node_modules/|.*\\.[a-zA-Z0-9]+$).*)", "destination": "/index.html" }]
    },
    "server": {
      "root": "server",
      "framework": "express",
      "entrypoint": "src/app.ts"
    }
  },
  "rewrites": [
    { "source": "/api/(.*)", "destination": { "service": "server" } },
    { "source": "/(.*)", "destination": { "service": "client" } }
  ]
}
```

What this means:

- Requests to **`/api/...`** go to the **server** service (the Express app in `server/src/app.ts`). The path stays the same, so `/api/run` reaches the `/api/run` route.
- **Everything else** goes to the **client** service (the built website).
- The client's own rewrite sends page addresses with no file extension, like `/login` or `/workspace`, to `index.html`, so refreshing those pages works. Real files such as `/assets/*.js` or `/favicon.svg` are served as they are.
- The browser calls the API on the same domain, so the two services never need to call each other.

### How to deploy

1. Push the repository to GitHub.
2. On [vercel.com/new](https://vercel.com/new), import the repo. Leave **Root Directory** as the repo root; Vercel reads the build settings from `vercel.json`.
3. In **Project → Settings → Environment Variables**, add `GROQ_API_KEY`, `GROQ_MODEL`, and the four `VITE_FIREBASE_*` values.
4. Deploy. After that, every push to `main` redeploys automatically.
5. In Firebase, add your Vercel domain (e.g. `your-app.vercel.app`) under **Authentication → Settings → Authorized domains**, or Google sign-in will fail.
6. Check `https://<your-domain>/api/health`; it should return `{"ok":true,...}`.

### Deployment tips

- `VITE_*` variables are **built into the website**. After changing one in Vercel, redeploy.
- To run both services locally the way Vercel does, use the Vercel CLI: `npx vercel dev`.
- If the API returns `FUNCTION_INVOCATION_FAILED`, open the deployment's **Logs** in Vercel (or run `npx vercel logs <deployment-url>`) to see the real error. The most common causes are a missing `GROQ_API_KEY` or a change that brings ES-module code back into the server (see [Backend details](#9-backend-details)).

---

## 12. Limitations and good to know

- **No database.** Conversations are not saved; refreshing the page clears the current answer (the editor contents are kept in your browser).
- **Rate limits are per server instance.** They are kept in memory, so on Vercel each running instance counts separately and limits reset on restart.
- **Long answers can be cut off.** The AI stops at 8,192 output tokens; the workspace shows a warning when that happens. On Vercel, a single answer is also limited by your plan's maximum function duration.
- **Turning off Firebase opens the API.** Without the Firebase variables, anyone can call `/api/run` and use your Groq key.
- **No automated tests or CI** are included yet; `npm run build` (which type-checks both parts) is the main safety check.
