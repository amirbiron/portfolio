/**
 * שמירה ושחזור של מיקום הגלילה בעמוד הראשי
 * מאפשר ל-"Back to Portfolio" לחזור למיקום האחרון במקום לראש הדף
 */

import { useEffect } from "react";

const STORAGE_KEY = "home:scrollY";

export function useHomeScrollRestoration() {
  useEffect(() => {
    // שחזור מיקום הגלילה בכניסה לעמוד — אחרי שה-DOM נטען כדי שהגובה יהיה נכון
    let rafId: number | null = null;
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      const y = parseInt(saved, 10);
      if (!Number.isNaN(y) && y > 0) {
        rafId = requestAnimationFrame(() => {
          rafId = null;
          window.scrollTo(0, y);
        });
      }
    }

    // עוקב אחרי המיקום העדכני במשתנה בתוך הסגירה, כדי שלא נקרא את window.scrollY
    // אחרי שה-DOM של עמוד היעד כבר נטען (והגובה התקצר ל-0 בזמן Suspense fallback)
    let latestY = window.scrollY;
    let timerId: number | null = null;
    const commit = () => {
      sessionStorage.setItem(STORAGE_KEY, String(latestY));
    };
    const onScroll = () => {
      latestY = window.scrollY;
      if (timerId !== null) return;
      timerId = window.setTimeout(() => {
        commit();
        timerId = null;
      }, 150);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (timerId !== null) {
        window.clearTimeout(timerId);
        timerId = null;
      }
      // כותב את המיקום האחרון שנצפה בזמן שה-hook היה פעיל — לא את scrollY הנוכחי
      commit();
    };
  }, []);
}
