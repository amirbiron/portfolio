/**
 * עברית בתוך בלוקי קוד: הערה או מחרוזת שרובה עברית מוצגת מימין לשמאל, בתוך שורת קוד שנשארת משמאל לימין.
 *
 * הבעיה: כל שורה בבלוק קוד היא פסקה משמאל לימין. הערה כמו "// הצורה המינימלית של צומת hast שהתוסף צריך"
 * מתפרקת לשני קטעים עבריים משני צדי המילה hast, והם מסודרים משמאל לימין, כלומר בסדר הקריאה ההפוך.
 * התיקון: הטקסט של ההערה נעטף ב-span עם dir="rtl", שהדפדפן מבודד מהשורה (unicode-bidi: isolate מגיליון
 * הסגנון שלו). ההזחה וסימני ההערה (// # -- /* * <!-- """ ''' בהתחלה, ו-* / --> """ ''' בסוף) נשארים מחוץ
 * לעטיפה: אחרת ההזחה עוברת לצד ימין וההערה נדחפת לקצה השמאלי, ו-<!-- ו---> מתהפכים ונראים שבורים.
 * נמדד על ששת הפוסטים בבלוג: לפני התיקון 10 מתוך 134 קטעים עם עברית נקראו כמו פסקה עברית, אחריו כולם,
 * הקצה השמאלי של אף שורה לא זז, ואף קטע קוד בלי עברית לא זז יותר מפיקסל.
 *
 * למה אחרי הרינדור ולא בזמן הצביעה: Streamdown 1.4.0 קורא ל-Shiki עם שפה וערכת צבעים בלבד, בלי transformers,
 * ואין לו הגדרה שמעבירה אותם (גם לא ב-1.6.11, ולא ב-@streamdown/code של גרסה 2, שמקבל רק themes).
 * לכן העטיפה רצה על ה-DOM, ו-MutationObserver מפעיל אותה שוב בכל פעם ש-Streamdown מכניס HTML חדש:
 * הצביעה של Shiki מגיעה אחרי הרינדור הראשון, ובעמוד Ask AI הודעות נוספות אחרי שהעמוד כבר עלה.
 * React לא דורס את העטיפה ברינדור מחדש: הוא מעדכן את dangerouslySetInnerHTML רק כשה-HTML עצמו משתנה,
 * ואז ה-observer עוטף מחדש.
 */
import { useEffect, type RefObject } from "react";
import { isHebrewMajority } from "./hebrew";

// הטוקנים של Shiki: כל שורה היא span.line, וכל קטע צבוע בתוכה הוא span עם טקסט בלבד
const TOKENS = "[data-code-block] pre .line > span";
const SPLIT = /^(\s*(?:\/\/+|#+|--|\/\*+|\*|<!--|"""|''')?\s*)([\s\S]*?)(\s*(?:\*\/|-->|"""|''')?\s*)$/;

export function isolateHebrewTokens(root: ParentNode) {
  root.querySelectorAll<HTMLElement>(TOKENS).forEach((token) => {
    // בלוק טקסט עברי כבר מוצג כולו מימין לשמאל (rehype-rtl-code-blocks.ts)
    if (token.closest(".rtl-code")) return;
    const node = token.firstChild;
    // רק טוקן שכולו טקסט אחד. טוקן שכבר נעטף מכיל אלמנט, ולכן הפונקציה בטוחה להרצה חוזרת
    if (token.childNodes.length !== 1 || !node || node.nodeType !== Node.TEXT_NODE) return;
    const text = node.textContent ?? "";
    if (!isHebrewMajority(text)) return;
    const match = SPLIT.exec(text);
    if (!match || !match[2]) return;
    const [, before, body, after] = match;
    const wrap = document.createElement("span");
    wrap.dir = "rtl";
    wrap.textContent = body;
    const parts: Node[] = [];
    if (before) parts.push(document.createTextNode(before));
    parts.push(wrap);
    if (after) parts.push(document.createTextNode(after));
    // הטקסט נשאר זהה תו בתו, ולכן העתקה ידנית מהבלוק מעתיקה בדיוק את המקור
    token.replaceChildren(...parts);
  });
}

/** מפעיל את isolateHebrewTokens על האלמנט שב-ref, ושוב בכל שינוי בתוכו. */
export function useRtlCodeTokens(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    isolateHebrewTokens(root);
    // השינויים של isolateHebrewTokens עצמה מפעילים את ה-observer פעם נוספת, וזו לא מוצאת מה לעטוף
    const observer = new MutationObserver(() => isolateHebrewTokens(root));
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [ref]);
}
