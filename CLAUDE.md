# Pulse

## What this is
Pulse is an internal customer-feedback inbox for support teams. Users sign in to
browse feedback arriving from email, chat, and app-store channels, open items to
read full messages and customer details, resolve/reopen them, and generate AI
summaries. It also covers assignment, priority and due dates, customer history,
internal notes, metrics, search, and CSV export.

## Tech stack & layout
Monorepo using npm workspaces (`server`, `web`); lockfile is `package-lock.json`.
- **server/** — Node 20+, Express 4, TypeScript 5.7, better-sqlite3, jsonwebtoken,
  cors, dotenv; dev runs via `tsx`. API listens on `:4000`.
  - `server/src/`: `index.ts` (app + routes), `db.ts` (SQLite init),
    `auth.ts` (JWT), `llm.ts` (summaries), `seed.ts` (seed data).
  - `server/pulse.db` — SQLite file created at runtime.
- **web/** — React 18, Vite 6, TypeScript 5.7. Dev server on `:5173`.
  - `web/src/`: `App.tsx`, `api.ts`, `config.ts`, `types.ts`, `main.tsx`,
    `styles.css`, and `components/` (`Login.tsx`, `Inbox.tsx`, `ItemDetail.tsx`).
- Root uses `concurrently` to run both dev servers. `docs/` holds project docs.

## Commands
Run from the repo root unless noted.
- Install: `npm install`
- Seed the database: `npm run seed`
- Dev (API + web together): `npm run dev` — API on `:4000`, web on `:5173`
- Build: `npm run build` (builds the web workspace; runs `tsc --noEmit` first)
- Server build only: `npm run build --workspace server` (runs `tsc`)
- Tests: none — there is no test command in any package.json.
- Lint: none — there is no lint command in any package.json.
- Typecheck: no dedicated command. Typechecking happens inside the builds
  (web `build` runs `tsc --noEmit`; server `build` runs `tsc`).

## Environment variables
- **server/** (loaded via `dotenv/config` in `server/src/index.ts`):
  - `PORT` — API port (default 4000), read in `server/src/index.ts`.
  - `FAKE_LLM` — when `'true'`, use fake summaries; read in `server/src/llm.ts`.
  - `OPENAI_API_KEY` — read in `server/src/llm.ts`.
- **web/** (Vite `import.meta.env`, read in `web/src/config.ts`):
  - `VITE_API_URL` — backend URL (default `http://localhost:4000`).
  - `VITE_OPENAI_API_KEY`.
- `.env.example` files exist in both `server/` and `web/`.

## How to work
- Plan first. Propose changes and wait for my approval before editing files.
- One concern per change. Do not refactor or reformat unrelated code.
- For bugs: write a failing test that reproduces the problem, then fix it.
- Run the relevant tests and the TypeScript check before saying a task is done,
  and show me the output.
- No new dependencies without asking and explaining why.
- Validate and enforce rules on the server. Frontend checks are never enough.
- Do not silence errors with empty catch blocks.
- If you are unsure whether something is a real problem, say so instead of guessing.
- Explain why a change is needed, not just what changed.
