/**
 * תוסף rehype שמוסיף dir="auto" לקוד בתוך שורה ולתאי טבלה.
 *
 * הבלוג כתוב מימין לשמאל (.prose { direction: rtl }), וקוד בתוך שורה יורש את הכיוון הזה.
 * אלגוריתם הכיווניות של הדפדפן מסדר אותו לפי העברית שמסביב, ולכן סימנים בקצה הקוד
 * נצמדים לצד הלא נכון: foo() מוצג ()foo, ו---flag מוצג flag--.
 * עם dir="auto" הדפדפן קובע את הכיוון של כל קטע לפי האות החזקה הראשונה שבו,
 * ומבודד אותו מהמשפט שסביבו (unicode-bidi: isolate מגיליון הסגנון של הדפדפן).
 * בתאי טבלה אותו מנגנון: כל תא מקבל כיוון לפי התוכן שלו, ו-text-align: start
 * ב-blog-styles.css מיישר אותו לפי הכיוון הזה. מקור: https://html.spec.whatwg.org/multipage/dom.html#the-dir-attribute
 *
 * כדי שזה יעבוד, אסור לכתוב direction ב-CSS על אותם אלמנטים: כלל של האתר גובר על dir.
 * הקובץ לא מייבא כלום, כדי לא להוסיף תלות ב-hast או ב-unist-util-visit.
 */

// הצורה המינימלית של צומת hast שהתוסף צריך
type HastNode = {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

export function rehypeDirAuto() {
  return (tree: HastNode) => {
    const walk = (node: HastNode, parent: HastNode | null) => {
      if (node.type === "element") {
        // בלוק קוד הוא pre > code, וקוד בתוך שורה הוא code בלי pre מעליו
        const isInlineCode = node.tagName === "code" && parent?.tagName !== "pre";
        if (isInlineCode || node.tagName === "th" || node.tagName === "td") {
          node.properties = { ...node.properties, dir: "auto" };
        }
      }
      node.children?.forEach((child) => walk(child, node));
    };
    walk(tree, null);
  };
}
