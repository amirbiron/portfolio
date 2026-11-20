/**
 * פס "החלק לפירוט" בתחתית הכרטיס המכווץ של תהליך העבודה: גוררים את הידית מימין לשמאל, וכשהיא עוברת 85%
 * מהדרך, הכרטיס מתרחב. שחרור מוקדם מחזיר את הידית לתחילת הפס בקפיצה. Enter או רווח על הידית עושים את
 * אותו דבר, ולכן אפשר להרחיב את הכרטיס גם מהמקלדת.
 * מבוסס על slide-confirm מ-finesse, עם השינויים האלה:
 * - בסוף הגרירה קוראים ל-onConfirm (אחרי 280ms, כדי שהידית תגיע לסוף וה-V יופיע), במקום להציג "אושר!".
 * - הצבעים של האתר (primary), והברק מוגדר ב-index.css (.slide-to-expand-shine).
 * - אורך הדרך נמדד ברגע תחילת הגרירה, ולא בזמן הרינדור (ברכיב המקורי הוא נמדד מ-ref לפני שה-ref קיים).
 * - בהפחתת תנועה אין ברק, והידית חוזרת ומגיעה לסוף בלי אנימציה.
 * - data-no-card-toggle: גרירה או לחיצה על הפס לא מגיעות ללחיצה של הכרטיס עצמו (ראו WorkflowCard).
 * - הידית היא כפתור ולא role="slider": היא מבצעת פעולה אחת (הרחבה), ואין לה ערך שמשנים. slider מבטיח לקורא
 *   המסך ערך (aria-valuenow, aria-valuemin, aria-valuemax) וחצים שמזיזים אותו צעד אחרי צעד, ואין כאן אף אחד מהם.
 *   מקור: תבנית Slider ב-APG, https://www.w3.org/WAI/ARIA/apg/patterns/slider/
 *   אין לה onClick: הקשה בלי גרירה לא מרחיבה, כמו ברכיב המקורי. Enter ורווח מטופלים ב-onKeyDown.
 */
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/** גודל הידית (h-12 w-12) והמרווח שלה מקצה הפס (right-1 top-1), בפיקסלים */
const KNOB = 48;
const INSET = 4;
/** עקומת הקפיצה של הידית, כמו ברכיב המקורי */
const SPRING = "cubic-bezier(.2,1.5,.3,1)";

export function SlideToExpand({
  label,
  onConfirm,
  className,
}: {
  label: string;
  onConfirm: () => void;
  className?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const maxRef = useRef(0);
  const [x, setX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [done, setDone] = useState(false);
  const reduceMotion = useReducedMotion();

  // onConfirm מגיע כפונקציה חדשה בכל רינדור של ההורה: נשמר ב-ref, כדי שהטיימר לא יתאפס בכל רינדור
  const onConfirmRef = useRef(onConfirm);
  onConfirmRef.current = onConfirm;
  useEffect(() => {
    if (!done) return;
    const timer = setTimeout(
      () => onConfirmRef.current(),
      reduceMotion ? 0 : 280
    );
    return () => clearTimeout(timer);
  }, [done, reduceMotion]);

  // הדרך שהידית יכולה לעבור: רוחב הפס פחות הידית והמרווחים משני הצדדים
  const measureMax = () =>
    Math.max(0, (trackRef.current?.clientWidth ?? 0) - KNOB - INSET * 2);

  const confirm = () => {
    maxRef.current = measureMax();
    setX(maxRef.current);
    setDone(true);
  };

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging || done || !trackRef.current) return;
    // כמה הידית זזה שמאלה מנקודת ההתחלה שלה בצד ימין, כשמרכז הידית נמצא מתחת לאצבע
    const right = trackRef.current.getBoundingClientRect().right;
    setX(
      Math.max(
        0,
        Math.min(maxRef.current, right - e.clientX - INSET - KNOB / 2)
      )
    );
  };

  const end = () => {
    if (!dragging) return;
    setDragging(false);
    if (x > maxRef.current * 0.85) confirm();
    else setX(0);
  };

  return (
    <div
      ref={trackRef}
      dir="rtl"
      data-no-card-toggle
      onPointerMove={onMove}
      onPointerUp={end}
      onPointerCancel={end}
      onPointerLeave={end}
      className={cn(
        "relative h-14 w-full max-w-xs touch-none select-none overflow-hidden rounded-full border transition-colors",
        done ? "border-primary bg-primary/15" : "border-border bg-muted/40",
        className
      )}
    >
      {/* הכיתוב הגלוי. מוסתר מקורא המסך, כי אותו שם כבר נמצא על הידית, ואחרת הוא היה מוקרא פעמיים */}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 grid place-items-center text-xs font-semibold transition-opacity",
          done ? "text-primary" : "text-muted-foreground"
        )}
        style={{ opacity: dragging ? 0.3 : 1 }}
      >
        {label}
      </span>
      {!done && !reduceMotion && (
        <span
          aria-hidden="true"
          className="slide-to-expand-shine pointer-events-none absolute inset-0"
        />
      )}
      <button
        type="button"
        aria-label={label}
        onPointerDown={e => {
          if (done) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          maxRef.current = measureMax();
          setDragging(true);
        }}
        onKeyDown={e => {
          if (!done && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            confirm();
          }
        }}
        className="absolute right-1 top-1 grid h-12 w-12 cursor-grab place-items-center rounded-full bg-primary text-primary-foreground shadow-lg active:cursor-grabbing"
        style={{
          transform: `translateX(${-x}px)`,
          transition:
            dragging || reduceMotion ? "none" : `transform .5s ${SPRING}`,
        }}
      >
        {done ? (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          >
            <path d="m4 12.5 5 5L20 6.5" />
          </svg>
        ) : (
          // חץ שמאלה: בכיוון הגרירה, מימין לשמאל
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          >
            <path d="m14 6-6 6 6 6" />
          </svg>
        )}
      </button>
    </div>
  );
}
