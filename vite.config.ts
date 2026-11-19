import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin, type ViteDevServer } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
import { getPageMeta, pages, type PageMeta } from "./client/src/lib/page-meta";
import { PAGE_HTML_FILE, type PageHtmlFile } from "./shared/const";

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
// SEO: תגיות head לכל עמוד, מפת אתר (sitemap.xml) ו-robots.txt
// =============================================================================

/** הסמן ב-client/index.html שבמקומו נכנסות תגיות ה-head של העמוד (כותרת, תיאור, og, twitter, canonical) */
const PAGE_META_PLACEHOLDER = "<!-- page-meta -->";

/**
 * תמונת השיתוף של האתר, לכל עמוד שאין לו תמונה משלו (PageMeta.image). עמוד פרויקט מקבל את תמונת הכרטיס שלו.
 * הגודל והסוג ב-og:image:width/height/type עוזרים לפייסבוק להציג את התמונה כבר בשיתוף הראשון.
 * מקור: https://developers.facebook.com/docs/sharing/webmasters/#images
 */
const SHARE_IMAGE = { path: "/og-preview.png", width: 1200, height: 630, type: "image/png" };

/**
 * og:image:type לפי סיומת, לסוגי התמונות שיש באתר. סיומת אחרת מקבלת תמונה בלי og:image:type: תגית חסרה עדיפה על ניחוש.
 * scripts/check-seo.mjs משווה את הערך ל-Content-Type שהשרת באמת שולח עם התמונה.
 */
const IMAGE_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

/**
 * תגיות SEO מאותם נתונים שהאתר מציג (client/src/lib/page-meta.ts), כך שעמוד חדש נכנס אליהן לבד:
 *
 * 1. **head לכל עמוד.** האתר הוא SPA, והשרת מגיש את אותו index.html לכל כתובת. בלי זה, כל קישור לפוסט
 *    או לפרויקט ששותף בטלגרם, בווטסאפ או בפייסבוק הציג את הכותרת והתיאור של דף הבית, כי הסורקים שלהם
 *    קוראים רק את ה-HTML הראשוני, ו-og:url הצביע על דף הבית, שאליו פייסבוק מצרף את הלייקים והשיתופים
 *    ("Likes and Shares for this URL will aggregate at this URL", https://developers.facebook.com/docs/sharing/webmasters/#basic).
 *    - דף הבית: transformIndexHtml מכניס את התגיות של "/" במקום הסמן ב-index.html. רץ גם בשרת הפיתוח.
 *    - שאר העמודים: אחרי הבנייה, writeBundle לוקח את index.html הסופי (עם שמות הקבצים המגובבים), מפצל אותו
 *      סביב ה-head של דף הבית, ושומר ב-dist/page-html.json את שני החלקים ואת ה-head של כל עמוד.
 *      השרת (server/index.ts) מרכיב משם את העמוד לפי הנתיב. כך השרת לא צריך לדעת דבר על הנתונים או על כתובת האתר.
 *    הקישור הקנוני ב-head של ה-HTML המקורי, בכתובת מלאה, ומצביע על העמוד עצמו, כמו שגוגל ממליץ.
 *    מקור: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
 *
 * 2. **sitemap.xml ו-robots.txt** בזמן הבנייה. עמודי ה-Ask AI לא נכנסים למפה (ראו inSitemap ב-page-meta.ts).
 *    אין <lastmod>, כי גוגל משתמש בו רק כשהוא מדויק באופן עקבי, ואין לנו תאריך עדכון אמין לכל עמוד.
 *    מקור: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
 *    הקובץ robots.txt מתיר הכול ומפנה למפה. השורה Sitemap חייבת כתובת מלאה.
 *    מקור: https://developers.google.com/search/docs/crawling-indexing/robots/create-robots-txt
 *
 * שניהם צריכים את הכתובת המלאה של האתר (VITE_SITE_URL). כשהיא חסרה או לא תקינה, הבנייה לא נכשלת
 * (כדי לא לעצור פריסה בגלל SEO): היא מזהירה בלוג של הבנייה, מדלגת על sitemap.xml, robots.txt נוצר בלי
 * השורה Sitemap, וב-head אין את התגיות שדורשות כתובת מלאה (og:url, og:image, twitter:image, canonical):
 * תגית חסרה עדיפה על תגית עם כתובת שבורה. ה-CI מריץ את scripts/check-seo.mjs, שנכשל במצב כזה.
 */
function vitePluginSeo(): Plugin {
  let siteUrl: string | null = null;

  return {
    name: "seo",

    configResolved(config) {
      // config.env כולל את משתני VITE_ מהסביבה ומקבצי .env
      const raw = config.env.VITE_SITE_URL;
      siteUrl = resolveSiteUrl(raw);
      // בשרת הפיתוח הכתובת בדרך כלל לא מוגדרת, וזה תקין: משם לא משתפים קישורים ולא נבנית מפה
      if (!siteUrl && config.command === "build") {
        config.logger.warn(
          `[seo] VITE_SITE_URL is missing or is not a full http(s) address (got ${JSON.stringify(raw)}). ` +
            "sitemap.xml was NOT generated, robots.txt has no Sitemap line, " +
            "and the pages have no og:url, og:image, twitter:image or canonical link."
        );
      }
    },

    // פונקציה רגילה, בלי order: ב-Vite 7.1 היא רצה אחרי עיבוד ה-HTML של Vite, כך שהוא לא נוגע בתגיות שהיא מכניסה.
    // מקור: resolveHtmlTransforms ו-buildHtmlPlugin ב-node_modules/vite/dist/node/chunks/dep-*.js
    transformIndexHtml(html) {
      const parts = html.split(PAGE_META_PLACEHOLDER);
      if (parts.length !== 2) {
        throw new Error(
          `[seo] client/index.html must contain ${PAGE_META_PLACEHOLDER} exactly once (found ${parts.length - 1})`
        );
      }
      return parts.join(renderPageHead(getPageMeta("/"), siteUrl));
    },

    // רץ אחרי שכל הקבצים נכתבו לדיסק, ולכן index.html שנקרא כאן הוא בדיוק הקובץ שהשרת מגיש בדף הבית.
    // מקור לחתימה: writeBundle ב-node_modules/rollup/dist/rollup.d.ts
    writeBundle(options) {
      if (!options.dir) this.error("[seo] the build has no output dir, so page HTML cannot be written");

      const duplicate = pages.find((page, i) => pages.findIndex((p) => p.path === page.path) !== i);
      if (duplicate) this.error(`[seo] two pages share the path ${duplicate.path} (duplicate slug in the data?)`);

      const indexHtml = fs.readFileSync(path.join(options.dir, "index.html"), "utf-8");
      const parts = indexHtml.split(renderPageHead(getPageMeta("/"), siteUrl));
      if (parts.length !== 2) {
        this.error(
          `[seo] dist/public/index.html should contain the home page head exactly once (found ${parts.length - 1}). ` +
            "Did another plugin change those tags after transformIndexHtml?"
        );
      }

      // index.html נשמר פעם אחת, מפוצל סביב ה-head, ולכל עמוד נשמר רק ה-head שלו: הקובץ כולל סקריפט מוטמע
      // של כ-360KB (מ-vite-plugin-manus-runtime), ועותק מלא לכל עמוד היה מנפח את הקובץ לכ-6MB
      const pageHtml: PageHtmlFile = {
        before: parts[0],
        after: parts[1],
        heads: Object.fromEntries(
          pages.filter((page) => page.path !== "/").map((page) => [page.path, renderPageHead(page, siteUrl)])
        ),
      };
      fs.writeFileSync(path.join(options.dir, "..", PAGE_HTML_FILE), JSON.stringify(pageHtml));
    },

    generateBundle() {
      if (!siteUrl) {
        this.emitFile({ type: "asset", fileName: "robots.txt", source: "User-agent: *\nAllow: /\n" });
        return;
      }

      const urls = pages
        .filter((page) => page.inSitemap)
        .map((page) => `  <url>\n    <loc>${escapeXml(siteUrl + page.path)}</loc>\n  </url>`)
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
 * הכתובת המלאה של האתר, בלי / בסוף, או null כשהיא חסרה או אינה כתובת http(s) מלאה.
 */
function resolveSiteUrl(raw: string | undefined): string | null {
  let url: URL;
  try {
    url = new URL(raw ?? "");
  } catch {
    // לא כתובת בכלל (חסרה, או בלי פרוטוקול) — הקורא מזהיר בלוג של הבנייה
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  return url.href.replace(/\/+$/, "");
}

/**
 * תגיות ה-head של עמוד אחד. כל ערך עובר escapeHtml, כי כותרות ותיאורים מגיעים מהנתונים ויכולים להכיל & או ".
 * תגיות שדורשות כתובת מלאה מושמטות כשאין siteUrl (ראו vitePluginSeo).
 * שמות התגיות של twitter:* הם אלה שכבר היו ב-index.html. לא אימתתי אותם מול התיעוד של X:
 * דף התיעוד (developer.x.com/en/docs/x-for-websites/cards/overview/markup) החזיר HTTP 402.
 */
function renderPageHead(page: PageMeta, siteUrl: string | null): string {
  const pageUrl = siteUrl && siteUrl + page.path;
  const image = siteUrl ? shareImage(page, siteUrl) : null;
  const tags = [
    `<title>${escapeHtml(page.title)}</title>`,
    `<meta name="description" content="${escapeHtml(page.description)}" />`,
    pageUrl && `<link rel="canonical" href="${escapeHtml(pageUrl)}" />`,
    // Open Graph. מקור לשמות ולערכים: https://ogp.me/
    `<meta property="og:type" content="${escapeHtml(page.type)}" />`,
    `<meta property="og:title" content="${escapeHtml(page.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(page.description)}" />`,
    pageUrl && `<meta property="og:url" content="${escapeHtml(pageUrl)}" />`,
    image && `<meta property="og:image" content="${escapeHtml(image.url)}" />`,
    image?.width && `<meta property="og:image:width" content="${image.width}" />`,
    image?.height && `<meta property="og:image:height" content="${image.height}" />`,
    image?.type && `<meta property="og:image:type" content="${escapeHtml(image.type)}" />`,
    `<meta property="og:locale" content="he_IL" />`,
    `<meta property="og:site_name" content="Amir Biron Portfolio" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(page.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(page.description)}" />`,
    image && `<meta name="twitter:image" content="${escapeHtml(image.url)}" />`,
  ];
  return tags.filter(Boolean).join("\n    ");
}

/**
 * תמונת השיתוף של עמוד, בכתובת מלאה. לתמונת האתר יש מידות ידועות. לתמונה של עמוד אין מידות:
 * הבנייה לא מודדת קבצי תמונה, ומידות שגויות גרועות מחסרות. ווטסאפ וטלגרם לא צריכים אותן,
 * ובפייסבוק בלעדיהן התמונה עלולה לא להופיע בשיתוף הראשון של הקישור (ראו SHARE_IMAGE).
 */
function shareImage(
  page: PageMeta,
  siteUrl: string
): { url: string; width?: number; height?: number; type?: string } {
  if (!page.image) {
    return { url: siteUrl + SHARE_IMAGE.path, width: SHARE_IMAGE.width, height: SHARE_IMAGE.height, type: SHARE_IMAGE.type };
  }
  // נתיב מתוך client/public מקבל את כתובת האתר לפניו, כמו og:url; כתובת מלאה נשארת כמו שהיא
  const url = /^https?:\/\//i.test(page.image) ? page.image : siteUrl + page.image;
  return { url, type: IMAGE_TYPES[path.posix.extname(new URL(url).pathname).toLowerCase()] };
}

/** בריחה לטקסט של תגית ולערך של מאפיין בגרשיים כפולים: אלה ארבעת התווים שיכולים לשבור אותם */
function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime(), vitePluginManusDebugCollector(), vitePluginSeo()];

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
