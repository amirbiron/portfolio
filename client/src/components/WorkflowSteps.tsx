/**
 * שלבי תהליך העבודה כיומן של תהליך שרץ: השלב הנוכחי מסתובב, ואז הופך ל-V מצויר בזמן שהשלב הבא מתחיל.
 * מבוסס על הרכיב agent-steps מ-finesse, עם השינויים האלה:
 * 1. הריצה מתחילה כשהרשימה נכנסת למסך (useInView, פעם אחת), ולא בלחיצה על כפתור "הרצה".
 * 2. הצבעים של האתר: accent לשלב שרץ, primary לשלב שהסתיים. הטקסט קריא גם לפני שהשלב הגיע אליו,
 *    כי האנימציה מסמנת התקדמות ולא מסתירה תוכן.
 * 3. ה-V באמת מצויר (keyframes workflow-check-draw ב-index.css). מי שביקש פחות תנועה (prefers-reduced-motion)
 *    רואה את כל השלבים גמורים מיד, בלי ספינר ובלי ציור.
 * 4. לפני כל שלב מספר בסגנון יומן, [1/6], בכיוון משמאל לימין, כדי שהסוגריים והלוכסן לא יתהפכו בתוך שורה עברית.
 */
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { WorkflowStep } from "@/lib/workflow";

/** הזמן שכל שלב "רץ" לפני שהוא מסתיים, כמו ברכיב המקורי */
const STEP_MS = 1100;

export function WorkflowSteps({
  steps,
  className,
}: {
  steps: WorkflowStep[];
  className?: string;
}) {
  const listRef = useRef<HTMLOListElement>(null);
  const inView = useInView(listRef, { once: true, margin: "-80px" });
  const reduceMotion = useReducedMotion();
  // השלב שרץ עכשיו: -1 לפני שהרשימה נראתה, steps.length כשכל השלבים הסתיימו
  const [current, setCurrent] = useState(-1);

  useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      setCurrent(steps.length);
      return;
    }
    setCurrent(c => (c === -1 ? 0 : c));
  }, [inView, reduceMotion, steps.length]);

  useEffect(() => {
    if (current < 0 || current >= steps.length) return;
    const timer = setTimeout(() => setCurrent(current + 1), STEP_MS);
    return () => clearTimeout(timer);
  }, [current, steps.length]);

  return (
    <ol ref={listRef} dir="rtl" className={cn("space-y-5", className)}>
      {steps.map((step, i) => {
        const state = i < current ? "done" : i === current ? "run" : "wait";
        return (
          <li key={i} className="flex items-start gap-3">
            {/* המחוון רק מראה את ההתקדמות, ולכן מוסתר מקוראי מסך: המספר והטקסט נמצאים בשורה עצמה */}
            <span
              aria-hidden="true"
              className={cn(
                "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-colors duration-300",
                state === "wait" && "border-border",
                state === "run" && "border-accent text-accent",
                state === "done" && "border-primary bg-primary/15 text-primary"
              )}
            >
              {state === "run" && (
                <svg
                  className="h-3 w-3 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                >
                  <path d="M21 12a9 9 0 1 1-9-9" />
                </svg>
              )}
              {state === "done" && (
                <svg
                  className="h-[11px] w-[11px]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                >
                  <path
                    d="m4 12.5 5 5L20 6.5"
                    strokeDasharray="24"
                    style={
                      reduceMotion
                        ? undefined
                        : {
                            animation:
                              "workflow-check-draw 0.35s ease-out both",
                          }
                    }
                  />
                </svg>
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "leading-relaxed transition-colors duration-300",
                  state === "wait"
                    ? "text-muted-foreground"
                    : "text-foreground/90"
                )}
              >
                {/* הרווח בצד שמאל במפורש (ml-2): התגית היא dir="ltr", ולכן me-2 היה יוצא בצד ימין שלה,
                    לכיוון שולי השורה, ולא לכיוון הטקסט העברי שממשיך משמאל לה */}
                <span
                  dir="ltr"
                  className={cn(
                    "ml-2 font-mono text-sm transition-colors duration-300",
                    state === "wait" && "text-muted-foreground",
                    state === "run" && "text-accent",
                    state === "done" && "text-primary"
                  )}
                >
                  [{i + 1}/{steps.length}]
                </span>
                {step.text}
              </p>
              {step.note && (
                // אותו מראה כמו ציטוט בבלוג (.prose blockquote ב-blog-styles.css): קו בצבע primary בצד שממנו
                // קוראים, ריווח פנימי, טקסט עמום ונטוי
                <blockquote className="mt-3 border-s-4 border-primary ps-4 text-sm italic text-muted-foreground">
                  {step.note}
                </blockquote>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
