/**
 * תוסף rehype שמסמן בלוק קוד של טקסט עברי, כדי שיוצג מימין לשמאל.
 *
 * בלוקי קוד מוצגים משמאל לימין (.prose pre ב-blog-styles.css), וזה נכון לקוד. בלוק שאין בו קוד
 * בכלל, אלא הסבר או רשימת שלבים בעברית, נקרא כך כמו משפט הפוך ומיושר לשמאל. התוסף מוסיף
 * לבלוק כזה את המחלקה rtl-code, ו-blog-styles.css הופך אותו למימין לשמאל.
 *
 * זה אותו כלל שמתואר בפוסט markdown-rtl-hebrew (סעיף 4), כמו שהוא ממומש ב-CodeKeeper:
 * 1. לבלוק אין שם של שפת תכנות: בלי שם בכלל, או אחד מ-PLAIN_LANGUAGE_NAMES (רגיש לאותיות גדולות).
 * 2. הטקסט ברובו עברית (isHebrewMajority ב-hebrew.ts).
 *
 * הבלוק מגיע מ-Streamdown: המחלקות של ה-code עוברות לשני ה-div שעוטפים את ה-pre של Shiki
 * (data-code-block), ולכן הסימון כאן מגיע ל-CSS.
 */

import { isHebrewMajority } from "./hebrew";

type HastNode = {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

// markdown ו-md לא ברשימה, בניגוד ל-CodeKeeper: שם קוד שבתוך בלוק עברי נעטף בנפרד משמאל לימין
// (wrapInnerFences), ובבלוג אין עטיפה כזו. בלוק Markdown שיש בו דוגמת קוד היה מתהפך כולו, כולל הדוגמה
const PLAIN_LANGUAGE_NAMES = new Set(["plaintext", "text", "nohighlight", "none", "txt"]);

function textOf(node: HastNode): string {
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(textOf).join("");
}

// ב-hast המחלקות הן מערך: ["language-text"]. בלוק בלי שם שפה הוא בלי className בכלל
function classesOf(node: HastNode): string[] {
  const cls = node.properties?.className;
  return Array.isArray(cls) ? cls.map(String) : typeof cls === "string" ? cls.split(/\s+/) : [];
}

function languageOf(code: HastNode): string | null {
  const lang = classesOf(code).find((c) => c.startsWith("language-"));
  return lang ? lang.slice("language-".length) : null;
}

export function rehypeRtlCodeBlocks() {
  return (tree: HastNode) => {
    const walk = (node: HastNode) => {
      if (node.type === "element" && node.tagName === "pre") {
        const code = node.children?.find((c) => c.type === "element" && c.tagName === "code");
        if (code) {
          const lang = languageOf(code);
          if ((lang === null || PLAIN_LANGUAGE_NAMES.has(lang)) && isHebrewMajority(textOf(code))) {
            code.properties = { ...code.properties, className: [...classesOf(code), "rtl-code"] };
          }
        }
        return;
      }
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}
