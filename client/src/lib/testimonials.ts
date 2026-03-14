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
    clientName: "לקוחה — אתר סדר יום למשפחות",
    role: "בעלת פרויקט",
    shortQuote:
      "אמיר לקח את הרעיון שלי והפך אותו לאתר שעונה בדיוק על מה שדמיינתי... העבודה הייתה מהירה, נעימה ומקצועית. ממליצה בחום!",
    screenshot: "/testimonials/feedback-routine-app.png",
    fileName: "client_feedback_001.png",
  },
];
