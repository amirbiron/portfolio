/**
 * חלון "תהליך העבודה" בדף הבית. לחיצה בכל מקום בכרטיס מכווצת אותו לרשת של שש הכותרות עם צ'קבוקסים,
 * ולחיצה נוספת מרחיבה אותו בחזרה, והשלבים רצים שוב מההתחלה (WorkflowSteps נטען מחדש).
 * מבוסס על שני רכיבים מ-finesse:
 * - expand-card: הגובה משתנה עם עקומת הקפיצה שלו, cubic-bezier(.2, 1.3, .3, 1) בחצי שנייה,
 *   והפריטים נכנסים בזה אחר זה (תזוזה של 8px ושקיפות, 60ms בין פריט לפריט).
 * - checkbox-list: צ'קבוקס מלא שה-V שלו מצטייר. בלי הקו שחוצה את התווית: שלב מחוק נקרא כמו "בוטל".
 * מה שמתחת לכרטיס (טופס יצירת הקשר) עולה ויורד יחד עם הגובה, כי הכרטיס הוא חלק מזרימת העמוד.
 * אין כפתור כיווץ נפרד, בהחלטת בעל הפרויקט: הלחיצה על הכרטיס עצמו היא הדרך היחידה.
 */
import { useEffect, useRef, useState, type MouseEvent } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyTextButton } from "@/components/CopyTextButton";
import { WorkflowSteps } from "@/components/WorkflowSteps";
import { workflowAsText, workflowSteps } from "@/lib/workflow";

/** עקומת הקפיצה של expand-card. framer-motion לא חותך ערכים מעל 1, ולכן יש קפיצה קטנה מעבר ליעד.
 *  מקור: cubicBezier ב-node_modules/motion-utils/dist/es/easing/cubic-bezier.mjs */
const SPRING_EASE = [0.2, 1.3, 0.3, 1] as const;

export function WorkflowCard() {
  const [collapsed, setCollapsed] = useState(false);
  const reduceMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  // גובה המיכל של התוכן. מהמדידה הראשונה הוא מספר מפורש, ולא auto: כשהתוכן מתחלף (מלא ↔ מכווץ), המיכל
  // נשאר בגובה הקודם ומונפש ממנו לגובה החדש. עם auto המיכל היה מתכווץ לבד, מיד, עוד לפני שהאנימציה מתחילה
  // (נמדד: בלי הנעילה הכיווץ קפץ מ-760 ל-176 פיקסלים בפריים אחד, וההרחבה כן הונפשה).
  const height = useMotionValue(0);
  const [heightLocked, setHeightLocked] = useState(false);
  const lockedRef = useRef(false);

  // מודד את התוכן בכל שינוי גודל: מעבר בין מלא למכווץ, וגם סיבוב מסך או שינוי רוחב חלון.
  // המדידה הראשונה (ומצב של פחות תנועה) קובעת את הגובה מיד; השאר מונפשות בעקומה של expand-card.
  // animate(MotionValue<number>, יעד, אפשרויות) ו-stop() על מה שהוא מחזיר: index.d.ts של framer-motion 12.23.22
  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    let controls: ReturnType<typeof animate> | undefined;
    const observer = new ResizeObserver(() => {
      const target = content.offsetHeight;
      controls?.stop();
      if (!lockedRef.current || reduceMotion) {
        height.set(target);
        lockedRef.current = true;
        setHeightLocked(true);
        return;
      }
      controls = animate(height, target, { duration: 0.5, ease: SPRING_EASE });
    });
    observer.observe(content);
    return () => {
      observer.disconnect();
      controls?.stop();
    };
  }, [height, reduceMotion]);

  const toggle = (event: MouseEvent<HTMLDivElement>) => {
    // כפתורים וקישורים בתוך הכרטיס (Contact Me, העתק) עושים את שלהם, ולא מכווצים אותו
    if (event.target instanceof Element && event.target.closest("button, a"))
      return;
    // לחיצה שמסיימת סימון טקסט (כדי להעתיק) היא לא בקשה לכווץ
    if (window.getSelection()?.toString()) return;
    // כיווץ אחרי גלילה לתחתית הכרטיס היה משאיר את הכרטיס הקטן מעל המסך: מחזירים את ראש הכרטיס למסך.
    // ראש הכרטיס לא זז כשהגובה משתנה (רק התחתית זזה), ולכן הגלילה מדויקת גם בזמן האנימציה
    const card = cardRef.current;
    if (!collapsed && card && card.getBoundingClientRect().top < 0) {
      card.scrollIntoView({
        block: "start",
        behavior: reduceMotion ? "auto" : "smooth",
      });
    }
    setCollapsed(c => !c);
  };

  return (
    <div
      ref={cardRef}
      className="terminal-window cursor-pointer"
      onClick={toggle}
    >
      <div className="terminal-header">
        <div className="terminal-dot border-primary" />
        <div className="terminal-dot border-accent" />
        <div className="terminal-dot border-destructive" />
        <span className="text-sm text-muted-foreground ml-2">workflow.log</span>
        <div className="ml-auto">
          <CopyTextButton
            text={workflowAsText()}
            label="העתק"
            title="העתק את תהליך העבודה ללוח"
            compact
          />
        </div>
      </div>

      <motion.div
        className="overflow-hidden"
        style={heightLocked ? { height } : undefined}
      >
        <div ref={contentRef} className="p-8">
          {collapsed ? (
            <CollapsedSteps reduceMotion={reduceMotion} />
          ) : (
            <>
              <WorkflowSteps steps={workflowSteps} />
              {/* אותו כפתור כמו Contact Me ב-Hero: גולל לטופס שמתחת. המיכל משמאל לימין, ולכן הכפתור
                  בצד שמאל של החלון, כמו כפתורי ה-Hero */}
              <div dir="ltr" className="mt-8">
                <Button
                  variant="outline"
                  className="border-accent text-accent hover:bg-accent/10 transition-all hover:scale-105"
                  onClick={() =>
                    document
                      .getElementById("contact")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Me
                </Button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/** המצב המכווץ: שש הכותרות ברשת, שלוש בשורה (שתיים בנייד), כל אחת עם צ'קבוקס מסומן */
function CollapsedSteps({ reduceMotion }: { reduceMotion: boolean | null }) {
  return (
    <ul dir="rtl" className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
      {workflowSteps.map((step, i) => (
        <motion.li
          key={step.title}
          className="flex items-center gap-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.06, ease: SPRING_EASE }}
        >
          <span
            aria-hidden="true"
            className="grid h-5 w-5 shrink-0 place-items-center rounded-md border border-primary bg-primary text-primary-foreground"
          >
            <svg
              className="h-[11px] w-[11px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path
                d="m4 12.5 5 5L20 6.5"
                strokeDasharray="24"
                style={
                  reduceMotion
                    ? undefined
                    : {
                        animation: `workflow-check-draw 0.3s ease-out ${0.15 + i * 0.06}s both`,
                      }
                }
              />
            </svg>
          </span>
          <span className="font-bold text-foreground/90">{step.title}</span>
        </motion.li>
      ))}
    </ul>
  );
}
