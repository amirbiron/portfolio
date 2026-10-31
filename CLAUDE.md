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
- `pnpm check` — TypeScript type check, plus `scripts/check-bidi.mjs` (fails on invisible BiDi marks such as U+200F in code; write them as visible escapes like `"\u200E"` instead)
- `pnpm format` — Prettier formatting
- `node scripts/check-sitemap.mjs` — run after `pnpm build`, with the same `VITE_SITE_URL`: starts the production server and checks that `/sitemap.xml` and `/robots.txt` are served and list every project, testimonial and blog post. The build itself only warns when `VITE_SITE_URL` is missing, so this script is what fails.

## CI
`.github/workflows/ci.yml` runs on every PR and every push to `main`: `pnpm check`, `pnpm build`, then `scripts/check-sitemap.mjs`.

## Language

- **Code comments** — Write in Hebrew
- **PR titles and descriptions** — Write in Hebrew
- **Commit messages** — English (Git convention)

## Changelog Requirement

**After every task that modifies the codebase, you MUST update `CHANGELOG.md` at the project root.**

**Important:** Document only content/design/feature changes (things that affect the final product). Do NOT document infrastructure changes like Render config, CLAUDE.md updates, or dev tooling — those are specific to this environment and won't be applied back.

The changelog will be handed to a different AI agent (Manus) to reproduce the same changes on a parallel codebase. Write entries clearly enough for that purpose.

Each entry should include:
- **Date** (YYYY-MM-DD)
- **Summary** — one-line description of what changed
- **Files changed** — list of files added/modified/deleted
- **Details** — what was done and why, with clear instructions for re-implementation

Write entries in **Hebrew** to match the project owner's language.

Format:
```markdown
## [YYYY-MM-DD] Summary

**קבצים שהשתנו:**
- `path/to/file` — (נוסף/שונה/נמחק) תיאור קצר

**פירוט:**
תיאור מפורט של מה שנעשה ולמה, כולל הנחיות ליישום מחדש.
```
