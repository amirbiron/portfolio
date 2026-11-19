/**
 * הכותרת והתיאור של כל עמוד באתר — מקור יחיד לכל מי שצריך אותם:
 * 1. vite.config.ts: תגיות ה-head ב-HTML הראשוני של כל עמוד (כותרת, תיאור, og:url, canonical).
 *    את ה-HTML הזה קוראים גוגל, פייסבוק, טלגרם ווטסאפ, שלא מריצים את ה-JavaScript של האתר.
 * 2. App.tsx: כותרת הלשונית בניווט בתוך האתר, שלא טוען את העמוד מחדש.
 * 3. scripts/check-seo.mjs: הבדיקה שהשרת מגיש לכל עמוד את ה-head שלו.
 *
 * הקובץ נטען גם מתוך vite.config.ts, ולכן הוא מייבא רק את קבצי הנתונים, בנתיב יחסי ולא דרך הקיצור @/.
 * עמוד חדש (פרויקט, המלצה או פוסט) נכנס לכאן לבד, מתוך קובץ הנתונים שלו.
 */
import { blogPosts, blogSlugs } from "./blog";
import { projects } from "./projects";
import { testimonials } from "./testimonials";

export const SITE_NAME = "אמיר בירון";

export interface PageMeta {
  /**
   * הנתיב של העמוד, אותו נתיב שבמפת האתר. ה-slug-ים בנתונים בטוחים לכתובת (אותיות לטיניות, ספרות ומקפים),
   * כמו שכל הקישורים באתר כבר מניחים, ולכן אותו נתיב משמש גם את השרת וגם את הניווט בדפדפן.
   */
  path: string;
  /** תוכן תגית ה-title, וגם og:title */
  title: string;
  /** תיאור של משפט או שניים, ל-meta description ול-og:description */
  description: string;
  /** og:type: "article" לפוסט בבלוג, "website" לכל השאר. מקור: https://ogp.me/#types */
  type: "website" | "article";
  /** האם העמוד נכנס למפת האתר. עמודי ה-Ask AI בחוץ בכוונה: הם חלון צ'אט, בלי תוכן משלהם לחיפוש */
  inSitemap: boolean;
  /**
   * תמונת השיתוף של העמוד (og:image), כמו שהיא בנתונים: נתיב מתוך client/public או כתובת מלאה.
   * בלי השדה העמוד מקבל את תמונת השיתוף של האתר (ראו SHARE_IMAGE ב-vite.config.ts).
   */
  image?: string;
}

/** כותרת של עמוד פנימי: קודם העמוד, ואחריו השם. כך הכותרת נשארת מזוהה גם כשהלשונית צרה וחותכת את הסוף */
const withSiteName = (title: string) => `${title} | ${SITE_NAME}`;

const HOME: PageMeta = {
  path: "/",
  // בדף הבית השם קודם, כמו בכותרת שהייתה לו עד עכשיו
  title: `${SITE_NAME} | Automation Developer`,
  description:
    "מפתח אוטומציות, בוטים ופתרונות חכמים. מתמחה ב-Python, Telegram Bot API, WhatsApp API ואינטגרציות AI.",
  type: "website",
  inSitemap: true,
};

/** כל העמודים באתר, לפי הנתיבים שמוגדרים ב-App.tsx. דף הבית ראשון */
export const pages: PageMeta[] = [
  HOME,
  ...projects.flatMap((project): PageMeta[] => {
    // תמונת הכרטיס של הפרויקט היא גם תמונת השיתוף שלו, ושל עמוד ה-Ask AI שלו. כרטיס בלי תמונה מקבל את של האתר
    const image = project.image || undefined;
    const projectPage: PageMeta = {
      path: `/project/${encodeURIComponent(project.slug)}`,
      title: withSiteName(project.title),
      description: project.description,
      type: "website",
      inSitemap: true,
      image,
    };
    if (!project.askAi) return [projectPage];
    // הכותרת כמו הכותרת שבראש עמוד הצ'אט, והתיאור הוא משפט הפתיחה של הסוכן באותו עמוד
    const { before, highlight, after } = project.askAi.intro;
    return [
      projectPage,
      {
        path: `${projectPage.path}/ask-ai`,
        title: withSiteName(`AI Agent — ${project.title}`),
        description: `${before} ${highlight} ${after}`,
        type: "website",
        inSitemap: false,
        image,
      },
    ];
  }),
  ...testimonials.map(
    (testimonial): PageMeta => ({
      path: `/testimonial/${encodeURIComponent(testimonial.slug)}`,
      title: withSiteName(`המלצה: ${testimonial.clientName}`),
      description: testimonial.shortQuote,
      type: "website",
      inSitemap: true,
    })
  ),
  ...blogSlugs.map(
    (slug): PageMeta => ({
      path: `/blog/${encodeURIComponent(slug)}`,
      title: withSiteName(blogPosts[slug].title),
      description: blogPosts[slug].excerpt,
      type: "article",
      inSitemap: true,
    })
  ),
];

const pagesByPath = new Map(pages.map(page => [page.path, page]));

/**
 * המטא של העמוד בנתיב הזה. נתיב שאינו עמוד מוכר (כתובת שגויה, slug שלא קיים) מקבל את של דף הבית,
 * כמו שקיבל עד היום: השרת מגיש לו את index.html כמו שהוא.
 */
export function getPageMeta(path: string): PageMeta {
  return pagesByPath.get(path) ?? HOME;
}
