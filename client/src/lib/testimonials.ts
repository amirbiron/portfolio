/**
 * מידע על המלצות — מקור יחיד לדף הבית ולעמודי ההמלצות
 */

export interface TestimonialData {
  slug: string;
  /** שם הלקוח */
  clientName: string;
  /** תפקיד או תיאור */
  role: string;
  /** ציטוט קצר לכרטיס בדף הבית */
  shortQuote: string;
  /** נתיב לצילום מסך של ההמלצה המקורית */
  screenshot: string;
  /** שם הקובץ המוצג בטרמינל */
  fileName: string;
}

export const testimonials: TestimonialData[] = [
  {
    slug: "routine-app",
    clientName: "[מיזם חברתי] | אתר שגרה לזמני חירום",
    role: "",
    shortQuote:
      "אמיר לקח את הרעיון שלי והפך אותו לאתר שעונה בדיוק על מה שדמיינתי\u2026 העבודה הייתה מהירה, נעימה ומקצועית. ממליצה בחום!",
    screenshot: "/testimonials/feedback-routine-app.png",
    fileName: "client_feedback_001.png",
  },
  {
    slug: "delivery-system",
    clientName: "[לקוח עסקי] | מערכת ניהול משלוחים (WhatsApp & Telegram)",
    role: "",
    shortQuote:
      "אני ממליץ בחום על אמיר חיים. אדם מקצועי, אמין ונעים לעבוד איתו\u2026 הוא מביא איתו יכולת מצוינת לפתור בעיות בצורה יעילה וחכמה.",
    screenshot: "/testimonials/feedback-delivery-system.png",
    fileName: "client_feedback_002.png",
  },
  {
    slug: "werai",
    clientName: "WeRAI | בינה עסקית עם תוצאות אמיתיות לעסקים קטנים",
    role: "מתאם לקוחות",
    shortQuote:
      "מתוך ניסיון אמיתי בעבודה משותפת על פרויקט ללקוח עסקי. אמיר יודע להקשיב, להבין בדיוק מה צריך, ולבצע מהר\u2026 והכי חשוב בעיניי — יש לו הבנה של צד המשתמש, ורואים את זה בתוצאה.",
    screenshot: "/testimonials/feedback-werai.png",
    fileName: "client_feedback_003.png",
  },
];
