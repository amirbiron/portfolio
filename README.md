# Portfolio — Amir Biron

אתר פורטפוליו אישי לפיתוח בוטים, בנוי עם אסתטיקה של טרמינל רטרו-פיוצ'ריסטי בסגנון cyberpunk משנות ה-80.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)

## Overview

A personal portfolio site showcasing bot development projects, technical blog posts, client testimonials, and a contact form. Features a retro terminal design with matrix green, neon pink, and cyan color palette over a dark background.

### Sections

- **Hero** — Terminal-style `whoami` intro
- **About** — Developer profile and background
- **Projects** — 5 showcase projects (CodeKeeper, ModularBot, MarkdownBot, FB Leads Scanner, AI Business Bot)
- **Testimonials** — Client feedback with screenshots
- **Skills Matrix** — Technical skills with progress indicators
- **Blog** — Technical articles on bot development, distributed systems, and integrations
- **Contact** — Form that sends messages via Telegram

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, TypeScript, Tailwind CSS 4, Radix UI, Framer Motion, wouter |
| **Server** | Express (static file serving + contact API) |
| **Build** | Vite (client), esbuild (server) |
| **Styling** | JetBrains Mono font, CRT scanlines, terminal glow effects |

## Getting Started

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build

# Run production server
pnpm start
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Vite dev server |
| `pnpm build` | Build client + bundle server to `dist/` |
| `pnpm start` | Run production Express server |
| `pnpm check` | TypeScript type checking |
| `pnpm format` | Format code with Prettier |

## Project Structure

```
├── client/
│   ├── src/
│   │   ├── pages/          # Home, BlogPost, ProjectPage, TestimonialPage
│   │   ├── components/ui/  # Radix UI component library
│   │   ├── lib/            # Project & testimonial data
│   │   ├── hooks/          # Custom React hooks
│   │   └── contexts/       # Theme context
│   └── public/             # Static assets (images, screenshots)
├── server/
│   └── index.ts            # Express server with /api/contact endpoint
└── shared/                 # Shared types/utilities
```

## License

All rights reserved.
