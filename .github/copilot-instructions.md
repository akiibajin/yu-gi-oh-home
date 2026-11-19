# Project Guidelines

This repo is a **Tauri 2 desktop app** with a **Vite + Preact (React-compat) + TypeScript** frontend and a **Rust** backend.

## Build and Run

- Install deps: `pnpm install` (this repo uses `pnpm-lock.yaml`; avoid npm/yarn)
- Frontend dev server (fixed port): `pnpm dev` (Vite on `localhost:1420`)
- Desktop app dev: `pnpm tauri dev`
- Frontend build: `pnpm build` (`tsc` + `vite build`)

## Formatting and Linting

- Use vp check for TS/TSX formatting: `pnpm check`
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

<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Built-in Commands vs Scripts

`vp <name>` runs a built-in command. `vp run <name>` runs a `package.json` script or a `vite.config.ts` task. Scripts cannot overwrite built-ins, so `vp dev` and `vp run dev` may do different things. Check `package.json` and `vite.config.ts` first, and run `vp run <name>` when the project defines a script or task with that name.

## Running Scripts

Run TypeScript and JavaScript files with `vpx <file>`, for example `vpx ./scripts/seed.ts --dry-run`. It handles enums, decorators, JSX, and tsconfig `paths`, so do not add `tsx` or `ts-node` to run scripts. `vpx --watch <file>` reruns the file when a file it uses changes, in place of `tsx watch`. `vp node <file>` runs plain Node.js.

## Tool Versions

Run `vp toolchain` to show versions and relationships in the active Vite+
release. Add a tool name to select part of the graph. For example, run
`vp toolchain vite`. Use `--global` to ignore the local `vite-plus` package. Use
`vp why <package>` to show the package-manager dependency graph.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->
