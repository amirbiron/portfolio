# Changelog — תיעוד שינויים

> קובץ זה מתעד את כל השינויים שבוצעו בפרויקט מאז שהועבר מ-Manus ל-Render.
> המטרה: לאפשר ל-Manus ליישם את כל השינויים האלה בחזרה על הפרויקט המקורי בסיום תקופת הפיתוח.

---

## [2026-03-11] מעבר מ-Manus ל-Render — הסרת קוד Manus והוספת הגדרות Render

**קבצים שהשתנו:**
- `render.yaml` — (נוסף) הגדרת web service ל-Render: Node runtime, build command `pnpm install && pnpm build`, start command `pnpm start`, env vars: `NODE_ENV=production`, `PORT=3000`
- `CLAUDE.md` — (נוסף) תיאור ארכיטקטורה והנחיות לתיעוד שינויים
- `vite.config.ts` — (שונה) הוסרו: `vite-plugin-manus-runtime`, `vitePluginManusDebugCollector` (פלאגין שלם של ~100 שורות), `jsxLocPlugin`, ורשימת `allowedHosts` של דומיינים של Manus. נשארו רק: `react()`, `tailwindcss()`
- `client/src/const.ts` — (שונה) הוסר קוד OAuth: פונקציית `getLoginUrl()` שהשתמשה ב-`VITE_OAUTH_PORTAL_URL` ו-`VITE_APP_ID`. נשאר רק re-export של `COOKIE_NAME` ו-`ONE_YEAR_MS`
- `client/src/components/ManusDialog.tsx` — (נמחק) קומפוננטת דיאלוג "Login with Manus" (~85 שורות)
- `client/public/__manus__/debug-collector.js` — (נמחק) סקריפט debug collector של Manus (~820 שורות) שיירט console, fetch, XHR ו-UI events
- `client/src/pages/Home.tsx` — (שונה) הוחלפו 5 URL-ים של תמונות מ-`manuscdn.com` (CDN פרטי של Manus) במחרוזות ריקות. הוספה תצוגת placeholder icon (`Code2`) כש-image ריק. הוסרו inline styles של `backgroundImage` מ-Hero Section ומ-Skills Section
- `client/index.html` — (שונה) הוסר תג `<script>` של analytics (Umami) עם env vars שלא הוגדרו (`VITE_ANALYTICS_ENDPOINT`, `VITE_ANALYTICS_WEBSITE_ID`)
- `package.json` — (שונה) הוסרו תלויות: `vite-plugin-manus-runtime`, `@builder.io/vite-plugin-jsx-loc`
- `pnpm-lock.yaml` — (שונה) עודכן אוטומטית בעקבות הסרת תלויות
- `.gitignore` — (שונה) `.webdev/` שונה ל-`.manus-logs/`

**פירוט:**
הפרויקט נבנה ע"י Manus והכיל קוד ספציפי לפלטפורמה שלו — OAuth דרך Manus, debug collector שמדווח ל-`/__manus__/logs`, פלאגין Vite ייעודי, ותמונות מאוחסנות ב-CDN פרטי של Manus. כל אלה הוסרו כי הם לא עובדים מחוץ לסביבת Manus. הפרויקט הוא portfolio סטטי ללא DB וללא auth, כך שלא היה צורך בהחלפת מערכת הזדהות. ליישום מחדש על Manus: פשוט להחזיר את כל הקבצים שנמחקו, להחזיר את הפלאגינים ל-vite.config.ts, ולהחזיר את ה-URL-ים של התמונות.
