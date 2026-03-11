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
