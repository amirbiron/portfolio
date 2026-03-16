## [2026-03-16] הוספת קובץ README.md

**קבצים שהשתנו:**
- `README.md` — (נוסף) קובץ README לפרויקט

**פירוט:**
נוסף קובץ README.md שמתאר את הפרויקט: סקירה כללית, Tech Stack, הוראות התקנה והרצה, סקריפטים זמינים, ומבנה הפרויקט.

---

## [2026-03-14] הוספת המלצה שנייה (לקוח עסקי — מערכת ניהול משלוחים)

**קבצים שהשתנו:**
- `client/src/lib/testimonials.ts` — (שונה) הוספת המלצה שנייה למערך
- `SKILL.md` — (שונה) הוספת תיעוד סקשן המלצות, עמוד פירוט המלצה, ועדכון routing

**פירוט:**

### המלצה חדשה (testimonials.ts)
נוספה המלצה שנייה למערך `testimonials`:
- **slug**: `delivery-system`
- **clientName**: `[לקוח עסקי] | מערכת ניהול משלוחים (WhatsApp & Telegram)`
- **shortQuote**: "אני ממליץ בחום על אמיר חיים. אדם מקצועי, אמין ונעים לעבוד איתו… הוא מביא איתו יכולת מצוינת לפתור בעיות בצורה יעילה וחכמה."
- **fileName**: `client_feedback_002.png`
- **screenshot**: `/testimonials/feedback-delivery-system.png`

**חשוב:** יש להעלות את צילום המסך של ההמלצה ל-`client/public/testimonials/feedback-delivery-system.png`

---

## [2026-03-14] עדכון כרטיס המלצה + תיקון באג RTL בשלוש נקודות + Escape ב-Lightbox

**קבצים שהשתנו:**
- `client/src/lib/testimonials.ts` — (שונה) עדכון clientName ו-role, הסרת fullQuote, תיקון שלוש נקודות
- `client/src/pages/Home.tsx` — (שונה) שינוי סימן — ל-> בפרטי לקוח, הסתרת role ריק
- `client/src/pages/TestimonialPage.tsx` — (שונה) הוספת Escape key ל-Lightbox, הסתרת role ריק

**פירוט:**

### עדכון פרטי ההמלצה (testimonials.ts)
- `clientName` שונה מ-"לקוחה — אתר סדר יום למשפחות" ל-"[מיזם חברתי] | אתר שגרה לזמני חירום"
- `role` רוקן (מחרוזת ריקה) — לא מוצג יותר
- שדה `fullQuote` הוסר מה-interface ומהנתונים (לא היה בשימוש באף קומפוננטה)
- שלוש נקודות `...` הוחלפו בתו ellipsis יחיד `…` (U+2026) כדי למנוע באג RTL שבו הנקודות זזות ונדבקות למילה הבאה

### עדכון כרטיס בדף הבית (Home.tsx)
- סימן `—` לפני שם הלקוח הוחלף ב-`>` (כסגנון טרמינל)
- שורת `role` מוסתרת אם ריקה (תנאי על `testimonial.role`)

### Escape key ב-Lightbox (TestimonialPage.tsx)
- נוסף `useEffect` עם `keydown` listener שסוגר את ה-Lightbox בלחיצה על Escape
- התנהגות זהה ל-Lightbox הקיים ב-`ProjectPage.tsx`
- שורת role מוסתרת אם ריקה

---

## [2026-03-14] הוספת סקשן המלצות (Testimonials) עם דף פירוט לצילום מסך

**קבצים שהשתנו:**
- `client/src/lib/testimonials.ts` — (נוסף) מודל נתונים להמלצות עם ההמלצה הראשונה
- `client/src/pages/TestimonialPage.tsx` — (נוסף) עמוד פירוט המלצה — מציג צילום מסך בסגנון טרמינל
- `client/src/pages/Home.tsx` — (שונה) הוספת סקשן המלצות בין פרויקטים לכישורים
- `client/src/App.tsx` — (שונה) הוספת route `/testimonial/:slug` עם lazy loading

**פירוט:**

### סקשן המלצות בדף הבית (Home.tsx)
- כותרת בסגנון טרמינל: `$ cat testimonials.log` עם אייקון `MessageSquareQuote`
- כותרת משנה: "מה הלקוחות אומרים"
- כרטיסים בעיצוב `terminal-window` עם:
  - שם קובץ ב-header (למשל `client_feedback_001.png`)
  - ציטוט קצר ועוצמתי בגרשיים מעוצבות בצבע accent
  - פרטי לקוח (שם + תפקיד)
  - כפתור בסגנון: `Open_Attachment.exe` שמנווט לדף הפירוט
- הסקשן ממוקם בין פרויקטים לכישורים, עם רקע `bg-card/50`

### עמוד פירוט המלצה (TestimonialPage.tsx)
- **לא מכיל כפילות של הטקסט!** במקום זה, מציג:
  - חלון טרמינל עם שם הקובץ ב-header
  - הודעות מערכת: `[System]: Fetching client_feedback_001.png... Success.` + `Rendering attachment... Done.`
  - צילום המסך המקורי של ההמלצה (קליקבילי — נפתח ב-Lightbox)
  - כיתוב מתחת: `[Source]: שם הלקוח — תפקיד`
- Lightbox עם AnimatePresence (כמו בגלריית פרויקטים)
- Lazy loaded עם Suspense

### מודל נתונים (testimonials.ts)
כל המלצה מכילה: `slug`, `clientName`, `role`, `shortQuote` (לכרטיס), `screenshot` (נתיב לתמונה), `fileName` (שם קובץ מוצג)

### הוספת המלצה חדשה
להוספת המלצה חדשה יש להוסיף אובייקט למערך `testimonials` ב-`testimonials.ts` ולהעלות את צילום המסך ל-`client/public/testimonials/`

**חשוב:** יש להעלות את צילום המסך של ההמלצה הראשונה ל-`client/public/testimonials/feedback-routine-app.png`

---

## [2026-03-14] תיקוני עיצוב בבלוגים, ניווט בין עמודים, ותיקון באגים ויזואליים

**קבצים שהשתנו:**
- `client/src/pages/BlogPost.tsx` — (שונה) תיקוני תוכן Markdown + הוספת footer עם ניווט
- `client/src/blog-styles.css` — (שונה) תיקון ניראות קוד, הוספת סגנון טבלאות RTL
- `client/src/pages/ProjectPage.tsx` — (שונה) שינוי "חזרה לפורטפוליו" לאנגלית + הוספת כפתור "פרויקט הבא"
- `client/src/pages/Home.tsx` — (שונה) תיקון שורה ריקה מעל terminal header בכרטיסי פרויקטים ובלוגים
- `SKILL.md` — (שונה) עדכון תיאור עמוד בלוג ועמוד פרויקט

**פירוט:**

### תיקוני עיצוב בבלוגים (BlogPost.tsx + blog-styles.css)
1. **כותרת כפולה** — הכותרת הופיעה פעמיים (ב-h1 של הקומפוננטה + כ-`# Title` ב-Markdown). הוסרה השורה `# Title` מתחילת התוכן בשני הפוסטים: "WhatsApp Bot" ו-"Telegram Bot Sync"
2. **פסקאות בפונט ירוק גדול** — טקסטים שהופיעו מיד אחרי בלוקי קוד (```) בלי שורה ריקה נפרסו כחלק מהכותרת/קוד. נוספו שורות ריקות אחרי כל ``` רלוונטי (8 מקומות בסה"כ)
3. **טקסט בבלוקי קוד כמעט בלתי נראה** — חוזקו סלקטורים ב-CSS עם `!important` כדי לדרוס סגנונות של Streamdown: `color: #e2e8f0 !important` על `pre code` וכל ה-spans שבתוכו
4. **טבלת סיכום לא מיושרת** — נוסף CSS לטבלאות: `text-align: right`, borders, רקע לכותרות, וצבעים מותאמים
5. **טקסט בתוך טבלה** — הפסקה "הגישה הזאת עובדת מצוין..." הופרדה מהטבלה ע"י הוספת שורה ריקה

### ניווט בתחתית בלוגים (BlogPost.tsx)
- נוסף footer בתחתית כל פוסט בלוג עם:
  - הצעות ל-2 הבלוגים האחרים (כרטיסי terminal-window קליקביליים)
  - כפתור "Back to Portfolio"

### שינויים בעמוד פרויקט (ProjectPage.tsx)
- טקסט "חזרה לפורטפוליו" שונה ל-"Back to Portfolio" (בשני המקומות — header ו-footer)
- נוסף כפתור "פרויקט הבא" בתחתית — מציג את הפרויקט הבא ברשימה (מעגלי)

### תיקון באג בכרטיסי פרויקטים ובלוגים (Home.tsx)
- כרטיסי Card של shadcn/ui כוללים `py-6 gap-6` ברירת מחדל, שיצר שורה ריקה מעל ה-terminal-header. נוסף `!py-0 !gap-0` לדרוס את ברירת המחדל

---

## [2026-03-14] הוספת קובץ SKILL.md — מדריך לבניית פורטפוליו בסגנון Terminal Aesthetic

**קבצים שהשתנו:**
- `SKILL.md` — (נוסף) קובץ Skill מפורט שמלמד Claude לבנות פורטפוליו דומה

**פירוט:**
נוצר קובץ `SKILL.md` שמכיל הנחיות מלאות ל-Claude לבניית פורטפוליו חדש באותו סגנון עיצוב — Terminal Aesthetic / Cyberpunk Retro-Futuristic. הקובץ כולל:

1. **Tech Stack** — רשימת כל הטכנולוגיות והפקג'ים הנדרשים (React 19, Tailwind 4, Framer Motion, wouter, shadcn/ui, Mermaid, Streamdown, Sonner)
2. **Design System** — פלטת צבעים מלאה (matrix green, cyan, neon pink), טיפוגרפיה (JetBrains Mono), CSS effects (scanlines, neon-glow, cursor-blink, neon-border)
3. **Terminal Window Component** — מבנה ה-CSS של חלון הטרמינל (header עם 3 dots, border, background)
4. **כל הסקשנים בפירוט** — Hero, About, Projects, Skills Matrix, Blog, Contact, Footer — כולל מבנה HTML/JSX, classes, אנימציות, ודאטה מודלים
5. **עמוד פרויקט מפורט** — גלריית צילומי מסך עם Lightbox, Features/Challenges, דיאגרמת Mermaid
6. **עמוד בלוג** — רינדור Markdown בסגנון טרמינל
7. **Responsive Design** — טבלת breakpoints ו-grid layouts
8. **Contact Form** — הנחיה שהמשתמש צריך לחבר בעצמו (EmailJS, Formspree, Telegram Bot API, או Custom API)
9. **הנחיות ליצירת תמונות** — פרומפטים מוכנים ל-Nano Banana בסגנון cyberpunk מותאם, כולל:
   - Hero background, Skills background, Profile image
   - תבנית פרומפט לכל סוג פרויקט (chatbot, data/scraping, dev tools, learning, builder)
   - הנחיה ל-Claude להציג בסוף הפלט "Step 2 Card" עם כל הפרומפטים הממוספרים

---

## [2026-03-14] הסרת כפתור Download CV והוספת Node.js לכישורי Backend

**קבצים שהשתנו:**
- `client/src/pages/Home.tsx` — (שונה) הסרת כפתור Download CV מטופס יצירת קשר, הוספת Node.js לרשימת כישורי Backend

**פירוט:**
1. הוסר כפתור "Download CV" מאזור טופס יצירת קשר (כולל ה-import של אייקון Download מ-lucide-react).
2. נוסף "Node.js" כפריט ראשון ברשימת הכישורים של קטגוריית Backend (לפני Flask, FastAPI וכו').

---

## [2026-03-14] הוספת תמונות כרטיס לפרויקטים AI Business Bot ו-FB Leads Scanner

**קבצים שהשתנו:**
- `client/src/lib/projects.ts` — (שונה) הוספת URL לשדה `image` בשני הפרויקטים

**פירוט:**
לשני הפרויקטים שהיו ללא תמונת כרטיס (שדה `image` ריק) נוספו תמונות מ-CloudFront:
- **FB Leads Scanner** — `https://d2xsxph8kpxj0f.cloudfront.net/.../fb-leads-scanner-....webp`
- **AI Business Bot** — `https://d2xsxph8kpxj0f.cloudfront.net/.../ai-business-bot-....webp`

התמונות מוצגות בכרטיסי הפרויקטים בדף הבית במקום ה-placeholder (אייקון Code2).

---

## [2026-03-14] שדרוג טופס יצירת קשר — שליחה דרך Telegram במקום mailto

**קבצים שהשתנו:**
- `server/index.ts` — (שונה) הוספת endpoint `POST /api/contact` שמפרקסי ל-Telegram Bot API
- `client/src/pages/Home.tsx` — (שונה) החלפת mailto ב-fetch לשרת + UI עם סטטוסים

**פירוט:**
טופס יצירת הקשר שונה מגישת mailto (שפותחת אפליקציית מייל) לשליחה ישירה דרך Telegram Bot API:

### שרת (server/index.ts)
- נוסף `express.json()` middleware לפרסור JSON
- נוסף endpoint `POST /api/contact` שמקבל `email` ו-`message`, ושולח הודעה מפורמטת ב-Markdown ל-Telegram דרך Bot API
- הטוקן וה-Chat ID נקראים ממשתני סביבה: `TELEGRAM_BOT_TOKEN` ו-`TELEGRAM_CHAT_ID`
- טיפול בשגיאות: 400 לחוסר שדות, 500 לחוסר קונפיגורציה, 502 לכשל בשליחה

### לקוח (Home.tsx)
- `handleContactSubmit` שונה מ-`mailto:` ל-`fetch("/api/contact", ...)` עם async/await
- נוסף state `contactStatus` עם 4 מצבים: `idle`, `sending`, `success`, `error`
- הכפתור משנה טקסט לפי הסטטוס: `> Send Message` → `> SENDING...` → `> SENT!`
- הכפתור מושבת בזמן שליחה (`disabled`)
- נוספו שורות סטטוס בסגנון טרמינל מתחת לכפתורים:
  - הצלחה (ירוק): `[System]: Transmission complete. Message delivered to secure channel.`
  - שגיאה (ורוד): `[System]: Transmission failed. Try again or use Telegram directly.`
- הסטטוס מתאפס אחרי 4 שניות
- אייקון הכפתור שונה מ-Mail ל-Send

### הגדרה נדרשת
יש להגדיר 2 משתני סביבה בשרת:
- `TELEGRAM_BOT_TOKEN` — טוקן של בוט טלגרם (מ-BotFather)
- `TELEGRAM_CHAT_ID` — מזהה הצ'אט שאליו ישלחו ההודעות

---

## [2026-03-14] הוספת תמונת פרופיל לסקשן אודות

**קבצים שהשתנו:**
- `client/src/pages/Home.tsx` — (שונה) הוספת תמונת פרופיל בסקשן `$ whoami --verbose`
- `client/public/developer_profile_sketch.png` — (נוסף) תמונת פרופיל סקיצה בעט כחול

**פירוט:**
נוספה תמונת פרופיל בתוך חלון הטרמינל של סקשן האודות, מעל הטקסט. התמונה מוצגת עם:
- מסגרת דקה בצבע primary עם glow effect (box-shadow)
- גודל 48x48 (w-48 h-48) עם object-cover ופינות מעוגלות
- כיתוב בסגנון טרמינל מתחת: `[System]: Rendering developer_profile_sketch.png... Success.`
- התמונה ממורכזת (flex items-center) עם dir="ltr" כדי שהכיתוב יישאר LTR

**חשוב:** יש להעלות את קובץ התמונה ל-`client/public/developer_profile_sketch.png`

---

## [2026-03-14] החלפת פוסט בלוג — סנכרון Telegram Bot ו-Web App במקום Broadcast

**קבצים שהשתנו:**
- `client/src/pages/BlogPost.tsx` — (שונה) הוחלף הפוסט `telegram-broadcast-rate-limiting` בפוסט חדש `telegram-bot-webapp-sync`
- `client/src/pages/Home.tsx` — (שונה) עדכון כותרת, תקציר ו-slug של כרטיס הבלוג

**פירוט:**
הפוסט הישן "איך לשלוח הודעה לאלפי משתמשים בלי שטלגרם יחסום אתכם" (Rate Limiting ו-Broadcast) הוחלף בפוסט חדש לגמרי:

- **כותרת חדשה:** "סנכרון בזמן אמת בין Telegram Bot ל-Web App — ואיך מאמתים משתמשים בצורה מאובטחת"
- **Slug חדש:** `telegram-bot-webapp-sync` (במקום `telegram-broadcast-rate-limiting`)
- **תוכן** — שני חלקים עיקריים:
  1. **סנכרון** — Single Source of Truth עם MongoDB משותף, שכבת Repository אחידה, cache invalidation
  2. **אימות** — Telegram Login Widget עם אימות HMAC-SHA256, וטוקן חד-פעמי מהבוט עם תפוגה של 5 דקות
- כולל דיאגרמות ארכיטקטורה, דוגמאות קוד Python (Flask + MongoDB), וטיפים למימוש

---

## [2026-03-14] תיקוני עיצוב ו-UX בעמודי בלוג

**קבצים שהשתנו:**
- `client/src/pages/BlogPost.tsx` — (שונה) יישור RTL לכותרות, scroll to top, שינוי פורמט תאריכים
- `client/src/pages/Home.tsx` — (שונה) שינוי פורמט תאריכים בכרטיסי בלוג
- `client/src/blog-styles.css` — (שונה) הקטנת גודל פונט לפסקאות, שיפור ניראות בלוקי קוד

**פירוט:**
1. **תאריך פוסט WhatsApp** — שונה מ-2026-01-20 ל-14-03-2026
2. **פורמט תאריכים** — כל התאריכים בבלוגים שונו מ-YYYY-MM-DD ל-DD-MM-YYYY (בשני הקבצים BlogPost.tsx ו-Home.tsx)
3. **יישור כותרות RTL** — הכותרת הראשית של כל פוסט בלוג (h1) מיושרת עכשיו לימין עם `dir="rtl"` על ה-wrapper
4. **Scroll to top** — נוסף `useEffect` עם `window.scrollTo(0, 0)` בטעינת עמוד בלוג, כדי שהדף יפתח מלמעלה
5. **הקטנת פונט** — גודל הפונט של פסקאות ורשימות בבלוג הוקטן ל-`0.925rem`
6. **הסרת סקשן** — הוסר הסקשן "למה בוט WhatsApp?" מתחילת הפוסט (מובן מאליו)
7. **ניראות בלוקי קוד** — בלוקי קוד ללא שפה (דיאגרמות, מבנה פרויקט) שינו צבע מ-`var(--foreground)` ל-`#e2e8f0` כדי להיות קריאים יותר

---

## [2026-03-14] שכתוב מלא של פוסט הבלוג על בוט WhatsApp

**קבצים שהשתנו:**
- `client/src/pages/BlogPost.tsx` — (שונה) החלפת תוכן הפוסט `whatsapp-bot-python-guide` + עדכון כותרת
- `client/src/pages/Home.tsx` — (שונה) עדכון כותרת ותקציר של כרטיס הבלוג

**פירוט:**
הפוסט הקודם היה מדריך בסיסי לבניית בוט WhatsApp עם PyWa. הוחלף בפוסט מעמיק שמכסה ארכיטקטורת פרודקשן מלאה:

- **כותרת חדשה:** "איך לבנות בוט WhatsApp שעובד כמו מוצר אמיתי"
- **תוכן חדש לגמרי** — 10 פרקים שמכסים: Webhook Handler עם idempotency, State Machine לניהול שיחות, Provider Pattern לשליחת הודעות, Transactional Outbox, Row-Level Locking, אבטחה (ולידציה, PII masking, rate limiting), Middleware Stack, טיפול בכפתורים ופורמטים, ניתוב לפי תפקידים, ובדיקת None
- **דוגמאות קוד** — Python + FastAPI עם דפוסים כמו Circuit Breaker, exponential backoff, guard functions
- **תקציר בדף הבית** עודכן בהתאם

---

## [2026-03-14] עדכון תוכן פרויקטים — CodeKeeper, MarkdownBot, תיקון תמונות

**קבצים שהשתנו:**
- `client/src/lib/projects.ts` — (שונה) עדכון תיאורים, פיצ'רים, צילומי מסך ומספר שיעורים

**פירוט:**

### CodeKeeper
- **תיאור מורחב** — עודכן הניסוח: שם בעברית (קודלי), הוספת יכולת יצירת ריפו מ-ZIP, הסרת "ניהול קבצים גדולים" ו"מערכת Bookmarks"
- **רשימת פיצ'רים** — הוחלפה לגמרי ברשימה חדשה: תצוגת מארקדאון, תוכן עניינים צף, פתקים דביקים עם תזכורות פוש, מערכת סימניות, חיפוש סמנטי AI, דשבורד היסטוריה, בונה ערכות נושא, "האוספים שלי", ייצוא ל-Gist/Pastebin, גיבוי ל-Google Drive
- **צילומי מסך** — 2 תמונות Chrome (203519, 203916) שהיו בטעות ב-FB Leads Scanner הועברו ל-CodeKeeper (סה"כ 4 צילומים)

### FB Leads Scanner
- **צילומי מסך** — הוסרו 2 תמונות שלא שייכות לפרויקט (נשארו 2 צילומים)

### MarkdownBot
- **מספר שיעורים** — תוקן מ-"15+" ל-"43" בתיאור המורחב, ברשימת הפיצ'רים, ובדיאגרמת Mermaid

---

# Changelog — תיעוד שינויים

> קובץ זה מתעד שינויים **תוכניים** בפרויקט (תוכן, עיצוב, פיצ'רים) שבוצעו במהלך תקופת הפיתוח ב-Render.
> המטרה: לאפשר ל-Manus ליישם את כל השינויים האלה על הפרויקט המקורי בסיום התקופה.
> שינויי תשתית (Render, dev tooling) לא מתועדים כאן כי הם לא רלוונטיים ל-Manus.

---

## [2026-03-13] הוספת עמודי פרויקט מפורטים עם צילומי מסך ודיאגרמות ארכיטקטורה

**קבצים שהשתנו:**
- `client/src/pages/ProjectPage.tsx` — (נוסף) עמוד פרויקט מפורט חדש
- `client/src/App.tsx` — (שונה) הוספת route `/project/:slug`
- `client/src/pages/Home.tsx` — (שונה) הוספת slug לפרויקטים + כפתור Details
- `client/public/projects/` — (נוסף) 14 צילומי מסך של הפרויקטים
- `package.json` — (שונה) הוספת תלות `mermaid` לרינדור דיאגרמות

**פירוט:**

### עמוד פרויקט חדש (`ProjectPage.tsx`)
כל פרויקט מקבל עמוד מפורט ב-`/project/:slug` עם הסקשנים הבאים:
1. **Header** — כפתור חזרה + כפתורי Demo/Code
2. **Hero** — כותרת, תת-כותרת, תיאור מורחב, וטאגי טכנולוגיה
3. **צילומי מסך** — גלריית תמונות עם Lightbox (לחיצה מגדילה, ניווט בחצים/מקלדת)
4. **פיצ'רים ואתגרים** — שני terminal-windows זה לצד זה
5. **דיאגרמת ארכיטקטורה** — רינדור Mermaid בזמן אמת עם ערכת נושא כהה מותאמת
6. **Footer CTA** — כפתורי Demo/Code + חזרה

### שינויים בדף הבית
- כפתור "Code" בכרטיסי פרויקטים הוחלף בכפתור "Details" שמנווט לעמוד הפרויקט
- נוסף שדה `slug` לכל פרויקט

### מיפוי צילומי מסך לפרויקטים
- **CodeKeeper**: 2 צילומים (בוט טלגרם + תפריט GitHub)
- **ModularBot**: 2 צילומים (מסך פתיחה + תהליך יצירת בוט)
- **MarkdownBot**: 4 צילומים (שיעור + אימון + אפליקציית ווב × 2)
- **FB Leads Scanner**: 4 צילומים (דשבורד + תפריט + AI prompt + עיצוב)
- **AI Business Bot**: 2 צילומים (שיחת טלגרם + פאנל ניהול)

### דיאגרמות Mermaid
כל פרויקט מכיל דיאגרמת ארכיטקטורה מפושטת (מבוססת על תרשימים מלאים שסופקו). הרינדור נעשה client-side עם ספריית `mermaid` בערכת נושא כהה מותאמת לאסתטיקה של האתר.

---

## [2026-03-13] יישור RTL בסקשן Hero

**קבצים שהשתנו:**
- `client/src/pages/Home.tsx` — (שונה) שינוי כיוון הטקסט בחלון הטרמינל של ה-Hero ל-RTL

**פירוט:**
ה-div הפנימי של חלון הטרמינל ב-Hero (`~/portfolio/home`) היה מוגדר `text-left`, מה שגרם לטקסט העברי להיות מיושר לשמאל. שונה ל-`dir="rtl"` כדי שהתיאור בעברית יהיה מיושר לימין. אלמנטים באנגלית (פקודת `$ whoami`, טאגי טכנולוגיה, כפתורים) עוטפו ב-`dir="ltr"` כדי לשמור על הכיוון הנכון שלהם.

---

## [2026-03-13] יישור RTL לטקסטים בעברית + תרגום כותרות משנה

**קבצים שהשתנו:**
- `client/src/pages/Home.tsx` — (שונה) הוספת `dir="rtl"` לאלמנטים עם טקסט עברי + תרגום כותרות משנה + תיקון גובה כרטיסים

**פירוט:**
כל הטקסטים בעברית באתר היו מיושרים לשמאל (ברירת מחדל LTR). נוסף `dir="rtl"` לאלמנטים הבאים:
- פסקת תיאור ב-Hero ("מפתח בוטים ופתרונות אוטומציה חכמה")
- תוכן סקשן אודות (כל שלוש הפסקאות)
- תיאור כל פרויקט בכרטיסים
- תוכן כרטיסי בלוג (כותרת + תקציר, עם `dir="ltr"` על התאריך)
- כותרות משנה של כל הסקשנים

בנוסף, כותרות המשנה (subtitles) תורגמו לעברית:
- Projects: "פרויקטים נבחרים שמציגים מומחיות טכנית ופתרון בעיות"
- Skills: "שליטה טכנית לאורך כל מחסנית הפיתוח"
- Blog: "מאמרים טכניים ותובנות מעולם הפיתוח"
- Contact: "בואו נשתף פעולה על הפרויקט הבא שלכם"

תיקון נוסף: הוספת `h-full` לכרטיסי בלוג ולכרטיסי כישורים כדי שימלאו את גובה שורת ה-grid בצורה אחידה.

---

## [2026-03-13] הוספת סקשן אודות + אנימציות כניסה עם Framer Motion

**קבצים שהשתנו:**
- `client/src/pages/Home.tsx` — (שונה) הוספת סקשן אודות חדש + עטיפת כל הסקשנים באנימציות כניסה

**פירוט:**

### סקשן אודות
נוסף סקשן "אודות" חדש (`$ whoami --verbose`) בין ה-Hero לפרויקטים, בסגנון טרמינל עם `~/about.md` בכותרת החלון. מכיל 3 פסקאות קצרות:
1. (ירוק) סיפור התחלה — "התחלתי מבוטים לטלגרם, למדתי לבד, בניתי 60+ בוטים"
2. (ציאן) מה מניע אותי — "אוהב לראות תוצאות סופיות מרשימות ולקוחות מרוצים"
3. (ורוד) התמחות — "Python, בוטים, אוטומציה מקצה לקצה"

כל פסקה מתחילה ב-`>` בצבע שונה (primary/accent/destructive).

### אנימציות כניסה (Framer Motion)
נוספה קומפוננטת `FadeInSection` שמבצעת אנימציית fade-in + slide-up כשהאלמנט נכנס לתצוגה בגלילה. משתמשת ב-`whileInView` עם `once: true` כדי שהאנימציה תרוץ פעם אחת בלבד.

סקשנים שקיבלו אנימציה:
- **Hero** — אנימציית scale-in עדינה (0.95→1) בטעינת הדף
- **אודות** — fade-in לכותרת ולתוכן (עם delay קטן)
- **פרויקטים** — fade-in לכותרת + כל כרטיס עם delay מדורג (0.1s לכל כרטיס)
- **כישורים** — fade-in לכותרת + כל קטגוריה עם delay מדורג
- **בלוג** — fade-in לכותרת + כל פוסט עם delay מדורג
- **יצירת קשר** — fade-in לכותרת ולטופס

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
