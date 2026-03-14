# Skill: Terminal Aesthetic Portfolio Builder

> Build a complete developer portfolio with a **1980s retro-futuristic terminal aesthetic** — dark background, matrix green, neon glow, scanlines, CRT effects. React + TypeScript + Tailwind CSS + Vite.

---

## Overview

This skill generates a full-featured developer portfolio site with:
- Terminal-styled UI with scanlines and CRT glow effects
- Responsive sections: Hero, About, Projects, Skills, Blog, Contact, Footer
- Individual project detail pages with screenshot gallery, features/challenges, and Mermaid architecture diagrams
- Blog pages with markdown rendering
- Scroll-triggered animations (Framer Motion)
- Contact form (user connects their own backend service)
- All content is **placeholder** — the user fills in their own details

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript |
| Styling | Tailwind CSS 4, JetBrains Mono font |
| UI Components | shadcn/ui (Button, Card, Input, Textarea) + Radix UI |
| Routing | wouter |
| Animations | Framer Motion |
| Icons | Lucide React |
| Diagrams | Mermaid |
| Markdown | Streamdown |
| Toasts | Sonner |
| Build | Vite |
| Server | Express (static file serving) |

### Package Setup

```bash
pnpm create vite my-portfolio --template react-ts
cd my-portfolio
pnpm add react react-dom wouter framer-motion lucide-react sonner mermaid streamdown express
pnpm add tailwind-merge clsx class-variance-authority
pnpm add -D tailwindcss @tailwindcss/vite @tailwindcss/typography tw-animate-css
```

Install shadcn/ui components:
```bash
# Button, Card, Input, Textarea — the core components used
npx shadcn@latest init
npx shadcn@latest add button card input textarea
```

---

## Design System

### Color Palette

The entire design is built on a **dark terminal aesthetic** with these key colors:

| Role | Color | CSS Variable | Usage |
|------|-------|-------------|-------|
| Primary | Matrix Green `#00ff41` | `--primary: oklch(0.85 0.25 145)` | Headings, links, primary buttons, progress bars |
| Accent | Cyan Glow `#00f5ff` | `--accent: oklch(0.75 0.25 195)` | Secondary headings, labels, accent elements |
| Destructive | Neon Pink `#ff006e` | `--destructive: oklch(0.65 0.25 350)` | Blog section, warnings, third color accent |
| Background | Deep Black `#0d0208` | `--background: oklch(0.08 0.01 330)` | Page background |
| Card | Dark Gray | `--card: oklch(0.12 0.01 330)` | Card/terminal window backgrounds |
| Foreground | Light Gray | `--foreground: oklch(0.95 0.05 145)` | Body text |
| Border | Green 20% | `--border: oklch(0.85 0.25 145 / 20%)` | All borders |

### Typography

- **Font**: `JetBrains Mono` (monospace only — no sans-serif anywhere)
- **Border radius**: `0` everywhere (sharp corners, no rounding)

### Key CSS Effects

```css
/* Scanlines overlay on body::before */
body::before {
  content: '';
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.15),
    rgba(0, 0, 0, 0.15) 1px,
    transparent 1px,
    transparent 2px
  );
  pointer-events: none;
  z-index: 9999;
  opacity: 0.05;
  animation: scanlines 8s linear infinite;
}

/* Neon glow text effect */
.neon-glow {
  text-shadow: 0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor;
}

/* Neon border box-shadow */
.neon-border {
  box-shadow: 0 0 10px currentColor, 0 0 20px currentColor, inset 0 0 10px currentColor;
}

/* Cursor blink animation on headings */
.cursor-blink::after {
  content: '▋';
  animation: blink 1s infinite;
  margin-left: 2px;
}
```

### Terminal Window Component

Every section uses a `.terminal-window` wrapper:

```
┌─ terminal-header ──────────────────────────┐
│ [●] [●] [●]  ~/file-name.ext              │
├────────────────────────────────────────────┤
│                                            │
│  Content goes here                         │
│                                            │
└────────────────────────────────────────────┘
```

```css
.terminal-window {
  background: var(--card);
  border: 2px solid var(--border);
}

.terminal-header {
  background: rgba(0, 255, 65, 0.1);
  border-bottom: 1px solid var(--border);
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.terminal-dot {
  width: 12px;
  height: 12px;
  border-radius: 0; /* square, not round — matches terminal aesthetic */
  border: 1px solid currentColor;
}
```

Terminal header always has 3 dots:
```tsx
<div className="terminal-header">
  <div className="terminal-dot border-[#00ff41]" />  {/* green */}
  <div className="terminal-dot border-[#00f5ff]" />  {/* cyan */}
  <div className="terminal-dot border-[#ff006e]" />  {/* pink */}
  <span className="text-sm text-muted-foreground ml-2">~/filename</span>
</div>
```

---

## Page Structure & Sections

### Routing

```tsx
// App.tsx — wouter router
<Router>
  <Route path="/" component={Home} />
  <Route path="/project/:slug" component={ProjectPage} />
  <Route path="/blog/:slug" component={BlogPost} />
  <Route component={NotFound} />
</Router>
```

### FadeInSection Helper

All sections use this scroll-triggered animation wrapper:

```tsx
function FadeInSection({ children, className = "", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

---

### 1. Hero Section

Full-screen terminal window with background image, overlay, animated entrance.

**Structure:**
- Background image with `backgroundSize: cover` + dark overlay (`bg-background/80`)
- Terminal window centered (`max-w-4xl mx-auto`)
- Command prompt: `$ whoami`
- Main title with `neon-glow` + `cursor-blink` classes
- Tagline / subtitle text
- Tech badges (colored border + background at 20% opacity)
- CTA buttons (GitHub, Social, Contact)

**Key patterns:**
- Hero entrance: `motion.div` with `initial={{ opacity: 0, scale: 0.95 }}` → `animate={{ opacity: 1, scale: 1 }}`
- Tech badges use alternating colors: `primary`, `accent`, `destructive`
- CTA buttons: primary uses `neon-border`, others use `variant="outline"` with colored borders

**Placeholder content:**
```
Title: "YOUR TITLE HERE"
Subtitle: "Brief description of what you do"
Tech badges: ["Skill 1", "Skill 2", "Skill 3", "Skill 4"]
Buttons: [GitHub, Social Link, Contact Me]
```

---

### 2. About Section

Terminal window with profile image and bio paragraphs.

**Structure:**
- Section heading: icon + `$ whoami --verbose` (accent colored, neon-glow)
- Terminal window with `~/about.md` header
- Profile image with green border + glow effect
- Terminal-style caption: `[System]: Rendering image... Success.`
- 3 bio paragraphs, each starting with `>` in different colors (primary → accent → destructive)

**Placeholder content:**
```
Image: placeholder profile image
Paragraph 1 (green >): Career start and experience
Paragraph 2 (cyan >): What drives/motivates you
Paragraph 3 (pink >): Current specialization
```

---

### 3. Projects Section

3-column grid of project cards in terminal style.

**Structure:**
- Section heading: `Code2` icon + `$ ls -la ./projects` (primary colored)
- Grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- Each card is a `terminal-window` with staggered fade-in (`delay={idx * 0.1}`)

**Project Card Structure:**
```
┌─ Terminal Header (3 dots) ─────────────────┐
│ ┌─ Aspect 16:9 Image ───────────────────┐ │
│ │ (hover: scale-110 transition)          │ │
│ └────────────────────────────────────────┘ │
│ Title (xl, bold, primary)                  │
│ Description (sm, foreground/80)            │
│ [tech] [tags] [in] [muted] [style]        │
│ [Details Button] [Demo Button]             │
└────────────────────────────────────────────┘
```

- Card hover: `hover:scale-105 transition-all duration-300`
- Image hover: `group-hover:scale-110 transition-transform duration-500`
- Details button: navigates to `/project/:slug`
- Demo button: opens external link

**Project Data Model:**
```ts
interface ProjectData {
  slug: string;
  title: string;
  description: string;       // short, for card
  subtitle: string;           // for detail page
  fullDescription: string;    // for detail page
  tech: string[];
  image: string;              // card image URL or placeholder
  screenshots: string[];      // for detail page gallery
  mermaidDiagram: string;     // Mermaid diagram syntax
  demo: string;               // demo URL
  demoLabel?: string;         // custom label (default: "Demo")
  repo: string;               // repo URL
  repoLabel?: string;         // custom label (default: "Code")
  challenges: string[];       // technical challenges
  features: string[];         // key features
}
```

**Placeholder:** Generate 3-5 sample projects with placeholder data.

---

### 4. Skills Matrix Section

2-column grid of skill categories with progress bars, over a background image.

**Structure:**
- Background image with `bg-background/90` overlay
- Section heading: `Cpu` icon + `$ cat skills.json` (accent colored)
- Grid: `grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto`
- Each skill is a `terminal-window` with header showing `category.skill`

**Skill Card Internals:**
```
Category Name (primary) ................ 95% (accent, monospace)
[████████████████████████████░░] <- progress bar with neon-border
[Tag 1] [Tag 2] [Tag 3] [Tag 4]  <- primary/10 bg, primary border
```

**Placeholder skills:**
```ts
const skills = [
  { category: "Languages", items: ["Language 1", "Language 2", "Language 3"], level: 95 },
  { category: "Backend", items: ["Framework 1", "DB 1", "DB 2"], level: 90 },
  { category: "APIs & Integrations", items: ["API 1", "API 2"], level: 85 },
  { category: "Frontend", items: ["Tool 1", "Tool 2"], level: 80 },
  { category: "DevOps", items: ["Tool 1", "Tool 2", "Tool 3"], level: 85 },
];
```

---

### 5. Blog Section

3-column grid of blog post cards.

**Structure:**
- Section heading: `GitBranch` icon + `$ git log --blog` (destructive colored, neon-glow)
- Grid: `grid-cols-1 md:grid-cols-3 gap-6`
- Each card is a `terminal-window` that navigates to `/blog/:slug` on click

**Blog Card:**
```
┌─ Terminal Header (3 dots) ─────────┐
│ Date (xs, accent, monospace)       │
│ Title (lg, bold, primary)          │
│ Excerpt (sm, foreground/80)        │
└────────────────────────────────────┘
```

**Placeholder:** Generate 3 sample blog post stubs.

---

### 6. Contact Section

Terminal-styled contact form.

**Structure:**
- Section heading: `Mail` icon + `$ ./contact.sh` (primary colored)
- Terminal window with `contact_form.tsx` header
- Form fields with terminal-style labels:
  - Email: `$ echo "your_email"` → Input field
  - Message: `$ cat message.txt` → Textarea (6 rows)
- Submit button with `neon-border`, `Send` icon
- Status messages in terminal style:
  - Success: `[System]: Transmission complete. Message delivered to secure channel.`
  - Error: `[System]: Transmission failed. Try again or contact directly.`

**Important — Contact Form Backend:**

> The contact form UI is generated with placeholder submission logic. **The user must connect it to their own backend service.** Options include:
> - **EmailJS** — client-side email sending (no backend needed)
> - **Formspree** — form endpoint service
> - **Telegram Bot API** — send to Telegram chat via server endpoint
> - **Custom API** — any POST endpoint the user builds
>
> The generated code includes a `handleContactSubmit` function with `fetch("/api/contact", ...)` that the user should replace with their chosen service.

---

### 7. Footer

Simple footer with copyright and social links.

```
$ echo "© 2026 Your Name. Built with React + Tailwind"
                                          [GitHub] [Social] [Email]
```

---

## Project Detail Page (`/project/:slug`)

Each project gets a detailed page with these sections:

1. **Header** — "Back to Portfolio" button (in English) + Demo/Code buttons
2. **Hero** — Title (neon-glow), subtitle, full description, tech tags
3. **Screenshots** — `$ ls ./screenshots` heading, grid gallery (2/3/4 columns responsive), lightbox with keyboard navigation (Escape, Arrow keys)
4. **Features & Challenges** — 2-column grid of terminal windows:
   - Left: `features.md` — bulleted list with `▸` markers (primary color)
   - Right: `challenges.md` — bulleted list with `▸` markers (accent color)
5. **Architecture Diagram** — `$ cat architecture.mmd` heading, Mermaid diagram in terminal window with dark theme config:
   ```ts
   const mermaidConfig = {
     theme: "dark",
     themeVariables: {
       primaryColor: "#00ff41",
       primaryTextColor: "#e0e0e0",
       primaryBorderColor: "#00ff41",
       lineColor: "#00f5ff",
       secondaryColor: "#1a1a2e",
       background: "#0d0d1a",
       mainBkg: "#1a1a2e",
       nodeBorder: "#00ff41",
       clusterBkg: "#1a1a2e",
       clusterBorder: "#00f5ff",
       titleColor: "#00ff41",
     },
   };
   ```
6. **Footer CTA** — "Back to Portfolio" button (English) + Demo/Code buttons + "Next Project" suggestion card (cycles through projects list)

---

## Blog Post Page (`/blog/:slug`)

- Terminal-styled article container
- Header with "Back to Portfolio" button and date/title
- Markdown content rendered via Streamdown (note: do NOT duplicate the title as `# Title` in the markdown content — the title is already rendered in the h1 tag)
- Custom prose styling for dark theme (code blocks, blockquotes, links, tables with RTL alignment)
- Streamdown code blocks use `div[data-code-block-container]` (not `pre`) — set `direction: ltr` on the container to fix RTL layout. Language badge capitalized via `text-transform: capitalize` on `[data-code-block-header] span`
- **Important — Markdown rendering fixes:** The component applies two regex replacements before passing content to Streamdown:
  1. `content.replace(/` ``` `\n(?!\n)/g, '` ``` `\n\n')` — adds blank line after code block closings
  2. `content.replace(/([^\n])\n---/g, '$1\n\n---')` — adds blank line before `---` separators to prevent setext-style h2 headings (text + `---` without blank line = h2 in Markdown)
- Do NOT use untagged code blocks for ASCII art diagrams — they render with nearly invisible text on the dark theme
- Footer with:
  - Suggestions to read other blog posts (grid of terminal-styled cards)
  - "Back to Portfolio" button

---

## Responsive Design

| Breakpoint | Layout |
|-----------|--------|
| Mobile (`<768px`) | Single column, full-width cards |
| Tablet (`md:`) | 2-column projects, 2-column skills, 3-column blog |
| Desktop (`lg:`) | 3-column projects, 2-column skills, 3-column blog |

Container: `max-width: 1280px` on `lg:`, with padding `px-4 sm:px-6 lg:px-8`.

---

## Animation Summary

| Element | Animation | Trigger |
|---------|-----------|---------|
| Hero terminal | Scale 0.95→1 + fade | Page load |
| All sections | Fade-in + slide up (y: 40→0) | Scroll into view (once) |
| Grid items | Staggered delay (idx × 0.1s) | Scroll into view (once) |
| Project cards | Scale 1→1.05 | Hover |
| Card images | Scale 1→1.1 | Hover (group) |
| Lightbox | Scale 0.9→1 + fade | Open/close |
| Scanlines | TranslateY 0→10px | Continuous (8s loop) |

---

## Instructions for the User

### Step 1: Generate the Portfolio

When using this skill, Claude will generate the full portfolio codebase with placeholder content. All text content should be replaced with the user's real information:
- Name, title, tagline
- About bio paragraphs
- Project details (title, description, tech stack, features, challenges, Mermaid diagrams)
- Blog posts
- Skill categories and items
- Social links (GitHub, Telegram/Twitter/LinkedIn, email)
- Contact form backend integration

### Step 2: Generate Images with Nano Banana

After the portfolio code is generated, **Claude must output the following image generation prompts** for the user to run in [Nano Banana](https://www.nanobanana.com/) (or any AI image generator).

The user should save each generated image and replace the corresponding placeholder in the codebase.

---

#### Image Prompt Template

All prompts follow this consistent style pattern:
- **Style**: "Terminal aesthetic cyberpunk style" / "Cyberpunk retro-futuristic"
- **Background**: Always dark
- **Colors**: Neon green (#00ff41), neon pink (#ff006e), cyan (#00f5ff), magenta, purple
- **Effects**: "Scanlines effect", "glow effects", "glowing elements", "digital artifacts"
- **Mood**: "80s cyberpunk aesthetic", "retro-futuristic"
- **Quality**: "Professional but artistic" / "Professional tech visualization style"

---

#### Required Images

**1. Hero Background Image**
- **File**: `public/hero-bg.png`
- **Used in**: Hero section `backgroundImage`
- **Prompt**:
```
Cyberpunk retro-futuristic terminal background with matrix-style green code rain, neon pink and cyan circuit board patterns, dark atmospheric tech aesthetic. Include glowing scanlines effect, digital artifacts, and abstract geometric shapes. 80s hacker aesthetic with neon glow. High contrast dark background with bright neon accents. Professional tech visualization style.
```

**2. Profile Image**
- **File**: `public/profile.png`
- **Used in**: About section
- **Note**: This should be a real photo or a stylized avatar. If using AI generation:
```
Professional developer portrait sketch, blue pen style illustration on white background, head and shoulders, friendly expression. Clean minimalist style.
```

**3. Skills Section Background**
- **File**: `public/skills-bg.png`
- **Used in**: Skills Matrix section `backgroundImage`
- **Prompt**:
```
Abstract cyberpunk data visualization for developer skills. Dark background with flowing neon lines (green, pink, cyan, purple) representing different skill categories. Show interconnected nodes, skill level indicators, technical symbols. Include matrix-style code elements, glowing particles, circuit patterns. 80s cyberpunk aesthetic with retro-futuristic feel. Professional abstract tech art style.
```

**4-N. Project Card Images** (one per project)
- **File**: `public/projects/project-name.png`
- **Used in**: Project cards on home page
- **Prompt template**:
```
Terminal aesthetic cyberpunk style image for '[PROJECT NAME]' project. Dark background with neon [CHOOSE: green/blue/pink/cyan/magenta] colors. Show [DESCRIBE RELEVANT VISUAL ELEMENTS: e.g., chatbot interface, data visualization, code editor, API connections, dashboard panels]. Include [RELEVANT UI ELEMENTS: e.g., conversation bubbles, charts, terminal windows, data flow arrows]. Retro-futuristic terminal interface with glowing borders. 80s cyberpunk aesthetic with digital artifacts and neon glow effects. Professional tech visualization style.
```

**Examples of project image prompts:**

For a chatbot project:
```
Terminal aesthetic cyberpunk style image for 'AI Chatbot' project. Dark background with neon green matrix-style code and glowing elements. Show a stylized chatbot interface with conversation bubbles, calendar/booking system elements, and a sleek admin dashboard in the background. Neon pink and cyan accents. Retro-futuristic 80s cyberpunk aesthetic with scanlines effect. Professional but artistic.
```

For a data/scraping project:
```
Terminal aesthetic cyberpunk style image for 'Data Scanner' project. Dark background with neon blue and magenta colors. Show social media posts flowing through a digital scanner/filter system with data analysis visualization. Include dashboard panels with charts and metrics. Retro-futuristic terminal interface with glowing borders. 80s cyberpunk aesthetic with digital artifacts and neon glow effects. Professional tech visualization style.
```

For a code/developer tools project:
```
Cyberpunk terminal aesthetic image showing code repository concept. Dark background with neon green code snippets, glowing terminal windows, GitHub-style interface elements. Include database symbols, cloud storage icons, neon pink and cyan accents. Show interconnected nodes representing data flow. 80s cyberpunk retro-futuristic style with scanlines and glow effects. Professional tech visualization.
```

For a learning/educational project:
```
Cyberpunk terminal aesthetic image for interactive learning platform. Dark background with neon blue and magenta colors. Show educational content elements floating/glowing, interactive lesson interface, progress indicators. Include stylized interface, learning visualization, neon-bordered panels. 80s retro-futuristic cyberpunk style with scanlines. Professional tech visualization with artistic flair.
```

For a modular/builder tool:
```
Cyberpunk retro-futuristic image for modular builder concept. Dark background with neon colors (green, pink, cyan, purple). Show interconnected modular blocks/components assembling together, creation workflow visualization. Include building blocks, neon borders and glowing elements. 80s cyberpunk aesthetic with digital artifacts. Professional but artistic tech visualization style.
```

---

### Prompt Generation Rules for Claude

When generating the portfolio, Claude should:

1. **Ask the user** for their projects, skills, and bio — or use provided info
2. **Generate the full codebase** with placeholder images (use `/placeholder-hero.png`, `/placeholder-skills.png`, `/placeholder-project-N.png`)
3. **At the end of output**, display a clearly formatted **"Step 2: Image Generation"** card:

```
═══════════════════════════════════════════════════════
  📸  STEP 2: GENERATE YOUR IMAGES (Nano Banana)
═══════════════════════════════════════════════════════

Generate these images and save them to the listed paths:

1. HERO BACKGROUND → public/hero-bg.png
   Prompt: "Cyberpunk retro-futuristic terminal background with..."

2. SKILLS BACKGROUND → public/skills-bg.png
   Prompt: "Abstract cyberpunk data visualization for..."

3. PROJECT: [Name] → public/projects/project-slug.png
   Prompt: "Terminal aesthetic cyberpunk style image for '[Name]'..."

4. PROJECT: [Name] → public/projects/project-slug.png
   Prompt: "Terminal aesthetic cyberpunk style image for '[Name]'..."

[... one entry per project ...]

N. PROFILE IMAGE → public/profile.png
   Prompt: "Professional developer portrait sketch..." (or use your own photo)

═══════════════════════════════════════════════════════
  After generating, replace each placeholder path in the code.
  Search for "placeholder-" in the codebase to find all spots.
═══════════════════════════════════════════════════════
```

Each prompt should be **customized to the specific project** — mentioning the project's actual purpose, relevant visual elements (chatbot, dashboard, scanner, builder, etc.), and choosing appropriate neon color combinations.
