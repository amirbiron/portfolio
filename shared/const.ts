export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;

/**
 * הקובץ שממנו השרת (server/index.ts) מרכיב לכל עמוד HTML עם head משלו. הבנייה (vite.config.ts) כותבת אותו.
 * הוא יושב בתיקיית dist, ליד תיקיית public ולא בתוכה, כדי שלא יוגש בעצמו ככתובת באתר.
 */
export const PAGE_HTML_FILE = "page-html.json";

/** התוכן של PAGE_HTML_FILE. ה-HTML של עמוד הוא before + heads[path] + after */
export interface PageHtmlFile {
  /** index.html הבנוי, עד תגיות ה-head של העמוד */
  before: string;
  /** index.html הבנוי, מאחרי תגיות ה-head של העמוד */
  after: string;
  /** תגיות ה-head לפי נתיב העמוד, כמו "/blog/<slug>". דף הבית לא כאן: הוא מוגש מ-index.html עצמו */
  heads: Record<string, string>;
}
