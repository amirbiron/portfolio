import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin, type ViteDevServer } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
import { blogSlugs } from "./client/src/lib/blog";
import { projects } from "./client/src/lib/projects";
import { testimonials } from "./client/src/lib/testimonials";

// =============================================================================
// Manus Debug Collector - Vite Plugin
// Writes browser logs directly to files, trimmed when exceeding size limit
// =============================================================================

const PROJECT_ROOT = import.meta.dirname;
const LOG_DIR = path.join(PROJECT_ROOT, ".manus-logs");
const MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024; // 1MB per log file
const TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6); // Trim to 60% to avoid constant re-trimming

type LogSource = "browserConsole" | "networkRequests" | "sessionReplay";

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function trimLogFile(logPath: string, maxSize: number) {
  try {
    if (!fs.existsSync(logPath) || fs.statSync(logPath).size <= maxSize) {
      return;
    }

    const lines = fs.readFileSync(logPath, "utf-8").split("\n");
    const keptLines: string[] = [];
    let keptBytes = 0;

    // Keep newest lines (from end) that fit within 60% of maxSize
    const targetSize = TRIM_TARGET_BYTES;
    for (let i = lines.length - 1; i >= 0; i--) {
      const lineBytes = Buffer.byteLength(`${lines[i]}\n`, "utf-8");
      if (keptBytes + lineBytes > targetSize) break;
      keptLines.unshift(lines[i]);
      keptBytes += lineBytes;
    }

    fs.writeFileSync(logPath, keptLines.join("\n"), "utf-8");
  } catch {
    /* ignore trim errors */
  }
}

function writeToLogFile(source: LogSource, entries: unknown[]) {
  if (entries.length === 0) return;

  ensureLogDir();
  const logPath = path.join(LOG_DIR, `${source}.log`);

  // Format entries with timestamps
  const lines = entries.map((entry) => {
    const ts = new Date().toISOString();
    return `[${ts}] ${JSON.stringify(entry)}`;
  });

  // Append to log file
  fs.appendFileSync(logPath, `${lines.join("\n")}\n`, "utf-8");

  // Trim if exceeds max size
  trimLogFile(logPath, MAX_LOG_SIZE_BYTES);
}

/**
 * Vite plugin to collect browser debug logs
 * - POST /__manus__/logs: Browser sends logs, written directly to files
 * - Files: browserConsole.log, networkRequests.log, sessionReplay.log
 * - Auto-trimmed when exceeding 1MB (keeps newest entries)
 */
function vitePluginManusDebugCollector(): Plugin {
  return {
    name: "manus-debug-collector",

    transformIndexHtml(html) {
      if (process.env.NODE_ENV === "production") {
        return html;
      }
      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: {
              src: "/__manus__/debug-collector.js",
              defer: true,
            },
            injectTo: "head",
          },
        ],
      };
    },

    configureServer(server: ViteDevServer) {
      // POST /__manus__/logs: Browser sends logs (written directly to files)
      server.middlewares.use("/__manus__/logs", (req, res, next) => {
        if (req.method !== "POST") {
          return next();
        }

        const handlePayload = (payload: any) => {
          // Write logs directly to files
          if (payload.consoleLogs?.length > 0) {
            writeToLogFile("browserConsole", payload.consoleLogs);
          }
          if (payload.networkRequests?.length > 0) {
            writeToLogFile("networkRequests", payload.networkRequests);
          }
          if (payload.sessionEvents?.length > 0) {
            writeToLogFile("sessionReplay", payload.sessionEvents);
          }

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        };

        const reqBody = (req as { body?: unknown }).body;
        if (reqBody && typeof reqBody === "object") {
          try {
            handlePayload(reqBody);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
          return;
        }

        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });

        req.on("end", () => {
          try {
            const payload = JSON.parse(body);
            handlePayload(payload);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
        });
      });
    },
  };
}

// =============================================================================
// מפת אתר (sitemap.xml) ו-robots.txt
// =============================================================================

/**
 * בונה את sitemap.xml ואת robots.txt בזמן הבנייה, מאותם נתונים שהאתר מציג:
 * פרויקט, המלצה או פוסט חדש נכנסים למפה לבד, בלי לערוך אותה ביד.
 *
 * עמודי ה-Ask AI לא נכנסים בכוונה: הם חלון צ'אט, בלי תוכן משלהם לחיפוש.
 * אין <lastmod>, כי גוגל משתמש בו רק כשהוא מדויק באופן עקבי, ואין לנו תאריך עדכון אמין לכל עמוד.
 * מקור: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
 * הקובץ robots.txt מתיר הכול ומפנה למפה. השורה Sitemap חייבת כתובת מלאה.
 * מקור: https://developers.google.com/search/docs/crawling-indexing/robots/create-robots-txt
 */
function vitePluginSitemap(): Plugin {
  let siteUrl = "";

  return {
    name: "sitemap",
    apply: "build",

    configResolved(config) {
      // אותו משתנה שממלא את תגיות ה-og ב-index.html (config.env כולל את משתני VITE_ מהסביבה ומקבצי .env)
      siteUrl = resolveSiteUrl(config.env.VITE_SITE_URL);
    },

    generateBundle() {
      const paths = [
        "/",
        ...projects.map((p) => `/project/${encodeURIComponent(p.slug)}`),
        ...testimonials.map((t) => `/testimonial/${encodeURIComponent(t.slug)}`),
        ...blogSlugs.map((slug) => `/blog/${encodeURIComponent(slug)}`),
      ];
      const urls = paths
        .map((p) => `  <url>\n    <loc>${escapeXml(siteUrl + p)}</loc>\n  </url>`)
        .join("\n");

      this.emitFile({
        type: "asset",
        fileName: "sitemap.xml",
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      });
      this.emitFile({
        type: "asset",
        fileName: "robots.txt",
        source: `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
      });
    },
  };
}

/**
 * הכתובת המלאה של האתר, בלי / בסוף. הבנייה נכשלת כשהיא חסרה או לא תקינה, כי המפה ו-robots.txt
 * חייבים כתובות מלאות. בלעדיה גם תגיות ה-og נשברות בשקט: Vite רק מזהיר ומשאיר בעמוד את הטקסט
 * "%VITE_SITE_URL%" כמו שהוא.
 */
function resolveSiteUrl(raw: string | undefined): string {
  const fail = () =>
    new Error(
      `VITE_SITE_URL must be the site's full address, for example https://example.com (got ${JSON.stringify(raw)}). ` +
        "It is required for sitemap.xml, robots.txt and the og tags in index.html."
    );
  let url: URL;
  try {
    url = new URL(raw ?? "");
  } catch {
    throw fail();
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") throw fail();
  return url.href.replace(/\/+$/, "");
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime(), vitePluginManusDebugCollector(), vitePluginSitemap()];

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    strictPort: false, // Will find next available port if 3000 is busy
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
