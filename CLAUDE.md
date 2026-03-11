# Portfolio

Static portfolio site built with React + TypeScript + Vite, served by Express in production.

## Architecture
- **Frontend**: React 19, Tailwind CSS 4, Radix UI, wouter (routing)
- **Server**: Express static file server (`server/index.ts`)
- **Build**: Vite builds the client to `dist/public`, esbuild bundles the server to `dist/index.js`

## Commands
- `pnpm dev` — Start dev server
- `pnpm build` — Build for production
- `pnpm start` — Run production server
- `pnpm check` — TypeScript type check
- `pnpm format` — Prettier formatting

## Changelog Requirement

**After every task that modifies the codebase, you MUST update `CHANGELOG.md` at the project root.**

Each entry should include:
- **Date** (YYYY-MM-DD)
- **Summary** — one-line description of what changed
- **Files changed** — list of files added/modified/deleted
- **Details** — what was done and why, written clearly enough so that a different AI agent (Manus) can reproduce the exact same changes on a parallel codebase

Write entries in **Hebrew** to match the project owner's language.

Format:
```markdown
## [YYYY-MM-DD] Summary

**קבצים שהשתנו:**
- `path/to/file` — (נוסף/שונה/נמחק) תיאור קצר

**פירוט:**
תיאור מפורט של מה שנעשה ולמה, כולל הנחיות ליישום מחדש.
```
