/**
 * חלון "תהליך העבודה" בדף הבית. לחיצה בכל מקום בכרטיס מכווצת אותו לרשימה ממוספרת של שש הכותרות בשני טורים,
 * ולחיצה נוספת, או גרירה של הפס "החלק לפירוט" שבתחתית הכרטיס המכווץ, מרחיבה אותו בחזרה, והשלבים רצים שוב
 * מההתחלה (WorkflowSteps נטען מחדש).
 * מבוסס על רכיבים מ-finesse:
 * - expand-card: הגובה משתנה עם עקומת הקפיצה שלו, cubic-bezier(.2, 1.3, .3, 1) בחצי שנייה.
 * - spring-dropdown: הכותרות נכנסות אחת אחרי השנייה מלמעלה, עם קפיצה (ראו CollapsedSteps).
 * - slide-confirm: הפס "החלק לפירוט" (SlideToExpand), שמראה שאפשר להרחיב את הכרטיס בחזרה.
 * מה שמתחת לכרטיס (טופס יצירת הקשר) עולה ויורד יחד עם הגובה, כי הכרטיס הוא חלק מזרימת העמוד.
 * אין כפתור כיווץ נפרד, בהחלטת בעל הפרויקט: הלחיצה על הכרטיס עצמו מכווצת אותו.
 * מהמקלדת אין דרך לכווץ, גם זה בהחלטת בעל הפרויקט: הכיווץ לא מוסיף מידע, והמצב המורחב (ההתחלתי) מציג הכל,
 * כך שכפתור שקיים רק כדי לכווץ מיותר. ההרחבה כן נגישה מהמקלדת: Enter או רווח על הידית של "החלק לפירוט".
 * הכרטיס עצמו לא הופך לכפתור (role="button"): לכפתור יש Children Presentational: True, והדפדפן לא אמור
 * לחשוף לקורא מסך את מה שבתוכו, כך ש"העתק", Contact Me והידית היו נעלמים לו.
 * מקור: WAI-ARIA 1.2, טבלת התכונות של button וסעיף 5.2.9, https://www.w3.org/TR/wai-aria-1.2/#button
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
import { SlideToExpand } from "@/components/SlideToExpand";
import { WorkflowSteps } from "@/components/WorkflowSteps";
import { workflowAsText, workflowSteps } from "@/lib/workflow";

/** עקומת הקפיצה של expand-card. framer-motion לא חותך ערכים מעל 1, ולכן יש קפיצה קטנה מעבר ליעד.
 *  מקור: cubicBezier ב-node_modules/motion-utils/dist/es/easing/cubic-bezier.mjs */
const SPRING_EASE = [0.2, 1.3, 0.3, 1] as const;

/** עקומת הקפיצה של spring-dropdown, לכניסת הכותרות בכרטיס המכווץ */
const DROPDOWN_EASE = [0.2, 1.5, 0.3, 1] as const;

/**
 * הרוחב המקסימלי של הכרטיס המכווץ: בערך הרוחב של הכרטיס בנייד (358px ברוחב 390), שבעל הפרויקט אישר.
 * במסך רחב הכרטיס המכווץ מצטמצם לרוחב הזה ועומד במרכז, ובנייד הוא ממילא צר יותר, ולכן לא משתנה.
 */
const COLLAPSED_MAX_WIDTH = "22.5rem";
/** משך השינוי ברוחב, באותה עקומה כמו הגובה */
const WIDTH_MS = 500;

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
  // רוחב הכרטיס: צר כשהוא מכווץ. נפרד מ-collapsed, כי בהרחבה הרוחב משתנה קודם, ורק אחריו התוכן (ראו expand)
  const [narrow, setNarrow] = useState(false);
  const expandTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  useEffect(() => () => clearTimeout(expandTimer.current), []);

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

  // כיווץ: התוכן מתחלף לרשימה הקצרה, והגובה והרוחב קטנים יחד. הרשימה לא תלויה ברוחב, ולכן הגובה שלה לא זז בדרך.
  // כיווץ אחרי גלילה לתחתית הכרטיס היה משאיר את הכרטיס הקטן מעל המסך: מחזירים את ראש הכרטיס למסך.
  // ראש הכרטיס לא זז כשהגובה משתנה (רק התחתית זזה), ולכן הגלילה מדויקת גם בזמן האנימציה
  const collapse = () => {
    const card = cardRef.current;
    if (card && card.getBoundingClientRect().top < 0) {
      card.scrollIntoView({
        block: "start",
        behavior: reduceMotion ? "auto" : "smooth",
      });
    }
    setCollapsed(true);
    setNarrow(true);
  };

  // הרחבה בשני שלבים: קודם הכרטיס חוזר לרוחב המלא, ורק אחר כך השלבים נכנסים והגובה גדל. אם שניהם היו קורים יחד,
  // הטקסט של השלבים היה נשבר מחדש לאורך כל שינוי הרוחב, והגובה היה רודף אחרי יעד שזז.
  // כשהרוחב ממילא לא משתנה (נייד, שבו הכרטיס צר מ-COLLAPSED_MAX_WIDTH) או בהפחתת תנועה, אין למה לחכות
  const expand = () => {
    setNarrow(false);
    const card = cardRef.current;
    const widthWillChange =
      !!card?.parentElement &&
      card.parentElement.clientWidth > card.offsetWidth + 1;
    clearTimeout(expandTimer.current);
    if (reduceMotion || !widthWillChange) {
      setCollapsed(false);
      return;
    }
    expandTimer.current = setTimeout(() => setCollapsed(false), WIDTH_MS);
  };

  const toggle = (event: MouseEvent<HTMLDivElement>) => {
    // כפתורים וקישורים בתוך הכרטיס (Contact Me, העתק) והפס "החלק לפירוט" עושים את שלהם, ולא מכווצים
    // או מרחיבים את הכרטיס: גרירה של הפס מסתיימת בלחיצה, שאחרת הייתה מגיעה גם לכרטיס
    if (
      event.target instanceof Element &&
      event.target.closest("button, a, [data-no-card-toggle]")
    )
      return;
    // לחיצה שמסיימת סימון טקסט (כדי להעתיק) היא לא בקשה לכווץ
    if (window.getSelection()?.toString()) return;
    if (collapsed) expand();
    else collapse();
  };

  return (
    <div
      ref={cardRef}
      className="terminal-window mx-auto cursor-pointer"
      onClick={toggle}
      style={{
        // מעבר בין 100% לרוחב קבוע: הדפדפן מנפיש בין אחוזים ל-rem (שניהם אורך)
        maxWidth: narrow ? COLLAPSED_MAX_WIDTH : "100%",
        transition: reduceMotion
          ? "none"
          : `max-width ${WIDTH_MS}ms cubic-bezier(.2, 1.3, .3, 1)`,
      }}
    >
      <div className="terminal-header">
        <div className="terminal-dot border-primary" />
        <div className="terminal-dot border-accent" />
        <div className="terminal-dot border-destructive" />
        <span className="text-sm text-muted-foreground ml-2">workflow.log</span>
        {/* בכרטיס המכווץ אין מה להעתיק, ולכן גם אין כפתור */}
        {!collapsed && (
          <div className="ml-auto">
            <CopyTextButton
              text={workflowAsText()}
              label="העתק"
              title="העתק את תהליך העבודה ללוח"
              compact
            />
          </div>
        )}
      </div>

      <motion.div
        className="overflow-hidden"
        style={heightLocked ? { height } : undefined}
      >
        <div ref={contentRef} className="p-8">
          {collapsed ? (
            <>
              <CollapsedSteps />
              <div className="mt-8 flex justify-center">
                <SlideToExpand label="החלק לפירוט" onConfirm={expand} />
              </div>
            </>
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

/**
 * המצב המכווץ: רשימה ממוספרת של הכותרות בשני טורים, 1–3 בטור הימני ו-4–6 בטור השמאלי
 * (grid-flow-col עם שלוש שורות ממלא טור אחרי טור, וב-dir="rtl" הטור הראשון הוא הימני).
 * הכניסה לפי spring-dropdown: כל כותרת יורדת 14px וגדלה מ-0.92, בחצי שנייה עם קפיצה, והשקיפות ב-0.25 שנייה.
 * ההשהיה, 55ms בין כותרת לכותרת, לפי סדר המספרים: הטור הימני יורד מלמעלה למטה, ואחריו השמאלי.
 * המספר והכותרת באותה שורת טקסט (ולא כפריטי flex נפרדים), כדי שהנקודה תופיע בין המספר לכותרת כמו ברשימה עברית.
 * פרמטר transition עם default וערך נפרד ל-opacity: TransitionWithValueOverrides ב-motion-dom (framer-motion 12.23.22).
 */
function CollapsedSteps() {
  return (
    <ol
      dir="rtl"
      className="grid grid-flow-col grid-cols-2 grid-rows-3 gap-x-8 gap-y-3"
    >
      {workflowSteps.map((step, i) => (
        <motion.li
          key={step.title}
          initial={{ opacity: 0, y: -14, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            default: { duration: 0.5, ease: DROPDOWN_EASE, delay: i * 0.055 },
            opacity: { duration: 0.25, delay: i * 0.055 },
          }}
        >
          <span className="font-mono text-primary">{i + 1}.</span>{" "}
          <span className="font-bold text-foreground/90">{step.title}</span>
        </motion.li>
      ))}
    </ol>
  );
}
