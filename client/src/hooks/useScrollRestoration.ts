/**
 * שמירה ושחזור של מיקום הגלילה בעמוד הראשי
 * מאפשר ל-"Back to Portfolio" לחזור למיקום האחרון במקום לראש הדף
 */

import { useEffect } from "react";

const STORAGE_KEY = "home:scrollY";

export function useHomeScrollRestoration() {
  useEffect(() => {
    // שחזור מיקום הגלילה בכניסה לעמוד — אחרי שה-DOM נטען כדי שהגובה יהיה נכון
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      const y = parseInt(saved, 10);
      if (!Number.isNaN(y) && y > 0) {
        requestAnimationFrame(() => window.scrollTo(0, y));
      }
    }

    // שמירת מיקום הגלילה ברקע (throttled) + לפני יציאה מהעמוד
    let ticking = false;
    const save = () => {
      sessionStorage.setItem(STORAGE_KEY, String(window.scrollY));
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.setTimeout(() => {
        save();
        ticking = false;
      }, 150);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      save();
    };
  }, []);
}
