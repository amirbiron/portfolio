// בדיקת ה-SEO של האתר אחרי `pnpm build`: שמפת האתר (sitemap.xml) ו-robots.txt נוצרו ומוגשים כמו שצריך,
// ושכל עמוד מוגש עם ה-head שלו (כותרת, תיאור, og:url, קישור קנוני) ולא עם זה של דף הבית.
// הבנייה לא נכשלת כשחסר VITE_SITE_URL (היא מזהירה ומדלגת, ראה vitePluginSeo ב-vite.config.ts), ולכן
// הבדיקה הזו היא מה שנכשל ב-CI כשהמפה לא נוצרה, כשחסרים בה עמודים, או כשעמוד מוגש בלי ה-head שלו.
// היא מריצה את שרת הייצור (dist/index.js) ושואלת אותו ב-HTTP, כמו שגוגל, פייסבוק וטלגרם עושים. כך היא
// תופסת גם מצב שבו קובץ לא מוגש, והשרת מחזיר במקומו את דף הבית (הנתיב שמגיש את index.html לכל כתובת).
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
  const result = await build({
    entryPoints: [file],
    bundle: true,
    format: "esm",
    platform: "node",
    write: false,
  });
  return import(
    `data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`
  );
}
const { projects } = await loadModule("client/src/lib/projects.ts");
const { testimonials } = await loadModule("client/src/lib/testimonials.ts");
const { blogPosts, blogSlugs } = await loadModule("client/src/lib/blog.ts");
const { getPageMeta } = await loadModule("client/src/lib/page-meta.ts");

// הנתיבים נבנים כאן מהנתונים עצמם, לפי הנתיבים שמוגדרים ב-client/src/App.tsx, ולא מ-page-meta.ts:
// כך הבדיקה תופסת גם עמוד ש-page-meta.ts שכח. עמודי ה-Ask AI לא במפה בכוונה, אבל יש להם head משלהם
const sitemapPaths = [
  "/",
  ...projects.map(p => `/project/${encodeURIComponent(p.slug)}`),
  ...testimonials.map(t => `/testimonial/${encodeURIComponent(t.slug)}`),
  ...blogSlugs.map(slug => `/blog/${encodeURIComponent(slug)}`),
];
const askAiPaths = projects
  .filter(p => p.askAi)
  .map(p => `/project/${encodeURIComponent(p.slug)}/ask-ai`);
const expected = new Set(sitemapPaths.map(p => siteUrl + p));

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
    if (serverExited)
      throw new Error(
        "שרת הייצור נסגר מיד בעלייה (האם רץ `pnpm build` לפני הבדיקה?)"
      );
    try {
      const res = await fetch(`${base}/`);
      if (res.ok) return;
    } catch {
      // השרת עוד לא מאזין — מנסים שוב
    }
    await new Promise(r => setTimeout(r, 250));
  }
  throw new Error(`שרת הייצור לא ענה תוך 20 שניות על ${base}`);
}

const decodeXml = text =>
  text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");

// אותן ישויות ש-escapeHtml ב-vite.config.ts כותב, ו-&amp; אחרון כדי לא לפענח פעמיים
const decodeHtml = text =>
  text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&");

/**
 * התגיות שב-head של עמוד: כותרות, ותגיות meta ו-link עם המאפיינים שלהן, מפוענחים.
 * סקריפטים מוסרים קודם, כדי שמחרוזת כמו "<meta" בתוך קוד לא תיספר כתגית.
 */
function parseHead(html) {
  const head = (html.match(/<head>([\s\S]*?)<\/head>/i)?.[1] ?? "").replace(
    /<script\b[^>]*>[\s\S]*?<\/script>/gi,
    ""
  );
  const attrs = tag =>
    Object.fromEntries(
      [...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(m => [
        m[1],
        decodeHtml(m[2]),
      ])
    );
  return {
    titles: [...head.matchAll(/<title>([^<]*)<\/title>/gi)].map(m =>
      decodeHtml(m[1])
    ),
    metas: [...head.matchAll(/<meta\b[^>]*>/gi)].map(m => attrs(m[0])),
    links: [...head.matchAll(/<link\b[^>]*>/gi)].map(m => attrs(m[0])),
  };
}

/** בודק שעמוד מוגש עם ה-head שלו. מחזיר את הכותרת, לבדיקה שכל הכותרות שונות */
async function checkPageHead(pagePath) {
  const url = siteUrl + pagePath;
  const res = await fetch(base + pagePath);
  const html = await res.text();
  if (res.status !== 200)
    failures.push(`${pagePath} החזיר סטטוס ${res.status}`);
  const { titles, metas, links } = parseHead(html);
  const meta = getPageMeta(pagePath);

  // כל תגית בדיוק פעם אחת: תגית כפולה (שארית של דף הבית לצד של העמוד) היא בדיוק הבאג שהבדיקה מחפשת.
  // כשהספירה שגויה כבר נרשם כשל, ולכן מוחזר MISSING וההשוואה מדלגת עליו. תגית שמופיעה פעם אחת בלי ערך
  // מחזירה undefined, וזה כן נכשל בהשוואה
  const one = (label, values) => {
    if (values.length !== 1) {
      failures.push(
        `${pagePath}: ${label} מופיע ${values.length} פעמים במקום פעם אחת`
      );
      return MISSING;
    }
    return values[0];
  };
  const property = name =>
    one(
      name,
      metas.filter(m => m.property === name).map(m => m.content)
    );
  const named = name =>
    one(
      name,
      metas.filter(m => m.name === name).map(m => m.content)
    );
  const expectEqual = (label, actual, wanted) => {
    if (actual !== MISSING && actual !== wanted) {
      failures.push(
        `${pagePath}: ${label} הוא ${JSON.stringify(actual)} ולא ${JSON.stringify(wanted)}`
      );
    }
  };

  const title = one("<title>", titles);
  expectEqual("<title>", title, meta.title);
  expectEqual("og:title", property("og:title"), meta.title);
  expectEqual("twitter:title", named("twitter:title"), meta.title);
  expectEqual("meta description", named("description"), meta.description);
  expectEqual("og:description", property("og:description"), meta.description);
  expectEqual(
    "twitter:description",
    named("twitter:description"),
    meta.description
  );
  // הערכים הבאים לא נלקחים מ-page-meta.ts אלא נגזרים כאן מהנתיב, כך שגם טעות שם נתפסת
  expectEqual("og:url", property("og:url"), url);
  expectEqual(
    "canonical",
    one(
      "link rel=canonical",
      links.filter(l => l.rel === "canonical").map(l => l.href)
    ),
    url
  );
  expectEqual(
    "og:type",
    property("og:type"),
    pagePath.startsWith("/blog/") ? "article" : "website"
  );
  // תמונת השיתוף: בעמוד פרויקט ובעמוד ה-Ask AI שלו, תמונת הכרטיס של הפרויקט; בכל השאר og-preview.png
  const projectImage = projectOfPath(pagePath)?.image;
  const wantedImage = !projectImage
    ? `${siteUrl}/og-preview.png`
    : /^https?:\/\//i.test(projectImage)
      ? projectImage
      : siteUrl + projectImage;
  const ogImage = property("og:image");
  expectEqual("og:image", ogImage, wantedImage);
  expectEqual("twitter:image", named("twitter:image"), wantedImage);
  const imageWidths = metas.filter(m => m.property === "og:image:width");
  const imageHeights = metas.filter(m => m.property === "og:image:height");
  if (projectImage) {
    // לתמונות הפרויקטים אין מידות ב-head (ראו renderPageHead ב-vite.config.ts), ולכן גם מידות שגויות לא ייכנסו בטעות
    if (imageWidths.length + imageHeights.length > 0)
      failures.push(
        `${pagePath}: יש og:image:width/height לתמונת הפרויקט, שהבנייה לא מודדת`
      );
  } else {
    expectEqual("og:image:width", property("og:image:width"), "1200");
    expectEqual("og:image:height", property("og:image:height"), "630");
  }
  // og:image:type חייב להתאים למה שהשרת באמת שולח עם התמונה, והתמונה חייבת להיות מוגשת
  const imageType = property("og:image:type");
  if (ogImage !== MISSING && ogImage !== undefined) {
    const served = await fetchImage(new URL(ogImage).pathname);
    if (served.status !== 200)
      failures.push(
        `${pagePath}: התמונה ${ogImage} החזירה סטטוס ${served.status}`
      );
    expectEqual("og:image:type", imageType, served.contentType);
  }

  if (pagePath.startsWith("/blog/") && typeof title === "string") {
    const post = blogPosts[decodeURIComponent(pagePath.slice("/blog/".length))];
    if (!title.includes(post.title))
      failures.push(
        `${pagePath}: הכותרת ${JSON.stringify(title)} לא כוללת את כותרת הפוסט`
      );
  }

  // אותו עמוד עם לוכסן בסוף מופנה בהפניה קבועה לכתובת הקנונית, עם מחרוזת השאילתה
  if (pagePath !== "/") {
    const redirect = await fetch(`${base}${pagePath}/?ref=check`, {
      redirect: "manual",
    });
    const location = redirect.headers.get("location");
    if (redirect.status !== 301 || location !== `${pagePath}?ref=check`)
      failures.push(
        `${pagePath}/ החזיר ${redirect.status} עם Location ${JSON.stringify(location)} במקום 301 אל ${pagePath}?ref=check`
      );
  }
  return typeof title === "string" ? title : undefined;
}

// הפרויקט שהעמוד שייך לו (עמוד הפרויקט או עמוד ה-Ask AI שלו), לפי הנתיבים שמוגדרים ב-App.tsx
function projectOfPath(pagePath) {
  const slug = pagePath.match(/^\/project\/([^/]+)(?:\/ask-ai)?$/)?.[1];
  return slug === undefined
    ? undefined
    : projects.find(p => p.slug === decodeURIComponent(slug));
}

// כל תמונה נשלפת פעם אחת: כמה עמודים חולקים אותה תמונה
const imageResponses = new Map();
function fetchImage(imagePath) {
  if (!imageResponses.has(imagePath)) {
    imageResponses.set(
      imagePath,
      fetch(base + imagePath).then(async r => {
        await r.arrayBuffer();
        return { status: r.status, contentType: r.headers.get("content-type") };
      })
    );
  }
  return imageResponses.get(imagePath);
}

const MISSING = Symbol("missing");

const failures = [];
let urlCount = 0;
let pageCount = 0;
try {
  await waitForServer();

  const sitemap = await fetch(`${base}/sitemap.xml`);
  const sitemapBody = await sitemap.text();
  const sitemapType = sitemap.headers.get("content-type") ?? "";
  if (sitemap.status !== 200)
    failures.push(`/sitemap.xml החזיר סטטוס ${sitemap.status}`);
  if (!sitemapType.includes("xml")) {
    failures.push(
      `/sitemap.xml מוגש כ-"${sitemapType}" ולא כ-XML: כנראה המפה לא נוצרה, והשרת החזיר את דף הבית`
    );
  } else {
    if (!sitemapBody.startsWith('<?xml version="1.0" encoding="UTF-8"?>'))
      failures.push("למפה חסרה הצהרת ה-XML בתחילתה");
    if (
      !sitemapBody.includes(
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
      )
    ) {
      failures.push("למפה חסר <urlset> עם ה-namespace של sitemaps.org");
    }
    const locs = [...sitemapBody.matchAll(/<loc>([^<]*)<\/loc>/g)].map(m =>
      decodeXml(m[1])
    );
    urlCount = (sitemapBody.match(/<url>/g) ?? []).length;
    if (urlCount !== locs.length)
      failures.push(
        `במפה ${urlCount} רשומות <url> אבל ${locs.length} רשומות <loc>`
      );
    const found = new Set(locs);
    for (const url of expected)
      if (!found.has(url)) failures.push(`חסר במפה: ${url}`);
    for (const url of found)
      if (!expected.has(url)) failures.push(`כתובת לא צפויה במפה: ${url}`);
    if (found.size !== locs.length) failures.push("יש במפה כתובות כפולות");
  }

  const robots = await fetch(`${base}/robots.txt`);
  const robotsBody = await robots.text();
  const robotsType = robots.headers.get("content-type") ?? "";
  if (robots.status !== 200)
    failures.push(`/robots.txt החזיר סטטוס ${robots.status}`);
  if (!robotsType.startsWith("text/plain")) {
    failures.push(
      `/robots.txt מוגש כ-"${robotsType}" ולא כטקסט: כנראה הקובץ לא נוצר, והשרת החזיר את דף הבית`
    );
  } else {
    const lines = robotsBody.split("\n");
    if (!lines.includes("User-agent: *"))
      failures.push("ב-robots.txt חסרה השורה User-agent: *");
    if (!lines.includes(`Sitemap: ${siteUrl}/sitemap.xml`)) {
      failures.push(`ב-robots.txt חסרה השורה Sitemap: ${siteUrl}/sitemap.xml`);
    }
  }

  // ה-head של כל עמוד, ושהכותרות באמת שונות זו מזו: אם כולן אותה כותרת, אף עמוד לא קיבל head משלו
  const titleOwners = new Map();
  for (const pagePath of [...sitemapPaths, ...askAiPaths]) {
    const title = await checkPageHead(pagePath);
    pageCount++;
    if (title === undefined) continue;
    if (titleOwners.has(title))
      failures.push(
        `לעמודים ${titleOwners.get(title)} ו-${pagePath} אותה כותרת: ${title}`
      );
    else titleOwners.set(title, pagePath);
  }
} catch (err) {
  failures.push(err.message);
} finally {
  server.kill();
}

if (failures.length > 0) {
  console.error("בדיקת ה-SEO נכשלה:");
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log(
  `בדיקת ה-SEO עברה: sitemap.xml ו-robots.txt תקינים (${urlCount} כתובות, כולן מ-${siteUrl}), ` +
    `ו-${pageCount} עמודים מוגשים כל אחד עם ה-head שלו.`
);
