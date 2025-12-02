# Repository Guidelines

## Project Structure & Module Organization
The repo splits into `backend/` (TypeScript Hocuspocus server) and `frontend/` (React 19 + Vite client). Backend entrypoint `src/server.ts` pulls settings from `src/config.ts`, while persisted Yjs snapshots live in `storage/` (keep it untracked). Frontend code is grouped by behavior: collaboration utilities in `src/collab/`, screens in `src/pages/`, reusable UI in `src/components/` and `src/hooks/`, and static assets in `public/`.

## Build, Test, and Development Commands
Install dependencies per workspace (`npm install`). Backend: `npm run dev` (tsx watch), `npm run build` (tsc to `dist/`), `npm start` (serve compiled output), `npm run clean` (reset artifacts). Frontend: `npm run dev` (Vite on 5173), `npm run build`, `npm run preview`, `npm run lint`. Start the backend first so the browser client can attach to `ws://localhost:3000`; Vite will proxy CRDT traffic automatically once both processes run.

## Coding Style & Naming Conventions
Codebase is TypeScript-first with ES modules. Frontend files use 2-space indentation, no semicolons, functional React components, and PascalCase filenames; hooks/helpers stay camelCase. Backend currently uses 4 spaces with template-literal logging—mirror the local style rather than reformatting. Run `npm run lint` in `frontend/` before committing; backend relies on `tsc`, so add explicit return types on exported helpers. Reference runtime settings via `.env` keys (`PORT`, `STORAGE_DIR`, `MAX_DOCUMENT_SIZE`) instead of literals.

## Testing Guidelines
Automated tests are not wired up yet, so run manual passes: start the backend, open two browser tabs, confirm rich-text edits sync, and watch the server log for `Client connected` / `Client disconnected`. Clear `backend/storage/` between persistence experiments to avoid stale snapshots. When adding tests, colocate specs beside the modules they cover (e.g., `RoomShell.test.tsx`) and document any coverage goals in the PR.

## Commit & Pull Request Guidelines
Use short, imperative commit subjects prefixed with the affected area (e.g., `frontend: add cursor overlay`) and squash noisy WIP locally. Each PR needs a concise summary, testing notes (`npm run build`, multi-tab verification), screenshots or console snippets for UX-affecting work, and links to related learning issues. Call out CRDT-impacting changes explicitly so reviewers can reason about merge semantics before approval.
