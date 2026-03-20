# Project Guidelines

This repo is a **Tauri 2 desktop app** with a **Vite + Preact (React-compat) + TypeScript** frontend and a **Rust** backend.

## Build and Run

- Install deps: `pnpm install` (this repo uses `pnpm-lock.yaml`; avoid npm/yarn)
- Frontend dev server (fixed port): `pnpm dev` (Vite on `localhost:1420`)
- Desktop app dev: `pnpm tauri dev`
- Frontend build: `pnpm build` (`tsc` + `vite build`)

## Formatting and Linting

- Use Biome for TS/TSX formatting: `pnpm format`
- Biome config lives in `biome.json` (tabs + double quotes + organize imports)
- TypeScript is strict and enforces `noUnusedLocals`/`noUnusedParameters` (remove unused code rather than suppressing)

## Architecture

- Frontend code lives in `src/`:
  - Pages/views: `src/pages/`
  - Reusable components: `src/components/` (UI primitives in `src/components/ui/`)
  - Shared utilities/types: `src/lib/`
  - Hooks: `src/hooks/`
  - Supabase config: `src/config/supabase.ts`
- Backend code lives in `src-tauri/` (Rust + Tauri):
  - Commands live in `src-tauri/src/commands/` and must be registered in `src-tauri/src/lib.rs`
  - Prefer calling Rust via the existing TS wrappers in `src/lib/tauri/` and guard with `canInvokeTauri()` where the app can run without Tauri

## Conventions

- Prefer the `@/*` path alias for imports (`@/…` maps to `src/…`; see `tsconfig.json`).
- UI work: reuse existing UI primitives in `src/components/ui/` and Tailwind classes; don’t introduce new design primitives unless the repo already has them.

## Database / Lobby Features

- Lobby timer/match tracking/dice/duel history features require DB migrations.
- Reference: `LOBBY_SETUP.md` (migration SQL + defensive-default behavior when migrations aren’t applied).

## Environment Variables

- Vite-exposed environment variables must be prefixed with `VITE_`.
- Don’t commit secrets. This repo currently contains a `.env` file; keep it out of git (add `.env` to `.gitignore`) and rotate any exposed keys as appropriate.

## Existing Docs

- IDE setup: `README.md`
- Lobby setup / DB migrations: `LOBBY_SETUP.md`
