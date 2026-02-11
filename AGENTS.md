# Repository Guidelines

## Project Structure & Module Organization
Source code lives in `src/` and is split by responsibility:
- `server.ts`: HTTP entrypoint (`/health`, `/process/:mrId`, `/webhook/gitlab`)
- `app.ts`: core MR processing flow
- `gitlab.ts`, `sonar.ts`, `http.ts`: external API integrations and retry logic
- `config.ts`, `logger.ts`, `types.ts`, `format.ts`, `actions.ts`: shared infrastructure

Build output is written to `dist/`. Runtime/container files are in `Dockerfile`, `docker-compose.yml`, `.env.example`, and `README.md`.

## Build, Test, and Development Commands
- `npm install`: install dependencies.
- `npm run dev`: run service in watch mode via `tsx` (local development).
- `npm run build`: compile TypeScript to `dist/`.
- `npm run start`: start compiled app (`dist/server.js`).
- `npx tsc -p tsconfig.json --noEmit`: type-check without emitting files (recommended pre-PR check).

## Coding Style & Naming Conventions
- Language: TypeScript (`commonjs`), 2-space indentation, semicolon-free style.
- Prefer small, single-purpose functions and explicit return types for exported functions.
- File names are lowercase (`sonar.ts`, `gitlab.ts`); types/interfaces use `PascalCase`; variables/functions use `camelCase`.
- Keep API error messages actionable and include HTTP status context.

## Testing Guidelines
There is currently no formal test suite in the repository.  
For now, validate changes with:
- `npx tsc --noEmit` (type safety)
- manual endpoint checks from `README.md` (MR and pipeline webhook scenarios)

When adding tests, place them under `src/__tests__/` or beside modules as `*.test.ts`, and cover webhook parsing, retry behavior, and GitLab note upsert logic.

## Commit & Pull Request Guidelines
History is minimal (one initial commit), so use this convention going forward:
- Commit messages: short, imperative, English (example: `Add pipeline webhook MR processing`).
- One logical change per commit.
- PRs should include: purpose, changed files/modules, manual verification steps, and sample request/response payloads for webhook behavior changes.

## Security & Configuration Tips
- Never commit real `.env` secrets (`GITLAB_TOKEN`, `SONAR_TOKEN`, `WEBHOOK_SECRET`).
- Keep `WEBHOOK_SECRET` synchronized with GitLab webhook settings.
- Use least-privileged tokens and rotate secrets if leaked.
