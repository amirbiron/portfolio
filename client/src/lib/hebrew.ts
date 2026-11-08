/**
 * האם טקסט הוא "ברובו עברית", לפי הכלל שמתואר בפוסט markdown-rtl-hebrew (סעיף 4) וממומש ב-CodeKeeper.
 * משמש גם לבלוק טקסט שלם (rehype-rtl-code-blocks.ts) וגם לקטע אחד בתוך שורת קוד (rtl-code-tokens.ts).
 *
 * נספרים כל התווים בטווח U+0590 עד U+05FF (אותיות, ניקוד, מקף עברי, גרש וגרשיים) ואותיות לטיניות.
 * ספרות, רווחים ופיסוק לא נספרים, כדי שלא ידללו את היחס. התנאי הוא "גדול מ-30%", ולא רוב:
 * טקסט שבו 31% מהתווים שנספרים עבריים נחשב עברי.
 */
export const HEBREW_THRESHOLD = 0.3;

export function isHebrewMajority(text: string): boolean {
  const cleaned = text.replace(/\s+/g, "");
  let hebrew = 0;
  let letters = 0;
  for (let i = 0; i < cleaned.length; i++) {
    const c = cleaned.charCodeAt(i);
    if (c >= 0x0590 && c <= 0x05ff) {
      hebrew++;
      letters++;
    } else if ((c >= 0x41 && c <= 0x5a) || (c >= 0x61 && c <= 0x7a)) {
      letters++;
    }
  }
  return letters > 0 && hebrew / letters > HEBREW_THRESHOLD;
}
