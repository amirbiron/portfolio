// בדיקה שמפת האתר (sitemap.xml) ו-robots.txt נוצרו בבנייה ומוגשים כמו שצריך. רצה אחרי `pnpm build`.
// הבנייה לא נכשלת כשחסר VITE_SITE_URL (היא מזהירה ומדלגת על המפה, ראה vite.config.ts), ולכן
// הבדיקה הזו היא מה שנכשל ב-CI כשהמפה לא נוצרה או כשחסרים בה עמודים.
// היא מריצה את שרת הייצור (dist/index.js) ושואלת אותו ב-HTTP, כמו שגוגל עושה. כך היא תופסת גם
// מצב שבו הקובץ לא מוגש, והשרת מחזיר במקומו את דף הבית (הנתיב שמגיש את index.html לכל כתובת).
// מקור לכלל: amir-bug-patterns, claude-md-snippets/testing.md, כלל 1 (לבדוק דרך הממשק של הצרכן).
import { spawn } from "node:child_process";
import { build } from "esbuild";

// אותו נרמול כמו ב-vite.config.ts, כדי שהכתובות הצפויות יהיו זהות לאלה שהבנייה כותבת
function normalizeSiteUrl(raw) {
  try {
    const url = new URL(raw ?? "");
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.href.replace(/\/+$/, "");
  } catch {
    return null;
  }
}

const siteUrl = normalizeSiteUrl(process.env.VITE_SITE_URL);
if (!siteUrl) {
  // שגיאת תצורה של הבדיקה עצמה: נכשלים, לא מדלגים
  console.error(
    `VITE_SITE_URL חסר או אינו כתובת http(s) מלאה (${JSON.stringify(process.env.VITE_SITE_URL)}). ` +
      "הבדיקה צריכה את אותה כתובת שהבנייה קיבלה."
  );
  process.exit(1);
}

// הנתונים נטענים מקבצי ה-TypeScript עצמם (esbuild מתרגם אותם), אותו מקור שהאתר והמפה נבנים ממנו
async function loadModule(file) {
  const result = await build({ entryPoints: [file], bundle: true, format: "esm", platform: "node", write: false });
  return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
}
const { projects } = await loadModule("client/src/lib/projects.ts");
const { testimonials } = await loadModule("client/src/lib/testimonials.ts");
const { blogSlugs } = await loadModule("client/src/lib/blog.ts");

// הנתיבים שהמפה חייבת לכלול, לפי הנתיבים שמוגדרים ב-client/src/App.tsx (עמודי ה-Ask AI בחוץ בכוונה)
const expected = new Set([
  `${siteUrl}/`,
  ...projects.map((p) => `${siteUrl}/project/${encodeURIComponent(p.slug)}`),
  ...testimonials.map((t) => `${siteUrl}/testimonial/${encodeURIComponent(t.slug)}`),
  ...blogSlugs.map((slug) => `${siteUrl}/blog/${encodeURIComponent(slug)}`),
]);

const PORT = "4317";
const base = `http://localhost:${PORT}`;
const server = spawn(process.execPath, ["dist/index.js"], {
  env: { ...process.env, NODE_ENV: "production", PORT },
  stdio: ["ignore", "ignore", "inherit"],
});
let serverExited = false;
server.on("exit", () => {
  serverExited = true;
});

async function waitForServer() {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    if (serverExited) throw new Error("שרת הייצור נסגר מיד בעלייה (האם רץ `pnpm build` לפני הבדיקה?)");
    try {
      const res = await fetch(`${base}/`);
      if (res.ok) return;
    } catch {
      // השרת עוד לא מאזין — מנסים שוב
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`שרת הייצור לא ענה תוך 20 שניות על ${base}`);
}

const decodeXml = (text) =>
  text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");

const failures = [];
let urlCount = 0;
try {
  await waitForServer();

  const sitemap = await fetch(`${base}/sitemap.xml`);
  const sitemapBody = await sitemap.text();
  const sitemapType = sitemap.headers.get("content-type") ?? "";
  if (sitemap.status !== 200) failures.push(`/sitemap.xml החזיר סטטוס ${sitemap.status}`);
  if (!sitemapType.includes("xml")) {
    failures.push(`/sitemap.xml מוגש כ-"${sitemapType}" ולא כ-XML: כנראה המפה לא נוצרה, והשרת החזיר את דף הבית`);
  } else {
    if (!sitemapBody.startsWith('<?xml version="1.0" encoding="UTF-8"?>')) failures.push("למפה חסרה הצהרת ה-XML בתחילתה");
    if (!sitemapBody.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')) {
      failures.push("למפה חסר <urlset> עם ה-namespace של sitemaps.org");
    }
    const locs = [...sitemapBody.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => decodeXml(m[1]));
    urlCount = (sitemapBody.match(/<url>/g) ?? []).length;
    if (urlCount !== locs.length) failures.push(`במפה ${urlCount} רשומות <url> אבל ${locs.length} רשומות <loc>`);
    const found = new Set(locs);
    for (const url of expected) if (!found.has(url)) failures.push(`חסר במפה: ${url}`);
    for (const url of found) if (!expected.has(url)) failures.push(`כתובת לא צפויה במפה: ${url}`);
    if (found.size !== locs.length) failures.push("יש במפה כתובות כפולות");
  }

  const robots = await fetch(`${base}/robots.txt`);
  const robotsBody = await robots.text();
  const robotsType = robots.headers.get("content-type") ?? "";
  if (robots.status !== 200) failures.push(`/robots.txt החזיר סטטוס ${robots.status}`);
  if (!robotsType.startsWith("text/plain")) {
    failures.push(`/robots.txt מוגש כ-"${robotsType}" ולא כטקסט: כנראה הקובץ לא נוצר, והשרת החזיר את דף הבית`);
  } else {
    const lines = robotsBody.split("\n");
    if (!lines.includes("User-agent: *")) failures.push("ב-robots.txt חסרה השורה User-agent: *");
    if (!lines.includes(`Sitemap: ${siteUrl}/sitemap.xml`)) {
      failures.push(`ב-robots.txt חסרה השורה Sitemap: ${siteUrl}/sitemap.xml`);
    }
  }
} catch (err) {
  failures.push(err.message);
} finally {
  server.kill();
}

if (failures.length > 0) {
  console.error("בדיקת sitemap.xml ו-robots.txt נכשלה:");
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log(`sitemap.xml ו-robots.txt תקינים: ${urlCount} כתובות, כולן מ-${siteUrl}.`);
