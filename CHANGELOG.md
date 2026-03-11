# Changelog — תיעוד שינויים

> קובץ זה מתעד שינויים **תוכניים** בפרויקט (תוכן, עיצוב, פיצ'רים) שבוצעו במהלך תקופת הפיתוח ב-Render.
> המטרה: לאפשר ל-Manus ליישם את כל השינויים האלה על הפרויקט המקורי בסיום התקופה.
> שינויי תשתית (Render, dev tooling) לא מתועדים כאן כי הם לא רלוונטיים ל-Manus.

---

## [2026-03-11] הוספת 2 פרויקטים חדשים לפורטפוליו

**קבצים שהשתנו:**
- `client/src/pages/Home.tsx` — (שונה) הוספת פרויקטים חדשים + תמיכה בטקסט כפתור מותאם + placeholder לתמונה חסרה

**פירוט:**
נוספו 2 פרויקטים חדשים למערך הפרויקטים ב-Home.tsx:

1. **FB Leads Scanner** — בוט סריקת קבוצות פייסבוק ללידים + פאנל ווב. טכנולוגיות: Python, HTML, CSS, Automation. כפתור ראשי: "Landing Page" (במקום "Demo") עם קישור ל-https://amirbiron.github.io/Landing_FB_Lids/

2. **AI Business Bot** — בוט AI שעונה ללקוחות 24/7 ומציע תורים + פאנל ווב. טכנולוגיות: Python, HTML, CSS, Automation. כפתור Demo עם קישור ל-https://t.me/ai_business2U_bot. כפתור שני: "Landing Page" עם קישור ל-https://amirbiron.github.io/landing-page/

שינויים נוספים:
- נוסף שדה `demoLabel` אופציונלי לפרויקטים — אם קיים, מחליף את הטקסט "Demo" בכפתור
- נוסף שדה `repoLabel` אופציונלי לפרויקטים — אם קיים, מחליף את הטקסט "Code" ואת אייקון GitHub באייקון ExternalLink
- נוסף placeholder (אייקון Code2) לפרויקטים בלי תמונה במקום תמונה שבורה
